<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">抓取频率趋势图 - 图表</span>
                <div class="time">
                    <span>{{timeInterval}}</span>
                </div>
                <i-select :model.sync="type" @on-change="typeChange" style="width:100px;text-align:left">
                    <i-option value="-1">全部</i-option>
                    <i-option value="0">News</i-option>
                    <i-option value="1">FunnyPic</i-option>
                    <i-option value="2">Gallery</i-option>
                    <i-option value="3">Video</i-option>
                    <i-option value="4">Joke</i-option>
                </i-select>
                
                <Date-picker 
                    :value.sync="date" 
                    format="yyyy/MM/dd" 
                    :options="dateOptions" 
                    type="date" 
                    @on-change="onDateChange"
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
                type : "-1",
                timeInterval : '',
                charts : {
                    width : _config.width ,
                    height : _config.height,
                },
                dateOptions : {
                    disabledDate (date) {
                        const v = date.valueOf();
                        return date && (v >= overData || v <= earlyDate);
                    }
                },
                loading : true,
            }
        },

        ready(){
            window.Loading.hide();
            // 基于准备好的dom，初始化echarts实例
            myChart = echarts.init(document.getElementById('chartLineFrequency'));
            this.onSearch(today);
            if(window._interval) window.clearInterval(window._interval);
            window._interval = setInterval(() => {
                this.timeInterval = moment().utc().format('YYYY-MM-DD HH:mm:ss');
            },1000);
        },

        methods : {
            onDateChange(d){
                this.date = d;
            },
            onSearch(){
                this.loading = true;
                API.crawlFrequency(this.date ,this.type).then((k) => {
                    myChart.setOption(k);
                    this.loading = false;
                } ,(e) => {
                    this.loading = false;
                    this.$Notice.error({
                        title: '获取接口出错！',
                        desc: '错误代码：'+e.errno +':' + e.err
                    });
                })
            },

            typeChange(v){
                this.type = v;
                this.onSearch();
            },

            dateChange(v){
                this.date = v;
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