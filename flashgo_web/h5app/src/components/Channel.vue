<template>
  <div class="content">
    <header class="searchbar row">
      <a href="#" @click.prevent="back" class="col-15">
        <img src="http://kasbon.cash/ads/flashgo/static/images/back_button.png" class="nav-bar-button">
      </a>
      <div class="col-85 channel-page-title">
        <span v-if="channelTitle != null">{{channelTitle}}</span>
      </div>
    </header>
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
  </div>
</template>

<script>
  import Common from '@/libs/common'
  import FeedItem from "./widgets/FeedItem";

  export default {
    name: 'Channel',
    components: {FeedItem},
    data() {
      return {
        channelId: 0,
        channelTitle: null,
        feeds: []
      }
    },
    mounted() {
      let self = this
      self.channelId = self.$route.params.channelId
      self.channelTitle = self.$route.params.channelTitle
      self.initData()
    },
    methods: {
      back() {
        // this.$router.back()
        BacaAndroid.goBack();
      },
      initData() {
        let self = this
        Common.apiRequest('POST', 'sales/deals/get_channel_feeds/', {
          user_id: "test",
          channel_id: parseInt(self.channelId),
          count: 9,
          page_id: 1
        }, function (data) {
          self.feeds = data.data
        }, true, false)
      },
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
</style>
