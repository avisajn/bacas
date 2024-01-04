// (function googleAnalytics (ga)  {
//   let script = document.getElementById('google-tag');
//   if(!script){
//     script = document.createElement('script');
//     script.id = 'google-tag';
//     script.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
//     script.async = true
//     document.body.append(script);
//   }
// })(document.querySelector('.ga_tag').innerText)

// window.dataLayer = window.dataLayer || [];
// function gtag(){window.dataLayer.push(arguments);}
// console.log(gtag)
// gtag('js', new Date());

// gtag('config', document.querySelector('.ga_tag').innerText);
const gtag = function ()  {
  window.dataLayer.push(arguments);
}
const googleAnalytics = function (element, ga)  {
  console.log(ga)
  window.dataLayer = window.dataLayer || [];
    gtag('js', new Date());
    gtag('config', ga);
    let script = document.getElementById('google-tag');
    if(!script){
      script = document.createElement('script');
      script.id = 'google-tag';
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
      document.body.append(script);
    }
}
window.gtag = gtag
