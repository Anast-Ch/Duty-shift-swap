import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useAuth } from "../context/AuthContext";
import { roleLabels } from "../shared/utils";

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const { pathname } = useLocation();

  if (!currentUser) {
    return null;
  }

  const shiftsActive =
    pathname === "/" ||
    pathname.startsWith("/shift/") ||
    pathname.startsWith("/select-shift");

  function navSx(active: boolean) {
    return {
      borderRadius: 0,
      borderBottom: 2,
      borderColor: active ? "primary.main" : "transparent",
    };
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        component="header"
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: 1.5,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="h6" component="span">
            Обмен сменами
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexGrow: 1, flexWrap: "wrap" }}>
            <Button component={RouterLink} to="/" sx={navSx(shiftsActive)}>
              Мои смены
            </Button>
            <Button
              component={RouterLink}
              to="/swap-requests"
              sx={navSx(pathname === "/swap-requests")}
            >
              Запросы обмена
            </Button>
            {currentUser.role === "SENIOR" ? (
              <Button
                component={RouterLink}
                to="/senior-queue"
                sx={navSx(pathname === "/senior-queue")}
              >
                Очередь старшего
              </Button>
            ) : null}
          </Stack>
          <Typography variant="body2">
            {currentUser.name} ({roleLabels[currentUser.role]})
          </Typography>
          <Button variant="outlined" onClick={logout}>
            Выйти
          </Button>
        </Container>
      </Box>
      <Container maxWidth="lg" component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
