<template>
  <div class="content">
    <header class="searchbar">
      <div class="row">
        <a class="col-15">
          <img src="http://kasbon.cash/ads/flashgo/static/images/back_button.png" class="nav-bar-button">
        </a>
        <div class="col-85 channel-page-title">
          <span>Flash Sale</span>
        </div>
      </div>
      <div class="row buttons-tab">
        <a href="#tab1" class="tab-link active button">ongoing</a>
        <a href="#tab2" class="tab-link button">coming soon</a>
      </div>
    </header>
    <div class="content-block">
      <div class="tabs">
        <div id="tab1" class="tab active">
          <div class="content-block">
            <div class="row">
              <div class="col-50 left-block">
                <a href="#">
                  <div class="item-block">
                    <div class="item-img-block">
                      <img src="http://kasbon.cash/ads/aggregator/images/men1.png" class="item-img">
                      <img src="http://kasbon.cash/ads/aggregator/images/partner/list/laz.png" class="item-source-icon">
                      <img src="http://kasbon.cash/ads/flashgo/static/images/discount.png" class="item-discount-icon">
                      <span class="item-discount-text">30%</span>
                      <div class="countdown-block-ongoing">
                        <span class="countdown-field-ongoing">10</span>
                        <span class="countdown-sep-ongoing">:</span>
                        <span class="countdown-field-ongoing">00</span>
                        <span class="countdown-sep-ongoing">:</span>
                        <span class="countdown-field-ongoing">00</span>
                      </div>
                    </div>
                    <div class="item-title">testtesttse</div>
                    <div class="item-price"> Rp 100.000.000</div>
                    <div class="item-original-price"> Rp 70.000.000</div>
                    <div class="sales-border">
                      <div class="sales-ratio-red" style="width: 30%"></div>
                    </div>
                  </div>
                </a>
              </div>
              <div class="col-50 right-block">
                <a href="#">
                  <div class="item-block">
                    <div class="item-img-block">
                      <img src="http://kasbon.cash/ads/aggregator/images/men1.png" class="item-img">
                      <img src="http://kasbon.cash/ads/aggregator/images/partner/list/laz.png" class="item-source-icon">
                      <img src="http://kasbon.cash/ads/flashgo/static/images/discount.png" class="item-discount-icon">
                      <span class="item-discount-text">30%</span>
                      <div class="countdown-block-ongoing">
                        <span class="countdown-field-ongoing">10</span>
                        <span class="countdown-sep-ongoing">:</span>
                        <span class="countdown-field-ongoing">00</span>
                        <span class="countdown-sep-ongoing">:</span>
                        <span class="countdown-field-ongoing">00</span>
                      </div>
                    </div>
                    <div class="item-title">testtesttse</div>
                    <div class="item-price"> Rp 100.000.000</div>
                    <div class="item-original-price"> Rp 70.000.000</div>
                    <div class="sales-border">
                      <div class="sales-ratio-red" style="width: 30%"></div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div id="tab2" class="tab">
          <div class="content-block">
            <div class="row">
              <div class="col-50 left-block">
                <a href="#">
                  <div class="item-block">
                    <div class="item-img-block">
                      <img src="http://kasbon.cash/ads/aggregator/images/men1.png" class="item-img">
                      <img src="http://kasbon.cash/ads/aggregator/images/partner/list/laz.png" class="item-source-icon">
                      <img src="http://kasbon.cash/ads/flashgo/static/images/discount.png" class="item-discount-icon">
                      <span class="item-discount-text">30%</span>
                      <div class="countdown-block-ongoing">
                        <span class="countdown-field-ongoing">10</span>
                        <span class="countdown-sep-ongoing">:</span>
                        <span class="countdown-field-ongoing">00</span>
                        <span class="countdown-sep-ongoing">:</span>
                        <span class="countdown-field-ongoing">00</span>
                      </div>
                    </div>
                    <div class="item-title">testtesttse</div>
                    <div class="item-price"> Rp 100.000.000</div>
                    <div class="item-original-price"> Rp 70.000.000</div>
                    <div class="remind-button"><a><img src="http://kasbon.cash/ads/flashgo/static/images/remind.png"><span>Remind Me</span></a></div>
                  </div>
                </a>
              </div>
              <div class="col-50 right-block">
                <a href="#">
                  <div class="item-block">
                    <div class="item-img-block">
                      <img src="http://kasbon.cash/ads/aggregator/images/men1.png" class="item-img">
                      <img src="http://kasbon.cash/ads/aggregator/images/partner/list/laz.png" class="item-source-icon">
                      <img src="http://kasbon.cash/ads/flashgo/static/images/discount.png" class="item-discount-icon">
                      <span class="item-discount-text">30%</span>
                      <div class="countdown-block-ongoing">
                        <span class="countdown-field-ongoing">10</span>
                        <span class="countdown-sep-ongoing">:</span>
                        <span class="countdown-field-ongoing">00</span>
                        <span class="countdown-sep-ongoing">:</span>
                        <span class="countdown-field-ongoing">00</span>
                      </div>
                    </div>
                    <div class="item-title">testtesttse</div>
                    <div class="item-price"> Rp 100.000.000</div>
                    <div class="item-original-price"> Rp 70.000.000</div>
                    <div class="cancel-button"><a><span>Cancel Reminder</span></a></div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'FlashSale',
    data() {
      return {}
    }
  }
</script>
<style scoped>
  .nav-bar-button {
    margin-top: .3rem;
    margin-left: .5rem;
    height: 1rem;
    width: 1rem;
  }

  .searchbar {
    height: 4.6rem;
    background: white;
    margin-bottom: .5rem;
    padding-bottom: 0;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  }

  .item-block {
    /*height: 10rem;*/
    display: block;
    background: white;
    padding-bottom: .4rem;
  }

  .item-img-block {
    position: relative;
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
    font-weight: bold;
    padding-left: .5rem;
  }

  .item-price {
    color: rgba(242, 52, 78, 1);
    font-size: .65rem;
    font-weight: bold;
    padding-left: .5rem;
  }

  .item-original-price {
    color: rgba(0, 0, 0, .3);
    font-size: .65rem;
    text-decoration: line-through;
    padding-left: .5rem;
  }

  .left-block {
    padding-right: .3rem;
  }

  .right-block {
    padding-left: .3rem;
  }

  .channel-page-title {
    text-align: center;
    font-size: .8rem;
    font-weight: bold;
    color: rgba(51, 51, 51, 1);
    padding-top: .2rem;
    padding-right: 2rem;
  }

  .buttons-tab {
    margin-bottom: 0;
  }

  .buttons-tab .button {
    color: rgba(102, 102, 102, 1);
    font-size: .7rem;
    font-weight: bold;
    height: 2rem;
    line-height: 2rem;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    border-bottom: 2px white solid;
    width: 50%;
  }

  .buttons-tab .active {
    border-color: rgba(242, 52, 78, 1);
    color: rgba(242, 52, 78, 1);
  }

  .buttons-tab:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    right: auto;
    top: auto;
    height: 0px;
    width: 100%;
    background-color: #d0d0d0;
    display: block;
    z-index: 15;
    -webkit-transform-origin: 50% 100%;
    transform-origin: 50% 100%;
  }

  .content-block {
    margin: 0;
    padding: 0;
  }

  .sales-border {
    margin: 0 auto;
    /*margin-left: .4rem;*/
    height: .4rem;
    border-radius: .15rem;
    width: 80%;
    border: 1px rgba(0, 0, 0, .2) solid;
    background: white;
    /*margin-bottom: .5rem;*/
  }

  .sales-ratio-red {
    background: linear-gradient(to right, rgba(232, 98, 98, 1), rgba(242, 52, 78, 1));
    height: 100%;
    border-radius: .15rem;
  }

  .sales-ratio-green {
    background: linear-gradient(to right, rgba(70, 233, 139, 1), rgba(49, 194, 110, 1));
    height: 100%;
    border-radius: .15rem;
  }

  .countdown-block-ongoing {
    position: absolute;
    right: 0;
    bottom: .2rem;
  }

  .countdown-field-ongoing {
    border-radius: .2rem;
    font-weight: bold;
    font-size: .5rem;
    color: white;
    background: rgba(242, 52, 78, 1);
    padding-left: .1rem;
    padding-right: .1rem;
    margin-top: .1rem;
  }

  .countdown-sep-ongoing {
    font-size: .5rem;
    color: rgba(242, 52, 78, 1);
  }

  .remind-button {
    margin: 0 auto;
    width: 90%;
    height: 1.4rem;
    border-radius: 1rem;
    background: linear-gradient(to right, rgba(232, 98, 98, 1), rgba(242, 52, 78, 1));
    text-align: center;
  }

  .remind-button img {
    width: .6rem;
    margin-right: .1rem;
  }

  .remind-button a {
    font-size: .65rem;
    font-weight: bold;
    color: rgba(255, 255, 255, 1);
  }

  .cancel-button {
    margin: 0 auto;
    width: 90%;
    height: 1.4rem;
    border-radius: 1rem;
    background: rgba(187, 187, 187, 1);
    text-align: center;
  }

  .cancel-button a {
    font-size: .65rem;
    font-weight: bold;
    color: rgba(255, 255, 255, 1);
  }

</style>
