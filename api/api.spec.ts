import { Test } from "tiny-jest";
import { syncSchema } from ".";
export const test = new Test("API");

const { it } = test;
it("can sync schema", async () => {
  await syncSchema();
});
