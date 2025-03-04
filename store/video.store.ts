import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { VideoModel } from '~/models/video.model';
import { getData, storeData } from '~/utils/storage.utils';

interface VideoStore {
  videos: VideoModel[];
  fetchVideos: () => Promise<void>;
  addVideo: (video: VideoModel) => Promise<void>;
  removeVideo: (id: string) => Promise<void>;
  getVideo: (id: string) => Promise<VideoModel | null>;
}

export const useVideoStore = create<VideoStore>()(
  persist(
    (set) => ({
      videos: [],

      fetchVideos: async () => {
        const storedVideos = await getData<VideoModel[]>('videos');
        set({ videos: storedVideos || [] });
      },

      getVideo: async (id: string) => {
        const storedVideos = await getData<VideoModel[]>('videos');

        return storedVideos?.find((video) => video.id === id) || null;
      },

      addVideo: async (video) => {
        const existingVideos = (await getData<VideoModel[]>('videos')) || [];
        const updatedVideos = [...existingVideos, video];

        await storeData('videos', updatedVideos);
        set({ videos: updatedVideos });
      },

      removeVideo: async (id) => {
        const existingVideos = (await getData<VideoModel[]>('videos')) || [];
        const updatedVideos = existingVideos.filter((video) => video.id !== id);

        await storeData('videos', updatedVideos);
        set({ videos: updatedVideos });
      },
    }),
    {
      name: 'video-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
