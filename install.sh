#!/usr/bin/env bash
# =============================================================
# מערכת הדרכת אבטחת מידע — גירון פיתוח ובניה בע"מ
# סקריפט התקנה אוטומטי
# שימוש: sudo bash install.sh
# =============================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()    { echo -e "${GREEN}[✓]${NC} $*"; }
warn()   { echo -e "${YELLOW}[!]${NC} $*"; }
error()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }
header() { echo -e "\n${BLUE}━━━ $* ━━━${NC}"; }

INSTALL_DIR="/opt/giron-security"

header "מערכת הדרכת אבטחת מידע — גירון"
echo "סקריפט זה יתקין את המערכת ב-${INSTALL_DIR}"
echo ""

# ── בדיקות מקדימות ─────────────────────────────────────────

header "בדיקות מקדימות"

[[ $EUID -eq 0 ]] || error "יש להריץ כ-root: sudo bash install.sh"
[[ -f "docker-compose.yml" ]] || error "יש להריץ את הסקריפט מתוך תיקיית הפרויקט"

# בדוק מערכת הפעלה
if command -v apt-get &>/dev/null; then
    PKG_MGR="apt"
elif command -v dnf &>/dev/null; then
    PKG_MGR="dnf"
else
    error "מערכת הפעלה לא נתמכת. נדרש Ubuntu/Debian/Rocky Linux."
fi
log "מערכת הפעלה: OK ($PKG_MGR)"

# ── התקנת תלויות ───────────────────────────────────────────

header "התקנת Docker ותלויות"

if command -v docker &>/dev/null; then
    log "Docker כבר מותקן: $(docker --version | cut -d' ' -f3 | tr -d ',')"
else
    warn "מתקין Docker..."
    if [[ "$PKG_MGR" == "apt" ]]; then
        apt-get update -q
        apt-get install -y -q docker.io docker-compose-v2 openssl curl git
    else
        dnf install -y -q docker docker-compose openssl curl git
        systemctl enable docker
    fi
    log "Docker הותקן"
fi

if ! systemctl is-active --quiet docker; then
    systemctl start docker
    log "Docker הופעל"
fi

# הוסף את המשתמש המקורי לקבוצת docker
if [[ -n "${SUDO_USER:-}" ]]; then
    usermod -aG docker "$SUDO_USER" 2>/dev/null || true
    log "המשתמש ${SUDO_USER} נוסף לקבוצת docker"
fi

# ── יצירת תיקיית התקנה ─────────────────────────────────────

header "הכנת תיקיות"

if [[ "$(pwd)" != "$INSTALL_DIR" ]]; then
    mkdir -p "$INSTALL_DIR"
    cp -r . "$INSTALL_DIR/"
    log "קבצים הועתקו ל-${INSTALL_DIR}"
    cd "$INSTALL_DIR"
else
    log "כבר בתיקיית ההתקנה"
fi

mkdir -p nginx/ssl logs backups
mkdir -p /opt/giron-security/triggers /opt/giron-security/backups /opt/giron-security/logs
log "תיקיות נוצרו"

# ── הגדרת .env ─────────────────────────────────────────────

header "הגדרת משתני סביבה"

if [[ -f ".env" ]]; then
    warn ".env קיים — לא מדרוס. בדוק ידנית אם הערכים מעודכנים."
else
    cp .env.example .env

    # יצור JWT_SECRET אוטומטי
    JWT_SECRET=$(openssl rand -hex 32)
    SESSION_SECRET=$(openssl rand -hex 32)
    DB_PASS=$(openssl rand -base64 20 | tr -dc 'A-Za-z0-9!@#$%' | head -c 20)

    sed -i "s|CHANGE_ME_RUN_openssl_rand_hex_32|${JWT_SECRET}|1" .env
    sed -i "s|CHANGE_ME_RUN_openssl_rand_hex_32|${SESSION_SECRET}|1" .env
    sed -i "s|CHANGE_ME_STRONG_DB_PASSWORD|${DB_PASS}|" .env

    log ".env נוצר עם מפתחות אקראיים"
    warn "פתח את .env ועדכן: ADMIN_PASSWORD, SMTP_PASS, FRONTEND_URL"
    echo ""
    echo -e "  ${YELLOW}nano ${INSTALL_DIR}/.env${NC}"
    echo ""
    read -r -p "לחץ Enter לאחר עדכון ה-.env להמשך ההתקנה..."
fi

# ── SSL ────────────────────────────────────────────────────

header "הגדרת SSL"

if [[ -f "nginx/ssl/cert.pem" && -f "nginx/ssl/key.pem" ]]; then
    log "תעודות SSL קיימות"
else
    warn "יוצר תעודה עצמית-חתומה (לרשת פנימית)..."
    bash nginx/generate-ssl.sh
    log "תעודת SSL נוצרה ב-nginx/ssl/"
    warn "לסביבת ייצור עם DNS ציבורי: החלף ב-Let's Encrypt או תעודת CA ארגונית"
fi

# ── הפעלת המערכת ───────────────────────────────────────────

header "בניה והפעלת המערכת"

log "מריץ docker compose build... (עשוי לקחת מספר דקות)"
docker compose build --quiet

log "מפעיל קונטיינרים..."
docker compose up -d

# המתן לעלות backend
log "ממתין שהמערכת תעלה..."
ATTEMPTS=0
until docker compose exec -T backend curl -sf http://localhost:3001/api/health &>/dev/null; do
    ATTEMPTS=$((ATTEMPTS+1))
    [[ $ATTEMPTS -gt 30 ]] && error "Backend לא עלה תוך 60 שניות. הרץ: docker compose logs backend"
    sleep 2
done

log "המערכת עלתה בהצלחה!"

# ── סיכום ──────────────────────────────────────────────────

header "התקנה הושלמה"

FRONTEND_URL=$(grep FRONTEND_URL .env | cut -d= -f2 | tr -d '"')

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   מערכת הדרכת אבטחה — גירון           ║${NC}"
echo -e "${GREEN}║   ההתקנה הושלמה בהצלחה!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "  🌐 כתובת המערכת:  ${BLUE}${FRONTEND_URL:-https://[SERVER-IP]}${NC}"
echo -e "  📁 תיקיית התקנה:  ${INSTALL_DIR}"
echo -e "  📋 לוגים:         docker compose logs -f"
echo -e "  📊 סטטוס:         docker compose ps"
echo ""
echo -e "${YELLOW}שלבים הבאים:${NC}"
echo "  1. פתח את המערכת בדפדפן"
echo "  2. כנס עם ADMIN_EMAIL + ADMIN_PASSWORD מה-.env"
echo "  3. שנה את סיסמת המנהל מיד!"
echo "  4. עבור ל'הגדרות בחינה' — סמן שאלות (מומלץ 20)"
echo "  5. הוסף עובדים מ'ניהול עובדים'"
echo ""
echo -e "${YELLOW}עדכון אוטומטי — הגדרת cron:${NC}"

# Install update-watcher cron (idempotent)
CRON_LINE="* * * * * ${INSTALL_DIR}/update-watcher.sh >> /opt/giron-security/logs/update-watcher.log 2>&1"
if ! crontab -l 2>/dev/null | grep -qF "update-watcher.sh"; then
    (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
    log "update-watcher.sh נוסף ל-crontab (כל דקה)"
else
    log "update-watcher cron כבר מוגדר"
fi

# Make scripts executable
chmod +x "${INSTALL_DIR}/update-watcher.sh" "${INSTALL_DIR}/release.sh" 2>/dev/null || true

echo ""
echo -e "${YELLOW}גיבוי אוטומטי — הוסף ל-crontab (crontab -e):${NC}"
echo "  0 3 * * * find /opt/giron-security/backups -name '*.sql.gz' -mtime +30 -delete"
echo ""
echo -e "  פיתוח ויישום: קובי שלזינגר — ליווי פרויקטים — 054-5664594"
echo ""
