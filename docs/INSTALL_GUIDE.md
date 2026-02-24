# מדריך התקנה מלא — מערכת הדרכת אבטחת מידע גירון

## דרישות מוקדמות

### שרת
- **מערכת הפעלה:** Ubuntu 22.04 LTS / Debian 12 / Rocky Linux 9
- **CPU:** 2 cores לפחות
- **RAM:** 4GB לפחות (מומלץ 8GB)
- **דיסק:** 20GB לפחות
- **רשת:** גישה לאינטרנט (להתקנה), כתובת IP קבועה

### תוכנות נדרשות
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git openssl curl

# הוסף את המשתמש הנוכחי לקבוצת docker
sudo usermod -aG docker $USER
newgrp docker
```

---

## שלב 1: הורדת קוד המקור מ-GitHub

```bash
# צור ספרייה לפרויקט
sudo mkdir -p /opt/giron-security
sudo chown $USER:$USER /opt/giron-security

# שכפל את המאגר
git clone https://github.com/yaakovsc/lomda.git /opt/giron-security

cd /opt/giron-security
```

> 💡 **עדכונים עתידיים:** לעדכון הקוד בלבד (ללא מחיקת נתונים) הרץ:
> ```bash
> cd /opt/giron-security
> git pull origin main
> docker compose up -d --build
> ```

---

## שלב 2: הגדרת סיסמאות וטוקנים

### 2א — יצירת מפתחות אקראיים

פקודות אלה יצרו מחרוזות מאובטחות — הרץ כל אחת ושמור את הפלט:

```bash
# מפתח JWT (חתימת טוקני כניסה)
echo "JWT_SECRET:" && openssl rand -hex 32

# מפתח Session
echo "SESSION_SECRET:" && openssl rand -hex 32

# סיסמת מסד נתונים
echo "DB_PASSWORD:" && openssl rand -base64 20 | tr -dc 'A-Za-z0-9!@#$' | head -c 20; echo
```

### 2ב — יצירת קובץ .env

```bash
cp .env.example .env
nano .env
```

### 2ג — ערכים חובה לשנות

| משתנה | תיאור | דוגמה / הוראה |
|--------|--------|---------------|
| `DB_PASSWORD` | סיסמת PostgreSQL | פלט הפקודה מ-2א |
| `JWT_SECRET` | חתימת JWT | פלט הפקודה מ-2א |
| `SESSION_SECRET` | מפתח session | פלט הפקודה מ-2א |
| `FRONTEND_URL` | כתובת המערכת | `https://security.giron.co.il` |
| `ADMIN_EMAIL` | אימייל מנהל ראשי | `admin@giron.co.il` |
| `ADMIN_PASSWORD` | סיסמת מנהל ראשי | בחר סיסמה חזקה — **שנה לאחר כניסה ראשונה!** |
| `SMTP_HOST` | שרת דואל | `smtp.office365.com` / `smtp.gmail.com` |
| `SMTP_USER` | חשבון שליחת מייל | `security-training@giron.co.il` |
| `SMTP_PASS` | סיסמת חשבון מייל | סיסמת חשבון ה-SMTP |
| `EMAIL_FROM` | שם שולח | `"הדרכת אבטחה גירון" <security-training@giron.co.il>` |

### 2ד — קובץ .env לאחר עריכה (דוגמה מלאה)

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://security.giron.co.il

DB_HOST=postgres
DB_PORT=5432
DB_NAME=giron_security
DB_USER=giron_user
DB_PASSWORD=Xk9#mP2$qLr8vN4w     ← החלף בפלט מ-2א

JWT_SECRET=3f8a1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a  ← 64 תווים hex
JWT_EXPIRES_IN=8h

SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=security-training@giron.co.il
SMTP_PASS=your-email-password-here
EMAIL_FROM='"מערכת הדרכת אבטחה - גירון" <security-training@giron.co.il>'

ADMIN_EMAIL=admin@giron.co.il
ADMIN_PASSWORD=Admin@Giron2026!   ← שנה לאחר כניסה ראשונה!
ADMIN_NAME=מנהל מערכת

BCRYPT_ROUNDS=12
SESSION_SECRET=2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d  ← החלף בפלט מ-2א
LOG_LEVEL=info
```

---

## שלב 3: הגדרת SSL

### אפשרות א' — תעודה עצמית-חתומה (לרשת פנימית)
```bash
cd nginx
./generate-ssl.sh
cd ..
```

### אפשרות ב' — Let's Encrypt (לשרת עם DNS ציבורי)
```bash
# התקן certbot
sudo apt install -y certbot

# קבל תעודה (הפסק nginx זמנית)
sudo certbot certonly --standalone -d security.giron.co.il

# העתק תעודות
sudo cp /etc/letsencrypt/live/security.giron.co.il/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/security.giron.co.il/privkey.pem nginx/ssl/key.pem
```

### אפשרות ג' — תעודת CA ארגונית
```bash
mkdir -p nginx/ssl
cp /path/to/your/cert.pem nginx/ssl/cert.pem
cp /path/to/your/key.pem nginx/ssl/key.pem
```

---

## שלב 4: עדכון nginx.conf לשם הדומיין שלך

```bash
# ערוך את שם השרת
nano nginx/nginx.conf
# שנה: server_name security.giron.co.il;
# לכתובת שלך
```

---

## שלב 5: הפעלת המערכת

```bash
# בנה והפעל
docker compose up -d --build

# עקוב אחר הלוגים
docker compose logs -f

# בדוק שכל הקונטיינרים רצים
docker compose ps
```

**פלט תקין:**
```
NAME              STATUS          PORTS
giron_postgres    Up (healthy)    5432/tcp
giron_backend     Up (healthy)    3001/tcp
giron_frontend    Up              80/tcp
giron_nginx       Up              0.0.0.0:80->80, 0.0.0.0:443->443
```

---

## שלב 6: כניסה ראשונה

1. פתח דפדפן: `https://security.giron.co.il`
2. היכנס עם: `ADMIN_EMAIL` + `ADMIN_PASSWORD` מה-.env
3. **שנה סיסמה מיד!**
4. עבור ל"הגדרות בחינה" וסמן את 20 שאלות הבחינה מתוך מאגר השאלות (המערכת תבחר 10 אקראיות בכל ניסיון)
5. הוסף עובדים מ"ניהול עובדים"

---

## שלב 7: הגדרת Firewall

```bash
# אפשר רק HTTPS ו-SSH
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (לריידרקט ל-HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# אמת
sudo ufw status
```

---

## ניהול שוטף

### הוספת עובדים בכמות גדולה

עובדים מוספים דרך ממשק המנהל בודד-בודד. כל עובד מקבל אימייל עם סיסמה זמנית.

### גיבוי אוטומטי

```bash
# הוסף לcrontab של שרת
crontab -e

# גיבוי יומי ב-02:00
0 2 * * * docker exec giron_postgres pg_dump -U giron_user giron_security | gzip > /backups/giron-$(date +\%F).sql.gz
# שמור 30 ימים
0 3 * * * find /backups -name "giron-*.sql.gz" -mtime +30 -delete
```

### עדכון המערכת

```bash
# עצור
docker compose down

# עדכן קוד
git pull origin main

# בנה מחדש
docker compose up -d --build

# בדוק
docker compose ps && docker compose logs backend --tail=20
```

### איפוס מלא (זהירות!)

```bash
# מחק הכל כולל נתונים
docker compose down -v
docker system prune -f
```

---

## פתרון תקלות

### Backend לא עולה

```bash
docker compose logs backend
# בדוק חיבור לDB:
docker exec giron_backend curl -f http://localhost:3001/api/health
```

### שגיאות Database

```bash
# כניסה לDB
docker exec -it giron_postgres psql -U giron_user -d giron_security

# בדוק טבלאות
\dt
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM users;
```

### בעיות דואל

```bash
# בדוק לוגי email
docker compose logs backend | grep -i email
docker compose logs backend | grep -i smtp
```

### בדיקת SSL

```bash
openssl s_client -connect security.giron.co.il:443 -brief
```

---

## אבטחה לאחר התקנה

- [ ] שנה את סיסמת המנהל
- [ ] שנה את `JWT_SECRET` ו-`DB_PASSWORD` לערכים ייחודיים
- [ ] הפעל Firewall והגבל גישה
- [ ] הגדר גיבוי אוטומטי
- [ ] בדוק שהלוגים נכתבים: `docker compose logs backend`
- [ ] הגדר ניטור uptime (UptimeRobot, Zabbix)
- [ ] וודא ש-SSL תקין ותאריך פקיעה ידוע

---

*מסמך מסווג — לשימוש פנימי בלבד — גירון פיתוח ובניה בע"מ*
