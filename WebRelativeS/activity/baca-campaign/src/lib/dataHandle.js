const $mainList = $('#mainList');
const $articleList = $('#articleList');

const article_item = {
	'_1' : [
		{
			title:"Ahok : Saya Kasihan Dengan Habib Rizieq",
			link:"http://wap.mi.baca.co.id/8390727",
			img:"http://img.cdn.baca.co.id/event/top10/art/1_01.jpg",
		},
		{
			title:"Kala Habib Rizieq Besaksi di Sidang Ahok",
			link:"http://wap.mi.baca.co.id/8449674",
			img:"http://img.cdn.baca.co.id/event/top10/art/1_02.jpg",
		},
		{
			title:"Jokowi Kenalkan Ahok ke Raja Salman, #Meme Habib Rizieq Bertebaran!",
			link:"http://wap.mi.baca.co.id/8469021",
			img:"http://img.cdn.baca.co.id/event/top10/art/1_03.jpg",
		},
		{
			title:"Rizieq vs Ahok, PSI : Tidak Bisa Disamakan",
			link:"http://wap.mi.baca.co.id/10260106",
			img:"http://img.cdn.baca.co.id/event/top10/art/1_04.jpg",
		},
		{
			title:"Suka atau Tidak Suka, Habib Rizieq Lebih Berpengaruh Saat Ini",
			link:"http://wap.mi.baca.co.id/6601380",
			img:"http://img.cdn.baca.co.id/event/top10/art/1_05.jpg",
		},
	],
	'_2' : [
		{
			title:"Julia Perez Meninggal, Ini Pesan Terakhir dan Foto-fotonya",
			link:"http://wap.mi.baca.co.id/10826436",
			img:'http://img.cdn.baca.co.id/event/top10/art/2_01.jpg',
		},
		{
			title:"Ternyata Seperti Ini Kondisi Makam Julia Perez Sekarang, Tidak Pernah Sepi",
			link:"http://wap.mi.baca.co.id/16226498",
			img:'http://img.cdn.baca.co.id/event/top10/art/2_02.jpg',
		},
		{
			title:"Akun Instagram Julia Perez Mendadak Update InstaStory, Begini Isinya",
			link:"http://wap.mi.baca.co.id/15782201",
			img:'http://img.cdn.baca.co.id/event/top10/art/2_03.jpg',
		},
		{
			title:"Kangen, Adik Julia Perez Unggah Pesan Yang Diberikan Kakaknya",
			link:"http://wap.mi.baca.co.id/16162274",
			img:'http://img.cdn.baca.co.id/event/top10/art/2_04.jpg',
		},
		{
			title:"Ruben Onsu Tulis Sindiran Untuk Seseorang, Tentang Julia Perez?",
			link:"http://wap.mi.baca.co.id/16000652",
			img:'http://img.cdn.baca.co.id/event/top10/art/2_05.jpg',
		},

		
	],
	'_3' : [
		{
			title:"Deretan Pangeran Tampan Yang Dibawa Dalam Romongan Raja Salman Ke Indonesia",
			link:"http://wap.mi.baca.co.id/8485350",
			img:"http://img.cdn.baca.co.id/event/top10/art/3_01.jpg",
		},
		{
			title:"Awas! Raja Salman ke Indonesia, Jangan Sampai Ada yang Bikin Lelucon Ala Jalals Berikut Ini",
			link:"http://wap.mi.baca.co.id/8450883",
			img:"http://img.cdn.baca.co.id/event/top10/art/3_02.jpg",
		},
		{
			title:"Seperti Ini Lho Gaya Putri Arab Saudi di Abad 21, Kira-kira Ikut Raja Salman ke Indonesia Gak Ya?",
			link:"http://wap.mi.baca.co.id/8451708",
			img:"http://img.cdn.baca.co.id/event/top10/art/3_03.jpg",
		},
		{
			title:"Bangga Raja Salman ke Indonesia, Sarwendah Kaget Lihat Pangeran Arab Ganteng-Ganteng",
			link:"http://wap.mi.baca.co.id/8476411",
			img:"http://img.cdn.baca.co.id/event/top10/art/3_04.jpg",
		},
		{
			title:"Cerita JK soal Raja Salman Takjub Dengan 800 Ribu Masjid dan Musala RI",
			link:"http://wap.mi.baca.co.id/8450883",
			img:"http://img.cdn.baca.co.id/event/top10/art/3_05.jpg",
		},
	],
	'_4' : [
		{
			title:"Seandainya Ahok-Djarot Kalah di Pilkada DKI Jakarta, Ini Kata Lola Amaria",
			link:"http://wap.mi.baca.co.id/8727182",
			img:"http://img.cdn.baca.co.id/event/top10/art/4_01.jpg",
		},
		{
			title:"6 Tokoh yang Sakit Hati di Pilkada DKI Jakarta",
			link:"http://wap.mi.baca.co.id/8153994",
			img:"http://img.cdn.baca.co.id/event/top10/art/4_02.jpg",
		},
		{
			title:"Siapa Unggul di Putaran Dua Pilkada DKI Jakarta? Ini Prediksi 2 Lembaga Survei",
			link:"http://wap.mi.baca.co.id/9304449",
			img:"http://img.cdn.baca.co.id/event/top10/art/4_03.jpg",
		},
		{
			title:"Analisis Pilkada DKI Jakarta Putaran 2",
			link:"http://wap.mi.baca.co.id/8213950",
			img:"http://img.cdn.baca.co.id/event/top10/art/4_04.jpg",
		},
		{
			title:"Kocak! Ini Cerita Humor dan Meme Menggelitik Seputar Pilkada DKI Jakarta",
			link:"http://wap.mi.baca.co.id/8164670",
			img:"http://img.cdn.baca.co.id/event/top10/art/4_05.jpg",
		},	
	],
	'_5' : [
		{
			title:"Alamak…Perdana di Kaltara, Pria 25 Tahun Nikahi Nenek 58 Tahun",
			link:"http://wap.mi.baca.co.id/15884816",
			img:"http://img.cdn.baca.co.id/event/top10/art/5_01.jpg",
		},
		{
			title:"Awalnya Romantis, Nenek 82 Tahun Yang Nikahi Remaja Ting Ting Berakhir Tragis, Ini Kisahnya",
			link:"http://wap.mi.baca.co.id/15447496",
			img:"http://img.cdn.baca.co.id/event/top10/art/5_02.jpg",
		},
		{
			title:"5 Pemuda Ganteng Ini Nikahi Nenek-Nenek. Bikin Jomblowati Gigit Jari Nih!",
			link:"http://wap.mi.baca.co.id/15727499",
			img:"http://img.cdn.baca.co.id/event/top10/art/5_03.jpg",
		},
		{
			title:"Nikahi Nenek Usia 91 Tahun, Kisah Pemuda 23 Tahun Ini Viral",
			link:"http://wap.mi.baca.co.id/15333471",
			img:"http://img.cdn.baca.co.id/event/top10/art/5_04.jpg",
		},
		{
			title:"Kisah Cinta Nenek Rohaya dan Selamat, Pasangan Beda Usia 55 Tahun",
			link:"http://wap.mi.baca.co.id/16056421",
			img:"http://img.cdn.baca.co.id/event/top10/art/5_05.jpg",
		},
	],
	'_6' : [
		{
			title:"Via Vallen Somasi Perias Ayu Ting Ting",
			link:"http://wap.mi.baca.co.id/16217964",
			img:"http://img.cdn.baca.co.id/event/top10/art/6_01.jpg",
		},
		{
			title:"Ayu Ting Ting : Diam Bukan Berarti Lemah",
			link:"http://wap.mi.baca.co.id/16114571",
			img:"http://img.cdn.baca.co.id/event/top10/art/6_02.jpg",
		},
		{
			title:"Kemesraan Raffi Ahmad & Ayu Ting Ting",
			link:"http://wap.mi.baca.co.id/16247751",
			img:"http://img.cdn.baca.co.id/event/top10/art/6_03.jpg",
		},
		{
			title:"Saksi Mata Benarkan Ayu Ting Ting Mabuk Bareng Raffi Ahmad",
			link:"http://wap.mi.baca.co.id/16300240",
			img:"http://img.cdn.baca.co.id/event/top10/art/6_04.jpg",
		},
		{
			title:"Ayu Ting Ting Bungkam Soal Pegangan Tangan Dengan Raffi Ahmad!",
			link:"http://wap.mi.baca.co.id/16038617",
			img:"http://img.cdn.baca.co.id/event/top10/art/6_05.jpg",
		},
	],
	'_7' : [
		{
			title:"Wow Fantastis!! Harga Uang Kuno Jika Dijual",
			link:"http://wap.mi.baca.co.id/15995994",
			img:"http://img.cdn.baca.co.id/event/top10/art/7_01.jpg",
		},
		{
			title:"Dulu Disepelekan, Sekarang 6 Uang Jadul Ini Dihargai Fantastis",
			link:"http://wap.mi.baca.co.id/15935854",
			img:"http://img.cdn.baca.co.id/event/top10/art/7_02.jpg",
		},
		{
			title:"Cerita Muhammad Ikhsan Telaten Mengkoleksi Uang Kuno",
			link:"http://wap.mi.baca.co.id/15830480",
			img:"http://img.cdn.baca.co.id/event/top10/art/7_03.jpg",
		},
		{
			title:"Wow! Inilah 5 Mata Uang Kerajaan Kuno di Indonesia, Wujudnya Artistik dan Berharga pada Zamannya!",
			link:"http://wap.mi.baca.co.id/15887450",
			img:"http://img.cdn.baca.co.id/event/top10/art/7_04.jpg",
		},
		{
			title:"Pameran Uang Kuno Nusantara",
			link:"http://wap.mi.baca.co.id/7337283",
			img:"http://img.cdn.baca.co.id/event/top10/art/7_05.jpg",
		},
	],

	'_8' : [
		{
			title:"Reklamasi dan Rumah DP 0 Rupiah Dihujat, Pengamat: Tak Mudah Gantikan Ahok",
			link:"http://wap.mi.baca.co.id/11716103",
			img:"http://img.cdn.baca.co.id/event/top10/art/8_01.jpg",
		},
		{
			title:"Sutiyoso Skakmat DP 0 Rupiah, Bilang Program Anies-Sandi Nggak Mendidik",
			link:"http://wap.mi.baca.co.id/9611275",
			img:"http://img.cdn.baca.co.id/event/top10/art/8_02.jpg",
		},
		{
			title:"Rumah DP 0 Rupiah, Janji Manis yang Berujung Kel…",
			link:"http://wap.mi.baca.co.id/11629835",
			img:"http://img.cdn.baca.co.id/event/top10/art/8_03.jpg",
		},
		{
			title:"Sindir DP 0 Rupiah, Ruhut: Makanya Jangan Berikan Janji Palsu saat Kampanye",
			link:"http://wap.mi.baca.co.id/11630758",
			img:"http://img.cdn.baca.co.id/event/top10/art/8_04.jpg",
		},
		{
			title:"Kisruh Rumah DP 0 Rupiah Muncul karena Program Anies-Sandi Ditanggapi ‘Lebay’ oleh Masyarakat",
			link:"http://wap.mi.baca.co.id/11678247",
			img:"http://img.cdn.baca.co.id/event/top10/art/8_05.jpg",
		},
	],


	'_9' : [
		{
			title:"Zakir Naik Tiba-Tiba Muncul saat Pilkada, Ruhut: Gak Ada yang Mau Dengar Ceramahnya",
			link:"http://wap.mi.baca.co.id/9257822",
			img:'http://img.cdn.baca.co.id/event/top10/art/9_01.jpg',
		},
		{
			title:"Ini Kata Zakir Naik Soal Al Maidah 51",
			link:"http://wap.mi.baca.co.id/9164357",
			img:'http://img.cdn.baca.co.id/event/top10/art/9_02.jpg',
		},
		{
			title:"Tuding Zakir Naik Danai ISIS, Komedian Ernest Prakasa Tuai Kecaman",
			link:"http://wap.mi.baca.co.id/8586423",
			img:'http://img.cdn.baca.co.id/event/top10/art/9_03.jpg',
		},
		{
			title:"Zakir Naik Sebut Pemimpin Muslim Lebih Baik, Timses Ahok : Elektabilitas Pertahanan Tak Akan Anjlok",
			link:"http://wap.mi.baca.co.id/9189078",
			img:'http://img.cdn.baca.co.id/event/top10/art/9_04.jpg',
		},
		{
			title:"Ditanya-tanya Tentang Pemimpin Non-Muslim Yang Bangun Masjid, Dr Zakir Naik Sebut Itu Munafik",
			link:"http://wap.mi.baca.co.id/9205043",
			img:'http://img.cdn.baca.co.id/event/top10/art/9_05.jpg',
		},
	],
	'_10' : [
		{
			title:"7 Fakta Menarik Golongan Darah B Saat Jatuh Cinta",
			link:"http://wap.mi.baca.co.id/15877041",
			img:"http://img.cdn.baca.co.id/event/top10/art/10_01.jpg",
		},
		{
			title:"Apakah Kamu Bergolongan Darah O ? “18 Fakta Mengejutkan” Golongan Darah O Yang Banyak Orang Gak Tahu #7 Wah Hargailah Mereka Sebelum Terlambat",
			link:"http://wap.mi.baca.co.id/16009987",
			img:"http://img.cdn.baca.co.id/event/top10/art/10_02.jpg",
		},
		{
			title:"Golongan Darah Menentukan Kepribadian. Mitos atau Fakta?",
			link:"http://wap.mi.baca.co.id/14539612",
			img:"http://img.cdn.baca.co.id/event/top10/art/10_03.jpg",
		},
		{
			title:"Ternyata Ada Tips Kecantikan Berdasarkan Golongan Darahmu, Sudah Tahu?",
			link:"http://wap.mi.baca.co.id/4716909",
			img:"http://img.cdn.baca.co.id/event/top10/art/10_04.jpg",
		},
		{
			title:"Sara, Golongan Darah Paling Langka di Dunia",
			link:"http://wap.mi.baca.co.id/10023653",
			img:"http://img.cdn.baca.co.id/event/top10/art/10_05.jpg",
		},


		
	],
};
const loadItem = function(k){
	const html = [];
	html.push('<div _link="'+k.link+'" class="article-item clearfix">');
	html.push('	<div>');
	html.push('		<div class="image-left" style="background-image:url('+k.img+')"></div>');
	html.push('		<div class="title-right">');
	html.push('			<p>'+k.title+'</p>');
	html.push('		</div>');
	html.push('	</div>');
	html.push('</div>');
	return html.join('');
}
const $frame = $('#previewFrame');
const $framePanel = $('#modal_article_detail');
const renderList = function(topic_id){

	const html = [];
	const data = article_item['_'+topic_id];
	for(var i=0,len=data.length;i<len;i++){
		html.push(loadItem(data[i]));
	}
	$articleList.html(html.join(''));

	$articleList.find('.article-item').click(function(){
		console.log('123');
		// window.scrollHanlder.disableScroll();
		$framePanel.removeClass('hide');
		const _link = $(this).attr('_link');
		setTimeout(function(){
			// 弹出文章层
			$frame.attr('src' ,_link);
		},10);
	})
}





module.exports =  {
	init : function () {
		const $number = $('#modal_topic_numer');
		$mainList.find('.trending-item').on('click' ,function(){
			const current = $(this).attr('_tpid');
			$number.text(current);
			renderList(current);
			// 加载文章列表
			window.ModalTo('modal_article_list');
		});
		$mainList.find('.tip-comment').on('click' ,function(e){
			console.log('tip-comment');
			e.stopPropagation();
			e.preventDefault();

		});

		$('.return-panel').on('click' ,function(){
			$framePanel.addClass('hide');
			// window.scrollHanlder.enableScroll();
			$frame.attr('src' ,'');
		});

		// console.log('init::');
	}

}
