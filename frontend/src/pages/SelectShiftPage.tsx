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
import ComparisonModal from "../features/compare-shifts/ComparisonModal";
import ShiftFilterFields from "../features/filter-shifts/ShiftFilterFields";
import {
  applyShiftFilters,
  countActiveFilters,
  emptyShiftFilters,
  getShiftDates,
  getShiftUsers,
} from "../features/filter-shifts/shiftFilters";
import type { ShiftFilters } from "../features/filter-shifts/shiftFilters";
import ShiftCard from "../entities/shift/ShiftCard";
import DataState from "../shared/ui/DataState";
import { useAppData } from "../app/AppDataContext";
import { useAuth } from "../app/AuthContext";
import { useDemoLoad } from "../shared/hooks/useDemoLoad";
import { formatShift, isShiftFree, isUpcoming, sortShifts } from "../shared/utils";

export default function SelectShiftPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const {
    users,
    shifts,
    swapRequests,
    getShiftById,
    getUserById,
    createSwapRequest,
  } = useAppData();
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState<ShiftFilters>(emptyShiftFilters);
  const { status, forceEmpty, retry } = useDemoLoad();

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
  } else if (!isUpcoming(myShift)) {
    problem = "Нельзя обменять прошедшую смену";
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
        shift.userId !== currentUser.id &&
        isShiftFree(shift, swapRequests) &&
        isUpcoming(shift),
    ),
  );
  const filtered = applyShiftFilters(candidates, filters);
  const showPanel = candidates.length > 0 && !forceEmpty;
  const filteredOut =
    !forceEmpty && candidates.length > 0 && filtered.length === 0;
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
      {showPanel ? (
        <Paper sx={{ p: 2 }}>
          <Stack
            direction="row"
            sx={{ flexWrap: "wrap", alignItems: "center", gap: 2 }}
          >
            <Box sx={{ flex: "1 1 320px" }}>
              <ShiftFilterFields
                layout="row"
                showStatus={false}
                filters={filters}
                onChange={setFilters}
                users={getShiftUsers(candidates, users)}
                dates={getShiftDates(candidates)}
              />
            </Box>
            <Button
              variant="text"
              disabled={countActiveFilters(filters) === 0}
              onClick={() => setFilters(emptyShiftFilters)}
            >
              Сбросить
            </Button>
          </Stack>
        </Paper>
      ) : null}
      <DataState
        status={status}
        isEmpty={forceEmpty || filtered.length === 0}
        emptyText={
          filteredOut
            ? "По выбранным фильтрам ничего не найдено"
            : "Подходящих смен нет"
        }
        emptyAction={
          filteredOut ? (
            <Button
              variant="outlined"
              onClick={() => setFilters(emptyShiftFilters)}
            >
              Сбросить фильтры
            </Button>
          ) : undefined
        }
        onRetry={retry}
      >
        <Paper>
          <List disablePadding>
            {filtered.map((shift, index) => {
              const owner = getUserById(shift.userId);
              return (
                <ListItem
                  key={shift.id}
                  divider={index < filtered.length - 1}
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
      </DataState>
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
