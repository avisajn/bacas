<template>
    <layout-main>
        <query-layout slot="main" top="60">
            <div slot="condition" class="condition">  
                <span class="title">查询推送 - 表格</span>
                <i-input :value.sync="param.key" style="width:150px;"  class="query-item" ></i-input>
                <i-button type="primary" icon="ios-search" @click="onSearch">搜索</i-button>
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
                <Modal :visible.sync="titleModal.modal" width="360">
                    <p slot="header" style="color:#f60;text-align:center">
                        <Icon type="information-circled"></Icon>
                        <span>Push Title</span>
                    </p>
                    <div style="text-align:center">
                        <Row>
                            <i-col span="6" style="line-height:30px">Title:</i-col> 
                            <i-col span="18"> 
                                <i-input :value.sync="titleModal.title" placeHolder="title"></i-input>
                            </i-col>
                        </Row>
                    </div>
                    <div slot="footer">
                        <i-button type="primary" size="large" @click="onAddtoPushSubmit" long :loading="modal_loading" @click="del">提交</i-button>
                    </div>
                </Modal>

                <Modal :visible.sync="promoteModal.modal" width="360">
                    <p slot="header" style="color:#f60;text-align:center">
                        <Icon type="information-circled"></Icon>
                        <span>Promote News</span>
                    </p>
                    <div>
                        <Row>
                            <i-col span="12" style="line-height:30px">Duration(hour)[1-24]:</i-col> 
                            <i-col span="12"> 
                                <Input-number :max="24" :min="1" :value.sync="promoteModal.hour"></Input-number>
                            </i-col>
                        </Row>
                        <br/>
                        <Row>
                            <i-col span="12"  style="line-height:30px">Weight[1-10]:</i-col>
                            <i-col span="12">
                                <Input-number :max="10" :min="1" :value.sync="promoteModal.weight"></Input-number>
                            </i-col>
                        </Row>
                    </div>
                    <div slot="footer">
                        <i-button type="primary" size="large" @click="onPromoteSubmit" long :loading="modal_loading" @click="del">提交</i-button>
                    </div>
                </Modal>
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
    export default {
        data(){
            return {
                self : this,
                param : {
                    key : '',
                },
                columns: [
                    {title: 'NewsId', key: 'NewsId' ,width:100 },
                    {title: 'Title', key: 'Title' ,render(r){
                        return '<a href="'+baseUrl+r.NewsId+'" target="_blank">'+r.Title+'</a>';
                    }},
                    {title: 'Tag', key: 'tag' ,width:150 },
                    {title: 'CreatedTime', key: 'datetime' ,width:150},
                    {title: 'opt', key: 'datetime' ,render(r){
                        return `
                            <i-button type="error" size="small" @click="onShowTitleModal(1, '${r.NewsId}' ,'${r.ktitle}')">Push Now</i-button>
                            <i-button type="warning" size="small" @click="onShowTitleModal(2, '${r.NewsId}' ,'${r.ktitle}')">Add to push list</i-button>
                            <i-button type="info" size="small" @click="onPromoteModal('${r.NewsId}')">Promote News</i-button>
                        `;
                    }},
                ],
                dataAll: [],    // 所有的数据，当数据多的时候，需要从dataAll中获取数据
                dataTable : [], // 展示给table的数据
                loading : false ,
                total : 0,  // 总条数
                current : 1,
                pagesize : 10,
                sortableData : {} , // 排序后的数据


                titleModal : {
                    modal : false,
                    title : '',
                    newid : '',
                    type : 1, // pushsingle ,push to list
                },

                promoteModal : {
                    modal : false,
                    hour : 1,
                    weight : 1,
                    newid : ''
                }

            }
        },

        ready(){
            window.Loading.hide();
        },

        methods : {
            onSearch(){
                this.loading = true;
                API.searchPush.newsTitleSearch({title:this.param.key}).then((k) => {
                    k.map((k) => {
                        k.datetime = moment(k.CreatedTime).format("YYYY-MM-DD HH:mm:ss");
                        k.tag = (k.Name?k.Name.toUpperCase():'');
                        k.ktitle = k.Title.replace(/'/g,'’').replace(/"/g,'”');
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

            getNewsByNewsId(newid){
                const data = this.dataTable;
                for(let i=0,len=data.length;i<len;i++){
                    if(data[i].NewsId == newid){
                        return data[i];
                    }
                }
            },

            onShowTitleModal(type ,newid ,title){
                this.titleModal.modal = true;
                this.titleModal.newid = newid;
                this.titleModal.title = title;
                this.titleModal.type = type;
            },

            onAddtoPushSubmit(){
                const news = this.getNewsByNewsId(this.titleModal.newid);
                const modal = this.titleModal;
                API.searchPush.pushNews(modal.type ,JSON.stringify({
                    country : countryMapping[window.lan],
                    pushEntities : [{newsId:news.NewsId ,title:modal.title,tag:news.tag ,pushToAll:false} ]
                })).then((r) => {
                    this.$Notice.success({title: '提交成功！'}); 
                    this.titleModal.modal = false;
                },(e) => {
                    this.$Notice.error({title: '提交失败！'}); 
                })
            },

            onPromoteSubmit(){
                const news = this.getNewsByNewsId(this.promoteModal.newid);
                const param = this.promoteModal;
                API.searchPush.promote(JSON.stringify({
                    newsId:news.NewsId,
                    country : countryMapping[window.lan],
                    duration: param.hour,
                    weight: param.weight
                })).then((r) => {
                    this.$Notice.success({title: '提交成功！'}); 
                    this.promoteModal.modal = false;
                },(e) => {
                    this.$Notice.error({title: '提交失败！'}); 
                })
            },

            onPromoteModal(newid){
                this.promoteModal.modal = true;
                this.promoteModal.newid = newid;
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