import { Link as RouterLink, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Layout from "./Layout";
import { useAuth } from "./AuthContext";
import LoginPage from "../pages/LoginPage";
import MyShiftsPage from "../pages/MyShiftsPage";
import SelectShiftPage from "../pages/SelectShiftPage";
import SeniorQueuePage from "../pages/SeniorQueuePage";
import SwapRequestsPage from "../pages/SwapRequestsPage";

function PublicOnly() {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/" replace /> : <Outlet />;
}

function RequireAuth() {
  const { currentUser } = useAuth();
  return currentUser ? <Layout /> : <Navigate to="/login" replace />;
}

function AccessDenied() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Доступ запрещён
      </Typography>
      <Typography sx={{ mb: 2 }}>Эта страница доступна только старшим.</Typography>
      <Button component={RouterLink} to="/" variant="contained">
        На главную
      </Button>
    </Paper>
  );
}

function RequireSenior() {
  const { currentUser } = useAuth();
  return currentUser?.role === "SENIOR" ? <Outlet /> : <AccessDenied />;
}

function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Страница не найдена
        </Typography>
        <Typography sx={{ mb: 2 }}>Такого адреса в приложении нет.</Typography>
        <Button component={RouterLink} to="/" variant="contained">
          На главную
        </Button>
      </Paper>
    </Container>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<MyShiftsPage />} />
        <Route path="/select-shift" element={<SelectShiftPage />} />
        <Route path="/swap-requests" element={<SwapRequestsPage />} />
        <Route element={<RequireSenior />}>
          <Route path="/senior-queue" element={<SeniorQueuePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
