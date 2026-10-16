import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import StatusChip from "../components/StatusChip";
import SwapRequestCard from "../components/SwapRequestCard";
import { useAppData } from "../app/AppDataContext";
import { useAuth } from "../app/AuthContext";
import {
  formatDate,
  formatDateTime,
  formatShift,
  formatTimeRange,
  sortRequests,
  sortShifts,
} from "../shared/utils";
import type { OperationResult, Shift, User } from "../shared/types";

type DialogMode = "add" | "edit" | "delete";

const dialogTitles: Record<DialogMode, string> = {
  add: "Добавить смену",
  edit: "Редактировать смену",
  delete: "Удалить смену",
};

const dialogActions: Record<DialogMode, string> = {
  add: "Добавить",
  edit: "Сохранить",
  delete: "Удалить",
};

interface ShiftDemoDialogProps {
  mode: DialogMode;
  shift: Shift | null;
  users: User[];
  onClose: () => void;
}

function ShiftDemoDialog({ mode, shift, users, onClose }: ShiftDemoDialogProps) {
  const [userId, setUserId] = useState(shift ? shift.userId : "");
  const [date, setDate] = useState(shift ? shift.date : "");
  const [startTime, setStartTime] = useState(shift ? shift.startTime : "");
  const [endTime, setEndTime] = useState(shift ? shift.endTime : "");

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{dialogTitles[mode]}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {mode === "delete" ? (
            <Typography>
              {shift ? `Смена: ${formatShift(shift)}` : "Смена не выбрана"}
            </Typography>
          ) : (
            <>
              <TextField
                select
                label="Сотрудник"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                fullWidth
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Дата (ГГГГ-ММ-ДД)"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                fullWidth
              />
              <TextField
                label="Начало (ЧЧ:ММ)"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                fullWidth
              />
              <TextField
                label="Конец (ЧЧ:ММ)"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                fullWidth
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant={mode === "delete" ? "outlined" : "contained"}
          color={mode === "delete" ? "secondary" : "primary"}
          onClick={onClose}
        >
          {dialogActions[mode]}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function SeniorQueuePage() {
  const { currentUser } = useAuth();
  const {
    users,
    shifts,
    swapRequests,
    getUserById,
    getShiftById,
    approveSwapRequestAsSenior,
    declineSwapRequestAsSenior,
  } = useAppData();
  const [tab, setTab] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [dialogShift, setDialogShift] = useState<Shift | null>(null);

  if (!currentUser) {
    return null;
  }

  const pending = sortRequests(
    swapRequests.filter((request) => request.status === "waiting_senior"),
  );
  const history = sortRequests(
    swapRequests.filter(
      (request) => request.status === "approved" || request.status === "declined",
    ),
  );
  const allShifts = sortShifts(shifts);

  function handleResult(result: OperationResult) {
    setErrorMessage(result.ok ? "" : result.error);
  }

  function openDialog(mode: DialogMode, shift: Shift | null) {
    setDialogMode(mode);
    setDialogShift(shift);
  }

  function closeDialog() {
    setDialogMode(null);
    setDialogShift(null);
  }

  function userName(userId: string): string {
    const user = getUserById(userId);
    return user ? user.name : "-";
  }

  function shiftText(shiftId: string): string {
    const shift = getShiftById(shiftId);
    return shift ? formatShift(shift) : "-";
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">
        Функции старшего
      </Typography>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      <Paper>
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)}>
          <Tab label="Ждут решения" />
          <Tab label="История" />
          <Tab label="Управление графиком" />
        </Tabs>
      </Paper>

      {tab === 0 && pending.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>Запросов, ожидающих решения, нет</Typography>
        </Paper>
      ) : null}
      {tab === 0 && pending.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          }}
        >
          {pending.map((request) => {
            const isParticipant =
              request.initiatorId === currentUser.id ||
              request.respondentId === currentUser.id;
            return (
              <SwapRequestCard
                key={request.id}
                request={request}
                actions={
                  isParticipant ? (
                    <Typography variant="body2">
                      Решение примет другой старший
                    </Typography>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        onClick={() =>
                          handleResult(approveSwapRequestAsSenior(request.id))
                        }
                      >
                        Одобрить
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          handleResult(declineSwapRequestAsSenior(request.id))
                        }
                      >
                        Отклонить
                      </Button>
                    </Stack>
                  )
                }
              />
            );
          })}
        </Box>
      ) : null}

      {tab === 1 && history.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>История пока пуста</Typography>
        </Paper>
      ) : null}
      {tab === 1 && history.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Создан</TableCell>
                <TableCell>Участники</TableCell>
                <TableCell>Смены</TableCell>
                <TableCell>Результат</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{formatDateTime(request.createdAt)}</TableCell>
                  <TableCell>
                    {userName(request.initiatorId)} и {userName(request.respondentId)}
                  </TableCell>
                  <TableCell>
                    {shiftText(request.initiatorShiftId)} /{" "}
                    {shiftText(request.respondentShiftId)}
                  </TableCell>
                  <TableCell>
                    <StatusChip kind="request" status={request.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      {tab === 2 ? (
        <Stack spacing={2}>
          <Box>
            <Button variant="contained" onClick={() => openDialog("add", null)}>
              Добавить смену
            </Button>
          </Box>
          {allShifts.length === 0 ? (
            <Paper sx={{ p: 3 }}>
              <Typography>Смен в графике нет</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Сотрудник</TableCell>
                    <TableCell>Дата</TableCell>
                    <TableCell>Время</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>{userName(shift.userId)}</TableCell>
                      <TableCell>{formatDate(shift.date)}</TableCell>
                      <TableCell>
                        {formatTimeRange(shift.startTime, shift.endTime)}
                      </TableCell>
                      <TableCell>
                        <StatusChip kind="shift" status={shift.status} />
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => openDialog("edit", shift)}>
                          Редактировать
                        </Button>
                        <Button size="small" onClick={() => openDialog("delete", shift)}>
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      ) : null}

      {dialogMode ? (
        <ShiftDemoDialog
          mode={dialogMode}
          shift={dialogShift}
          users={users}
          onClose={closeDialog}
        />
      ) : null}
    </Stack>
  );
}
