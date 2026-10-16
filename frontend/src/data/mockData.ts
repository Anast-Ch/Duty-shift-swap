import type { Shift, SwapRequest, User } from "../types";

export const DEMO_PASSWORD = "password";

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Петрова Вера",
    email: "pv@company.ru",
    role: "EMPLOYEE",
  },
  {
    id: "u2",
    name: "Иванов Игорь",
    email: "iv@company.ru",
    role: "SENIOR",
  },
  {
    id: "u3",
    name: "Сидоров Алексей",
    email: "sa@company.ru",
    role: "EMPLOYEE",
  },
  {
    id: "u4",
    name: "Кузнецова Мария",
    email: "km@company.ru",
    role: "EMPLOYEE",
  },
];

export const mockShifts: Shift[] = [
  {
    id: "sh1",
    userId: "u1",
    date: "2026-10-20",
    startTime: "08:00",
    endTime: "16:00",
    status: "on_exchange",
  },
  {
    id: "sh2",
    userId: "u2",
    date: "2026-10-20",
    startTime: "16:00",
    endTime: "00:00",
    status: "approved",
  },
  {
    id: "sh3",
    userId: "u3",
    date: "2026-10-21",
    startTime: "08:00",
    endTime: "16:00",
    status: "on_exchange",
  },
  {
    id: "sh4",
    userId: "u4",
    date: "2026-10-21",
    startTime: "16:00",
    endTime: "00:00",
    status: "approved",
  },
  {
    id: "sh5",
    userId: "u1",
    date: "2026-10-22",
    startTime: "08:00",
    endTime: "16:00",
    status: "approved",
  },
];

export const mockSwapRequests: SwapRequest[] = [
  {
    id: "req-1",
    initiatorId: "u1",
    respondentId: "u3",
    initiatorShiftId: "sh1",
    respondentShiftId: "sh3",
    status: "waiting_senior",
    createdAt: "2026-10-15T09:30:00.000Z",
  },
  {
    id: "req-2",
    initiatorId: "u4",
    respondentId: "u1",
    initiatorShiftId: "sh4",
    respondentShiftId: "sh5",
    status: "declined",
    createdAt: "2026-10-14T12:10:00.000Z",
  },
  {
    id: "req-3",
    initiatorId: "u2",
    respondentId: "u4",
    initiatorShiftId: "sh2",
    respondentShiftId: "sh4",
    status: "declined",
    createdAt: "2026-10-13T08:00:00.000Z",
  },
];
