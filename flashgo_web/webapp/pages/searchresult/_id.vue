<template>
  <div class="searchresult">
    <pop-ups :showDownLoad="showDownLoad" @closeToDwon="closeToDwon()"></pop-ups>
    <header class="searchbar row">
      <div class="col-15" @click.prevent="back">
        <img src="http://kasbon.cash/ads/flashgo/static/images/back_button.png" class="nav-bar-button" alt="" />
      </div>
      <div class="search-input col-85">
        <input type="search" id='search' v-model="searchQuery" v-on:keydown="keyDown" />
        <div @click.prevent="search(null)"><img src="http://kasbon.cash/ads/flashgo/static/images/search_button.png" class="search-icon" alt="" /></div>
      </div>
    </header>
    <div class="waterfall-wrapper">
      <ul class="left-waterfall" ref="left">
        <li class="item" v-for="(item, index) in feeds" v-if='index%2==0'>
          <img class="icon-video" v-show="item.news.type==3" src="../../static/image/mipmap-xhdpi/icon-video.png" alt="" @click.prevent="goDetailPage(item.news.news_id)">
          <div class="item-content">
            <img :src="item.news_thumb_image" class="item-pic" @click.prevent="goDetailPage(item.news.news_id)">
            <div class="title-name" @click.prevent="goDetailPage(item.news.news_id)">{{item.news.title}}</div>
            <p class="author">
              <img src="" alt="" class="author-pic">
              <span class="author-name"></span>
              <span class="author-like" @click.prevent="openToDown()">
                <img src="../../static/image/mipmap-xhdpi/icon-collection-def@2x.png" alt="" class="icon-like">{{item.news.likes_count}}
              </span>
            </p>
          </div>
          <template v-if='index+2==feeds.length&feeds.length<=49'>
            <img src="../../static/image/mipmap-xhdpi/newdown.png" alt="" @click.prevent="goGp()">
          </template>
        </li>
      </ul>
      <ul class="right-waterfall" ref="right">
        <li class="item" v-for="(item, index) in feeds" v-if='index%2==1'>
          <template v-if='index%2==1&index!=9&index!=49'>
            <img class="icon-video" v-show="item.news.type==3" src="../../static/image/mipmap-xhdpi/icon-video.png" alt="" @click.prevent="goDetailPage(item.news.news_id)">
            <div class="item-content">
              <img :src="item.news_thumb_image" class="item-pic" @click.prevent="goDetailPage(item.news.news_id)">
              <div class="title-name" @click.prevent="goDetailPage(item.news.news_id)">{{item.news.title}}</div>
              <p class="author">
                <img src="" alt="" class="author-pic">
                <span class="author-name"></span>
                <span class="author-like" @click.prevent="openToDown()">
                  <img src="../../static/image/mipmap-xhdpi/icon-collection-def@2x.png" alt="" class="icon-like">{{item.news.likes_count}}
                </span>
              </p>
            </div>
          </template>
          <template v-else-if='index%2==1&feeds.length>=50&index==9||index==49'>
            <img src="../../static/image/mipmap-xhdpi/newdown.png" alt="" @click.prevent="goGp()">
          </template>
          <template v-if='index+2==feeds.length&feeds.length<=49'>
            <img src="../../static/image/mipmap-xhdpi/newdown.png" alt="" @click.prevent="goGp()">
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import Common from '~/libs/common'
import FeedItem from '~/components/FeedItem'
import { commonGet } from '~/ajax/api'
import PopUps from '~/components/PopUps'

export default {
  components: { FeedItem, PopUps },
  data() {
    return {
      query: null,
      feeds: [],
      paramsPre: '',
      loading: false,
      searchQuery: null,
      showDownLoad: false,
      source: ''
    }
  },
  async asyncData({ req, params }) {
    const source = req.headers['x-app-package-id']
    const feeds = await commonGet('sales/search/search_by_conditions?keyword=' + params.id + '&search_type=review&sort_mode&min_price&max_price&filter_ids&impression_id&page_id=&count=55', {})
    const hotQueries = await commonGet('sales/search/get_hot_query/')
    return {
      feeds: feeds.slice(0, 50),
      hotQueries: hotQueries,
      source: source
    }
  },
  async mounted() {
    if (process.browser) {
      var queryStr = window.location.pathname
      var index = queryStr.lastIndexOf("\/");
      queryStr = queryStr.substring(index + 1, queryStr.length);
      this.searchQuery = decodeURI(queryStr)
    }
  },
  methods: {
    back() {
      Common.goBack()
    },
    keyDown() {
      let self = this
      if (event.keyCode === 13) {
        self.search(null)
      }
    },
    search(query) {
      let self = this
      if (query != null) {
        self.searchQuery = query
      }
      if (self.searchQuery != null) {
        Common.goToOwnPage('/searchresult/' + self.searchQuery)
      }
    },
    goGp() {
      Common.downLoadGp(this.source)
    },
    goDetailPage(id) {
      Common.goToOwnPage('/newsdetail/' + id)
    },
    closeToDwon() {
      this.showDownLoad = false
    },
    openToDown() {
      this.showDownLoad = true
    }
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

.searchresult {
  background-color: red;
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

.search-input {
  position: relative;
}

.search-icon {
  height: 0.8rem;
  width: 0.8rem;
  position: absolute;
  right: .5rem;
  top: .4rem;
}

.search-input input {
  padding-right: 1.5rem;
}

.row {
  margin-bottom: 0px;
}

.no-result {
  text-align: center;
  margin-top: 120px;
  font-size: .75rem;
  font-weight: bold;
  color: rgba(153, 153, 153, 1);
}

.no-result img {
  width: 50%;
}

.loading {
  text-align: center;
  margin-top: 120px;
  font-size: .75rem;
  font-weight: bold;
  color: rgba(153, 153, 153, 1);
}

.loading img {
  width: 3rem;
}

.row {
  padding-left: 0rem !important;
}

ul {
  width: 50%;
  overflow: hidden;
  padding: 0 .15rem 0 .15rem;
  margin: 0;
  background: rgba(244, 244, 244, 1);
}

ul.left-waterfall {
  float: left;
  padding-left: .3rem !important;


}

ul.right-waterfall {
  float: right;
  padding-right: .3rem !important;

}

li.item {
  border-radius: 5px;
  overflow: hidden;
  width: 100%;
  margin-bottom: .3rem;
  font-size: .65rem;
  background: #fff;
  position: relative;
}

.icon-video {
  /* // position: backgro; */
  width: 1.2rem;
  position: absolute;
  right: .3rem;
  top: .3rem;
}

.item-content {
  width: 100%;

}

.icon-like {
  width: .7rem;
  top: .2rem;
  position: relative;
  margin: 0 .2rem;


}

.title-name {
  width: 100% !important;
  font-size: .6rem;
  height: 1.8rem;
  margin: 0;
  padding: 0 .3rem;
  font-family: Roboto-Regular;
  color: rgba(51, 51, 51, 1);
  line-height: .9rem;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-word-wrap: break-word;
  -webkit-line-clamp: 2;
}

.author-pic {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  margin-right: .2rem;
  margin-top: .25rem;

}

img {
  width: 100%;
}

.author {
  display: flex;
  height: 1.5rem;
  line-height: 1.5rem;
  margin-top: .2rem !important;
  padding: 0 .2rem 0 .3rem;
}

.author-like {
  line-height: 1.5rem;
  flex: 2.5;
  display: inline-block;
  font-family: Roboto-Regular;
  font-weight: 400;
  color: rgba(153, 153, 153, 1);
  font-size: .5rem;
  margin-left: .2rem;
  text-align: center;
}


.author-name {
  display: inline-block;
  flex: 3;
  color: rgba(153, 153, 153, 1);
  font-size: .5rem;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  display: -webkit-box;

}

</style>
