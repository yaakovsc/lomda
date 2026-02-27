const updateService = require('../services/updateService');
const logger = require('../config/logger');

const getStatus = async (req, res) => {
  try {
    const status = updateService.getStatus();
    res.json(status);
  } catch (err) {
    logger.error('getStatus error', { error: err.message });
    res.status(500).json({ error: 'שגיאה בקבלת סטטוס עדכון' });
  }
};

const checkNow = async (req, res) => {
  try {
    await updateService.checkGitHub();
    const status = updateService.getStatus();
    res.json(status);
  } catch (err) {
    logger.error('checkNow error', { error: err.message });
    res.status(500).json({ error: 'שגיאה בבדיקת עדכון' });
  }
};

const scheduleUpdate = async (req, res) => {
  try {
    const immediate = req.body?.immediate === true;

    if (immediate) {
      updateService.performUpdate(true);
      res.json({ scheduled: false, immediate: true, message: 'עדכון מתחיל עכשיו — המערכת תעבור למצב תחזוקה' });
    } else {
      updateService.scheduleTonightUpdate();
      const status = updateService.getStatus();
      res.json({ scheduled: true, immediate: false, scheduledAt: status.scheduledAt, message: 'עדכון מתוזמן לשעה 02:00 הלילה' });
    }
  } catch (err) {
    logger.error('scheduleUpdate error', { error: err.message });
    res.status(500).json({ error: 'שגיאה בתזמון עדכון' });
  }
};

const revert = async (req, res) => {
  try {
    updateService.performRevert();
    res.json({ message: 'שחזור לגרסה קודמת החל — המערכת תעבור למצב תחזוקה' });
  } catch (err) {
    logger.error('revert error', { error: err.message });
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getStatus, checkNow, scheduleUpdate, revert };
