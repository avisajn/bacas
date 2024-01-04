<template>
    <layout-main>
        <query-layout slot="main" top="60">
            <div slot="condition" class="condition">  
                <span class="title">InFeedBanner - 统计表格</span>
                <!-- <i-input :value.sync="param.key" style="width:150px;"  class="query-item" ></i-input> -->
                <!-- <i-button type="primary" icon="ios-search" @click="onSearch">搜索</i-button> -->
            </div>
            <div slot="panel" class="tables-panel">
                <i-table 
                    v-if="!loading" 
                    :columns="columns" 
                    :content="self" 
                    class="dash-table" 
                    size="small" 
                    :data="dataTable"
                    v-ref:table
                    @on-sort-change="onSortChange"
                ></i-table>
                <div style="margin: 10px;overflow: hidden">
                    <div style="float: right;">
                        <Page size="small" :current="current" :page-size="pagesize" :total="total" show-elevator @on-change="setTablePagin"></Page>
                    </div>
                </div>
                <Spin size="large" fix v-if="loading"></Spin>
            </div>
        </query-layout>
    </layout-main>
</template>
<script>
    
    import layoutMain from '../../components/layout';
    import queryLayout from '../../components/querylayout';
    import API from '../../libs/api';
    import Util from '../../libs/util';
    import moment from 'moment';

    // let today = window.lastDate;
    // let startDay = window.startDay;
    // const earlyDate = window.earlyDay;
    // const overData = Date.now() - 86400000;
    let _config = window.config;
    const countryMapping = {
        'id' : 'Indonesia' ,
        'br' : 'Brazil' ,
        'me' : 'Me' ,
    }
    const urlMapping = {
        'id' : 'http://berita.baca.co.id/',
        'br' : 'http://noticias.cennoticias.com/',
        'me' : 'http://nipmenews.azurewebsites.net/',
    }
    const baseUrl = urlMapping[window.lan];
    const _timep = window.lan=='id'?7:-3;
    export default {
        data(){
            return {
                self : this,
                param : {
                    key : '',
                },
                columns: [
                    {title: 'news_id', key: 'news_id' ,width:240 },
                    {title: 'title', key: 'title' ,render(r){
                        return r.title;
                        // return '<a href="'+baseUrl+r.news_id+'" target="_blank">'+r.title+'</a>';
                    }},
                    {title: 'click_cnt', key: 'click_cnt' ,width:90 },
                    {title: 'impression_cnt', key: 'impression_cnt' ,width:130 },
                    {title: 'ctr', key: 'ctr' ,width:80 },
                    // {title: 'Tag', key: 'tag' ,width:100 },
                    // {title: 'page_id', key: 'page_id' ,width:150 },
                    {title: 'start-end time', key: 'start_time' ,width:280 ,render(r){
                        return r.start_time + ' - ' + r.end_time;
                    }},
                ],
                dataAll: [],    // 所有的数据，当数据多的时候，需要从dataAll中获取数据
                dataTable : [], // 展示给table的数据
                loading : false ,
                total : 0,  // 总条数
                current : 1,
                pagesize : 10,
                sortableData : {} , // 排序后的数据
            }
        },

        ready(){
            window.Loading.hide();
            this.onSearch();
        },

        methods : {
            onSearch(){
                this.loading = true;
                API.inFeedBanner.getChartList({title:this.param.key}).then((k) => {
                    k.map((k) => {
                        // k.start_time = moment(k.start_time.substring(0,19)).add(_timep ,'h').format('YYYY-MM-DD HH:mm:ss');
                        k.start_time = moment(k.start_time.substring(0,19)).format('YYYY-MM-DD HH:mm:ss');
                        // k.end_time = k.end_time.substring(0,19);
                        // k.end_time = moment(k.end_time.substring(0,19)).add(_timep ,'h').format('YYYY-MM-DD HH:mm:ss')
                        k.end_time = moment(k.end_time.substring(0,19)).format('YYYY-MM-DD HH:mm:ss')
                    })
                    this.dataAll = k;
                    this.total = k.length;
                    this.setTablePagin(1);
                    this.loading = false;
                } ,(e) => {
                    this.loading = false;
                    this.$Notice.error({
                        title: '获取接口出错！',
                        desc: '错误代码：'+e.errno +':' + e.err
                    });
                })
            },

            // 跳转到第page页
            setTablePagin(page){
                this.current = page;
                this.dataTable = this.getArr10(page);
            },

            // 获取数组10条数据,根据页数
            getArr10(page){
                const data = this.dataAll;
                page = page || 1;
                const size = this.pagesize;
                let res = [];
                for(let i=(page-1)*size;i<page*size;i++){
                    if(!data[i]){
                        break;
                    }
                    res.push(data[i]);
                }
                return res;
            },

            // 当选择列进行排序后
            onSortChange(o){
                this.loading = true;
                const columnName = o.key;
                const order = o.order;  // desc ,esc ,normal
                let arr = this.dataAll;
                let _t1 ,_t2;
                setTimeout(() => {
                    if(order == 'asc'){
                        this.dataAll = arr.sort((v1 ,v2) => {
                            _t1 = parseFloat(v1[columnName]) || 0;
                            _t2 = parseFloat(v2[columnName]) || 0;
                            if(_t1 > _t2) return -1;
                            return 1;
                        });
                    }else{
                        this.dataAll = arr.sort((v1 ,v2) => {
                            _t1 = parseFloat(v1[columnName]) || 0;
                            _t2 = parseFloat(v2[columnName]) || 0;
                            if(_t1 > _t2) return 1;
                            return -1;
                        });
                    }
                    this.setTablePagin(this.current);
                    this.loading = false;
                },50);
            },

        },

        components : {
            layoutMain,
            queryLayout,
        }
    }
</script>
<style scoped lang="less">
    .condition{
        text-align:right;
        position:relative;
        .date{
            display:inline-block;
            width:200px;
        }
        .title{
            display: inline-block;
            float: left;
            font-size: 15px;
            margin-top: 5px;
        }
    }
    .tables-panel{
        padding:10px;
        .chart-main{
            margin-left:20px;
        }
    }
    .condition-more-panel{
        .more-input{
            width:250px;
        }
    }
</style>