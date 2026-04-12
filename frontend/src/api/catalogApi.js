import { client } from "./client";

export async function getCollections() {
  const { data } = await client.get("/collections");
  return data;
}

export async function getProducts(params) {
  const { data } = await client.get("/products", { params });
  return data;
}

export async function searchProducts(params) {
  const { data } = await client.get("/products/search", { params });
  return data;
}

export async function getCollectionProducts(handle, params) {
  const { data } = await client.get(`/collections/${handle}/products`, { params });
  return data;
}

export async function getProduct(slug) {
  const { data } = await client.get(`/products/${slug}`);
  return data;
}

export async function checkDelivery(pincode) {
  const { data } = await client.get("/delivery/check", { params: { pincode } });
  return data;
}
