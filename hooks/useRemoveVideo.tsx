import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { useVideoStore } from '~/store/video.store';

export const useRemoveVideo = () => {
  const { removeVideo } = useVideoStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      await removeVideo(videoId);
    },
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });

      router.replace('/');
    },
  });
};
