<template>
    <tb-panel>
        <div slot="title"><a href="javascript:window.toLink('/news_pushed_chart');">推送新闻统计</a></div>
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
                    {title: '<a href="javascript:window.toLink(\'/news_pushed_chart?t=newsToPush\')">推送新闻数</a>', key: 'newsToPush'},
                    {title: '<a href="javascript:window.toLink(\'/news_pushed_chart?t=totalPushCount\')">总推送数</a>', key: 'totalPushCount'},
                    {title: '<a href="javascript:window.toLink(\'/news_pushed_chart?t=totalPushReadCount\')">推送阅读数</a>', key: 'totalPushReadCount'},
                    {title: '<a href="javascript:window.toLink(\'/news_pushed_chart?t=pushReadRatio\')">推送点击率</a>', key: 'pushReadRatio'},
                    {title: '<a href="javascript:window.toLink(\'/news_pushed_chart?t=totalNormalReadCount\')">非推送阅读数</a>', key: 'totalNormalReadCount'},  
                ],
                data: [],
                loading : true
            };
        },
        ready () {
            this.loading = true;
            API.newsPushed(today).then((k) => {
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
                API.newsPushed(n).then((k) => {
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

