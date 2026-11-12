import { useId } from "react";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { formatDate, shiftStatusLabels } from "../../shared/utils";
import type { User } from "../../shared/types";
import type { ShiftFilters } from "./shiftFilters";

interface ShiftFilterFieldsProps {
  filters: ShiftFilters;
  onChange: (filters: ShiftFilters) => void;
  users: User[];
  dates: string[];
  showStatus: boolean;
  layout: "column" | "row";
}

function toStatus(value: string): ShiftFilters["status"] {
  return value === "approved" || value === "on_exchange" ? value : "";
}

export default function ShiftFilterFields({
  filters,
  onChange,
  users,
  dates,
  showStatus,
  layout,
}: ShiftFilterFieldsProps) {
  const baseId = useId();

  return (
    <Stack
      spacing={2}
      direction={layout === "column" ? "column" : { xs: "column", sm: "row" }}
    >
      <TextField
        select
        size="small"
        fullWidth
        id={`${baseId}-user`}
        label="Сотрудник"
        value={filters.userId}
        onChange={(event) =>
          onChange({ ...filters, userId: event.target.value })
        }
        slotProps={{
          select: { displayEmpty: true },
          inputLabel: { shrink: true },
        }}
      >
        <MenuItem value="">Все сотрудники</MenuItem>
        {users.map((user) => (
          <MenuItem key={user.id} value={user.id}>
            {user.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        fullWidth
        id={`${baseId}-date`}
        label="Дата"
        value={filters.date}
        onChange={(event) => onChange({ ...filters, date: event.target.value })}
        slotProps={{
          select: { displayEmpty: true },
          inputLabel: { shrink: true },
        }}
      >
        <MenuItem value="">Все даты</MenuItem>
        {dates.map((date) => (
          <MenuItem key={date} value={date}>
            {formatDate(date)}
          </MenuItem>
        ))}
      </TextField>
      {showStatus ? (
        <TextField
          select
          size="small"
          fullWidth
          id={`${baseId}-status`}
          label="Статус"
          value={filters.status}
          onChange={(event) =>
            onChange({ ...filters, status: toStatus(event.target.value) })
          }
          slotProps={{
            select: { displayEmpty: true },
            inputLabel: { shrink: true },
          }}
        >
          <MenuItem value="">Все статусы</MenuItem>
          <MenuItem value="approved">{shiftStatusLabels.approved}</MenuItem>
          <MenuItem value="on_exchange">{shiftStatusLabels.on_exchange}</MenuItem>
        </TextField>
      ) : null}
    </Stack>
  );
}
