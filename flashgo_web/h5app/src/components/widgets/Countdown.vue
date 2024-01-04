<template>
  <div>
    <div v-if="styleType==='home'">
      <span class="countdown-field-home pull-left">{{hours}}</span>
      <span class="countdown-sep-home pull-left">:</span>
      <span class="countdown-field-home pull-left">{{minutes}}</span>
      <span class="countdown-sep-home pull-left">:</span>
      <span class="countdown-field-home pull-left">{{seconds}}</span>
    </div>
    <div v-if="styleType==='detail'" class="countdown-block">
      <span class="countdown-field-detail pull-left">{{hours}}</span>
      <span class="countdown-sep-detail pull-left">:</span>
      <span class="countdown-field-detail pull-left">{{minutes}}</span>
      <span class="countdown-sep-detail pull-left">:</span>
      <span class="countdown-field-detail pull-left">{{seconds}}</span>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'Countdown',
    props: {
      endTime: String,
      styleType: String
    },
    data() {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0
      }
    },
    mounted() {
      let self = this
      var countDownDate = new Date(self.endTime).getTime();
      var x = setInterval(function () {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        // console.log(distance)
        if (distance > 0) {
          self.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          self.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          self.seconds = Math.floor((distance % (1000 * 60)) / 1000);
          if (self.hours < 10) {
            self.hours = '0' + Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          }
          if (self.minutes < 10) {
            self.minutes = '0' + Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          }
          if (self.seconds < 10) {
            self.seconds = '0' + Math.floor((distance % (1000 * 60)) / 1000);
          }
        } else {
          self.hours = "00";
          self.minutes = "00";
          self.seconds = "00";
        }

        if (distance < 0) {
          clearInterval(x);
        }
      }, 1000);
    },
    methods: {}
  }
</script>
<style scoped>
  .countdown-field-home {
    border-radius: .2rem;
    font-weight: bold;
    font-size: .5rem;
    color: white;
    background: rgba(242, 52, 78, 1);
    padding-left: .2rem;
    padding-right: .2rem;
    margin-top: .1rem;
  }

  .countdown-sep-home {
    margin-left: .2rem;
    margin-right: .2rem;
    font-size: .5rem;
    color: rgba(242, 52, 78, 1);
  }

  .countdown-block {
    padding-right: .5rem;
    padding-top: .3rem;
  }

  .countdown-field-detail {
    border-radius: .2rem;
    font-weight: bold;
    font-size: .5rem;
    color: rgba(242, 52, 78, 1);
    background: white;
    padding: .1rem .2rem;
    margin-top: .1rem;
  }

  .countdown-sep-detail {
    margin-left: .1rem;
    margin-right: .1rem;
    font-size: .7rem;
    font-weight: bold;
    color: white;
  }

</style>
