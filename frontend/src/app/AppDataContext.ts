import { createContext, useContext } from "react";
import type { OperationResult, Shift, SwapRequest, User } from "../shared/types";

export interface AppDataContextValue {
  users: User[];
  shifts: Shift[];
  swapRequests: SwapRequest[];
  getUserById: (id: string) => User | undefined;
  getShiftById: (id: string) => Shift | undefined;
  createSwapRequest: (
    initiatorShiftId: string,
    respondentShiftId: string,
  ) => OperationResult;
  acceptSwapRequest: (requestId: string) => OperationResult;
  declineSwapRequest: (requestId: string) => OperationResult;
  approveSwapRequestAsSenior: (requestId: string) => OperationResult;
  declineSwapRequestAsSenior: (requestId: string) => OperationResult;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);

export function useAppData(): AppDataContextValue {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }
  return value;
}
