#!/usr/bin/env bash
# =============================================================
# Giron Security Training — Release Script
# Usage: ./release.sh
# Analyzes changes, bumps version, updates version.json, commits and pushes.
# =============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
error() { echo -e "${RED}[✗]${NC} $*"; exit 1; }
info()  { echo -e "${BLUE}[i]${NC} $*"; }

VERSION_FILE="version.json"

# ─── Require clean working tree (except version.json) ────────────────────────
if ! git diff --quiet HEAD -- . ':(exclude)version.json' 2>/dev/null; then
  error "יש שינויים לא מושמרים. בצע 'git add' ו-'git commit' לפני הרצת release.sh"
fi
if ! git diff --cached --quiet HEAD 2>/dev/null; then
  error "יש שינויים בסטייג'. בצע 'git commit' לפני הרצת release.sh"
fi

# ─── Get last tag ─────────────────────────────────────────────────────────────
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null | grep '^v' || echo "v0.0.0")
info "גרסה נוכחית (תג אחרון): $LAST_TAG"

# ─── Get commits since last tag ───────────────────────────────────────────────
COMMITS=$(git log "${LAST_TAG}..HEAD" --oneline --no-merges 2>/dev/null || true)

if [ -z "$COMMITS" ]; then
  warn "אין שינויים מאז הגרסה האחרונה ($LAST_TAG). אין מה לשחרר."
  exit 0
fi

COMMIT_COUNT=$(echo "$COMMITS" | wc -l | tr -d ' ')
info "נמצאו $COMMIT_COUNT שינויים מאז $LAST_TAG"

# ─── Analyze changed files ────────────────────────────────────────────────────
CHANGED_FILES=$(git diff "${LAST_TAG}..HEAD" --name-only 2>/dev/null || git diff HEAD~1 --name-only)

# ─── Determine update type ────────────────────────────────────────────────────
UPDATE_TYPE="bug_fix"

# Check for security-related files
SECURITY_FILES=$(echo "$CHANGED_FILES" | grep -E \
  '(middleware/auth|middleware/security|middleware/rateLimiter|bcrypt|jwt|JWT|crypto|security)' \
  || true)
if [ -n "$SECURITY_FILES" ]; then
  UPDATE_TYPE="security"
fi

# Check for critical keywords in commit messages
CRITICAL_KEYWORDS=$(echo "$COMMITS" | grep -iE \
  '(critical|קריטי|urgent|hotfix|hot-fix|BREAKING|CVE)' \
  || true)
if [ -n "$CRITICAL_KEYWORDS" ]; then
  UPDATE_TYPE="critical"
fi

# ─── Bump semver ──────────────────────────────────────────────────────────────
CURRENT="${LAST_TAG#v}"
IFS='.' read -ra PARTS <<< "$CURRENT"
MAJOR="${PARTS[0]:-1}"; MINOR="${PARTS[1]:-0}"; PATCH="${PARTS[2]:-0}"

case "$UPDATE_TYPE" in
  critical) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  security) MINOR=$((MINOR + 1)); PATCH=0 ;;
  bug_fix)  PATCH=$((PATCH + 1)) ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"

# ─── Build Hebrew title ───────────────────────────────────────────────────────
case "$UPDATE_TYPE" in
  critical) TITLE="עדכון קריטי — נדרש עדכון מיידי" ;;
  security) TITLE="עדכון אבטחה — מומלץ לעדכן בהקדם" ;;
  bug_fix)  TITLE="תיקון באגים ושיפורים" ;;
esac

# ─── Build changelog from commits ─────────────────────────────────────────────
CHANGELOG_JSON="["
FIRST=1
while IFS= read -r LINE; do
  # Remove commit hash prefix
  MSG=$(echo "$LINE" | sed 's/^[a-f0-9]* //')
  # Skip release commits
  echo "$MSG" | grep -qE '^release: v' && continue
  if [ $FIRST -eq 0 ]; then CHANGELOG_JSON+=","; fi
  # Escape for JSON
  ESCAPED=$(echo "$MSG" | sed 's/\\/\\\\/g; s/"/\\"/g')
  CHANGELOG_JSON+="\"${ESCAPED}\""
  FIRST=0
done <<< "$COMMITS"
CHANGELOG_JSON+="]"

# ─── Write version.json ───────────────────────────────────────────────────────
TODAY=$(date +%Y-%m-%d)
cat > "$VERSION_FILE" << EOF
{
  "version": "${NEW_VERSION}",
  "date": "${TODAY}",
  "type": "${UPDATE_TYPE}",
  "title": "${TITLE}",
  "description": "${TITLE}",
  "changelog": ${CHANGELOG_JSON},
  "minFromVersion": "${CURRENT}"
}
EOF

log "version.json עודכן: $CURRENT → $NEW_VERSION ($UPDATE_TYPE)"

# ─── Preview ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}━━━ פרטי הגרסה ━━━${NC}"
echo "  גרסה:     $NEW_VERSION"
echo "  סוג:      $UPDATE_TYPE"
echo "  כותרת:    $TITLE"
echo "  שינויים:  $COMMIT_COUNT"
echo ""
echo "  Changelog:"
echo "$COMMITS" | while IFS= read -r LINE; do
  MSG=$(echo "$LINE" | sed 's/^[a-f0-9]* //')
  echo "    • $MSG"
done
echo ""

# ─── Confirm ─────────────────────────────────────────────────────────────────
read -r -p "$(echo -e "${YELLOW}האם לשחרר גרסה v${NEW_VERSION}? [y/N]${NC} ")" CONFIRM
[[ "$CONFIRM" =~ ^[Yy]$ ]] || { warn "בוטל."; exit 0; }

# ─── Commit, tag, push ────────────────────────────────────────────────────────
git add "$VERSION_FILE"
git commit -m "release: v${NEW_VERSION} — ${TITLE}"
git tag "v${NEW_VERSION}"
git push origin main --tags

echo ""
log "גרסה v${NEW_VERSION} (${UPDATE_TYPE}) נדחפה לגיטהב"
info "המערכת המותקנת תזהה את העדכון תוך עד 30 דקות"
echo ""
case "$UPDATE_TYPE" in
  critical) echo -e "  ${RED}⚠️  עדכון קריטי — מומלץ לעדכן ידנית מיידית${NC}" ;;
  security) echo -e "  ${YELLOW}🔒 עדכון אבטחה — מומלץ לעדכן בהקדם${NC}" ;;
  bug_fix)  echo -e "  ${GREEN}✓  תיקון באגים — עדכון לילי אוטומטי יטפל בזה${NC}" ;;
esac
echo ""
