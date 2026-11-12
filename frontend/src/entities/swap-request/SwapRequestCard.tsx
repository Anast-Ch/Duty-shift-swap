import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatDateTime, formatShift } from "../../shared/utils";
import type { Shift, SwapRequest, User } from "../../shared/types";
import StatusChip from "../../shared/ui/StatusChip";

interface SwapRequestCardProps {
  request: SwapRequest;
  initiator: User | undefined;
  respondent: User | undefined;
  initiatorShift: Shift | undefined;
  respondentShift: Shift | undefined;
  actions?: ReactNode;
}

export default function SwapRequestCard({
  request,
  initiator,
  respondent,
  initiatorShift,
  respondentShift,
  actions,
}: SwapRequestCardProps) {
  if (!initiator || !respondent || !initiatorShift || !respondentShift) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>Данные запроса недоступны</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 2,
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(26,26,26,0.12)",
          transform: "translateY(-2px)",
        },
      }}
    >
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
