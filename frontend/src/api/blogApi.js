import { client } from "./client";

export async function getBlogs() {
  const { data } = await client.get("/blogs");
  return data;
}

export async function getBlog(slug) {
  const { data } = await client.get(`/blogs/${slug}`);
  return data;
}
