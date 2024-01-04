<template>
  <div v-if="coupon != null" class="content">
    <div v-if="coupon.sku_type ==3 || coupon.sku_type ==6">
      <div class="swiper-out-container">
        <div v-swiper:mySwiper="swiperOption">
          <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="image in coupon.images">
              <img class="swiper-image" style="width: 100%" :src="image">
            </div>
          </div>
          <div class="swiper-pagination"></div>
        </div>
      </div>
      <div class="goods-title">
        <p class="goods-name">{{coupon.title}}</p>
        <p class="goods-price">Rp {{formatPriceNum(coupon.price)}}<span class="sku">Stok {{coupon.left_stock}}</span></p>
      </div>
      <div class="slide-row"></div>
    </div>
    <div v-if="coupon.sku_type ==4 || coupon.sku_type ==7">
      <div class="coupon">
        <div class="coupon-top">
          <div class="coupon-circle coupon-circle-left "></div>
          <div class=" coupon-circle coupon-circle-right"></div>
          <div class="text">
            <div class="text-left"><span class="count">{{formatPriceNum(coupon.value)}}</span></div>
            <div class="text-right" ref="right">
              <span class="item-text coupon-item-text" ref="title">{{coupon.title}}</span>
              <span class="item-text freight coupon-item-bottom" ref="desc">{{coupon.description}}</span>
            </div>
          </div>
        </div>
        <span class="bottom-icon-left">Stok {{coupon.left_stock}}</span>
        <span class="bottom-icon-right">Rp {{formatPriceNum(coupon.price)}}</span>
        <div class="clear"></div>
      </div>
      <div class="slide-row"></div>
    </div>
    <div v-if="coupon.sku_type ==5 || coupon.sku_type ==8">
      <div class="coupon">
        <div class="coupon-top" style="background: #4B9EFF">
          <div class="coupon-circle coupon-circle-left"></div>
          <div class="coupon-circle coupon-circle-right"></div>
          <div class="text">
            <div class="text-right freight-right">
              <span class="item-text coupon-item-text">{{coupon.title}}</span>
              <span class="item-text freight coupon-item-bottom">{{coupon.description}}</span>
            </div>
          </div>
        </div>
        <span class="bottom-icon-left">Stok {{coupon.left_stock}}</span>
        <span class="bottom-icon-right">Rp {{formatPriceNum(coupon.price)}}</span>
        <div class="clear"></div>
      </div>
      <div class="slide-row"></div>
    </div>
    <div class="rules">
      <p class="rules-title">Aturan penukaran</p>
      <div class="rules-item">{{coupon.rule}}</div>
    </div>
    <div class="slide-row" v-if="coupon.sku_type ==3 || coupon.sku_type ==6"></div>
    <div class="rules desc" v-if="coupon.sku_type ==3 || coupon.sku_type ==6">
      <p class="rules-title">Informasi produk</p>
      <div class="rules-item">{{coupon.deal_description}}</div>
    </div>
  </div>
</template>
<script>
import { commonGet } from '~/ajax/api'
export default {
  data() {
    return {
      swiperOption: {
        pagination: {
          el: '.swiper-pagination'
        }
      },
    }
  },
  async asyncData({ params }) {
    const coupon = await commonGet('sales/exchange/sku/' + params.id, "")
    return {
      coupon: coupon,
    }
  },
  async mounted() {
    if (this.coupon.sku_type == 4 || this.coupon.sku_type == 7) {
      if (this.$refs.title.clientHeight > 28 && this.$refs.desc.clientHeight > 25) {
        this.$refs.right.style.marginTop = '0.35rem'
      }
    }
  },
  methods: {
    formatPriceNum(num) {
      var num = (num || 0).toString();
      var result = '';
      while (num.length > 3) {
        result = '.' + num.slice(-3) + result;
        num = num.slice(0, num.length - 3);
      }
      if (num) { result = num + result; }
      return result;
    }
  }
}

</script>
<style scoped="scoped">
.content {
  background: #fff;
  font-family: Roboto-Medium, Roboto;
  overflow: scroll;
}

.swiper-pagination {
  position: absolute;
  bottom: 0;
}

.swiper-out-container {
  width: 100%;
  position: relative;
  padding-bottom: 0;
}

.swiper-slide {
  text-align: center;
  font-size: .7rem;
  background: #fff;
}

/deep/ .swiper-pagination-bullet {
  width: .25rem !important;
  height: .25rem !important;
  background-color: #000 !important;
  opacity: 0.5 !important;
}

/deep/ .swiper-pagination-bullet-active {
  background-color: #F2354E !important;
}

.coupon {
  margin: 0 auto;
  margin-top: 11px;
  height: 5.8rem;
  width: 93%;
  background: #fff;
  margin-bottom: 11px;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
}

.coupon-top {
  position: relative;
  width: 100%;
  height: 69%;
  margin: 0 auto;
  background-color: #FFB02F;
  border-radius: 5px;
}

.text {
  height: 100%;
  display: flex;
  position: relative;
}

.text-left {
  margin: 0 1.1rem;
  display: flex;
  font-weight: bold;
  text-align: center;
  flex-direction: column;
  justify-content: space-around;
}

.text-right {
  flex: 6;
  font-size: 12px;
  line-height: 1rem;
  margin: .7rem 0rem .15rem 0rem;
  padding-right: .7rem;
}

.bottom-icon-right {
  font-weight: bold;
  font-size: .65rem;
  float: right;
  margin-top: .35rem;
  margin-right: 18px;
}

.bottom-icon-left {
  float: left;
  color: #999999;
  font-size: .55rem;
  margin-top: .5rem;
  margin-left: 1rem;
}

.item-text {
  margin: 0;
  display: block;
  font-size: .65rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  /*! autoprefixer: off */
}

.count,
.item-text {
  color: #fff;
}

.count {
  font-size: .9rem;
}

.coupon-circle {
  position: absolute;
  width: .95rem;
  height: .95rem;
  border-radius: 20px;
  background-color: #fff;
  top: 36.68%;
}

.coupon-circle-left {
  left: -10px;
}

.coupon-circle-right {
  right: -10px;
}

.slide-row {
  width: 100%;
  height: 9px;
  background: rgba(241, 241, 241, 1);
}

.goods-title {
  padding: 0rem .55rem .55rem .55rem;
}

.goods-name {
  margin-top: .55rem !important;
  font-size: .75rem;
  font-weight: bold;
  color: rgba(51, 51, 51, 1);
}

.goods-price {
  font-size: .9rem;
  font-weight: bold;
  color: #F2354E;
  margin-top: .52rem !important;
}

.sku {
  float: right;
  color: rgba(153, 153, 153, 1);
  font-weight: normal;
  font-size: .65rem;
  margin-top: .25rem;
}

.freight {
  font-size: .65rem;
  color: rgba(255, 255, 255, 0.8);
}

.freight-right {
  padding-left: 7%;
  left: 0;
}

.coupon-item-text {
  font-size: .7rem;
  line-height: .8rem;
  margin-top: .1rem;
  font-weight: 500;
}

.coupon-item-bottom {
  margin-top: .15rem;
  line-height: .75rem;
}

.rules {
  padding: .55rem;
  font-size: .7rem;
  font-weight: 400;
}

.rules-title {
  margin-top: 0 !important;
}

.rules-item {
  white-space: pre-wrap;
  font-weight: 400;
  margin-top: 9px;
  line-height: 1rem;
  color: rgba(102, 102, 102, 1);
}

</style>
