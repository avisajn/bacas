<template>
  <div class="newsdetail">
    <pop-ups :showDownLoad="showDownLoad" @closeToDwon="closeToDwon()" :source='source'></pop-ups>
    <div class="news-detail">
      <div class="header">
        <p>
          <img class="back" src="../../static/image/mipmap-xhdpi/icon-back.png" alt="" @click="back()">
          <img :src="avatar_url" alt="" class="author-pic" @click="goAuthorDetail(news.author.id)">
          <span class="author-name" @click="goAuthorDetail(news.author.user_id)">{{name}}</span>
          <span class="watch" @click="openDown()">+ Ikuti</span>
        </p>
      </div>
      <div class="news-content pic-content" v-if="news.type == 0">
        <div class="article">
          <div class="newstitle">{{news.title}}</div>
          <div class="outpage" v-show="news.type == 0" v-html="outPage">{{outPage}}</div>
          <div class="tag-item" v-for="item in newsDetail.news_tags"><span>#</span>{{item.name}}</div>
        </div>
      </div>
    </div>
    <div class="video-top" v-if="news.type == 3">
      <div class="mp">
        <iframe width="100%" height="100%" allow='autoplay' v-if="videoUrl.indexOf('www.youtube.com')>-1" :src="videoUrl+'?autoplay=1'" frameborder="0"></iframe>
        <video :src='videoUrl' v-if="videoUrl.indexOf('cdn.flashgo.online')>-1" controls autoplay="autoplay" disablePictureInPicture controlsList='nofullscreen nodownload noremote footbar'></video>
      </div>
      <div class="dis_title" style="-webkit-box-orient: vertical;">{{news.title}}</div>
      <div class="show-more video-title" v-if="showMore == true" v-show='news.title.length>=130' @click="videoShow(false)">Selengkapnya</div>
      <div class="show-more video-title" v-if="showMore == false" v-show='news.title.length>=130' @click="videoShow(true)">Sembunyikan</div>
    </div>
    <div v-if="news.type == 2">
      <div class="pic-detail">
        <div class="swiper-out-container">
          <div v-swiper:mySwiper="swiperOption">
            <div class="swiper-wrapper">
              <div class="swiper-slide" v-for="(image,index) in news.images">
                <img class="swiper-image" :src="image.url">
                <div class="swiper-slide-index" v-show='news.images.length != 1'>
                  <span>{{index+1}}</span> / <span>{{news.images.length}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="swiper-pagination" v-show='news.images.length!=1'></div>
      </div>
      <div class="pic-content">
        <div class="top" style="-webkit-box-orient: vertical;">{{news.title}}</div>
        <div class="show-more" v-if="showMore == true" v-show='news.title.length>=175' @click="show(false)">Selengkapnya</div>
        <div class="show-more" v-if="showMore == false" v-show='news.title.length>=175' @click="show(true)">Sembunyikan</div>
        <div class="tag-item" v-for="item in news.tags" @click="openDown()"><span>#</span>{{item.name}}</div>
      </div>
    </div>
    <div class="download-banner">
      <img src="../../static/image/mipmap-xhdpi/newdownbanner.png" alt="" class="download" @click="goGp()">
    </div>
    <div class="related-deals" v-show="relativeDeals != null && relativeDeals.length > 0">
      <p class="mentioned-title">Produk terkait</p>
      <div class="product-list">
        <div class="dealslist">
          <ul>
            <li v-for="(item,index) of relativeDeals" :key="item.id" class="shopitem">
              <div class="recommand-img" style="position: relative">
                <img class="img" :src="item.dealarticleimage_thumb.image" />
                <img :src="item.ecommerce.logo"  style="position: absolute; width: 21%; height: top:0;left: 0px;"/>

                
              </div>
              <div class="recommand-descript">
                <div class="recommand-name">
                  <span>{{item.deal.title}}</span>
                </div>
                <div class="price">Rp <span class="price_num">{{item.deal.current_price }}</span></div>
                <div class="btn">
                <span @click="godetailDeals(relativeDeals[index].deal.weblink)">Cek</span>
              </div>
              </div>
              
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="seprate"></div>
    <div class="comment-top"> {{total}} komentar</div>
    <div class="search-input">
      <div class="container ">
        <div class="comment ">
          <div class="info">
            <img class="avatar" src="../../static/image/mipmap-xhdpi/avatar.png" />
            <div class="right" @click="openDown()">
              <input v-if="total ==0" type="search" id='search' readonly="readonly" placeholder="Jadilah yang pertama memberikan komentar" />
              <input v-else type="search" id='search' readonly="readonly" placeholder="Berikan komentar" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div v-for="item in comments" class="border-fix">
        <div class="comment ">
          <div class="info">
            <img class="avatar" :src="item.user_info.avatar.url" @click="openDown()" :onerror="errImg()" />
            <div class="right">
              <div class="name">
                <span @click="openDown()">{{item.user_info.name}}</span>
                <span v-show="item.user_info.name ==news.author.name" class="author-self">&nbsp;Akun</span></div>
              <div class="date">
                <span @click="openDown()">{{formatDate(item.created_time)}}</span>
              </div>
            </div>
            <span class="like-count">{{item.like_count}} </span><img class="like-icon" src="../../static/image/mipmap-xhdpi/icon_good_def.png" @click="openDown()">
          </div>
          <div class="content-comment" @click="openDown()">{{item.content}} <span class="reply-btn"> Balas</span></div>
          <div style="padding-left: 2rem">
            <div class="reply-container" v-if="item.sub_comments.comments_list.length>0">
              <div class="comment" v-for="reply in item.sub_comments.comments_list">
                <div class="info">
                  <img class="avatar" :src="reply.user_info.avatar.url" @click="openDown()" :onerror="errImg()" />
                  <div class="right">
                    <div class="name">
                      <span @click="openDown()"> {{reply.user_info.name}}</span>
                    </div>
                    <div class="date">
                      <span @click="openDown()">{{formatDate(reply.created_time)}}</span>
                    </div>
                  </div>
                  <span class="like-count">{{reply.like_count}} </span><img @click="openDown()" class="like-icon" src="../../static/image/mipmap-xhdpi/icon_good_def.png">
                </div>
                <div class="reply">
                  <div class="item">
                    <div class="reply-content" @click="openDown()">
                      <div v-if="item.comment_id != reply.comment_id_be_replied" class="reply-item">
                        <span class="from-name">Membalas</span>
                        <span class="to-name">@{{filterName(item, reply.comment_id_be_replied)}}:</span>
                      </div>
                      <span>{{reply.content}}</span>
                      <span class="reply-btn"> &nbsp;Balas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="reply-bottom" v-if="item.sub_comments.next_page_id!=null" @click="loadSubComment(item.comment_id,item.sub_comments.next_page_id)"> Lihat balasan lainnya </div>
          </div>
        </div>
      </div>
      <div class="comment-bottom" v-if="next_page_id!=null" @click="loadMoreComment(next_page_id)">Lihat komentar lainnya</div>
    </div>
    <div class="seprate"></div>
    <div class="product-video releted-video" v-show="relativeNews != null && relativeNews.length>0">
      <p class="mentioned-title" style="padding: .5rem;">Review terkait</p>
      <div class="waterfull">
        <feed-item-news :deal="relativeNews" :state="false" :source="source" :likeCount="likeCount"></feed-item-news>
      </div>
    </div>
  </div>
  </div>
</template>
<script>
import PopUps from '~/components/PopUps'
import Common from '~/libs/common'
import axios from 'axios'
import FeedItemNews from '~/components/FeedItemNews'
import DownloadBanner from '~/components/DownloadBanner'
import { commonGet, commonGets, commonPost } from '~/ajax/api'
export default {
  components: { PopUps, DownloadBanner, FeedItemNews },
  name: 'Search',
  data() {
    return {
      feeds: '',
      newsPage: false,
      picPage: false,
      showDownLoad: false,
      newsDetail: '',
      news: '',
      outPage: '',
      relativeDeals: '',
      avatar_url: '',
      videoUrl: '',
      name: '',
      shareImg: '',
      relativeNews: [],
      comments: [],
      total: '',
      next_page_id: '',
      sub_comments: [],
      showDownloadBanner: true,
      source: '',
      token: '',
      showMore: true,
      likeCount: true,
      swiperOption: {
        pagination: {
          el: '.swiper-pagination'
        }
      },
    }
  },
  async asyncData({ params, req }) {
    var token = ''
    var source = ''
    if (req) {
      source = req.headers['x-app-package-id']
      token = req.url.split("token=")[1]
    } else {
      source = 'Browser'
    }
    const news = await commonGet('sales/news/web_news_info?news_id=' + params.id)
    if (token == '982c9d07-d0b8-48ec-8197-55c4feea487') {
      const news = await commonGet('sales/news/web_news_info?news_id=' + params.id + '&token=982c9d07-d0b8-48ec-8197-55c4feea487')
    }
    const relativeNews = await commonGet('sales/news/relative_news?news_id=' + params.id + '&page_id=&count=18')
    const comments = await commonGets('sales/comments/news_comments?news_id=' + params.id + '&page_id')
    return {
      news: news,
      relativeNews: relativeNews.slice(0, 10),
      avatar_url: news.author.avatar_url,
      name: news.author.name,
      videoUrl: news.video.url,
      comments: comments.data,
      total: comments.total_comments,
      next_page_id: comments.next_page_id,
      sub_comments: comments.sub_comments,
      source: source,
      token: token,
    }
  },
  async mounted() {
    var self = this
    var url = window.location.href;
    var site = url.lastIndexOf("\/");
    var id = url.substring(site + 1, url.length);
    self.feeds = self.news.author.tiny_articles
    self.outPage = self.news.content_html;
    self.shareImg = self.news.thumb_image.url
    if (self.news.video != null) {
      self.videoUrl = self.news.video.url
    }
    self.relativeDeals = self.news.relative_deals;
    console.log(self.relativeDeals)
  },
  head() {
    let self = this
    return {
      title: self.news.title,
      meta: [{
        'fb:app_id': '367713750463138',
        'og:url': '/webapp/newsdetail/' + self.news.id,
        'og:title': 'Saya menemukan artikel yang bagus!',
        'og:description': self.news.title,
        'og:image': self.news.thumb_image.url
      }]
    }
  },
  methods: {
    godetailDeals(target) {
      Common.goToOutsidePage(target)
    },
    goAuthorDetail(id) {
      Common.goToOwnPage('/authordetail/' + id)
    },
    back() {
      Common.goBack()
    },
    closeToDwon() {
      this.showDownLoad = false
    },
    openDown() {
      this.showDownLoad = true
    },
    alert() {
      this.showDownLoad = true
    },
    alert_box() {
      this.showDownLoad = true
    },
    toVideoDtail(videoId) {
      Common.goToOwnPage('/videodetail/' + videoId)
    },
    closeDownload() {
      this.showDownloadBanner = false
      $('.swiper-out-container').css('margin-top', 0)
    },
    goGp() {
      Common.downLoadGp(this.source)
    },
    show(boolean) {
      if (boolean) {
        document.getElementsByClassName('top')[0].style.display = "-webkit-box"
      } else {
        document.getElementsByClassName('top')[0].style.display = "block";
      }
      this.showMore = boolean;
    },
    videoShow(boolean) {
      if (boolean) {
        document.getElementsByClassName('dis_title')[0].style.display = "-webkit-box"
      } else {
        document.getElementsByClassName('dis_title')[0].style.display = "block";
      }
      this.showMore = boolean;
    },
    async loadMoreComment(page) {
      const id = this.$route.params.id
      const more = await commonGets('sales/comments/news_comments?news_id=' + id + '&page_id=' + page)
      this.comments = this.comments.concat(more.data)
      this.next_page_id = more.next_page_id
    },
    async loadSubComment(id, page) {
      const more = await commonGets('sales/comments/sub_comments/' + id + '?page_id=' + page)
      this.comments.forEach((i, k) => {
        if (i.comment_id == id) {
          more.data.forEach(i => {
            this.comments[k].sub_comments.comments_list.push(i)
            this.comments[k].sub_comments.next_page_id = more.next_page_id
          })
        }
      })
    },
    filterName(data, id) {
      var name = ''
      data.sub_comments.comments_list.forEach(i => {
        if (i.comment_id == id) {
          name = i.user_info.name
        }
      })
      return name
    },
    formatDate(time) {
      const date = new Date(time)
      const nowDate = new Date(Date.parse(new Date()))
      const Y = date.getFullYear() + ' '
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/'
      const D = this.format(date.getDate()) + '/'
      const h = this.format(date.getHours()) + ':'
      const m = this.format(date.getMinutes())
      const nowM = (nowDate.getMonth() + 1 < 10 ? '0' + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1) + '/'
      const nowD = this.format(nowDate.getDate()) + '/'
      if (nowDate.getFullYear() + ' ' == Y && nowM == M && nowD == D) {
        return h + m
      }
      return D + M + Y
    },
    format(time) {
      const formattime = time < 10 ? '0' + time : time
      return formattime
    },
    errImg() {
      return "javascript:this.src ='https://kasbon.cash/ads/flashgo/static/images/avatar.png'"
    }
  }
}

</script>
<style scoped="scoped" lang="less">
.newsdetail {
  width: 100%;
  overflow: hidden;
}

.author-pic {
  position: absolute;
  left: 2rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  margin-right: .2rem;
  margin-top: .1rem;
}

.author-name {
  left: 4rem;
  position: absolute;
  margin-top: -.5rem;
  line-height: 2.6rem;
  font-size: .65rem;
  display: inline-block;
}

.swiper-out-container {
  width: 100%;
  position: relative;
  padding-bottom: 0;
}

.pic-detail {
  position: relative;
}

.swiper-pagination {
  position: absolute;
  bottom: -1.3rem;
  text-align: center;
  width: 100%;
}

.download-banner {
  width: 100%;
  // height: 4rem;
  padding: 0 .5rem;
}

.download {
  width: 100%;
}

.back-botton {
  position: absolute;
  left: 1rem;
  top: 1rem;
  width: 1.5rem;
  height: 1.5rem;
  z-index: 2;
}

.swiper-image {
  width: 100%;
  margin-top: 2.5rem;
}

.back {
  margin-top: -0.5rem;
}

.watch {
  width: 3.5rem;
  height: 1.35rem;
  line-height: 1.35rem;
  display: inline-block;
  background: rgba(242, 53, 78, 1);
  border-radius: .8rem;
  color: #fff;
  font-weight: normal;
  font-size: .65rem;
  position: absolute;
  right: .5rem;
  margin-top: .1rem;
}

.swiper-slide-index {
  font-size: .65rem;
  width: 2rem;
  height: 1rem;
  text-align: center;
  line-height: 1rem;
  background: rgba(0, 0, 0, .39);
  border-radius: .5rem;
  position: fixed;
  z-index: 100;
  left: 50%;
  margin-left: -1rem;
  color: #fff;
  bottom: .7rem;
}

/deep/ .swiper-pagination-bullet {
  background-color: #E8E8E8 !important;
  margin-right: 4px;
  width: 5px;
  height: 5px;
}

/deep/ .swiper-pagination-bullet-active {
  background: #ff5275 !important;
}

.header {
  box-shadow: 0 4px 4px -2px #e0e0e0;
}

.article {
  padding-top: 2.9rem;
  width: 100%;

  img {
    width: 100%;
  }
}

.news-content {
  padding: .5rem;
}

.newstitle {
  margin-top: .2rem;
  font-weight: bold;
  font-size: 0.85rem;
  font-weight: bold;
  line-height: 1.2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.time {
  color: #999999;
  font-size: .6rem;
  margin-bottom: .3rem !important;
  margin-top: .3rem !important;
}

.seprate {
  width: 100%;
  background-color: #F1F2F5;
  height: .5rem;
}

img {
  margin: 0;
  padding: 0;
}

.video-top {
  width: 100%;
  font-size: .85rem;
  line-height: 15px;
  margin-top: 2.8rem;
  margin-bottom: .8rem;

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
    font-weight: bold;
    margin-top: .5rem;
    line-height: 1.2rem;
    padding: 0px .5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
  }

  .video-title {
    padding: 0rem .5rem;
  }
}

.pic-content {
  padding: 0px 10px 5px;

  .top {
    margin-top: 1.2rem;
    text-align: left;
    font-size: .75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .tag-item {
    display: inline-block;
    background: rgba(255, 239, 241, 1);
    border-radius: 12px;
    padding: .2rem .4rem;
    color: #F2354E;
    font-size: .55rem;
    font-weight: bold;
    margin: .3rem .8rem .2rem 0;

    span {
      background-color: #F2354E;
      color: #fff;
      padding: 1px 4px;
      border-radius: 50%;
      margin-right: 3px;
      font-size: .4rem;
    }
  }
}

.show-more {
  color: #5290FF;
  font-size: .65rem;
}

.related-deals {
  color: #333333;
  padding: 0px 10px;
  border-bottom: .5rem solid #F1F2F5;

  .mentioned-title {
    font-size: .85rem;
    font-weight: bold;
    font-family: Helvetica-Bold;
    color: rgba(51, 51, 51, 1);
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
          }

          .recommand-img {
            flex: 3.5;
            margin-right: .3rem;

            .img {
              width: 100%;
              height: 100%;
            }
          }

          .recommand-descript {
            font-size: .7rem;
            flex: 6.5;
            margin-left: 5px;

            .price {
              font-size: .5rem;
              color: #F2354E;

              span {
                font-size: .7rem;
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
  padding: 0;
  margin-top: .5rem;

  .mentioned-title {
    font-size: .85rem;
    font-weight: bold;
  }

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
        color: #3A3A3A;
      }
    }
  }
}

body {
  position: unset !important;
}

.outpage {
  width: 100%;
}

.outpage /deep/ img {
  width: 100% !important;
}

.comment #search {
  background: #F1F1F1;
  border-radius: 15px;
  font-size: .65rem;
}

.search-input input::-webkit-input-placeholder {
  color: #999999;
}

.comment-top {
  height: 2.2rem;
  line-height: 2.2rem;
  font-weight: 500;
  font-size: .7rem;
  color: #333333;
  padding: 0 .5rem;
  border-bottom: 1px solid #EEEEEE;
}

.like-icon {
  width: .8rem;
  margin-left: .1rem;
}

.like-count {
  color: #999999;
  margin: .2rem .15rem 0rem 0rem;
  font-size: .7rem;
}

.search-input {
  img {
    width: 100%;
    border-radius: 50%;
  }

  input {
    left: 15%;
    background: #f1f1f1;
    border: none;
    height: 1.7rem;
    border-radius: .9rem;
  }
}

.border-fix {
  width: 100%;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #EEEEEE;
}

.container {
  box-sizing: border-box;

  .comment {
    width: 100%;
    padding: .8rem .5rem;
    display: flex;
    flex-direction: column;

    .info {
      display: flex;
      align-items: center;

      .avatar {
        border-radius: 50%;
        width: 1.7rem;
      }

      .right {
        display: flex;
        flex-direction: column;
        margin-left: 10px;

        .name {
          font-size: .7rem;
          color: #000;
          font-weight: 500;

          .author-self {
            height: 18px;
            line-height: 18px;
            background: #F2354E;
            color: #fff;
            border-radius: .4rem;
            margin-left: .25rem;
            padding: 2px 3px;
            font-size: .45rem;
            font-weight: bold;

          }
        }

        .date {
          font-size: 12px;
          color: #999999;
        }
      }
    }

    .content-comment {
      font-size: .75rem;
      color: #666666;
      line-height: 20px;
      padding: .2rem 0rem 0rem 2.2rem;
      overflow: hidden;
      overflow-wrap: break-word;

      .reply-btn {
        color: #4A90E2;
        font-size: .7rem;
      }
    }

    .reply-bottom {
      margin: .4rem 0rem 0rem;
      font-weight: 500;
      padding-left: 2rem;
      color: #4A90E2;
      font-size: .7rem;
    }

    .reply {

      .item {
        margin: 0px 0px 0px 10px;
        padding: .2rem 0rem 0rem 1.3rem;

        .reply-content {
          font-size: .75rem;
          color: #000;

          .from-name {
            color: #666666;
            font-weight: bold;
          }

          .to-name {
            color: #666666;
            font-weight: bold;
            margin-left: 5px;
            margin-right: 5px;
          }
        }
      }
    }
  }
}

.reply-container {
  margin-top: .5rem;

  .comment {
    padding: 0;
    margin-bottom: .3rem;

    .info {
      .avatar {
        border-radius: 50%;
        width: 1.3rem;
        margin-top: -5px;
      }
    }
  }

  .reply-btn {
    color: #4A90E2;
    font-size: .7rem;
  }
}

.comment-bottom {
  text-align: center;
  font-size: .8rem;
  font-weight: bold;
  color: #4A90E2;
  padding: .75rem 0rem;
}

.reply-item {
  display: inline-block;
}

</style>
