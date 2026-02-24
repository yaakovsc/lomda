# מסמך מסירה — מערכת הדרכת אבטחת מידע
## גירון פיתוח ובניה בע"מ

---

| | |
|---|---|
| **לקוח** | גירון פיתוח ובניה בע"מ |
| **פרויקט** | מערכת הדרכת אבטחת מידע לעובדים |
| **מסופק ע"י** | קובי שלזינגר — ליווי פרויקטים |
| **טלפון** | 054-5664594 |
| **תאריך מסירה** | פברואר 2026 |
| **גרסה** | 1.0.0 — Production Ready |

---

## תיאור המערכת

מערכת ווב מלאה לניהול הדרכת אבטחת מידע חובה לעובדים.
המערכת כוללת מודול הדרכה אינטראקטיבי, בחינת ידע מאובטחת, ולוח ניהול מלא למנהל.

### יכולות עיקריות

| תכונה | פירוט |
|--------|--------|
| **הדרכה** | מצגת אינטראקטיבית רב-שלבית — עובד חייב לצפות בכל השקופיות |
| **בחינה** | 10 שאלות אקראיות מתוך מאגר, ציון עובר 8/10 |
| **נעילה אוטומטית** | יציאה מהבחינה לפני הגשה = נעילה — נדרש שחרור ידני ע"י מנהל |
| **ניהול עובדים** | יצירה, מחיקה, איפוס בחינה, איפוס סיסמה |
| **לוח בקרה** | סטטיסטיקות ציות בזמן אמת |
| **דוח ציות** | ייצוא CSV ל-Excel עם כל נתוני העובדים |
| **אימייל אוטומטי** | ברוך הבא + סיסמה זמנית לכל עובד חדש |
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
│   │   ├── services/       # שירות אימייל
│   │   ├── middleware/     # אימות, Rate Limiting, לוגים
│   │   └── config/         # Database, Logger
│   └── Dockerfile
├── frontend/               # React 18 + Vite
│   ├── src/
│   │   ├── pages/          # Training, Exam, Admin, Login
│   │   ├── components/     # Layout, ProtectedRoute
│   │   └── utils/          # API client (axios)
│   ├── public/             # giron.png, kobi-logo.png
│   └── Dockerfile
├── nginx/                  # Reverse Proxy
│   ├── nginx.conf
│   ├── ssl/                # תעודות SSL (נוצרות בהתקנה)
│   └── generate-ssl.sh
├── docs/
│   ├── INSTALL_GUIDE.md    # מדריך התקנה מלא
│   └── ADMIN_GUIDE.md      # מדריך למנהל מערכת
├── docker-compose.yml      # הגדרת כל הקונטיינרים
├── .env.example            # תבנית משתני סביבה
├── install.sh              # סקריפט התקנה אוטומטי
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

```bash
# 1. התקן Docker
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER && newgrp docker

# 2. הנח את תיקיית הפרויקט
sudo mkdir -p /opt/giron-security
sudo chown $USER:$USER /opt/giron-security
# העתק את קבצי המערכת לתיקייה זו

# 3. הגדר משתני סביבה
cd /opt/giron-security
cp .env.example .env
nano .env        # שנה DB_PASSWORD, JWT_SECRET, SMTP_PASS, ADMIN_PASSWORD

# 4. צור תעודת SSL (לרשת פנימית)
cd nginx && ./generate-ssl.sh && cd ..

# 5. הפעל
docker compose up -d --build

# 6. בדוק
docker compose ps
```

**מדריך מפורט:** ראה `docs/INSTALL_GUIDE.md`

---

## כניסה ראשונה

1. פתח דפדפן: `https://[כתובת-השרת]`
2. כנס עם `ADMIN_EMAIL` ו-`ADMIN_PASSWORD` מה-.env
3. **שנה סיסמה מיד!**
4. עבור ל-"הגדרות בחינה" — סמן לפחות 10 שאלות (מומלץ 20)
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

> 🔒 **אבטחה:** הקוד כולל הגנות מובנות: constant-time password comparison (מניעת user enumeration), Rate Limiting, JWT בזיכרון בלבד, bcrypt עם 12 rounds, SQL Injection protection דרך Sequelize ORM.

---

*גירון פיתוח ובניה בע"מ — מסמך מסירה פנימי — סודי*
