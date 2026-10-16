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
  viewerId?: string;
  actions?: ReactNode;
}

export default function SwapRequestCard({
  request,
  viewerId,
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

  const viewerIsInitiator = viewerId === request.initiatorId;
  const partner = viewerIsInitiator ? respondent : initiator;
  const title = viewerId
    ? `Участник: ${partner.name}`
    : `${initiator.name} и ${respondent.name}`;
  const lines = viewerId
    ? [
        `Вы отдаёте: ${formatShift(viewerIsInitiator ? initiatorShift : respondentShift)}`,
        `Вы получаете: ${formatShift(viewerIsInitiator ? respondentShift : initiatorShift)}`,
      ]
    : [
        `${initiator.name} отдаёт: ${formatShift(initiatorShift)}`,
        `${respondent.name} отдаёт: ${formatShift(respondentShift)}`,
      ];

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          <StatusChip kind="request" status={request.status} />
        </Stack>
        {lines.map((line) => (
          <Typography key={line}>{line}</Typography>
        ))}
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
