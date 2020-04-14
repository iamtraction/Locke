interface LockeOptions {
    directory?: string;
    defaultLocale?: string;
}
declare class Locke {
    private directory;
    private defaultLocale;
    private locales;
    private constants;
    private strings;
    constructor(options?: LockeOptions);
    private substitute;
    getConstant(key: string): string;
    getLocales(): string[];
    getString(locale: string, namespace: string, key: string, ...args: unknown[]): string;
}
export { Locke };
//# sourceMappingURL=index.d.ts.map