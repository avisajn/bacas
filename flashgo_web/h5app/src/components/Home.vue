<template>
  <div class="content">
    <download-modal :show="showDownloadModal" @closeDownload="closeDownload"></download-modal>
    <header class="searchbar row">
      <div class="search-input col-85">
        <label class="icon" for="search">
          <img src="http://kasbon.cash/ads/flashgo/static/images/search.png" class="search-icon">
        </label>
        <input type="search" id='search' v-on:focus="goToSearch"/>
      </div>
      <a class="col-15" href="#" @click.prevent="popDownload">
        <img src="http://kasbon.cash/ads/flashgo/static/images/treasurechest.png" class="nav-bar-button">
      </a>
    </header>
    <div>
      <div class="row">
        <img src="http://kasbon.cash/ads/flashgo/static/images/flashsale.png" class="pull-left block-icon">
        <span class="pull-left block-title">Flash Sale</span>
        <countdown v-if="endTime!=null" :end-time="endTime" style-type="home" class="pull-left"></countdown>
        <button class="pull-right block-button" @click.prevent="popDownload">Lihat Semua</button>
      </div>
      <div class="row inline-scroll">
        <div style="width: 200rem;">
          <a v-for="flashDeal in flashDeals" href="#" @click.prevent="goToDetail(flashDeal.deal.id)">
            <div class="flash-deal-item pull-left">
              <img class="item-img" :src="flashDeal.dealarticleimages[0].image" style="height: 4.2rem">
              <template v-if="flashDeal.deal.off>0">
                <img src="http://kasbon.cash/ads/flashgo/static/images/discount.png" class="item-discount-icon">
                <span class="item-discount-text">{{Math.floor(flashDeal.deal.off* 100) }}% Off</span>
              </template>
              <div v-if="flashDeal.deal.current_price>0" class="item-price"> Rp {{flashDeal.deal.current_price |
                formatMoney}}
              </div>
              <div v-else class="item-price"> Rp ???</div>
              <div v-if="flashDeal.deal.original_price>0" class="item-original-price"> Rp
                {{flashDeal.deal.original_price | formatMoney}}
              </div>
              <div v-else class="item-original-price"> Rp ???</div>
              <div class="sales-border">
                <div v-if="flashDeal.deal.stock===0 || (flashDeal.deal.sales/ flashDeal.deal.stock > 0.5)"
                     class="sales-ratio-green"></div>
                <div v-else class="sales-ratio-red"
                     :style="dynamicWidth(flashDeal.deal.sales/ flashDeal.deal.stock)"></div>
              </div>
            </div>
          </a>
          <a href="#" @click.prevent="popDownload">
            <div class="flash-deal-item pull-left">
              <img class="item-img see-more-icon" src="http://kasbon.cash/ads/flashgo/static/images/right_arrow.png">
              <div class="see-more-text">Lihat Semua</div>
            </div>
          </a>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <img src="http://kasbon.cash/ads/flashgo/static/images/cheapestthings.png" class="pull-left block-icon">
          <span class="pull-left block-title">Dibawah 30.000</span>
          <button class="pull-right block-button" @click.prevent="popDownload">Lihat Semua</button>
        </div>
      </div>
      <div class="row inline-scroll" style="height: 5.5rem">
        <div style="width: 200rem;">
          <a v-if="cheapDeals.length>0" v-for="cheapDeal in cheapDeals" href="#"
             @click.prevent="goToDetail(cheapDeal.deal.id)">
            <div class="cheap-deal-item pull-left">
              <img class="item-img" :src="cheapDeal.dealarticleimages[0].image" style="height: 4.2rem">
              <div class="item-price"> Rp {{cheapDeal.deal.current_price | formatMoney}}</div>
            </div>
          </a>
          <a href="#" @click.prevent="popDownload">
            <div class="cheap-deal-item pull-left">
              <img class="item-img see-more-icon" src="http://kasbon.cash/ads/flashgo/static/images/right_arrow.png">
              <div class="see-more-text">Lihat Semua</div>
            </div>
          </a>
        </div>
      </div>
      <div v-if="channels.length==2" class="row">
        <div class="col-50">
          <img :src="channels[0].image_logo" class="pull-left block-icon">
          <span class="pull-left block-title">{{channels[0].title}}</span>
        </div>
        <div class="col-50">
          <img :src="channels[1].image_logo" class="pull-left block-icon">
          <span class="pull-left block-title">{{channels[1].title}}</span>
        </div>
      </div>
      <div v-if="channels.length==2" class="row">
        <div class="col-50 left-block">
          <a href="#" @click.prevent="goToChannel(channels[0].id, channels[0].title)">
            <div class="channel-block row">
              <div class="col-40">
                <img :src="channels[0].image_one" class="pull-left channel-icon">
              </div>
              <div class="col-40">
                <img :src="channels[0].image_two" class="pull-left channel-icon">
              </div>
              <div class="col-20">
                <img src="http://kasbon.cash/ads/flashgo/static/images/right_arrow.png" class="channel-arrow">
              </div>
            </div>
          </a>
        </div>
        <div class="col-50 right-block">
          <a href="#" @click.prevent="goToChannel(channels[1].id, channels[1].title)">
            <div class="channel-block row">
              <div class="col-40">
                <img :src="channels[1].image_one" class="pull-left channel-icon">
              </div>
              <div class="col-40">
                <img :src="channels[1].image_two" class="pull-left channel-icon">
              </div>
              <div class="col-20">
                <img src="http://kasbon.cash/ads/flashgo/static/images/right_arrow.png" class="channel-arrow">
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <img src="http://kasbon.cash/ads/flashgo/static/images/recommend.png" class="pull-left block-icon">
          <span class="pull-left block-title">Rekomendasi</span>
        </div>
      </div>
      <div class="row">
        <div class="col-50 left-block">
          <feed-item :tokopedia=true></feed-item>
          <!--<feed-item></feed-item>-->
        </div>
        <div v-if="feeds.length > 0" class="col-50 right-block">
          <feed-item :deal="feeds[0]" :pop-new-page=true></feed-item>
        </div>
      </div>
      <template v-if="feeds.length > 0" v-for="(feed, idx) in feeds">
        <div v-if="idx % 2===1" class="row">
          <div class="col-50 left-block">
            <feed-item :deal="feed" :pop-new-page=true></feed-item>
          </div>
          <div v-if="feeds.length > idx+1" class="col-50 right-block">
            <feed-item :deal="feeds[idx+1]" :pop-new-page=true></feed-item>
          </div>
          <div v-else class="col-50 right-block">
            <feed-item></feed-item>
          </div>
        </div>
      </template>
      <template v-if="feeds.length % 2===1">
        <div class="row">
          <div class="col-50 left-block">
            <feed-item></feed-item>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
  import Common from '@/libs/common';
  import Config from '@/libs/config';
  import DownloadModal from "./widgets/DownloadModal";
  import Countdown from "./widgets/Countdown";
  import FeedItem from './widgets/FeedItem';

  export default {
    name: 'Home',
    components: {Countdown, DownloadModal, FeedItem},
    data() {
      return {
        flashDeals: [],
        cheapDeals: [],
        feeds: [],
        channels: [],
        showDownloadModal: false,
        endTime: null
      }
    },
    mounted() {
      let self = this
      self.initData()
      if (!BacaAndroid.checkIsAppInstalled('com.cari.promo.diskon') && BacaAndroid.checkNeedShowFlashGoDialog()) {
        this.showDownloadModal = true
        BacaAndroid.recordHasShowFlashGoDialog()
      }
    },
    methods: {
      dynamicWidth(ratio) {
        // console.log(flashDeal.deal.sales)
        // 
        return 'width: ' + Math.floor(ratio * 100) + '%'
      },
      initData() {
        let self = this
        Common.apiRequest('POST', 'sales/deals/flash_deal_top_feeds/', {
          user_id: 'test',
          page_id: 1,
          count: 8
        }, function (data) {
          self.flashDeals = data.data;
          self.endTime = self.flashDeals[0].flash.endtime
        }, true, false)
        Common.apiRequest('POST', 'sales/deals/get_cheapest_feeds/', {
          user_id: 'test',
          page_id: 1,
          count: 8
        }, function (data) {
          self.cheapDeals = data.data
        }, true, false)
        Common.apiRequest('GET', 'sales/deals/get_channels/', null, function (data) {
          self.channels = data.data
        }, true, false)
        Common.apiRequest('POST', 'sales/deals/get_recommendation_feeds/', {
          user_id: 'test',
          page_id: 1,
          count: 12
        }, function (data) {
          self.feeds = data.data
        }, true, false)
      },
      goToDetail(dealId) {
        BacaAndroid.openOwnWeb('', Config.webUrl + 'detail/' + dealId);
        // this.$router.push({path: '/detail/' + dealId})
      },
      goToChannel(channelId, channelTitle) {
        BacaAndroid.openOwnWeb('', Config.webUrl + 'channel/' + channelId + '/' + channelTitle);
        // this.$router.push({path: '/channel/' + channelId + '/' + channelTitle})
      },
      goToSearch() {
        $('#search').blur()
        BacaAndroid.openOwnWeb('', Config.webUrl + 'search/');
        // this.$router.push({path: '/search/'})
      },
      popDownload() {
        this.showDownloadModal = true
      },
      closeDownload() {
        this.showDownloadModal = false
      },
      download() {
        BacaAndroid.openThirdPartWeb(Config.downloadUrl)
        // window.location.href =
      }
    }
  }
</script>
<style scoped>
  body {
    background: white;
  }

  .flash-deal-item {
    position: relative;
    margin-right: .5rem;
    width: 4.2rem;
    height: 7.2rem;
    text-align: center;
  }

  .cheap-deal-item {
    position: relative;
    margin-right: .5rem;
    width: 4.2rem;
    height: 5rem;
    text-align: center;
  }

  .left-block {
    padding-right: .3rem;
  }

  .right-block {
    padding-left: .3rem;
  }

  .channel-block {
    background: white;
    padding-top: .6rem;
    display: block;
    height: 3.8rem;
  }

  .item-block {
    /*height: 10rem;*/
    display: block;
    position: relative;
    background: white;
  }

  .item-img {
    width: 100%;
    z-index: 0;
  }

  .item-source-icon {
    width: 1.2rem;
    height: 1.2rem;
    position: absolute;
    z-index: 1;
    left: 0;
    top: 0;
  }

  .item-discount-icon {
    width: 2.8rem;
    height: 0.9rem;
    position: absolute;
    z-index: 1;
    right: 0;
    top: .1rem;
    /* padding-top: .1rem; */
  }

  .item-discount-text {
    width: 2.4rem;
    height: 0.9rem;
    position: absolute;
    z-index: 2;
    right: 0;
    top: 0;
    color: white;
    font-size: .45rem;
    line-height: 1.1rem;
    /* font-weight: bold; */
    text-align: center;
  }

  .item-title {
    color: rgba(51, 51, 51, 1);
    font-size: .65rem;
    font-weight: bold;
    text-align: left;
    /*padding-left: .4rem;*/
  }

  .item-price {
    color: rgba(242, 52, 78, 1);
    font-size: .7rem;
    font-weight: bold;
    text-align: left;
    /*padding-left: .4rem;*/
  }

  .item-original-price {
    color: rgba(0, 0, 0, .3);
    font-size: .6rem;
    text-decoration: line-through;
    text-align: left;
    /*padding-left: .4rem;*/
  }

  .sales-border {
    margin-top: .1rem;
    height: .4rem;
    border-radius: .15rem;
    width: 100%;
    border: 1px rgba(0, 0, 0, .2) solid;
    background: white;
  }

  .sales-ratio-green {
    background: linear-gradient(to right, rgba(232, 98, 98, 1), rgba(242, 52, 78, 1));
    height: 105%;
    border-radius: .15rem;
  }

  .sales-ratio-red {
    background: linear-gradient(to right, rgba(232, 98, 98, 1), rgba(242, 52, 78, 1));
    height: 105%;
    border-radius: .15rem;
  }

  .channel-icon {
    width: 100%;
  }

  .channel-arrow {
    margin-top: .8rem;
    width: .8rem;
  }

  .inline-scroll {
    width: 100%;
    height: 7rem;
    white-space: nowrap; /*规定段落中的文本不进行换行*/
    overflow-x: scroll;
    overflow-y: hidden; /*竖直方向，超出部分隐藏*/
    float: left; /*一定要设置左侧浮动*/
  }

  .inline-scroll li {
    list-style: none;
  }

  .inline-scroll::-webkit-scrollbar {
    display: none;
  }

  .block-button {
    border-radius: .5rem;
    border-width: 0;
    height: 1.1rem;
    width: 4rem;
    font-size: .6rem;
    color: white;
    background: linear-gradient(to right, rgba(255, 82, 117, 1), rgba(243, 100, 100, 1));
  }

  .nav-bar-button {
    height: 1.5rem;
    width: 1.5rem;
    margin-left: .5rem;
  }

  .searchbar {
    height: 2.5rem;
    background: white;
    /*padding-left: .5rem;*/
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  }

  .searchbar input {
    background: #f2f2f2;
    height: 1.6rem;
    border-radius: .8rem;
    border-color: #f2f2f2;
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
    width: .8rem;
    height: .8rem;
    margin-top: 2rem;
  }

  .see-more-text {
    font-size: .65rem;
    color: rgba(242, 52, 78, 1);
  }

</style>

