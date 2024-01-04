<template>
  <div class="content">
    <header class="searchbar row">
      <a class="col-15">
        <img src="http://kasbon.cash/ads/flashgo/static/images/back_button.png" class="nav-bar-button"
             @click.prevent="back">
      </a>
      <div class="search-input col-85">
        <input type="search" id='search' v-model="searchQuery"/>
        <a href="#" @click.prevent="search(null)"><img
          src="http://kasbon.cash/ads/flashgo/static/images/search_button.png" class="search-icon"></a>
      </div>
    </header>
    <div class="row">
      <div class="col">
        <img src="http://kasbon.cash/ads/flashgo/static/images/popular.png" class="pull-left block-icon">
        <span class="pull-left block-title">Populer</span>
      </div>
    </div>
    <div class="row">
      <a v-for="query in hotQueries" href="#" @click.prevent="search(query)">
        <div class="pull-left hot-query">{{query}}</div>
      </a>
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
        hotQueries: [],
        searchQuery: null
      }
    },
    created() {
      let self = this
      document.onkeydown = function (e) {
        var key = window.event.keyCode
        if (key == 13) {
          self.search(null)
        }
      }
    },
    mounted() {
      let self = this
      self.initData()
    },
    methods: {
      initData() {
        let self = this
        Common.apiRequest('POST', 'sales/search/get_hot_query/', null, function (data) {
          self.hotQueries = data.data
        }, true, false)
      },
      search(query) {
        let self = this
        if (query != null) {
          self.searchQuery = query
        }
        if (self.searchQuery != null) {
          // BacaAndroid.openOwnWeb('', Config.webUrl + 'search_result/' + self.searchQuery)
          self.$router.push({path: '/search_result/' + self.searchQuery})
        }
      },
      back() {
        BacaAndroid.goBack()
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
</style>
