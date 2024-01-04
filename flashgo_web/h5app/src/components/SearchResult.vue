<template>
  <div class="content">
    <header class="searchbar row">
      <a class="col-15" href="#" @click.prevent="back">
        <img src="http://kasbon.cash/ads/flashgo/static/images/back_button.png" class="nav-bar-button">
      </a>
      <div class="search-input col-85">
        <input type="search" id='search' v-model="query"/>
        <a href="#" @click.prevent="search"><img src="http://kasbon.cash/ads/flashgo/static/images/search_button.png"
                                                 class="search-icon"></a>
      </div>
    </header>
    <div v-if="loading" class="loading">
      <img src="http://kasbon.cash/ads/flashgo/static/images/loading.gif">
      <div>Memuat...</div>
    </div>
    <div class="row">
      <div class="col-50 left-block">
        <feed-item></feed-item>
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
      </div>
    </template>
    <div v-else class="no-result" style="">
      <img src="http://kasbon.cash/ads/flashgo/static/images/noresult.png">
      <div>Tidak ada hasil, coba kata kunci lainnya.</div>
    </div>
  </div>
</template>

<script>
  import Common from '@/libs/common'
  import FeedItem from "./widgets/FeedItem";

  export default {
    name: 'SearchResult',
    components: {FeedItem},
    data() {
      return {
        query: null,
        feeds: [],
        loading: true
      }
    },
    mounted() {
      let self = this
      self.query = self.$route.params.query
      self.search()
    },
    created() {
      let self = this
      document.onkeydown = function (e) {
        var key = window.event.keyCode
        if (key == 13) {
          self.search()
        }
      }
    },
    methods: {
      back() {
        this.$router.back();
      },
      search() {
        let self = this
        self.loading = true
        Common.apiRequest('POST', 'sales/search/get_search_result/', {
          user_id: "test",
          page_id: 3,
          count: 10,
          keywords: self.query
        }, function (data) {
          self.feeds = data.data
          self.loading = false
        }, true, false)
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

  .left-block {
    padding-right: .3rem;
  }

  .right-block {
    padding-left: .3rem;
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
</style>
