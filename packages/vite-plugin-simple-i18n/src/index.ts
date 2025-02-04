import type { Plugin } from 'vite';
import { build, type Options } from 'simple-i18n';

export default function i18n(options: Options): Plugin {
  return {
    name: 'i18n',
    async buildStart() {
      await build(options);
    },
    async handleHotUpdate({ file }) {
      let re;
      if (process.platform === 'win32') {
        re = new RegExp(
          `.*\\\\${options.outputDir.replace(/\\/g, '\\\\')}\\\\.*\\.json`
        );
      } else {
        re = new RegExp(`.*/${options.outputDir}/.*\\.json`);
      }

      if (re.test(file)) {
        return;
      }

      await build(options);
    },
  };
}
