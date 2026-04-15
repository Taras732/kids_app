const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => EMAIL_RE.test(email.trim());

export const hasMinLength = (password: string): boolean => password.length >= 8;
export const hasLettersAndNumbers = (password: string): boolean =>
  /[a-zA-Zа-яА-ЯіІїЇєЄґҐ]/.test(password) && /\d/.test(password);

export const isValidPassword = (password: string): boolean =>
  hasMinLength(password) && hasLettersAndNumbers(password);
