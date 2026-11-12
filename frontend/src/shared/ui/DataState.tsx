import type { ReactNode } from "react";
import type { LoadStatus } from "../hooks/useDemoLoad";
import EmptyState from "./EmptyState";
import ErrorMessage from "./ErrorMessage";
import Spinner from "./Spinner";

interface DataStateProps {
  status: LoadStatus;
  isEmpty: boolean;
  emptyText: string;
  emptyAction?: ReactNode;
  onRetry: () => void;
  children: ReactNode;
}

export default function DataState({
  status,
  isEmpty,
  emptyText,
  emptyAction,
  onRetry,
  children,
}: DataStateProps) {
  if (status === "loading") {
    return <Spinner />;
  }
  if (status === "error") {
    return <ErrorMessage onRetry={onRetry} />;
  }
  if (isEmpty) {
    return <EmptyState text={emptyText} action={emptyAction} />;
  }
  return <>{children}</>;
}
