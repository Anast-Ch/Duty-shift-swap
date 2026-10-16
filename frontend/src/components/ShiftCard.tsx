import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatDate, formatTimeRange } from "../shared/utils";
import type { Shift } from "../types";
import StatusChip from "./StatusChip";

interface ShiftCardProps {
  shift: Shift;
  actions?: ReactNode;
}

export default function ShiftCard({ shift, actions }: ShiftCardProps) {
  return (
    <Paper sx={{ p: 2 }}>
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
