import { client } from "./client";

export async function listOrders() {
  const { data } = await client.get("/orders");
  return data;
}

export async function getOrder(id) {
  const { data } = await client.get(`/orders/${id}`);
  return data;
}

export async function placeOrder(payload) {
  const { data } = await client.post("/orders", payload);
  return data;
}

export async function validateCoupon(payload) {
  const { data } = await client.post("/coupons/validate", payload);
  return data;
}

export async function createPaymentOrder(payload) {
  const { data } = await client.post("/payments/create-order", payload);
  return data;
}

export async function verifyPayment(payload) {
  const { data } = await client.post("/payments/verify", payload);
  return data;
}
