export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
export const NAME_MIN = 1;
export const NAME_MAX = 80;
export const EMAIL_MAX = 254;

export type ValidationError = { key: string; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(raw: string): ValidationError | null {
  const email = raw.trim();
  if (!email) {
    return { key: 'auth.error.emailRequired', message: 'Please enter your email address.' };
  }
  if (email.length > EMAIL_MAX) {
    return { key: 'auth.error.emailInvalid', message: 'Please enter a valid email address.' };
  }
  if (!EMAIL_RE.test(email)) {
    return { key: 'auth.error.emailInvalid', message: 'Please enter a valid email address.' };
  }
  return null;
}

export function validateName(raw: string): ValidationError | null {
  const name = raw.trim();
  if (name.length < NAME_MIN) {
    return { key: 'auth.error.nameRequired', message: 'Please enter your name.' };
  }
  if (name.length > NAME_MAX) {
    return { key: 'auth.error.nameTooLong', message: `Name must be ${NAME_MAX} characters or fewer.` };
  }
  return null;
}

export function validatePassword(raw: string): ValidationError | null {
  if (!raw) {
    return { key: 'auth.error.passwordRequired', message: 'Please enter a password.' };
  }
  if (raw.length < PASSWORD_MIN) {
    return { key: 'auth.error.passwordTooShort', message: `Password must be at least ${PASSWORD_MIN} characters.` };
  }
  if (raw.length > PASSWORD_MAX) {
    return { key: 'auth.error.passwordTooLong', message: `Password must be ${PASSWORD_MAX} characters or fewer.` };
  }
  return null;
}

export function validatePasswordPresent(raw: string): ValidationError | null {
  if (!raw) {
    return { key: 'auth.error.passwordRequired', message: 'Please enter a password.' };
  }
  return null;
}
