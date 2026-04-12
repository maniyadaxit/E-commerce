import { client } from "./client";

export async function getCart() {
  const { data } = await client.get("/cart");
  return data;
}

export async function addCartItem(payload) {
  const { data } = await client.post("/cart/items", payload);
  return data;
}

export async function updateCartItem(id, payload) {
  const { data } = await client.put(`/cart/items/${id}`, payload);
  return data;
}

export async function removeCartItem(id) {
  await client.delete(`/cart/items/${id}`);
}

export async function clearCart() {
  await client.delete("/cart");
}
