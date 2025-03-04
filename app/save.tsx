import { ResizeMode, Video } from 'expo-av';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import BaseText from '~/components/BaseText';
import Button from '~/components/Button';
import Input from '~/components/Input';
import { useCropVideo } from '~/hooks/useCropVideo';
import { useSaveVideo } from '~/hooks/useSaveVideo';

interface FormData {
  name: string;
  description: string;
}

const Save = () => {
  const navigation = useNavigation();
  const { startTime, endTime, videoUri } = useLocalSearchParams<{
    startTime: string;
    endTime: string;
    videoUri: string;
  }>();
  const { t } = useTranslation();

  const [croppedVideoUri, setCroppedVideoUri] = useState<string | null>(null);
  const { mutate: crop, isPending: isCropping } = useCropVideo();
  const { mutate: save, isPending: isSaving } = useSaveVideo();

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      save(
        {
          videoUri: videoUri as string,
          name: data.name,
          description: data.description,
          duration: Number(endTime) - Number(startTime),
        },
        {
          onSuccess: () => {
            router.replace('/');
          },
        }
      );
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  useEffect(() => {
    crop(
      {
        inputPath: videoUri as string,
        startTime: Number(startTime),
        endTime: Number(endTime),
      },
      {
        onSuccess: (data) => {
          setCroppedVideoUri(data);
        },
      }
    );
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('save.title'),
    });
  }, [t]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-5 py-6">
        <BaseText variant="body" className="mb-6 text-slate-500">
          {t('save.preview')}
        </BaseText>

        {croppedVideoUri ? (
          <View className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <Video
              source={{ uri: croppedVideoUri }}
              style={{ width: '100%', height: 220 }}
              shouldPlay
              useNativeControls
              isMuted
              resizeMode={ResizeMode.COVER}
            />
            <View className="p-3">
              <Text className="text-xs text-slate-500">
                {t('save.duration')}: {((Number(endTime) - Number(startTime)) / 1000).toFixed(1)}{t('save.seconds')}
              </Text>
            </View>
          </View>
        ) : (
          <View className="mb-6 h-[220] items-center justify-center rounded-xl bg-slate-100">
            {isCropping ? (
              <View className="items-center">
                <Text className="mb-2 text-slate-600">{t('save.processingVideo')}</Text>
                <Button variant="ghost" loading={true} className="h-8 w-8" />
              </View>
            ) : (
              <Text className="text-slate-400">{t('save.previewWillAppear')}</Text>
            )}
          </View>
        )}

        <View className="mb-4  rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <BaseText variant="subtitle" className="mb-4 text-slate-700">
            {t('save.videoDetails')}
          </BaseText>

          <Input
            form={form}
            name="name"
            label={t('save.titleLabel')}
            placeholder={t('save.titlePlaceholder')}
            rules={{ required: t('save.titleRequired') }}
            className="mb-4"
          />

          <Input
            form={form}
            name="description"
            label={t('save.descriptionLabel')}
            placeholder={t('save.descriptionPlaceholder')}
            multiline
            numberOfLines={3}
            rules={{ required: t('save.descriptionRequired') }}
          />
        </View>

        <View className="mt-4 flex-row gap-3">
          <Button
            onPress={() => router.back()}
            title={t('common.cancel')}
            variant="outline"
            className="flex-1"
          />
          <Button
            onPress={form.handleSubmit(onSubmit)}
            title={t('save.saveVideo')}
            disabled={isSaving}
            loading={isSaving}
            textClassName="text-white"
            icon={!isSaving ? <CheckCircle2 size={18} color="white" /> : undefined}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Save;
