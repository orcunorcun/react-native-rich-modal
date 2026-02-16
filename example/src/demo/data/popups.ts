import type { PopupItemType } from 'react-native-rich-modal';

export const BASIC_POPUPS: PopupItemType[] = [
  {
    id: 'basic-1',
    imgSrc: 'popup/en/1.jpg',
    title: 'Welcome',
    message: 'This is the simplest RichModal usage.',
    url: 'https://github.com/orcunorcun/react-native-rich-modal',
  },
];

export const THEMED_POPUPS: PopupItemType[] = [
  {
    id: 'theme-1',
    imgSrc: [
      {
        en: { src: 'popup/en/2_1.jpg', title: 'Image 1 title', message: 'Test message for image 1' },
        ja: { src: 'popup/ja/2_1.jpg', title: '1番目の画像タイトル', message: '1番目の画像メッセージ' },
        cht: { src: 'popup/cht/2_1.jpg', title: '第一張圖片標題', message: '第一張圖片訊息' },
      },
      {
        en: { src: 'popup/en/2_2.jpg', title: 'Image 2 title', message: 'Test message for image 2' },
        ja: { src: 'popup/ja/2_2.jpg', title: '2番目の画像タイトル', message: '2番目の画像メッセージ' },
        cht: { src: 'popup/cht/2_2.jpg', title: '第二張圖片標題', message: '第二張圖片訊息' },
      },
      {
        en: {
          src: 'https://picsum.photos/200/200',
          title: 'Direct URL image title',
          message: 'Test message for direct URL image',
        },
        ja: {
          src: 'https://picsum.photos/200/200',
          title: 'URL画像タイトル',
          message: 'URL画像メッセージ',
        },
        cht: {
          src: 'https://picsum.photos/200/200',
          title: 'URL 圖片標題',
          message: 'URL 圖片訊息',
        },
      },
    ],
    title: { en: 'Theme Example' },
    message: {
      en: 'Colors, text styles, card radius and dot styles are customized with theme + styleOverrides.',
    },
    url: {
      en: 'https://github.com/orcunorcun/react-native-rich-modal',
      ja: 'https://github.com/orcunorcun/react-native-rich-modal?lang=ja',
      cht: 'https://github.com/orcunorcun/react-native-rich-modal?lang=cht',
    },
  },
  {
    id: 'theme-2',
    title: { en: 'Text only card' },
    message: {
      en: 'You can still style title/message card even when no image exists.',
    },
  },
];

export const COMPONENT_POPUPS: PopupItemType[] = [
  {
    id: 'components-1',
    imgSrc: [{ en: 'popup/en/3.jpg' }, { en: 'popup/en/missing.jpg' }],
    title: { en: 'Render Overrides' },
    message: {
      en: 'This example customizes close button, dot, image, placeholder, and checkbox row.',
    },
  },
];

export const STORAGE_POPUPS: PopupItemType[] = [
  {
    id: 'campaign-storage-1',
    imgSrc: [{ en: 'popup/en/1.jpg' }],
    title: { en: 'Storage-backed campaign' },
    message: {
      en: 'Check "Dont show again" and close. Then trigger modal again to confirm persistence.',
    },
  },
];

export const FULLSCREEN_POPUPS: PopupItemType[] = [
  {
    id: 'fullscreen-1',
    imgSrc: [{ en: 'popup/en/2_1.jpg' }, { en: 'popup/en/3.jpg' }],
    title: { en: 'Fullscreen image mode' },
    message: {
      en: 'Use fullscreenImage + resizeMode for edge-to-edge media.',
    },
  },
];

export const LANGUAGE_POPUPS: PopupItemType[] = [
  {
    id: 'language-1',
    imgSrc: [
      {
        en: { src: 'popup/en/image.png', title: 'Welcome image', message: 'Message override from image 1 (EN).' },
        ja: { src: 'popup/ja/image.png', title: 'ようこそ画像', message: '画像1のメッセージ上書き (JA).' },
        cht: { src: 'popup/cht/image.png', title: '歡迎圖片', message: '圖片1訊息覆寫 (CHT).' },
      },
      {
        en: {
          src: 'https://picsum.photos/seed/language-demo/460/300',
          title: 'Remote image',
          message: 'Message override from image 2 (EN).',
        },
        ja: {
          src: 'https://picsum.photos/seed/language-demo/460/300',
          title: 'リモート画像',
          message: '画像2のメッセージ上書き (JA).',
        },
        cht: {
          src: 'https://picsum.photos/seed/language-demo/460/300',
          title: '遠端圖片',
          message: '圖片2訊息覆寫 (CHT).',
        },
      },
    ],
    title: {
      en: 'Language demo title',
      ja: '言語デモのタイトル',
      cht: '語言示範標題',
    },
    message: {
      en: 'Switch langCode and replay to verify localized title/message/url.',
      ja: 'langCode を切り替えて再表示し、ローカライズを確認してください。',
      cht: '切換 langCode 並重新顯示，以確認在地化內容。',
    },
    url: {
      en: 'https://example.com/en',
      ja: 'https://example.com/ja',
      cht: 'https://example.com/cht',
    },
  },
];
