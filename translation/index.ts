import { init18n } from 'core/i18n/init';
import en from 'translation/en.json';
import tr from 'translation/tr.json';
export const resources = {
  en: {
    translation: en,
  },
  tr: {
    translation: tr,
  },
};

export const fallbackLng = 'en';

export type LanguageCode = keyof typeof resources;

const i18n = init18n({ resources, fallbackLng });

export default i18n;
