<template>
  <div>
    <nuxt />
  </div>
</template>
<style lang="less">
body {
  overflow: auto !important;
  background-color: #fff !important;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.swiper-pagination-bullet {
  background-color: #fff !important;
  opacity: 1 !important;
}

.page,
.page-group,
.content,
.page-current {
  background: rgba(249, 249, 249, 1);
}

.row {
  margin-left: 0 !important;
  padding-left: .5rem;
  padding-right: .5rem;
  margin-bottom: .5rem;
}

.row-banner {
  margin-top: 1rem;
  background-color: #fff
}

.row-bottom {
  width: 100%;
  height: .5rem;
  background-color: #F1F2F5;
  display: inline-block;

}

.row .col-50 {
  width: 50%;
  margin-left: 0;
}

.row .col-85 {
  width: 85%;
  margin-left: 0;
}

.row .col-15 {
  width: 15%;
  margin-left: 0 !important;
}

.swiper-pagination-bullet-active {
  background: rgba(255, 82, 117, 1) !important;
}

.block-icon {
  width: .8rem;
  height: .8rem;
  /*margin-left: .8rem;*/
  margin-right: .3rem;
  margin-top: .1rem;
}

.block-title {
  font-size: .8rem;
  font-weight: bold;
  color: #000;
  padding-right: .5rem;
}

ul li {
  list-style: none;
}

.flex {
  display: flex;
  align-items: center;
}

.flex-level {
  display: flex;
  justify-content: center;
}

.felx-vertical {
  display: flex;
  align-items: center;
}

p {
  margin-bottom: 0px !important;
  margin-top: 10px !important;
}

.feeds {
  padding: 0 8px;
}

.right {
  width: 50%;
  flex: 3;
}

.header {
  position: fixed;
  top: 0;
  height: 2.5rem;
  width: 100%;
  z-index: 100;
  text-align: center;
  background-color: #fff;
  line-height: 2.5rem;
  font-size: .8rem;
  font-weight: bold;
}

@media screen and (min-width:1200px) {
  .header {
    width: 50%
  }
}

.titles {
  margin-top: 0 !important;
}

.back {
  position: absolute;
  left: 10px;
  width: 1rem;
  top: 50%;
  margin-top: -.5rem;
}

.inner {
  padding-top: 0px !important;
  padding-left: .2rem !important;
}

.item-insert {
  display: flex;
  background: url(../static/image/mipmap-xxhdpi/item-bg.png) no-repeat;
  background-size: 100% 100%;

  .left {
    flex: 2;

    img {
      width: 100%;
    }
  }

  .right {
    flex: 3;

    div {
      text-align: left;
      padding: 5px;

    }

    .item-title {
      color: rgba(51, 51, 51, 1);
      font-size: .65rem;
      font-weight: bold;
    }
  }

}

</style>
