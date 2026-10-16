import { useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ComparisonModal from "../features/ComparisonModal";
import ShiftCard from "../components/ShiftCard";
import { useAppData } from "../app/AppDataContext";
import { useAuth } from "../app/AuthContext";
import { formatShift, isShiftFree, sortShifts } from "../shared/utils";

export default function SelectShiftPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { shifts, swapRequests, getShiftById, getUserById, createSwapRequest } =
    useAppData();
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  if (!currentUser) {
    return null;
  }

  const shiftId = searchParams.get("shiftId");
  const myShift = shiftId ? getShiftById(shiftId) : undefined;

  let problem = "";
  if (!shiftId) {
    problem = "Не указана смена для обмена";
  } else if (!myShift) {
    problem = "Смена не найдена";
  } else if (myShift.userId !== currentUser.id) {
    problem = "Начать обмен можно только со своей смены";
  } else if (!isShiftFree(myShift, swapRequests)) {
    problem = "Эта смена уже участвует в обмене";
  }

  if (problem || !myShift) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Обмен недоступен
        </Typography>
        <Typography sx={{ mb: 2 }}>{problem}</Typography>
        <Button component={RouterLink} to="/" variant="contained">
          К моим сменам
        </Button>
      </Paper>
    );
  }

  const candidates = sortShifts(
    shifts.filter(
      (shift) =>
        shift.userId !== currentUser.id && isShiftFree(shift, swapRequests),
    ),
  );
  const selectedShift = selectedShiftId ? getShiftById(selectedShiftId) : undefined;
  const selectedOwner = selectedShift ? getUserById(selectedShift.userId) : undefined;

  const handleSelect = (id: string) => {
    setErrorMessage("");
    setSelectedShiftId(id);
  };

  const handleClose = () => {
    setSelectedShiftId(null);
    setErrorMessage("");
  };

  const handleConfirm = () => {
    if (!selectedShift) {
      return;
    }
    const result = createSwapRequest(myShift.id, selectedShift.id);
    if (result.ok) {
      navigate("/swap-requests?created=1");
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Button component={RouterLink} to="/">
          Назад
        </Button>
      </Box>
      <Typography variant="h4" component="h1">
        Выбор смены для обмена
      </Typography>
      <Typography variant="h6" component="h2">
        Вы отдаёте
      </Typography>
      <ShiftCard shift={myShift} />
      <Typography variant="h6" component="h2">
        Свободные смены других сотрудников
      </Typography>
      {candidates.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>Подходящих смен нет</Typography>
        </Paper>
      ) : (
        <Paper>
          <List disablePadding>
            {candidates.map((shift, index) => {
              const owner = getUserById(shift.userId);
              return (
                <ListItem
                  key={shift.id}
                  divider={index < candidates.length - 1}
                  sx={{ justifyContent: "space-between", gap: 2 }}
                >
                  <ListItemText
                    primary={formatShift(shift)}
                    secondary={owner ? owner.name : "-"}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSelect(shift.id)}
                  >
                    Выбрать
                  </Button>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}
      {selectedShift && selectedOwner ? (
        <ComparisonModal
          myShift={myShift}
          otherShift={selectedShift}
          errorMessage={errorMessage}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />
      ) : null}
    </Stack>
  );
}
