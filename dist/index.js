"use strict";
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
module.exports = class Locke {
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
            const localeStrings = new Map();
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
                localeStrings.set(path.basename(file, ".yaml"), strings);
            }
            this.strings.set(locale, localeStrings);
        }
    }
    substitute(string, ...args) {
        let count = 0;
        if (args.length)
            return string.replace(/%var%/g, () => args[count] ? args[count++].toString() : "%var%");
        return string;
    }
    getString(locale, namespace, key, ...args) {
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
};
//# sourceMappingURL=index.js.map