<template>
    <tb-panel>
        <div slot="title"><a href="javascript:window.toLink('/special_click_position_chart');">特殊点击位置</a></div>
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
                    {title: '<a href="javascript:window.toLink(\'/special_click_position_chart?t=readPushNews\')">阅读推送新闻数</a>', key: 'readPushNews'},
                    {title: '<a href="javascript:window.toLink(\'/special_click_position_chart?t=newsFromOtherLink\')">外链接新闻数</a>', key: 'newsFromOtherLink'},
                    {title: '<a href="javascript:window.toLink(\'/special_click_position_chart?t=relatedNews\')">相关新闻数</a>', key: 'relatedNews'},
                    {title: '<a href="javascript:window.toLink(\'/special_click_position_chart?t=keptNews\')">收藏新闻数</a>', key: 'keptNews'},
                    {title: '<a href="javascript:window.toLink(\'/special_click_position_chart?t=readNewsFromCommentLinkByOthers\')">评论链接阅读数</a>', key: 'readNewsFromCommentLinkByOthers'},
                ],
                data: [],
                loading : true
            };
        },
        ready () {
            this.loading = true;
            API.specialClickPosition(today).then((k) => {
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
                API.specialClickPosition(n).then((k) => {
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

