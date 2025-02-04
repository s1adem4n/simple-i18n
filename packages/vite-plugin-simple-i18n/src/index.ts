import type { Plugin } from 'vite';
import { build, type Config } from '@slademan/simple-i18n';

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function i18n(config: Config): Plugin {
  return {
    name: 'i18n',
    buildStart() {
      build(config);
    },
    handleHotUpdate({ file }) {
      let re;
      if (process.platform === 'win32') {
        re = new RegExp(`.*\\\\${escapeRegex(config.outputDir)}\\\\.*\\.json`);
      } else {
        re = new RegExp(`.*/${escapeRegex(config.outputDir)}/.*\\.json`);
      }

      if (re.test(file)) {
        return;
      }

      build(config);
    },
  };
}
