import { useState } from "react";
import type { ReactNode } from "react";
import { mockShifts, mockSwapRequests, mockUsers } from "../data/mockData";
import { isShiftFree } from "../shared/utils";
import type {
  OperationResult,
  Shift,
  SwapRequest,
  SwapRequestStatus,
} from "../types";
import { AppDataContext } from "./AppDataContext";
import type { AppDataContextValue } from "./AppDataContext";
import { useAuth } from "./AuthContext";

interface AppDataProviderProps {
  children: ReactNode;
}

const success: OperationResult = { ok: true };

function fail(error: string): OperationResult {
  return { ok: false, error };
}

export default function AppDataProvider({ children }: AppDataProviderProps) {
  const { currentUser } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [swapRequests, setSwapRequests] =
    useState<SwapRequest[]>(mockSwapRequests);

  function getUserById(id: string) {
    return mockUsers.find((user) => user.id === id);
  }

  function getShiftById(id: string) {
    return shifts.find((shift) => shift.id === id);
  }

  function updateRequestStatus(requestId: string, status: SwapRequestStatus) {
    setSwapRequests(
      swapRequests.map(
        (item): SwapRequest =>
          item.id === requestId ? { ...item, status } : item,
      ),
    );
  }

  function releaseShifts(request: SwapRequest, swapOwners: boolean) {
    setShifts(
      shifts.map((shift): Shift => {
        if (shift.id === request.initiatorShiftId) {
          return {
            ...shift,
            status: "approved",
            userId: swapOwners ? request.respondentId : shift.userId,
          };
        }
        if (shift.id === request.respondentShiftId) {
          return {
            ...shift,
            status: "approved",
            userId: swapOwners ? request.initiatorId : shift.userId,
          };
        }
        return shift;
      }),
    );
  }

  function createSwapRequest(
    initiatorShiftId: string,
    respondentShiftId: string,
  ): OperationResult {
    if (!currentUser) {
      return fail("Нужно войти в систему");
    }
    const initiatorShift = getShiftById(initiatorShiftId);
    const respondentShift = getShiftById(respondentShiftId);
    if (!initiatorShift || !respondentShift) {
      return fail("Смена не найдена");
    }
    if (initiatorShift.userId !== currentUser.id) {
      return fail("Обмен можно начать только со своей смены");
    }
    if (respondentShift.userId === currentUser.id) {
      return fail("Нельзя обменяться со своей же сменой");
    }
    if (
      !isShiftFree(initiatorShift, swapRequests) ||
      !isShiftFree(respondentShift, swapRequests)
    ) {
      return fail("Одна из смен уже участвует в обмене");
    }
    const request: SwapRequest = {
      id: `req-${swapRequests.length + 1}`,
      initiatorId: currentUser.id,
      respondentId: respondentShift.userId,
      initiatorShiftId,
      respondentShiftId,
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    setSwapRequests([...swapRequests, request]);
    setShifts(
      shifts.map(
        (shift): Shift =>
          shift.id === initiatorShiftId || shift.id === respondentShiftId
            ? { ...shift, status: "on_exchange" }
            : shift,
      ),
    );
    return success;
  }

  function respondToRequest(requestId: string, accept: boolean): OperationResult {
    if (!currentUser) {
      return fail("Нужно войти в систему");
    }
    const request = swapRequests.find((item) => item.id === requestId);
    if (!request) {
      return fail("Запрос не найден");
    }
    if (request.status !== "sent") {
      return fail("Запрос уже обработан");
    }
    if (request.respondentId !== currentUser.id) {
      return fail("Отвечать на запрос может только адресат");
    }
    if (accept) {
      updateRequestStatus(requestId, "waiting_senior");
    } else {
      updateRequestStatus(requestId, "declined");
      releaseShifts(request, false);
    }
    return success;
  }

  function decideAsSenior(requestId: string, approve: boolean): OperationResult {
    if (!currentUser || currentUser.role !== "SENIOR") {
      return fail("Решение может принять только старший");
    }
    const request = swapRequests.find((item) => item.id === requestId);
    if (!request) {
      return fail("Запрос не найден");
    }
    if (request.status !== "waiting_senior") {
      return fail("Запрос не ожидает решения старшего");
    }
    if (
      request.initiatorId === currentUser.id ||
      request.respondentId === currentUser.id
    ) {
      return fail("Нельзя принимать решение по собственному запросу");
    }
    updateRequestStatus(requestId, approve ? "approved" : "declined");
    releaseShifts(request, approve);
    return success;
  }

  const value: AppDataContextValue = {
    users: mockUsers,
    shifts,
    swapRequests,
    getUserById,
    getShiftById,
    createSwapRequest,
    acceptSwapRequest: (requestId) => respondToRequest(requestId, true),
    declineSwapRequest: (requestId) => respondToRequest(requestId, false),
    approveSwapRequestAsSenior: (requestId) => decideAsSenior(requestId, true),
    declineSwapRequestAsSenior: (requestId) => decideAsSenior(requestId, false),
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}
