import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const baseStyle = `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
    <div style="background: #024fe0; padding: 24px 32px;">
      <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">smestime</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Сместување во Македонија</p>
    </div>
    <div style="padding: 32px;">
`;

const baseEnd = `
    </div>
    <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} SmestiMe · smestime.com</p>
    </div>
  </div>
`;

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

// Password reset
export const sendPasswordReset = async ({ to, resetLink }) => {
  await sendEmail({
    to,
    subject: 'Ресетирање на лозинка — SmestiMe',
    html: `${baseStyle}
      <h2 style="color: #111; margin-top: 0;">Ресетирање на лозинка</h2>
      <p style="color: #374151;">Побарано е ресетирање на лозинката за твојата SmestiMe сметка.</p>
      <p style="color: #374151;">Кликни на копчето подолу за да поставиш нова лозинка:</p>
      <a href="${resetLink}" style="display:inline-block; background:#024fe0; color:white; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:700; margin: 20px 0; font-size:15px;">
        Ресетирај лозинка
      </a>
      <p style="color:#6b7280; font-size:13px; margin-top:24px;">Линкот е важечки 1 час. Ако не си го побарал ова, игнорирај го е-маилот.</p>
    ${baseEnd}`,
  });
};

// Welcome email on registration
export const sendWelcomeEmail = async ({ to, firstName }) => {
  await sendEmail({
    to,
    subject: 'Добредојде на SmestiMe!',
    html: `${baseStyle}
      <h2 style="color: #111; margin-top: 0;">Добредојде, ${firstName}! 🎉</h2>
      <p style="color: #374151;">Твојата сметка на SmestiMe е успешно создадена.</p>
      <p style="color: #374151;">Сега можеш да:</p>
      <ul style="color: #374151; line-height: 1.8;">
        <li>Додадеш огласи за твоите сместувачки објекти</li>
        <li>Управуваш со резервации</li>
        <li>Комуницираш со гостите</li>
      </ul>
      <a href="${process.env.CLIENT_URL}/owner" style="display:inline-block; background:#024fe0; color:white; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:700; margin: 20px 0; font-size:15px;">
        Кон контролна табла
      </a>
    ${baseEnd}`,
  });
};

// New booking — notify owner
export const sendBookingNotification = async ({
  ownerEmail, ownerName, guestName, guestEmail, guestPhone,
  propertyTitle, checkIn, checkOut, guests, totalPrice, specialRequests,
}) => {
  await sendEmail({
    to: ownerEmail,
    subject: `Нова резервација — ${propertyTitle}`,
    html: `${baseStyle}
      <h2 style="color: #111; margin-top: 0;">Нова резервација! 📅</h2>
      <p style="color: #374151;">Здраво <strong>${ownerName}</strong>,</p>
      <p style="color: #374151;">Имаш нова резервација за <strong>${propertyTitle}</strong>.</p>
      <table style="width:100%; border-collapse: collapse; margin: 20px 0; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb;">
        <tr style="background:#f9fafb;"><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Гостин</td><td style="padding:12px 16px; font-weight:600;">${guestName}</td></tr>
        <tr><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Е-маил</td><td style="padding:12px 16px;">${guestEmail}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Телефон</td><td style="padding:12px 16px;">${guestPhone}</td></tr>
        <tr><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Пристигнување</td><td style="padding:12px 16px;">${checkIn}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Заминување</td><td style="padding:12px 16px;">${checkOut}</td></tr>
        <tr><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Гости</td><td style="padding:12px 16px;">${guests}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Вкупно</td><td style="padding:12px 16px; font-weight:700; color:#024fe0;">${totalPrice} МКД</td></tr>
        ${specialRequests ? `<tr><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Порака</td><td style="padding:12px 16px; font-style:italic;">${specialRequests}</td></tr>` : ''}
      </table>
      <a href="${process.env.CLIENT_URL}/owner/bookings" style="display:inline-block; background:#024fe0; color:white; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:700; margin: 8px 0; font-size:15px;">
        Потврди или откажи
      </a>
    ${baseEnd}`,
  });
};

// Booking confirmed — notify guest
export const sendBookingConfirmed = async ({
  guestEmail, guestName, propertyTitle, ownerName, ownerPhone, ownerEmail: ownerMail,
  checkIn, checkOut, guests, totalPrice,
}) => {
  await sendEmail({
    to: guestEmail,
    subject: `Резервацијата е потврдена — ${propertyTitle} ✓`,
    html: `${baseStyle}
      <h2 style="color: #111; margin-top: 0;">Резервацијата е потврдена! ✅</h2>
      <p style="color: #374151;">Здраво <strong>${guestName}</strong>,</p>
      <p style="color: #374151;">Твојата резервација за <strong>${propertyTitle}</strong> е потврдена од домаќинот.</p>
      <table style="width:100%; border-collapse: collapse; margin: 20px 0; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb;">
        <tr style="background:#f9fafb;"><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Пристигнување</td><td style="padding:12px 16px; font-weight:600;">${checkIn}</td></tr>
        <tr><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Заминување</td><td style="padding:12px 16px; font-weight:600;">${checkOut}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Гости</td><td style="padding:12px 16px;">${guests}</td></tr>
        <tr><td style="padding:12px 16px; color:#6b7280; font-size:13px;">Вкупно</td><td style="padding:12px 16px; font-weight:700; color:#024fe0;">${totalPrice} МКД</td></tr>
      </table>
      <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:10px; padding:16px; margin:20px 0;">
        <p style="margin:0 0 8px; font-weight:700; color:#0369a1;">Контакт на домаќинот:</p>
        <p style="margin:0; color:#374151;">${ownerName}<br>${ownerPhone}<br>${ownerMail}</p>
      </div>
    ${baseEnd}`,
  });
};

// Booking cancelled — notify guest
export const sendBookingCancelled = async ({
  guestEmail, guestName, propertyTitle, checkIn, checkOut,
}) => {
  await sendEmail({
    to: guestEmail,
    subject: `Резервацијата е откажана — ${propertyTitle}`,
    html: `${baseStyle}
      <h2 style="color: #111; margin-top: 0;">Резервацијата е откажана</h2>
      <p style="color: #374151;">Здраво <strong>${guestName}</strong>,</p>
      <p style="color: #374151;">За жал, твојата резервација за <strong>${propertyTitle}</strong> (${checkIn} → ${checkOut}) е откажана од домаќинот.</p>
      <p style="color: #374151;">Можеш да пребараш други сместувања на SmestiMe.</p>
      <a href="${process.env.CLIENT_URL}/properties" style="display:inline-block; background:#024fe0; color:white; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:700; margin: 20px 0; font-size:15px;">
        Пребарај сместување
      </a>
    ${baseEnd}`,
  });
};

// Email verification
export const sendVerificationEmail = async ({ to, firstName, verifyLink }) => {
  await sendEmail({
    to,
    subject: 'Потврди го твојот е-маил — SmestiMe',
    html: `${baseStyle}
      <h2 style="color: #111; margin-top: 0;">Потврди го твојот е-маил</h2>
      <p style="color: #374151;">Здраво <strong>${firstName}</strong>,</p>
      <p style="color: #374151;">Добредојде на SmestiMe! Кликни на копчето подолу за да го потврдиш твојот е-маил и да ја активираш сметката.</p>
      <a href="${verifyLink}" style="display:inline-block; background:#024fe0; color:white; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:700; margin: 20px 0; font-size:15px;">
        Потврди е-маил
      </a>
      <p style="color:#6b7280; font-size:13px; margin-top:24px;">Ако не си се регистрирал на SmestiMe, игнорирај го овој е-маил.</p>
    ${baseEnd}`,
  });
};
