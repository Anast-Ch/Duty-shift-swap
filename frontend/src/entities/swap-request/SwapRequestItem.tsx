import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import StatusChip from "../../shared/ui/StatusChip";
import {
  formatDate,
  formatDateTime,
  formatTimeRange,
  userNameOrDash,
} from "../../shared/utils";
import type { Shift, SwapRequest, User } from "../../shared/types";

interface ShiftBlockProps {
  label: string;
  shift: Shift;
}

function ShiftBlock({ label, shift }: ShiftBlockProps) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{formatDate(shift.date)}</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {formatTimeRange(shift.startTime, shift.endTime)}
      </Typography>
    </Box>
  );
}

interface SwapRequestItemProps {
  request: SwapRequest;
  direction: "outgoing" | "incoming";
  partner: User | undefined;
  givingShift: Shift | undefined;
  receivingShift: Shift | undefined;
  actions?: ReactNode;
}

export default function SwapRequestItem({
  request,
  direction,
  partner,
  givingShift,
  receivingShift,
  actions,
}: SwapRequestItemProps) {
  if (!givingShift || !receivingShift) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>Данные запроса недоступны</Typography>
      </Paper>
    );
  }

  const partnerLabel = direction === "outgoing" ? "Кому" : "От кого";

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
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          sx={{
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <ShiftBlock label="Вы отдаёте" shift={givingShift} />
          <Typography
            component="span"
            aria-hidden="true"
            sx={{ fontSize: "1.5rem", color: "text.secondary" }}
          >
            ⇌
          </Typography>
          <ShiftBlock label="Вы получаете" shift={receivingShift} />
        </Stack>
        <Stack
          direction="row"
          sx={{
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            columnGap: 1.5,
            rowGap: 0.75,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", textAlign: "center" }}
          >
            {`${partnerLabel}: ${userNameOrDash(partner)} • Создан: ${formatDateTime(request.createdAt)}`}
          </Typography>
          <StatusChip kind="request" status={request.status} />
        </Stack>
        {actions ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
            {actions}
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}
