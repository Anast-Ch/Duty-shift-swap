import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ApiError,
  TOKENS_KEY,
  clearTokens,
  currentUserRequest,
  loginRequest,
  logoutRequest,
  readTokens,
  refreshRequest,
  saveTokens,
} from "../features/auth/authApi";
import type { User } from "../shared/types";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<string | null>(null);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const operation = useRef(0);

  useEffect(() => {
    const controller = new AbortController();

    async function restore() {
      let refreshToken: string | undefined;
      try {
        const tokens = readTokens();
        if (!tokens) {
          setCurrentUser(null);
          setStatus("ready");
          return;
        }

        refreshToken = tokens.refreshToken;
        let accessToken = tokens.accessToken;
        let user: User;
        try {
          user = await currentUserRequest(accessToken, controller.signal);
        } catch (error) {
          if (!(error instanceof ApiError) || error.status !== 401) throw error;
          accessToken = await refreshRequest(tokens.refreshToken, controller.signal);
          user = await currentUserRequest(accessToken, controller.signal);
        }

        if (controller.signal.aborted || readTokens()?.refreshToken !== tokens.refreshToken) return;
        if (accessToken !== tokens.accessToken) {
          saveTokens({ ...tokens, accessToken });
        }
        setCurrentUser(user);
        setStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          if (readTokens()?.refreshToken !== refreshToken) return;
          clearTokens();
          setCurrentUser(null);
          setNotice("Сессия недействительна или истекла. Войдите снова.");
          setStatus("ready");
        } else {
          setStatus("error");
        }
      }
    }

    void restore();
    return () => controller.abort();
  }, [restoreAttempt]);

  useEffect(() => {
    function syncSession(event: StorageEvent) {
      if (event.key !== TOKENS_KEY && event.key !== null) return;
      operation.current += 1;
      setCurrentUser(null);
      setStatus("loading");
      setRestoreAttempt((value) => value + 1);
    }
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const currentOperation = ++operation.current;
    setNotice(null);
    const tokens = await loginRequest(email.trim(), password);
    try {
      const user = await currentUserRequest(tokens.accessToken);
      if (currentOperation !== operation.current) {
        throw new Error("Сессия изменилась во время входа");
      }
      saveTokens(tokens);
      setCurrentUser(user);
      setStatus("ready");
    } catch {
      try {
        await logoutRequest(tokens.refreshToken);
      } catch {
        throw new Error("Не удалось подтвердить вход или отзыв сессии на сервере.");
      }
      throw new Error("Не удалось подтвердить вход. Попробуйте ещё раз.");
    }
  }

  async function logout(): Promise<void> {
    const currentOperation = ++operation.current;
    const tokens = readTokens();
    clearTokens();
    setCurrentUser(null);
    setStatus("ready");
    setNotice(null);
    if (!tokens) return;
    try {
      await logoutRequest(tokens.refreshToken);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      if (currentOperation === operation.current) {
        setNotice("Не удалось подтвердить выход на сервере. Сессия может оставаться активной до окончания её срока.");
      }
    }
  }

  function retry() {
    setStatus("loading");
    setRestoreAttempt((value) => value + 1);
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, status, notice, login, logout, retry, clearNotice: () => setNotice(null) }}
    >
      {children}
    </AuthContext.Provider>
  );
}
