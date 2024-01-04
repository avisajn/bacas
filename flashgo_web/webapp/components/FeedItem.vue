<template>
  <div class="container-water-fall">
    <pop-ups :showDownLoad="showDownLoad" @closeToDwon="closeToDwon()"></pop-ups>
    <no-ssr>
      <waterfall :col="col" :data="deal">
        <template>
          <div class="cell-item" v-for="(item,idx) in deal" :key="idx">
            <template v-if='idx==9||idx==49'>
              <img src="../static/image/mipmap-xhdpi/newdown.png" alt="" @click.prevent="goGp()">
            </template>
            <template v-if='idx!=9 && idx!=49'>
              <div class="item-content">
                <img class="icon-video" v-show="item.type==3" src="../static/image/mipmap-xhdpi/icon-video.png" alt="" @click.prevent="goDetailPage(item.id)">
                <img :src="item.thumb_image.url" class="item-pic" @click.prevent="goDetailPage(item.id,state)">
                <div class="title-name" style="-webkit-box-orient: vertical;" @click.prevent="goDetailPage(item.id,state)">{{item.title}}</div>
                <p class="author">
                  <img :src="item.author.avatar_url" alt="" class="author-pic">
                  <span class="author-name">{{item.author.name}}</span>
                  <span class="author-like" @click.prevent="openToDown">
                    <img src="../static/image/mipmap-xhdpi/icon-collection-def@2x.png" alt="" class="icon-like">
                    <span>{{item.like_count}}</span>
                  </span>
                </p>
              </div>
            </template>
          </div>
        </template>
      </waterfall>
    </no-ssr>
  </div>
</template>
<script>
import Common from '@/libs/common'
import { commonGet } from '~/ajax/api'
import PopUps from '~/components/PopUps'


export default {
  components: { PopUps },
  props: {
    deal: null,
  },
  data() {
    return {
      data: [],
      col: 2,
      loading: false,
      showDownLoad: false
    };
  },
  computed: {
    itemWidth() {
      if (process.browser) {
        return (138 * 0.5 * (document.documentElement.clientWidth / 375))
      }
    },
    gutterWidth() {
      if (process.browser) {
        return (9 * 0.5 * (document.documentElement.clientWidth / 375))
      }
    }
  },
  methods: {
    mix() {
      this.$waterfall.mix()
    },
    switchCol(col) {
      this.col = col
    },
    openToDown() {
      this.showDownLoad = true
    },
    closeToDwon() {
      this.showDownLoad = false
    },
    goDetailPage(id) {
      Common.goToOwnPage('/newsdetail/' + id)
    }
  }
}

</script>
<style lang="less" scoped>
.waterfall-wrapper {
  overflow: hidden;
}

.icon-video {
  width: 1.2rem;
  position: absolute;
  right: .3rem;
  top: .3rem;
  z-index: 10;
}

.item-content {
  width: 100%;
  position: relative;
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

.icon-video {
  width: 1.2rem;
  position: absolute;
  right: .3rem;
  top: .3rem;
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

.vue-waterfall {
  padding-left: .3rem;
  background: #F4F4F4;
  padding-top: .6rem;
}

.cell-item {
  margin-right: .3rem;
  margin-bottom: .3rem;
  background: #fff;
  border-radius: 5px;
}

.item-pic {
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;

}

</style>
