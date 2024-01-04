<template>
  <div>
    <div class="showTwoBtn" v-if="show">
      <div class="content_img btn-two modalbox">
        <div class="top">
          <div @click="close()">
            <img class="close" src="../static/image/mipmap-xhdpi/close.png" alt="">
          </div>
          <img class="box" src="../static/image/mipmap-xhdpi/image.png" alt="">
          <p>Nikmati berbagai diskon produk dan dapatkan bonus harian di Ceki Ceki!</p>
        </div>
        <div class="bottom">
          <p class="border-btn" @click="goGp()">Coba sekarang</p>
          <p class="btn" @click="openPage()">Nanti</p>
        </div>
      </div>
    </div>
    <div class="alertbox" v-if="showDownLoad">
      <div class="alert-box" style="background: #fff">
        <div class="content_img top">
          <img class="close" @click="closeToDwon()" src="../static/image/mipmap-xhdpi/close@2x.png" alt="">
          <img class="box" src="../static/image/mipmap-xhdpi/im2.png" alt="">
          <div class="footer">
            <div class="bottom-title">Temukan review menarik lainnya di Ceki Ceki! </div>
            <div class="alertbtn" @click="goGp()" >Coba sekarang</div>
            <div class="moke"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/javascript">
import Common from '@/libs/common'

export default {
  name: 'PopUps',
  data() {
    return {
      close_x: true,
      closeTwoBtn: false,
    }
  },
  props: {
    show: Boolean,
    showDownLoad: Boolean,
    pageData: Object,
    source: String
  },
  methods: {
    close() {
      this.$emit('closePop')
    },
    closeToDwon() {
      this.$emit('closeToDwon')
    },
    goGp() {
      Common.downLoadGp(this.source)
    },
    openPage() {
      if (this.pageData && this.pageData.id && this.pageData.name) {
        Common.goToOwnPage('/' + this.pageData.name + '/' + this.pageData.id)
      } else if (this.pageData && this.pageData.name) {
        Common.goToOwnPage('/' + this.pageData.name)
      } else {
        Common.goToOutsidePage(this.pageData.target)
      }
    }
  }
}

</script>
<style lang="less" scoped="scoped">
.alertbox {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  padding: 3rem 1.7rem;
  margin: 0 auto;

  .footer {
    height: 57%;
  }

  .bottom-title {

    padding: .5rem 1.5rem;
    text-align: center;
    font-style: italic;
    font-size: .75rem;
    font-weight: bold;
    font-family: Roboto-BoldItalic;
    color: rgba(51, 51, 51, 1);
  }

  .alert-box {
    position: relative;
    width: 100%;
    border-radius: .3rem;

    .content_img {
      margin-top: 50px;
      height: 100%;

      img.box {
        width: 100%;
        height: 43%;
      }

      img.close {
        position: absolute;
        right: .5rem;
        width: .8rem;
        top: .5rem;
      }

      p {
        width: 88%;
        padding: 13px;
        color: #fff;
        display: inline-block;
        position: absolute;
        bottom: 7%;
        font-weight: bold;
        left: 0;
        right: 0;
        font-size: .8rem;
        text-align: center;
        background: linear-gradient(to bottom, #FF677B, #FF99A7);
        border-radius: 20px;
        margin: 0 auto;
      }
    }
  }
}

.showTwoBtn {
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.5);

  .modalbox {
    border-radius: 10px;
    margin: 5rem auto;
    width: 74%;
    background-color: #fff;

    .top {
      width: 100%;
      padding: .7rem 1.3rem;
      position: relative;

      p {
        font-size: 14px;
        text-align: center;
        font-weight: bold;
        margin-top: 5px;
        padding-bottom: .5rem;
      }

      .close {
        width: .9rem;
        position: absolute;
        right: .8rem;
        top: .5rem;
      }

      .box {
        width: 94%;
      }
    }

    .bottom {
      height: 33%;
      border-bottom-right-radius: 10px;
      border-bottom-left-radius: 10px;
      padding-top: .5rem;
      background: url(../static/image/mipmap-xhdpi/bg.png);
      background-size: 100% 100%;
      text-align: center;
      font-size: .69rem;

      .border-btn {
        color: #F2344E;
        width: 50%;
        padding: 8px;
        margin: 0 auto;
        background: rgba(255, 255, 255, 1);
        border-radius: 63px;
        text-align: center;
        font-weight: bold;
      }

      .btn {
        padding-bottom: .5rem;
        color: #fff;
      }
    }
  }
}

.alertbtn {
  color: #fff;
  width: 70%;
  border-radius: 20px;
  height: 2rem;
  text-align: center;
  line-height: 2rem;
  font-size: .8rem;
  background: rgba(167, 149, 253, 1);
  position: relative;
  margin-top: .75rem;
  margin-left: 15%;
  margin-bottom: 1.5rem !important;
  font-weight: bold;
}

.moke {
  height: 1.5rem;
}
</style>
