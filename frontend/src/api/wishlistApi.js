import { client } from "./client";

export async function getWishlist() {
  const { data } = await client.get("/wishlist");
  return data;
}

export async function addToWishlist(productId) {
  await client.post(`/wishlist/${productId}`);
}

export async function removeFromWishlist(productId) {
  await client.delete(`/wishlist/${productId}`);
}
