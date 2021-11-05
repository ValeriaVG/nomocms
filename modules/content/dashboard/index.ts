//@ts-nocheck
import Content from "./content.svelte";
export default {
  "/content/new": Content,
  "/content/:id": Content,
};
