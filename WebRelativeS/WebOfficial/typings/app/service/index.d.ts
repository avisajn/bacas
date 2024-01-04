// This file is created by egg-ts-helper@1.26.0
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportFaq from '../../../app/service/faq';
import ExportIndex from '../../../app/service/Index';
import ExportLogistic from '../../../app/service/logistic';
import ExportPdf from '../../../app/service/pdf';
import ExportReseller from '../../../app/service/reseller';
import ExportShare from '../../../app/service/share';
import ExportSurvey from '../../../app/service/survey';
import ExportWarning from '../../../app/service/warning';

declare module 'egg' {
  interface IService {
    faq: AutoInstanceType<typeof ExportFaq>;
    index: AutoInstanceType<typeof ExportIndex>;
    logistic: AutoInstanceType<typeof ExportLogistic>;
    pdf: AutoInstanceType<typeof ExportPdf>;
    reseller: AutoInstanceType<typeof ExportReseller>;
    share: AutoInstanceType<typeof ExportShare>;
    survey: AutoInstanceType<typeof ExportSurvey>;
    warning: AutoInstanceType<typeof ExportWarning>;
  }
}
