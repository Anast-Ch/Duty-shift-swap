import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatShift } from "../shared/utils";
import type { Shift } from "../types";

interface ComparisonModalProps {
  myShift: Shift;
  otherShift: Shift;
  errorMessage: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ComparisonModal({
  myShift,
  otherShift,
  errorMessage,
  onConfirm,
  onClose,
}: ComparisonModalProps) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Сравнение обмена</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
              Вы отдаёте
            </Typography>
            <Typography>{formatShift(myShift)}</Typography>
          </Stack>
          <Divider />
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
              Вы получаете
            </Typography>
            <Typography>{formatShift(otherShift)}</Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={onConfirm}>
          Отправить запрос
        </Button>
      </DialogActions>
    </Dialog>
  );
}
