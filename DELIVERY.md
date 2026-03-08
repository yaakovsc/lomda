# מסמך מסירה — ״בָּקִיא״ מערכת הדרכת עובדים
## גירון פיתוח ובניה בע"מ

---

| | |
|---|---|
| **לקוח** | גירון פיתוח ובניה בע"מ |
| **פרויקט** | ״בָּקִיא״ — מערכת הדרכות ציות לעובדים |
| **מסופק ע"י** | קובי שלזינגר — ליווי פרויקטים |
| **טלפון** | 054-5664594 |
| **תאריך מסירה** | פברואר 2026 |
| **גרסה** | 1.0.0 — Production Ready |
| **מאגר קוד** | https://github.com/yaakovsc/lomda |

---

## תיאור המערכת

מערכת ווב מלאה לניהול הדרכות ציות חובה לעובדים — שלושה מודולים באותה פלטפורמה.

### מודולי הדרכה

| מודול | תיאור |
|-------|--------|
| 🔐 אבטחת מידע | פישינג, כופרה, סיסמאות, VPN, הנדסה חברתית |
| 🛡️ מניעת הטרדה מינית | חוק 1998, זיהוי, דיווח, תנכלות, אחריות מנהל |
| 🦺 בטיחות במקום העבודה | ציוד מגן, נהלי חירום, סיכונים |

### יכולות עיקריות

| תכונה | פירוט |
|--------|--------|
| **הדרכה** | 20 שקפים + 6 תרחישים אינטראקטיביים לכל מודול |
| **בחינה** | 10 שאלות אקראיות מתוך 20, ציון עובר 8/10 |
| **נעילה אוטומטית** | יציאה מהבחינה לפני הגשה = נעילה — נדרש שחרור ע"י מנהל |
| **ניהול מודולים** | הפעלה/השבתה של כל מודול — מודול מושבת מוסתר מהעובדים |
| **עריכת שקפים** | עריכת כותרת, תוכן ונקודות מפתח של כל שקף ישירות מהממשק |
| **ניהול עובדים** | יצירה, מחיקה, איפוס בחינה, איפוס סיסמה |
| **לוח בקרה** | סטטיסטיקות ציות בזמן אמת לכל מודול |
| **דוח ציות** | ייצוא CSV ל-Excel עם כל נתוני העובדים |
| **אימייל אוטומטי** | ברוך הבא + סיסמה זמנית לכל עובד חדש |
| **עדכון אוטומטי** | עדכון גרסה דרך ממשק המנהל (cron + Docker rebuild) |
| **אבטחה** | JWT בזיכרון (לא localStorage), bcrypt סיסמאות, Rate Limiting |

---

## תכולת החבילה

```
lomda/
├── backend/                # שרת Node.js / Express
│   ├── src/
│   │   ├── controllers/    # לוגיקת API
│   │   ├── models/         # מודלי Sequelize (PostgreSQL)
│   │   ├── routes/         # נתיבי API
│   │   ├── services/       # שירות אימייל ועדכון
│   │   ├── middleware/     # אימות, Rate Limiting, לוגים
│   │   ├── utils/          # migrate.js, seed.js
│   │   └── config/         # Database, Logger
│   └── Dockerfile
├── frontend/               # React 18 + Vite
│   ├── src/
│   │   ├── pages/          # Login, ModuleSelect, Training, Exam, Admin
│   │   ├── components/     # Layout, common UI
│   │   └── utils/          # API client (axios)
│   ├── public/
│   │   ├── bakie.png
│   │   ├── slide-images/         # שקפי אבטחת מידע
│   │   ├── slide-images-haras/   # שקפי הטרדה מינית
│   │   └── slide-images-safety/  # שקפי בטיחות
│   └── Dockerfile
├── nginx/                  # Reverse Proxy
│   ├── nginx.conf
│   ├── ssl/                # תעודות SSL (נוצרות בהתקנה)
│   └── generate-ssl.sh
├── docs/
│   ├── INSTALL_GUIDE.md    # מדריך התקנה מלא
│   └── ADMIN_GUIDE.md      # מדריך למנהל מערכת
├── triggers/               # תיקיית קבצי טריגר לעדכון
├── docker-compose.yml      # הגדרת כל הקונטיינרים
├── .env.example            # תבנית משתני סביבה
├── install.sh              # סקריפט התקנה אוטומטי
├── update-watcher.sh       # סקריפט cron לעדכון אוטומטי
└── DELIVERY.md             # מסמך זה
```

---

## ארכיטקטורה טכנית

```
Internet / LAN
      │
  [Nginx :443]  ← SSL Termination
      │
  ┌───┴──────────┐
  │              │
[Frontend]   [Backend API]
 React/Vite   Node.js/Express
              Port 3001
                  │
             [PostgreSQL]
              Port 5432
```

**4 Docker containers:** `giron_nginx` · `giron_frontend` · `giron_backend` · `giron_postgres`

---

## דרישות שרת

| משאב | מינימום | מומלץ |
|------|---------|--------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| דיסק | 20 GB | 40 GB |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Docker | 24+ | 26+ |
| רשת | IP קבועה | IP קבועה + DNS |

---

## התקנה מהירה

### שלב 1 — הורדה מ-GitHub

```bash
# התקן Docker ו-Git
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git openssl
sudo usermod -aG docker $USER && newgrp docker

# שכפל את המאגר
sudo mkdir -p /opt/giron-security
sudo chown $USER:$USER /opt/giron-security
git clone https://github.com/yaakovsc/lomda.git /opt/giron-security
cd /opt/giron-security
```

### שלב 2 — הגדרת סיסמאות וטוקנים

```bash
# צור מפתחות אקראיים מאובטחים
echo "=== העתק ערכים אלה ל-.env ==="
echo "JWT_SECRET:      $(openssl rand -hex 32)"
echo "SESSION_SECRET:  $(openssl rand -hex 32)"
echo "DB_PASSWORD:     $(openssl rand -base64 20 | tr -dc 'A-Za-z0-9!@#$' | head -c 20)"

# צור קובץ .env ועדכן את הערכים שהודפסו למעלה
cp .env.example .env
nano .env
```

**ערכים חובה ב-.env:**

| משתנה | מה לרשום |
|--------|----------|
| `DB_PASSWORD` | פלט DB_PASSWORD מהפקודה למעלה |
| `JWT_SECRET` | פלט JWT_SECRET מהפקודה למעלה |
| `SESSION_SECRET` | פלט SESSION_SECRET מהפקודה למעלה |
| `FRONTEND_URL` | `https://[כתובת-השרת]` |
| `ADMIN_EMAIL` | אימייל המנהל הראשי |
| `ADMIN_PASSWORD` | סיסמה חזקה — **תשנה לאחר כניסה ראשונה!** |
| `SMTP_HOST` | שרת המייל (`smtp.office365.com` / `smtp.gmail.com`) |
| `SMTP_USER` | כתובת מייל שולח |
| `SMTP_PASS` | סיסמת חשבון המייל |

### שלב 3 — SSL, הפעלה ובדיקה

```bash
# SSL עצמי-חתום (לרשת פנימית)
cd nginx && ./generate-ssl.sh && cd ..

# הפעל
docker compose up -d --build

# בדוק
docker compose ps
```

**מדריך מפורט עם כל הפרמטרים:** `docs/INSTALL_GUIDE.md`

---

## כניסה ראשונה

1. פתח דפדפן: `https://[כתובת-השרת]`
2. כנס עם `ADMIN_EMAIL` ו-`ADMIN_PASSWORD` מה-.env
3. **שנה סיסמה מיד!**
4. עבור ל-"הגדרות בחינה" — הפעל מודולים ובחר 10 שאלות לכל מודול
5. הוסף עובדים מ-"ניהול עובדים"

---

## נתוני ברירת מחדל

| פרמטר | ערך ברירת מחדל | שינוי |
|--------|----------------|-------|
| ציון עובר | 8/10 | הגדרות בחינה |
| שאלות בבחינה | 10 אקראיות מתוך הסומנות | אוטומטי |
| תפוגת JWT | 8 שעות | .env → JWT_EXPIRES_IN |
| נעילה | אוטומטית עם כניסה לבחינה | עיצוב מובנה |
| BCRYPT | 12 rounds | .env → BCRYPT_ROUNDS |

---

## אחריות ותמיכה

| | |
|---|---|
| **פותח ומיישם** | קובי שלזינגר |
| **שירות** | ליווי פרויקטים |
| **טלפון** | 054-5664594 |
| **תחום תמיכה** | תקלות טכניות, עדכונים, הרחבות |

---

## הערות חשובות

> ⚠️ **לפני השקה לייצור:**
> - שנה את **כל** הסיסמאות מ-.env.example לערכים ייחודיים וחזקים
> - הרץ `openssl rand -hex 32` ליצירת `JWT_SECRET` ו-`SESSION_SECRET`
> - הגדר גיבוי אוטומטי למסד הנתונים (ראה INSTALL_GUIDE.md)
> - הגדר Firewall — אפשר רק פורטים 22, 80, 443
> - הגדר את ה-cron לעדכון אוטומטי (ראה install.sh)

> 🔒 **אבטחה:** הקוד כולל הגנות מובנות: constant-time password comparison (מניעת user enumeration), Rate Limiting, JWT בזיכרון בלבד, bcrypt עם 12 rounds, SQL Injection protection דרך Sequelize ORM.

---

*גירון פיתוח ובניה בע"מ — מסמך מסירה פנימי — סודי*
