// This file is created by egg-ts-helper@1.26.0
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportHost from '../../../app/middleware/host';

declare module 'egg' {
  interface IMiddleware {
    host: typeof ExportHost;
  }
}
