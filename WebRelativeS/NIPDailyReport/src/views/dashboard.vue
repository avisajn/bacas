<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition">
                <div class="datepicker">
                    <span>统计日期：</span>
                    <Date-picker 
                        type="date" 
                        :options="dateOptions" 
                        @on-change="onDateChange"
                        placeholder="选择日期" 
                        :value.sync="queryDate"
                        style="width: 200px;display: inline-block;"
                    ></Date-picker>
                </div>
            </div>
            <div slot="panel" class="tables-panel" id="tablesPanel">
                <Timeline>
                    <Timeline-item v-show="table_users">
                        <users v-bind:date="queryDate"></users>
                    </Timeline-item>
                    <Timeline-item v-show="table_news"><news v-bind:date="queryDate"></news></Timeline-item>
                    <Timeline-item v-show="table_newswr"><news-without-reltv v-bind:date="queryDate"></news-without-reltv></Timeline-item>
                    <Timeline-item v-show="table_news_crawled"><news-crawled v-bind:date="queryDate"></news-crawled></Timeline-item>
                    <Timeline-item v-show="table_news_pushed"><news-pushed v-bind:date="queryDate"></news-pushed></Timeline-item>
                    <Timeline-item v-show="table_new_client"><news-pushed-client v-bind:date="queryDate"></news-pushed-client></Timeline-item>
                    <Timeline-item v-show="table_new_user"><news-pushed-user v-bind:date="queryDate"></news-pushed-user></Timeline-item>
                    <Timeline-item v-show="table_ck_sp"><special-click v-bind:date="queryDate"></special-click></Timeline-item>
                    <Timeline-item v-show="table_nws_read"><news-read-time v-bind:date="queryDate"></news-read-time></Timeline-item>
                    <Timeline-item v-show="table_ctr_news_type"><news-type-click v-bind:date="queryDate"></news-type-click></Timeline-item>
                    <Timeline-item v-show="table_ctr"><ctr v-bind:date="queryDate"></ctr></Timeline-item>
                    <Timeline-item v-show="table_ctr_user_fetch"><ctr-user-fetch v-bind:date="queryDate"></ctr-user-fetch></Timeline-item>
                    <Timeline-item v-show="table_ctr_hot_news"><ctr-hot-news v-bind:date="queryDate"></ctr-hot-news></Timeline-item>
                    <Timeline-item v-show="table_ctrType">
                        <a href="javascript:;" id="uname" name="uname"></a>
                        <ctr-type v-bind:date="queryDate"></ctr-type>
                    </Timeline-item>
                </Timeline>
            </div>
        </query-layout>
    </layout-main>
</template>
<script>
    import layoutMain from '../components/layout';
    import queryLayout from '../components/querylayout';

    import users from '../components/dashboard/user';
    import news from '../components/dashboard/news';
    import newsWithoutReltv from '../components/dashboard/news_without_reltv';
    import newsCrawled from '../components/dashboard/news_crawled';
    import newsPushed from '../components/dashboard/news_pushed';
    import newsPushedClient from '../components/dashboard/news_push_client';
    import newsPushedUser from '../components/dashboard/news_push_user';
    import specialClick from '../components/dashboard/special_click_position';
    import newsReadTime from '../components/dashboard/news_readtime';
    import newsTypeClick from '../components/dashboard/news_type_ctr';
    import ctr from '../components/dashboard/ctr';
    import ctrUserFetch from '../components/dashboard/ctr_user_fetch';
    import ctrHotNews from '../components/dashboard/ctr_hot_news';
    import ctrType from '../components/dashboard/ctr_type';

    import API from '../libs/api';
    import Store from '../libs/store';

    import Util from '../libs/util';

    const earlyDate = window.earlyDay;
    const overData = window.lastTime;
    export default {
        components : {
            layoutMain,
            queryLayout,

            ctrType, users, news, newsWithoutReltv,
            newsCrawled, newsPushed ,newsPushedClient,
            newsPushedUser ,specialClick ,newsReadTime,
            newsTypeClick ,ctr ,ctrUserFetch ,ctrHotNews
        },
        data (e) {
            return {
                queryDate : window.lastDate,
                dateOptions : {
                    disabledDate (date) {
                        const v = date.valueOf();
                        return date && (v >= overData || v <= earlyDate);
                    }
                },
                display : [ //控制显示和隐藏
                    "users", "nws", "nws_exp_relnews", "nws_get", "nws_read", "psh",
                    "psh_new_app", "psh_newuser_news", "ck_sp", "ctr_news_type", "ctr", 
                    "ctr_newuser", "ctr_hot_news", "ctr_type"
                ],
                reload : false,
            }
        },
        methods : {
            onDateChange(d){
                this.queryDate = d;
            }
        },
        ready(){
            window.Loading.hide();
        },
        computed : {
            table_ctrType(){return Util.dashTypeVisibile(this.display ,'ctr_type'); },
            table_users(){return Util.dashTypeVisibile(this.display ,'users'); },
            table_news(){return Util.dashTypeVisibile(this.display ,'nws'); },
            table_newswr(){return Util.dashTypeVisibile(this.display ,'nws_exp_relnews'); },
            table_news_crawled(){return Util.dashTypeVisibile(this.display ,'nws_get'); },
            table_news_pushed(){return Util.dashTypeVisibile(this.display ,'psh'); },
            table_new_client(){return Util.dashTypeVisibile(this.display ,'psh_new_app'); },
            table_new_user(){return Util.dashTypeVisibile(this.display ,'psh_newuser_news'); },
            table_ck_sp(){return Util.dashTypeVisibile(this.display ,'ck_sp'); },
            table_nws_read(){return Util.dashTypeVisibile(this.display ,'nws_read'); },
            table_ctr_news_type(){return Util.dashTypeVisibile(this.display ,'ctr_news_type'); },
            table_ctr(){return Util.dashTypeVisibile(this.display ,'ctr'); },
            table_ctr_user_fetch(){return Util.dashTypeVisibile(this.display ,'ctr_newuser'); },
            table_ctr_hot_news(){return Util.dashTypeVisibile(this.display ,'ctr_hot_news'); },
        },
    }
</script>
<style scoped lang="less">
    .datepicker{
        text-align: center;
        .displayBox{
            margin:10px; 
            user-select: none;  
            >span{
                border-bottom: 1px solid #f5f1f1;
                margin: 0px 5px;
                display: inline-block;
                cursor:pointer;
                -webkit-transition: all .3s ease-in-out;
                -o-transition: all .3s ease-in-out;
                -moz-transition: all .3s ease-in-out;
                transition: all .3s ease-in-out;
            }
            >span:hover{
                border-bottom: 1px solid #39f;
            }     
        }
    }
    .tables-panel{
        overflow:auto;
        margin-top: 30px;
        margin-left: 50px;
    }
</style>