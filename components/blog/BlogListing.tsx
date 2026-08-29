"use client";

import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { BlogPostCard, type BlogPostPreview } from "@/components/ui/BlogPostCard";

export function BlogListing({
  initialPosts,
  initialTotal,
  pageSize,
}: {
  initialPosts: BlogPostPreview[];
  initialTotal: number;
  pageSize: number;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const skipInitialFetch = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    // The very first run matches the server-rendered `initialPosts` exactly
    // (empty query, page 1) — skip it so we don't re-fetch what SSR already gave us.
    if (skipInitialFetch.current && !debouncedQuery) {
      skipInitialFetch.current = false;
      return;
    }
    skipInitialFetch.current = false;

    setLoading(true);
    const params = new URLSearchParams({ limit: String(pageSize) });
    if (debouncedQuery) params.set("q", debouncedQuery);
    fetch(`/api/blog?${params.toString()}`)
      .then((res) => res.json())
      .then((body) => {
        setPosts(body.posts ?? []);
        setTotal(body.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, pageSize]);

  async function loadMore() {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(pageSize), offset: String(posts.length) });
    if (debouncedQuery) params.set("q", debouncedQuery);
    const res = await fetch(`/api/blog?${params.toString()}`);
    const body = await res.json();
    setPosts((prev) => [...prev, ...(body.posts ?? [])]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="relative max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts…"
          className="pl-11"
          aria-label="Search blog posts"
        />
      </div>

      {posts.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
          {posts.length < total ? (
            <div className="flex justify-center">
              <Button type="button" variant="secondary-outline" size="lg" onClick={loadMore} disabled={loading}>
                {loading ? "Loading…" : "Load more posts"}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          icon={SearchIcon}
          title="No posts found"
          description={debouncedQuery ? "Try a different search term." : "New posts are on their way — check back soon."}
        />
      )}
    </div>
  );
}
