import { ResizeMode, Video } from 'expo-av';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { CalendarIcon, ClockIcon, InfoIcon, TrashIcon } from 'lucide-react-native';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';

import BaseText from '~/components/BaseText';
import Button from '~/components/Button';
import { useFetchVideo } from '~/hooks/useFetchVideo';
import { useRemoveVideo } from '~/hooks/useRemoveVideo';

const Detail = () => {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const navigation = useNavigation();
  const { data: video, isLoading } = useFetchVideo(videoId);
  const { mutate: removeVideo, isPending } = useRemoveVideo();
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useTranslation();

  const handleDeleteVideo = () => {
    Alert.alert(t('detail.deleteConfirmTitle'), t('detail.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          removeVideo(videoId, {
            onSuccess: () => {
              router.replace('/');
            },
          });
        },
      },
    ]);
  };

  const togglePlayback = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }

    setIsPlaying(!isPlaying);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: video?.name || t('detail.title'),
      headerRight: () => (
        <Button
          variant="ghost"
          onPress={handleDeleteVideo}
          loading={isPending}
          className="mr-2 h-10 w-10 rounded-full border border-slate-200">
          <TrashIcon size={18} color="#ef4444" />
        </Button>
      ),
    });
  }, [video, isPending, t]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!video) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <BaseText variant="subtitle" className="text-center">
          {t('detail.videoNotFound')}
        </BaseText>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="relative w-full">
        <Video
          ref={videoRef}
          source={{ uri: video.videoUri || '' }}
          style={{ width: '100%', height: 240 }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
            }
          }}
        />
      </View>

      <View className="p-4">
        <BaseText variant="title" className="mb-2">
          {video.name}
        </BaseText>

        <View className="mb-4 flex-row flex-wrap gap-2">
          <View className="flex-row items-center rounded-full bg-indigo-100 px-3 py-1">
            <CalendarIcon size={14} color="#6366f1" />
            <BaseText variant="caption" className="ml-1 text-indigo-700">
              {new Date(video.createdAt).toLocaleDateString()}
            </BaseText>
          </View>

          <View className="flex-row items-center rounded-full bg-indigo-100 px-3 py-1">
            <ClockIcon size={14} color="#6366f1" />
            <BaseText variant="caption" className="ml-1 text-indigo-700">
              {video.duration ? `${video.duration.toFixed(1)}s` : t('detail.unknownDuration')}
            </BaseText>
          </View>
        </View>

        <View className="mb-6 rounded-lg bg-slate-50 p-4">
          <View className="mb-2 flex-row items-center">
            <InfoIcon size={18} color="#6366f1" />
            <BaseText variant="subtitle" className="ml-2">
              {t('detail.description')}
            </BaseText>
          </View>
          <BaseText variant="body" className="text-slate-700">
            {video.description || t('detail.noDescription')}
          </BaseText>
        </View>

        <View className="flex-row gap-3">
          <Button
            title={isPlaying ? t('common.pause') : t('common.play')}
            onPress={togglePlayback}
            variant="primary"
            className="w-32"
            textClassName="text-white"
          />
          <Button
            title={t('common.delete')}
            onPress={handleDeleteVideo}
            variant="outline"
            loading={isPending}
            className="w-32"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Detail;
