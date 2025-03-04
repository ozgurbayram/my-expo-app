import { useMutation } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';

import { useVideoStore } from '~/store/video.store';
import { saveVideoWithMetadata } from '~/utils/ffmpeg.utils';

export const useSaveVideo = () => {
  const addVideo = useVideoStore((state) => state.addVideo);

  return useMutation({
    mutationFn: async ({
      videoUri,
      name,
      description,
      duration,
    }: {
      videoUri: string;
      name: string;
      description: string;
      duration: number;
    }) => {
      const outputPath = `${FileSystem.documentDirectory}saved_${new Date().getTime()}.mp4`;
      const savedVideoUri = await saveVideoWithMetadata(videoUri, outputPath, {
        title: name,
        description,
      });

      const videoData = {
        id: new Date().getTime().toString(),
        name,
        description,
        videoUri: savedVideoUri,
        createdAt: new Date().toISOString(),
        duration,
      };

      await addVideo(videoData);

      return savedVideoUri;
    },
  });
};
