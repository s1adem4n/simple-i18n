import { readFileSync, writeFileSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

interface Translation {
  key: string;
  value: string;
}

export interface Config {
  languages: string[];
  referenceLanguage: string;
  sourceDir: string;
  outputDir: string;
}

const match = /[^a-zA-Z]t\(['"]([^'"]+)['"]\)/g;

const ignoredExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'ico', 'pdf'];

export function build(config: Config) {
  const start = Date.now();
  const existingLocales: Record<string, Record<string, string>> = {};

  for (const language of config.languages) {
    const locale: Record<string, string> = {};
    const localePath = join(config.outputDir, `${language}.json`);
    try {
      statSync(localePath);
      const fileContent = readFileSync(localePath, 'utf-8');
      Object.assign(locale, JSON.parse(fileContent));
    } catch (err) {
      // File does not exist, continue
    }
    existingLocales[language] = locale;
  }

  const keys: string[] = [];
  const walk = (dir: string) => {
    const files = readdirSync(dir);
    for (const file of files) {
      const filePath = join(dir, file);
      const fileStat = statSync(filePath);

      if (fileStat.isDirectory()) {
        walk(filePath);
        continue;
      }

      const extension = file.split('.').pop();

      if (
        fileStat.isDirectory() ||
        !extension ||
        ignoredExtensions.includes(extension)
      ) {
        continue;
      }
      const data = readFileSync(filePath, 'utf-8');
      let matchResult;
      while ((matchResult = match.exec(data)) !== null) {
        keys.push(matchResult[1]);
      }
    }
  };

  walk(config.sourceDir);
  keys.sort();

  const locales: Record<string, Translation[]> = {};
  for (const key of keys) {
    for (const language of config.languages) {
      const locale = existingLocales[language];
      if (!locale[key]) {
        locale[key] = '';
      }
      if (!locales[language]) {
        locales[language] = [];
      }
      locales[language].push({ key, value: locale[key] });
    }
  }

  for (const [language, translations] of Object.entries(locales)) {
    const localePath = join(config.outputDir, `${language}.json`);
    const locale: Record<string, string> = {};
    for (const translation of translations) {
      locale[translation.key] = translation.value;
    }
    const fileContent = JSON.stringify(locale, null, 2);
    writeFileSync(localePath, fileContent, 'utf-8');
  }

  console.log(`Built i18n files in ${Date.now() - start}ms`);
}

export default build;
