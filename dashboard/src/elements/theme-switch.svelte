<script>
  import Switch from "./switch.svelte";
  import { onMount } from "svelte";
  import { themeStore } from "../stores";

  onMount(() => {
    const theme =
      localStorage.getItem("theme") ||
      (window.matchMedia &&
        window.matchMedia("prefers-color-scheme: light").matches &&
        "light") ||
      "dark";
    themeStore.set(theme);
  });

  const setTheme = ({ detail: { isDark } }) => {
    const theme = isDark ? "dark" : "light";
    themeStore.set(theme);
    localStorage.setItem("theme", theme);
  };

  let theme = "dark";
  themeStore.subscribe((newTheme) => {
    document.querySelector("html").setAttribute("data-theme", newTheme);
    theme = newTheme;
  });
</script>

<Switch
  on:change={setTheme}
  checked={theme === "dark"}
  title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
  >{theme === "dark" ? "🌙" : "☀️"}</Switch
>
