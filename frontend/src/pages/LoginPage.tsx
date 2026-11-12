import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { LoginForm } from "../features/auth/LoginForm";

export default function LoginPage() {
  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Обмен сменами дежурств
        </Typography>
        <LoginForm />
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
