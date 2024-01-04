<template>
  <div class="page">
   <header class="header" :style="{'background-image': 'url(' + require('../../public/img/logo.png') + ')'}">
      <span class="_logo">Hubungi Kami</span>
      <img class="header_icon" src="../../public/img/share_t.png">
      <span class="telephone"> 0878 8118 5050</span>
    </header>
    <div class="block">
      <a href="#content_id">
        <el-carousel class="carousel" :height="height" :interval="4000"><el-carousel-item v-for='(item, index) in dataimg' :key="index">  <img :src="item.src" style="width: 100%; height: 100%"></el-carousel-item></el-carousel>
      </a>
    </div>
    <div class="content" id="content_id">
      <div class="title">Paket Umroh</div>
      <div class="top">Berikut adalah Paket umroh pilihan yang kami rekomendasikan.</div>
      <div>
        <div class="active" @click="checkActivity('1')">
            <div class="right right_first">
              <p class="pa">
                <span class="pa_span">PAKET UMROH REGULAR EKONOMI </span>
                <el-radio-group class="radio" text-color="red" fill="red" v-model="activeId"><el-radio label="1">&nbsp;</el-radio></el-radio-group>
              </p>
              <p class="pa">[9 Hari] 08 Jun – 17 Jun 2019</p>
              <p class="pa">KKota keberangkatan : <span class="_two"> Medan</span></p>
              <p class="pa">Hotel : 
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/stat_a.png" alt="">
                <img src="../../public/img/stat_a.png" alt="">
              </p>
              <p class=" money">RP. 20.906.700 <span class="_two" id="mon"> per paket</span> </p>
            </div>
        </div>
        <div class="active" @click="checkActivity('2')">
            <div class="right">
               <p class="pa">
                <span class="pa_span">UMROH PROMO SYAWAL BABUSSALAM BUANA</span>
                <el-radio-group class="radio" text-color="red" fill="red" v-model="activeId">
                  <el-radio label="2">&nbsp;</el-radio>
                </el-radio-group>
              </p>
              <p class="pa">[9 Hari] 12 Jun – 21 Jun 2019</p>
              <p class="pa">Kota keberangkatan :  <span class="_two">Jakarta</span></p>
              <p class="pa">Hotel : 
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/stat_a.png" alt="">
                <img src="../../public/img/stat_a.png" alt="">
              </p>
              <p class=" money">RP. 21.638.700<span class="_two" id="mon">per paket</span> </p>
            </div>
        </div>
        <div class="active" @click="checkActivity('3')">
            <div class="right">
              <p class="pa">
                <span class="pa_span">PAKET UMROH SUPER SAVER ABHINAYA </span>
                <el-radio-group class="radio" text-color="red" fill="red" v-model="activeId">
                  <el-radio label="3">&nbsp;</el-radio>
                </el-radio-group>
              </p>
              <p class="pa">[9 Hari] 26 Oct – 04 Nov 2019</p>
              <p class="pa">Kota keberangkatan : <span class="_two">Jakarta</span></p>
              <p class="pa">Hotel : 
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
              </p>
              <p class=" money">RP. 21.847.500 <span class="_two" id="mon"> per paket</span> </p>
            </div>
        </div>
        <div class="active" @click="checkActivity('4')">
            <div class="right">
              <p class="pa">
                <span class="pa_span">PAKET UMROH REGULAR FAIRUZ &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp; </span>
                <el-radio-group class="radio" text-color="red" fill="red" v-model="activeId">
                  <el-radio label="4">&nbsp;</el-radio>
                </el-radio-group>
              </p>
              <p class="pa">[9 Hari] 09 Jun – 19 Jun 2019</p>
              <p class="pa">Kota keberangkatan :  <span class="_two"> Jakarta</span></p>
               <p class="pa">Hotel : 
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
              </p>
              <p class=" money">RP. 26.029.100 <span class="_two" id="mon" > per paket</span> </p>
            </div>
        </div>
        <div class="active active_last" @click="checkActivity('5')">
            <div class="right ">
               <p class="pa">
                <span class="pa_span">PAKET UMROH GRANADA 12 HARI </span>
                <el-radio-group class="radio" text-color="red" fill="red" v-model="activeId">
                  <el-radio label="5">&nbsp;</el-radio>
                </el-radio-group> 
              </p>
              <p class="pa">[12 Hari] 12 Nov – 18 Nov 2019</p>
              <p class="pa">Kota keberangkatan : <span class="_two"> Jakarta</span></p>
               <p class="pa">Hotel : 
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/star.png" alt="">
                <img src="../../public/img/stat_a.png" alt="">
              </p>
              <p class=" money">RP. 24.565.600 <span class="_two" id="mon">per paket</span> </p>
            </div>
        </div>
      </div>
    <div class="txt-center button">
      <p><button type="button" class="btn sm-btn" @click="onSubmit">LANJUT</button></p>
       <p>Konfirmasi untuk tahap berikut</p>
    </div>
    </div>
<!--       <div class="button"> <el-button type="primary" @click="onSubmit">Lanjut</el-button> <p>Konfirmasi untuk tahap berikut</p> </div> -->
  </div>
</template>

<script>
  import axios from 'axios';
  export default {
    name: 'Website',
    data() {
      return {
        height: '',
        activeId: "1",
        dataimg: [
         {src: require('../../public/img/img01_1.jpg'),},
          {src: require('../../public/img/img02_1.jpg'),},
          {src: require('../../public/img/img03_1.jpg'),},
          {src: require('../../public/img/img04_1.jpg'),}
        ]
      }
    },
    mounted() {
         document.documentElement.scrollTop = 340;
    },
    beforeMount:function(){
         if(document.body.clientWidth > 900) {
          this.height = (document.body.clientWidth*536/1584)*0.7+ 'px';
          document.documentElement.scrollTop = 800;
          console.log(document.documentElement.scrollTop) 
        }else {    
          this.height = document.body.clientWidth*536/1584 + 'px';
        }
    },
    methods: {
      checkActivity(value){
        this.activeId = value || "1";
      },
      onSubmit() {
        let paraObj = {
              "userId": this.$route.query.uid,
              "dateStr": this.$route.query.dt,
              "packageId":parseInt(this.activeId) 
            };
        axios.patch("https://manage.newsinpalm.com/api/v1/praise",paraObj).then(res => {
           res && this.$router.push({ path: '/share', query:{dt:paraObj.dateStr,uid:paraObj.userId} });
          }).catch(error => {
            console.error('Error', error.message);
        })
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .active:hover{
     cursor:pointer;
   }
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
  .header_icon {
    width: 2rem;
    position: absolute;
    right: 25%;
    top: 1%;
  }
  @media only screen and (max-width: 900px) {
    .header_icon{
      /* display:none; */
    }
  }
  .el-carousel__container {
      height:100%;
  }
  .carousel {
    width: 70%;
    margin: 0 auto;
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
    width: 20rem;
    margin: -15px auto;
    background-color: #fff;
    position: absolute;
    z-index: 2000;
    left:50%;
    margin-left:-10rem; 
    margin-bottom: 80px; 
    box-sizing: border-box;
   }
  .content .active {
    width: 50%;
    float: left;
    cursor: pointer;
  }
  @media screen and (max-width:320px) {
     .content {
        left:50%;
        width: 20rem;
        margin-left:-10rem;
        box-sizing: border-box;
        height: 1308px;
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
    .block {
      background-color: red;
    }
    /* .el-carousel__container  {
      height: 170px;
    } */
    .content {
      width: 19rem;
      margin-left:-9.5rem; 
      left:50%;
      height: 1308px;
    }
       .content .active {
    width: 100%;
    float: left;
  }
  }
  @media screen and (min-width:490px) {
     .content {
        left:50%;
        width: 50%;
        margin-left:-25%; 
        box-sizing: border-box;
        padding:0px 25px 100px 25px;      
      }
  }
  .content .title {
    padding-top: 22px;
    font-weight: bold;
    font-size: 38px;
    color: #00bea4;
  }
  .content .top {
    color: #a1a1a1;
    font-size: 10pt;
    margin: 13px;
  }
  .content .active  .left img {
    width: 35%;
    float: left;
  }
  .content .active .right {
    font-size: 10pt;
    text-align: left;
    width: 90%;
    margin-left: 5px;
    margin: 0px 20px 0px 20px;
  }
   @media screen and (max-width:320px) {
    .content .active .right {
      font-size: 10pt;
      text-align: left;
      width: 90%;
      margin-left: 5px;
    }
  }
  @media screen and (min-width:490px) {
    .content .active .right {
        font-size: 10pt;
        text-align: left;
        width: 90%;
        margin-left: 5px;
    }
  }
  .content .active .right p {
    margin: 8px;
    padding-bottom: 5px;
  }
  .content .active .right .pa {
    position: relative;
    font-weight: bold;
    border-bottom: 1px solid #e0e0e0;
  }
  .content .active .right .pa img {
    width: 15px;
    height: 15px;
    float: right;
  }
  .content .active .right .pa ._two,
  .content .active .right .pa ._three {
    font-weight: normal;
  }
  #mon {
    color: #a1a1a1;
    padding-left: 10px;
    font-size: 12px;
  }
  .money {
    font-weight: bold;
    color: #00bea4;
    font-size: 14pt;
    border-bottom: none;
  }
  .money ._two {
    color: black;
    font-weight: normal;
    font-size: 14px;
  }
  
  .button { 
    position: absolute;
    z-index: 1000000;
    bottom: 10rem;
    right: 12%;
  }
  .button p {
    margin: 2px;
    color: black;
    font-size: 10pt;
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
  }
   .sm-btn {
        background-color: #00c4db;
        width: 166px;
     }
  .el-button--primary {
    background-color: #00c4db;
    width: 100%;
  }
  .el-radio {
    width: 80%;
    white-space: normal;
    height: 26px;
    line-height: 26px;
    font-weight: bold;
  }
  .el-radio__input {
    position: absolute;
    left: 190px;
  }
  .el-radio-group {
    position: relative;
  }
  .radio {
    position: absolute;
    right: 0px;
    top: -3px;
  }
  .pa_span {
    width: 80%;
    display: block;
  }
  .el-carousel__button{
    width: 10px !important;
    height: 10px !important;
    margin-bottom: 3px !important;
    border-radius: 50%;
  }
  @media only screen and (max-width: 900px) {
    .el-form-item__content {
      margin-left: 0 !important;
    }
    .el-form-item__label{
      text-align:left !important;
    }
    .content .title{
      font-size:120%;
    }
    .txt-center{
      text-align:center;
    }
    /* .carousel {
      height: 170px;
    } */
    .content .title {
      padding-top: 14px;
    }
    .content .top {
      margin: 10px;
      margin-bottom: 0px;
      padding: 0px 12px;
    }
    .active {
      border-bottom: 2px solid #e5e5e5;
    }
    .content .active .right {
      margin-bottom: 10px;
      margin-top: 25px;
    }
    .active_last {
      border-bottom:none;
    }
    .content .active .right_first {
      margin-top: 0px;
    }
    .carousel {
      width: 100%;
      margin: 0 auto;
    }
    .content {
      margin-top: -5px;
      height: 1308px;

    }
    
    .content .active .right p {
      margin: 12px;
    }
    .button {
        position: absolute;
        z-index: 1000000;
        bottom: 16px;
        width: 100%;
        right: 0;
    }
    .page .header ._logo {
      right: 39%;
    }
    .header_icon {
      right: 30%;
      top: 12px;
      width: 20px;
    }

  }
</style>
