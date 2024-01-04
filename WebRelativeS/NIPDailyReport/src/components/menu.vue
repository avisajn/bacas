<template>
    <Menu :active-key="active" @on-select="onSelect">

        <Menu-item v-if="permission.dashboard" key="/">
            <Icon type="home"></Icon> Dashboard 
        </Menu-item>

        <Submenu v-if="permission['dashboard-chart']"  key="/ds-chart">
            <template slot="title"> <Icon type="ios-people"></Icon> Dashboard 详细数据 </template>
            <Menu-item key="/userchart">
                <Icon type="arrow-graph-up-right"></Icon>用户数据
            </Menu-item>
            <Menu-item key="/newschart_chart">
                <Icon type="arrow-graph-up-right"></Icon>新闻数据统计
            </Menu-item>
            <Menu-item key="/news_crawled_chart">
                <Icon type="arrow-graph-up-right"></Icon>新闻抓取统计
            </Menu-item>
            <Menu-item key="/news_pushed_chart">
                <Icon type="arrow-graph-up-right"></Icon>推送新闻统计
            </Menu-item>
            <Menu-item key="/news_without_reltv_chart">
                <Icon type="arrow-graph-up-right"></Icon>除去相关新闻数据统计
            </Menu-item>
            <Menu-item key="/special_click_position_chart">
                <Icon type="arrow-graph-up-right"></Icon>特殊点击位置
            </Menu-item>

            <Menu-item key="/news_push_client_chart">
                <Icon type="arrow-graph-up-right"></Icon>新客户端推送新闻统计
            </Menu-item>

            <Menu-item key="/news_type_ctr_chart">
                <Icon type="arrow-graph-up-right"></Icon>新闻类型点击率统计
            </Menu-item>

            <Menu-item key="/ctr_chart">
                <Icon type="arrow-graph-up-right"></Icon>点击率统计
            </Menu-item>

            <Menu-item key="/ctr_user_fetch_chart">
                <Icon type="arrow-graph-up-right"></Icon>新用户点击率统计
            </Menu-item>

            <Menu-item key="/ctr_hot_news_chart">
                <Icon type="arrow-graph-up-right"></Icon>热门新闻点击率统计
            </Menu-item>

            <Menu-item key="/ctr_type_chart">
                <Icon type="arrow-graph-up-right"></Icon>类别点击率统计
            </Menu-item>
        </Submenu>


        <Menu-item v-if="!permission['dashboard-chart'] && permission['dashboard_ctr_type_chart']" key="/ctr_type_chart">
            <Icon type="arrow-graph-up-right"></Icon>类别点击率统计
        </Menu-item>

        <Menu-item v-if="permission['user-table']" key="/usertable">
            <Icon type="ios-grid-view"></Icon>用户数据
        </Menu-item>

        <Menu-item v-if="permission['jsoneditor']" key="/jsoneditor">
            <Icon type="code-working"></Icon>JSON编辑
        </Menu-item>

        <Menu-item v-if="permission.key" key="/keywordsearch">
            <Icon type="pricetag"></Icon>关键字统计
        </Menu-item>

        <Submenu v-if="permission['dashboard-chart']"  key="/ds-chart">
            <template slot="title"> <Icon type="calendar"></Icon> 推送数据 </template>
            <Menu-item key="/news_push_user_chart">
                <Icon type="arrow-graph-up-right"></Icon>新用户推送新闻统计
            </Menu-item>
            <Menu-item key="/news_push_client_chart">
                <Icon type="ios-filing"></Icon>新客户端推送新闻统计
            </Menu-item>
            <!-- <Menu-item v-if="permission['newuserpushnews-chart']" key="/newuserpushnews">
                <Icon type="ios-filing"></Icon>新客户端推送新闻统计
            </Menu-item> -->
        </Submenu>

        <!-- <Menu-item v-if="permission['crawl-frequency-chart']" key="/crawlfrequency">
            <Icon type="steam"></Icon>抓取频率趋势图
        </Menu-item> -->

        <!-- <Menu-item v-if="permission['crawl-status']" key="/crawlstatus">
            <Icon type="ios-pulse-strong"></Icon>任务状态图
        </Menu-item> -->

        <Submenu v-if="permission['InFeedBanner'] || permission['Advertorial']"  key="/ds-chart">
            <template slot="title"> <Icon type="calendar"></Icon> Management </template>
            <Menu-item v-if="permission['InFeedBanner']" key="/infeedbanner">
                <Icon type="ios-navigate"></Icon>InFeedBanner
            </Menu-item>
            <Menu-item v-if="permission['InFeedBanner']" key="/infeedbannerchart">
                <Icon type="ios-navigate"></Icon>InFeedBannerChart
            </Menu-item>
            <Menu-item v-if="permission['Advertorial']" key="/advertorial">
                <Icon type="ios-navigate"></Icon>Advertorial
            </Menu-item>
        </Submenu>

        <Menu-item v-if="permission['searchpushtable']" key="/searchpushtable">
            <Icon type="ios-search-strong"></Icon>SearchPush
        </Menu-item>
    </Menu>
</template>
<script>
    export default {
        data (e) {
            return {
                active : this.getHash(),
                permission : window.permission
            }
        },
        ready () {
            
        },
        beforeDestroy () {

        },
        methods: {
            onSelect(e){
                if(window._interval) window.clearInterval(window._interval);
                const hash = this.getHash();
                if(hash.indexOf(e) == -1){
                    window.Loading.show();
                }
                window.location.href = '#'+e;
            },
            getHash(){
                let hash = window.location.hash;
                if(hash.indexOf('!/') > 0){
                    hash = hash.substring(2); 
                }
                else{hash = '/'; }
                return hash;
            }
        }
    }
</script>
<style scoped lang="less">
    .menu{
        display: inline-block;
    }
</style>

