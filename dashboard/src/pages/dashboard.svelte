<script lang="ts">
  import { userStore } from "../stores";
  import api from "../utils/api";
  let user = { email: "" };
  userStore.subscribe((currentUser) => {
    user = currentUser;
  });
  const logout = async () => {
    await api.delete("/account/login");
    userStore.set(null);
  };
</script>

<main>
  <h1>Welcome,{user.email}</h1>
  <button on:click={logout}>Logout</button>
</main>
