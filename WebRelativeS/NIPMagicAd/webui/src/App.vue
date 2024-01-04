<template>
  <div id="app">
    <div class="g-hd">
        <mu-appbar title="NIP Ad" fullWidth>
          <mu-icon-button icon="menu" slot="left" @click="toggle()"/>
        </mu-appbar>
    </div>
    <div class="g-mn" :class="{ mnShowAll: !navMenuDisplay }">
        <slot name="main"> </slot>
        <mu-drawer class="menu-drawer" :open="open" :docked="docked" @close="toggle()">
          <mu-list @itemClick="toggle()">
            <mu-list-item href="#/offer" title="OFFER" />
            <mu-list-item href="#/" title="INDEX"/>
          </mu-list>
        </mu-drawer>
        <router-view></router-view>
    </div>
  </div>
</template>

<script>
import index from './components/index'
import { mapGetters ,mapActions } from 'vuex'
export default {
  name: 'app',
  data(){
    return {
      open: false,
      docked: true
    }
  },
  components: {
    index
  },
  computed: {
    ...mapGetters({
      changeindexstate: 'changeindexstate'
    }),
    
  },
  methods: {
    ...mapActions({
      getchangeindexstate: 'changeindexstate'
    }),

    toggle (flag) {
      this.open = !this.open;
      this.docked = !flag;
    },

  }
}
</script>

<style lang="less">
  .menu-drawer{
    margin-top: 64px;
  }
  .g-hd,.g-mn{
      position:absolute;
      left:0;
  }
  .g-hd{
      width:100%;
      height:64px;
      top:0;
  }
  .g-mn,.g-sd{
      background: rgb(249, 249, 249);
      top:64px;
      overflow:auto;
      right:0;
      bottom:0px;
      -webkit-transition: all .3s ease-in-out;
      -o-transition: all .3s ease-in-out;
      -moz-transition: all .3s ease-in-out;
      transition: all .3s ease-in-out;
  }
  .mnShowAll{
      left:0px;
  }
  html,body,#app{
    height : 100%;
    background: #f9f9f9!important;
  }
  .loading-panel{
      position: fixed;
      width: 65px;
      height: 65px;
      text-align: center;
      left: 50%;
      margin-left: -33px;
      top: 50%;
      margin-top: -33px;
      z-index: 20171212;
      .mu-circular-progress{
        z-index:3;
      }
  }
  .loading-panel::after{
        content: "";
      position: fixed;
      top: 0px;
      bottom: 0px;
      left: 0px;
      right: 0px;
      background: rgba(255, 255, 255, 0.55);
      z-index: 2;
  }
</style>
