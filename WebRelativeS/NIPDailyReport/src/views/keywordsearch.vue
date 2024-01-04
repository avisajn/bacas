<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">Keyword Statistics</span>
                <Date-picker 
                    :value.sync="param.dateRange" 
                    format="yyyy/MM/dd" 
                    @on-change="onDateChange"
                    :options="dateOptions" 
                    type="daterange" 
                    placement="bottom-end" 
                    placeholder="选择日期"
                    class="date query-item" 
                    style="width: 180px">
                </Date-picker>
                <i-button type="primary" icon="ios-search" @click="onSearch">Search</i-button>
            </div>
            <div slot="panel" class="tables-panel">
                <i-table 
                    :content="self"
                    v-if="!groupTable.loading" 
                    :columns="groupTable.columns" 
                    class="dash-table" 
                    size="small" 
                    v-ref:table
                    :data="groupTable.data"></i-table>
                <Spin size="large" fix v-if="groupTable.loading"></Spin>

                <Modal
                    :visible.sync="infoTable.modal"
                    :title="infoTable.title"
                    class="no-foot-modal"
                    >
                    <div class="">
                        <i-table 
                            :columns="infoTable.columns" 
                            class="dash-table" 
                            size="small" 
                            :data="infoTable.data"></i-table>
                        <br/>
                        <Page size="small" :current="infoTable.current" :total="infoTable.total" show-elevator @on-change="setInfoTableData"></Page>
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

    let startDay = window.startDay;
    const earlyDate = new Date('2017-02-01').valueOf();
    // const overData = window.lastTime;
    const today = window.lastDate;
    const overData = window.lastTime;
    const infoColumns = [
        {title: '关键字', key: 'keyword'},
        {title: '次数', key: 'keywordCount'},
    ];
    export default {
        data(){
            return {
                self : this,
                param : {
                    dateRange: [startDay, today],
                },
                dateOptions : {
                    disabledDate (date) {
                        const v = date.valueOf();
                        return date && (v >= overData || v <= earlyDate);
                    }
                }, 
                infoTable : {   //弹出详情的表格
                    title : '关键字统计数据',
                    modal : false,
                    columns : infoColumns,
                    data : [],
                    current : 1,
                    dataAll : [],
                    total : 0,  // 总条数
                },
                groupTable : {  // 分组后的表格
                    columns : [
                        {title: 'Date', key: 'date' ,width:100},
                        {title: 'Searches', key: 'num' ,width:100},
                        {title: 'Top 10 keywords', key: 'top' ,render(r){
                            let res = [];
                            res.push('<ul class="groupTagsTop">');
                            r.top.map((k) => {
                                res.push('<li>'+k.keyword+'<span>'+k.keywordCount+'</span></li>')
                            })
                            res.push('</ul>');
                            return res.join(' ');
                        }},
                        {title: '#', key: 'date' ,width:170 ,render(r){
                            return `
                                <i-button type="success" size="small" @click="onExport('${r.date}')">Export</i-button>
                                <i-button type="info" size="small" @click="onRowViewInfo('${r.date}')">View All</i-button>
                                `
                        }},
                    ],
                    data : [],
                    loading : false,
                },
                dataAll: [],    // 所有的数据，当数据多的时候，需要从dataAll中获取数据
            }
        },

        ready(){
            this.onSearch();
            window.Loading.hide();
        },

        methods : {
            onDateChange(d){
                this.param.dateRange = d;
            },
            onSearch(){
                this.groupTable.loading = true;
                const range = this.param.dateRange;
                API.keywordSearchCountDesc({
                    start_date : moment(range[0]).format('YYYYMMDD'),
                    end_date : moment(range[1]).add(1, 'days').format('YYYYMMDD'),
                }).then((k) => {
                    this.dataAll = k;
                    this.groupTable.data  = this.getGroupTableData(k);
                    this.groupTable.loading = false;
                } ,(e) => {
                    this.loading = false;
                    this.$Notice.error({
                        title: '获取接口出错！',
                        desc: '错误代码：'+e.errno +':' + e.err
                    });
                })
            },

            onExport(date){
                if(date){
                    this.$refs.table.exportCsv({
                        filename: date,
                        columns: infoColumns,
                        data: this.dataAll[date]
                    });
                }
            },

            // 单击查看某一行的数据时
            onRowViewInfo(date){
                this.infoTable.modal = true;
                this.infoTable.title = date+'日的统计数据';
                const dataAll = this.dataAll[date];
                this.infoTable.dataAll = dataAll;
                this.infoTable.total = dataAll.length;
                this.setInfoTableData(1);
            },

            setInfoTableData(page){
                this.infoTable.current = page;
                this.infoTable.data = this.getArr10(this.infoTable.dataAll ,page);
            },

            // 得到时间段的关键字统计
            getGroupTableData(data){
                let res = [];
                let k = null;
                for(let date in data){
                    k = data[date];
                    res.push({
                        date : date ,
                        num : k.length ,
                        top : this.getArr10(k),
                    });
                }
                res = res.sort((v1 ,v2) => {
                    if(v1.date > v2.date) return -1;
                    return 1;
                });
                return res;
            },


            // 获取数组10条数据,根据页数
            getArr10(arr ,page){
                page = page || 1;
                let res = [];
                for(let i=(page-1)*10;i<page*10;i++){
                    if(!arr[i]){
                        break;
                    }
                    res.push(arr[i]);
                }
                return res;
            },

            changePage(n){
                console.log('changePage',n);
            }

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
        margin-top: 20px;
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