import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface EmptyStateProps {
  text: string;
  action?: ReactNode;
  inPanel?: boolean;
}

export default function EmptyState({ text, action, inPanel }: EmptyStateProps) {
  if (inPanel) {
    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography>{text}</Typography>
        {action}
      </Stack>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography>{text}</Typography>
        {action}
      </Stack>
    </Paper>
  );
}
