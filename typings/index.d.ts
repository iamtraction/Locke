declare type Variables = {
    [key: string]: unknown;
};
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
    private resolveVariables;
    getText(locale: string, key: string, variables: Variables): string;
}
export { Locke };
