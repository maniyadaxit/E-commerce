import { client } from "./client";

export async function getAdminDashboard() {
  const { data } = await client.get("/owner/dashboard");
  return data;
}

export async function getAdminOrders(params) {
  const { data } = await client.get("/owner/orders", { params });
  return data;
}

export async function getAdminUsers() {
  const { data } = await client.get("/owner/users");
  return data;
}

export async function setAdminUserStatus(id, enabled) {
  const { data } = await client.patch(`/owner/users/${id}/status`, null, {
    params: { enabled },
  });
  return data;
}

export async function getAdminProductInventory(id) {
  const { data } = await client.get(`/owner/products/${id}/inventory`);
  return data;
}

export async function updateAdminProductInventory(id, payload) {
  const { data } = await client.patch(`/owner/products/${id}/inventory`, payload);
  return data;
}

export async function getAdminReviews() {
  const { data } = await client.get("/owner/reviews");
  return data;
}

export async function moderateReview(id, payload) {
  const { data } = await client.patch(`/owner/reviews/${id}`, payload);
  return data;
}

export async function getAdminCoupons() {
  const { data } = await client.get("/owner/coupons");
  return data;
}

export async function createCoupon(payload) {
  const { data } = await client.post("/owner/coupons", payload);
  return data;
}

export async function createProduct(payload) {
  const { data } = await client.post("/products", payload);
  return data;
}

export async function uploadOwnerProductImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await client.post("/owner/uploads/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function uploadOwnerProductImages(files) {
  return Promise.all(Array.from(files).map((file) => uploadOwnerProductImage(file)));
}

export async function updateProduct(id, payload) {
  const { data } = await client.put(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id) {
  await client.delete(`/products/${id}`);
}

export async function createCollection(payload) {
  const { data } = await client.post("/collections", payload);
  return data;
}
