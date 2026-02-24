# מערכת הדרכת אבטחת מידע — גירון ניהול נכסים

[![Production Ready](https://img.shields.io/badge/Production-Ready-green)]()
[![Hebrew RTL](https://img.shields.io/badge/Language-Hebrew%20RTL-blue)]()
[![Docker](https://img.shields.io/badge/Deploy-Docker%20Compose-blue)]()

---

## תיאור המערכת

מערכת ווב מבוססת **Hebrew RTL** להדרכת אבטחת מידע ובחינה מקוונת לעובדי גירון ניהול נכסים.

### תכונות עיקריות

| תכונה | פירוט |
|-------|--------|
| מודול הדרכה | 15 שקפים + 20 תרחישים אינטראקטיביים עם משוב מיידי |
| בחינה | 10 שאלות מתוך 20, ציון עובר 8/10 |
| מנהל מערכת | ניהול עובדים, הגדרת בחינה, דוחות ציות |
| אבטחה | JWT, bcrypt, Helmet, Rate Limiting, HTTPS |
| מייל | שליחה אוטומטית של הזמנות ותוצאות |
| דוחות | יצוא CSV, לוח בקרה, ניטור ציות |

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
git clone <repo-url> giron-security
cd giron-security

# 2. הגדר משתני סביבה
cp .env.example .env
nano .env   # ערוך את כל הפרמטרים

# 3. צור תעודת SSL (לפיתוח/רשת פנימית)
cd nginx && ./generate-ssl.sh && cd ..

# 4. הפעל את המערכת
docker compose up -d

# 5. בדוק שהכל עלה
docker compose ps
docker compose logs backend --tail=30
```

### גישה ראשונית
- **URL:** https://security.giron.co.il (או כתובת השרת)
- **אימייל מנהל:** הערך מ-`ADMIN_EMAIL` ב-.env
- **סיסמה:** הערך מ-`ADMIN_PASSWORD` ב-.env

> ⚠️ **חובה:** שנה את סיסמת המנהל מיד לאחר הכניסה הראשונה!

---

## הגדרות סביבה (.env)

| משתנה | תיאור | ברירת מחדל |
|--------|--------|-------------|
| `DB_PASSWORD` | סיסמת PostgreSQL | **חובה לשנות** |
| `JWT_SECRET` | מפתח הצפנת JWT (64+ תווים) | **חובה לשנות** |
| `ADMIN_EMAIL` | אימייל מנהל ראשי | admin@giron.co.il |
| `ADMIN_PASSWORD` | סיסמת מנהל ראשי | **חובה לשנות** |
| `SMTP_HOST` | שרת דואר יוצא | smtp.gmail.com |
| `SMTP_USER` | שם משתמש SMTP | — |
| `SMTP_PASS` | סיסמת/App Password SMTP | — |
| `FRONTEND_URL` | כתובת המערכת (HTTPS) | https://security.giron.co.il |

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
│   │   └── services/  # Email Service
│   └── Dockerfile
├── frontend/          # React 18 + Vite (RTL)
│   ├── src/
│   │   ├── pages/     # Login, Training, Exam, Admin
│   │   ├── components/ # Reusable UI
│   │   ├── context/   # AuthContext
│   │   └── data/      # Slides & Questions content
│   └── Dockerfile
├── database/
│   └── init.sql       # Schema + 20 Hebrew Questions
├── nginx/
│   ├── nginx.conf     # Reverse Proxy + TLS
│   └── generate-ssl.sh
├── docker-compose.yml        # Production
├── docker-compose.dev.yml    # Development (with MailHog)
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
| GET | `/api/training/questions` | כל שאלות ההדרכה (עם תשובות) |
| POST | `/api/training/start` | סימון תחילת הדרכה |
| POST | `/api/training/progress` | עדכון התקדמות |
| POST | `/api/training/complete` | סיום הדרכה |

### Exam
| Method | Path | תיאור |
|--------|------|--------|
| POST | `/api/exam/start` | פתיחת בחינה חדשה |
| POST | `/api/exam/:id/answer` | שליחת תשובה |
| POST | `/api/exam/:id/submit` | הגשת הבחינה לציון |
| GET | `/api/exam/my-result` | תוצאת הבחינה האחרונה |

### Admin (מנהל בלבד)
| Method | Path | תיאור |
|--------|------|--------|
| GET | `/api/admin/dashboard` | סטטיסטיקות |
| GET/POST | `/api/admin/users` | ניהול עובדים |
| POST | `/api/admin/users/:id/reset-exam` | איפוס בחינה |
| GET/PUT | `/api/admin/exam-config` | הגדרת בחינה |
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
curl https://security.giron.co.il/api/health
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

*מערכת מסווגת לשימוש פנימי בלבד — גירון ניהול נכסים*
