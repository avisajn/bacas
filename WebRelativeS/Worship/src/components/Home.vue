<template>
  <div class="page">
    <header class="header" :style="{'background-image': 'url(' + require('../../public/img/logo.png') + ')'}">
      <span class="_logo">Hubungi Kami</span>
      <img class="header_icon" src="../../public/img/share_t.png">
      <span class="telephone">0878 8118 5050</span>
    </header>
     <div class="block">
        <a href="#content_id">
          <el-carousel class="carousel" :height="height" :interval="4000">
            <el-carousel-item v-for='(item, index) in dataimg' :key="index">
              <img :src="item.src" style="width: 100%; height: 100%">
            </el-carousel-item>
          </el-carousel>
        </a>
      </div>
      <div class="content" id="content_id">
        <div class="title">Daftar Umroh</div>
        <p class="top">Mohon masukkan data-data dibawah ini dengan benar dan sesuai.
                       Agar memudahkan proses verifikasi selanjutnya.</p>
        <el-form :model="sizeForm" label-width="120px" size="mini" ref="sizeForm">
          <el-form-item label="Nama Lengkap" prop="fullname">
            <el-input class="inputs" v-model="sizeForm.fullname"></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="email">
            <el-input v-model="sizeForm.email"></el-input>
          </el-form-item>
          <el-form-item label="No. Telepon" prop="telephone">
            <el-input v-model="sizeForm.telephone"></el-input>
          </el-form-item>
          <el-form-item label="Jenis Kelamin" prop="gender">
            <el-radio-group text-color="#00bea4"   v-model="sizeForm.gender" size="medium">
              <el-radio  label="Laki-Laki"></el-radio>
              <el-radio  label="Perempuan"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Alamat" prop="address">
            <el-input class="inputs" type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="" v-model="sizeForm.address">
            </el-input>     
          </el-form-item>
          <el-form-item label="Kode promo (opsional)" prop="promoCode">
            <el-input class="inputs" v-model="sizeForm.promoCode"></el-input>
            <p class="kode">Kode promo bisa di temukan di flyer yang telah disebarkan</p>
          </el-form-item>
            <div class="txt-center" style="width:100%">
              <p style="margin-bottom: 0px;"><button type="button" class="btn sm-btn" @click="onSubmit">LANJUT</button></p>
              <p class="last_p">Konfirmasi untuk memilih paket</p>
            </div>
        </el-form>
      </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  name: 'HelloWorld',
  data () {
    return {
      height: '',
      sizeForm: {
          packageId:'',
          fullname: '',
          email: '',
          telephone: '',
          gender: 'Laki-Laki',
          address: '',
          promoCode: '',          
        },
       dataimg: [
          {src: require('../../public/img/img01_1.jpg'),},
          {src: require('../../public/img/img02_1.jpg'),},
          {src: require('../../public/img/img03_1.jpg'),},
          {src: require('../../public/img/img04_1.jpg'),}
        ]
    }
  },
  beforeMount:function(){
        if(document.body.clientWidth > 900) {
          this.height = (document.body.clientWidth*536/1584)*0.7+ 'px';
        }else {    
          this.height = document.body.clientWidth*536/1584 + 'px';
        }
  },
  created() {
      console.log("2.15.6")
  },
  methods: {
     onSubmit() {     
      // if(!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(this.sizeForm.email)){
      //   this.$message.error('Format email salah, mohon periksa kembali nomor ponsel Anda');
      //   return;
      // }    
      // debugger
      if(!/^[a-zA-Z0-9_-]+([._\\-]*[a-zA-Z0-9_-])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/.test(this.sizeForm.email)){
        this.$message.error('Format email salah, mohon periksa kembali nomor ponsel Anda');
        return;
      }   
      if(!/08\d{8,12}/.test(this.sizeForm.telephone)){
        this.$message.error('Format nomor ponsel salah, mohon periksa kembali');
        return;
      } 
      if(!this.sizeForm.fullname || !this.sizeForm.gender || !this.sizeForm.address){
        this.$message.error('Ada info yang belum diisi, mohon selesaikan untuk melanjutkan');
        return;
      }
      axios.head("https://manage.newsinpalm.com/api/v1/telephone/"+ this.sizeForm.telephone).then(res => {
            if(res.status == 200){
              this.$message.error('Nomor ponsel telah digunakan untuk mendaftar, mohon tidak mendaftar berulang kali, atau periksa kembali nomor Anda');
              return;
            }
            if(res.status == 204){
              axios.post("https://manage.newsinpalm.com/api/v1/praise",this.sizeForm).then(res => {
                  let data = res.data.data;
                  if(res.data.errorno == 0 && data.dateStr && data.userId){
                    this.$router.push({path:'/activity',query:{dt:data.dateStr,uid:data.userId}});
                  }
                }).catch(error => {
                  console.error('Error', error.message);
              })    
            }
          }).catch(error => {
            console.error('Error', error.message);
            return;
      })
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .page {
    margin: 0px;
    position: relative;
    height: 100%;
  }
  .page .header {
    height: 45px;
    width: 100%;
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
  .header_icon {
    width: 2rem;
    position: absolute;
    right: 25%;
    top: 1%;
  }
  @media only screen and (max-width: 900px) {
    .header_icon{
      width: 20px;
      /* display:none; */
    }
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
  .carousel {
    width: 70%;
    margin: 0 auto;
  }
  .el-form-item__content {
    line-height: 18px;
  }
  .kode{margin-top:5px}

  .content {
    border-radius: 7px;
    border: 1px solid #e5e5e5;
    margin: -15px auto;
    background-color: #fff;
    position: absolute;
    z-index: 2000;
    width: 20rem;
    left:50%;
    margin-left:-10rem; 
    margin-bottom: 80px; 
   }
   .el-textarea__inner {
     font-family: 'Avenir', Helvetica, Arial
  }
  @media screen and (max-width:320px) {
    .page .header ._logo {
      position: absolute;
      right: 30%;
      line-height: 45px;
      font-size: 12px;
    }
    .page .header {
      height: 45px;
      width: 100%;
      background-position: 4%;
      background-repeat: no-repeat;
      background-size: 130px 30px;
    }
   .content {
      width: 20rem;
      margin-left:-10rem; 
      left:50%;
    }
    /* .button {
      background-color: #00c4db;
      width: 100px;
    } */
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
    .sm-btn {
      background-color: #00c4db;
      width: 100px;
     /*  margin-top: 30px; */
    }
    .el-form-item__content {
      margin-left: 10px;
    }
}
  @media screen and (min-width:490px) {    
     .content {
        width: 50%;
        left:50%;     
        margin-left:-25%;       
      }
      .el-input {
        width: 60%;
      }
      .el-textarea {
        width: 50%;
      }
      .el-textarea__inner{
        width: 120%;
      }
      .sm-btn {
        background-color: #00c4db;
        width: 166px;
     }
     ._logo {
      font-size: 12px;
     } 
  }
  .content .title {
    padding-top: 14px;
    font-weight: bold;
    font-size: 30pt;
    color: #00bea4;
    text-align: center;
  } 
  .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
    margin-bottom: 12px;
  }
  .content .top {
    color: #a1a1a1;
    font-size: 10pt;
    padding: 0px 40px;
    text-align: center;  
  }
  .el-input--mini .el-input__inner {
    z-index: 500;
  }
  .el-form {
    padding: 0px 10%;
    margin-top: 10px;
  }
  .btn {
    margin: 0px;
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    background: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: 0;
    margin: 0;
    transition: .1s;
    font-weight: 500;
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 4px;
    color: #fff;
    background-color: #00bea4;
    border-color: #00bea4;
    margin-left: 120px;
  }
  .select {
    width: 26%;
    margin-right: 0px;
  }
   
  .last_p {
    /* display: inline-block; */
    margin-left: 120px;
    position: relative;
    font-size: 9pt;
  }
  .kode {
    padding: 0;
    margin: 0;
    line-height: 14px;
    font-size: 12px;
    color: gray;
    margin-top: 5px;
  }
  @media only screen and (max-width: 900px) {
    .el-form-item__content {
      margin-left: 0 !important;
      margin-top: 0px !important;
    }
    .el-form-item__label{
      text-align:left  !important;
      width: 300px !important;
    }
    .content .title{
      font-size:120%;
    }
     .content .top {
      padding: 0 12px;
    }
    .txt-center{
      text-align:center;
    }
    .el-form-item--mini .el-form-item, .el-form-item--small.el-form-item{
      margin-bottom: 0px !important;
    }
    .el-form-item {
      margin-bottom: 0px !important;
    }
    .last_p {
      margin-bottom:12px;
    }
    .sm-btn {
       margin-top: 10px;
       margin-left: 0px;

     }
     
    .last_p {  
      margin-left: 0px;
      text-align: center;
      width: 100%;    
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
    }
  }
</style>
