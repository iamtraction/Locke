interface LockeOptions {
    directory?: string;
    defaultLocale?: string;
}
declare const _default: {
    new (options?: LockeOptions): {
        directory: string;
        defaultLocale: string;
        locales: string[];
        constants: {
            [key: string]: string;
        };
        strings: Map<string, Map<string, {
            [key: string]: string;
        }>>;
        substitute(string: string, ...args: unknown[]): string;
        getString(locale: string, namespace: string, key: string, ...args: unknown[]): string;
    };
};
export = _default;
//# sourceMappingURL=index.d.ts.map