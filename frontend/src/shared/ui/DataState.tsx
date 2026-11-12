import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import type { LoadStatus } from "../hooks/useDemoLoad";
import EmptyState from "./EmptyState";
import ErrorMessage from "./ErrorMessage";
import FadeIn from "./FadeIn";
import Spinner from "./Spinner";

interface DataStateProps {
  status: LoadStatus;
  isEmpty: boolean;
  emptyText: string;
  emptyAction?: ReactNode;
  onRetry: () => void;
  inPanel?: boolean;
  children: ReactNode;
}

export default function DataState({
  status,
  isEmpty,
  emptyText,
  emptyAction,
  onRetry,
  inPanel = false,
  children,
}: DataStateProps) {
  if (status === "loading") {
    return <Spinner />;
  }
  if (status === "error") {
    return inPanel ? (
      <Box sx={{ p: 2 }}>
        <ErrorMessage onRetry={onRetry} />
      </Box>
    ) : (
      <ErrorMessage onRetry={onRetry} />
    );
  }
  if (isEmpty) {
    return (
      <EmptyState text={emptyText} action={emptyAction} inPanel={inPanel} />
    );
  }
  return <FadeIn>{children}</FadeIn>;
}
