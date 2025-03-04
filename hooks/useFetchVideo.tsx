import { useQuery } from '@tanstack/react-query';

import { VideoModel } from '~/models/video.model';
import { useVideoStore } from '~/store/video.store';

export const useFetchVideo = (videoId: string) => {
  const { getVideo } = useVideoStore();

  return useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const video = await getVideo(videoId);
      if (!video) {
        throw new Error(`Video with id ${videoId} not found`);
      }
      return video as VideoModel;
    },
  });
};
