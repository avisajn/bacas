<template>
  <div class="resultPage">
    <div class="resultPage" ref="range">
      <div class="result-content change-content">
        <div>
          <img src="../../../static/result-title.png" alt="" class="name">
          <div class="nameDownload name-text-down" style="line-height: 3rem;">
            <p>{{resultObj.name}}</p>
          </div>
          <img :src="changeimg(resultObj.number)" alt="" class="pic">
          <p class="titleClick">{{resultObj.title}}</p>
          <div class="content" style="margin-bottom: 1rem;">{{resultObj.desc}}</div>
        </div>
      </div>
      <div class="footer">
        <div class="bird"><img src="../../../static/footer-bird.png" alt=""></div>
        <div class="down-text-footer">Pencarian PUBG/FREE FIRE di Baca Plus, ikuti video para pemain pro. Download sekarang!</div>
        <div class="bird"><img src="../../../static/img/qr.png" alt=""></div>

      </div>
    </div>
    <div class="resultPage">
     <div class="result-content change-content">
       <div class="art">
         <img src="../../../static/result-title.png" alt="" class="name">
         <div class="name-text">
           <p class="fashionText" :class="this.resultObj.name.length>10?'animate':''">{{resultObj.name}}</p>
         </div>
         <img :src="changeimg(resultObj.number)" alt="" class="pic">
         <p class="title fashionText">{{resultObj.title}}</p>
         <div class="content">{{resultObj.desc}}</div>
         <div class="down" @click="downloadImg()">
           <div style="position: relative;width: 100%">
             <img class="outImg" src="../../../static/1.png" alt="">
           </div>
         </div>
       </div>
     </div>
     <p class="footer-top">{{resultObj.info}}</p>
     <div class="enterButton">
       <div class="leftBtn" @click="openAgin()" :class="!btnActiveObj.isActived4LeftBtn?'normal-btn':'active-btn'">
       </div>
       <div class="rightBtn" @click="showCssPopup(true)" :class="!btnActiveObj.isActived4RightBtn ?'share-normal-btn':'share-active-btn'">
       </div>
     </div>
     <div class="footer">
       <div class="bird"><img src="../../../static/footer-bird.png" alt=""></div>
       <div class="text-footer">Pencarian PUBG/FREE FIRE di Baca Plus, ikuti video para pemain pro. Download sekarang!</div>
       <div class="google" @click="goGp()">
         <img class="googlePic" src="../../../static/2.png" alt="">
       </div>
     </div>
     <div class="css-popup" v-show="show">
       <div class="mask" v-show="show" @click="showCssPopup(false)"></div>
       <div class="popup-content" :class="{show}">
         <ul>
           <li @click="ShareFacebook()"><img src="../../../static/fb.jpg" alt=""><span>facebook</span></li>
           <li @click="ShareWhatsapp()"><img src="../../../static/whats.png" alt=""><span>whatapp</span></li>
           <li @click="ShareLine()"><img src="../../../static/line.jpg" alt=""><span>line</span></li>
           <li @click="CopyLink()" v-model="copyContent" v-clipboard:copy="copyContent" v-clipboard:success="onCopy" v-clipboard:error="onError"><img src="../../../static/copy.jpg" alt=""><span>copy</span></li>
         </ul>
       </div>
     </div>
   </div>
    <div class="alert" v-show="message">{{messageText}}</div>
  </div>
</template>
<script>
import html2canvas from "html2canvas"
import Clipboard from 'clipboard'
export default {
  name: 'ResultPage',
  data() {
    return {
      name: '',
      imgUrl: '',
      sharePage: false,
      show: false,
      message: false,
      messageText: '',
      source: '',
      resource: '',
      width: '',
      height: '',
      copyContent: this.resultObj.name + ' adalah ' + this.resultObj.title + ". Ingin tahu kamu tipe SURVIVOR apa dalam PUBG/FREE FIRE? Klik dan temukan >>> http://bit.ly/32Z6PHH",
      btnActiveObj: {
        isActived4LeftBtn: false,
        isActived4RightBtn: false
      }
    }
  },
  props: {
    resultObj: Object
  },
  mounted() {
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', this.goBack, false);
    }
    if (this.source == 'ff') {
      this.resource = 'FREE FIRE'
    }
    if (this.source == 'pubg') {
      this.resource = 'PUBG'
    }
    var self = this
    if (this.resultObj == null) {
      var oTest = document.getElementsByClassName("full")[0];
      var newNode = document.createElement("div");
      oTest.appendChild(newNode);
      newNode.style.position = 'absolute';
      newNode.style.left = '15%';
      newNode.style.top = '50%';
      newNode.style.width = '70%';
      newNode.style.height = '4rem';
      newNode.style.background = "url('static/button.png')";
      newNode.style.backgroundSize = "100% 100%";
      newNode.onclick = function() {
        self.$router.push("/");
      };
    }
  },
  destroyed() {
    window.removeEventListener('popstate', this.goBack, false)
  },
  created() {
    this.source = this.$route.params.source;
    this.width = document.documentElement.scrollWidth
    this.height = document.documentElement.scrollHeight
  },
  methods: {
    showCssPopup(flag) {
      var self = this;
      this.changeBgImg('rightbtn', () => {
        self.show = flag;
      })
    },
    onCopy: function(e) {
      this.$message({ message: "Berhasil disalin", center: true });
    },
    onError: function(e) {
      this.$message({ message: "Replikasi gagal", center: true });
    },
    goBack() {
      if (this.show) {
        this.show = false;
        if (window.history && window.history.pushState) {
          history.pushState(null, null, document.URL);
          window.addEventListener('popstate', this.goBack, false);
        }
      } else {
        this.$router.replace({ path: '/' });
      }
    },
    changeimg(key) {
      var obj = "static/" + this.source + "/" + this.source + key + ".png"
      return obj
    },
    downloadFile(fileName, content) {
      let aLink = document.createElement('a');
      let blob = this.base64ToBlob(content);
      let evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", true, true);
      aLink.download = fileName;
      aLink.href = URL.createObjectURL(blob);
      aLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      BacaAndroid.downloadImage(content,'download')
    },
    base64ToBlob(code) {
      let parts = code.split(';base64,');
      let contentType = parts[0].split(':')[1];
      let raw = window.atob(parts[1]);
      let rawLength = raw.length;
      let uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    },
    downloadImg() {
      let _self = this;
      document.getElementsByClassName("outImg")[0].src = "static/1_1.png";
      setTimeout(() => {
        document.getElementsByClassName("outImg")[0].src = "static/1.png";
      }, 300)
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      try {
        _self.sharePage = true;
        html2canvas(this.$refs.range).then(canvas => {
          _self.imgUrl = canvas.toDataURL();
          _self.downloadFile('download.png', _self.imgUrl);
        });
        gtag('event', 'click', {
          'event_category': 'downloadImg',
          'event_label': '下载图片',
          'event_callback': function() { console.log('YES') }
        });
      } catch (err) {
        _self.message = true;
        _self.messageText = "Gagal menyimpan gambar";
        setTimeout(() => {
          _self.message = false;
        }, 2000)
        console.log(`download error=>${err}`)
      }
    },
    openAgin() {
      let _self = this;
      this.changeBgImg('leftbtn', () => {
        _self.$router.push("/");
        if (_self.source == 'ff') {
          gtag('event', 'click', {
            'event_category': 'FF-Agin',
            'event_label': '再来一次',
            'event_callback': function() { console.log('YES') }
          })
        } else {
          gtag('event', 'click', {
            'event_category': 'PUBG-Agin',
            'event_label': '再来一次',
            'event_callback': function() { console.log('YES') }
          })
        }

      })
    },
    goGp() {
      let _self = this;
      document.getElementsByClassName("googlePic")[0].src = "static/2_1.png";
      setTimeout(() => {
        document.getElementsByClassName("googlePic")[0].src = "static/2.png";
       window.location.replace('https://play.google.com/store/apps/details?id=com.jakarta.baca.lite')
      }, 100)
      gtag('event', 'click', {
        'event_category': 'toGoogleplay',
        'event_label': '下载',
        'event_callback': function() { console.log('YES') }
      })
    },
    ShareFacebook() {
      let _self = this
     window.location.replace("http://www.facebook.com/sharer/sharer.php?u=" + 'http://d2au6uxc3p9fm5.cloudfront.net/s/f/' + this.source + this.resultObj.number + '.html')
      gtag('event', 'click', {
        'event_category': 'ShareFacebook',
        'event_label': '分享出去',
        'event_callback': function() { console.log('YES') }
      });

    },
    ShareLine() {
     window.location.replace('http://line.me/R/msg/text/?' + this.resultObj.name + ' adalah ' + this.resultObj.title + " di " + this.resource + ".  Ingin tahu kamu tipe survivor yang mana? Klik dan temukan >>> http://d2au6uxc3p9fm5.cloudfront.net/s/l/" + this.source + this.resultObj.number + ".html")

      gtag('event', 'click', {
        'event_category': 'ShareLine',
        'event_label': '分享出去',
        'event_callback': function() { console.log('YES') }
      })
    },
    ShareWhatsapp() {
     window.location.replace('whatsapp://send?text=' + this.resultObj.name + ' adalah ' + this.resultObj.title + "  di " + this.resource + ".  Ingin tahu kamu tipe survivor yang mana? Klik dan temukan >>> http://d2au6uxc3p9fm5.cloudfront.net/s/w/" + this.source + this.resultObj.number + ".html")
      gtag('event', 'click', {
        'event_category': 'Sharewhatapp',
        'event_label': '分享出去',
        'event_callback': function() { console.log('YES') }
      })
    },
    CopyLink() {
      gtag('event', 'click', {
        'event_category': 'copylink',
        'event_label': '复制链接',
        'event_callback': function() { console.log('YES') }
      })
    },
    changeBgImg(label, callback) {
      this.setBtnStatus(label, true);
      let _self = this;
      setTimeout(() => {
        _self.setBtnStatus(label, false);
        callback();
      }, 100)
    },
    setBtnStatus(label, status) {
      switch (label) {
        case 'leftbtn':
          this.btnActiveObj.isActived4LeftBtn = status;
          break;
        case 'rightbtn':
          this.btnActiveObj.isActived4RightBtn = status;
          break;
      }
    }
  }
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped="scoped">
ul {
  width: 100%;
  display: flex;
  list-style: none;
  margin-top: 2rem;
}

li {
  flex: 2;
}

li img {
  width: 55%;
  margin-left: 22.5%;
}

li span {
  width: 100%;
  font-size: .8rem;
  text-align: center;
  display: inline-block;
}

.mint-popup,
.mint-popup-bottom {
  position: absolute;
  left: 80px;
  color: red;
}

.v-modal {
  bottom: 0;
  height: 30%;
  background: red;
}

.resultPage {
  width: 100%;
  background: url("../../../static/img/loading.jpg");
  background-size: 100% 100%;
  position: absolute;
}

.resultPage .down {
  width: 100%;
  margin-bottom: 1rem;
}

.outImg {
  width: 80%;
  margin-left: 10%;
}

p img {
  position: absolute;
  width: 3.4rem;
  height: 3.4rem;
}

p img.arrow {
  left: 0;
  top: 0;
  margin-left: .9rem;
  margin-top: .9rem;
  width: 1.7rem;
  height: 1.7rem;
}

.result-content {
  width: 92%;
  background: url('../../../static/result-content.png') no-repeat;
  background-size: 100% 100%;
  margin-top: 3.2rem;
  margin-left: 4%;
  overflow: hidden;
}

.change-content {
  margin-top: 1rem;
}

.sharePage {
  height: 100%;
}

.result-share {
  height: 69%;
}

.pic {
  width: 92%;
  margin-left: 4%;
  margin-top: 1.7rem;
}

.art {
  width: 100%;
}

.name,
.name-text,
.nameDownload {
  width: 80%;
  position: absolute;
  margin-left: 6%;
  text-align: center;
  -webkit-background-clip: text;
}

.name-text {
  width: 60%;
  position: absolute;
  line-height: 4rem;
  font-size: 1.5rem;
  z-index: 1000;
  margin-left: 16%;
  overflow: hidden;
  display: inline-block;
  white-space: nowrap;
}

.name-text-down {
  width: 60%;
  top: 1.5rem;
  position: absolute;
  line-height: 4rem;
  font-size: 1.5rem;
  margin-left: 16%;
  overflow: hidden;
  display: inline-block;
  white-space: nowrap;
}

.animate {
  font-size: 1.2rem;
  display: inline-block;
  white-space: nowrap;
  animation: 4s wordsLoop linear infinite normal;
}

@keyframes wordsLoop {
  0% {
    transform: translateX(200px);
    -webkit-transform: translateX(80px);
  }

  100% {
    transform: translateX(-100%);
    -webkit-transform: translateX(-100%);
  }
}

@-webkit-keyframes wordsLoop {
  0% {
    transform: translateX(200px);
    -webkit-transform: translateX(200px);
  }

  100% {
    transform: translateX(-100%);
    -webkit-transform: translateX(-100%);
  }
}

.nameDownload {
  color: #c8aa39;
  position: absolute;
  line-height: 4rem;
  font-size: 1.2rem;
  font-family: AlteDIN1451Mittelschrift;
  font-weight: bold;
}

p.titleClick {
  color: #c8aa39;
  font-weight: bold;
  text-align: center;
  margin: 0 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #075865;
  font-size: 1.3rem;
}

p.title {
  font-weight: bold;
  text-align: center;
  margin: 0 1.5rem;
  padding-top: .5rem;
  border-top: 1px solid #075865;
  font-size: 1.3rem;
  margin-top: -1rem;
}

.content {
  color: #fff;
  padding: .5rem 1.4rem .3rem;
  font-size: .85rem;
  font-weight: bold;
  text-align: center;
  line-height: 1rem;
}

.footer-top {
  width: 100%;
  color: #fff;
  font-size: 1rem;
  line-height: 20px;
  text-align: center;
  padding: .3rem 0rem;
}

.enterButton .leftBtn,
.rightBtn {
  flex: 3;
  height: 3.9rem;
}

.rightBtn {
  margin-left: .25rem;
}

.leftBtn {
  margin-right: .25rem;
}

.enterButton {
  width: 100%;
  display: flex;
  padding: 0 1rem;
  box-sizing: border-box;
}

.normal-btn {
  background: url('../../../static/4.png');
  background-size: 100% 100%;
}

.active-btn {
  background: url('../../../static/4_1.png');
  background-size: 100% 100%;
}

.share-normal-btn {
  background: url('../../../static/3_1.png');
  background-size: 100% 105%;
}

.share-active-btn {
  background: url('../../../static/3.png');
  background-size: 100% 105%;
}

.share {
  margin-right: .5rem;
}

.text {
  width: 100%;
  text-align: center;
  line-height: 3.9rem;
  font-size: 1.1rem;
  color: #fff;
  font-family: Roboto;
}

.footer {
  display: flex;
  padding: 1rem 1rem .2rem .5rem;
  font-weight: bold;
  box-sizing: border-box;
}

.footer .bird {
  flex: 1.5;
  margin-left: .5rem
}

.bird img {
  width: 90%;
}

.google {
  flex: 3;
}

.google img {
  width: 100%;
}

.footer .text-footer {
  flex: 6;
  color: #0097a7;
  margin-left: 0px;
  font-size: .6rem;
  line-height: 14px;
  padding-top: 3px;
}

.down-text-footer {
  flex: 6;
  color: #0097a7;
  font-size: .8rem;

}

.alert {
  width: 40%;
  height: 50px;
  border-radius: 10px;
  background-color: #EDF2FC;
  text-align: center;
  position: absolute;
  bottom: 3rem;
  left: 30%;
  line-height: 50px;
  opacity: .9;
}

@media screen and (max-width:320px) {
  p img {
    position: absolute;
    width: 2rem;
    height: 2rem;
  }

  p img.arrow {
    left: 0;
    top: 0;
    margin-left: .5rem;
    margin-top: .5rem;
    width: 1rem;
    height: 1rem;
  }

  .enterButton .leftBtn,
  .rightBtn {
    height: 3rem;
  }

  .text {
    line-height: 3rem;
  }

  .name-text {
    line-height: 3rem;
  }

  .enterButton {
    bottom: 9%;
  }

  .result-share {
    height: 69%
  }

  .footer-top {
    bottom: 18%;
    font-size: 13px;
    line-height: 20px;
  }

  p.title {
    padding-top: .4rem;
  }

  .nameDownload {
    line-height: 3rem;
    top: 1.1rem;
  }
}

.popup-content {
  position: fixed;
  height: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  border-radius: 10px;
  background-color: #fff;
  -webkit-transition: all 0.2s ease-in;
  transition: all 0.2s ease-in;
}

.show {
  height: 130px;
  width: 100%;
}

.mask {
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: all 0.5s ease-in;
}

.slide-enter-active {
  animation-name: slideInUp;
  animation-duration: 0.2s;
  animation-fill-mode: both;
}

.slide-leave-active {
  animation-name: slideOutDown;
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

@keyframes slideInUp {
  0% {
    transform: translate3d(0, 100%, 0);
    visibility: visible;
  }

  to {
    transform: translateZ(0);
  }
}

@keyframes slideOutDown {
  0% {
    transform: translateZ(0);
  }

  to {
    visibility: hidden;
    transform: translate3d(0, 100%, 0);
  }
}

.delay-leave-active {
  -webkit-animation-delay: 0.5s;
  -moz-animation-delay: 0.5s;
  -o-animation-delay: 0.52s;
  animation-delay: 0.5s;
}

</style>
