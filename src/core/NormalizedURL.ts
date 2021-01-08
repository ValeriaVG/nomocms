export default class NormalizedURL extends URL {
  normalizedPath: string;
  paths: string[];
  constructor(path: string) {
    super(path, "http://0.0.0.0");

    const isFilePath = /\.(.+)$/.test(path);
    if (isFilePath || this.pathname.endsWith("/")) {
      this.normalizedPath = this.pathname;
      this.paths = [this.pathname];
      return;
    }
    this.normalizedPath = this.pathname + "/";
    this.paths = [this.normalizedPath, this.pathname];
  }
}
