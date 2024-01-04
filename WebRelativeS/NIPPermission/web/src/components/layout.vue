<template>
    <div class="g-hd">
        <nav-head v-on:menuclick="onMenuClick"></nav-head>
    </div>
    <div class="g-sd" :class="{ hideMenu: !showMenu }">
        <cmp-Menu v-if="showMenu"></cmp-Menu>
    </div>
    <div class="g-mn" :class="{ mnShowAll: !showMenu }">
        <slot name="main"> </slot>
    </div>
</template>
<script>
    import navHead from './header';
    import cmpMenu from './menu';
    import Store from '../libs/store';
    export default {
        data (e) {
            let showMenu = false;
            if(window.sysPermisstion){
                showMenu = true;
            }
            return {
                navMenuDisplay : true,
                showMenu : showMenu
            }
        },
        ready () {
            if(!window.logined){
                console.log('layout.window.logined:',window.logined)
                window.location.href = '#!/login';
            }
        },
        components : {
            navHead,
            cmpMenu
        },
        beforeDestroy () {
        },
        methods: {
            onMenuClick(){
                this.navMenuDisplay = !this.navMenuDisplay;
                Store.set('menu-display' ,this.navMenuDisplay);
            }
        }
    }
</script>
<style scoped lang="less">
    .g-hd,.g-mn,.mn,.g-sd{
        position:absolute;
        left:0;
    }
    .g-hd{
        width:100%;
        height:50px;
        top:0;
    }
    .menu{
        background:#fff;
        height:60px;
        position:relative;
    }
    .menu-condition{
        height: 60px;
        width: 100%;
        position: absolute;
        bottom: 0px;
        padding: 13px;
        text-align: right;
    }
    .g-mn,.g-sd{
        background: rgb(249, 249, 249);
        top:50px;
        overflow:auto;
        right:0;
        bottom:0px;
        -webkit-transition: all .3s ease-in-out;
        -o-transition: all .3s ease-in-out;
        -moz-transition: all .3s ease-in-out;
        transition: all .3s ease-in-out;
    }
    .g-mn{
        left:240px;
    }
    .g-sd{
        width:240px;
        background: white;
        border-right: 1px solid #e4e4e4;
    }
    .head-menu{
        margin-top: 80px;
    }
    .hideMenu{
        width: 0px;
    }
    .mnShowAll{
        left:0px;
    }
</style>

