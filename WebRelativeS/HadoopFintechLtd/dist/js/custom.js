
 /* jQuery Pre loader
  -----------------------------------------------*/
$(window).load(function(){
    $('.preloader').fadeOut(1000); // set duration in brackets    
});

$(function(){
    /* Hide mobile menu after clicking on a link
    -----------------------------------------------*/
    $('.navbar-collapse a').click(function(){
        $(".navbar-collapse").collapse('hide');
    });
    $('#btn_submit').click(function(){
      Form.submit();
    });

    $('body').vegas({
        slides: [
            { src: 'images/slide-img1.jpg' },
            { src: 'images/slide-img2.jpg' },
            { src: 'images/slide-img3.jpg' }
        ],
        timer: false,
        transition: [ 'zoomIn', ],
        animation: ['kenburns']
    });

    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true
    });
    var swiper = new Swiper('.swiper-container-hzhb', {
        pagination: '.swiper-pagination',
        slidesPerView: 4,
        paginationClickable: true,
        spaceBetween: 0,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
    });

    /* Back to Top
    -----------------------------------------------*/
    $(window).scroll(function() {
      if ($(this).scrollTop() > 200) {
          $('.go-top').fadeIn(200);
            } else {
                $('.go-top').fadeOut(200);
           }
        });   
          // Animate the scroll to top
        $('.go-top').click(function(event) {
          event.preventDefault();
        $('html, body').animate({scrollTop: 0}, 300);

    });

    /* wow
    -------------------------------*/
    new WOW({ mobile: false }).init();
});



const Form = (function(){
  const $inputs = $('[id^=form_]');
  const url = 'http://idcrawler.vm.newsinpalm.net/hadoop/api/user/reg'
  // const url = 'http://localhost:8360/hfoy/user/reg';
  const $name = $('#form_name');
  const $email = $('#form_email');
  const $message = $('#form_message');

  const verify = function(){  // 验证
    const _name = $name.val();
    if(!_name){
      $name.addClass('input-error');
      return false;
    }else $name.removeClass('input-error');

    const _email = $email.val();
    if(!_email){
      $email.addClass('input-error');
      return false;
    }
    var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if(!myreg.test(_email)) {
      alert('E_mail error!');
      $email.addClass('input-error');
      return false;
    }else $email.removeClass('input-error');

    return {
      username : _name ,
      email : _email ,
      demand : $message.val() || ''
    };
  }


  return {
    submit : function(){
      const param = verify();
      if(!param) return;
      $('.preloader').fadeIn(1000);
      $.ajax({ url: url ,type:'POST' ,data:param, success: function(e){
        $('.preloader').fadeOut(1000);
        alert('Submitted successfully');
      }});
    }
  }
}());