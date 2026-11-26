import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { RegisterForm } from "../features/auth/RegisterForm";
import FadeIn from "../shared/ui/FadeIn";

export default function RegisterPage() {
  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <FadeIn>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
            Регистрация
          </Typography>
          <RegisterForm />
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2">
              Уже есть аккаунт? <Link component={RouterLink} to="/login">Войти</Link>
            </Typography>
          </Box>
        </Paper>
      </FadeIn>
    </Container>
  );
}
