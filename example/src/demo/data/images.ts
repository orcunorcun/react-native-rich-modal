const LOCAL_IMAGES: Record<string, number> = {
  'popup/en/1.jpg': require('../../../assets/popup/en/1.jpg'),
  'popup/en/2_1.jpg': require('../../../assets/popup/en/2_1.jpg'),
  'popup/en/2_2.jpg': require('../../../assets/popup/en/2_2.jpg'),
  'popup/en/3.jpg': require('../../../assets/popup/en/3.jpg'),
  'popup/ja/2_1.jpg': require('../../../assets/popup/ja/2_1.jpg'),
  'popup/ja/2_2.jpg': require('../../../assets/popup/ja/2_2.jpg'),
  'popup/cht/2_1.jpg': require('../../../assets/popup/cht/2_1.jpg'),
  'popup/cht/2_2.jpg': require('../../../assets/popup/cht/2_2.jpg'),
  'popup/en/image.png': require('../../../assets/popup/en/image.png'),
  'popup/ja/image.png': require('../../../assets/popup/ja/image.png'),
  'popup/cht/image.png': require('../../../assets/popup/cht/image.png'),
};

export const resolveImage = (key: string) => LOCAL_IMAGES[key] ?? null;
