const $maskpanel = $('#my_pt_container');
const $resultImage = $('#result_image');
const $resultTitle= $('#result-title');
const $resultFoot = $('#result-foot');

const imageMapping = {
	'12345' : {
		src : 'xz-1.png',
		female : 'Kalau bosan dengan hubungan, jangan buru-buru cari cadangan dong. Kesetiaan kamu segitu doang nih?',
		male : 'Godaan selalu aja dateng kalo lagi bosen sama pasangan. Hayoo kamu bakal kegoda atau tetep setia?,'
	},
	'52431' : {
		src : 'xz-2.png',
		female : 'yeay! Sebentar lagi kamu bakal ketemu sama cowok yang bikin senyum-senyum setiap saat. Semoga nggak dijadiin pelarian sesaat ya :)',
		male : 'yeay! Sebentar lagi kamu bakal ketemu sama cewek yang bikin hari-hari kamu berwarna. Semoga nggak dijadiin pelabuhan sementara ya :)',
		title : 'Kasih Kejutan Spesial',
	},
	'54231' : {
		src : 'xz-3.png',
		title : 'Hubungan Awet',
		male : 'selamat! Kamu nggak salah pilih cewek untuk jadi calon teman hidup. Terus pertahankan ya, siapa tau awet sampai pelaminan',
		female : 'selamat! Hubungan dengan orang kesayangan kamu teridentifikasi aman tanpa gangguan. Gak sia-sia selama ini pertahanin hubungan',
	},
	'25341' : {
		src : 'xz-4.png',
		title : 'Gampang Baper',
		male : 'Perempuan itu perhatian? Boleh seneng tapi jangan lupa selalu sediain ruang untuk patah kalau lagi jatuh hati ya.',
		female : 'Laki-laki itu manis sih. Tapi hati-hati ya.. Harus jago jaga hati biar gak gampang sakit hati.',
	},
	'53241' : {
		src : 'xz-5.png',
		title : 'Genit',
		female : 'Eeitsss udah punya cowok kok masih lirik kanan-kiri? Masih banyak jomblo yang susah dapet pacar, kamu harus belajar setia dan menghargai hubungan dong, hehe.',
		male : 'Hayoo..Udah punya pacar tapi masih sepikin cewek lain? Buang jauh-jauh kebiasaan ini deh. Flirting itu nggak bikin kamu gentle loh!',
	},
	'35241' : {
		src : 'xz-6.png',
		title : 'Temen Jadi Demen',
		female : 'Awalnya ledek-ledekan, lama-lama sayang.. Wes biasaaa itu sih :) Selamat! Tahun 2018 kamu disambut dengan status FRIENDZONE',
		male : 'Yakin Cuma anggep dia temen? Dari sikap dan tatapan kamu sih, kayaknya udah mulai demen. Sah aja kok dari sahabat jadi cinta',
	},
	'45321' : {
		src : 'xz-7.png',
		female : 'Pilih salah satu! Berkorban dengan perasaan atau memperjuangkan perasaan?',
		male : 'Lama-lama sifat egoisnya udah semakin menyebalkan. Hubungan jadi nggak sehat. Apalagi yang mau dipertahankan?',
		title : 'Korban Perasaan',
	},
	'24531' : {
		src : 'xz-8.png',
		title : 'Yakin Kalau Dia Adalah Pilihan Terakhir',
		female : 'Pacaran lama jadi pilihan utama? Yakin? Jangan-jangan jodoh kamu masih dipinjem orang lain! Hehehe',
		male : 'Tahun baru berarti hubungan baru! Udah gak ada lagi deh yang namanya sebatas teman tanpa kepastian :)',
	},
	'53421' : {
		src : 'xz-9.png',
		title : 'Diajak Serius',
		male : 'Niat dan tabungan udah ada, yuk ah buru-buru mengejar restu dari orang tua cewek kamu!',
		female : 'Ciee..happy banget ya kalau sering dikasih janji. Tinggal nunggu dijadiin istri aja nih :)',

	},
	'32541' : {
		src : 'xz-10.png',
		female : 'Patah hati bukan berarti mati rasa. Yuk semangat lagi jadi pejuang asmara!',
		male : 'Setelah diterawang, berteman dengan mantan bisa jadi resolusi 2018 lho. mau coba?',
		title : 'Sembuh Patah Hati',
	},
	'52341' : {
		src : 'xz-11.png',
		title : 'Cinta Terpendam',
		male : 'Masih punya rasa tersembunyi di dalam hati? Tahun 2018 adalah waktu yang tepat untuk nyatain perasaan nih!',
		female : 'Mendem perasaan itu sakitnya sama kayak ditikung teman! Coba lebih jujur dan terbuka yuk :)',
	},
	'25431' : {
		src : 'xz-12.png',
		female : 'Udah lama jadian tapi cowok kamu belum ada tanda-tanda ngajak serius? Tegasin dong! Kalau cuma mau main-main ya di taman bermain aja :)',
		male : 'Di tahun 2018 ini tentukan pilihan yuk! Kamu mau serius atau putus? :)',
		title : 'Keseriusan Hubungan',
	},
}

const estimateConnect = function(str ,order){

	const _old = order.join('');
	const _new = (order.reverse()).join('');
	if(_old.indexOf(str) >= 0 || _new.indexOf(str) >= 0){
		return true;
	}
	return false;
}	

module.exports =  {
	clear : function () {
		$resultImage.removeClass('result_image').removeClass('active').attr('src','');
		$maskpanel.removeClass('show-mask');
		$resultTitle.text('Hubungkan Garis');
		$resultFoot.text('Yuk hubungkan titik-titik di atas agar membentuk sebuah gambar dari kisah cinta kamu!');
	},
	show : function(){
		$maskpanel.addClass('show-mask');
        $resultImage.addClass('result_image').addClass('active');
	},
	calcByOrder : function(order){
		const _new_order = JSON.parse(JSON.stringify(order));
		const _old_order = JSON.parse(JSON.stringify(order));
		const max_index = order.length-1;
		// 取第一位添加
		if(order[0] > 1){
			for(var i=order[0]-1,j=1;i>=0;i--,j++){
				console.log('i:',j,order[max_index-j]);
				_old_order.unshift(order[max_index-j]);
				if(order[max_index-j] == 1) break;
			}
		}
		var current = null;
		for(var i in imageMapping){
			if(estimateConnect(i ,_old_order)){
				current = imageMapping[i];
			}
		}
		if(current){
			$resultImage.attr('src' ,'http://img.cdn.baca.co.id/event/gc/img/'+current.src);
			$resultTitle.text(current.title);
			$resultFoot.text(current[window.sex]);
		}
		
	}
}	