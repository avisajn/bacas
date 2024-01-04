<template>
  <div class="page">
    <div class="title">
    </div>
    <div class="description">
      <img src="../../static/img/index-title-top.png" alt="">
      <img src="../../static/img/index-title.png" alt="">
      <p class="title-second"> Hanya sedikit pertanyaan, kamu kan tahu apakah kamu tipe Kreatif atau Penyerbu. Kamu juga bisa bandingkan hasilnya dengan teman. Ayo mulai!</p>
    </div>
    <div class="button" @click="openPage()">
      <div class="button-img"></div>
      <div class="button-text">MULAI</div>
    </div>
    <div class="footer">
      <img src="../../static/img/index-icon.png" alt="">
      <span>bacaplus 2019 mini game</span>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  name: 'HelloWorld',
  data() {
    return {

    }
  },
  created() {
    console.log("2.15.6")
  },
  mounted() {
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', this.goBack, false);
    }
  },
  methods: {
    goBack() {
    
        
        // if (window.history && window.history.pushState) {
        //   history.pushState(null, null, document.URL);
        //   window.addEventListener('popstate', this.goBack, false);
        // }
             window.history.go(-4)
      
    },
    openPage() {
      document.getElementsByClassName("button-img")[0].style.backgroundImage = "url('static/img/button-click.png')";
      gtag('event', 'click', {
        'event_category': 'OpenHomePage-Click',
        'event_label': '点击首页按钮',
        'transport_type': 'beacon',
        'event_callback': function() { console.log('YES') }
      });
      setTimeout(() => {
        this.$router.push("/enterpage")
      }, 100)
    }
  }
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped="scoped">
.page {
  width: 100%;
  height: 100%;
  color: #fff;
  background: url('../../static/img/index.jpg');
  background-size: 100% 100%;
  position: relative;

}

.button {
  height: 4.4rem;
  top: 77%;
  position: relative;
}

.button .button-img {
  width: 50%;
  height: 100%;
  position: absolute;
  z-index: 100;
  margin-left: 25%;
  background: url("../../static/img/0.png") no-repeat;
  background-size: 100% 100%;
}

.button .button-text {
  text-align: center;
  line-height: 4.4rem;
  z-index: 120;
  position: absolute;
  font-weight: bold;
  font-size: 24px;
  width: 50%;
  margin-left: 25%;
  height: 100%;

}

.description img {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;

}

.title-second {
  padding: 0 5%;
  margin: 0 auto;
  position: absolute;
  top: 65%;
  font-size: .9rem;
  line-height: 16px;
  text-align: center;
}

.footer img {
  width: 100%;
  position: absolute;
  bottom: 0;
}

span {
  color: #0097A7;
  position: absolute;
  bottom: 3%;
  right: 5%;
  font-size: .5rem;
}

</style>
