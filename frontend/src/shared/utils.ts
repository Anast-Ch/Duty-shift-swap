import type {
  Role,
  Shift,
  ShiftStatus,
  SwapRequest,
  SwapRequestStatus,
} from "./types";

export const roleLabels: Record<Role, string> = {
  EMPLOYEE: "Сотрудник",
  SENIOR: "Старший",
};

export const shiftStatusLabels: Record<ShiftStatus, string> = {
  approved: "Подтверждена",
  on_exchange: "На обмене",
};

export const swapStatusLabels: Record<SwapRequestStatus, string> = {
  sent: "Отправлен",
  waiting_senior: "Ждёт старшего",
  approved: "Одобрен",
  declined: "Отклонён",
};

export function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

export function formatShift(shift: Shift): string {
  return `${formatDate(shift.date)}, ${formatTimeRange(shift.startTime, shift.endTime)}`;
}

export function getStatusColor(
  status: ShiftStatus | SwapRequestStatus,
): "primary" | "secondary" | "default" {
  if (status === "approved" || status === "sent") {
    return "primary";
  }
  if (status === "on_exchange" || status === "waiting_senior") {
    return "secondary";
  }
  return "default";
}

export function isActiveRequest(request: SwapRequest): boolean {
  return request.status === "sent" || request.status === "waiting_senior";
}

export function isShiftFree(shift: Shift, requests: SwapRequest[]): boolean {
  if (shift.status !== "approved") {
    return false;
  }
  return !requests.some(
    (request) =>
      isActiveRequest(request) &&
      (request.initiatorShiftId === shift.id ||
        request.respondentShiftId === shift.id),
  );
}

export function isUpcoming(shift: Shift): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return shift.date >= today;
}

export function sortShifts(shifts: Shift[]): Shift[] {
  return [...shifts].sort((a, b) =>
    (a.date + a.startTime).localeCompare(b.date + b.startTime),
  );
}

export function sortRequests(requests: SwapRequest[]): SwapRequest[] {
  return [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
