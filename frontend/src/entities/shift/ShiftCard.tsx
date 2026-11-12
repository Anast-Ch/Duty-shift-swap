import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatDate, formatTimeRange } from "../../shared/utils";
import type { Shift } from "../../shared/types";
import StatusChip from "../../shared/ui/StatusChip";

interface ShiftCardProps {
  shift: Shift;
  actions?: ReactNode;
}

export default function ShiftCard({ shift, actions }: ShiftCardProps) {
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
            {formatDate(shift.date)}
          </Typography>
          <StatusChip kind="shift" status={shift.status} />
        </Stack>
        <Typography>{formatTimeRange(shift.startTime, shift.endTime)}</Typography>
        {actions}
      </Stack>
    </Paper>
  );
}
