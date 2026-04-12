import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs } from "../api/blogApi";

export function BlogListPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    getBlogs().then(setBlogs).catch(() => setBlogs([]));
  }, []);

  return (
    <section className="section-shell py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
          Tales
        </p>
        <h1 className="font-display text-5xl text-ink md:text-6xl">
          Styling guides, gift edits, and jewelry notes.
        </h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link key={blog.id} to={`/blogs/tales/${blog.slug}`} className="rounded-[2rem] bg-white p-4 shadow-soft">
            <img
              src={blog.coverImageUrl}
              alt={blog.title}
              className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
              loading="lazy"
            />
            <p className="mt-4 font-display text-3xl text-ink">{blog.title}</p>
            <p className="mt-3 text-sm leading-7 text-copy/75">{blog.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
