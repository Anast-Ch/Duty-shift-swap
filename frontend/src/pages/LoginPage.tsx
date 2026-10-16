import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (login(email, password)) {
      navigate("/");
    } else {
      setError("Неверный email или пароль");
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Обмен сменами дежурств
        </Typography>
        <Box
          component="form"
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
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
            />
            <TextField
              label="Пароль"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
            />
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Button type="submit" variant="contained">
              Войти
            </Button>
          </Stack>
        </Box>
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Тестовые аккаунты
          </Typography>
          <Typography variant="body2">
            pv@company.ru / password - сотрудник
          </Typography>
          <Typography variant="body2">
            iv@company.ru / password - старший смены
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
