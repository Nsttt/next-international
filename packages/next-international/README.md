<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/logo-white.png">
    <source media="(prefers-color-scheme: light)" srcset="./assets/logo-black.png" />
    <img alt="" height="80px" src="./assets/logo-white.png">
  </picture>
  <br />
  Type-safe internationalization (i18n) for Next.js
</p>

---

- [Features](#features)
- [Usage](#usage)
- [Examples](#examples)
  - [Change current language](#change-current-language)
  - [Use JSON files instead of TS for locales](#use-json-files-instead-of-ts-for-locales)
- [License](#license)

## Features

- **100% Type-safe**: Locales in TS or JSON, type-safe `t()`, type-safe params
- **Small**: 1.2 KB gzipped (1.7 KB uncompressed), no dependencies
- **Simple**: No webpack configuration, no CLI, just pure TypeScript
- **SSR**: Load only the required locale, SSRed

## Usage

```bash
pnpm install next-international
```

1. Make sure that you've followed [Next.js Internationalized Routing](https://nextjs.org/docs/advanced-features/i18n-routing), and that `strict` is set to `true` in your `tsconfig.json`

2. Create `locales/index.ts` with your locales:

```ts
import { createI18n } from 'next-international'
import type Locale from './en'

export const {
  useI18n,
  I18nProvider,
  getLocaleStaticProps,
} = createI18n<typeof Locale>({
  en: () => import('./en'),
  fr: () => import('./fr'),
});
```

Each locale file should export a default object (don't forget `as const`):

```ts
// locales/en.ts
export default {
  'hello': 'Hello',
  'welcome': 'Hello {name}!',
} as const
```

3. Add `getLocaleStaticProps` to your pages if you want SSR, or wrap your existing `getStaticProps`:

```ts
// pages/index.tsx
export const getStaticProps = getLocaleStaticProps()

// or with an existing `getStaticProps` function:
export const getStaticProps = getLocaleStaticProps((ctx) => {
  // your existing code
  return {
    ...
  }
})
```

4. Use `useI18n`:

```tsx
import { useI18n } from '../locales'

function App() {
  const t = useI18n()
  return (
    <div>
      <p>{t('hello')}</p>
      <p>{t('welcome', { name: 'John' })}</p>
    </div>
  )
}
```

## Examples

### Change current language

Export `useChangeLocale` from `createI18n`:
```tsx
export const {
  useChangeLocale,
  ...
} = createI18n({
  ...
});
```

Then use this as a hook:
```tsx
import { useChangeLocale } from '../locales'

function App() {
  const changeLocale = useChangeLocale()

  return (
    <button onClick={() => changeLocale('en')}>English</button>
    <button onClick={() => changeLocale('fr')}>French</button>
  )
}
```

### Use JSON files instead of TS for locales

Currently, this breaks the parameters type-safety, so we recommend using the TS syntax. See this issue: https://github.com/microsoft/TypeScript/issues/32063.

```ts
import { createI18n } from 'next-international'
import type Locale from './en.json'

export const {
  useI18n,
  I18nProvider,
  getLocaleStaticProps,
} = createI18n<typeof Locale>({
  en: () => import('./en.json'),
  fr: () => import('./fr.json'),
});
```

## License

[MIT](./LICENSE)