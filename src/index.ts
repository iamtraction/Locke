import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";

interface LockeOptions {
    /** The the directory where locales are stored. */
    directory?: string;
    /** The default locale. */
    defaultLocale?: string;
}

export = class Locke {
    /** The the directory where locales are stored. */
    private directory: string;
    /** The default locale. */
    private defaultLocale: string;
    /** The available locales. */
    private locales: string[];
    /** The constant values across all locales. */
    private constants: { [key: string]: string };
    /** Stores all the strings in all the locales. */
    private strings: Map<string, Map<string, { [key: string]: string }>>;

    constructor(options: LockeOptions = {}) {
        /* eslint-disable no-sync */
        this.defaultLocale = options.defaultLocale || "en_us";

        this.directory = options.directory || "locales";
        this.directory = path.resolve("./" + this.directory);

        if (!fs.existsSync(this.directory)) {
            throw new Error(`The specified locales directory '${this.directory}' was not found.`);
        }

        this.locales = fs.readdirSync(this.directory).filter(file => fs.statSync(path.join(this.directory, file)).isDirectory());

        const constantsPath = path.join(this.directory, "constants.yaml");
        if (fs.existsSync(constantsPath)) {
            this.constants = YAML.parse(fs.readFileSync(constantsPath, "utf8"));
        }

        this.strings = new Map<string, Map<string, { [key: string]: string }>>();
        for (const locale of this.locales) {
            const localeDirectory = path.join(this.directory, locale);
            const files = fs.readdirSync(localeDirectory);

            const localeStrings = new Map<string, { [key: string]: string }>();
            for (const file of files) {
                const filePath = path.join(localeDirectory, file);
                if (fs.statSync(filePath).isDirectory()) continue;

                const strings: { [key: string]: string } = YAML.parse(fs.readFileSync(filePath, "utf-8"));
                if (this.constants) {
                    const constantsRegExp = new RegExp("%(?:" + Object.keys(this.constants).join("|") + ")%", "g");
                    for (const key in strings) {
                        if (Object.prototype.hasOwnProperty.call(strings, key)) {
                            strings[key] = strings[key].replace(constantsRegExp, matched => this.constants[matched.slice(1, -1)]);
                        }
                    }
                }
                localeStrings.set(path.basename(file, ".yaml"), strings);
            }

            this.strings.set(locale, localeStrings);
        }
        /* eslint-enable no-sync */
    }

    /**
     * Returns a string with substitutions of %var% with the variables
     * in `args`.
     */
    private substitute(string: string, ...args: unknown[]): string {
        let count = 0;
        if (args.length) return string.replace(/%var%/g, () => args[count] ? args[count++].toString() : "%var%");
        return string;
    }

    /**
     * Returns a string for the specified key in the specified language,
     * in the specified namespace of the specified locale.
     */
    public getString(locale: string, namespace: string, key: string, ...args: unknown[]): string {
        if (!this.strings.has(locale)) {
            locale = this.defaultLocale;
        }

        if (!this.strings.get(locale).has(namespace) || !Object.prototype.hasOwnProperty.call(this.strings.get(locale).get(namespace), key)) {
            if (locale === this.defaultLocale) {
                return `No string found for '${namespace}::${key}' in the locale '${locale}'.`;
            }
            return this.getString(this.defaultLocale, namespace, key, ...args);
        }

        return this.substitute(this.strings.get(locale).get(namespace)[key], ...args);
    }
}
