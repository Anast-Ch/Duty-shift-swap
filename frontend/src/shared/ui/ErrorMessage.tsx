import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

interface ErrorMessageProps {
  onRetry: () => void;
}

export default function ErrorMessage({ onRetry }: ErrorMessageProps) {
  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          Повторить
        </Button>
      }
    >
      Не удалось загрузить данные
    </Alert>
  );
}
