import Chip from "@mui/material/Chip";
import { shiftStatusLabels, swapStatusLabels } from "../utils";
import type { ShiftStatus, SwapRequestStatus } from "../types";

export const declinedColor = "#9B4343";

type StatusChipProps =
  | { kind: "shift"; status: ShiftStatus }
  | { kind: "request"; status: SwapRequestStatus };

const statusStyles: Record<
  ShiftStatus | SwapRequestStatus,
  { bgcolor: string; color: string }
> = {
  approved: {
    bgcolor: "#5C8A3A",
    color: "#F5E6D3",
  },
  on_exchange: {
    bgcolor: "#D96C3A",
    color: "#F5E6D3",
  },
  sent: {
    bgcolor: "#6B705C",
    color: "#F5E6D3",
  },
  waiting_senior: {
    bgcolor: "#D96C3A",
    color: "#F5E6D3",
  },
  declined: {
    bgcolor: declinedColor,
    color: "background.paper",
  },
};

export default function StatusChip(props: StatusChipProps) {
  const label =
    props.kind === "shift"
      ? shiftStatusLabels[props.status]
      : swapStatusLabels[props.status];

  const style = statusStyles[props.status];

  return (
    <Chip
      label={label}
      sx={{
        bgcolor: style.bgcolor,
        color: style.color,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "text.primary",
        fontWeight: 600,
        transition:
          "background-color 0.2s, color 0.2s, border-color 0.2s",
      }}
    />
  );
}
