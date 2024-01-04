// This file is created by egg-ts-helper@1.26.0
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAdminApi from '../../../app/controller/adminApi';
import ExportBaca from '../../../app/controller/baca';
import ExportFaq from '../../../app/controller/faq';
import ExportHome from '../../../app/controller/home';
import ExportPdf from '../../../app/controller/pdf';

declare module 'egg' {
  interface IController {
    adminApi: ExportAdminApi;
    baca: ExportBaca;
    faq: ExportFaq;
    home: ExportHome;
    pdf: ExportPdf;
  }
}
