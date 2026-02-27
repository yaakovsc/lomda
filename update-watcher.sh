#!/usr/bin/env bash
# =============================================================
# Giron Security Training — Update Watcher
# Runs every minute via cron. Handles update and revert triggers.
# =============================================================
set -euo pipefail

PROJECT_DIR="/opt/giron-security"
TRIGGERS_DIR="${PROJECT_DIR}/triggers"
BACKUPS_DIR="${PROJECT_DIR}/backups"
LOG_FILE="${PROJECT_DIR}/logs/update-watcher.log"

TRIGGER_FILE="${TRIGGERS_DIR}/update.json"
REVERT_FILE="${TRIGGERS_DIR}/revert.json"
RESULT_FILE="${TRIGGERS_DIR}/update-result.json"
BACKUP_META="${TRIGGERS_DIR}/last-backup.json"

HEALTH_URL="http://localhost/api/health"

log() { echo "[$(date -u '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

mkdir -p "$TRIGGERS_DIR" "$BACKUPS_DIR" "${PROJECT_DIR}/logs"

# ─── Helper: Health Check ────────────────────────────────────────────────────
wait_for_healthy() {
  log "Waiting for system health (max 120s)..."
  for i in $(seq 1 12); do
    sleep 10
    STATUS=$(curl -sf "$HEALTH_URL" 2>/dev/null | grep -o '"status":"ok"' || true)
    if [ -n "$STATUS" ]; then
      log "System healthy after $((i * 10))s"
      return 0
    fi
    log "  Health check $i/12 failed, retrying..."
  done
  return 1
}

# ─── Helper: DB Backup ───────────────────────────────────────────────────────
backup_database() {
  local STAMP="$1"
  local BACKUP_FILE="${BACKUPS_DIR}/pre-update-${STAMP}.sql.gz"
  log "Backing up database to ${BACKUP_FILE}..."
  docker exec giron_postgres pg_dump -U giron_user giron_security \
    | gzip > "$BACKUP_FILE" \
    && log "Database backup complete: $BACKUP_FILE" \
    || { log "WARNING: Database backup failed"; return 1; }
}

# ─── Helper: Semver Compare ──────────────────────────────────────────────────
# Returns 0 if a >= b (no upgrade needed), 1 if a < b (upgrade needed)
semver_lt() {
  local a="$1" b="$2"
  # Remove leading 'v'
  a="${a#v}"; b="${b#v}"
  local IFS='.'
  read -ra A <<< "$a"; read -ra B <<< "$b"
  for i in 0 1 2; do
    local av="${A[$i]:-0}" bv="${B[$i]:-0}"
    if [ "$av" -lt "$bv" ]; then return 0; fi
    if [ "$av" -gt "$bv" ]; then return 1; fi
  done
  return 1 # equal
}

# ─── REVERT Handler ──────────────────────────────────────────────────────────
handle_revert() {
  log "=== REVERT TRIGGERED ==="
  BACKUP_TAG=$(python3 -c "import json,sys; d=json.load(open('$REVERT_FILE')); print(d['backupTag'])" 2>/dev/null || jq -r '.backupTag' "$REVERT_FILE")
  rm -f "$REVERT_FILE"

  cd "$PROJECT_DIR"
  log "Reverting to git tag: $BACKUP_TAG"
  git checkout "$BACKUP_TAG" -- .

  # Restore database from latest pre-update backup
  LATEST_BACKUP=$(ls -t "${BACKUPS_DIR}"/pre-update-*.sql.gz 2>/dev/null | head -1 || true)
  if [ -n "$LATEST_BACKUP" ]; then
    log "Restoring database from $LATEST_BACKUP"
    docker exec giron_postgres psql -U giron_user -d postgres -c "DROP DATABASE IF EXISTS giron_security;" || true
    docker exec giron_postgres psql -U giron_user -d postgres -c "CREATE DATABASE giron_security;" || true
    gunzip -c "$LATEST_BACKUP" | docker exec -i giron_postgres psql -U giron_user giron_security
    log "Database restored"
  else
    log "WARNING: No database backup found for restore"
  fi

  log "Rebuilding containers after revert..."
  docker compose up -d --build

  if wait_for_healthy; then
    log "Revert successful"
    echo '{"status":"REVERTED","timestamp":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' > "$RESULT_FILE"
  else
    log "ERROR: System not healthy after revert"
    echo '{"status":"REVERTED_UNHEALTHY","timestamp":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' > "$RESULT_FILE"
  fi
}

# ─── UPDATE Handler ──────────────────────────────────────────────────────────
handle_update() {
  log "=== UPDATE TRIGGERED ==="
  STAMP=$(date +%Y%m%d-%H%M%S)
  rm -f "$TRIGGER_FILE"

  cd "$PROJECT_DIR"

  # 1. Create git backup tag
  BACKUP_TAG="backup-${STAMP}"
  git tag "$BACKUP_TAG" 2>/dev/null && log "Git backup tag created: $BACKUP_TAG" || log "WARNING: Could not create git backup tag"

  # 2. Backup database
  backup_database "$STAMP" || log "Proceeding without full database backup"

  # 3. Write backup metadata
  echo "{\"tag\":\"${BACKUP_TAG}\",\"date\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"stamp\":\"${STAMP}\"}" > "$BACKUP_META"

  # 4. Get current and target versions
  CURRENT_VERSION=$(python3 -c "import json; print(json.load(open('version.json'))['version'])" 2>/dev/null \
    || node -e "console.log(require('./version.json').version)" 2>/dev/null \
    || echo "1.0.0")
  log "Current version: $CURRENT_VERSION"

  # 5. Determine if cumulative upgrade needed
  TARGET_JSON=$(curl -sf "https://raw.githubusercontent.com/yaakovsc/lomda/main/version.json" 2>/dev/null || echo "{}")
  TARGET_VERSION=$(echo "$TARGET_JSON" | grep -o '"version":"[^"]*"' | cut -d'"' -f4 || echo "$CURRENT_VERSION")
  MIN_FROM=$(echo "$TARGET_JSON" | grep -o '"minFromVersion":"[^"]*"' | cut -d'"' -f4 || echo "1.0.0")

  log "Target version: $TARGET_VERSION, minFromVersion: $MIN_FROM"

  if semver_lt "$CURRENT_VERSION" "$MIN_FROM" 2>/dev/null; then
    log "Cumulative upgrade needed — applying intermediate tags"
    # Get sorted version tags between current and target
    TAGS=$(git tag --sort=version:refname | grep '^v' | while read tag; do
      VER="${tag#v}"
      if semver_lt "$CURRENT_VERSION" "$VER" 2>/dev/null && ! semver_lt "$TARGET_VERSION" "$VER" 2>/dev/null; then
        echo "$tag"
      fi
    done)
    for TAG in $TAGS; do
      log "Applying intermediate: $TAG"
      git checkout "$TAG" -- .
      docker compose up -d --build
      sleep 30
    done
  fi

  # 6. Pull latest code
  log "Pulling latest code from GitHub..."
  git fetch origin main
  git checkout origin/main -- .
  log "Code updated"

  # 7. Rebuild containers
  log "Rebuilding Docker containers..."
  docker compose up -d --build
  log "Containers rebuilt"

  # 8. Health verification
  if wait_for_healthy; then
    log "Update successful! Version $CURRENT_VERSION → $TARGET_VERSION"
    echo '{"status":"OK","fromVersion":"'"$CURRENT_VERSION"'","toVersion":"'"$TARGET_VERSION"'","timestamp":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' > "$RESULT_FILE"
    # Push backup tag to remote (best effort)
    git push origin "$BACKUP_TAG" 2>/dev/null || true
  else
    log "ERROR: Health check failed after update — initiating auto-revert"
    # Auto-revert
    git checkout "$BACKUP_TAG" -- . 2>/dev/null || git checkout "HEAD~1" -- . 2>/dev/null || true
    LATEST_BACKUP=$(ls -t "${BACKUPS_DIR}"/pre-update-*.sql.gz 2>/dev/null | head -1 || true)
    if [ -n "$LATEST_BACKUP" ]; then
      docker exec giron_postgres psql -U giron_user -d postgres -c "DROP DATABASE IF EXISTS giron_security;" 2>/dev/null || true
      docker exec giron_postgres psql -U giron_user -d postgres -c "CREATE DATABASE giron_security;" 2>/dev/null || true
      gunzip -c "$LATEST_BACKUP" | docker exec -i giron_postgres psql -U giron_user giron_security 2>/dev/null || true
    fi
    docker compose up -d --build
    sleep 30
    log "Auto-revert complete"
    echo '{"status":"REVERTED","reason":"health_check_failed","timestamp":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' > "$RESULT_FILE"
  fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────
if [ -f "$REVERT_FILE" ]; then
  handle_revert
  exit 0
fi

if [ -f "$TRIGGER_FILE" ]; then
  SCHEDULED_TIME=$(python3 -c "import json; d=json.load(open('$TRIGGER_FILE')); print(d.get('scheduledTime','0'))" 2>/dev/null || echo "0")
  NOW_MS=$(date +%s000)
  # scheduledTime is in ms; 0 or null means "run immediately"
  if [ "$SCHEDULED_TIME" = "null" ] || [ "$SCHEDULED_TIME" = "0" ] || [ "$NOW_MS" -ge "${SCHEDULED_TIME:-0}" ]; then
    handle_update
  fi
fi
