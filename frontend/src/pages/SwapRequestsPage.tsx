import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import SwapRequestCard from "../components/SwapRequestCard";
import { useAppData } from "../app/AppDataContext";
import { useAuth } from "../app/AuthContext";
import { sortRequests } from "../shared/utils";
import type { OperationResult } from "../shared/types";

export default function SwapRequestsPage() {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { swapRequests, acceptSwapRequest, declineSwapRequest } = useAppData();
  const [tab, setTab] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  if (!currentUser) {
    return null;
  }

  const outgoing = sortRequests(
    swapRequests.filter((request) => request.initiatorId === currentUser.id),
  );
  const incoming = sortRequests(
    swapRequests.filter((request) => request.respondentId === currentUser.id),
  );
  const visibleRequests = tab === 0 ? outgoing : incoming;

  function handleResult(result: OperationResult) {
    setErrorMessage(result.ok ? "" : result.error);
  }

  return (
    <Stack spacing={2}>
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
      {visibleRequests.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>Нет запросов</Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          }}
        >
          {visibleRequests.map((request) => (
            <SwapRequestCard
              key={request.id}
              request={request}
              viewerId={currentUser.id}
              actions={
                tab === 1 && request.status === "sent" ? (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={() => handleResult(acceptSwapRequest(request.id))}
                    >
                      Принять
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleResult(declineSwapRequest(request.id))}
                    >
                      Отклонить
                    </Button>
                  </Stack>
                ) : null
              }
            />
          ))}
        </Box>
      )}
    </Stack>
  );
}
