<template>
  <div class="content">
    <header class="searchbar row">
      <a class="col-15">
        <img src="http://kasbon.cash/ads/flashgo/static/images/back_button.png" class="nav-bar-button"
             @click.prevent="back">
      </a>
      <div class="search-input col-85">
        <input type="search" id='search' v-model="searchQuery" v-on:keydown="keydown"/>
        <div @click.prevent="search(null)">
          <img src="http://kasbon.cash/ads/flashgo/static/images/search_button.png" class="search-icon">
        </div>
      </div>
    </header>
    <div class="row">
      <div class="col">
        <img src="http://kasbon.cash/ads/flashgo/static/images/popular.png" class="pull-left block-icon">
        <span class="pull-left block-title">Populer</span>
      </div>
    </div>
    <div class="row">
      <div v-for="query in hotQueries" @click.prevent="search(query)">
        <div class="pull-left hot-query">{{query}}</div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <img class="pull-left icon-img nav-bar-button" src="../../static/image/mipmap-xhdpi/history.png" alt="">
        <span class="pull-left block-title">History</span>
        <img src="../../static/image/mipmap-xhdpi/delete.png" class="pull-right nav-bar-button icon-img"
             @click.prevent="removeAll()" alt="">
      </div>
    </div>
    <div class="row">
      <div v-for="query in historyWord" @click.prevent="search(query)">
        <div class="pull-left hot-query">{{query}}</div>
      </div>

    </div>
  </div>
</template>

<script>
  import Common from '~/libs/common'
  import { commonGet, commonPost } from '~/ajax/api'

  export default {
    name: 'Search',
    data() {
      return {
        searchQuery: null,
        showDownloadBanner: true,
        ongoing: false,
        historyWord: [],
        searchWord: []
      }
    },
    validate({ params }) {
      return params
    },
    async asyncData({ params }) {
      const hotQueries = await commonGet('sales/search/get_hot_query/')
      return {
        hotQueries: hotQueries
      }
    },
    mounted() {
      this.historyWord = localStorage.getItem('searchWord')
      if (this.historyWord == null) {
        return this.historyWord = []
      }
      this.historyWord = this.historyWord.split(',') //将字符串转成数组
    },

    methods: {
      keydown(event) {
        let self = this
        if (event.keyCode === 13) {
          self.search(null)
        }
      },
      back() {
        Common.goBack()
      },
      removeAll() {
        localStorage.clear()
        this.historyWord = []
      },
      search(query) {
        let self = this
        if (query != null) {
          self.searchQuery = query
        }
        if (self.searchQuery != null) {
          let searchWords = localStorage.getItem('searchWord') || ''
          let searchWordList = searchWords == '' ? [] : searchWords.split(',')
          if (searchWords.indexOf(self.searchQuery) == -1) {
            searchWordList.unshift(self.searchQuery)
          }
          self.historyWord = searchWordList
          if (self.historyWord.length > 5) {
            self.historyWord.pop()
          }
          let words = self.historyWord.join(',')
          localStorage.setItem('searchWord', words)
          Common.goToOwnPage('/searchresult/' + self.searchQuery)
        }
      }
    }
  }
</script>

<style scoped>
  .nav-bar-button {
    margin-top: .3rem;
    height: 1rem;
    width: 1rem;
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

  .hot-query {
    background: rgba(238, 238, 238, 1);
    border-radius: .2rem;
    padding: .2rem .4rem;
    margin-bottom: .3rem;
    margin-right: .3rem;
    font-size: .65rem;
    font-weight: bold;
    color: rgba(136, 136, 136, 1);
  }

  .icon-img {
    width: .8rem;
    height: .8rem;
    margin-top: 3px;
    margin-right: 3px;
    margin-left: 0;
  }
</style>
