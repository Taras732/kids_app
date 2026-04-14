const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => EMAIL_RE.test(email.trim());

export const isValidPassword = (password: string): boolean => password.length >= 8;
