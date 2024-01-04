<template>
  <div :class="set(stepConfig.currStepIndex)" class="page" style="background-size: 100% 100%;">
    <div class="nav">{{'0'+stepConfig.currStepIndex}}/<span>{{'0'+stepConfig.total}}</span></div>
    <el-radio-group v-model="stepConfig.selectedValue" class="form" @change="sourceFilter">
      <div class="description">
        {{stepConfig.description}}
      </div>
      <p v-for="item in dataSource" :class="item.checked ? 'checked' : 'unchecked' ">
        <el-radio :label="item.label" class="select"><span class="index-select">{{item.letter}}</span>{{item.text}}</el-radio>
      </p>
    </el-radio-group>
  </div>
</template>
<script>
export default {
  name: 'StepPage',
  data() {
    return {}
  },
  props: {
    stepConfig: Object,
    dataSource: Array
  },
  methods: {
    sourceFilter(item) {
      this.$emit('change', item);
      console.log(item, "spubg选择了什么")
      gtag('event', 'click', {
        'event_category': 'Pubg-' + "选择 第" + this.stepConfig.currStepIndex + "题,对应的是" + item,
        'event_label': 'pubg的题目选项一共触发次数',
        'event_callback': function() { console.log('YES') }
      });
    },
    set(key) {
      let obj = 'page-bg-image0' + key;
      return obj
    },

  }
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped="scoped">
.page {
  width: 100%;
  height: 100%;
  color: #fff;
  background: url('../../../static/game1.jpg');
  background-size: 100% 100%;
  position: relative;
}

.page-bg-image01 {
  background: url('../../../static/game1.jpg');
}

.page-bg-image02 {
  background: url('../../../static/game2.jpg');
}

.page-bg-image03 {
  background: url('../../../static/game3.jpg');
}

.page-bg-image04 {
  background: url('../../../static/game4.jpg');
}

.page-bg-image05 {
  background: url('../../../static/game5.jpg');
}

.page-bg-image06 {
  background: url('../../../static/game6.jpg');
}

.page-bg-image07 {
  background: url('../../../static/game7.jpg');
}

.nav {
  position: absolute;
  width: 20%;
  background: linear-gradient(to right, rgba(10, 120, 184, .7), rgba(107, 157, 186, .3));
  font-size: 28px;
  padding: .5% 4%;
  top: 3%;
}

.nav span {
  font-size: 22px;
}

.description {
  font-weight: bold;
  font-size: 19px;
  padding: 1rem 3rem;
  line-height: 25px;
}

.form {
  position: absolute;
  bottom: 7%;
  width: 100%;
}

p {
  width: 100%;
  height: 60px;
  text-align: left;
  line-height: 60px;
  background: url("../../../static/img/1-1.png") center top;
  background-size: 80% 100%;
  background-repeat: no-repeat;
  position: relative;
}

p.checked {
  background: url("../../../static/img/1-2.png") center top;
  background-size: 80% 100%;
  background-repeat: no-repeat;
}

p.unchecked {
  background: url("../../../static/img/1-1.png") center top;
  background-size: 80% 100%;
  background-repeat: no-repeat;
}

p .select {
  position: absolute;
  left: 3.2rem;
  width: 80%;
  height: 60px;
  text-align: left;
  line-height: 60px;
  -webkit-tap-highlight-color: rgba(255, 0, 0, 0);
}

/deep/ .el-radio__input {
  visibility: hidden;
}

.index-select {
  padding: 5px 4px;
  position: absolute;
  background: url("../../../static/img/1-3.png");
  background-size: 100% 100%;
  width: 17px;
  height: 17px;
  line-height: 17px;
  left: 0;
  top: 16px;
  text-align: center;
  color: #000;
  font-weight: bold;
  font-size: 20px;
}

/deep/ .el-radio__label {
  color: #fff;
  margin-left: 5px;
  font-weight: bold;
  font-size: .9rem;
}

@media screen and (max-width:320px) {
  p .select {
    left: 2.7rem;
  }

  .index-select {
    width: 15px;
    height: 15px;
    line-height: 15px;
    top: 17px;
  }

  /deep/ .el-radio__label {
    margin-left: 2px;
    font-size: .75rem;
  }
}

</style>
