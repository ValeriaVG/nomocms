<script>
  import Editor from "../elements/editor.svelte";
  import api from "../utils/api";
  let value = "";
  let title = "";
  let preview = "";
  const getPreview = async (params) => {
    const result = await api.post("/content/preview", params);
    if (typeof result === "string") preview = result;
    else console.error(result.error);
  };
  $: getPreview({ content: value, title });
</script>

<div class="split">
  <div class="editor"><Editor bind:value /></div>
  <iframe srcdoc={preview} />
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
