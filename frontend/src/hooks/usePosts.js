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
  return useMutation({
    mutationFn: (slug) => api.delete(`/posts/${slug}`),
  });
}

// Optimistic like toggle. Updates any cached list pages + detail.
export function useLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug) => api.post(`/posts/${slug}/like`).then((r) => r.data),
    onMutate: async (slug) => {
      await qc.cancelQueries({ queryKey: ["post", slug] });
      const prev = qc.getQueryData(["post", slug]);
      if (prev) {
        qc.setQueryData(["post", slug], {
          ...prev,
          is_liked: !prev.is_liked,
          like_count: prev.like_count + (prev.is_liked ? -1 : 1),
        });
      }
      return { prev, slug };
    },
    onError: (_e, _slug, ctx) => {
      if (ctx?.prev) qc.setQueryData(["post", ctx.slug], ctx.prev);
    },
    onSettled: (_d, _e, slug) => {
      qc.invalidateQueries({ queryKey: ["post", slug] });
    },
  });
}

export function useBookmark() {
  return useMutation({
    mutationFn: (slug) => api.post(`/posts/${slug}/bookmark`).then((r) => r.data),
  });
}
