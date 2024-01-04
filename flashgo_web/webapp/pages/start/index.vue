<template>
  <div class="homepage">
    <pop-ups :pageData="pageData" :show="showPopup" @closePop="closePop()" :source='source'></pop-ups>
    <pop-ups :showDownLoad="showDownLoad" @closeToDwon="closeToDwon()" :source='source'></pop-ups>
    <download-modal :show="showDownloadModal" @closeDownload="closeDownload" :source='source'></download-modal>
    <header class="searchbar row">
      <div class="search-input col-85">
        <label class="icon" for="search">
          <img src="../../static/image/mipmap-xhdpi/search.png" class="search-icon">
        </label>
        <input placeholder="Belanja apa hari ini?" type="search" id='search' v-on:focus="goToSearch"/>
      </div>
      <div class="col-15" @click.prevent="openToDown">
        <img src="http://kasbon.cash/ads/flashgo/static/images/treasurechest.png" class="nav-bar-button">
      </div>
    </header>
    <div class="gotop" v-if="btnFlag" @click="goTop()"><img src="../../static/image/mipmap-xhdpi/top.png" alt=""></div>
    <feed-item-news :deal="feeds" :state="true" :source='source'></feed-item-news>
    <div class="wrap">
      <div class="wraptext">Content lain tidak tersedia</div>
    </div>
  </div>
</template>
<script type="text/javascript">
  import Common from '~/libs/common'
  import FeedItemNews from '~/components/FeedItemNews'
  import PopUps from '~/components/PopUps'
  import DownloadModal from '~/components/DownloadModal'
  import { commonGet } from '~/ajax/api'

  export default {
    components: { DownloadModal, PopUps, FeedItemNews },
    data() {
      return {
        showPopup: false,
        leftItems: [],
        showDownLoad: false,
        feeds: [],
        pageData: {},
        showDownloadModal: false,
        btnFlag: false,
        source: ''
      }
    },
    async asyncData({ req }) {
      try {
        if (!BacaAndroid.checkIsAppInstalled('com.cari.promo.diskon') && BacaAndroid.checkNeedShowFlashGoDialog()) {
          this.showDownLoad = true
          BacaAndroid.recordHasShowFlashGoDialog()
        }
      } catch (error) {
      }
      const source = req.headers['x-app-package-id']
      const feeds = await commonGet('sales/news/recommend?page_id=&count=55', '')
      return {
        feeds: feeds.slice(0, 50),
        source: source
      }
    },
    async mounted() {
      this.getMoreData()
      if (process.browser) {
        window.addEventListener('scroll', this.scrollToTop)
      }
    },
    destroyed() {
      if (process.browser) {
        window.removeEventListener('scroll', this.scrollToTop)
      }
    },
    methods: {
      target(target) {
        Common.target(target)
      },
      goTop() {
        const that = this
        let timer = setInterval(() => {
          let ispeed = Math.floor(-that.scrollTop / 5)
          document.documentElement.scrollTop = document.body.scrollTop = that.scrollTop + ispeed
          if (that.scrollTop === 0) {
            clearInterval(timer)
          }
        }, 16)

      },
      scrollToTop() {
        const that = this
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
        that.scrollTop = scrollTop
        if (that.scrollTop > 0) {
          that.btnFlag = true
        } else {
          that.btnFlag = false
        }
      },
      updateWaterfall() {
        const leftHeight = self.$refs.left.clientHeight
        const rightHeight = self.$refs.right.clientHeight
      },
      getMoreData() {
        var self = this
        const newFeeds = commonGet('sales/news/recommend?page_id=&count=55', '')
        self.leftItems.push(self.newFeeds)
      },
      goToSearch() {
        $('#search').blur()
        Common.goToOwnPage('/search/')
      },
      closeDownload() {
        this.showDownloadModal = false
      },
      closePop() {
        this.showPopup = false
      },
      openPop(name, id) {
        this.showPopup = true
        this.pageData = { name: name, id: id }
      },
      closeToDwon() {
        this.showDownLoad = false
      },
      openToDown() {
        this.showDownLoad = true
      },
      download() {
        Common.downLoadGp(this.source)
      }
    }
  }

</script>
<style lang="less" scoped="scoped">
  .homepage {
    width: 100%;
    position: relative;
    overflow: hidden;
    font-family: Roboto-Regular;
    background: rgba(244, 244, 244, 1);
  }

  body {
    background: white;
  }

  .gotop {
    width: 2rem;
    height: 2rem;
    position: fixed;
    bottom: 2.5rem;
    z-index: 100;
    right: .5rem;
  }

  .gotop img {
    width: 100%;

  }

  .wrap {
    position: relative;
    text-align: center;
    width: 100%;
    padding: 1rem;
    font-size: .65rem;
  }

  .wrap div {
    line-height: 20px;
    color: #999999;
    margin: 1rem;
  }

  .wrap div:after,
  .wrap div:before {
    position: absolute;
    top: 50%;
    background: #999999;
    content: "";
    height: 1px;
    width: 10%;
  }

  .wrap div:before {
    left: 1.2rem;
  }

  .wrap div:after {
    right: 1.2rem;
  }

  @keyframes myfirst {
    0% {
      transform: translate(0px, 0px);
    }

    50% {
      transform: translate(0px, -5px);
    }

    100% {
      transform: translate(0px, 0px);
    }
  }

  .searchbar {
    height: 2.6rem;
    background: white;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  }

  .searchbar input {
    padding-left: 1.5rem !important;
    height: 1.75rem !important;
    border-color: #F50043;
    border: 1.2px solid #F50043;
  }

  .search-icon {
    height: 0.8rem;
    width: 0.8rem;
    margin-top: 0.4rem;
    margin-left: 0.2rem;
  }

  .search-input label + input {
    padding-left: 2.0rem;
  }

  .see-more-icon {
    width: 1.5rem;
    height: 1.5rem;
    margin-top: 1.3rem;
  }

  .nav-bar-button {
    height: 1.5rem;
    width: 1.5rem;
    margin-left: .5rem;
  }

  .nav-bar-button {
    animation: myfirst 2s infinite;
  }

  @keyframes myfirst {
    0% {
      transform: translate(0px, 2px);
    }

    50% {
      transform: translate(0px, -5px);
    }

    100% {
      transform: translate(0px, 2px);
    }
  }

</style>
