import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BaseVideo, BaseVideoRef } from './ui';

import { VideoModel } from '~/models/video.model';

interface VideoItemProps {
  video: VideoModel;
}

const VideoItem = ({ video }: VideoItemProps) => {
  const videoRef = useRef<BaseVideoRef>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);

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
      <BaseVideo
        ref={videoRef}
        uri={video.videoUri || ''}
        height={240}
        useNativeControls
        contentFit="contain"
        shouldPlay
        isLooping
      />
      <View className="w-full flex-row items-center justify-between px-4 py-2">
        <View className="items-startjustify-between flex-1 flex-col gap-2 ">
          <Text>{video.name}</Text>
          <Text>{video.description}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default VideoItem;
