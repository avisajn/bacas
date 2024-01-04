<template>
  <div v-if="deal != null">
    <pop-ups :showDownLoad="showDownLoad" @closeToDwon="closeToDwon()"></pop-ups>
    <div class="waterfall-wrapper">
      <ul class="left-waterfall" ref="left">
        <li class="item" v-for="(item, index) in deal" v-if='index%2==0'>
          <img class="icon-video" v-show="item.article.type==3" src="../static/image/mipmap-xhdpi/icon-video.png" alt="" @click.prevent="goDetailPage(item.article.id,state)">
          <div class="item-content">
            <img :src="item.article.thumb_image.url" class="item-pic" @click.prevent="goDetailPage(item.article.id,state)">
            <div class="title-name" style="-webkit-box-orient: vertical;" @click.prevent="goDetailPage(item.article.id,state)">{{item.article.title}}</div>
            <p class="author">
              <img :src="item.article.author.avatar_url" alt="" class="author-pic">
              <span class="author-name">{{item.article.author.name}}</span>
              <span class="author-like" @click.prevent="openToDown">
                <img src="../static/image/mipmap-xhdpi/icon-collection-def@2x.png" alt="" class="icon-like">
                <span v-if="likeCount">{{item.article.like_count}}</span>
                <span v-else>{{item.article.author.like_count}}</span>
              </span>
            </p>
          </div>
        </li>
      </ul>
      <ul class="right-waterfall" ref="right">
        <li class="item" v-for="(item, index) in deal" v-if='index%2==1'>
          <template v-if='index%2==1&index!=9&index!=49'>
            <img class="icon-video" v-show="item.article.type==3" src="../static/image/mipmap-xhdpi/icon-video.png" alt="" @click.prevent="goDetailPage(item.article.id,state)">
            <div class="item-content">
              <img :src="item.article.thumb_image.url" class="item-pic" @click.prevent="goDetailPage(item.article.id,state)">
              <div class="title-name" @click.prevent="goDetailPage(item.article.id,state)">{{item.article.title}}</div>
              <p class="author">
                <img :src="item.article.author.avatar_url" alt="" class="author-pic">
                <span class="author-name">{{item.article.author.name}}</span>
                <span class="author-like" @click.prevent="openToDown">
                  <img src="../static/image/mipmap-xhdpi/icon-collection-def@2x.png" alt="" class="icon-like">
                  <span v-if="likeCount">{{item.article.like_count}}</span>
                  <span v-else>{{item.article.author.like_count}}</span>
                </span>
              </p>
            </div>
          </template>
          <template v-else-if='index%2==1&index==9||index==49'>
            <img src="../static/image/mipmap-xhdpi/newdown.png" alt="" @click.prevent="goGp()">
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import Common from '@/libs/common'
import PopUps from '~/components/PopUps'

export default {
  components: { PopUps },

  name: 'FeedItem',
  props: {
    deal: null,
    state: true,
    source: '',
    likeCount:'',
    popNewPage: true,
  },
  data() {
    return {
      leftItems: [],
      rightItems: [],
      showDownLoad: false,
    }
  },
  methods: {
    goDetailPage(id, state) {
      if (state) {
        Common.goToOwnPage('/newsdetail/' + id + '&' + this.source)
      } else {
        this.showDownLoad = true
        return
      }
    },
    closeToDwon() {
      this.showDownLoad = false
    },
    openToDown() {
      this.showDownLoad = true
    },
    goGp() {
      Common.downLoadGp(this.source)
    }
  }
}

</script>
<style scoped>
.waterfall-wrapper {
  overflow: hidden;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
  text-align: center;
  line-height: 1.5rem;
  flex: 2.5;
  display: inline-block;
  font-family: Roboto-Regular;
  font-weight: 400;
  color: rgba(153, 153, 153, 1);
  font-size: .5rem;
  margin-left: .2rem;
}

.author-name {
  display: inline-block;
  flex: 3;
  color: rgba(153, 153, 153, 1);
  font-size: .5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>
