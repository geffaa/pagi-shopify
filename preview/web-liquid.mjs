// Stands in for 'liquidjs' in the browser bundle: the same engine, reading the embedded files.
import { Liquid as Base, Tag, Hash, Drop } from 'liquidjs-real';
import { liquidFs } from './web-shims.mjs';
export { Tag, Hash, Drop };
export class Liquid extends Base {
  constructor(options = {}) {
    super({ ...options, fs: liquidFs });
  }
}
