<template>
    <tb-panel>
        <div slot="title"><a href="javascript:window.toLink('/newschart_chart');">新闻数据统计</a></div>
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
                    {title: '<a href="javascript:window.toLink(\'/newschart_chart?t=crawledNews\')">抓取新闻数</a>', key: 'crawledNews'},
                    {title: '<a href="javascript:window.toLink(\'/newschart_chart?t=relativeRatio\')">含相关新闻的新闻比例</a>', key: 'relativeRatio'},
                    {title: '<a href="javascript:window.toLink(\'/newschart_chart?t=displayedNews\')">展示新闻数</a>', key: 'displayedNews'},
                    {title: '<a href="javascript:window.toLink(\'/newschart_chart?t=readNews\')">点击新闻数</a>', key: 'readNews'},
                    {title: '<a href="javascript:window.toLink(\'/newschart_chart?t=displayCount\')">总展示次数</a>', key: 'displayCount'},
                    {title: '<a href="javascript:window.toLink(\'/newschart_chart?t=readCount\')">总点击次数</a>', key: 'readCount'},
                ],
                data: [],
                loading : true
            };
        },
        ready () {
            this.loading = true;
            API.news(today).then((k) => {
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
                API.news(n).then((k) => {
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

