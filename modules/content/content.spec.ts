import { Test, expect } from "tiny-jest";
import compileContent from "./lib/compileContent";
export const test = new Test("Modules/Content");
const { it } = test;
it("can compile html source", async () => {
  const result = await compileContent(
    `<script>
    let name="world";
    let clicks = 0;
    const onClick = ()=>{
      clicks+=1
    }
    </script>
    <h1>Hello, {name}</h1>
    <button on:click={onClick}>Clicked: {clicks}</button>
    <style>h1{color:red}</style>`
  );

  expect(result).toMatchObject({
    html:
      '<h1 class="svelte-zpl6q0">Hello, world</h1>' +
      "\n    <button>Clicked: 0</button>",
    css: "h1.svelte-zpl6q0{color:red}",
  });
});
