<template>
    <tb-panel>
        <div slot="title"><a href="/#!/"></a>新闻阅读时间</div>
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
                    {title: '小于5秒', key: 'lessThan5sec'},
                    {title: '5-20秒', key: 'moreThan5secLessThan20sec'},
                    {title: '20-60秒', key: 'moreThan20secLessThan60sec'},
                    {title: '大于60秒', key: 'moreThan60sec'},
                    {title: '阅读总数', key: 'totalReadTime'},
                    {title: '平均阅读时间', key: 'avgReadTime'},
                ],
                data: [],
                loading : true
            };
        },
        ready () {
            this.loading = true;
            API.newsReadDuration(today).then((k) => {
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
                API.newsReadDuration(n).then((k) => {
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

