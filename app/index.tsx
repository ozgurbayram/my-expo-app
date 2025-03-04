import * as ImagePicker from 'expo-image-picker';
import { router, useNavigation } from 'expo-router';
import i18next from 'i18next';
import { PlusIcon } from 'lucide-react-native';
import { useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import BaseFlatList from '~/components/BaseFlatList';
import BaseText from '~/components/BaseText';
import Button from '~/components/Button';
import VideoItem from '~/components/VideoItem';
import { VideoModel } from '~/models/video.model';
import { useVideoStore } from '~/store/video.store';

const App = () => {
  const navigation = useNavigation();
  const { videos, fetchVideos } = useVideoStore();
  const { t } = useTranslation();

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
    });

    if (result.assets?.[0]?.uri) {
      router.push({ pathname: '/crop', params: { videoUri: result.assets[0].uri } });
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('home.title'),
      headerRight: () => (
        <Button
          onPress={pickVideo}
          variant="ghost"
          className="m-0 h-10 w-12 items-center justify-center rounded-full border border-slate-200">
          <PlusIcon className="h-4 w-4" color="#333" />
        </Button>
      ),
      headerLeft: () => (
        <View className="flex-row items-center gap-2">
          <Button
            onPress={() => {
              i18next.changeLanguage('en');
            }}
            variant="primary"
            title={t('home.english')}
            textClassName="text-white text-xs"
          />
          <Button
            onPress={() => {
              i18next.changeLanguage('tr');
            }}
            variant="primary"
            title={t('home.turkish')}
            textClassName="text-white text-xs"
          />
        </View>
      ),
    });
  }, [t]);

  const EmptyListComponent = () => (
    <View className="h-full flex-1 items-center justify-center bg-white p-8">
      <BaseText className="mb-4 text-center text-lg text-slate-600">{t('home.emptyList')}</BaseText>
      <Button
        title={t('home.createNewCrop')}
        onPress={pickVideo}
        className="px-6"
        textClassName="text-white"
      />
    </View>
  );

  return (
    <View className="m-0 flex-1 bg-white">
      <BaseFlatList<VideoModel>
        data={videos}
        renderItem={(item) => {
          return <VideoItem key={item.id} video={item} />;
        }}
        ListEmptyComponent={EmptyListComponent}
      />
    </View>
  );
};

export default App;
