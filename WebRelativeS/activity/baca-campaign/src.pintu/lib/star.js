const $starPanel = $('#starPanel');
const $resTime = $('#res_time');

module.exports =  {
	show : function (time) {
		window.ModalTo('modal_share_panel');	
		$resTime.html(window.getTimeStr(time));
		if(time <= 60) {	// 三颗星
			$starPanel.addClass('star-level-3');
		}else if(time <= 180){	// 两颗星
			$starPanel.addClass('star-level-2');
		}else{	// 一颗星
			$starPanel.addClass('star-level-1');
		}	
	}
}	