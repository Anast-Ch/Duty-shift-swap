import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useAuth } from "../../app/AuthContext";
import { validateLogin } from "./validateLogin";
import type { LoginErrors } from "./validateLogin";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loginFailed, setLoginFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  function handleSubmit() {
    if (isSubmitting) return;
    setLoginFailed(false);

    const validationErrors = validateLogin({ email, password });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      if (login(email.trim(), password)) {
        navigate("/");
      } else {
        setLoginFailed(true);
        setIsSubmitting(false);
      }
    }, 500);
  }

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
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
            setLoginFailed(false);
          }}
          error={Boolean(errors.email)}
          helperText={errors.email}
          fullWidth
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((prev) => ({ ...prev, password: undefined }));
            setLoginFailed(false);
          }}
          error={Boolean(errors.password)}
          helperText={errors.password}
          fullWidth
        />
        {loginFailed ? (
          <Alert severity="error">Неверный email или пароль</Alert>
        ) : null}
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Входим…" : "Войти"}
        </Button>
      </Stack>
    </Box>
  );
}
