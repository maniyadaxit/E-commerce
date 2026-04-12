import { client, clearAuthTokens } from "./client";

export async function login(payload) {
  const { data } = await client.post("/auth/login", payload);
  return data;
}

export async function ownerLogin(payload) {
  const { data } = await client.post("/auth/owner/login", payload);
  return data;
}

export async function register(payload) {
  const { data } = await client.post("/auth/register", payload);
  return data;
}

export async function logout() {
  try {
    await client.post("/auth/logout");
  } finally {
    clearAuthTokens();
  }
}

export async function getCurrentUser() {
  const { data } = await client.get("/users/me");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await client.put("/users/me", payload);
  return data;
}

export async function forgotPassword(payload) {
  return Promise.resolve({
    message: `Password reset instructions sent to ${payload.email}.`,
  });
}
