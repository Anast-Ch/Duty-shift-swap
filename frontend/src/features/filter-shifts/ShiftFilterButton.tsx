import { useState } from "react";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import SvgIcon from "@mui/material/SvgIcon";
import type { User } from "../../shared/types";
import ShiftFilterFields from "./ShiftFilterFields";
import { countActiveFilters, emptyShiftFilters } from "./shiftFilters";
import type { ShiftFilters } from "./shiftFilters";

function FilterIcon() {
  return (
    <SvgIcon>
      <path d="M3 4h18l-7 8v8l-4-2v-6z" />
    </SvgIcon>
  );
}

interface ShiftFilterButtonProps {
  filters: ShiftFilters;
  onApply: (filters: ShiftFilters) => void;
  users: User[];
  dates: string[];
}

export default function ShiftFilterButton({
  filters,
  onApply,
  users,
  dates,
}: ShiftFilterButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<ShiftFilters>(filters);

  const activeCount = countActiveFilters(filters);

  function handleClose() {
    setAnchorEl(null);
  }

  function handleApply() {
    onApply(draft);
    handleClose();
  }

  function handleReset() {
    onApply(emptyShiftFilters);
    handleClose();
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FilterIcon />}
        onClick={(event) => {
          setDraft(filters);
          setAnchorEl(event.currentTarget);
        }}
      >
        {activeCount > 0 ? `Фильтры · ${activeCount}` : "Фильтры"}
      </Button>
      <Popover
        open={anchorEl !== null}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { p: 2, width: 300, mt: 1 } } }}
      >
        <Stack spacing={2}>
          <ShiftFilterFields
            layout="column"
            showStatus
            filters={draft}
            onChange={setDraft}
            users={users}
            dates={dates}
          />
          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
            <Button variant="text" onClick={handleReset}>
              Сбросить
            </Button>
            <Button variant="contained" onClick={handleApply}>
              Применить
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}
