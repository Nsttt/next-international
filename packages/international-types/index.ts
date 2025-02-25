export type LocaleValue = string | number | boolean | null | undefined | Date;
export type BaseLocale = Record<string, LocaleValue>;

export type LocaleKeys<
  Locale extends BaseLocale,
  Scope extends Scopes<Locale> | undefined,
  Key extends string = Extract<keyof Locale, string>,
> = Scope extends undefined ? Key : Key extends `${Scope}.${infer Test}` ? Test : never;

type Delimiter = '=0' | '=1' | 'other';

type ExtractSentence<Value extends string> =
  Value extends `${Delimiter} {${infer Content}} ${Delimiter} ${string} ${Delimiter} ${string}`
    ? Content
    : Value extends `${Delimiter} {${infer Content}} ${Delimiter} ${string}`
    ? Content
    : never;

export type Params<Value extends LocaleValue> = Value extends ''
  ? []
  : // Plural form (e.g `{value, plural, =1 {...} other {...}}`)
  Value extends `{${infer Param}, ${string}, ${infer Tail}}`
  ? [Param, ...Params<ExtractSentence<Tail>>]
  : // Other params (e.g `This is a {param}`)
  Value extends `${string}{${infer Param}}${infer Tail}`
  ? [Param, ...Params<Tail>]
  : [];

type a =
  Params<'{length, plural, =0 {Please choose {label}.} =1 {{label} must have at least one character.} other {{label} must have at least # characters.}}'>;
type b = Params<'{nbRules, plural, =1 {{nbRules} rule} other {{nbRules} rules}}'>;
type c =
  Params<'{nbScopes, plural, =1 {{nbScopes} scope} other {{nbScopes} scopes}}, {nbPermissionSets, plural, =1 {{nbPermissionSets} permission set} other {{nbPermissionSets} permissions sets}}'>;
type d = Params<'{count, plural, =0 {Add a member} other {Add another member}'>;

export type ParamsObject<Value extends LocaleValue> = Record<Params<Value>[number], LocaleValue>;

type ExtractScopes<
  Value extends string,
  Prev extends string | undefined = undefined,
> = Value extends `${infer Head}.${infer Tail}`
  ? [
      Prev extends string ? `${Prev}.${Head}` : Head,
      ...ExtractScopes<Tail, Prev extends string ? `${Prev}.${Head}` : Head>,
    ]
  : [];

export type Scopes<Locale extends BaseLocale> = ExtractScopes<Extract<keyof Locale, string>>[number];

export type ScopedValue<
  Locale extends BaseLocale,
  Scope extends Scopes<Locale> | undefined,
  Key extends LocaleKeys<Locale, Scope>,
> = Scope extends undefined ? Locale[Key] : Locale[`${Scope}.${Key}`];
