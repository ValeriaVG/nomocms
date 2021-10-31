<script>
  import Layout from "./layout.svelte";
  import Pages from "./pages/index.svelte";
  import { pathStore } from "./stores";
  window.onpopstate = () => {
    pathStore.set(document.location.pathname);
  };
</script>

<Layout>
  <Pages />
</Layout>
