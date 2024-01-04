const $formatNumber = function (num) {

  var info = {};
  var returnValue = ''
	if (!num) {
		info.state = 'error';
    returnValue = JSON.stringify(info)
	} else {
		var arr = [[]];
		num.toString().split('').reverse().forEach(item => {
			if (arr[arr.length - 1].length < 3) {
				arr[arr.length - 1].push(item);
			} else {
				arr.push([item]);
			}
		})
		info.state = 'ok';
		info.content = arr.reverse().map((item) =>  item.reverse().join('')).join('.');
		// returnValue = JSON.stringify(info);
	}
  return info

};

// 用于js 测试
module.exports = $formatNumber
