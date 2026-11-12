import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface EmptyStateProps {
  text: string;
  action?: ReactNode;
}

export default function EmptyState({ text, action }: EmptyStateProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography>{text}</Typography>
        {action}
      </Stack>
    </Paper>
  );
}
