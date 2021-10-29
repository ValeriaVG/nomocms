export interface User {
  id: string;
  email: string;
  isSuperUser?: boolean;
}

export interface AccountSettings {
  email: string;
  password: string;
}
