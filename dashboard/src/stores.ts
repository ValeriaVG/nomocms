import { writable } from "svelte/store";

export interface User {
  id: string;
  email: string;
}
export type Theme = "dark" | "light";

export const userStore = writable<User | null>(null);
export const themeStore = writable<Theme>(null);
export const pathStore = writable<string>(document.location.href);
