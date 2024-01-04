<template>
    <tb-panel>
        <div slot="title"><a href="javascript:window.toLink('/userchart');">用户数据统计</a></div>
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
                    {title: '<a href="javascript:window.toLink(\'/userchart?t=activeUser\');">活跃用户</a>', key: 'activeUser'},
                    {title: '<a href="javascript:window.toLink(\'/userchart?t=readNewsUser\')">读新闻用户</a>', key: 'readNewsUser'},
                    {title: '<a href="javascript:window.toLink(\'/userchart?t=freshUser\')">新用户</a>', key: 'freshUser'},
                    {title: '<a href="javascript:window.toLink(\'/userchart?t=loginUser\')">登陆用户</a>', key: 'loginUser'},
                    {title: '<a href="javascript:window.toLink(\'/userchart?t=loginRation\')">登陆用户比例</a>', key: 'loginRation'},
                    {title: '<a href="javascript:window.toLink(\'/userchart?t=commentUser\')">评论用户</a>', key: 'commentUser'},
                    {title: '<a href="javascript:window.toLink(\'/userchart?t=totalComments\')">总评论数</a>', key: 'totalComments'},
                ],
                data: [],
                loading : true
            };
        },
        ready () {
            this.loading = true;
            API.user(today).then((k) => {
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
                API.user(n).then((k) => {
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

