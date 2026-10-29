"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { Product } from "@/shared/types/product";

export type StoreLocale = "ky" | "ru" | "en";
export type StoreCurrency = "KGS" | "RUB" | "USD";

const localeOptions: { value: StoreLocale; label: string }[] = [
  { value: "ky", label: "КР" },
  { value: "ru", label: "РУ" },
  { value: "en", label: "EN" },
];

const currencyOptions: StoreCurrency[] = ["KGS", "RUB", "USD"];

const localeStorageKey = "mimo-locale";
const currencyStorageKey = "mimo-currency";
const settingsChangedEvent = "mimo-storefront-settings";

function subscribeToSettings(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(settingsChangedEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(settingsChangedEvent, onChange);
  };
}

function readLocale(): StoreLocale {
  const saved = window.localStorage.getItem(localeStorageKey);
  return saved === "ky" || saved === "en" ? saved : "ru";
}

function readCurrency(): StoreCurrency {
  const saved = window.localStorage.getItem(currencyStorageKey);
  return saved === "RUB" || saved === "USD" ? saved : "KGS";
}

function getDefaultLocale(): StoreLocale {
  return "ru";
}

function getDefaultCurrency(): StoreCurrency {
  return "KGS";
}

const copy: Record<StoreLocale, Record<string, string>> = {
  ru: {
    home: "Главная",
    shop: "Магазин",
    contact: "Контакты",
    about: "О нас",
    allProducts: "Все товары",
    menu: "Меню",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    search: "Поиск",
    searchProducts: "Найти товар",
    cart: "Корзина",
    deliveryNotice: "Доставка по всему Кыргызстану · Скоро условия заказа",
    language: "Язык",
    currency: "Валюта",
    close: "Закрыть",
    filter: "Фильтр",
    sortBy: "Сортировка",
    featured: "Рекомендуемые",
    newest: "Сначала новые",
    priceLow: "Сначала дешевле",
    priceHigh: "Сначала дороже",
    nameAsc: "По названию: А–Я",
    nameDesc: "По названию: Я–А",
    results: "Результаты поиска",
    collection: "Весь ассортимент",
    productCount: "товаров",
    all: "Все товары",
    find: "Найти товар",
    loadingCatalog: "Загружаем коллекцию…",
    catalogError: "Не удалось загрузить каталог.",
    emptyTitle: "Пока ничего не найдено",
    emptyHint: "Попробуйте изменить фильтры.",
    addToCart: "В корзину",
    inCart: "В корзине",
    chooseOption: "Выбрать вариант",
    outOfStock: "Нет в наличии",
    collectionForChildhood: "Коллекция для детства",
    everydayThings: "Вещи на каждый день",
    shopCollection: "Смотреть коллекцию",
    newArrivals: "Для маленьких открытий",
    featuredProducts: "Новая коллекция",
    viewAll: "Смотреть все",
    product: "Товар",
    selection: "Ваш выбор",
    loadingCart: "Загружаем корзину…",
    cartError: "Не удалось загрузить товары в корзине. Обновите страницу.",
    emptyCart: "В корзине пока пусто",
    emptyCartHint: "Самое время найти что-нибудь уютное.",
    goToCatalog: "Перейти в каталог",
    quantity: "Количество",
    amount: "Стоимость",
    delete: "Удалить",
    total: "Итого",
    itemsTotal: "Сумма товаров",
    checkoutLater: "Оформление заказа и выбор доставки появятся следующим этапом.",
    checkoutSoon: "Скоро: оформить заказ",
    continueShopping: "Продолжить покупки",
    backToCatalog: "Вернуться в каталог",
    loadingProduct: "Загружаем товар…",
    notFound: "Товар не найден",
    color: "Цвет",
    selectColor: "выберите",
    size: "Размер",
    chooseAvailable: "Выберите доступный вариант",
    chooseVariant: "Выбрать вариант",
    deliveryInKyrgyzstan: "Доставка по Кыргызстану",
    sizeHelp: "Поможем подобрать размер и ответим на вопросы о товаре",
    age: "Возраст",
    aboutEyebrow: "Наша философия",
    aboutTitle: "Детство — время быть собой",
    aboutText: "Мы выбираем вещи для маленьких открытий: удобные, приятные к телу и готовые к каждому новому дню.",
    aboutPromise: "Меньше лишнего. Больше детства.",
    aboutStory: "Небольшой магазин вещей, в которых детям удобно расти, исследовать мир и оставаться собой.",
    contactTitle: "Связаться с нами",
    contactText: "Есть вопрос о товаре, размере или доставке? Мы будем рады помочь.",
    contactDetails: "Контактные данные магазина добавим перед запуском.",
    backHome: "На главную",
    chooseLanguage: "Выберите язык",
    chooseCurrency: "Выберите валюту",
    currencyDisclaimer: "Цены в рублях и долларах — ориентировочные. Расчёт заказов ведётся в сомах.",
    delivery: "Доставка",
    footerCountry: "Кыргызстан",
    decrease: "Уменьшить количество",
    increase: "Увеличить количество",
    photo: "Фото",
    footerShop: "Магазин",
    next: "Далее",
    previous: "Назад",
  },
  ky: {
    home: "Башкы бет",
    shop: "Дүкөн",
    contact: "Байланыш",
    about: "Биз жөнүндө",
    allProducts: "Бардык товарлар",
    menu: "Меню",
    openMenu: "Менюну ачуу",
    closeMenu: "Менюну жабуу",
    search: "Издөө",
    searchProducts: "Товарды табуу",
    cart: "Себет",
    deliveryNotice: "Кыргызстан боюнча жеткирүү · Буйрутма шарттары жакында",
    language: "Тил",
    currency: "Валюта",
    close: "Жабуу",
    filter: "Чыпка",
    sortBy: "Иреттөө",
    featured: "Сунушталгандар",
    newest: "Адегенде жаңылары",
    priceLow: "Адегенде арзандары",
    priceHigh: "Адегенде кымбаттары",
    nameAsc: "Аталышы боюнча: А–Я",
    nameDesc: "Аталышы боюнча: Я–А",
    results: "Издөө жыйынтыгы",
    collection: "Бардык товарлар",
    productCount: "товар",
    all: "Бардык товарлар",
    find: "Товарды табуу",
    loadingCatalog: "Товарлар жүктөлүүдө…",
    catalogError: "Товарларды жүктөө мүмкүн болгон жок.",
    emptyTitle: "Азырынча товар табылган жок",
    emptyHint: "Чыпкаларды өзгөртүп көрүңүз.",
    addToCart: "Себетке",
    inCart: "Себетте",
    chooseOption: "Тандоо",
    outOfStock: "Калган жок",
    collectionForChildhood: "Балалык үчүн коллекция",
    everydayThings: "Күнүмдүк буюмдар",
    shopCollection: "Коллекцияны көрүү",
    newArrivals: "Кичинекей ачылыштар үчүн",
    featuredProducts: "Жаңы коллекция",
    viewAll: "Баарын көрүү",
    product: "Товар",
    selection: "Сиздин тандооңуз",
    loadingCart: "Себет жүктөлүүдө…",
    cartError: "Себеттеги товарларды жүктөө мүмкүн болгон жок. Баракты жаңыртыңыз.",
    emptyCart: "Себет азырынча бош",
    emptyCartHint: "Жагымдуу нерсе табууга убакыт келди.",
    goToCatalog: "Каталогго өтүү",
    quantity: "Саны",
    amount: "Баасы",
    delete: "Өчүрүү",
    total: "Жалпы",
    itemsTotal: "Товарлардын суммасы",
    checkoutLater: "Буйрутма берүү жана жеткирүүнү тандоо кийинки этапта кошулат.",
    checkoutSoon: "Жакында: буйрутма берүү",
    continueShopping: "Сатып алууну улантуу",
    backToCatalog: "Каталогго кайтуу",
    loadingProduct: "Товар жүктөлүүдө…",
    notFound: "Товар табылган жок",
    color: "Түсү",
    selectColor: "тандаңыз",
    size: "Өлчөмү",
    chooseAvailable: "Жеткиликтүү вариантты тандаңыз",
    chooseVariant: "Вариантты тандоо",
    deliveryInKyrgyzstan: "Кыргызстан боюнча жеткирүү",
    sizeHelp: "Өлчөмдү тандоого жардам берип, суроолоруңузга жооп беребиз",
    age: "Жашы",
    aboutEyebrow: "Биздин философия",
    aboutTitle: "Балалык — өзүң болууга убакыт",
    aboutText: "Кичинекей ачылыштар үчүн ыңгайлуу, жумшак жана ар бир жаңы күнгө даяр буюмдарды тандайбыз.",
    aboutPromise: "Ашыкча нерсе аз. Балалык көп.",
    aboutStory: "Балдарга чоңоюуга, дүйнөнү таанууга жана өзүндөй бойдон калууга ыңгайлуу буюмдардын чакан дүкөнү.",
    contactTitle: "Биз менен байланышыңыз",
    contactText: "Товар, өлчөм же жеткирүү боюнча сурооңуз барбы? Жардам берүүгө даярбыз.",
    contactDetails: "Дүкөндүн байланыш маалыматтары ачылар алдында кошулат.",
    backHome: "Башкы бетке",
    chooseLanguage: "Тилди тандаңыз",
    chooseCurrency: "Валютаны тандаңыз",
    currencyDisclaimer: "Рубль жана доллардагы баалар болжолдуу. Буйрутмалар сом менен эсептелет.",
    delivery: "Жеткирүү",
    footerCountry: "Кыргызстан",
    decrease: "Санын азайтуу",
    increase: "Санын көбөйтүү",
    photo: "Сүрөт",
    footerShop: "Дүкөн",
    next: "Кийинки",
    previous: "Артка",
  },
  en: {
    home: "Home",
    shop: "Shop",
    contact: "Contact",
    about: "About us",
    allProducts: "Shop all",
    menu: "Menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    search: "Search",
    searchProducts: "Find a product",
    cart: "Cart",
    deliveryNotice: "Delivery across Kyrgyzstan · Order details coming soon",
    language: "Language",
    currency: "Currency",
    close: "Close",
    filter: "Filter",
    sortBy: "Sort by",
    featured: "Featured",
    newest: "Newest",
    priceLow: "Price: low to high",
    priceHigh: "Price: high to low",
    nameAsc: "Name: A–Z",
    nameDesc: "Name: Z–A",
    results: "Search results",
    collection: "Shop all",
    productCount: "products",
    all: "All products",
    find: "Find a product",
    loadingCatalog: "Loading collection…",
    catalogError: "Could not load the catalog.",
    emptyTitle: "Nothing found",
    emptyHint: "Try changing your filters.",
    addToCart: "Add to cart",
    inCart: "In cart",
    chooseOption: "Choose an option",
    outOfStock: "Sold out",
    collectionForChildhood: "A collection for childhood",
    everydayThings: "Made for every day",
    shopCollection: "Explore the collection",
    newArrivals: "For little discoveries",
    featuredProducts: "New collection",
    viewAll: "View all",
    product: "Product",
    selection: "Your selection",
    loadingCart: "Loading cart…",
    cartError: "Could not load your cart. Please refresh the page.",
    emptyCart: "Your cart is empty",
    emptyCartHint: "Find something lovely for little everyday moments.",
    goToCatalog: "Explore the shop",
    quantity: "Quantity",
    amount: "Amount",
    delete: "Remove",
    total: "Total",
    itemsTotal: "Subtotal",
    checkoutLater: "Checkout and delivery options will be available in a later update.",
    checkoutSoon: "Checkout coming soon",
    continueShopping: "Continue shopping",
    backToCatalog: "Back to the shop",
    loadingProduct: "Loading product…",
    notFound: "Product not found",
    color: "Color",
    selectColor: "select",
    size: "Size",
    chooseAvailable: "Choose an available option",
    chooseVariant: "Choose an option",
    deliveryInKyrgyzstan: "Delivery across Kyrgyzstan",
    sizeHelp: "We can help with sizing and answer product questions",
    age: "Age",
    aboutEyebrow: "Our philosophy",
    aboutTitle: "Childhood is a time to be yourself",
    aboutText: "We choose pieces for little discoveries: comfortable, gentle on the skin and ready for every new day.",
    aboutPromise: "Less fuss. More childhood.",
    aboutStory: "A small shop of everyday pieces made for children to grow, explore and be themselves.",
    contactTitle: "Get in touch",
    contactText: "Questions about a product, sizing or delivery? We would love to help.",
    contactDetails: "Store contact details will be added before launch.",
    backHome: "Back home",
    chooseLanguage: "Choose language",
    chooseCurrency: "Choose currency",
    currencyDisclaimer: "Ruble and dollar prices are estimates. Orders are calculated in som.",
    delivery: "Delivery",
    footerCountry: "Kyrgyzstan",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    photo: "Photo",
    footerShop: "Shop",
    next: "Next",
    previous: "Back",
  },
};

const badgeTranslations: Record<string, Record<StoreLocale, string>> = {
  Новинка: { ru: "Новинка", ky: "Жаңы", en: "New" },
  Бестселлер: { ru: "Бестселлер", ky: "Көп сатылган", en: "Bestseller" },
};

const productTranslations: Record<string, Record<StoreLocale, string>> = {
  "Комплект «Облачко»": { ru: "Комплект «Облачко»", ky: "«Булут» топтому", en: "Cloud Set" },
  "Платье из мягкого льна": { ru: "Платье из мягкого льна", ky: "Жумшак зыгыр көйнөк", en: "Soft Linen Dress" },
  "Первые мягкие кеды": { ru: "Первые мягкие кеды", ky: "Алгачкы жумшак кедалар", en: "First Soft Sneakers" },
  "Кардиган «Тёплый день»": { ru: "Кардиган «Тёплый день»", ky: "«Жылуу күн» кардиганы", en: "Warm Day Cardigan" },
  "Шапочка «Росток»": { ru: "Шапочка «Росток»", ky: "«Өсүмдүк» баш кийими", en: "Little Sprout Hat" },
  "Плед «Тихий час»": { ru: "Плед «Тихий час»", ky: "«Тынч саат» жамынгычы", en: "Quiet Time Blanket" },
  "Комбинезон «На прогулку»": { ru: "Комбинезон «На прогулку»", ky: "Сейилдөө үчүн комбинезон", en: "Ready to Explore Romper" },
  "Сумка для маленьких находок": { ru: "Сумка для маленьких находок", ky: "Кичинекей буюмдар үчүн баштык", en: "Little Treasures Bag" },
  "Viva la vida": { ru: "Viva la vida", ky: "Viva la vida", en: "Viva la vida" },
};

const categoryTranslations: Record<string, Record<StoreLocale, string>> = {
  Одежда: { ru: "Одежда", ky: "Кийим", en: "Clothing" },
  Обувь: { ru: "Обувь", ky: "Бут кийим", en: "Shoes" },
  Аксессуары: { ru: "Аксессуары", ky: "Аксессуарлар", en: "Accessories" },
  "Для дома": { ru: "Для дома", ky: "Үй үчүн", en: "Home" },
};

const variantTranslations: Record<string, Record<StoreLocale, string>> = {
  Молочный: { ru: "Молочный", ky: "Сүт түстүү", en: "Milk" },
  Песочный: { ru: "Песочный", ky: "Кум түстүү", en: "Sand" },
  Пудровый: { ru: "Пудровый", ky: "Пудра түстүү", en: "Powder" },
  Овсяный: { ru: "Овсяный", ky: "Сулу түстүү", en: "Oat" },
  Травяной: { ru: "Травяной", ky: "Чөп түстүү", en: "Grass" },
  Шалфей: { ru: "Шалфей", ky: "Шалфей", en: "Sage" },
  Кремовый: { ru: "Кремовый", ky: "Крем түстүү", en: "Cream" },
  Единый: { ru: "Единый", ky: "Бирдиктүү", en: "One size" },
};

const descriptionTranslations: Record<string, Record<StoreLocale, string>> = {
  "Мягкий комплект на каждый день: свободный крой и приятный к телу хлопок.": {
    ru: "Мягкий комплект на каждый день: свободный крой и приятный к телу хлопок.",
    ky: "Ар бир күнгө ылайыктуу жумшак топтом: кенен бычым жана денеге жагымдуу пахта.",
    en: "A soft everyday set with a relaxed fit and gentle cotton.",
  },
  "Лёгкое платье свободного силуэта для прогулок и праздников.": {
    ru: "Лёгкое платье свободного силуэта для прогулок и праздников.",
    ky: "Сейилдөө жана майрамдар үчүн жеңил, кенен көйнөк.",
    en: "A breezy, relaxed-fit dress for everyday outings and special days.",
  },
  "Лёгкие кеды для первых уверенных шагов и больших открытий.": {
    ru: "Лёгкие кеды для первых уверенных шагов и больших открытий.",
    ky: "Алгачкы ишенимдүү кадамдар жана чоң ачылыштар үчүн жеңил кедалар.",
    en: "Lightweight sneakers for first confident steps and big discoveries.",
  },
  "Уютный мягкий кардиган, который легко сочетать с любимыми вещами.": {
    ru: "Уютный мягкий кардиган, который легко сочетать с любимыми вещами.",
    ky: "Сүйүктүү кийимдер менен оңой айкалышкан жайлуу, жумшак кардиган.",
    en: "A cosy, soft cardigan that pairs easily with favourite pieces.",
  },
  "Мягкая шапочка из хлопка для прохладных прогулок.": {
    ru: "Мягкая шапочка из хлопка для прохладных прогулок.",
    ky: "Салкын күндөрдөгү сейилдөө үчүн жумшак пахта баш кийими.",
    en: "A soft cotton hat for cooler walks.",
  },
  "Нежный плед для сна, прогулок и спокойных домашних вечеров.": {
    ru: "Нежный плед для сна, прогулок и спокойных домашних вечеров.",
    ky: "Уйкуга, сейилдөөгө жана үйдөгү тынч кечтерге арналган жумшак жамынгыч.",
    en: "A gentle blanket for naps, strolls and quiet evenings at home.",
  },
  "Практичный комбинезон с удобными застёжками для прогулок.": {
    ru: "Практичный комбинезон с удобными застёжками для прогулок.",
    ky: "Сейилдөө үчүн ыңгайлуу илгичтери бар практикалык комбинезон.",
    en: "A practical romper with easy fastenings, made for going out.",
  },
  "Небольшая сумка для прогулок, игрушек и важных сокровищ.": {
    ru: "Небольшая сумка для прогулок, игрушек и важных сокровищ.",
    ky: "Сейилдөө, оюнчуктар жана баалуу майда буюмдар үчүн чакан баштык.",
    en: "A little bag for walks, toys and important treasures.",
  },
};

const ageTranslations: Record<string, Record<StoreLocale, string>> = {
  "6–24 мес.": { ru: "6–24 мес.", ky: "6–24 ай", en: "6–24 months" },
  "1–5 лет": { ru: "1–5 лет", ky: "1–5 жаш", en: "1–5 years" },
  "18–36 мес.": { ru: "18–36 мес.", ky: "18–36 ай", en: "18–36 months" },
  "1–4 года": { ru: "1–4 года", ky: "1–4 жаш", en: "1–4 years" },
  "0–18 мес.": { ru: "0–18 мес.", ky: "0–18 ай", en: "0–18 months" },
  "3–18 мес.": { ru: "3–18 мес.", ky: "3–18 ай", en: "3–18 months" },
  "100 × 80 см": { ru: "100 × 80 см", ky: "100 × 80 см", en: "100 × 80 cm" },
  "Один размер": { ru: "Один размер", ky: "Бир өлчөм", en: "One size" },
};

type StorefrontContextValue = {
  locale: StoreLocale;
  currency: StoreCurrency;
  localeOptions: typeof localeOptions;
  currencyOptions: readonly StoreCurrency[];
  setLocale: (locale: StoreLocale) => void;
  setCurrency: (currency: StoreCurrency) => void;
  t: (key: string) => string;
  formatPrice: (price: number) => string;
  productName: (product: Product) => string;
  productDescription: (product: Product) => string;
  categoryName: (category: string) => string;
  variantLabel: (value: string) => string;
  badgeLabel: (value: string) => string;
  ageLabel: (value: string) => string;
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function StorefrontProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = useSyncExternalStore(
    subscribeToSettings,
    readLocale,
    getDefaultLocale,
  );
  const currency = useSyncExternalStore(
    subscribeToSettings,
    readCurrency,
    getDefaultCurrency,
  );
  const setLocale = useCallback((value: StoreLocale) => {
    window.localStorage.setItem(localeStorageKey, value);
    window.dispatchEvent(new Event(settingsChangedEvent));
  }, []);
  const setCurrency = useCallback((value: StoreCurrency) => {
    window.localStorage.setItem(currencyStorageKey, value);
    window.dispatchEvent(new Event(settingsChangedEvent));
  }, []);

  const value = useMemo<StorefrontContextValue>(
    () => ({
      locale,
      currency,
      localeOptions,
      currencyOptions,
      setLocale,
      setCurrency,
      t: (key) => copy[locale][key] ?? copy.ru[key] ?? key,
      formatPrice: (price) => {
        // Demo display rates only; use a live exchange-rate source before launch.
        const rates: Record<StoreCurrency, number> = {
          KGS: 1,
          RUB: 1.05,
          USD: 0.0114,
        };
        const localeTag = locale === "ky" ? "ky-KG" : locale === "en" ? "en-US" : "ru-RU";
        const amount = price * rates[currency];
        if (currency === "KGS") {
          const number = new Intl.NumberFormat(localeTag, {
            maximumFractionDigits: 0,
          }).format(amount);
          return `${number} ${locale === "en" ? "KGS" : "сом"}`;
        }
        return new Intl.NumberFormat(localeTag, {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        }).format(amount);
      },
      productName: (product) =>
        productTranslations[product.name]?.[locale] ?? product.name,
      productDescription: (product) =>
        descriptionTranslations[product.description]?.[locale] ?? product.description,
      categoryName: (category) =>
        categoryTranslations[category]?.[locale] ?? category,
      variantLabel: (variant) =>
        variantTranslations[variant]?.[locale] ?? variant,
      badgeLabel: (badge) => badgeTranslations[badge]?.[locale] ?? badge,
      ageLabel: (age) => ageTranslations[age]?.[locale] ?? age,
    }),
    [currency, locale, setCurrency, setLocale],
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  const value = useContext(StorefrontContext);
  if (!value) {
    throw new Error("useStorefront должен использоваться внутри StorefrontProvider");
  }
  return value;
}
