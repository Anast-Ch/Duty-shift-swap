import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import DataState from "../shared/ui/DataState";
import StatusChip from "../shared/ui/StatusChip";
import { useAppData } from "../app/AppDataContext";
import { useAuth } from "../app/AuthContext";
import { useDemoLoad } from "../shared/hooks/useDemoLoad";
import { formatDate, formatTimeRange, isUpcoming, sortShifts } from "../shared/utils";

export default function MyShiftsPage() {
  const { currentUser } = useAuth();
  const { shifts } = useAppData();
  const { status, forceEmpty, retry } = useDemoLoad();

  if (!currentUser) {
    return null;
  }

  const myShifts = sortShifts(
    shifts.filter(
      (shift) => shift.userId === currentUser.id && isUpcoming(shift),
    ),
  );

  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">
        Мои смены
      </Typography>
      <DataState
        status={status}
        isEmpty={forceEmpty || myShifts.length === 0}
        emptyText="Смен нет"
        onRetry={retry}
      >
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Время</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myShifts.map((shift) => {
                const isOnExchange = shift.status === "on_exchange";
                return (
                  <TableRow key={shift.id}>
                    <TableCell>{formatDate(shift.date)}</TableCell>
                    <TableCell>
                      {formatTimeRange(shift.startTime, shift.endTime)}
                    </TableCell>
                    <TableCell>
                      <StatusChip kind="shift" status={shift.status} />
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DataState>
    </Stack>
  );
}
