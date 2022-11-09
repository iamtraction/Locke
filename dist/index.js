"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locke = void 0;
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
class Locke {
    directory;
    defaultLocale;
    locales;
    constants;
    strings;
    constructor(options = {}) {
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
        this.strings = new Map();
        for (const locale of this.locales) {
            const localeDirectory = path.join(this.directory, locale);
            const files = fs.readdirSync(localeDirectory);
            let localeStrings = {};
            for (const file of files) {
                const filePath = path.join(localeDirectory, file);
                if (fs.statSync(filePath).isDirectory())
                    continue;
                const strings = YAML.parse(fs.readFileSync(filePath, "utf-8"));
                if (this.constants) {
                    const constantsRegExp = new RegExp("%(?:" + Object.keys(this.constants).join("|") + ")%", "g");
                    for (const key in strings) {
                        if (Object.prototype.hasOwnProperty.call(strings, key)) {
                            strings[key] = strings[key].replace(constantsRegExp, matched => this.constants[matched.slice(1, -1)]);
                        }
                    }
                }
                localeStrings = Object.assign(localeStrings, strings);
            }
            this.strings.set(locale, localeStrings);
        }
    }
    substitute(string, ...args) {
        let count = 0;
        if (args.length)
            return string.replace(/%var%/g, () => args[count] !== null && typeof args[count] !== "undefined" ? args[count++].toString() : "%var%");
        return string;
    }
    getConstant(key) {
        return this.constants[key];
    }
    getLocales() {
        return this.locales;
    }
    getString(locale, key, ...args) {
        if (!this.strings.has(locale)) {
            locale = this.defaultLocale;
        }
        if (!this.strings.get(locale) || !Object.prototype.hasOwnProperty.call(this.strings.get(locale), key)) {
            if (locale === this.defaultLocale) {
                return `No string found for '${key}' in the locale '${locale}'.`;
            }
            return this.getString(this.defaultLocale, key, ...args);
        }
        return this.substitute(this.strings.get(locale)[key], ...args);
    }
}
exports.Locke = Locke;
//# sourceMappingURL=index.js.map