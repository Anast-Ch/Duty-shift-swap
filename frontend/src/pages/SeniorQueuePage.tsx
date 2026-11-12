import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import DangerButton from "../shared/ui/DangerButton";
import DataState from "../shared/ui/DataState";
import StatusChip from "../shared/ui/StatusChip";
import SwapRequestCard from "../entities/swap-request/SwapRequestCard";
import { useAppData } from "../app/AppDataContext";
import { useAuth } from "../app/AuthContext";
import { ShiftFormDialog } from "../features/manage-shifts/ShiftFormDialog";
import type { DialogMode } from "../features/manage-shifts/ShiftFormDialog";
import ShiftFilterButton from "../features/filter-shifts/ShiftFilterButton";
import {
  applyShiftFilters,
  emptyShiftFilters,
  getShiftDates,
  getShiftUsers,
} from "../features/filter-shifts/shiftFilters";
import type { ShiftFilters } from "../features/filter-shifts/shiftFilters";
import { useDemoLoad } from "../shared/hooks/useDemoLoad";
import {
  formatDate,
  formatDateTime,
  formatShift,
  formatTimeRange,
  sortRequests,
  sortShifts,
  userNameOrDash,
} from "../shared/utils";
import type { OperationResult, Shift } from "../shared/types";

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
  const { status, forceEmpty, retry } = useDemoLoad();
  const [filters, setFilters] = useState<ShiftFilters>(emptyShiftFilters);

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
  const visibleShifts = applyShiftFilters(allShifts, filters);
  const filteredOut =
    !forceEmpty && allShifts.length > 0 && visibleShifts.length === 0;

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

      {tab === 0 ? (
        <DataState
          status={status}
          isEmpty={forceEmpty || pending.length === 0}
          emptyText="Запросов, ожидающих решения, нет"
          onRetry={retry}
        >
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
                  initiator={getUserById(request.initiatorId)}
                  respondent={getUserById(request.respondentId)}
                  initiatorShift={getShiftById(request.initiatorShiftId)}
                  respondentShift={getShiftById(request.respondentShiftId)}
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
                        <DangerButton
                          variant="outlined"
                          onClick={() =>
                            handleResult(declineSwapRequestAsSenior(request.id))
                          }
                        >
                          Отклонить
                        </DangerButton>
                      </Stack>
                    )
                  }
                />
              );
            })}
          </Box>
        </DataState>
      ) : null}

      {tab === 1 ? (
        <DataState
          status={status}
          isEmpty={forceEmpty || history.length === 0}
          emptyText="История пока пуста"
          onRetry={retry}
        >
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
                      {userNameOrDash(getUserById(request.initiatorId))} и{" "}
                      {userNameOrDash(getUserById(request.respondentId))}
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
        </DataState>
      ) : null}

      {tab === 2 ? (
        <Paper>
          <Stack direction="row" spacing={1} sx={{ p: 2 }}>
            <Button variant="contained" onClick={() => openDialog("add", null)}>
              Добавить смену
            </Button>
            <ShiftFilterButton
              filters={filters}
              onApply={setFilters}
              users={getShiftUsers(allShifts, users)}
              dates={getShiftDates(allShifts)}
            />
          </Stack>
          <DataState
            inPanel
            status={status}
            onRetry={retry}
            isEmpty={forceEmpty || visibleShifts.length === 0}
            emptyText={
              filteredOut
                ? "По выбранным фильтрам ничего не найдено"
                : "Смен в графике нет"
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
          >
            <TableContainer>
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
                  {visibleShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>
                        {userNameOrDash(getUserById(shift.userId))}
                      </TableCell>
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
                        <DangerButton
                          size="small"
                          onClick={() => openDialog("delete", shift)}
                        >
                          Удалить
                        </DangerButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DataState>
        </Paper>
      ) : null}

      {dialogMode ? (
        <ShiftFormDialog
          mode={dialogMode}
          shift={dialogShift}
          users={users}
          onClose={closeDialog}
        />
      ) : null}
    </Stack>
  );
}
