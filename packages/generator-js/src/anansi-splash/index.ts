import { BetterGenerator } from '../utils';

module.exports = class extends BetterGenerator {
  writing() {
    this.fs.copyTpl(
      this.templatePath('src/**'),
      this.destinationPath(this.config.get('rootPath')),
      this.config.getAll(),
      {},
      { globOptions: { dot: true } },
    );
  }
};
