<template>
  <div v-if="show" class="modal-background">
    <div class="modal-data">
      <img src="https://kasbon.cash/ads/flashgo/static/images/shopping.png" class="download-logo">
      <p>Unduh Ceki Ceki untuk mencari produk termurah dan dapatkan uang setiap hari!</p>
      <a @click.prevent="close" href="#" class="close-button"><img
        src="https://kasbon.cash/ads/flashgo/static/images/turnoff.png"/></a>
      <button @click.prevent="download" class="download-button">Unduh</button>
    </div>
  </div>
</template>

<script>
  import Common from '@/libs/common'

  export default {
    name: 'DownloadModal',
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
  .modal-background {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    text-align: center;
    z-index: 1000;
    background-color: rgba(51, 51, 51, 0.95);
  }

  /* 模态框样式 */
  .modal-data {
    margin: 200px 1rem;
    height: 8rem;
    position: relative;
    border-radius: .2rem;
    background-color: #fff;
    border: 1px solid #000;
    padding-top: 2.5rem;
    padding-left: .5rem;
    padding-right: .5rem;
    text-align: center;
    font-size: .65rem;
    font-weight: bold;
  }

  .close-button {
    position: absolute;
    top: .4rem;
    right: .5rem;
  }


  .close-button img {
    width: .6rem;
  }

  .download-button {
    border-radius: .8rem;
    width: 95%;
    height: 1.6rem;
    background: linear-gradient(to right, rgba(250, 72, 122, 1), rgba(251, 64, 64, 1));
    font-size: .7rem;
    font-weight: bold;
    color: white;
    border: 0;
    transition: all 1s infinite forwa
  }

  .download-logo {
    width: 5rem;
    position: absolute;
    top: -2.4rem;
    left: 35%;
  }
</style>
