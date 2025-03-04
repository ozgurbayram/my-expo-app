import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Scissors } from 'lucide-react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import BaseText from '~/components/BaseText';
import Button from '~/components/Button';
import Cropper, { CropperRef } from '~/components/Cropper';
import { getVideoDuration, initFFmpeg } from '~/utils/ffmpeg.utils';

const Crop = () => {
  const { videoUri } = useLocalSearchParams<{ videoUri: string }>();
  const navigation = useNavigation();
  const videoRef = useRef<Video>(null);
  const [duration, setDuration] = useState<number>(0);
  const cropperRef = useRef<CropperRef>(null);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const { t } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('crop.title'),
      headerBackTitle: t('common.back'),
    });
  }, [navigation, t]);

  useEffect(() => {
    const initializeFFmpeg = async () => {
      setIsLoading(true);
      await initFFmpeg();
      setIsLoading(false);
    };

    initializeFFmpeg();
  }, [videoUri]);

  useEffect(() => {
    const loadDuration = async () => {
      if (videoUri) {
        const videoDuration = await getVideoDuration(videoUri as string);
        setDuration(videoDuration);
      }
    };

    loadDuration();
  }, [videoUri]);

  const handleSelectionEnd = async (startTime: number, endTime: number) => {
    if (videoRef.current) {
      setIsUserSeeking(true);
      await videoRef.current.setPositionAsync(startTime * 1000);
      setIsUserSeeking(false);
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded || isUserSeeking || !cropperRef.current) return;

    setIsPlaying(status.isPlaying);

    const endTime = cropperRef.current.getEndTime();
    const startTime = cropperRef.current.getStartTime();
    const currentTime = status.positionMillis / 1000;

    if (status.isPlaying && (currentTime < startTime || currentTime > endTime)) {
      setIsUserSeeking(true);
      videoRef.current?.setPositionAsync(startTime * 1000).then(() => {
        setIsUserSeeking(false);
      });
    }
  };

  const handleCrop = () => {
    const startTime = cropperRef.current?.getStartTime();
    const endTime = cropperRef.current?.getEndTime();
    router.push({
      pathname: '/save',
      params: { startTime, endTime, videoUri },
    });
  };

  const togglePlayback = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-4 py-6">
        <BaseText variant="body" className="mb-4 text-slate-500">
          {t('crop.selectPortion')}
        </BaseText>

        <View className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {isLoading ? (
            <View className="h-[240] items-center justify-center">
              <ActivityIndicator size="large" color="#6366f1" />
              <BaseText variant="caption" className="mt-2 text-slate-500">
                {t('crop.preparingVideo')}
              </BaseText>
            </View>
          ) : (
            <Video
              ref={videoRef}
              source={{ uri: videoUri as string }}
              style={{ width: '100%', height: 240 }}
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              isMuted
              useNativeControls
              shouldPlay
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
          )}
        </View>

        <View className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <BaseText variant="subtitle" className="mb-4 text-slate-700">
            {t('crop.adjustClipLength')}
          </BaseText>

          <Cropper
            ref={cropperRef}
            videoUri={videoUri as string}
            duration={duration}
            maxDuration={5}
            onSelectionEnd={handleSelectionEnd}
          />

          <View className="mt-4 flex-row items-center justify-between">
            <View className="rounded-md bg-slate-100 px-3 py-1">
              <BaseText variant="caption" className="text-slate-700">
                {t('crop.start')}:{' '}
                {cropperRef.current ? formatTime(cropperRef.current.getStartTime()) : '0:00'}
              </BaseText>
            </View>

            <BaseText variant="caption" className="text-slate-500">
              {cropperRef.current
                ? formatTime(cropperRef.current.getEndTime() - cropperRef.current.getStartTime())
                : '0:00'}
            </BaseText>

            <View className="rounded-md bg-slate-100 px-3 py-1">
              <BaseText variant="caption" className="text-slate-700">
                {t('crop.end')}:{' '}
                {cropperRef.current ? formatTime(cropperRef.current.getEndTime()) : '0:00'}
              </BaseText>
            </View>
          </View>
        </View>

        <View className="mt-4 flex-row gap-3">
          <Button onPress={() => router.back()} title={t('common.cancel')} variant="outline" />
          <Button
            onPress={handleCrop}
            title={t('crop.cropVideo')}
            disabled={isLoading}
            icon={<Scissors size={18} color="white" />}
            textClassName="text-white"
            iconPosition="left"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Crop;
