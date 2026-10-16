import Chip from "@mui/material/Chip";
import { shiftStatusLabels, swapStatusLabels } from "../shared/utils";
import type { ShiftStatus, SwapRequestStatus } from "../shared/types";

type StatusChipProps =
  | { kind: "shift"; status: ShiftStatus }
  | { kind: "request"; status: SwapRequestStatus };

const statusStyles: Record<
  ShiftStatus | SwapRequestStatus,
  { bgcolor: string; color: string; borderColor: string }
> = {
  approved: {
    bgcolor: "#5C8A3A",
    color: "#F5E6D3",
    borderColor: "#5C8A3A",
  },
  on_exchange: {
    bgcolor: "#A8C1D9",
    color: "#1A1A1A",
    borderColor: "#7A9BBB",
  },
  sent: {
    bgcolor: "#6B705C",
    color: "#F5E6D3",
    borderColor: "#6B705C",
  },
  waiting_senior: {
    bgcolor: "#D96C3A",
    color: "#F5E6D3",
    borderColor: "#D96C3A",
  },
  declined: {
    bgcolor: "transparent",
    color: "#1A1A1A",
    borderColor: "#1A1A1A",
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
        border: `1px solid ${style.borderColor}`,
        fontWeight: 600,
      }}
    />
  );
}
