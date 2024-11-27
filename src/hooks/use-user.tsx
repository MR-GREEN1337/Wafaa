import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserData } from '@/actions/user/getUserData';
import { updateUser } from '@/actions/user/updateUserData';
import { deleteUser } from '@/actions/user/deleteUser';
import { UpdateUserInput, User } from '@/types/user';
import { toast } from 'sonner';

export function useUser(userId) {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserData(userId),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserInput) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error('Update error:', error);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      toast.success('Account deleted successfully');
      // Handle post-deletion navigation or cleanup
    },
    onError: (error) => {
      toast.error('Failed to delete account');
      console.error('Deletion error:', error);
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    updateUser: updateUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    deleteUser: deleteUserMutation.mutate,
    isDeleting: deleteUserMutation.isPending,
  };
}