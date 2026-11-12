export type LoginValues = { email: string; password: string };
export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
  const email = values.email.trim();

  if (email === "") {
    errors.email = "Введите email";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Некорректный email";
  }

  if (values.password === "") {
    errors.password = "Введите пароль";
  }

  return errors;
}
