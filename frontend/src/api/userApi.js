import { client } from "./client";

export async function getAddresses() {
  const { data } = await client.get("/users/me/addresses");
  return data;
}

export async function createAddress(payload) {
  const { data } = await client.post("/users/me/addresses", payload);
  return data;
}

export async function updateAddress(id, payload) {
  const { data } = await client.put(`/users/me/addresses/${id}`, payload);
  return data;
}

export async function deleteAddress(id) {
  await client.delete(`/users/me/addresses/${id}`);
}
