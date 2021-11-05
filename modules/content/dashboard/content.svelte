<script>
  import Editor from "./editor.svelte";
  import api from "dashboard/src/utils/api";
  //export let id = "";
  let value = "";
  let title = "";
  let preview = "";
  let timer = null;

  const getPreview = async (params) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      const result = await api.post("/content/preview", params);
      if (typeof result === "string") preview = result;
      else console.error(result.error);
    }, 500);
  };
  $: getPreview({ content: value, title });
</script>

<div class="split">
  <div class="editor"><Editor bind:value /></div>
  <iframe srcdoc={preview} title="preview" />
</div>

<style>
  iframe {
    background: white;
    border: none;
    width: 50%;
    margin-left: 1rem;
  }
  .editor {
    width: auto;
    flex: 1;
  }
  .split {
    width: 100%;
    display: flex;
  }
</style>
