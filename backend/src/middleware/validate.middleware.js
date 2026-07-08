import { validationResult } from 'express-validator';

const FIELD_MESSAGES = {
  email: 'Внеси валидна е-маил адреса',
  password: 'Лозинката мора да има најмалку 8 знаци',
  firstName: 'Името е задолжително',
  lastName: 'Презимето е задолжително',
  title: 'Насловот е задолжителен',
  description: 'Описот е задолжителен',
  propertyType: 'Изберете тип на сместување',
  city: 'Градот е задолжителен',
  address: 'Адресата е задолжителна',
  pricePerNight: 'Внеси валидна цена',
  maxGuests: 'Внеси валиден број на гости',
  token: 'Невалиден токен',
  status: 'Невалиден статус',
};

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    const field = firstError.path;
    const message = FIELD_MESSAGES[field] || firstError.msg;
    return res.status(400).json({ error: message, field });
  }
  next();
};
