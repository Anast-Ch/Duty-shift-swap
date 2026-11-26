import { validateLogin } from "./validateLogin";

export type RegistrationValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>;

export function validateRegistration(values: RegistrationValues): RegistrationErrors {
  const errors: RegistrationErrors = validateLogin(values);
  const name = values.name.trim();

  if (!name) {
    errors.name = "Введите имя";
  } else if (Array.from(name).length > 100) {
    errors.name = "Имя не должно превышать 100 символов";
  }

  if (values.password) {
    if (Array.from(values.password).length < 6) {
      errors.password = "Пароль должен содержать не менее 6 символов";
    } else if (new TextEncoder().encode(values.password).length > 72) {
      errors.password = "Пароль не должен превышать 72 байта в UTF-8";
    }
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Повторите пароль";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Пароли не совпадают";
  }

  return errors;
}
