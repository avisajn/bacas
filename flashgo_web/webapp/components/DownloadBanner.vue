<template>
  <div v-if="show" class="row banner-background">
    <img src="https://kasbon.cash/ads/flashgo.png" class="banner-logo pull-left">
    <div class="banner-text pull-left">
      Unduh Ceki Ceki untuk <br>
      mendapatkan <span class="banner-text-money">Rp800</span> sekarang!
    </div>
    <a @click.prevent="close" href="#" class="close-button pull-right">
      <img src="http://kasbon.cash/ads/flashgo/static/images/close.png" />
    </a>
    <button @click.prevent="download" class="download-button pull-right">Unduh</button>
  </div>
</template>
<script>
import Config from '~/libs/config'
import Common from '~/libs/common'

export default {
  name: 'DownloadBanner',
  props: {
    show: Boolean,
    source: String
  },
  methods: {
    close() {
      this.$emit('closeDownload')
    },
    download() {
      Common.downLoadGp(this.source)
    }
  }
}

</script>
<style scoped>
.banner-background {
  width: 100%;
  padding: 0;
  height: 2.8rem;
  z-index: 1000;
  background: #404040;
  margin-bottom: 0;
  position: fixed;
}

@media screen and (min-width:1200px) {
  .banner-background {
    width: 50%
  }
}

.banner-logo {
  margin-top: .7rem;
  margin-left: .2rem;
  width: 1.5rem;
  height: 1.5rem;
}

.banner-text {
  margin-top: .7rem;
  margin-left: .2rem;
  font-size: .6rem;
  font-weight: bold;
  color: white;
  line-height: 1.2;
}

.banner-text-money {
  font-size: .7rem;
  font-weight: bold;
  color: rgba(235, 255, 0, 1);
}

.close-button {
  margin-right: .2rem;
  margin-left: .2rem;
  margin-top: .9rem;
}

.close-button img {
  width: .75rem;
}

.download-button {
  margin-top: .75rem;
  border-radius: .75rem;
  width: 3.6rem;
  height: 1.5rem;
  background: linear-gradient(to right top, rgba(255, 236, 117, 1), rgba(255, 250, 213, 1), rgba(255, 236, 119, 1));

  animation: download-button 0.3s cubic-bezier(0.51, 0.6, 1, 1) infinite alternate forwards;
  font-size: .7rem;
  font-weight: bold;
  color: rgba(218, 76, 85, 1);
  border: 0;
}

@keyframes download-button {
  100% {
    /* color:  blue; */
    background: linear-gradient(to right bottom, rgba(238, 216, 81, 1), rgba(255, 250, 213, 1), rgba(238, 216, 81, 1));
  }
}

</style>
