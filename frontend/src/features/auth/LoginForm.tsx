import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useAuth } from "../../app/AuthContext";
import { ApiError } from "./authApi";
import PasswordField from "./PasswordField";
import { validateLogin } from "./validateLogin";
import type { LoginErrors } from "./validateLogin";

export function LoginForm() {
  const { login, notice, clearNotice } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) return;
    setLoginError(null);
    clearNotice();

    const validationErrors = validateLogin({ email, password });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setLoginError("Неверный email или пароль");
      } else if (error instanceof Error && error.message.startsWith("Не удалось подтвердить")) {
        setLoginError(error.message);
      } else {
        setLoginError("Не удалось выполнить вход. Проверьте соединение с сервером.");
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
          label="Email"
          value={email}
          autoComplete="username"
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((prev) => ({ ...prev, email: undefined }));
            setLoginError(null);
          }}
          error={Boolean(errors.email)}
          helperText={errors.email}
          fullWidth
        />
        <PasswordField
          label="Пароль"
          value={password}
          autoComplete="current-password"
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((prev) => ({ ...prev, password: undefined }));
            setLoginError(null);
          }}
          error={Boolean(errors.password)}
          helperText={errors.password}
          fullWidth
        />
        {notice ? <Alert severity="warning" onClose={clearNotice}>{notice}</Alert> : null}
        {loginError ? <Alert severity="error">{loginError}</Alert> : null}
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Входим…" : "Войти"}
        </Button>
      </Stack>
    </Box>
  );
}
