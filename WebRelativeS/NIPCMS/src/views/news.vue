<template>
    <layout-main>
        <query-layout slot="main" top="50">
            <div slot="condition" class="condition">  
                <span class="title">新闻管理</span>
                <Date-picker 
                    v-if="param.dateDisplay"
                    :value.sync="param.dateRange" 
                    format="yyyy-MM-dd HH:mm:ss" 
                    type="datetimerange" 
                    placement="bottom-end" 
                    placeholder="选择日期"
                    class="date" 
                    style="width: 300px">
                </Date-picker>
                <i-select @on-change="onSelectChange" :model.sync="param.query_by" style="width:120px;text-align:left;">
                    <i-option value="news_id_list">news_id_ids</i-option>
                    <i-option value="category_name">category_name</i-option>
                    <i-option value="media_id">media_id</i-option>
                </i-select>
                <i-input :value.sync="param.value" placeholder="value" style="width:300px;"></i-input> 

                <i-button type="primary" icon="ios-search" @click="onSearch">搜索</i-button>
            </div>
            <div slot="panel" class="tables-panel">
                <div style="margin: 10px;overflow: hidden">
                    <i-button 
                        v-if="select.length > 0" 
                        type="error" 
                        icon="android-delete"
                        @click="onDeleteMany"
                        size="small"
                    >{{sendStatus.btnText}}({{select.length}}条)</i-button>
                    <div style="float: right;">
                        <Page 
                            size="small" 
                            :current="current" 
                            :page-size="pagesize" 
                            :total="total" 
                            show-sizer 
                            show-elevator 
                            @on-page-size-change="onPageSizeChange"
                            @on-change="setTablePagin">
                        </Page>
                    </div>
                </div>
                <i-table 
                    :content="self"
                    v-if="!loading" 
                    :columns="columns" 
                    class="dash-table" 
                    size="small" 
                    :data="dataTable"
                    v-ref:table
                    @on-sort-change="onSortChange"
                    @on-selection-change="onSelect"
                ></i-table>
                <Spin size="large" fix v-if="loading"></Spin>
            </div>

        </query-layout>
    </layout-main>
</template>
<script>
    
    import layoutMain from '../components/layout';
    import queryLayout from '../components/querylayout';
    import API from '../libs/api';
    import Util from '../libs/util';
    import moment from 'moment';

    const urlMapping = {
        br : 'http://noticias.cennoticias.com/',
        id : 'http://berita.baca.co.id/'
    }

    const today = moment(new Date()).format('YYYY-MM-DD');
    const overData = Date.now();
    const baseUrl = urlMapping[window.lan];
    console.log('window.lan:',window.lan);
    export default {
        data(){
            return {
                self : this,
                param : {
                    dateRange: [today+' 00:00:00', new Date()],
                    value : '',
                    query_by : 'news_id_list',
                    dateDisplay : false,
                },
                dateOptions : {
                    disabledDate (date) {
                        const v = date.valueOf();
                        return date && (v >= overData || v <= earlyDate);
                    }
                },
                columns: [
                    {type: 'selection', width: 60, align: 'center'},
                    {title: 'news_id', key: 'news_id' ,width:100 ,render(r){
                        return '<a href="'+baseUrl+r.news_id+'" target="_blank">'+r.news_id+'</a>';
                    }},
                    {title: 'title', key: 'title'},
                    // {title: 'author', key: 'author' ,sortable: 'custom'},
                    {title: 'author', key: 'author' ,width:150},
                    // {title: 'url', key: 'url' ,sortable: 'custom'},
                    {title: 'media_id', key: 'media_id' ,width:100},
                    {title: 'created_time', key: 'created_time' ,width:240 ,},
                    {title: '', key: 'opt' ,width:240 , render(r){
                        return `<i-button @click="onDelete(${r.news_id})" type="error" size="small">删除</i-button>`;
                    }},
                ],
                sendStatus : {
                    btnText : '删除选中',
                    precent : 0,
                    max : 0,
                    num : 0,
                },
                select : [],
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
        },

        methods : {
            onSearch(){
                const {dateRange ,value ,query_by ,} = this.param;
                if(!value){
                    this.$Notice.error({
                        title: '参数错误！',
                        desc: `${query_by}的值，必须要填写！如果为多个，需要以逗号隔开！中间不能有空格等其他字符`,
                    });
                    return;
                }
                const _param = {
                    query_by : query_by ,
                    value : value,
                }

                if(query_by == 'news_id_list'){
                    
                }else{
                    if(dateRange.length != 2){
                        this.$Notice.error({
                            title: '参数错误！',
                            desc: `当选择为${query_by}的时候，时间范围必须选择！`,
                        });
                        return;
                    }else{
                       _param['start_time'] = moment(dateRange[0]).format('YYYY-MM-DD HH:mm:ss');
                       _param['end_time'] = moment(dateRange[1]).format('YYYY-MM-DD HH:mm:ss');
                    }
                }

                console.log('_param:',_param);
                this.loading = true;
                API.news.queryNews(_param).then((k) => {
                    this.dataAll = k.lists;
                    this.total = k.lists.length;
                    // console.log('this.totao:' ,k.total);
                    this.setTablePagin(1);
                    this.loading = false;
                } ,(e) => {
                    this.dataAll = [];
                    this.total = 0;
                    this.setTablePagin(1);
                    this.loading = false;
                    this.$Notice.error({
                        title: '获取数据出错！',
                        desc: '错误代码：'+e.errno +':' + e.err
                    });
                })
            },

            // table select change
            onSelect(d){
                this.select = d;
            },

            // 
            onSelectChange(d){
                if(d == 'news_id_list'){
                    // 应该让date隐藏
                    this.param.dateDisplay = false;
                }else{
                    this.param.dateDisplay = true;
                }
            },

            onDelete(id){

                // return;
                this.$Modal.confirm({
                    title: '删除确认',
                    content : '确认要删除ID为'+id+'吗？',
                    onOk: () => {
                        API.news.deleteNews([id]).then((k) => {
                            this.deleteOver([id]);
                            this.$Notice.success({title: '删除成功！'});
                        } ,(e) => {
                            this.$Notice.error({title: '删除失败' ,desc : e});
                        });
                    }
                });
            },

            // 从列表中删除数据
            deleteOver(idarr){
                const obj = {};
                idarr.map((k) => {
                    obj[k] = true;
                });
                const list = this.dataAll;
                // this.dataAll = k.lists;
                // this.total = k.total;
                // this.setTablePagin(1);
                // this.loading = false;
                const newList = [];
                list.map((k) => {
                    if(!obj[k.news_id]){
                        newList.push(k);
                    }
                });

                this.dataAll = newList;
                this.total = newList.length;
                this.setTablePagin(this.current);
            },

            onDeleteMany(){
                const select = this.select;
                this.$Modal.confirm({
                    title: '删除确认',
                    content: '确认要删除选中的'+select.length+'条数据吗？',
                    onOk: () => {
                        const arr = [];
                        select.map((k) => {
                            arr.push(k.news_id);
                        });
                        API.news.deleteNews(arr).then((k) => {
                            this.deleteOver(arr);
                            this.$Notice.success({title: '删除成功！'});
                        } ,(e) => {
                            this.$Notice.error({title: '删除失败' ,desc : e});
                        });
                    }
                });
            },

            
            onPageSizeChange(v){
                this.pagesize = v;
                this.setTablePagin(1);
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
                console.log('l:',o);
                this.loading = true;
                const columnName = o.key;
                const order = o.order;  // desc ,esc ,normal
                let arr = this.dataAll;
                let _t1 ,_t2;
                // setTimeout(() => {
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
                // },50);
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
        
    }
</style>