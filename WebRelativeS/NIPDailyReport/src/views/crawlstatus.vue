<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">爬虫实时状态图</span>
                <div class="time">
                    <span>{{timeInterval}}</span>
                </div>
                <div class="time range">
                    <span :style="{ width: count*33 + '%' }"></span>
                </div>
                <i-select :model.sync="type" @on-change="typeChange" style="width:200px;text-align:left">
                    <i-option value="doingsqueue">doingsqueue</i-option>
                    <i-option value="pagequeue">pagequeue</i-option>
                    <i-option value="rssqueue">rssqueue</i-option>
                    <i-option value="videoimagequeue">videoimagequeue</i-option>
                    <i-option value="videorssqueue">videorssqueue</i-option>
                    <i-option value="writedbnewsqueue">writedbnewsqueue</i-option>
                </i-select>
                
                <Date-picker 
                    :value.sync="date" 
                    format="yyyy/MM/dd" 
                    :options="dateOptions" 
                    type="date" 
                    placement="bottom-end" 
                    placeholder="选择日期"
                    class="date" 
                    @on-change="dateChange"
                    style="width: 200px">
                </Date-picker>
                <i-button type="primary" icon="ios-search" @click="onSearch">搜索</i-button>
            </div>
            <div slot="panel" class="tables-panel">
                <div id="chartLineFrequency" class="chart-main" :style="{width:charts.width+'px' ,height:charts.height+'px'}"> </div>
                <Spin size="large" fix v-if="loading"></Spin>
            </div>
        </query-layout>
    </layout-main>
</template>
<script>
    
    import layoutMain from '../components/layout';
    import queryLayout from '../components/querylayout';
    import API from '../libs/chartApi';
    import Util from '../libs/util';

    // 引入 ECharts 主模块
    import echarts from 'echarts';
    import moment from 'moment';

    const today = new Date();
    const startDay = '2017-02-01';
    const _config = window.config;
    const earlyDate = window.earlyDay;
    const overData = new Date().getTime();

    let myChart = null;
    export default {
        data(){
            return {
                date: today,
                type : "doingsqueue",
                timeInterval : '',
                count : 0,
                charts : {width : _config.width , height : _config.height, },
                dateOptions : {
                    disabledDate (date) {
                        const v = date.valueOf();
                        return date && (v >= overData || v <= earlyDate);
                    }
                },
                data : {},
                loading : true,
                zoomStart : 0,
                zoomEnd : 100
            }
        },

        ready(){
            window.Loading.hide();
            // 基于准备好的dom，初始化echarts实例
            myChart = echarts.init(document.getElementById('chartLineFrequency'));
            myChart.on('datazoom', (p) => {
                this.zoomStart = p.start;
                this.zoomEnd = p.end;
            });
            this.onSearch();
        },

        methods : {
            onSearch(){
                this.loading = true;
                this.count = 0;
                API.crawlStatus(this.date).then((k) => {
                    this.data = k;
                    this.loading = false;
                    this.setOption();
                    let count = this.count;
                    if(window._interval) window.clearInterval(window._interval);
                    window._interval = setInterval(() => {
                        if(count == 3){
                            this.timeInterval = moment().utc().format('YYYY-MM-DD HH:mm:ss');
                            this.rolling();
                            count = 0;
                            this.count = 0;
                        }else{
                            count++;
                            this.count = count;
                        }
                    },1000);
                } ,(e) => {
                    this.loading = false;
                    this.$Notice.error({
                        title: '获取接口出错！',
                        desc: '错误代码：'+e.errno +':' + e.err
                    });
                })
            },

            rolling(){
                API.crawlStatusSeconds(this.date ,this.data).then((k) => {
                    this.data = k;
                    this.setOption();
                });
            },

            setOption(){
                const _type = this.type;
                const _data = this.data[_type];
                let start = 90;
                let end = 100;
                const len = _data.length;
                if(this.zoomStart == 0){
                    if(len < 50){start = 50; }
                    else if(len < 100){start = 70; }
                    else{start = 95; }
                    this.zoomStart = start;
                }else{
                    start = this.zoomStart;
                    end = this.zoomEnd;
                }
                const options = {
                    tooltip : {trigger: 'axis' },
                    toolbox: {show : true, feature : {saveAsImage : {show: true} } },
                    dataZoom: {show: true, start : start  ,end:end},
                    legend : {data : [_type] },
                    xAxis : [{type : 'time', splitNumber:30 } ],
                    yAxis : [{type : 'value'} ],
                    series : [{name: _type, type: 'line', data: _data ,showAllSymbol:false ,dataFilter:'average'} ]
                }
                myChart.setOption(options);
            },

            typeChange(v){
                this.setOption();
            },

            dateChange(v){
                this.onSearch();
            }
        },


        components : {
            layoutMain,
            queryLayout
        }
    }
</script>
<style scoped lang="less">
    .condition{
        text-align:right;
        position:relative;
        .time{
            position: absolute;
            left: 0px;
            right: 0px;
            text-align: center;
            font-size: 16px;
            top: 4px;
        }
        .range{
            width: 170px;
            border: 1px solid gainsboro;
            top: 0px;
            left: 50%;
            margin-left: -85px;
            height: 34px;
            >span{
                display:block;
                height:100%;
                background: rgba(51, 153, 255, 0.4);
                -webkit-transition: all .2s ease-in-out;
                transition: all .2s ease-in-out;
                
            }
        }
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
        margin-top: 53px;
        .chart-main{
            margin-left:20px;
        }
    }
</style>