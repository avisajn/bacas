import CryptoJS from 'crypto-js';
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