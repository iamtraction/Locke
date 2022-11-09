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
    getConstant(key: string): string;
    getLocales(): string[];
    private resolveVariables;
    getText(locale: string, key: string, variables: Variables): string;
}
export { Locke };
