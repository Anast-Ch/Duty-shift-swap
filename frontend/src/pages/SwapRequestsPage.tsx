import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
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
import StatusChip from "../components/StatusChip";
import { useAppData } from "../app/AppDataContext";
import { useAuth } from "../app/AuthContext";
import { formatDateTime, formatShift, sortRequests } from "../shared/utils";
import type { OperationResult, SwapRequest } from "../shared/types";

export default function SwapRequestsPage() {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const {
    swapRequests,
    getShiftById,
    getUserById,
    acceptSwapRequest,
    declineSwapRequest,
  } = useAppData();
  const [tab, setTab] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  if (!currentUser) {
    return null;
  }

  const outgoing = sortRequests(
    swapRequests.filter((request) => request.initiatorId === currentUser.id),
  );
  const incoming = sortRequests(
    swapRequests.filter((request) => request.respondentId === currentUser.id),
  );
  const visible = tab === 0 ? outgoing : incoming;

  function handleResult(result: OperationResult) {
    setErrorMessage(result.ok ? "" : result.error);
  }

  function partnerName(request: SwapRequest): string {
    const partnerId = tab === 0 ? request.respondentId : request.initiatorId;
    const partner = getUserById(partnerId);
    return partner ? partner.name : "-";
  }

  function givingShiftId(request: SwapRequest): string {
    return tab === 0 ? request.initiatorShiftId : request.respondentShiftId;
  }

  function receivingShiftId(request: SwapRequest): string {
    return tab === 0 ? request.respondentShiftId : request.initiatorShiftId;
  }

  function shiftText(shiftId: string): string {
    const shift = getShiftById(shiftId);
    return shift ? formatShift(shift) : "-";
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">
        Запросы обмена
      </Typography>
      {searchParams.get("created") === "1" ? (
        <Alert severity="success">Запрос отправлен</Alert>
      ) : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      <Paper>
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)}>
          <Tab label="Исходящие" />
          <Tab label="Входящие" />
        </Tabs>
      </Paper>
      {visible.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>Нет запросов</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Создан</TableCell>
                <TableCell>{tab === 0 ? "Кому" : "От кого"}</TableCell>
                <TableCell>Вы отдаёте</TableCell>
                <TableCell>Вы получаете</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{formatDateTime(request.createdAt)}</TableCell>
                  <TableCell>{partnerName(request)}</TableCell>
                  <TableCell>{shiftText(givingShiftId(request))}</TableCell>
                  <TableCell>{shiftText(receivingShiftId(request))}</TableCell>
                  <TableCell>
                    <StatusChip kind="request" status={request.status} />
                  </TableCell>
                  <TableCell>
                    {tab === 1 && request.status === "sent" ? (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            handleResult(acceptSwapRequest(request.id))
                          }
                        >
                          Принять
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            handleResult(declineSwapRequest(request.id))
                          }
                        >
                          Отклонить
                        </Button>
                      </Stack>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
