<template>
  <div class="gamename">
    <div class="enter">
      <div class="top-title">Masukkan namamu</div>
      <el-form @submit.native.prevent>
        <el-form-item>
          <el-input v-model="name" @keyup.enter.native="submitName"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="submit" @click="submitName()">
      <div class="text">KONFIRMASI</div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  name: 'HelloWorld',
  data() {
    return {
      name: '',
      resultArray: [],
      mostNum: '',
      source: '',
      str: ''

    }
  },
  mounted() {
    var self = this;
    self.source = this.$route.params.source;
    let _data = this.$route.params.data.map((item) => item).join('');
    var str = _data.replace(/,/g, "");
    self.maxTime(str)
    if (self.source == "ff") {
      document.getElementsByClassName("gamename")[0].style.backgroundImage = "url('static/img/ff8.jpg')";
    }
  },
  methods: {
    maxTime(str) {
      var arr = [];
      arr = str.split('');
      var obj = {};
      var max = 0;
      for (var i = 0; i < arr.length; i++) {
        var num = 0;
        for (var j = 0; j < arr.length; j++) {
          if (arr[i] == arr[j]) {
            num++;
          }
        }
        if (num > max) {
          max = num;
        }
        obj[arr[i]] = num;
      }
      for (var i in obj) {
        if (obj[i] == max) {
          console.log(i + ':' + obj[i]);
          this.mostNum = i;
        }
      }
    },
    submitName() {
      var self = this;
      document.getElementsByClassName("submit")[0].style.backgroundImage = "url('static/img/button-click.png')";
      setTimeout(()=>{
        document.getElementsByClassName("submit")[0].style.backgroundImage = "url('static/img/0.png')";
      },300)
      if (this.name == '') {
        this.$message({
          message: 'Masukkan nama',
          center: true,
        });
        return
      }
      if (this.source == 'pubg') {
        gtag('event', 'click', {
          'event_category': 'PUBG result' + "出的是第" + this.mostNum,
          'event_label': 'pubg中出现结果' + this.mostNum,
          'transport_type': 'beacon',
          'event_callback': function() { console.log('YES') }
        });
        setTimeout(() => {
          this.$router.replace({ name: 'Result', params: { name: self.name, number: self.mostNum, source: self.source } });
        }, 100)
      }
      if (this.source == 'ff') {
        gtag('event', 'click', {
          'event_category': 'FF result' + "出的是第" + self.mostNum,
          'event_label': 'ff中出现结果' + this.mostNum,
          'event_callback': function() { console.log('YES') }
        });
        setTimeout(() => {
          this.$router.replace({ name: 'ffresult', params: { name: self.name, number: self.mostNum, source: self.source } });
        }, 100)
      }
    }
  }
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped="scoped">
.ffname {
  background: url('../../static/img/ff8.jpg');
  background-size: 100% 100%;
  width: 100%;
  height: 100%;
  position: relative;
}

.gamename {
  background: url('../../static/img/game8.jpg');
  background-size: 100% 100%;
  width: 100%;
  height: 100%;
  position: relative;
}

.enter {
  text-align: center;
  margin: 0 auto;
  padding-top: 4rem;
}

.top-title {
  color: #fff;
  font-size: 1.3rem;
}

.submit {
  width: 50%;
  background: url('../../static/img/0.png');
  background-size: 100% 100%;
  height: 4rem;
  position: absolute;
  margin-left: 25%;
  bottom: 14%;
}

.text {
  color: #fff;
  text-align: center;
  line-height: 4rem;
}

/deep/ .el-input__inner {
  background: url('../../static/img/1-1.png');
  background-size: 100% 100%;
  height: 4.5rem;
  width: 88%;
  border: none;
  color: #fff;
  font-size: 1.3rem;
}

</style>
