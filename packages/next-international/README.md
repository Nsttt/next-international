<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/QuiiBz/next-international/blob/main/assets/logo-white.png">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/QuiiBz/next-international/blob/main/assets/logo-black.png" />
    <img alt="" height="100px" src="https://github.com/QuiiBz/next-international/blob/main/assets/logo-white.png">
  </picture>
  <br />
  Type-safe internationalization (i18n) for Next.js
</p>

---

- [Features](#features)
- [Usage](#usage)
- [Examples](#examples)
  - [Scoped translations](#scoped-translations)
  - [Change current locale](#change-current-locale)
  - [Fallback locale for missing translations](#fallback-locale-for-missing-translations)
  - [Use JSON files instead of TS for locales](#use-json-files-instead-of-ts-for-locales)
  - [Explicitly typing the locales](#explicitly-typing-the-locales)
  - [Load initial locales client-side](#load-initial-locales-client-side)
  - [Type-safety on locales files](#type-safety-on-locales-files)
  - [Use the types for my own library](#use-the-types-for-my-own-library)
- [License](#license)

## Features

- **100% Type-safe**: Locales in TS or JSON, type-safe `t()` & `scopedT()`, type-safe params
- **Small**: 1.2 KB gzipped (1.7 KB uncompressed), no dependencies
- **Simple**: No webpack configuration, no CLI, just pure TypeScript
- **SSR**: Load only the required locale, SSRed

> **Note**: You can now build on top of the types used by next-international using [international-types](https://github.com/QuiiBz/next-international/tree/main/packages/international-types)!

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
  getLocaleProps,
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

3. Wrap your whole app with `I18nProvider` inside `_app.tsx`:

```tsx
// pages/app.tsx
import { I18nProvider } from '../locales'

function App({ Component, pageProps }) {
  return (
    <I18nProvider locale={pageProps.locale}>
      <Component {...pageProps} />
    </I18nProvider>
  )
}
```

4. Add `getLocaleProps` to your pages, or wrap your existing `getStaticProps`  (this will allows SSR locales, see [Load initial locales client-side](#load-initial-locales-client-side) if you want to load the initial locale client-side):

```ts
// locales/index.tsx
export const getStaticProps = getLocaleProps()

// or with an existing `getStaticProps` function:
export const getStaticProps = getLocaleProps((ctx) => {
  // your existing code
  return {
    ...
  }
})
```

If you already have `getServerSideProps` on this page, you can't use `getStaticProps`. In this case, you can still use `getLocaleProps` the same way:

```ts
export const getServerSideProps = getLocaleProps()

// or with an existing `getServerSideProps` function:
export const getServerSideProps = getLocaleProps((ctx) => {
  // your existing code
  return {
    ...
  }
})
```

5. Use `useI18n`:

```tsx
import { useI18n } from '../locales'

function App() {
  const { t } = useI18n()
  return (
    <div>
      <p>{t('hello')}</p>
      <p>{t('welcome', { name: 'John' })}</p>
      <p>{t('welcome', { name: <strong>John</strong> })}</p>
    </div>
  )
}
```

## Examples

### Scoped translations

When you have a lot of keys, you may notice in a file that you always use and such duplicate the same scope:

```ts
// We always repeat `pages.settings`
t('pages.settings.title')
t('pages.settings.description', { identifier })
t('pages.settings.cta')
```

We can avoid this using scoped translations with the `scopedT` function from `useI18n`:

```ts
const { scopedT } = useI18n()
const t = scopedT('pages.settings')

t('title')
t('description', { identifier })
t('ct')
```

And of course, the scoped key, subsequents keys and params will still be 100% type-safe.

### Change current locale

Export `useChangeLocale` from `createI18n`:

```ts
// locales/index.ts
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

### Fallback locale for missing translations

It's common to have missing translations in an application. By default, next-international outputs the key when no translation is found for the current locale, to avoid sending to users uncessary data.

You can provide a fallback locale that will be used for all missing translations:

```tsx
// pages/_app.tsx
import { I18nProvider } from '../locales'
import en from '../locales/en'

<I18nProvider locale={pageProps.locale} fallbackLocale={en}>
  ...
</I18nProvider>
```

### Use JSON files instead of TS for locales

Currently, this breaks the parameters type-safety, so we recommend using the TS syntax. See this issue: https://github.com/microsoft/TypeScript/issues/32063.

You can still get type-safety by [explicitly typing the locales](#explicitly-typing-the-locales)

```ts
// locales/index.ts
import { createI18n } from 'next-international'
import type Locale from './en.json'

export const {
  useI18n,
  I18nProvider,
  getLocaleProps,
} = createI18n<typeof Locale>({
  en: () => import('./en.json'),
  fr: () => import('./fr.json'),
});
```

### Explicitly typing the locales

If you want to explicitly type the locale, you can create an interface that extends `BaseLocale` and use it as the generic in `createI18n`:

```ts
// locales/index.ts
import { createI18n, BaseLocale } from 'next-international'

interface Locale extends BaseLocale {
  'hello': string
  'welcome': string
}

export const {
  ...
} = createI18n<Locale>({
  en: () => import('./en.json'),
  fr: () => import('./fr.json'),
});
```

### Load initial locales client-side

> **Warning**: This should not be used unless you know what you're doing and what that implies.

If for x reason you don't want to SSR the initial locale, you can load it on the client. Simply remove the `getLocaleProps` from your pages.

You can also provide a fallback component while waiting for the initial locale to load inside `I18nProvider`:

```tsx
<I18nProvider locale={pageProps.locale} fallback={<p>Loading locales...</p>}>
  ...
</I18nProvider>
```

### Type-safety on locales files

Using `defineLocale`, you can make sure all your locale files implements all the keys of the base locale:

```ts
// locales/index.ts
export const {
  defineLocale
  ...
} = createI18n({
  ...
});
```

It's a simple wrapper function around other locales:

```ts
// locales/fr.ts
export default defineLocale({
  'hello': 'Bonjour',
  'welcome': 'Bonjour {name}!',
})
```

### Use the types for my own library

We also provide a separate package called [international-types](https://github.com/QuiiBz/next-international/tree/main/packages/international-types) that contains the utility types for next-international. You can build a library on top of it and get the same awesome type-safety.

## License

[MIT](./LICENSE)
