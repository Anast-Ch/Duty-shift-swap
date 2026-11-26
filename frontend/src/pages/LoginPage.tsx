import { Link as RouterLink, useLocation } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { LoginForm } from "../features/auth/LoginForm";
import FadeIn from "../shared/ui/FadeIn";

export default function LoginPage() {
  const location = useLocation();
  const registered = location.state?.registered === true;

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <FadeIn>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
            Обмен сменами дежурств
          </Typography>
          {registered ? (
            <Alert severity="success" icon={false} sx={{ mb: 2 }}>
              Регистрация завершена. Войдите в свой аккаунт.
            </Alert>
          ) : null}
          <LoginForm />
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2">
              Нет аккаунта? <Link component={RouterLink} to="/register">Зарегистрироваться</Link>
            </Typography>
          </Box>
        </Paper>
      </FadeIn>
    </Container>
  );
}
