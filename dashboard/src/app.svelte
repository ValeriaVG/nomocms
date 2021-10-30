<script>
  import Layout from "./layout.svelte";
  import Pages from "./pages/index.svelte";
  import Switch from "./elements/switch.svelte";
  import { onMount } from "svelte";
  import { themeStore } from "./stores";

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
  };

  let theme = "dark";
  themeStore.subscribe((newTheme) => {
    document.querySelector("html").setAttribute("data-theme", newTheme);
    theme = newTheme;
  });
</script>

<Layout>
  <div class="switch">
    <Switch
      on:change={setTheme}
      checked={theme === "dark"}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >{theme === "dark" ? "🌙" : "☀️"}</Switch
    >
  </div>
  <Pages />
</Layout>

<style>
  .switch {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
</style>
