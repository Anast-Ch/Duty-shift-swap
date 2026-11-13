import Chip from "@mui/material/Chip";
import { alpha, darken } from "@mui/material/styles";
import { shiftStatusLabels, swapStatusLabels } from "../utils";
import type { ShiftStatus, SwapRequestStatus } from "../types";

export const declinedColor = "#9B4343";

type StatusChipProps =
  | { kind: "shift"; status: ShiftStatus }
  | { kind: "request"; status: SwapRequestStatus };

const statusColors: Record<ShiftStatus | SwapRequestStatus, string> = {
  approved: "#5C8A3A",
  on_exchange: "#D96C3A",
  sent: "#6B705C",
  waiting_senior: "#D96C3A",
  declined: declinedColor,
};

export default function StatusChip(props: StatusChipProps) {
  const label =
    props.kind === "shift"
      ? shiftStatusLabels[props.status]
      : swapStatusLabels[props.status];

  const color = statusColors[props.status];

  return (
    <Chip
      label={label}
      sx={{
        bgcolor: alpha(color, 0.12),
        color: darken(color, 0.25),
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: color,
        fontWeight: 600,
        transition:
          "background-color 0.2s, color 0.2s, border-color 0.2s",
      }}
    />
  );
}
