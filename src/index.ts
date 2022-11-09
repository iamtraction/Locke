/*!
 * @author TRACTION (iamtraction)
 * @copyright 2022
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as YAML from "yaml";

type LocaleStrings = { [key: string]: string };
type Variables = { [key: string]: unknown };

interface LockeOptions {
    /**
     * The the directory where locales are stored.
     * @default "locales"
     */
    directory?: string;
    /**
     * The default locale.
     * @default "en-US"
     */
    defaultLocale?: string;
}

class Locke {
    /** The default locale. */
    private defaultLocale: string;
    /** The the directory where locales are stored. */
    private directory: string;
    /** The available locales. */
    private locales: string[];
    /** The constant values across all locales. */
    private constants: LocaleStrings;
    /** Stores all the strings in all the locales. */
    private strings: Map<string, LocaleStrings>;

    constructor(options: LockeOptions = {}) {
        /* eslint-disable no-sync */
        this.defaultLocale = options.defaultLocale || "en-US";

        this.directory = options.directory || "locales";
        this.directory = path.resolve("./" + this.directory);

        this.locales = [];
        this.strings = new Map<string, LocaleStrings>();

        if (!fs.existsSync(this.directory)) {
            throw new Error(`The specified locales directory '${this.directory}' was not found.`);
        }

        const localeFiles = fs.readdirSync(this.directory);

        const constantsPath = path.join(this.directory, "constants.yaml");
        if (fs.existsSync(constantsPath)) {
            this.constants = YAML.parse(fs.readFileSync(constantsPath, "utf8"));
        }

        for (const localeFile of localeFiles) {
            const localePath = path.join(this.directory, localeFile);

            if (fs.statSync(localePath).isDirectory()) {
                const files = fs.readdirSync(localePath);

                let localeStrings: LocaleStrings = {};
                for (const file of files) {
                    const filePath = path.join(localePath, file);
                    if (fs.statSync(filePath).isDirectory()) continue;

                    localeStrings = Object.assign(localeStrings, this.loadStrings(filePath));
                }

                this.locales.push(localeFile);
                this.strings.set(localeFile, localeStrings);
            } else if (path.extname(localeFile) === ".yaml" && localeFile !== "constants.yaml") {
                const locale = path.parse(localeFile).name;

                this.locales.push(locale);
                this.strings.set(locale, this.loadStrings(localePath));
            }
        }
        /* eslint-enable no-sync */
    }

    /**
     * Returns the strings from the specified file with the constants substituted.
     */
    private loadStrings(file: string): LocaleStrings {
        const strings: LocaleStrings = YAML.parse(fs.readFileSync(file, "utf-8"));
        if (this.constants) {
            const constantsRegExp = new RegExp("%(?:" + Object.keys(this.constants).join("|") + ")%", "g");
            for (const key in strings) {
                if (Object.prototype.hasOwnProperty.call(strings, key)) {
                    strings[key] = strings[key].replace(constantsRegExp, matched => this.constants[matched.slice(1, -1)]);
                }
            }
        }
        return strings;
    }

    /**
     * Returns the constant string for the specified key
     */
    public getConstant(key: string): string {
        return this.constants?.[key];
    }

    /**
     * Returns the available locales.
     */
    public getLocales(): string[] {
        return this.locales;
    }

    /**
     * Returns the text after substituting values of the specified variables.
     */
    private resolveVariables(text: string, variables: Variables): string {
        for (const [ key, value ] of Object.entries(variables || {})) {
            text = text.replaceAll(`%${key}%`, String(value));
        }
        return text;
    }

    /**
     * Returns the text for the specified key in the specified locale. It also
     * substitutes all the variables in the text with their specified values.
     */
    public getText(locale: string, key: string, variables: Variables): string {
        if (!this.strings.get(locale) || !Object.prototype.hasOwnProperty.call(this.strings.get(locale), key)) {
            if (locale === this.defaultLocale) {
                return `No string found for '${key}' in the locale '${locale}'.`;
            }
            return this.getText(this.defaultLocale, key, variables);
        }

        return this.resolveVariables(this.strings.get(locale)[key], variables);
    }
}

export { Locke };
