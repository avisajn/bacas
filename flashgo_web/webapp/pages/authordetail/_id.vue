<template>
  <div class="newsdetail">
    <pop-ups :showDownLoad="showDownLoad" @closeToDwon="closeToDwon()" :source='source'></pop-ups>
    <div class="header">
      <p>
        <img class="back" src="../../static/image/mipmap-xhdpi/author-back.png" alt="" @click="back()">
      </p>
    </div>
    <div class="author">
      <div class="author-item">
        <img :src="news.avatar_url" alt="" class="avatar">
      </div>
      <div class="author-item">
        <span class="name">{{news.name}}</span>
        <p class="author-count">
          <span class="count-name">Pengikut</span><span class="count">{{news.follower_count}}</span>
          <span class="count-name like-count">Suka</span><span class="count">{{news.like_count}}</span>
        </p>
      </div>
      <div class="author-item">
        <span class="watch" @click="openDown()"><span class="add-icon">+</span> Ikuti</span>
      </div>
    </div>
    <div class="author-opacity ">
      <div class="author-item">
        <img :src="news.avatar_url" alt="" class="avatar">
      </div>
      <div class="author-item">
        <span class="name">{{news.name}}</span>
        <p class="author-count">
          <span class="count-name">Pengikut</span><span class="count">{{news.follower_count}}</span>
          <span class="count-name like-count">Suka</span><span class="count">{{news.like_count}}</span>
        </p>
      </div>
      <div class="author-item">
        <span class="watch"><span class="add-icon">+</span> Ikuti</span>
      </div>
    </div>
    <div class="feed" v-show="authorNews != null && authorNews.length>0">
      <div class="waterfull">
        <feed-item-news :deal="authorNews"></feed-item-news>
      </div>
    </div>
  </div>
  </div>
</template>
<script>
import PopUps from '~/components/PopUps'
import Common from '~/libs/common'
import FeedItemNews from '~/components/FeedItem'
import { commonGet } from '~/ajax/api'
export default {
  components: { PopUps, FeedItemNews },
  name: 'Author',
  data() {
    return {
      showDownLoad: false,
      newsDetail: '',
      news: '',
      source: '',
    }
  },
  async asyncData({ params, req }) {
    var source = ''
    if (req) {
      source = req.headers['x-app-package-id']
    } else {
      source = 'Browser'
    }
    const news = await commonGet('sales/author/detail?author_id=' + params.id)
    const authorNews = await commonGet('sales/author/feeds?author_id=' + params.id + '&page_id=&count=60')
    return {
      news: news,
      authorNews: authorNews,
      source: source,
    }
  },
  methods: {
    godetailDeals(target) {
      Common.goToOutsidePage(target)
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
    goGp() {
      Common.downLoadGp(this.source)
    },
  },
}

</script>
<style scoped="scoped" lang="less">
.back {
  width: .9rem;
}

.author,
.author-opacity {
  top: 0rem;
  width: 100%;
  z-index: 98;
  background-color: #fff;
  margin-top: 2.5rem;
  overflow: hidden;
  display: flex;
  padding: .2rem .4rem 1rem;
}

.author {
  position: fixed;
}

.author-opacity {
  opacity: 0;
}

.name {
  font-weight: bold;
  font-size: .9rem;
}

.avatar {
  border-radius: 50%;
  width: 2.8rem;
  height: 2.8rem;
}

.add-icon {
  font-weight: bold;
  font-size: 16px;
}

.watch {
  width: 3rem;
  height: 1.2rem;
  line-height: 1.2rem;
  position: absolute;
  bottom: .4rem;
  color: #fff;
  display: inline-block;
  background: rgba(242, 53, 78, 1);
  border-radius: .8rem;
  font-weight: normal;
  font-size: .7rem;
  margin-top: .1rem 0rem 12rem;
  text-align: center;
}

.author-item:nth-child(1) {
  width: 20%;
  text-align: center;
}

.author-item:nth-child(2) {
  width: 55%;
  margin-left: .3rem;
}

.author-item:nth-child(3) {
  width: 21%;
  position: relative;
  left: 10px;
}

.count-name {
  color: #999999;
  font-size: .6rem;
}

.like-count {
  margin-left: .5rem;
}

.count {
  color: #333333;
  font-weight: bold;
  margin-left: .25rem;
  font-size: .65rem;
}

.author-count {
  margin-top: .4rem !important;
}

</style>
