<template>
  <a v-if="tokopedia" href="#" @click.prevent="downloadTokopedia()">
    <div class="item-block">
      <div class="item-img">
        <img src="http://kasbon.cash/ads/flashgo/ad/tokopedia_cpi.png">
      </div>
      <div class="item-title">Kode Promo: <br>YUKMULAI</div>
      <div class="item-price">Cashback ke OVO points</div>
      <div class="item-price">hingga 50 RB</div>
    </div>
  </a>
  <a v-else-if="deal != null" href="#" @click.prevent="goToDetail(deal.deal.id)">
    <div class="item-block">
      <div class="item-img">
        <img :src="deal.dealarticleimages[0].image">
      </div>
      <img :src="deal.ecommerce.logo" class="item-source-icon">
      <template v-if="deal.deal.off>0">
        <img src="http://kasbon.cash/ads/flashgo/static/images/discount.png" class="item-discount-icon">
        <span class="item-discount-text">{{Math.floor(deal.deal.off * 100)}}% Off</span>
      </template>
      <div class="item-title">{{deal.deal.title}}</div>
      <template v-if="deal.deal.current_price<deal.deal.original_price">
        <div class="item-price"> Rp {{deal.deal.current_price | formatMoney}}</div>
        <div class="item-original-price"> Rp {{deal.deal.original_price | formatMoney}}</div>
      </template>
      <template v-else>
        <div class="item-single-price"> Rp {{deal.deal.current_price | formatMoney}}</div>
      </template>
    </div>
  </a>
  <a v-else href="#" @click.prevent="download">
    <div class="item-block">
      <div class="item-img">
        <img src="http://kasbon.cash/ads/flashgo/static/images/todownload.png">
      </div>
      <div class="item-title">Unduh FlashGo untuk melihat lebih banyak</div>
      <div class="item-price">Hasilkan uang</div>
      <div class="item-price">Hingga Rp100.000</div>
    </div>
  </a>
</template>
<script>
  import Config from '@/libs/config';

  export default {
    name: 'FeedItem',
    props: {
      deal: null,
      popNewPage: true,
      tokopedia: false
    },
    methods: {
      goToDetail(dealId) {
        let self = this
        if (self.popNewPage) {
          BacaAndroid.openOwnWeb('', Config.webUrl + 'detail/' + dealId)
        } else {
          this.$router.push({path: '/detail/' + dealId})
        }
      },
      download() {
        // window.location.href = Config.downloadUrl
        BacaAndroid.openThirdPartWeb(Config.downloadUrl)
      },
      downloadTokopedia() {
        // window.location.href = Config.downloadUrl
        BacaAndroid.openThirdPartWeb(Config.tokopediaDownloadUrl)
      }
    }
  }
</script>
<style scoped>
  .item-block {
    /*height: 10rem;*/
    display: block;
    position: relative;
    background: white;
    padding-bottom: .2rem;
  }

  .item-img {
    width: 100%;
    z-index: 0;
    height: 0;
    padding-bottom: 100%;
    overflow-y: hidden;
  }

  .item-img img {
    width: 100%;
    /*height: 100%;*/
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
    width: 3rem;
    height: 1.2rem;
    position: absolute;
    z-index: 1;
    right: 0;
    top: 0;
  }

  .item-discount-text {
    width: 2.4rem;
    height: 1.2rem;
    position: absolute;
    z-index: 2;
    right: 0;
    top: 0;
    color: white;
    padding-top: .1rem;
    font-size: .6rem;
    font-weight: bold;
    text-align: center;
  }

  .item-title {
    color: rgba(51, 51, 51, 1);
    font-size: .65rem;
    height: 2rem;
    font-weight: bold;
    padding-left: .4rem;
    padding-right: .4rem;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .item-price {
    color: rgba(242, 52, 78, 1);
    font-size: .65rem;
    font-weight: bold;
    padding-left: .4rem;
  }

  .item-single-price {
    color: rgba(242, 52, 78, 1);
    font-size: .8rem;
    height: 1.85rem;
    font-weight: bold;
    padding-left: .4rem;
  }

  .item-original-price {
    color: rgba(0, 0, 0, .3);
    font-size: .6rem;
    text-decoration: line-through;
    padding-left: .4rem;
  }
</style>
