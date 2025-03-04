import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <View className="m-0">
        <Text className={styles.title}>{t('notFound.message')}</Text>
        <Link href="/" className={styles.link}>
          <Text className={styles.linkText}>{t('notFound.goHome')}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = {
  title: `text-xl font-bold`,
  link: `mt-4 pt-4`,
  linkText: `text-base text-[#2e78b7]`,
};
