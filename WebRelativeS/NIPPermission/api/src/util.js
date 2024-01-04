import CryptoJS from 'crypto-js';

// 得到结束日期距当前日期的天数
// 俩日期相减，返回天数
export function getDays(endDate){
	let date = new Date();
	let y = date.getFullYear();
	let m = date.getMonth();
	let d = date.getDate();

	let array = endDate.split("-");
	let endTime = new Date(parseInt(array[0]), parseInt(array[1]) - 1, parseInt(array[2]));
	let nowTime = new Date(parseInt(y), parseInt(m), parseInt(d));
	let day = (Number(endTime) - Number(nowTime)) / (1000 * 60 * 60 * 24);
	return day;
}


// 使用 ECB ， PKCS5 或 PKCS7
// 

const key = 'bacanews';

// 解密
export function decryptCode(code){
	let keyHex = CryptoJS.enc.Utf8.parse(key);
	let decrypted = null;
	try{
	    decrypted = CryptoJS.DES.decrypt({ciphertext: CryptoJS.enc.Base64.parse(code)}, keyHex, {
	        mode: CryptoJS.mode.ECB,
	        padding: CryptoJS.pad.Pkcs7
	    });
	}catch(e){
		return;
	}
	return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}

// 加密
export function encryptCode(obj) {
	let keyHex = CryptoJS.enc.Utf8.parse(key);
	let encrypted = null;
	try{
		encrypted = CryptoJS.DES.encrypt(JSON.stringify(obj), keyHex, {
	        mode: CryptoJS.mode.ECB,
	        padding: CryptoJS.pad.Pkcs7
	    });
	}catch(e){
		return;
	}
	return encrypted.toString();
}
