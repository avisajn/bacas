var $productWord = function (model, stock, cod_supported, shop_location) {
  var returnValue = ''
	try {
		var str = '';
    str = str.concat('<b>Stok:</b> ' + stock + '\n');
		str = str.concat('<b>Dikirim dari:</b> ' + shop_location + '\n');
		if (cod_supported) {
			str = str.concat('<b>COD:</b> didukung (Didukung atau tidaknya tergantung pada alamat tujuan kakak)' + ' \n');
		} else {
			str = str.concat('<b>COD:</b> tidak didukung (Didukung atau tidaknya tergantung pada alamat tujuan kakak)' + ' \n');
		}
    str = str.concat('Kakak bisa melihat semua variasi dan stok produk di dalam halaman detail produk ya. Kakak juga dapat melihat perkiraan ongkir dengan mengklik tombol "Estimasi Ongkir" yang ada di dalam halaman detail produk dan kemudian memasukkan alamat tujuan. \n')
		str = str.concat('Semua informasi adalah benar dan valid, jangan ragu untuk membagikan atau membeli produk ini.')

		returnValue = JSON.stringify({content: str})
	} catch (error) {
    returnValue = '';
	}
  return {
    content: str
  }
}


// 用于js 测试
module.exports = $productWord
