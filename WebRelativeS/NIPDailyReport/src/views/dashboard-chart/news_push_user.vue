<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">新用户推送新闻统计 - 图表</span>
                <div class="checkpanel">
                    <Checkbox-group :model.sync="charts.checked" @on-change="chartItemChange">
                        <Checkbox 
                            v-for="item in mapping" 
                            :value="item.key" 
                            :style="{color:item.color}"
                        >{{item.text}}</Checkbox>
                    </Checkbox-group>
                </div>

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
    
    import layoutMain from '../../components/layout';
    import queryLayout from '../../components/querylayout';
    import API from '../../libs/chartApi';
    import Util from '../../libs/util';
    import ChartUtil from '../../libs/chartUtil';
    import moment from 'moment';

    // 引入 ECharts 主模块
    import echarts from 'echarts';

    let startDay = window.startDay;
    let _config = window.config;

    // const earlyDate = window.earlyDay;
    const overData = moment(new Date()).subtract(2, 'days');
    let today = overData.format('YYYY-MM-DD');
    const earlyDate = new Date('2016-12-21').valueOf();

    let myChart = null;
    export default {
        data(){
            return {
                dateRange: [startDay, today],
                chartTitle : '',
                mapping : [
                    { key:'freshPushCount'      , text: '总推送数'      , color:'#993333'},
                    { key:'freshPushSuccessCount'    , text: '推送到达数'    , color:'#CCCC00'},
                    { key:'freshPushRead'       , text: '推送阅读数'       , color:'#663366'},
                    { key:'pushReachRatio'       , text: '推送到达率'      , color:'#336633'},
                    { key:'pushRealCtr'     , text: '到达点击率'    , color:'#333333'},
                ],
                charts : {
                    checked : ['pushReachRatio' ,'pushRealCtr'],
                    width : _config.width ,
                    height : _config.height,
                },
                data : [],      // 现在的数据
                oldData : [],   // 获取比对的数据
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
            // 判断是否有参数,有参数的话，默认显示参数
            const q = Util.getQuery('t');
            if(q){ this.charts.checked = [q]; }
            this.onSearch();
        },

        methods : {
            onDateChange(d){
                this.dateRange = d;
            },
            chartItemChange(){
                this.setOption();
            },

            async onSearch(){
                this.loading = true;
                let range = this.dateRange;
                const e = await API.newsPushedNewUser(range[0] ,range[1]);
                this.data = e.data;
                this.oldData = e.oldData;
                this.chartTitle = e.title;
                this.setOption();
                this.loading = false;
            },

            setOption(){
                const data = this.data;
                const oldData = this.oldData;
                const arr_legend = ChartUtil.getArrayByChecked(this.charts.checked ,this.mapping);
                const range = this.dateRange;
                const title = this.chartTitle;
                myChart.clear();
                myChart.setOption({
                    title: {text: title, left: 'center'},
                    "tooltip": {show:true,"trigger": "axis",formatter : function (params) {
                        let res = params[0].name+':<br/>';
                        for (var i = 0, l = params.length ,n; i < l; i++) {
                            n = params[i].seriesName;
                            res += (i>0?'<br/>':'') + n + ' : ' + params[i].value;
                            if(n.indexOf('率') > 0 || n.indexOf('比例') > 0){
                                res += '%';
                            }
                        }
                        return res;
                    }},
                    "toolbox": {"feature": {"saveAsImage": {} } },
                    "grid": {"left": "5%", "right": "5%", "bottom": "5%", "top": "5%", "containLabel": true },
                    "xAxis": [
                        {
                            "type": "category",
                            "boundaryGap": false,
                            "data": ChartUtil.getDateRangeArray(range[0] ,range[1])
                        }
                    ],
                    "yAxis": [{"type": "value"} ],
                    "series": ChartUtil.getArrByKeyMapping(data ,oldData,arr_legend)
                });
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
        .checkpanel{
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