<template>
    <layout-main>
        <div slot="main" :class="{ 'frame-panel': true ,'full-screen':full } ">
            <div class="preframe">
                <iframe name="previewIframe" :src="url" id="preivewIframe"></iframe>
                <span class="close" @click="setFull()">
                    <Icon v-if="full" type="android-contract"></Icon>
                    <Icon v-else type="android-expand"></Icon>
                </span>
            </div>
        </div>
    </layout-main>
</template>
<script>
    import layoutMain from '../components/layout';
    import queryLayout from '../components/querylayout';
    import Util from '../libs/util';
    let loaded = false;
    let $iframe = null;
    export default {
        data(){
            return {
                url : '',
                full : false
            }
        },

        ready(){
            window.Loading.hide();
            $iframe = document.getElementById('preivewIframe');
            this.url = 'null';
            this.url = Util.getQuery('page');
            this.full = true;
            if(!loaded){
                let self = this;
                loaded = true;
                window.onpopstate = function(event) {
                    const query = Util.getQuery('page');
                    self.full = true;
                    setTimeout(() => {
                        $iframe.src = query;
                    },200);
                };
            }
        },

        methods : {
            setFull(){
                this.full = !this.full;
            }
        },


        components : {
            layoutMain
        }
    }
</script>
<style scoped lang="less">
    .frame-panel{
        height:100%;
        -webkit-transition: all .2s ease-in-out;
        transition: all .2s ease-in-out;
        .preframe{
            height: 100%;
            position:relative;
            >iframe{
                border: 0px;
                width: 100%;
                height: 100%;
            }
            .close{
                position: absolute;
                right: 10px;
                width: 40px;
                height: 40px;
                display: inline-block;
                top: 10px;
                background: #1E9FFF;
                font-size: 27px;
                text-align: center;
                color: white;
                cursor: pointer;
            }
        }
    }
    
    .full-screen{
        position:fixed;
        z-index: 9999999;
        left: 0px;
        top: 0px;
        bottom: 0px;
        right: 0px;
        background: white;
    }
</style>