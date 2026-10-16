import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useAppData } from "../app/AppDataContext";
import { formatDateTime, formatShift } from "../shared/utils";
import type { SwapRequest } from "../shared/types";
import StatusChip from "./StatusChip";

interface SwapRequestCardProps {
  request: SwapRequest;
  actions?: ReactNode;
}

export default function SwapRequestCard({
  request,
  actions,
}: SwapRequestCardProps) {
  const { getShiftById, getUserById } = useAppData();
  const initiator = getUserById(request.initiatorId);
  const respondent = getUserById(request.respondentId);
  const initiatorShift = getShiftById(request.initiatorShiftId);
  const respondentShift = getShiftById(request.respondentShiftId);

  if (!initiator || !respondent || !initiatorShift || !respondentShift) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>Данные запроса недоступны</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="h6" component="h3">
            {initiator.name} и {respondent.name}
          </Typography>
          <StatusChip kind="request" status={request.status} />
        </Stack>
        <Typography>
          {initiator.name}: {formatShift(initiatorShift)}
        </Typography>
        <Typography>
          {respondent.name}: {formatShift(respondentShift)}
        </Typography>
        <Typography variant="body2">
          Создан: {formatDateTime(request.createdAt)}
        </Typography>
        {request.reason ? (
          <Typography variant="body2">Причина: {request.reason}</Typography>
        ) : null}
        {actions}
      </Stack>
    </Paper>
  );
}
