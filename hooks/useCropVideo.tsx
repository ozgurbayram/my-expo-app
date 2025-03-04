import { useMutation } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';

import { cropVideo } from '~/utils/ffmpeg.utils';

export const useCropVideo = () => {
  return useMutation({
    mutationFn: async ({
      inputPath,
      startTime,
      endTime,
    }: {
      inputPath: string;
      startTime: number;
      endTime: number;
    }) => {
      const outputPath = `${FileSystem.documentDirectory}cropped_${new Date().getTime()}.mp4`;
      return await cropVideo({ inputPath, outputPath, startTime, endTime });
    },
  });
};
