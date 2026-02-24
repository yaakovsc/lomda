const { getTransporter } = require('../config/email');
const logger = require('../config/logger');

const emailService = {
  async sendWelcome(user, tempPassword) {
    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><title>הדרכת אבטחת מידע - גירון</title></head>
<body style="font-family: Arial, sans-serif; direction: rtl; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: #1a3a6b; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">מערכת הדרכת אבטחת מידע</h1>
      <p style="color: #a8c0e8; margin: 8px 0 0;">גירון פיתוח ובניה בע"מ</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #1a3a6b;">שלום ${user.name},</h2>
      <p>נוצר עבורך חשבון במערכת הדרכת אבטחת מידע של גירון.</p>
      <p>עליך להשלים את ההדרכה ולעבור את הבחינה בהצלחה.</p>
      <div style="background: #f0f4ff; border-right: 4px solid #1a3a6b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px; font-weight: bold;">פרטי כניסה:</p>
        <p style="margin: 4px 0;">כתובת אימייל: <strong>${user.email}</strong></p>
        <p style="margin: 4px 0;">סיסמה זמנית: <strong style="font-family: monospace; font-size: 16px;">${tempPassword}</strong></p>
      </div>
      <p style="color: #c0392b;"><strong>⚠️ נא לשנות את הסיסמה בכניסה הראשונה.</strong></p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/login" style="background: #1a3a6b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">כניסה למערכת</a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #888; font-size: 12px; text-align: center;">הודעה זו נשלחה אוטומטית ממערכת ההדרכה של גירון. אין להשיב להודעה זו.</p>
    </div>
  </div>
</body>
</html>`;

    return this._send({
      to: user.email,
      subject: 'הדרכת אבטחת מידע גירון - פרטי כניסה',
      html,
    });
  },

  async sendExamResult(user, score, passed, totalQuestions) {
    const icon = passed ? '✅' : '❌';
    const statusText = passed ? 'עברת את הבחינה בהצלחה!' : 'לא עברת את הבחינה';
    const color = passed ? '#27ae60' : '#c0392b';

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; direction: rtl; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: #1a3a6b; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">תוצאות בחינת אבטחת מידע</h1>
    </div>
    <div style="padding: 30px; text-align: center;">
      <div style="font-size: 60px; margin: 20px 0;">${icon}</div>
      <h2 style="color: ${color}; font-size: 24px;">${statusText}</h2>
      <p style="font-size: 18px;">שלום ${user.name},</p>
      <div style="background: #f0f4ff; border-radius: 8px; padding: 20px; margin: 20px 0; display: inline-block; min-width: 200px;">
        <p style="margin: 0; font-size: 14px; color: #666;">הציון שלך</p>
        <p style="margin: 8px 0 0; font-size: 48px; font-weight: bold; color: ${color};">${score}/${totalQuestions}</p>
      </div>
      ${passed
        ? '<p>תעודת השלמת הדרכה תישלח בנפרד.</p>'
        : '<p>פנה/י למנהל המערכת לאיפוס הבחינה ולצורך בחינה חוזרת.</p>'
      }
    </div>
  </div>
</body>
</html>`;

    return this._send({
      to: user.email,
      subject: `תוצאות בחינת אבטחת מידע - ${statusText}`,
      html,
    });
  },

  async sendPasswordReset(user, resetUrl) {
    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; direction: rtl; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: #1a3a6b; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">איפוס סיסמה</h1>
    </div>
    <div style="padding: 30px;">
      <p>שלום ${user.name},</p>
      <p>קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #1a3a6b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-size: 16px;">איפוס סיסמה</a>
      </div>
      <p style="color: #888; font-size: 13px;">הקישור תקף למשך שעה אחת בלבד.<br>אם לא ביקשת איפוס סיסמה, התעלם/י מהודעה זו.</p>
    </div>
  </div>
</body>
</html>`;

    return this._send({
      to: user.email,
      subject: 'איפוס סיסמה - מערכת הדרכת אבטחת מידע גירון',
      html,
    });
  },

  async _send({ to, subject, html }) {
    try {
      const info = await getTransporter().sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      logger.info('Email sent', { to, subject, messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Email send failed', { to, subject, error: error.message });
      return { success: false, error: error.message };
    }
  },
};

module.exports = emailService;
