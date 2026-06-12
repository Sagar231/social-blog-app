import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../lib/api";

const pageParamFromUrl = (url) => {
  if (!url) return undefined;
  const p = new URL(url, window.location.origin).searchParams.get("page");
  return p ? Number(p) : undefined;
};

// Paginated list for feed / explore.
export function usePostList(endpoint, params = {}) {
  return useInfiniteQuery({
    queryKey: [endpoint, params],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get(endpoint, {
        params: { ...params, page: pageParam },
      });
      return data;
    },
    getNextPageParam: (lastPage) => pageParamFromUrl(lastPage.next),
    initialPageParam: 1,
  });
}

export function usePost(slug) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: async () => (await api.get(`/posts/${slug}`)).data,
    enabled: !!slug,
  });
}

export function useComments(slug) {
  return useQuery({
    queryKey: ["comments", slug],
    queryFn: async () => (await api.get(`/posts/${slug}/comments`)).data,
    enabled: !!slug,
  });
}

export function useAddComment(slug) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      api.post(`/posts/${slug}/comments`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", slug] });
      qc.invalidateQueries({ queryKey: ["post", slug] });
    },
  });
}

export function useSavePost() {
  return useMutation({
    mutationFn: ({ slug, payload }) =>
      slug
        ? api.patch(`/posts/${slug}`, payload).then((r) => r.data)
        : api.post(`/posts`, payload).then((r) => r.data),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug) => api.delete(`/posts/${slug}`),
    onSuccess: () => {
      // Drop the post from any feed/explore/profile list it appeared in.
      qc.invalidateQueries({ queryKey: ["/posts"] });
      qc.invalidateQueries({ queryKey: ["/feed"] });
    },
  });
}

// List query keys whose cached pages contain posts we may need to update.
const LIST_ENDPOINTS = ["/feed", "/posts"];

// Apply `updater` to a post (matched by slug) everywhere it's cached:
// the post-detail query AND every infinite list page (feed, explore, profile).
function patchPostEverywhere(qc, slug, updater) {
  qc.setQueryData(["post", slug], (old) => (old ? updater(old) : old));

  qc.setQueriesData(
    {
      predicate: (q) =>
        Array.isArray(q.queryKey) && LIST_ENDPOINTS.includes(q.queryKey[0]),
    },
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          results: page.results.map((p) =>
            p.slug === slug ? updater(p) : p
          ),
        })),
      };
    }
  );
}

const toggleLike = (p) => ({
  ...p,
  is_liked: !p.is_liked,
  like_count: p.like_count + (p.is_liked ? -1 : 1),
});

// Optimistic like toggle. Updates detail + every list cache immediately,
// then reconciles with the server's authoritative count.
export function useLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug) => api.post(`/posts/${slug}/like`).then((r) => r.data),
    onMutate: async (slug) => {
      await qc.cancelQueries({ queryKey: ["post", slug] });
      patchPostEverywhere(qc, slug, toggleLike);
      return { slug };
    },
    onSuccess: (data, slug) => {
      // data = { liked, like_count } from the server — set exact truth.
      patchPostEverywhere(qc, slug, (p) => ({
        ...p,
        is_liked: data.liked,
        like_count: data.like_count,
      }));
      // Liked posts appear in the Home feed, so refresh it next time it's shown.
      qc.invalidateQueries({ queryKey: ["/feed"] });
    },
    onError: (_e, slug) => {
      // Revert the optimistic toggle.
      patchPostEverywhere(qc, slug, toggleLike);
    },
  });
}

export function useBookmark() {
  return useMutation({
    mutationFn: (slug) => api.post(`/posts/${slug}/bookmark`).then((r) => r.data),
  });
}
