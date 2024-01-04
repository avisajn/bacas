<template>
    <tb-panel>
        <div slot="title"><a href="javascript:window.toLink('/news_crawled_chart');">新闻抓取统计</a></div>
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
                    {title: '<a href="javascript:window.toLink(\'/news_crawled_chart?t=FunnyPictures\')">FunnyPictures</a>', key: 'FunnyPictures'},
                    {title: '<a href="javascript:window.toLink(\'/news_crawled_chart?t=Gallery\')">Gallery</a>', key: 'Gallery'},
                    {title: '<a href="javascript:window.toLink(\'/news_crawled_chart?t=Joke\')">Joke</a>', key: 'Joke'},
                    {title: '<a href="javascript:window.toLink(\'/news_crawled_chart?t=News\')">News</a>', key: 'News'},
                    {title: '<a href="javascript:window.toLink(\'/news_crawled_chart?t=Video\')">Video</a>', key: 'Video'},
                ],
                data: [],
                loading : true
            };
        },
        ready () {
            this.loading = true;
            API.newsCrawled(today).then((k) => {
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
                API.newsCrawled(n).then((k) => {
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

