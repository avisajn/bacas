<template>
    <tb-panel>
        <div slot="title"><a href="javascript:window.toLink('/news_push_client_chart');">新客户端推送新闻统计</a></div>
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
                    {title: '<a href="javascript:window.toLink(\'/news_push_client_chart?t=validPushCount\')">总推送数</a>', key: 'validPushCount'},
                    {title: '<a href="javascript:window.toLink(\'/news_push_client_chart?t=validPushSuccess\')">推送到达数</a>', key: 'validPushSuccess'},
                    {title: '<a href="javascript:window.toLink(\'/news_push_client_chart?t=validPushClick\')">推送阅读数</a>', key: 'validPushClick'},
                    {title: '<a href="javascript:window.toLink(\'/news_push_client_chart?t=pushReachRatio\')">推送到达率</a>', key: 'pushReachRatio'},
                    {title: '<a href="javascript:window.toLink(\'/news_push_client_chart?t=pushRealCtr\')">到达点击率</a>', key: 'pushRealCtr'},
                ],
                data: [],
                loading : true
            };
        },
        ready () {
            this.loading = true;
            API.newsPushedNewClient(today).then((k) => {
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
                API.newsPushedNewClient(n).then((k) => {
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

