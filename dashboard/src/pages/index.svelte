<script lang="ts">
  import spinnerUrl from "../elements/spinner.svg";
  import api from "../utils/api";
  import Login from "./login.svelte";
  import Dashboard from "./dashboard.svelte";
  import { User, userStore } from "../stores";
  import { onMount } from "svelte";

  let loading = true;
  const spinner = spinnerUrl;

  let Page = Login;

  onMount(async () => {
    const { user } = await api.get<User>("/account").catch((err) => {
      console.error(err);
      return {} as any;
    });
    loading = false;
    if (user) userStore.set(user);
  });

  userStore.subscribe((user) => {
    if (user) Page = Dashboard;
    else Page = Login;
  });
</script>

{#if loading}
  <main>
    <img src={spinner} alt="Loading..." />
  </main>
{:else}
  <svelte:component this={Page} />
{/if}

<style>
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    text-align: center;
  }
</style>
