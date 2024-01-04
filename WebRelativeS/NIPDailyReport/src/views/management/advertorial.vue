<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">Advertorial</span>
            </div>
            <div slot="panel" class="tables-panel">
                <advertorail-form :data="newsData"></advertorail-form>
            </div>
        </query-layout>
    </layout-main>
</template>
<script>
    import layoutMain from '../../components/layout';
    import queryLayout from '../../components/querylayout';
    import advertorailForm from '../../components/management/advertorial_form';

    import Util from '../../libs/util';
    import API from '../../libs/api';

    export default {
        data(){
            return {
                newsData : [],
            }
        },

        ready(){
            window.Loading.hide();
            API.advertorial.getNewsList({}, window.lan).then((k) => {
                this.newsData = k;
            })
        },

        methods : {
            
        },


        components : {layoutMain, queryLayout ,advertorailForm}
    }
</script>
<style scoped lang="less">
    .condition{
        .title{
            display: inline-block;
            font-size: 15px;
            margin-top: 5px;
        }
    }
    .tables-panel{
        
    }
</style>