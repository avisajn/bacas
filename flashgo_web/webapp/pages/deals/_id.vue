<template>
  <div v-if="dealDetail != null" class="content">
    <pop-ups :pageData="detailData" :show="showPopup" @closePop="closePop()"></pop-ups>
    <download-banner :show="showDownloadBanner" @closeDownload="closeDownload" :source="source"></download-banner>
    <div class="swiper-out-container">
      <a @click.prevent="back">
        <img class="back-botton" src="http://kasbon.cash/ads/flashgo/static/images/back_detail.png" />
      </a>
      <div v-swiper:mySwiper="swiperOption">
        <div class="swiper-wrapper">
          <div class="swiper-slide" v-for="image in dealDetail.dealarticleimages">
            <img class="swiper-image" style="width: 100%" :src="image.image">
          </div>
        </div>
        <div class="swiper-pagination"></div>
      </div>
      <template v-if="dealDetail.deal.off>0">
        <img class="discount-icon" src="http://kasbon.cash/ads/flashgo/static/images/discount_detail.png" />
        <span class="discount-text">{{dealDetail.deal.off * 100 | formatMoney }}% Off</span>
      </template>
      <img class="source-icon" :src="dealDetail.ecommerce.logo" />
    </div>
    <div class="price-block">
      <div class="row">
        <span v-if="dealDetail.deal.current_price>0" class="pull-left price">Rp {{dealDetail.deal.current_price | formatMoney}}</span>
        <span v-else class="pull-left price">Rp ???</span>
        <div v-if="dealDetail.deal.type==='F'" class="pull-right">
          <countdown style-type="detail" :end-time="dealDetail.flash.endtime"></countdown>
        </div>
      </div>
      <div class="row">
        <span v-if="dealDetail.deal.current_price<dealDetail.deal.original_price && dealDetail.deal.original_price>0 " class="pull-left original-price">Rp {{dealDetail.deal.original_price | formatMoney}}</span>
        <span v-else class="pull-left original-price">Rp ???</span>
        <span v-if="dealDetail.deal.sales>0" class="pull-right sales">Habis: {{dealDetail.deal.sales | formatMoney}}</span>
      </div>
    </div>
    <div class="row detail-title">
      <span>
        {{dealDetail.deal.title}}
      </span>
    </div>
    <div v-if="dealDetail.deal.stars>0 && dealDetail.deal.comments>0" class="row review-block">
      <template v-for="i in 5">
        <img v-if="dealDetail.deal.stars - i >= 1" src="http://kasbon.cash/ads/flashgo/static/images/star_one.png" class="pull-left star-icon">
        <img v-if="dealDetail.deal.stars - i > 0 && dealDetail.deal.stars - i < 1" src="http://kasbon.cash/ads/flashgo/static/images/star_half.png" class="pull-left star-icon">
        <img v-if="dealDetail.deal.stars - i <= 0" src="http://kasbon.cash/ads/flashgo/static/images/star_zero.png" class="pull-left star-icon">
      </template>
      <label class="pull-left comment-count">({{dealDetail.deal.comments}})</label>
    </div>
    <div class="row">
      <div class="col">
        <img src="http://kasbon.cash/ads/flashgo/static/images/recommend.png" class="pull-left block-icon">
        <span class="pull-left block-title">Rekomendasi</span>
      </div>
    </div>
    <div v-if="relativeDeals.length>0" class="row inline-scroll">
      <div style="width: 200rem;">
        <a v-for="relativeDeal in relativeDeals" @click.prevent="goToDetail(relativeDeal.deal.id)">
          <div class="relative-deal-item pull-left">
            <img class="item-img" :src="relativeDeal.dealarticleimages[0].image">
            <div class="relative-item-title">{{relativeDeal.deal.title}}</div>
            <div class="relative-item-price"> Rp {{relativeDeal.deal.current_price | formatMoney}}</div>
          </div>
        </a>
        <a @click.prevent="download">
          <div class="relative-deal-item pull-left">
            <img class="see-more-icon" src="http://kasbon.cash/ads/flashgo/static/images/right_arrow.png">
            <div class="see-more-text">Lihat Semua</div>
          </div>
        </a>
      </div>
    </div>
    <template>
      <a @click.prevent="toTarget(dealDetail.deal.trackinglink)">
        <div class="dock-block">
          <img src="http://kasbon.cash/ads/flashgo/static/images/cart.png">
          <span>Beli</span>
        </div>
      </a>
    </template>
  </div>
</template>
<script>
import Config from '~/libs/config'
import Common from '~/libs/common'
import Countdown from '~/components/Countdown'
import DownloadBanner from '~/components/DownloadBanner'
import PopUps from '~/components/PopUps'
import { commonPost } from '~/ajax/api'

export default {

  components: { DownloadBanner, Countdown, PopUps },
  data() {
    return {
      dealId: 0,
      showDownloadBanner: true,
      showPopup: false,
      ongoing: false,
      swiperOption: {
        pagination: {
          el: '.swiper-pagination'
        }
      },
      detailData: {},
      source: 'web.deals'
    }
  },
  validate({ params }) {
    return /^\d*$/.test(params.id)
  },
  async asyncData({ params }) {
    const dealDetail = await commonPost('sales/deals/get_deal_detail/', {
      user_id: 'test',
      deal_id: parseInt(params.id)
    })
    const relativeDeals = await commonPost('sales/deals/get_relative_recommendation/', {
      user_id: 'test',
      page_id: 1,
      count: 8,
      deal_id: parseInt(params.id)
    })
    return {
      dealId: parseInt(params.id),
      dealDetail: dealDetail,
      relativeDeals: relativeDeals
    }
  },
  head() {
    let self = this
    return {
      title: self.dealDetail.deal.title,
      meta: [{
        'fb:app_id': '367713750463138',
        'og:url': '/webapp/deals/' + self.dealId,
        'og:title': 'Saya menemukan produk yang sangat murah!',
        'og:description': self.dealDetail.deal.title,
        'og:image': self.dealDetail.dealarticleimages[0].image
      }]
    }
  },
  methods: {
    back() {
      Common.goBack()
    },
    goToDetail(dealId) {
      Common.goToOwnPage('/deals/' + dealId)
    },
    closePop() {
      this.showPopup = false
    },
    toTarget(target) {
      this.showPopup = true;
      this.detailData = { target: target }
    },
    closeDownload() {
      this.showDownloadBanner = false
      $('.swiper-out-container').css('margin-top', 0)
    },
    download() {
      Common.downLoadGp(this.source)
    }
  }
}

</script>
<style scoped>
.swiper-pagination {
  position: absolute;
  bottom: 0;
}

.swiper-out-container {
  width: 100%;
  position: relative;
  padding-bottom: 0;
  margin-top: 2.8rem;
}

.swiper-slide {
  text-align: center;
  font-size: .7rem;
  background: #fff;
}

.back-botton {
  position: absolute;
  left: 1rem;
  top: 1rem;
  width: 1.5rem;
  height: 1.5rem;
  z-index: 2;
}

.discount-icon {
  position: absolute;
  left: 0;
  bottom: .1rem;
  z-index: 2;
  width: 3.5rem;
  height: 1.65rem;
}

.discount-text {
  width: 3.2rem;
  height: 1.5rem;
  position: absolute;
  z-index: 2;
  left: 0;
  bottom: .1rem;
  color: white;
  padding-top: .1rem;
  font-size: .7rem;
  font-weight: bold;
  text-align: center;
}

.detail-title {
  font-weight: bold;
  font-size: .7rem;
  color: rgba(51, 51, 51, 1);
  line-height: 1.1;
  padding: .5rem;
}

.source-icon {
  position: absolute;
  right: .2rem;
  bottom: .4rem;
  z-index: 2;
  width: 1.65rem;
  height: 1.65rem;
}

.price-block {
  height: 3.9rem;
  background: linear-gradient(to right, rgba(255, 82, 117, 1), rgba(243, 100, 100, 1));
}

.price {
  color: white;
  font-size: 1.4rem;
  font-weight: bold;
}

.original-price {
  color: white;
  font-size: .7rem;
  text-decoration: line-through;
}

.sales {
  font-size: .7rem;
  color: rgba(255, 216, 0, 1);
  font-weight: bold;
  padding-right: .5rem;
}

.review-block {
  padding-left: .3rem;
}

.star-icon {
  width: .8rem;
  height: .8rem;
  margin-left: .2rem;
  margin-top: .1rem;
}

.comment-count {
  color: rgba(119, 119, 119, 1);
  font-size: .7rem;
  margin-left: .3rem;
}

.relative-deal-item {
  position: relative;
  margin-right: .5rem;
  width: 5.5rem;
  height: 10rem;
  text-align: center;
}

.relative-item-title {
  color: rgba(85, 85, 85, 1);
  font-size: .6rem;
  height: 1.8rem;
  padding-left: .2rem;
  padding-right: .2rem;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: pre-wrap;
  text-align: left;
  overflow: hidden;
}

.relative-item-price {
  font-size: .7rem;
  font-weight: bold;
  color: rgba(51, 51, 51, 1);
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

.inline-scroll {
  width: 100%;
  height: 10rem;
  white-space: nowrap;
  overflow-x: scroll;
  overflow-y: hidden;
  float: left;
  margin-bottom: 2rem;
}

.item-img {
  width: 100%;
  height: 5.5rem;
}

.dock-block {
  background: linear-gradient(to right, #FFC434, #FFA121);
  position: fixed;
  color: white;
  bottom: 0;
  width: 100%;
  height: 2.2rem;
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
}

@media screen and (min-width:1200px) {
  .dock-block {
    width: 50%
  }
}

.dock-block img {
  width: .8rem;
  margin-right: .4rem;
  margin-top: .5rem;
}

.location-block img {
  width: .8rem;
  margin-right: .1rem;
  margin-top: .2rem;
}

.location-block {
  font-size: .75rem;
  font-weight: bold;
  color: rgba(85, 85, 85, 1)
}

.location-block span {
  margin-bottom: .6rem;
}

</style>
