import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);
  router.redirect('/index', '/');
  router.get('/homepage_origin_web', controller.home.originIndex)
  router.get('/homepage_origin_pc', controller.home.originIndex)
  router.get(/^\/promote/g, controller.home.promote);
  router.get('/all_promote', controller.home.allPromote);
  router.get('/logistics/pdf/:id', controller.pdf.getHtmlFromId)
  router.get('/logisitics/:id', controller.home.logisitic);
  // router.post('/logistics/pdf', controller.pdf.getPdfFromId)
  router.post('/download_logisitics/:id', controller.home.downloadLogisticPicture)
  router.post('/download_logistic/pdf', controller.pdf.setLabelNumber)
  router.get('/question', controller.home.terms);
  router.get('/term', controller.home.terms);
  router.get('/policy', controller.home.terms);
  router.get('/wdpolicy', controller.home.terms);
  router.get('/referral', controller.home.terms);
  router.get('/referral_active', controller.home.terms);
  router.get('/realPictureTerm', controller.home.terms);

  router.get('/vendorQA', controller.home.terms);
  router.get('/vendorPrivacy', controller.home.terms);
  router.get('/vendorTerms', controller.home.terms);
  router.get('/vendorWdpolicy', controller.home.terms);
  router.get('/supplierpolicy', controller.home.supplierpolicy)

  // router.get('/test_term', controller.home.formatTerm);

  router.get('/baca_share/:id', controller.baca.share);
  router.get('/cerita-sukses/:date_id', controller.baca.article)

  router.get('/supplier/order', controller.home.orderNatice)
  router.get('/share', controller.home.orderNatice)
  router.get('/links', controller.home.links)
  router.get('/app/login/native/:code', controller.home.loginSchame)
  router.get('/app/callback/share', controller.home.oldCallback)

  router.get('/share_google_url', controller.home.shareGoogleUrl)
  router.get(/^\/[A-z0-9]{4}$/, controller.home.share2invite)
  router.get('/invite_share_image/:code', controller.home.shareImage)
  router.get('/share/product_preview/:code', controller.home.shareProductPreview)

  // router.get('/survey', controller.home.localSurveyList)
  router.get('/survey/:id', controller.home.getSurveyPage)
  router.get('/survey/:id/json', controller.home.getSurveyJSON)


  router.get('/admin_api/native_logistic/sic', controller.adminApi.nativeSicPrice)
  router.get('/admin_api/native_logistic/sap', controller.adminApi.nativeSapPrice)
  
  router.get('/faq_api/number', controller.faq.number);
  router.get('/faq_api/format_product', controller.faq.formatProduct);
  router.get('/faq_api/format_order_status', controller.faq.formatOrderStatus);
  router.get('/faq_api/format_order', controller.faq.formatOrder);
  // router.get('/store', controller.home.testStore)
  // router.get('/native_test', controller.home.nativeTest)


  router.get(/^\/50[0-9]{1}/, controller.home.error);
  router.get('/sitemap.xml', controller.home.sitemap);
  router.get('/get_sending_ip', controller.home.getIp)
  router.get('/robots.txt', controller.home.robot);
  router.get('*', controller.home.notFound);

  
};
