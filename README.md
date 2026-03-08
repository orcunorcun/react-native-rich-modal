# react-native-rich-modal

A React Native rich modal for in-app announcements, campaigns, and multi-image popups.


|<img width="300" src="https://github.com/user-attachments/assets/e3ee2d2e-b1f7-496e-ac96-0a6cc3dcfe81" />|<img width="300" src="https://github.com/user-attachments/assets/1b84db86-a969-45b0-bb9a-1d6c87241103" />|


## Installation

Using yarn (recommended):

```sh
yarn add react-native-rich-modal react-native-reanimated react-native-worklets
```

Using npm:

```sh
npm install react-native-rich-modal react-native-reanimated react-native-worklets
```

### Additional Setup

**React Native Reanimated 4+** requires adding the Worklets Babel plugin (must be the last plugin):

```js
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'],
};
```

Optional: for image caching, you can add `react-native-fast-image`.

```sh
yarn add react-native-fast-image
```

**iOS**: if you add native deps (like `react-native-fast-image`), install pods:

```sh
cd ios
pod install
```

## Usage

### Direct component (basic)

```tsx
import React from 'react';
import { RichModal, PopupItemType } from 'react-native-rich-modal';

const POPUPS: PopupItemType[] = [
  {
    id: 'welcome',
    title: { en: 'Welcome' },
    message: { en: 'This is the simplest RichModal usage.' },
  },
];

export default function App() {
  return <RichModal popups={POPUPS} visible={true} langCode="en" />;
}
```

### Theme + style + component customization

```tsx
import {
  RichModal,
  type PopupItemType,
  type RichModalRenderCarouselDotProps,
} from 'react-native-rich-modal';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

const POPUPS: PopupItemType[] = [
  {
    id: 'campaign-1',
    imgSrc: ['https://example.com/campaign.jpg'],
    title: { en: 'Styled Campaign' },
    message: { en: 'Customize colors, styles and renderers.' },
  },
];

const CustomDot = ({ index, progress, activeColor, inactiveColor }: RichModalRenderCarouselDotProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: Math.abs(progress.value - index) < 0.25 ? 1 : 0.45,
    backgroundColor: Math.abs(progress.value - index) < 0.25 ? activeColor : inactiveColor,
  }));
  return <Animated.View style={[{ width: 14, height: 6, borderRadius: 999 }, animatedStyle]} />;
};

export function CampaignModal() {
  return (
    <RichModal
      popups={POPUPS}
      visible={true}
      theme={{
        overlayColor: '#111827',
        overlayOpacity: 0.7,
        titleColor: '#1E3A8A',
        messageColor: '#0C4A6E',
        carouselDotActiveColor: '#F97316',
        carouselDotInactiveColor: '#CBD5E1',
      }}
      styleOverrides={{
        textCard: { borderRadius: 20, paddingVertical: 16 },
        checkRow: { paddingHorizontal: 18 },
      }}
      components={{
        renderCarouselDot: (props) => <CustomDot {...props} />,
      }}
    />
  );
}
```

### Controlled visibility (`visible`)

```tsx
const [visible, setVisible] = useState(false);

<RichModal
  popups={POPUPS}
  visible={visible}
  onDismiss={() => setVisible(false)}
/>;
```

If you want delayed open in controlled mode, trigger `setVisible(true)` after your own timer.

### Fullscreen image mode

```tsx
<RichModal
  popups={POPUPS}
  visible={true}
  fullscreenImage
  fullscreenImageResizeMode="cover" // 'cover' | 'contain'
/>
```

### Pan + zoom image mode

```tsx
<RichModal
  popups={POPUPS}
  visible={true}
  panZoomEnabled // default false
  maxZoomScale={4} // default 3
/>
```

When `panZoomEnabled` is true, users can pinch/pan and also double-tap to zoom.
Double-tap zoom is automatically disabled if the popup has a `url`.

### Quick content visibility toggles

```tsx
<RichModal
  popups={POPUPS}
  visible={true}
  hideImage={false}
  hideTitle={false}
  hideMessage={false}
/>
```

### Optional safe area integration

If you already use `react-native-safe-area-context`, pass insets to `RichModal`:

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Screen() {
  const insets = useSafeAreaInsets();
  return <RichModal popups={POPUPS} visible={true} safeAreaInsets={insets} />;
}
```

### Provider + controller

```tsx
import React, { useEffect } from 'react';
import { RichModalProvider, richModal, PopupItemType } from 'react-native-rich-modal';

const POPUPS: PopupItemType[] = [{ id: 'launch', title: { en: 'New Feature' }, message: { en: 'Try it now!' } }];

const App = () => {
  useEffect(() => {
    richModal.show(POPUPS);
    return () => richModal.hide();
  }, []);

  return <RichModalProvider>{/* your app screens */}</RichModalProvider>;
};

export default App;
```

## Props

| Prop                    | Type                                | Default          | Description                                                                               |
| ----------------------- | ----------------------------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `popups`                | `PopupItemType[]`                   | `[]`             | Popup payload list.                                                                       |
| `serverTime`            | `string \| null`                    | `null`           | Server time for date filtering.                                                           |
| `visible`               | `boolean`                           | required         | Visibility gate for popup flow.                                                            |
| `langCode`              | `string`                            | `"en"`           | Language code used to pick localized fields.                                              |
| `appVersion`            | `string`                            | `undefined`      | App version for version filtering. If omitted, version filtering is skipped.              |
| `storage`               | `RichModalStorage`                  | `undefined`      | If provided, enables persistent “don’t show again”. If omitted, the toggle row is hidden. |
| `imageBaseUrl`          | `string`                            | `undefined`      | Base URL used to resolve image keys.                                                      |
| `resolveImage`          | `(key) => ImageSource`              | `undefined`      | Custom image resolver. Runs first; if it returns empty for an absolute URL key, RichModal uses the URL directly. Non-URL keys still override `imageBaseUrl`. |
| `carouselLoop`          | `boolean`                           | `true`           | Whether autoplay wraps from last image to first image.                                    |
| `carouselAutoPlay`      | `boolean`                           | `false`          | Automatically advances carousel items while modal is open.                                |
| `carouselAutoPlayInterval` | `number`                         | `3000`           | Autoplay interval in milliseconds. Invalid/non-positive values fall back to `3000`.       |
| `labels`                | `{ dontShowAgain?, missingImage? }` | English defaults | UI text overrides.                                                                        |
| `onOpenUrl`             | `(url, popup) => void`              | `undefined`      | Override URL handling. Default uses `Linking.openURL`.                                    |
| `onDismiss`             | `(popup) => void`                   | `undefined`      | Called when a popup is dismissed.                                                         |
| `useUserAgent`          | `boolean`                           | `false`          | If true, `CustomImage` includes a `User-Agent` header.                                    |
| `userAgent`             | `string`                            | `undefined`      | User-Agent value when `useUserAgent` is true.                                             |
| `showDelayMs`           | `number`                            | `0`              | Delay before showing a popup.                                                             |
| `safeAreaInsets`        | `Partial<RichModalInsets>`          | `undefined`      | Optional insets from app-level safe-area logic. If omitted, all insets default to `0`.    |
| `closeOnBackdropPress`  | `boolean`                           | `false`          | Close modal when backdrop is pressed (can be overridden per popup item).                  |
| `hideCloseButton`       | `boolean`                           | `false`          | Hide the close button UI (can be overridden per popup item).                              |
| `hideImage`             | `boolean`                           | `false`          | Hides image/media section for all rendered popups.                                        |
| `hideTitle`             | `boolean`                           | `false`          | Hides popup title text.                                                                   |
| `hideMessage`           | `boolean`                           | `false`          | Hides popup message text.                                                                 |
| `fullscreenImage`       | `boolean`                           | `false`          | Default fullscreen behavior for popups with images (can be overridden per popup item).    |
| `fullscreenImageResizeMode` | `'contain' \| 'cover'`         | `'contain'`      | Default resize mode for fullscreen image rendering (can be overridden per popup item).     |
| `panZoomEnabled`        | `boolean`                           | `false`          | Default pan+zoom behavior for popup images (can be overridden per popup item).             |
| `maxZoomScale`          | `number`                            | `3`              | Default maximum zoom scale when pan+zoom is enabled (can be overridden per popup item).    |
| `closeIcon`             | `ComponentType<{ size?, color? }>`  | built-in         | Custom close icon component.                                                              |
| `checkboxCheckedIcon`   | `ComponentType<{ size?, color? }>`  | built-in         | Custom checked icon component for the toggle row.                                         |
| `checkboxUncheckedIcon` | `ComponentType<{ size?, color? }>`  | built-in         | Custom unchecked icon component for the toggle row.                                       |
| `testIDPrefix`          | `string`                            | `"rich-modal"`   | Base prefix for generated test IDs used by modal/backdrop/content/close/checkbox/text/carousel nodes. |
| `theme`                 | `RichModalTheme`                    | built-in theme   | Override colors and overlay opacity.                                                      |
| `styleOverrides`        | `RichModalStyleOverrides`           | `undefined`      | Override styles for modal sections (text card, row, dots, etc.).                         |
| `components`            | `RichModalComponents`               | `undefined`      | Override renderers (`closeButton`, `dot`, `image`, `placeholder`, `checkboxRow`).        |

### Test IDs

If `testIDPrefix="rich-modal"` (default), RichModal generates:

- `rich-modal` (modal root)
- `rich-modal-backdrop`
- `rich-modal-container`
- `rich-modal-content`
- `rich-modal-close-button`
- `rich-modal-checkbox-row`
- `rich-modal-checkbox-label`
- `rich-modal-title`
- `rich-modal-message`
- `rich-modal-carousel`
- `rich-modal-carousel-item-0`, `rich-modal-carousel-item-1`, ...
- `rich-modal-carousel-dot-0`, `rich-modal-carousel-dot-1`, ...
- `rich-modal-image-0`, `rich-modal-image-1`, ...
- `rich-modal-placeholder-0`, `rich-modal-placeholder-1`, ...

When you provide custom renderers via `components`, each renderer now also receives an optional `testID` (and checkbox row also gets `labelTestID`) so you can preserve the same selectors.

## Filtering Rules

- `showVersionFrom` / `showVersionTo`: use semantic numeric versions like `1`, `1.2`, `1.2.3`.
- `showDateFrom` / `showDateTo` and `serverTime`: use valid ISO date strings (example: `2026-02-13T03:00:00.000+09:00`).

## PopupItemType

```ts
type PopupImageInput = {
  [langCode: string]:
    | string
    | {
        src?: string | null;
        title?: string | null;
        message?: string | null;
      }
    | undefined;
  title?: LocalizedText | string | null;
  message?: LocalizedText | string | null;
} | string;

export interface PopupItemType {
  id: string;
  imgSrc?: PopupImageInput | PopupImageInput[] | null;
  title?: LocalizedText | string | null;
  message?: LocalizedText | string | null;
  url?: LocalizedText | string | null;
  showVersionFrom?: string | null;
  showVersionTo?: string | null;
  showDateFrom?: string | null;
  showDateTo?: string | null;
  closeOnBackdropPress?: boolean | null;
  hideCloseButton?: boolean | null;
  panZoomEnabled?: boolean | null;
  maxZoomScale?: number | null;
  fullscreenImage?: boolean | null;
  fullscreenImageResizeMode?: 'contain' | 'cover' | null;
}
```

`imgSrc` array items can include per-language payloads like `{ en: { src, title, message }, ja: { ... } }`.
If image-level `title` / `message` exists for the active language, it replaces popup-level `title` / `message` while that image is active.
`url` accepts either a direct string or a localized object (for example `{ en: 'https://...', ja: 'https://...' }`).

Per-popup fullscreen + panZoom override example:

```ts
const popups: PopupItemType[] = [
  {
    id: 'campaign-1',
    imgSrc: ['https://example.com/banner.jpg'],
    closeOnBackdropPress: true,
    hideCloseButton: true,
    panZoomEnabled: true,
    maxZoomScale: 5,
    fullscreenImage: true,
    fullscreenImageResizeMode: 'cover',
  },
];
```

Resolution order:
- If a popup item defines `closeOnBackdropPress` / `hideCloseButton` / `panZoomEnabled` / `maxZoomScale` / `fullscreenImage` / `fullscreenImageResizeMode`, that value is used.
- Otherwise, `RichModal` falls back to the global prop values.

Dismiss behavior note:
- If `hideCloseButton === true` and `closeOnBackdropPress === false`, Android back button dismiss is also disabled for that popup.

## Storage Adapter Example

```ts
import type { RichModalStorage } from 'react-native-rich-modal';

const cache: Record<string, boolean> = {};

const storage: RichModalStorage = {
  getBoolean: (key) => cache[key],
  set: (key, value) => {
    cache[key] = value;
  },
};
```

`example/src/App.tsx` includes 5 pages:
1. Basic usage (minimal setup)
2. Theme + style overrides
3. Component renderer overrides
4. Storage-backed "dont show again"
5. Fullscreen image (`contain` / `cover`) with safe-area overlay controls

## License

MIT
