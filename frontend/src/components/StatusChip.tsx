import Chip from "@mui/material/Chip";
import {
  getStatusColor,
  shiftStatusLabels,
  swapStatusLabels,
} from "../shared/utils";
import type { ShiftStatus, SwapRequestStatus } from "../types";

type StatusChipProps =
  | { kind: "shift"; status: ShiftStatus }
  | { kind: "request"; status: SwapRequestStatus };

export default function StatusChip(props: StatusChipProps) {
  const label =
    props.kind === "shift"
      ? shiftStatusLabels[props.status]
      : swapStatusLabels[props.status];

  return (
    <Chip
      label={label}
      color={getStatusColor(props.status)}
      variant={props.status === "approved" ? "filled" : "outlined"}
    />
  );
}
