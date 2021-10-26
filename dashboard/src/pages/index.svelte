<script lang="ts">
  import Login from "./login.svelte";
  let path = document.location.pathname;

  const routes = {
    "/": Login,
    "/login": Login,
  };
  $: Page = routes[path];
</script>

<svelte:component this={Page} />
