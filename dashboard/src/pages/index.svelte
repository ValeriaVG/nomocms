<script lang="ts">
  import api from "../utils/api";

  import Login from "./login.svelte";
  let path = document.location.pathname;

  const routes = {
    "/": Login,
    "/login": Login,
  };
  $: Page = routes[path];

  api.get("/login").then(console.log);
</script>

<svelte:component this={Page} />
