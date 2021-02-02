import { createContext } from "react";

export type AccessInfo = {
  canAccessDashboard: boolean;
  user?: { name?: string; email?: string };
  token?: string;
};
export const AccessContext = createContext<{
  access?: AccessInfo;
  setAccess: (access?: AccessInfo) => void;
}>({
  access: undefined,
  setAccess: () => {},
});
