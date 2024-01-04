require('./lib/layer.js');
require('./css/common.less');
require('./css/index.less');
var moment = require('moment');
var attachFastClick = require('fastclick');
attachFastClick.attach(document.body);

var API = require('./lib/api.js');


window.formData = {};
window.agree = false;
window.sexIsWanita = true;

const height = document.body.clientHeight;
const width = document.body.clientWidth;

const getQuery = function(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}

const _from = getQuery('from') || 'baca';
window.fbq('track', 'from-'+_from );


// console.log(width);
window.moment = moment;
$(function(){
	$('body').removeClass('loading');
	$('.maxHeight').css('max-height' ,height-15);
	$('#maxHeight100').css('max-height' ,height-145-53);
	// layer.open({
	// 		content: $('#page4').html(),
	// 	style: 'position:fixed; left:0; top:0; width:100%; height:100%; border: none; -webkit-animation-duration: .2s; animation-duration: .2s;background:whitesmoke;',
	// 	className : 'customer-layer customer-layer-4',
	// 	shadeClose : false
	// });
	// return;
	layer.open({
		// type: 1,
		content: $('#page1').html(),
		// style: 'max-height:'+height+'px',
		style: 'position:fixed; left:0; top:0; width:100%; height:100%; border: none; -webkit-animation-duration: .2s; animation-duration: .2s;background:whitesmoke;',
		className : 'customer-layer customer-layer-2',
		shadeClose : false
	});

	var ua = navigator.userAgent.toLowerCase(); 
	if (/iphone|ipad|ipod/.test(ua)) {
		setTimeout(function(){
			const width  = $('.layui-m-layermain .form-container').width();
			$('.layui-m-layermain .full-width').width(width-40-15);
			$('.layui-m-layermain .half-width').width((width-40-40)/2);
			// console.log($('.layui-m-layermain .form-container').width())
		},200);
	} else if (/android/.test(ua)) {
	}
	

	$('body').on('click', '.click-big' ,function(){
		var _this = $(this);
		_this.addClass('active');
		setTimeout(function(){
			_this.removeClass('active');
			setTimeout(function(){
				_this.trigger('clickover');
			},200);
		},100);
	});

	const submit = function(){
		// if(!window.agree){
		// 	layer.open({content: 'Need to check the consent form',skin: 'msg',time: 2 }); 
		// 	return;
		// }
		// layer.closeAll();

		layer.open({type: 2});
		var param = window.formData;
		param.platform = _from;
		console.log('para:' ,param);
		window.fbq('track', 'register-from-'+_from);
		API.saveuser(param ,function(res){
			setTimeout(function(){
				layer.open({
					content: $('#page4').html(),
					style: 'position:fixed; left:0; top:0; width:100%; height:100%; border: none; -webkit-animation-duration: .2s; animation-duration: .2s;background:whitesmoke;',
					className : 'customer-layer customer-layer-4',
					shadeClose : false
				});
			},1000);
		});
	};
		

	// 第一个页面的提交按钮
	$('body').on('clickover' ,'.btn-form-submit-next' ,function(){
		console.log('over!1')
		// 获取
		var obj = {};
		$('.layui-m-layer').find('.form-input').each(function(){
			var _this = $(this);
			obj[_this.attr('objname')] = _this.val();
		});

		obj['card'] = $('input[name="card"]:checked').val() == 'yes' ? 1 : 0;
		obj['sex'] = $('input[name="sex"]:checked').val() == 'male' ? 1 : 0;	//0 : female  1:male

		// if(!obj['email']){
		// 	layer.open({content: 'Email is required',skin: 'msg',time: 2 }); return; 
		// }else{
		// 	// 验证email
		// 	if (obj['email'].trim().search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) == -1){
		// 		layer.open({content: 'Email is error',skin: 'msg',time: 2 }); return; 
		// 	}
		// }
		if(!obj['name']){layer.open({content: 'Name is required',skin: 'msg',time: 2 }); return; }if(!obj['name']){layer.open({content: 'Name is required',skin: 'msg',time: 2 }); return; }


		// if(!obj['birthdate']){
		// 	layer.open({content: 'birthdate is required',skin: 'msg',time: 2 }); 
		// 	return; 
		// }else{
		// 	const mybirth = moment(obj['birthdate'] ,'DDMMYYYY' ,true);
		// 	console.log(mybirth.format('YYYY-MM-DD'))
		// 	if(!mybirth.isValid()){
		// 		layer.open({content: 'Birthdate is error',skin: 'msg',time: 2 }); 
		// 		return;
		// 	}
		// }

		if(!obj['birthdateDD'] || !obj['birthdateMM'] || !obj['birthdateYYYY']){
			layer.open({content: 'Birthdate is required',skin: 'msg',time: 2 }); return; 
		}else{
			obj['birthdate'] = obj['birthdateDD'] + obj['birthdateMM'] + obj['birthdateYYYY'];
			// 验证birthdate
			const mybirth = moment(obj['birthdate'] ,'DDMMYYYY' ,true);
			console.log(mybirth.format('YYYY-MM-DD'))
			// console.log(mybirth.isBetween('1965-12-31', '1993-01-01'));
			if(!mybirth.isValid()){
				layer.open({content: 'Birthdate is error',skin: 'msg',time: 2 }); return;
			}

			if(!mybirth.isBetween('1965-12-31', '1993-01-01')){
				layer.open({content: 'Maaf, usia anda tidak sesuai dengan kriteria.',skin: 'msg',time: 2 }); return; 		
			}

		}


		console.log('over!3')


		// if(!obj['birthdateDD'] || !obj['birthdateMM'] || !obj['birthdateYYYY']){
		// 	layer.open({content: 'Birthdate is required',skin: 'msg',time: 2 }); return; 
		// }else{
		// 	obj['birthdate'] = obj['birthdateDD'] + obj['birthdateMM'] + obj['birthdateYYYY'];
		// 	// 验证birthdate
		// 	const mybirth = moment(obj['birthdate'] ,'DDMMYYYY' ,true);
		// 	console.log(mybirth.format('YYYY-MM-DD'))
		// 	console.log(mybirth.isBetween('1965-12-31', '1993-01-01'));
		// 	if(!mybirth.isValid()){
		// 		layer.open({content: 'Birthdate is error',skin: 'msg',time: 2 }); return;
		// 	}

		// 	if(!mybirth.isBetween('1965-12-31', '1993-01-01')){
		// 		layer.open({content: 'Maaf, usia anda tidak sesuai dengan kriteria.',skin: 'msg',time: 2 }); return; 		
		// 	}

		// }
		if(!obj['phone']){
			layer.open({content: 'Phone is required',skin: 'msg',time: 2 }); return; 
		}
		console.log('over!4')

		const city = $('.layui-m-layer').find('[objselect="city"]').val();

		if(!city){
			layer.open({content: 'City is required',skin: 'msg',time: 2 }); return; 
		}else{
			obj['city'] = city;
		}
		console.log('over!2')

		window.formData = obj;
		layer.closeAll();
		// layer.open({
		// 	content: $('#page3').html(),
		// 	style: 'position:fixed; left:0; top:0; width:100%; height:100%; border: none; -webkit-animation-duration: .2s; animation-duration: .2s;background:whitesmoke;',
		// 	className : 'customer-layer customer-layer-info',
		// 	shadeClose : false
		// });
		submit();
	});


	$('body').on('clickover' ,'.btn-form-submit' ,function(){
		submit();
	})
});


window.agreeCheckbox = function(v){
	window.agree = v;
}



window.sexCheckbox = function(v){
	console.log('v:' ,v);
	window.sexIsWanita = v;
}





require('file?name=/img/logo.png!./img/logo.png');
require('file?name=/img/logo-1.png!./img/logo-1.png');
require('file?name=/img/g.png!./img/g.png');
