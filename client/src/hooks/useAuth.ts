import { trpc } from '@/lib/trpc';

export function useAuth() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const logout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = '/';
  };

  return {
    user,
    isLoading,
    logout,
    isAuthenticated: !!user,
  };
}
