import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DangerButton from "../../shared/ui/DangerButton";
import { formatShift } from "../../shared/utils";
import type { Shift, User } from "../../shared/types";
import { validateShift } from "./validateShift";
import type { ShiftErrors } from "./validateShift";

export type DialogMode = "add" | "edit" | "delete";

const dialogTitles: Record<DialogMode, string> = {
  add: "Добавить смену",
  edit: "Редактировать смену",
  delete: "Удалить смену",
};

const dialogActions: Record<DialogMode, string> = {
  add: "Добавить",
  edit: "Сохранить",
  delete: "Удалить",
};

interface ShiftFormDialogProps {
  mode: DialogMode;
  shift: Shift | null;
  users: User[];
  onClose: () => void;
}

export function ShiftFormDialog({
  mode,
  shift,
  users,
  onClose,
}: ShiftFormDialogProps) {
  const [userId, setUserId] = useState(shift ? shift.userId : "");
  const [date, setDate] = useState(shift ? shift.date : "");
  const [startTime, setStartTime] = useState(shift ? shift.startTime : "");
  const [endTime, setEndTime] = useState(shift ? shift.endTime : "");
  const [errors, setErrors] = useState<ShiftErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  function handleSave() {
    if (isSubmitting) return;

    const validationErrors = validateShift({ userId, date, startTime, endTime });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      onClose();
    }, 500);
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slots={{ transition: Grow }}
    >
      <DialogTitle>{dialogTitles[mode]}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {mode === "delete" ? (
            <Typography>
              {shift ? `Смена: ${formatShift(shift)}` : "Смена не выбрана"}
            </Typography>
          ) : (
            <>
              <TextField
                select
                label="Сотрудник"
                value={userId}
                onChange={(event) => {
                  setUserId(event.target.value);
                  setErrors((prev) => ({ ...prev, userId: undefined }));
                }}
                error={Boolean(errors.userId)}
                helperText={errors.userId}
                fullWidth
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Дата (ГГГГ-ММ-ДД)"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                error={Boolean(errors.date)}
                helperText={errors.date}
                fullWidth
              />
              <TextField
                label="Начало (ЧЧ:ММ)"
                value={startTime}
                onChange={(event) => {
                  setStartTime(event.target.value);
                  setErrors((prev) => ({ ...prev, startTime: undefined }));
                }}
                error={Boolean(errors.startTime)}
                helperText={errors.startTime}
                fullWidth
              />
              <TextField
                label="Конец (ЧЧ:ММ)"
                value={endTime}
                onChange={(event) => {
                  setEndTime(event.target.value);
                  setErrors((prev) => ({ ...prev, endTime: undefined }));
                }}
                error={Boolean(errors.endTime)}
                helperText={errors.endTime}
                fullWidth
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <DangerButton onClick={onClose}>Отмена</DangerButton>
        <Button
          variant={mode === "delete" ? "outlined" : "contained"}
          color={mode === "delete" ? "secondary" : "primary"}
          disabled={isSubmitting}
          onClick={mode === "delete" ? onClose : handleSave}
        >
          {isSubmitting ? "Сохраняем…" : dialogActions[mode]}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
