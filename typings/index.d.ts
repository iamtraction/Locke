interface LockeOptions {
    directory?: string;
    defaultLocale?: string;
}
declare class Locke {
    private defaultLocale;
    private directory;
    private locales;
    private constants;
    private strings;
    constructor(options?: LockeOptions);
    private loadStrings;
    private substitute;
    getConstant(key: string): string;
    getLocales(): string[];
    getString(locale: string, key: string, ...args: unknown[]): string;
}
export { Locke };
