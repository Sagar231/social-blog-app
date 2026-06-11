import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useProfile(username) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => (await api.get(`/users/${username}`)).data,
    enabled: !!username,
  });
}

export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username) =>
      api.post(`/users/${username}/follow`).then((r) => r.data),
    onMutate: async (username) => {
      await qc.cancelQueries({ queryKey: ["profile", username] });
      const prev = qc.getQueryData(["profile", username]);
      if (prev) {
        qc.setQueryData(["profile", username], {
          ...prev,
          is_following: !prev.is_following,
          follower_count: prev.follower_count + (prev.is_following ? -1 : 1),
        });
      }
      return { prev, username };
    },
    onError: (_e, _u, ctx) => {
      if (ctx?.prev) qc.setQueryData(["profile", ctx.username], ctx.prev);
    },
    onSettled: (_d, _e, username) =>
      qc.invalidateQueries({ queryKey: ["profile", username] }),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get(`/notifications`)).data,
  });
}
