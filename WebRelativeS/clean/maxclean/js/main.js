;(function () {
	
	'use strict';



	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
			BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
			iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
			Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
			Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
			any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};


	var testimonialCarousel = function(){
		
		var owl = $('.owl-carousel-fullwidth');
		owl.owlCarousel({
			items: 1,
			loop: true,
			margin: 0,
			responsiveClass: true,
			nav: false,
			dots: true,
			autoHeight: true,
			smartSpeed: 800,
			autoHeight: true
		});

	};

	var contentWayPoint = function() {
		var i = 0;
		$('.animate-box').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('animated-fast') ) {
				
				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .animate-box.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn animated-fast');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft animated-fast');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight animated-fast');
							} else {
								el.addClass('fadeInUp animated-fast');
							}

							el.removeClass('item-animate');
						},  k * 200, 'easeInOutExpo' );
					});
					
				}, 100);
				
			}

		} , { offset: '85%' } );
	};



	
	$(function(){
		testimonialCarousel();
		contentWayPoint();
	});


}());


var goods = [
        {"name":"转基因豆"	,"region":[40,200] 		,"maxprobability":5		,"fame":20 		,"mes":["转基因豆被查出xxx，一瞬间没人敢买转基因豆了","最近转基因豆买的很火"]	},
        {"name":"进口奶粉"	,"region":[300,1500] 	,"maxprobability":4		,"fame":15 		,"mes":""	},
        {"name":"洗衣机"	 ,"region":[1000,5000] 	,"maxprobability":2.5	,"fame":1 		,"mes":""	},
        {"name":"饲料肉鸡"	,"region":[100,400] 	,"maxprobability":4.5	,"fame":10 		,"mes":""	},
        {"name":"名牌手表"	,"region":[7000,20000] 	,"maxprobability":1.5	,"fame":2 		,"mes":""	},        
        {"name":"地沟油"	 ,"region":[200,1200] 	,"maxprobability":3.5	,"fame":50 		,"mes":""	},
        {"name":"防毒面具"	,"region":[600,3000] 	,"maxprobability":3		,"fame":1 		,"mes":""	},
        {"name":"肾牌手机"	,"region":[3000 ,14000] ,"maxprobability":1.8	,"fame":30 		,"mes":""	},
        {"name":"黄金首饰"	,"region":[2000,20000] 	,"maxprobability":2		,"fame":2 		,"mes":""	},
        {"name":"国产汽车"	,"region":[6000 ,50000] ,"maxprobability":1.2	,"fame":1 		,"mes":""	}
    ];

console.log('goods:',goods)


function getShowGoods(){
	var _garr = [];	
}


console.log('222');



































