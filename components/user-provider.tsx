"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { api } from "@/lib/api-client";
import type { EmployeeWithCount } from "@/lib/types";

const STORAGE_KEY = "shift-scheduler-user";
const USER_CHANGE_EVENT = "shift-scheduler-user-change";
export const MANAGER = "manager";

function subscribeToUser(callback: () => void) {
  window.addEventListener(USER_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(USER_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

type UserContextValue = {
  employees: EmployeeWithCount[];
  currentUserId: string;
  currentEmployee: EmployeeWithCount | null;
  isManager: boolean;
  selectUser: (id: string) => void;
  refreshEmployees: () => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<EmployeeWithCount[]>([]);

  // localStorage is the source of truth; MANAGER is the server-render fallback
  const currentUserId = useSyncExternalStore(
    subscribeToUser,
    () => localStorage.getItem(STORAGE_KEY) ?? MANAGER,
    () => MANAGER
  );

  const refreshEmployees = useCallback(() => {
    api<EmployeeWithCount[]>("/api/employees").then(setEmployees);
  }, []);

  useEffect(() => {
    refreshEmployees();
  }, [refreshEmployees]);

  const selectUser = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new Event(USER_CHANGE_EVENT));
  }, []);

  const currentEmployee =
    employees.find((e) => e.id === currentUserId) ?? null;

  return (
    <UserContext.Provider
      value={{
        employees,
        currentUserId,
        currentEmployee,
        isManager: currentUserId === MANAGER,
        selectUser,
        refreshEmployees,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
