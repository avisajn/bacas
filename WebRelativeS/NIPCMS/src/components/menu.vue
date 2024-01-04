<template>
    <Menu :active-key="active" @on-select="onSelect">

        <Menu-item v-if="permission.news" key="/">
            <Icon type="home"></Icon> 新闻管理 
        </Menu-item>


        <Menu-item key="/temp">
            <Icon type="home"></Icon> 电影节活动 
        </Menu-item>

    </Menu>
</template>
<script>
    export default {
        data (e) {
            return {
                active : this.getHash(),
                permission : window.permission
            }
        },
        ready () {
            
        },
        beforeDestroy () {

        },
        methods: {
            onSelect(e){
                if(window._interval) window.clearInterval(window._interval);
                const hash = this.getHash();
                if(hash.indexOf(e) == -1){
                    window.Loading.show();
                }
                window.location.href = '#'+e;
            },
            getHash(){
                let hash = window.location.hash;
                if(hash.indexOf('!/') > 0){
                    hash = hash.substring(2); 
                }
                else{hash = '/'; }
                return hash;
            }
        }
    }
</script>
<style scoped lang="less">
    .menu{
        display: inline-block;
    }
</style>

