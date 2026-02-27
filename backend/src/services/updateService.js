const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const logger = require('../config/logger');

// ─── Paths ────────────────────────────────────────────────────────────────────
const LOCAL_VERSION_PATH = path.join(__dirname, '../../../..', 'version.json');
const TRIGGERS_DIR = '/app/triggers';
const TRIGGER_FILE = path.join(TRIGGERS_DIR, 'update.json');
const REVERT_FILE = path.join(TRIGGERS_DIR, 'revert.json');
const RESULT_FILE = path.join(TRIGGERS_DIR, 'update-result.json');
const BACKUP_META_FILE = path.join(TRIGGERS_DIR, 'last-backup.json');

const GITHUB_VERSION_URL =
  'https://raw.githubusercontent.com/yaakovsc/lomda/main/version.json';

// ─── In-Memory State ──────────────────────────────────────────────────────────
let state = {
  updateAvailable: false,
  currentVersion: null,
  latestVersion: null,
  updateInfo: null,
  scheduledAt: null,
  maintenanceMode: false,
  lastUpdateResult: null, // 'OK' | 'REVERTED' | null
  lastChecked: null,
  activeUsers: new Map(), // userId → lastActivityMs
};

let pollInterval = null;
let scheduledCronJob = null;
let resultPollInterval = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function semverCompare(a, b) {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

function readLocalVersion() {
  try {
    const raw = fs.readFileSync(LOCAL_VERSION_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { version: '1.0.0' };
  }
}

function ensureTriggersDir() {
  try {
    if (!fs.existsSync(TRIGGERS_DIR)) {
      fs.mkdirSync(TRIGGERS_DIR, { recursive: true });
    }
  } catch (e) {
    logger.warn('Could not create triggers dir', { error: e.message });
  }
}

function readBackupInfo() {
  try {
    if (fs.existsSync(BACKUP_META_FILE)) {
      return JSON.parse(fs.readFileSync(BACKUP_META_FILE, 'utf8'));
    }
  } catch {}
  return null;
}

// ─── Core Functions ───────────────────────────────────────────────────────────
async function checkGitHub() {
  try {
    const res = await fetch(GITHUB_VERSION_URL, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const remote = await res.json();
    const local = readLocalVersion();

    state.currentVersion = local.version;
    state.latestVersion = remote.version;
    state.lastChecked = new Date().toISOString();

    if (semverCompare(remote.version, local.version) > 0) {
      state.updateAvailable = true;
      state.updateInfo = remote;
      logger.info('Update available', { from: local.version, to: remote.version, type: remote.type });
    } else {
      state.updateAvailable = false;
      state.updateInfo = null;
    }
  } catch (err) {
    logger.warn('Failed to check GitHub for updates', { error: err.message });
  }
}

function markUserActivity(userId) {
  state.activeUsers.set(userId, Date.now());
}

function getActiveUserCount() {
  const threshold = Date.now() - 3 * 60 * 1000; // 3 minutes (heartbeat fires every 2 min)
  let count = 0;
  for (const [, lastActivity] of state.activeUsers) {
    if (lastActivity > threshold) count++;
  }
  return count;
}

function performUpdate(immediate = false) {
  ensureTriggersDir();
  state.maintenanceMode = true;

  const triggerData = {
    scheduledTime: immediate ? Date.now() : null,
    requestedAt: new Date().toISOString(),
    targetVersion: state.latestVersion,
  };

  try {
    fs.writeFileSync(TRIGGER_FILE, JSON.stringify(triggerData, null, 2));
    logger.info('Update trigger written', triggerData);
  } catch (err) {
    logger.error('Failed to write update trigger', { error: err.message });
    state.maintenanceMode = false;
    throw err;
  }

  // Start polling for result
  startResultPolling();
}

function scheduleTonightUpdate() {
  if (scheduledCronJob) {
    scheduledCronJob.stop();
    scheduledCronJob = null;
  }

  const tonight2am = new Date();
  tonight2am.setHours(2, 0, 0, 0);
  if (tonight2am <= new Date()) {
    tonight2am.setDate(tonight2am.getDate() + 1);
  }
  state.scheduledAt = tonight2am.toISOString();

  // node-cron at 02:00 every day
  scheduledCronJob = cron.schedule('0 2 * * *', () => {
    logger.info('Scheduled update starting at 02:00');
    attemptUpdateWhenIdle();
    scheduledCronJob.stop();
    scheduledCronJob = null;
    state.scheduledAt = null;
  });

  logger.info('Update scheduled for 02:00 tonight', { scheduledAt: state.scheduledAt });
}

function attemptUpdateWhenIdle(maxRetries = 24) {
  const active = getActiveUserCount();
  if (active === 0 || maxRetries <= 0) {
    if (active > 0) {
      logger.warn('Proceeding with update despite active users (max retries reached)', { active });
    }
    performUpdate(true);
    return;
  }

  logger.info('Active users detected, delaying update 5 minutes', { active, retriesLeft: maxRetries });
  setTimeout(() => attemptUpdateWhenIdle(maxRetries - 1), 5 * 60 * 1000);
}

function startResultPolling() {
  if (resultPollInterval) clearInterval(resultPollInterval);

  resultPollInterval = setInterval(() => {
    try {
      if (!fs.existsSync(RESULT_FILE)) return;
      const raw = fs.readFileSync(RESULT_FILE, 'utf8').trim();
      const result = raw.startsWith('{') ? JSON.parse(raw).status : raw;

      state.maintenanceMode = false;
      state.lastUpdateResult = result.includes('OK') ? 'OK' : 'REVERTED';
      state.updateAvailable = false;

      fs.unlinkSync(RESULT_FILE);
      clearInterval(resultPollInterval);
      resultPollInterval = null;

      logger.info('Update result received', { result: state.lastUpdateResult });

      // Refresh version from disk
      const local = readLocalVersion();
      state.currentVersion = local.version;
    } catch (err) {
      logger.warn('Error polling update result', { error: err.message });
    }
  }, 10000);

  // Stop polling after 30 minutes regardless
  setTimeout(() => {
    if (resultPollInterval) {
      clearInterval(resultPollInterval);
      resultPollInterval = null;
      state.maintenanceMode = false;
      logger.warn('Update result polling timed out, clearing maintenance mode');
    }
  }, 30 * 60 * 1000);
}

function performRevert() {
  ensureTriggersDir();
  const backupInfo = readBackupInfo();
  if (!backupInfo) throw new Error('No backup available for revert');

  state.maintenanceMode = true;

  const revertData = { backupTag: backupInfo.tag, requestedAt: new Date().toISOString() };
  fs.writeFileSync(REVERT_FILE, JSON.stringify(revertData, null, 2));
  logger.info('Revert trigger written', revertData);

  startResultPolling();
}

function getStatus() {
  const local = readLocalVersion();
  return {
    updateAvailable: state.updateAvailable,
    currentVersion: state.currentVersion || local.version,
    latestVersion: state.latestVersion || local.version,
    updateInfo: state.updateInfo,
    scheduledAt: state.scheduledAt,
    maintenanceMode: state.maintenanceMode,
    lastUpdateResult: state.lastUpdateResult,
    lastChecked: state.lastChecked,
    activeUsers: getActiveUserCount(),
    backupInfo: readBackupInfo(),
  };
}

function startPolling() {
  const local = readLocalVersion();
  state.currentVersion = local.version;

  // Initial check
  checkGitHub().catch(() => {});

  // Poll every 30 minutes
  pollInterval = setInterval(() => checkGitHub().catch(() => {}), 30 * 60 * 1000);
  logger.info('Update service started', { currentVersion: state.currentVersion });
}

module.exports = {
  startPolling,
  checkGitHub,
  markUserActivity,
  getActiveUserCount,
  performUpdate,
  scheduleTonightUpdate,
  performRevert,
  getStatus,
  get maintenanceMode() { return state.maintenanceMode; },
};
