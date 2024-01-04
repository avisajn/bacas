<template>
  <div class="video-detail">
    <div class="alertbox" v-show="close_x">
      <div class="content_img">
        <div @click="close()"><img class="close" src="../../static/images/close_alert.png" alt=""></div>
        <img class="box" :src="require('../../static/images/bg.png')" alt="">
        <p>Banyak promo dan bonus harian, semua hanya di Flash Go!</p>
        <div class="alertbtn" @click="openGoogle()">Coba sekarang</div>
      </div>
    </div>
    <div class="video-top">
      <div class="mp">
        <!-- <video :src='this.dealDetail.url' controls="controls"></video> -->
        <iframe width="100%" height="100%" :src='this.url' frameborder="0" allow="autoplay; encrypted-media"
                allowfullscreen></iframe>
      </div>
      <div class="dis_title">{{this.title}}</div>

    </div>
    <div class="product-video" v-show="productLenth">
      <p class="mentioned-title">Product mentioned in the video</p>
      <div class="product-list">
        <div class="dealslist">
          <ul>
            <a href="#">
              <li v-for="(item,index) of deals" :key="item.id" class="shopitem" @click="godetail(deals[index].deal.id)">
                <div class="recommand-img">
                  <img :src="item.dealarticleimages[0].image"/>
                </div>
                <div class="recommand-descript">
                  <div class="recommand-name">
                    <span>{{item.deal.title}}</span>
                  </div>
                  <div class="price">Rp <span class="price_num">{{item.flash.current_price }}</span></div>
                </div>
                <div class="btn">
                  <span>Cek</span>
                </div>
              </li>
            </a>
          </ul>
        </div>
      </div>
    </div>
    <div class=" product-video releted-video">
      <p class="mentioned-title">Related videos</p>
      <div class="video-list">
        <ul>
          <li v-for="item of videos" :key="item.id" @click="alert_box()">
            <div class="left">
              <img :src="item.image" alt="">
            </div>
            <div class="right">
              {{item.title}}
            </div>
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script>
  import Common from '@/libs/common'
  import Config from '@/libs/config'

  export default {
    name: 'Search',
    data() {
      return {
        dealDetail: [],
        videos: [],
        deals: [],
        productLenth: true,
        videoId: '',
        close_x: false,
        url: '',
        title: '',
      }
    },
    created() {

    },
    mounted() {
      let self = this
      self.videoId = self.$route.params.videoId
      self.initData()
    },
    methods: {
      initData() {
        let self = this
        Common.apiRequest('POST', 'sales/video/webapp_detail/test/' + this.videoId, {
          // Common.apiRequest('POST', 'sales/video/webapp_detail/test/30479058/', {
          "user_id": "xxx",
          "video_id": this.videoId
        }, function (data) {
          self.dealDetail = data.data;
          self.url = data.data.detail.url;
          self.title = data.data.detail.title;
          self.videos = data.data.videos;
          self.deals = data.data.deals;
          if (self.deals.length == 0) {
            self.productLenth = false;
          }
        }, true, false)
      },
      godetail(dealid) {
        this.$router.push({path: '/detail/' + dealid})
      },
      close() {
        this.close_x = false;
      },
      alert_box() {
        this.close_x = true;
      },
      openGoogle() {
        BacaAndroid.openThirdPartWeb(Config.downloadUrl)

      }
    }
  }

</script>
<style scoped lang="less">
  a {
    color: #3A3A3A;
  }

  .video-detail {
    position: relative;
    overflow: auto;

    .alertbox {
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);

      position: fixed;
      top: 0px;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100;
      padding: 0px 20px;
      // width: 75%;
      margin: 0 auto;

      .content_img {
        margin-top: 50px;
        position: absolute;
        width: 90%;

        img.box {
          width: 100%;
        }

        img.close {
          position: absolute;
          right: 20px;
          width: 22px;
        }

        p {
          width: 83%;
          padding: 13px;
          color: #fff;
          display: inline-block;
          position: absolute;
          top: 46%;
          font-weight: bold;
          left: 0;
          right: 0;
          font-size: .8rem;
          text-align: center;
          background: linear-gradient(to bottom, #FF677B, #FF99A7);
          border-radius: 20px;
          margin: 0 auto;

        }

        .alertbtn {
          color: #fff;
          width: 10rem;
          border-radius: 20px;
          height: 45px;
          text-align: center;
          line-height: 45px;
          font-size: .8rem;
          background: linear-gradient(to bottom, #FF677B, #FF99A7);
          margin: 30px auto;
        }
      }
    }

    .video-top {
      width: 100%;
      height: 14rem;
      font-size: .85rem;
      line-height: 15px;
      // background-color: yellow;
      border-bottom: .5rem solid #F1F2F5;

      .mp {
        width: 100%;
        height: 10rem;
        text-align: center;

        video {
          width: 100%;
          height: 100%;
        }
      }

      .dis_title {
        font-size: .75rem;
        height: 4rem;
        font-weight: bold;
        margin-top: .5rem;
        line-height: 1.2rem;
        padding: 0px .5rem;
        // line-height: .7rem;
        // line-height: 4rem;
        // width: 100%;
        // word-wrap:break-word;
        // overflow: hidden;
      }

    }

    .product-video {
      color: #333333;
      // font-size: 15px;
      padding: 0px 10px;
      border-bottom: .5rem solid #F1F2F5;

      .mentioned-title {
        font-size: .85rem;
        font-weight: bold;
      }

      .product-list {
        .dealslist {
          ul {
            width: 100%;
            padding: 0px;

            li {
              list-style: none;
              display: flex;
              padding: 0px .5rem 0px 0px;
              margin-bottom: 10px;

              .btn {
                color: #fff;
                background-color: #F2354E;
                width: 3.1rem;
                height: 1.4rem;
                text-align: center;
                line-height: 1.4rem;
                margin-left: .5rem;
                margin-top: .8rem;
                border-radius: 5px;
                font-size: .7rem;
                // flex: 3;
              }

              .recommand-img {
                flex: 1.5;
                margin-right: .3rem;

                img {
                  width: 100%;
                  // height: 100%;
                }
              }

              .recommand-descript {
                font-size: .61rem;
                flex: 6;
                font-weight: bold;

                .price {
                  font-size: .5rem;
                  color: #F2354E;
                  font-weight: bold;
                  // margin-top: .2rem;
                  span {
                    font-size: .65rem;
                  }

                  .recommand-name {
                    flex: 5;
                    color: red;
                    font-size: 100px;

                    span {
                      font-size: 10px !important;

                    }
                  }

                }
              }

            }
          }
        }
      }
    }

    .releted-video {

      ul {
        width: 100%;
        padding: 0px;

        li {
          width: 100%;
          list-style: none;
          display: flex;
          margin-bottom: .5rem;

          .left {
            flex: 5;
            padding: 0px .5rem 0px 0px;

            img {
              width: 100%;
              height: 100%;
            }
          }

          .right {
            flex: 5;
            font-size: .61rem;
            font-weight: bold;
            color: #3A3A3A;
          }
        }
      }
    }
  }

</style>
