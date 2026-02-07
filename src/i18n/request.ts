import { getRequestConfig } from 'next-intl/server';

function deepMerge(target: any, source: any) {
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !['en', 'ko'].includes(locale)) {
        locale = 'ko';
    }

    const common = (await import(`../../messages/${locale}/common.json`)).default;
    const catalog = (await import(`../../messages/${locale}/catalog.json`)).default;
    const suites = (await import(`../../messages/${locale}/suites.json`)).default;
    const tools = (await import(`../../messages/${locale}/tools.json`)).default;
    const legal = (await import(`../../messages/${locale}/legal.json`)).default;
    const youtube = (await import(`../../messages/${locale}/youtube.json`)).default;

    const messages = {};
    deepMerge(messages, common);
    deepMerge(messages, catalog);
    deepMerge(messages, suites);
    deepMerge(messages, tools);
    deepMerge(messages, legal);
    deepMerge(messages, youtube);

    return {
        locale,
        messages
    };
});
