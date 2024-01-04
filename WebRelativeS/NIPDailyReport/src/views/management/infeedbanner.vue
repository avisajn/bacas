<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">InFeedBanner</span>
                <i-button class="btnhistory" type="dashed" icon="umbrella" @click="onShowHistory">History</i-button>
            </div>
            <div slot="panel" class="tables-panel select-no">
                <feed-form></feed-form>
                <Modal
                    :visible.sync="historyList.modal"
                    width="800"
                    class="modal-no-foot"
                    title="historical data">
                        <div class="tb-list">
                            <!-- <Radio-group :model.sync="historyType" @on-change="getHistory()">
                                <Radio value="id">Indonesia</Radio>
                                <Radio value="br">Brazil</Radio>
                            </Radio-group>
                            <br/><br/> -->
                            <i-table 
                                v-if="!historyList.loading"
                                :content="self"
                                size="small"  
                                v-if="!historyList.loading" 
                                :columns="historyList.columns" 
                                :data="historyList.dataCurrent"></i-table>
                            <div v-if="!historyList.loading" style="margin: 10px;overflow: hidden">
                                <div style="float: right;">
                                    <Page size="small" :current="historyList.page" :total="historyList.total" show-elevator @on-change="getHistoryPage"></Page>
                                </div>
                            </div>
                            <div style="text-align:center;" v-if="historyList.loading">loading...</div>
                        </div>
                </Modal>
            </div>
        </query-layout>
    </layout-main>
</template>
<script>
    
    import layoutMain from '../../components/layout';
    import queryLayout from '../../components/querylayout';
    import feedForm from '../../components/management/infeedbanner_form';

    import Util from '../../libs/util';
    import API from '../../libs/api';
    import moment from 'moment';

    export default {
        data(){
            return {
                self : this,
                historyType : 'id',
                historyList : {
                    key : '',
                    modal : false ,
                    loading : false,
                    dataAll : [],
                    dateRange : [],
                    dataPageAll : [],
                    columns :  [
                        {title: 'Title', key: 'Title' ,render(r){
                            if(r.Title){
                                return r.Title;
                            }
                            const newsId = r.TargetUrl.substring(r.TargetUrl.lastIndexOf('/')+1);
                            return `<a href="${r.TargetUrl}" target="_blank">${newsId}</a>`;
                        }},
                        {title: 'Start - End', key: 'Start' ,width:270 ,render(r){
                            return moment(r.Start.substring(0,19)).format('YYYYMMDD HH:mm:ss') + ' ~ ' + moment(r.End.substring(0,19)).format('YYYYMMDD HH:mm:ss');
                        }},
                        {title: 'CreatedTime', key: 'CreatedTime' ,width:150,render(r){
                            if(r.CreatedTime && r.CreatedTime.indexOf('0001-01-01') == -1) {
                                return moment(r.CreatedTime.substring(0,19)).format('YYYYMMDD HH:mm:ss');
                            }
                            else return '-';
                        }},
                        {title: '-', key: 'End' ,width:100,render(r){
                            return `<i-button type="error" size="small" @click="onDeleteHistory('${r.PageId}')" >Take offline</i-button>`;
                        }},
                    ],
                    page : 1,
                    total : 0,
                    dataCurrent : []
                }
            }
        },

        ready(){
            window.Loading.hide();
            this.historyType = window.lan;
            this.getHistory();
        },

        methods : {
            onShowHistory(){
                this.historyList.modal = true;
                this.getHistoryPage(1);
            },

            getHistory(){
                this.historyList.loading = true;
                const dateRange = this.historyList.dateRange;
                const type = this.historyType;
                API.dynamicBannerHistory({},type).then((k) => {
                    this.historyList.dataAll = k;
                    this.historyList.dataPageAll = k;
                    this.historyList.total = k.length;
                    this.historyList.loading = false;
                    this.getHistoryPage(1);
                } ,(e) => {
                    this.$Notice.error({title: '获取历史数据的接口出错！'});
                })
            },

            getHistoryPage(page){
                page = page || 1;
                this.historyList.page = page;
                const data = this.historyList.dataPageAll;
                let res = [];
                for(let i=(page-1)*10;i<page*10;i++){
                    if(!data[i]){break; }
                    res.push(data[i]);
                }
                this.historyList.dataCurrent = res;
            },

            onDeleteHistory(PageId){
                const msg = this.$Message.loading('正在处理中...', 0);
                const type = this.historyType;
                API.delDynamicBanner(PageId ,type).then((k) => {
                    console.log('K',k);
                    const data = this.historyList.dataPageAll;
                    let newData = [];
                    data.map((k) => {
                        if(k.PageId != PageId){
                            newData.push(k);
                        }
                    });
                    this.historyList.dataPageAll = newData;
                    this.getHistoryPage(this.historyList.page);
                    msg();
                } ,(f) => {
                    msg();
                    this.$Notice.error({title: '删除历史数据出错！'});
                })
            }
        },


        components : {layoutMain, queryLayout ,feedForm}
    }
</script>
<style scoped lang="less">
    .condition{
        .title{
            display: inline-block;
            font-size: 15px;
            margin-top: 5px;
        }
        .btnhistory{
            float:right;
        }
    }
    .tables-panel{
        
    }
</style>