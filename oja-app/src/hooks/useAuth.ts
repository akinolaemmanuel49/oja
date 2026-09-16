import { useQuery, useQueryClient } from "@tanstack/react-query";

import { me } from "@/api/auth/me";
import type { UserWithPermissions } from "@/types/permission";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const {
    data: userWithPermissions,
    isLoading,
    isError,
    error,
    status,
  } = useQuery<UserWithPermissions | null, Error>({
    queryKey: ["currentUser"],
    queryFn: me,
    retry: false,
    staleTime: 4 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  const isAuthenticated = status === "success" && !!userWithPermissions;

  const refreshSession = async () => {
    await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    await queryClient.refetchQueries({ queryKey: ["currentUser"] });
  };

  return {
    userWithPermissions,
    isLoading,
    isError,
    isAuthenticated,
    error,
    refreshSession,
  };
};
