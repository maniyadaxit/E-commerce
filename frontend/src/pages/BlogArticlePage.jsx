import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBlog } from "../api/blogApi";
import { formatDisplayDate } from "../utils/dateHelpers";

export function BlogArticlePage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    getBlog(slug).then(setBlog).catch(() => setBlog(null));
  }, [slug]);

  if (!blog) {
    return null;
  }

  return (
    <section className="section-shell py-10">
      <article className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
          {formatDisplayDate(blog.publishedAt)} | {blog.author}
        </p>
        <h1 className="mt-4 font-display text-5xl text-ink md:text-6xl">{blog.title}</h1>
        <img
          src={blog.coverImageUrl}
          alt={blog.title}
          className="mt-8 aspect-[16/8] w-full rounded-[2rem] object-cover"
          loading="lazy"
        />
        <div
          className="prose prose-neutral mt-8 max-w-none leading-8"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </section>
  );
}
