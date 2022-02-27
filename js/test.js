// @ts-check

import { setup } from "./buildIndex.js";

export async function test() {
  const res = await setup();
  console.log(res);
}

test();