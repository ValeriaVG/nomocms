<slot />

<style>
  :global(html) {
    --bg-color: black;
    --text-color: white;
    --primary-color: #8f58c7;
    --primary-hover: rgb(116, 52, 180);
    --secondary-color: #87d787;
    --neutral-color: #f8f8f8;
    min-height: 100vh;
    padding: 0;
    margin: 0;
  }
  :global(html[data-theme="dark"]) {
    --bg-color: black;
    --text-color: white;
    --neutral-color: rgba(255, 255, 255, 0.08);
  }
  :global(html[data-theme="light"]) {
    --bg-color: #fafafa;
    --text-color: black;
    --neutral-color: white;
  }
  :global(body) {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 16px;
    line-height: 1.2;
    margin: 0;
    padding: 0;
    background: var(--bg-color);
    color: var(--text-color);
    width: 100%;
    min-height: 100vh;
  }
</style>
