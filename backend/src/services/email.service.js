import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"SmestiMe" <noreply@smestime.mk>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email error:', err.message);
    // Don't throw — email failure shouldn't break the flow
  }
};

export const sendVerificationEmail = async (email, firstName, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Потврди ја твојата SmestiMe сметка',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a3c5e; padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">SmestiMe</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2>Здраво, ${firstName}!</h2>
          <p>Ти благодариме за регистрацијата. Кликни на копчето подолу за да ја потврдиш твојата e-mail адреса.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background: #e85d26; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Потврди e-mail
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Линкот е валиден 24 часа. Ако не си ти, игнорирај го овој e-mail.</p>
        </div>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, firstName, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Ресетирање на лозинка - SmestiMe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a3c5e; padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">SmestiMe</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2>Здраво, ${firstName}!</h2>
          <p>Примивме барање за ресетирање на лозинката за твојата сметка.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background: #e85d26; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Ресетирај лозинка
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Линкот е валиден 1 час. Ако не си ти, провери ја безбедноста на твојата сметка.</p>
        </div>
      </div>
    `,
  });
};

export const sendBookingConfirmationEmail = async (email, firstName, booking, property) => {
  await sendEmail({
    to: email,
    subject: `Потврда за резервација - ${property.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a3c5e; padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0;">SmestiMe</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2>Резервацијата е потврдена! 🎉</h2>
          <p>Здраво ${firstName}, твојата резервација е успешно направена.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${property.title}</h3>
            <p>📍 ${property.city}, ${property.address}</p>
            <p>📅 Пристигнување: <strong>${booking.check_in}</strong></p>
            <p>📅 Заминување: <strong>${booking.check_out}</strong></p>
            <p>👥 Гости: <strong>${booking.guests}</strong></p>
            <p>💰 Вкупно: <strong>${booking.total_price} МКД</strong></p>
          </div>
          <p>За прашања, контактирај нè на support@smestime.mk</p>
        </div>
      </div>
    `,
  });
};
