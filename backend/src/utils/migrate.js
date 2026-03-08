/**
 * Idempotent schema migrations — runs on every server start.
 * Only adds; never drops or renames. Safe to run multiple times.
 */

const { sequelize } = require('../config/database');
const logger = require('../config/logger');

async function migrate() {
  const q = (sql) => sequelize.query(sql);

  // questions: is_custom column (added in v1.1)
  await q(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false`);

  // training_slides table (added in v1.1)
  await q(`
    CREATE TABLE IF NOT EXISTS training_slides (
      id INTEGER PRIMARY KEY,
      order_index INTEGER NOT NULL,
      title VARCHAR(200) NOT NULL,
      icon VARCHAR(10),
      color VARCHAR(20),
      content TEXT NOT NULL,
      key_points JSONB DEFAULT '[]',
      is_custom BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // company_settings table (added in v1.1)
  await q(`
    CREATE TABLE IF NOT EXISTS company_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await q(`
    INSERT INTO company_settings (key, value) VALUES
      ('company_name', 'גירון פיתוח ובניה בע"מ'),
      ('primary_color', '#1a3a6b'),
      ('logo_url', '/giron.png')
    ON CONFLICT (key) DO NOTHING
  `);

  // ── v1.2 Multi-module training ──────────────────────────────────

  // Allow exam_config to have one row per module (drop the single-row-only constraint)
  await q(`ALTER TABLE exam_config DROP CONSTRAINT IF EXISTS only_one_row`);

  // Set up a proper SERIAL sequence for exam_config.id so new rows get unique ids
  await q(`CREATE SEQUENCE IF NOT EXISTS exam_config_id_seq`);
  await q(`SELECT setval('exam_config_id_seq', COALESCE((SELECT MAX(id) FROM exam_config), 1), true)`);
  await q(`ALTER TABLE exam_config ALTER COLUMN id SET DEFAULT nextval('exam_config_id_seq')`);

  // Add training_type to training_slides (default 'cyber')
  await q(`ALTER TABLE training_slides ADD COLUMN IF NOT EXISTS training_type VARCHAR(20) NOT NULL DEFAULT 'cyber'`);

  // Add training_type to questions (default 'cyber')
  await q(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS training_type VARCHAR(20) NOT NULL DEFAULT 'cyber'`);

  // Add training_type to exam_config
  await q(`ALTER TABLE exam_config ADD COLUMN IF NOT EXISTS training_type VARCHAR(20) DEFAULT 'cyber'`);
  await q(`UPDATE exam_config SET training_type = 'cyber' WHERE training_type IS NULL`);

  // Unique index on training_type so findOrCreate can key on it (must come after column is added)
  await q(`CREATE UNIQUE INDEX IF NOT EXISTS exam_config_training_type_idx ON exam_config (training_type)`);

  // Add training_type to exam_attempts (default 'cyber')
  await q(`ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS training_type VARCHAR(20) NOT NULL DEFAULT 'cyber'`);

  // Create user_module_progress table
  await q(`
    CREATE TABLE IF NOT EXISTS user_module_progress (
      id                      SERIAL PRIMARY KEY,
      user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      training_type           VARCHAR(20) NOT NULL,
      training_started_at     TIMESTAMPTZ,
      training_completed_at   TIMESTAMPTZ,
      training_slide_progress INTEGER DEFAULT 0,
      exam_completed_at       TIMESTAMPTZ,
      exam_score              INTEGER,
      exam_passed             BOOLEAN,
      exam_attempts           INTEGER DEFAULT 0,
      exam_locked_by_admin    BOOLEAN DEFAULT FALSE,
      created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, training_type)
    )
  `);

  // Migrate existing cyber progress from users → user_module_progress
  await q(`
    INSERT INTO user_module_progress (
      user_id, training_type,
      training_started_at, training_completed_at, training_slide_progress,
      exam_completed_at, exam_score, exam_passed,
      exam_attempts, exam_locked_by_admin
    )
    SELECT
      id, 'cyber',
      training_started_at, training_completed_at, COALESCE(training_slide_progress, 0),
      exam_completed_at, exam_score, exam_passed,
      COALESCE(exam_attempts, 0), COALESCE(exam_locked_by_admin, FALSE)
    FROM users
    WHERE training_started_at IS NOT NULL
    ON CONFLICT (user_id, training_type) DO NOTHING
  `);

  // Add enabled flag to exam_config (per-module on/off switch)
  await q(`ALTER TABLE exam_config ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT TRUE`);

  logger.info('Database migrations applied');
}

module.exports = { migrate };
