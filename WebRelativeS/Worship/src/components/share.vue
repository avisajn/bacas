<template>
  <div class="page">
    <header class="header" :style="{'background-image': 'url(' + require('../../public/img/logo.png') + ')'}"><span class="_logo">Hubungi Kami</span>
      <img class="header_icon" src="../../public/img/share_t.png">
      <span class="telephone"> 0878 8118 5050</span></header>
     <div class="block">
       <el-carousel class="carousel" :interval="4000" :height="height" style="margin: 0 auto">
          <el-carousel-item v-for='(item, index) in dataimg' :key="index">
            <img :src="item.src" style="width: 100%; height: 100%">
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="content" id="content_id">
        <div class="title">Selamat!</div>
        <p class="top top_num" v-if="isHasCode"> Anda mendapatkan diskon sebesar Rp. 250.000 karena telah memasukkan kode promo.</p>
        <p class="top">Anda telah berhasil mengajukan pinjaman. Kami akan segera menghubungi dalam waktu maksimal 2x24 Jam. Mohon pastikan nomor telepon yang telah Anda cantumkan dalam keadaan aktif.</p>
        <p class="top">Kami menjamin pengembalian biaya 100% apabila terjadi kegagalan pemberangkatan.</p>
        <p class="top"> Jika ada pertanyaan lebih lanjut silahkan hubungi kami di nomor berikut :  </p>
        <p class="telnum">0878 8118 5050</p>
        <p class="last">*Syarigo bekerjasama dengan agen travel yang telah terdaftar dan memiliki ijin dari kementrian agama, serta perusahaan finansial terpercaya dan diawasi oleh OJK.</p>
        <div class="share">
          <p>Share</p>
          <ul>
            <li>
              <a  href="https://www.facebook.com/sharer.php?title=Pilihan layanan Umrah terbaik&u=http://www.syarigo.com/index.html"  target="_blank"><img src="../../public/img/share_f.jpg" alt=""></a>
              <!-- //whatsApp -->
              <a href="whatsapp://send?text=Di http://www.syarigo.com/index.html, Anda bisa berangkat Umrah tanpa menunggu hingga tabungan cukup, tersedia layanan bayar belakangan, saya sudah mencobanya, sekarang giliranmu!Hubungi 087881185050 untuk info lebih lanjut! " target="_blank"><img src="../../public/img/share_t.png"  class="mobileLink" alt=""></a>
              <!-- //line -->
              <a href="http://line.naver.jp/R/msg/text/?Di http://www.syarigo.com/index.html, Anda bisa berangkat Umrah tanpa menunggu hingga tabungan cukup, tersedia layanan bayar belakangan, saya sudah mencobanya, sekarang giliranmu!Hubungi 087881185050 untuk info lebih lanjut!%0D%0Ahttp://www.syarigo.com/index.html" target="_blank" class="pcLink"><img src="../../public/img/share_l.jpg" alt=""></a>
              <!-- ////messager -->
              <a href="fb-messenger://share?link=http://www.syarigo.com/index.html"><img src="../../public/img/share_n.jpg" class="mobileLink" alt=""></a>
              <!-- //分享 -->
              <a href="javascript:void(0);" v-model="message"  v-clipboard:copy="message" v-clipboard:success="onCopy" v-clipboard:error="onError"><img src="../../public/img/share_word.jpg" alt=""></a>


            </li>
          </ul>
        </div>
      </div>
      
  </div>
</template>
<script>
import axios from 'axios';

import Clipboard from 'clipboard'
export default {
  name: 'HelloWorld',
  data () {
    return {
      isHasCode: false,
      height: '',
      textarea3: '',   
      message: 'Di ' + window.location.href.split("#")[0] +', Anda bisa berangkat Umrah tanpa menunggu hingga tabungan cukup, tersedia layanan bayar belakangan, saya sudah mencobanya, sekarang giliranmu!Hubungi 087881185050 untuk info lebih lanjut!',
      dataimg: [
         {src: require('../../public/img/img01_1.jpg'),},
          {src: require('../../public/img/img02_1.jpg'),},
          {src: require('../../public/img/img03_1.jpg'),},
          {src: require('../../public/img/img04_1.jpg'),}
        ] 
    }
  },
  created(){
    let dateStr = this.$route.query.dt;
    let userId = this.$route.query.uid;
    axios.get(`https://manage.newsinpalm.com/api/v1/praise/${dateStr}?userId=${userId}`).then(res => {
        let data = res.data.data;
        if(res.data.errorno == 0 && data.promoCode == '#promobaca'){
          this.isHasCode = true;
        }
      }).catch(error => {
        console.error('Error', error.message);
    })
  },
  beforeMount:function(){
         if(document.body.clientWidth > 900) {
          this.height = (document.body.clientWidth*536/1584)*0.7+ 'px';
          document.documentElement.scrollTop = 300;
        }else {    
          this.height = document.body.clientWidth*536/1584 + 'px';
        }
  },
  methods: {
     onCopy: function (e) {
      this.$message.success("");
    },
    onError: function (e) {
      this.$message.success("");     
    },
     whatsApp: function(contentId){
      u = document.getElementsByClassName("share_url")[0].content;
      t = document.getElementsByClassName("share_title")[0].content;
      location="whatsapp://send?text="+ encodeURIComponent(t) + encodeURIComponent("\n\n"+u)+"&via=lopscoop";
    },
  },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped="scoped">
   .page {
    margin: 0px;
    position: relative;
    text-align: center;
  }
  .page .header {
    height: 45px;
    width: 100%;
    background: url('../../public/img/logo.png');
    background-position: 4%;
    background-repeat: no-repeat;
    background-size: 130px 30px;
    background-color: #fff;
  }
  .page .header ._logo {
    position: absolute;
    right: 30%;
    line-height: 45px;
  }
   .page .header .telephone {
    position: absolute;
    right: 15%;
    font-weight: bold;
    line-height: 45px;
   }
  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
  }
  .el-carousel__item:nth-child(2n) {
     background-color: #99a9bf;
  } 
  .el-carousel__item:nth-child(2n+1) {
     background-color: #d3dce6;
  }
 /*  .el-carousel__container {
      height: 436px;
  } */
  .carousel {
    width: 70%;
    margin: 0 auto;
  }
  .content {
    border-radius: 7px;
    border: 1px solid #e5e5e5;
    width: 20rem;
    margin: -15px auto;
    background-color: #fff;
    position: absolute;
    z-index: 2000;
    left:50%;
    margin-left:-10rem; 
    margin-bottom: 80px; 
   }
  @media screen and (max-width:320px) {
     .content {       
        width: 20rem;  
        left:50%;
        margin-left:-10rem;      
      }
  }
   @media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
     .page .header ._logo {
      font-size: 12px;
    }
    .page .header .telephone {
      font-size: 12px;
      right: 2%;
    }
    .page .header {
      height: 45px;
      width: 100%;
      background-position: 4%;
      background-size: 91px 23px;
      background-color: #fff;
    }
    .content {
      width: 19rem;
      margin-left:-9.5rem; 
      left:50%;
    }
  }
  @media screen and (min-width:490px) {
     .content {
        width: 50%;
        left:50%;
        margin-left:-25%; 
      }
  }
  .content .title {
    padding-top: 30px;
    font-weight: bold;
    font-size: 30pt;
    color: #00bea4;
    text-align: center;
  }
  .content .top {
    color: #a1a1a1;
    font-size: 15px;
    padding: 0px 40px;
    line-height: 18px;
  }
  .content .top_num {
    color: red;
    font-size: 1.1rem;
  }
  .content .hub {
    color: #a1a1a1;
    font-size: 16pt;
    margin: 5px;

  }
  .content .telnum {
    color: black;
    font-weight: bold;
    font-size: 21pt;
    margin: 5px;
    font-family:Tahoma;
  }
  .content .last {
    color: #a1a1a1;
    font-size: 10pt;
    border-bottom: 1px solid #e0e0e0;
    padding: 0px 20px 20px 20px;
    font-style: italic;
    font-weight: normal;
  }
  .el-form {
    padding: 0px 80px;
    margin-top: 45px;
  }
  ul li {
    list-style: none;
  }
  .content .share ul {
    padding: 0px;
  }
  .content .share ul li img {
    width: 40px;
    margin-right: 7px;
  }
  .el-carousel__button{
   width: 10px !important;
    height: 10px !important;
    margin-bottom: 3px !important;
    border-radius: 50%;
    z-index: 100;
  }
  .mobileLink{
    display:none;
  }
  .header_icon {
    width: 2rem;
    position: absolute;
    right: 25%;
    top: 1%;
  }
  @media only screen and (max-width: 900px) {
    .mobileLink{
      display:inline-block;
    }
    .pcLink{
      display:none;
    }
    /* .header_icon{
      display:none;
    } */
    
  }
@media only screen and (max-width: 900px) {
    .el-form-item__content {
      margin-left: 0 !important;
    }
    .el-form-item__label{
      text-align:left  !important;
    }
    .content .title{
      font-size:120%;
    }
    .txt-center{
      text-align:center;
    }
    .content .share ul li img {
    width: 35px;
    margin-right: 5px;
    }
    .el-carousel__container {
      height: 170px !important;
    }
    .content .title {
      padding-top: 14px;
    }
    .content .top {
      font-size: 13px;
      padding: 0 12px;
      line-height: 19px;
    }
    .carousel {
      width: 100%;
      margin: 0 auto;
    }
    .content {
      margin-top: -5px;
    }
    .page .header ._logo {
      right: 39%;
    }
    .header_icon {
      right: 30%;
      top: 12px;
      width: 20px;
    }
    .content .top_num {
      color: red;
    }
  }
</style>
