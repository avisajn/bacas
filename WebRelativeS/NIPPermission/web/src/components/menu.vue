<template>
    <Menu :active-key="active" @on-select="onSelect">
        <Menu-item v-if="pages.user" key="/"><Icon type="person"></Icon> 用户管理 </Menu-item>
        <Menu-item v-if="pages.role" key="/role"><Icon type="person-stalker"></Icon> 角色管理</Menu-item>
        <Menu-item v-if="pages.system" key="/sys"><Icon type="ios-gear"></Icon>系统管理</Menu-item>
    </Menu>
</template>
<script>
    import Util from '../libs/util';
    let rights = null;
    export default {
        data (e) {
            return {
                active : this.getHash(),
                pages : {}
            }
        },
        ready () {
            if(!rights){
                let self = this;
                Util.getRights(2 ,function(k){
                    if(!k){rights = 1; }
                    else{rights = k; }
                    self.pages = k;
                })
            }else if(rights!=1){
                this.pages = rights;
            }
        },
        beforeDestroy () {

        },
        methods: {
            onSelect(e){
                if(e != this.getHash()){
                    window.Loading.show();
                }
                window.location.href = '#'+e;
            },
            getHash(){
                let hash = window.location.hash;
                if(hash.indexOf('!/') > 0){hash = hash.substring(2); }
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

