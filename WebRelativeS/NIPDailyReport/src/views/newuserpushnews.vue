<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">新客户端推送新闻统计 - 图表</span>
                <Date-picker 
                    :value.sync="dateRange" 
                    format="yyyy/MM/dd" 
                    :options="dateOptions" 
                    type="daterange" 
                    @on-change="onDateChange"
                    placement="bottom-end" 
                    placeholder="选择日期"
                    class="date" 
                    style="width: 200px">
                </Date-picker>
                <i-button type="primary" icon="ios-search" @click="onSearch">搜索</i-button>
            </div>
            <div slot="panel" class="tables-panel">
                <div id="chartMain" class="chart-main" :style="{width:charts.width+'px' ,height:charts.height+'px'}"> </div>
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
    import moment from 'moment';

    // 引入 ECharts 主模块
    import echarts from 'echarts';

    const overData = moment(new Date()).subtract(2, 'days');
    let today = overData.format('YYYY-MM-DD');
    let startDay = window.startDay;
    let _config = window.config;

    const earlyDate = new Date('2016-12-17').valueOf();

    let myChart = null;
    export default {
        data(){
            return {
                dateRange: [startDay, today],
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
            myChart = echarts.init(document.getElementById('chartMain'));
            API.newsPushedNewClient(startDay ,today).then((k) => {
                myChart.setOption(k);
                this.loading = false;
            } ,(e) => {
                // this.loading = false;
                // this.$Notice.error({
                //     title: '获取接口出错！',
                //     desc: '错误代码：'+e.errno +':' + e.err
                // });
            })
        },

        methods : {
            onDateChange(d){
                this.dateRange = d;
            },
            onSearch(){
                this.loading = true;
                let range = this.dateRange;
                API.newsPushedNewClient(range[0] ,range[1]).then((k) => {
                    myChart.setOption(k);
                    this.loading = false;
                } ,(e) => {
                    // this.loading = false;
                    // this.$Notice.error({
                    //     title: '获取接口出错！',
                    //     desc: '错误代码：'+e.errno +':' + e.err
                    // });
                })
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