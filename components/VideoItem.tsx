import { ResizeMode, Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { TrashIcon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import Button from './Button';

import { VideoModel } from '~/models/video.model';
import { getData, storeData } from '~/utils/storage.utils';

interface VideoItemProps {
  video: VideoModel;
}

const VideoItem = ({ video }: VideoItemProps) => {
  const videoRef = useRef<Video>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);

  const deleteVideo = async () => {
    Alert.alert('Are you sure you want to delete this video?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          await MediaLibrary.deleteAssetsAsync([video.id]);
          const videos = await getData<VideoModel[]>('videos');
          console.log('videos', videos);
          const filteredVideos = videos?.filter((v: VideoModel) => v.id !== video.id);

          await storeData('videos', filteredVideos);

          router.replace('/');
        },
      },
    ]);
  };

  const handlePress = () => {
    router.push(`/detail?videoId=${video.id}`);
  };

  useEffect(() => {
    MediaLibrary.getAssetInfoAsync(video.id).then((asset) => {
      console.log('asset', asset);
      setLocalUri(asset.localUri || '');
    });
  }, []);

  return (
    <Pressable
      className="w-full flex-col items-start justify-center border-b border-slate-100 bg-white"
      onPress={handlePress}>
      <Video
        ref={videoRef}
        source={{ uri: video.videoUri || '' }}
        style={{ width: '100%', height: 240 }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isTVSelectable
        isLooping
      />
      <View className="w-full flex-row items-center justify-between px-4 py-2">
        <View className="items-startjustify-between flex-1 flex-col gap-2 ">
          <Text>{video.name}</Text>
          <Text>{video.description}</Text>
        </View>
        <Button
          variant="ghost"
          className="m-0 h-10 w-10 rounded-3xl border border-slate-200"
          onPress={deleteVideo}>
          <TrashIcon size={18} color="#333" />
        </Button>
      </View>
    </Pressable>
  );
};

export default VideoItem;
