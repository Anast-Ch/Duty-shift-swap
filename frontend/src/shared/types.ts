export type Role = "EMPLOYEE" | "SENIOR";

export type ShiftStatus = "approved" | "on_exchange";

export type SwapRequestStatus =
  | "sent"
  | "waiting_senior"
  | "approved"
  | "declined";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Shift {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
}

export interface SwapRequest {
  id: string;
  initiatorId: string;
  respondentId: string;
  initiatorShiftId: string;
  respondentShiftId: string;
  status: SwapRequestStatus;
  createdAt: string;
  reason?: string;
}

export type OperationResult =
  | { ok: true }
  | { ok: false; error: string };
