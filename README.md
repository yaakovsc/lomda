# ״בָּקִיא״ — מערכת הדרכת עובדים

[![Production Ready](https://img.shields.io/badge/Production-Ready-green)]()
[![Hebrew RTL](https://img.shields.io/badge/Language-Hebrew%20RTL-blue)]()
[![Docker](https://img.shields.io/badge/Deploy-Docker%20Compose-blue)]()

---

## תיאור המערכת

מערכת ווב מבוססת **Hebrew RTL** לניהול הדרכות ציות חובה לעובדים, הכוללת שלושה מודולים:

| מודול | תיאור |
|-------|--------|
| 🔐 אבטחת מידע | הגנה מפישינג, כופרה, סיסמאות, VPN |
| 🛡️ מניעת הטרדה מינית | חוק 1998, זיהוי, דיווח ואחריות מנהל |
| 🦺 בטיחות במקום העבודה | נהלי בטיחות, ציוד מגן, חירום |

### תכונות עיקריות

| תכונה | פירוט |
|-------|--------|
| מודולי הדרכה | 20 שקפים + 6 תרחישים אינטראקטיביים לכל מודול |
| בחינה | 10 שאלות אקראיות מתוך 20, ציון עובר 8/10 |
| ניהול מודולים | הפעלה/השבתה של כל מודול בנפרד |
| עריכת שקפים | עריכת טקסט שקפי הדרכה ישירות מהממשק |
| מנהל מערכת | ניהול עובדים, הגדרת בחינה, דוחות ציות |
| אבטחה | JWT, bcrypt, Helmet, Rate Limiting, HTTPS |
| מייל | שליחה אוטומטית של הזמנות ותוצאות |
| דוחות | יצוא CSV, לוח בקרה, ניטור ציות |
| עדכון אוטומטי | מנגנון עדכון גרסה דרך ממשק המנהל |

---

## ארכיטקטורה

```
                    HTTPS
   משתמש ──────► Nginx ──────► Frontend (React/Vite)
                              └──────► Backend (Node/Express)
                                              └──────► PostgreSQL
```

### טכנולוגיות

**Backend:** Node.js 20, Express, Sequelize ORM, PostgreSQL 16
**Frontend:** React 18, Vite, Hebrew RTL CSS
**Auth:** JWT, bcrypt (12 rounds)
**Email:** Nodemailer (SMTP)
**Infra:** Docker Compose, Nginx (TLS 1.3)
**Logging:** Winston + Daily Rotate Files

---

## התקנה מהירה (Production)

### דרישות מוקדמות
- Docker Desktop / Docker Engine 24+
- Docker Compose v2
- שרת עם לפחות 2GB RAM, 10GB דיסק

### שלבים

```bash
# 1. שכפל את הפרויקט
git clone https://github.com/yaakovsc/lomda.git giron-security
cd giron-security

# 2. הגדר משתני סביבה
cp .env.example .env
nano .env   # ערוך את כל הפרמטרים

# 3. צור תעודת SSL (לפיתוח/רשת פנימית)
cd nginx && ./generate-ssl.sh && cd ..

# 4. הפעל את המערכת
docker compose up -d --build

# 5. בדוק שהכל עלה
docker compose ps
docker compose logs backend --tail=30
```

### גישה ראשונית
- **URL:** https://[כתובת-השרת]
- **אימייל מנהל:** הערך מ-`ADMIN_EMAIL` ב-.env
- **סיסמה:** הערך מ-`ADMIN_PASSWORD` ב-.env

> ⚠️ **חובה:** שנה את סיסמת המנהל מיד לאחר הכניסה הראשונה!

---

## הגדרות סביבה (.env)

| משתנה | תיאור | ברירת מחדל |
|--------|--------|-------------|
| `DB_PASSWORD` | סיסמת PostgreSQL | **חובה לשנות** |
| `JWT_SECRET` | מפתח הצפנת JWT (64+ תווים) | **חובה לשנות** |
| `ADMIN_EMAIL` | אימייל מנהל ראשי | — |
| `ADMIN_PASSWORD` | סיסמת מנהל ראשי | **חובה לשנות** |
| `SMTP_HOST` | שרת דואר יוצא | smtp.gmail.com |
| `SMTP_USER` | שם משתמש SMTP | — |
| `SMTP_PASS` | סיסמת/App Password SMTP | — |
| `FRONTEND_URL` | כתובת המערכת (HTTPS) | — |

---

## מבנה הפרויקט

```
lomda/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── config/    # DB, Email, Logger
│   │   ├── middleware/ # Auth, Security, RateLimit
│   │   ├── models/    # Sequelize ORM Models
│   │   ├── routes/    # API Routes
│   │   ├── controllers/ # Business Logic
│   │   ├── services/  # Email, Update Services
│   │   └── utils/     # Migrate, Seed
│   └── Dockerfile
├── frontend/          # React 18 + Vite (RTL)
│   ├── src/
│   │   ├── pages/     # Login, ModuleSelect, Training, Exam, Admin
│   │   ├── components/ # Layout, common UI
│   │   ├── context/   # AuthContext
│   │   └── utils/     # API client (axios)
│   ├── public/
│   │   ├── bakie.png
│   │   ├── slide-images/         # שקפי אבטחת מידע
│   │   ├── slide-images-haras/   # שקפי הטרדה מינית
│   │   └── slide-images-safety/  # שקפי בטיחות
│   └── Dockerfile
├── database/
│   └── init.sql       # Schema
├── nginx/
│   ├── nginx.conf     # Reverse Proxy + TLS
│   └── generate-ssl.sh
├── triggers/          # Update mechanism trigger files
├── docker-compose.yml        # Production
├── docker-compose.dev.yml    # Development (with MailHog)
├── update-watcher.sh         # Auto-update cron script
├── .env.example
└── README.md
```

---

## API Reference

### Auth
| Method | Path | תיאור |
|--------|------|--------|
| POST | `/api/auth/login` | כניסה |
| GET | `/api/auth/me` | פרטי משתמש נוכחי |
| POST | `/api/auth/change-password` | שינוי סיסמה |

### Training
| Method | Path | תיאור |
|--------|------|--------|
| GET | `/api/training/modules` | רשימת מודולים ומצב הפעלה |
| GET | `/api/training/my-progress` | התקדמות העובד בכל המודולים |
| GET | `/api/training/slides?type=` | שקפי מודול |
| POST | `/api/training/start?type=` | תחילת הדרכה |
| POST | `/api/training/progress?type=` | עדכון התקדמות |
| POST | `/api/training/complete?type=` | סיום הדרכה |

### Exam
| Method | Path | תיאור |
|--------|------|--------|
| POST | `/api/exam/start` | פתיחת בחינה (type בגוף) |
| POST | `/api/exam/:id/submit` | הגשת הבחינה לציון |
| GET | `/api/exam/my-result` | תוצאת הבחינה האחרונה |

### Admin (מנהל בלבד)
| Method | Path | תיאור |
|--------|------|--------|
| GET | `/api/admin/dashboard` | סטטיסטיקות |
| GET/POST | `/api/admin/users` | ניהול עובדים |
| POST | `/api/admin/users/:id/reset-exam` | איפוס בחינה |
| GET/PUT | `/api/admin/exam-config?type=` | הגדרת בחינה למודול |
| PATCH | `/api/admin/exam-config/toggle` | הפעלה/השבתת מודול |
| GET | `/api/admin/slides?type=` | שקפי מודול לעריכה |
| PUT | `/api/admin/slides/:id` | עדכון שקף |
| GET | `/api/admin/compliance-report` | דוח ציות מלא |

---

## אבטחה

- **JWT** עם תוקף 8 שעות
- **bcrypt** עם 12 סיבובים
- **Helmet** — HTTP security headers
- **CORS** — מוגבל לדומיין הארגוני בלבד
- **Rate Limiting** — 10 ניסיונות כניסה ל-15 דקות
- **HTTPS** — TLS 1.2/1.3 בלבד
- **CSP** — Content Security Policy מוגדר
- **HSTS** — Strict Transport Security
- **Audit Log** — כל פעולה רגישה נרשמת עם מזהה משתמש ו-IP

---

## פיתוח מקומי

```bash
# עלה עם MailHog (לדוא"ל בפיתוח)
docker compose -f docker-compose.dev.yml up -d

# בדוק דואל ב: http://localhost:8025
# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

---

## גיבוי ושחזור

```bash
# גיבוי Database
docker exec giron_postgres pg_dump -U giron_user giron_security > backup_$(date +%F).sql

# שחזור
docker exec -i giron_postgres psql -U giron_user giron_security < backup_2024-01-01.sql

# גיבוי לוגים
docker cp giron_backend:/app/logs ./logs-backup
```

---

## ניטור ולוגים

```bash
# צפה בלוגים חיים
docker compose logs -f backend

# לוגי ביקורת (audit)
docker exec giron_backend cat logs/audit-$(date +%F).log

# בדיקת בריאות
curl -sk https://[כתובת-השרת]/api/health
```

---

## גרסאות ותאימות

| רכיב | גרסה |
|-------|-------|
| Node.js | 20 LTS |
| PostgreSQL | 16 |
| React | 18.3 |
| Docker | 24+ |
| Nginx | Alpine (latest) |

---

*מערכת מסווגת לשימוש פנימי בלבד — קובי שלזינגר ייעוץ וליווי פרויקטים*
