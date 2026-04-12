import { client } from "./client";

export async function getStores(q = "") {
  const { data } = await client.get("/stores", { params: { q } });
  return data;
}
