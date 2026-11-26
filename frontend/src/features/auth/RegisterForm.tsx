import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { ApiError, registerRequest } from "./authApi";
import PasswordField from "./PasswordField";
import { validateRegistration } from "./validateRegistration";
import type { RegistrationErrors, RegistrationValues } from "./validateRegistration";

export function RegisterForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegistrationValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof RegistrationValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setSubmitError(null);
    const validationErrors = validateRegistration(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await registerRequest(values.name.trim(), values.email.trim(), values.password);
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrors((previous) => ({ ...previous, email: "Пользователь с таким email уже зарегистрирован" }));
      } else if (error instanceof ApiError && error.status === 422) {
        setSubmitError("Сервер не принял данные. Проверьте поля и попробуйте ещё раз.");
      } else if (error instanceof ApiError) {
        setSubmitError("Не удалось зарегистрироваться из-за ошибки сервера. Попробуйте позже.");
      } else {
        setSubmitError("Не удалось зарегистрироваться. Проверьте соединение с сервером.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <Stack spacing={2}>
        <TextField
          label="Имя"
          value={values.name}
          autoComplete="name"
          onChange={(event) => updateField("name", event.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
          fullWidth
        />
        <TextField
          label="Email"
          value={values.email}
          autoComplete="email"
          onChange={(event) => updateField("email", event.target.value)}
          error={Boolean(errors.email)}
          helperText={errors.email}
          fullWidth
        />
        <PasswordField
          label="Пароль"
          value={values.password}
          autoComplete="new-password"
          onChange={(event) => updateField("password", event.target.value)}
          error={Boolean(errors.password)}
          helperText={errors.password}
          fullWidth
        />
        <PasswordField
          label="Повторите пароль"
          visibilityTarget="повтор пароля"
          value={values.confirmPassword}
          autoComplete="new-password"
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword}
          fullWidth
        />
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Регистрируем…" : "Зарегистрироваться"}
        </Button>
      </Stack>
    </Box>
  );
}
