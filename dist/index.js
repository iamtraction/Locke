"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locke = void 0;
const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");
class Locke {
    defaultLocale;
    directory;
    locales;
    constants;
    strings;
    constructor(options = {}) {
        this.defaultLocale = options.defaultLocale || "en-US";
        this.directory = options.directory || "locales";
        this.directory = path.resolve("./" + this.directory);
        this.locales = [];
        this.strings = new Map();
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
                let localeStrings = {};
                for (const file of files) {
                    const filePath = path.join(localePath, file);
                    if (fs.statSync(filePath).isDirectory())
                        continue;
                    localeStrings = Object.assign(localeStrings, this.loadStrings(filePath));
                }
                this.locales.push(localeFile);
                this.strings.set(localeFile, localeStrings);
            }
            else if (path.extname(localeFile) === ".yaml" && localeFile !== "constants.yaml") {
                const locale = path.parse(localeFile).name;
                this.locales.push(locale);
                this.strings.set(locale, this.loadStrings(localePath));
            }
        }
    }
    loadStrings(file) {
        const strings = YAML.parse(fs.readFileSync(file, "utf-8"));
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
    substitute(string, ...args) {
        let count = 0;
        if (args.length)
            return string.replace(/%var%/g, () => args[count] !== null && typeof args[count] !== "undefined" ? args[count++].toString() : "%var%");
        return string;
    }
    getConstant(key) {
        return this.constants?.[key];
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