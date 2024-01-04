<template>
  <div class="enterPage">
    <div class="title">
      <p>GAME MANA YANG KAMU</p>
      <p>MAINKAN?</p>
    </div>
    <div class="enterButton">
      <div class="leftBtn" @click="openPlanPubg()">
        <div class="text">PUBG</div>
      </div>
      <div class="seprate"></div>
      <div class="rightBtn" @click="openPlanFF()">
        <div class="text">FREE FIRE</div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  data() {
    return {

    }
  },
  created() {
    console.log("2.15.6")
  },
  methods: {
    openPlanPubg() {
      document.getElementsByClassName("leftBtn")[0].style.backgroundImage = "url('static/img/button-click.png')";
      gtag('event', 'click', {
        'event_category': 'toPUBGquestion',
        'event_label': ' 选择到pubg答题的',
        'transport_type': 'beacon',
        'event_callback': function() { console.log('YES') }
      });
      setTimeout(() => {
        this.$router.push("/pubgquestion")
      }, 100)
    },
    openPlanFF() {
      document.getElementsByClassName("rightBtn")[0].style.backgroundImage = "url('static/img/button-click.png')";
      gtag('event', 'click', {
        'event_category': 'toFFquestion',
        'event_label': '选择到ff答题的',
        'transport_type': 'beacon',
        'event_callback': function() { console.log('YES') }
      });
      setTimeout(() => {
        this.$router.push("/ffquestion")
      }, 100)

    }
  }
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped="scoped">
.enterPage {
  position: relative;
  width: 100%;
  height: 100%;
  background: url('../../static/img/enter.jpg');
  background-size: 100% 100%;
}

.enterPage .title {
  padding: 2.1rem 1.7rem;
}

.enterPage .title p {
  text-align: center;
  font-weight: bold;
  font-size: 1.9rem;
  color: #fff;
  font-family: KaiTi;
}

.enterButton .leftBtn {
  flex: 4;
  height: 4rem;
  margin-left: 1rem;
  background: url('../../static/img/0.png');
  background-size: 100% 100%;
}

.enterButton {
  width: 100%;
  position: absolute;
  bottom: 14%;
  display: flex;
}

.seprate {
  flex: 1
}

.enterButton .rightBtn {
  height: 4rem;
  flex: 4;
  margin-right: 1rem;
  background: url('../../static/img/0.png');
  background-size: 100% 100%;
}

.text {
  color: #fff;
  text-align: center;
  line-height: 4rem;
  font-weight: bold;
  font-size: 1.2rem;
}

</style>
