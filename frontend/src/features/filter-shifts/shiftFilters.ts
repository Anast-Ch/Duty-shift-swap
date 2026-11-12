import type { Shift, ShiftStatus, User } from "../../shared/types";

export interface ShiftFilters {
  userId: string;
  date: string;
  status: "" | ShiftStatus;
}

export const emptyShiftFilters: ShiftFilters = {
  userId: "",
  date: "",
  status: "",
};

export function applyShiftFilters(
  shifts: Shift[],
  filters: ShiftFilters,
): Shift[] {
  return shifts.filter(
    (shift) =>
      (filters.userId === "" || shift.userId === filters.userId) &&
      (filters.date === "" || shift.date === filters.date) &&
      (filters.status === "" || shift.status === filters.status),
  );
}

export function countActiveFilters(filters: ShiftFilters): number {
  return [filters.userId, filters.date, filters.status].filter(
    (value) => value !== "",
  ).length;
}

export function getShiftDates(shifts: Shift[]): string[] {
  return Array.from(new Set(shifts.map((shift) => shift.date))).sort();
}

export function getShiftUsers(shifts: Shift[], users: User[]): User[] {
  const userIds = new Set(shifts.map((shift) => shift.userId));
  return users
    .filter((user) => userIds.has(user.id))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}
