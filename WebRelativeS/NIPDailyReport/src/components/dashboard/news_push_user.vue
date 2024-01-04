<template>
    <tb-panel>
        <div slot="title"><a href="javascript:window.toLink('/news_push_client_chart');">新用户推送新闻统计</a></div>
        <div slot="table">
            <i-table v-if="!loading" :columns="columns" class="dash-table" size="small" :data="data"></i-table>
            <Spin fix v-if="loading"></Spin>
        </div>
    </tb-panel>
</template>
<script>
    import tbPanel from './table_panel';
    import API from '../../libs/api';
    let today = window.lastDate;
    export default {
        props : ["date"],
        data (e) {
            return {
                columns: [
                    {title: '<a href="javascript:window.toLink(\'/news_push_user_chart?t=freshPushCount\')">总推送数</a>', key: 'freshPushCount'},
                    {title: '<a href="javascript:window.toLink(\'/news_push_user_chart?t=freshPushSuccessCount\')">推送到达数</a>', key: 'freshPushSuccessCount'},
                    {title: '<a href="javascript:window.toLink(\'/news_push_user_chart?t=freshPushRead\')">推送阅读数</a>', key: 'freshPushRead'},
                    {title: '<a href="javascript:window.toLink(\'/news_push_user_chart?t=pushReachRatio\')">推送到达率</a>', key: 'pushReachRatio'},
                    {title: '<a href="javascript:window.toLink(\'/news_push_user_chart?t=pushRealCtr\')">到达点击数</a>', key: 'pushRealCtr'},
                ],
                data: [],
                loading : true
            };
        },
        ready () {
            this.loading = true;
            API.newsPushedNewUser(today).then((k) => {
                this.data = k;
                this.loading = false;
            },(e) => {
                this.data = [];
                this.loading = false;
            });
        },
        watch : {
            date(n){
                this.loading = true;
                API.newsPushedNewUser(n).then((k) => {
                    this.data = k;
                    this.loading = false;
                },(e) => {
                    this.data = [];
                    this.loading = false;
                });
            }
        },
        components : {
            tbPanel
        }
    }
</script>
<style scoped lang="less">
    
</style>

