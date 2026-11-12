import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import DataState from "../shared/ui/DataState";
import SwapRequestItem from "../entities/swap-request/SwapRequestItem";
import { useAppData } from "../app/AppDataContext";
import { useAuth } from "../app/AuthContext";
import { useDemoLoad } from "../shared/hooks/useDemoLoad";
import { sortRequests } from "../shared/utils";
import type { OperationResult, SwapRequest } from "../shared/types";

export default function SwapRequestsPage() {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const {
    swapRequests,
    getShiftById,
    getUserById,
    acceptSwapRequest,
    declineSwapRequest,
  } = useAppData();
  const [tab, setTab] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const { status, forceEmpty, retry } = useDemoLoad();

  if (!currentUser) {
    return null;
  }

  const outgoing = sortRequests(
    swapRequests.filter((request) => request.initiatorId === currentUser.id),
  );
  const incoming = sortRequests(
    swapRequests.filter((request) => request.respondentId === currentUser.id),
  );
  const visible = tab === 0 ? outgoing : incoming;

  function handleResult(result: OperationResult) {
    setErrorMessage(result.ok ? "" : result.error);
  }

  function givingShiftId(request: SwapRequest): string {
    return tab === 0 ? request.initiatorShiftId : request.respondentShiftId;
  }

  function receivingShiftId(request: SwapRequest): string {
    return tab === 0 ? request.respondentShiftId : request.initiatorShiftId;
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 760, mx: "auto", width: "100%" }}>
      <Typography variant="h4" component="h1">
        Запросы обмена
      </Typography>
      {searchParams.get("created") === "1" ? (
        <Alert severity="success">Запрос отправлен</Alert>
      ) : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      <Paper>
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)}>
          <Tab label="Исходящие" />
          <Tab label="Входящие" />
        </Tabs>
      </Paper>
      <DataState
        status={status}
        isEmpty={forceEmpty || visible.length === 0}
        emptyText="Нет запросов"
        onRetry={retry}
      >
        <Stack spacing={2}>
          {visible.map((request) => {
            const partnerId =
              tab === 0 ? request.respondentId : request.initiatorId;
            return (
              <SwapRequestItem
                key={request.id}
                request={request}
                direction={tab === 0 ? "outgoing" : "incoming"}
                partner={getUserById(partnerId)}
                givingShift={getShiftById(givingShiftId(request))}
                receivingShift={getShiftById(receivingShiftId(request))}
                actions={
                  tab === 1 && request.status === "sent" ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() =>
                          handleResult(acceptSwapRequest(request.id))
                        }
                      >
                        Принять
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          handleResult(declineSwapRequest(request.id))
                        }
                      >
                        Отклонить
                      </Button>
                    </Stack>
                  ) : undefined
                }
              />
            );
          })}
        </Stack>
      </DataState>
    </Stack>
  );
}
