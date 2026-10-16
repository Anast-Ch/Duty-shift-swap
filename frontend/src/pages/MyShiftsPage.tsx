import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ShiftCard from "../components/ShiftCard";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { sortShifts } from "../shared/utils";

export default function MyShiftsPage() {
  const { currentUser } = useAuth();
  const { shifts } = useAppData();

  if (!currentUser) {
    return null;
  }

  const myShifts = sortShifts(
    shifts.filter((shift) => shift.userId === currentUser.id),
  );

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Мои смены
      </Typography>
      {myShifts.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>Смен нет</Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {myShifts.map((shift) => {
            const isOnExchange = shift.status === "on_exchange";
            return (
              <ShiftCard
                key={shift.id}
                shift={shift}
                actions={
                  <Box>
                    {isOnExchange ? (
                      <Button
                        variant="contained"
                        size="small"
                        disabled
                        title="Смена уже участвует в обмене"
                      >
                        Обменять
                      </Button>
                    ) : (
                      <Button
                        component={RouterLink}
                        to={`/select-shift?shiftId=${shift.id}`}
                        variant="contained"
                        size="small"
                      >
                        Обменять
                      </Button>
                    )}
                  </Box>
                }
              />
            );
          })}
        </Box>
      )}
    </>
  );
}
