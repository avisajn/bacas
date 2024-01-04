<template>
  <div class="page">
    <header class="header">
      <span class="_logo">Hubungi Kami</span>
      <img class="header_icon" src="../../../public/img/share_t.png">
      <span class="telephone"> 087881185050</span>
    </header>
     <div class="block">
        <el-carousel :interval="4000">
          <el-carousel-item v-for='(item, index) in dataimg' :key="index">
            <img :src="item.src" style="width: 100%; height: 100%">
          </el-carousel-item>
        </el-carousel>
      </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'HelloWorld',
  data () {
    return {
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
          {src: require('../../../public/img/img01.jpg'),},
          {src: require('../../../public/img/img02.jpg'),},
          {src: require('../../../public/img/img03.jpg'),}
        ]
    }
  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped="scoped">

  .page {
    margin: 0px;
    position: relative;
  }
  .page .header {
    height: 45px;
    width: 100%;
    background: url('../../../public/img/logo.png');
    background-position: 20%;
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
      display:none;
    }
    .el-form-item__content {
      margin-left: 10px;
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
  .content {
    border-radius: 7px;
    border: 1px solid #e5e5e5;
    margin: -10px auto;
    background-color: #fff;
    position: absolute;
    z-index: 2000;
    width: 20rem;
    left:50%;
    margin-left:-10rem; 
    margin-bottom: 80px; 
   }
 .el-carousel__container {
    height: 836px;
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
      background: url('../../../public/img/logo.png');
      background-position: 20%;
      background-repeat: no-repeat;
      background-size: 130px 30px;
    }
    
   .content {
      width: 20rem;
      margin-left:-10rem; 
      left:50%;
    }
    .el-input {
      width: 90%;
    }
     .el-textarea {
      width: 60%;
    }
    .el-textarea__inner{
      width: 107%;

    }
    .el-button--primary {
      background-color: #00c4db;
      width: 100px;
      margin-top: 30px;
    }
  }
  @media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
    .page .header {
      height: 45px;
      width: 70%;
      background: url('../../../public/img/logo.png');
      background-position: 20%;
      background-repeat: no-repeat;
      background-size: 110px 30px;
    }
    .page .header ._logo {
      font-size: 12px;
    }
    .page .header .telephone {
      font-size: 12px;
      right: 2%;
    }
    .el-carousel__container {
      height: 800px;
    }
   .content {
      width: 19rem;
      margin-left:-9.5rem; 
      left:50%;
    }
    .el-input {
      width: 110%;
    }
     .el-textarea {
      width: 60%;
    }
    .el-textarea__inner{
      width: 187%;
    }
    .el-button--primary {
      background-color: #00c4db;
      width: 100px;
      margin-top: 30px;
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
      .el-button--primary {
        background-color: #00c4db;
        width: 166px;
        margin-top: 30px;
     }
     ._logo {
      font-size: 12px;
     } 
  }
  
  .el-carousel__button{
    width: 10px;
    height: 10px;
    margin-bottom: 14px;
    border-radius: 50%;
  }
  .el-form-item__content {
    line-height: 18px;
  }
</style>
