<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">类别单击率统计</span>
                <Date-picker 
                    :value.sync="dateRange" 
                    format="yyyy/MM/dd" 
                    :options="dateOptions" 
                    type="daterange" 
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
    import Util from '../libs/chartUtil';
    import moment from 'moment';

    // 引入 ECharts 主模块
    import echarts from 'echarts';

    let today = window.lastDate;
    let startDay = window.startDay;
    let _config = window.config;

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
                        return date && date.valueOf() >= Date.now() - 86400000;
                    }
                },
                loading : true,
            }
        },

        ready(){
            // 基于准备好的dom，初始化echarts实例
            myChart = echarts.init(document.getElementById('chartMain'));
            API.newsCategoryCtr(today ,today).then((k) => {
                console.log('key:',k);
                let seriesData = Util.getSeriesDataPie(k[0] ,{
                    ctr : [],
                    fetchCount : [],
                    readCount : []
                });

                myChart.setOption({
                    tooltip : {trigger: 'item', formatter: "{a} <br/>{b} : {c} ({d}%)"},
                    legend: {
                        x : 'center',
                        y : 'bottom',
                        data:Util.getDataKeys(k[0])
                    },
                    toolbox: {
                        show : true,
                        feature : {
                            mark : {show: true},
                            dataView : {show: true, readOnly: false},
                            magicType : {
                                show: true, 
                                type: ['pie', 'funnel']
                            },
                            restore : {show: true},
                            saveAsImage : {show: true}
                        }
                    },
                    calculable : true,
                    series : [
                        {
                            name:'展示统计',
                            type:'pie',
                            radius : [20, 110],
                            center : ['25%', 200],
                            roseType : 'radius',
                            width: '40%',       // for funnel
                            max: 40,            // for funnel
                            itemStyle : {
                                normal : {
                                    label : {show : false },
                                    labelLine : {show : false }
                                },
                                emphasis : {
                                    label : {show : true },
                                    labelLine : {show : true } 
                                }
                            },
                            data:seriesData['fetchCount']
                        },
                        {
                            name:'阅读统计',
                            type:'pie',
                            radius : [30, 110],
                            center : ['65%', 200],
                            roseType : 'radius',
                            x: '50%',               // for funnel
                            max: 40,                // for funnel
                            itemStyle : {
                                normal : {
                                    label : {show : false },
                                    labelLine : {show : false }
                                },
                                emphasis : {
                                    label : {show : true },
                                    labelLine : {show : true } 
                                }
                            },
                            sort : 'ascending',     // for funnel
                            data:seriesData['readCount']
                        },
                        {
                            name:'点击率统计',
                            type:'pie',
                            radius : [30, 110],
                            center : ['45%', 300],
                            roseType : 'radius',
                            x: '50%',               // for funnel
                            max: 40,                // for funnel
                            itemStyle : {
                                normal : {
                                    label : {show : false },
                                    labelLine : {show : false }
                                },
                                emphasis : {
                                    label : {show : true },
                                    labelLine : {show : true } 
                                }
                            },
                            sort : 'ascending',     // for funnel
                            data:seriesData['ctr']
                        }
                    ]
                });
                this.loading = false;
            });

            window.Loading.hide();
        },

        methods : {
            onSearch(){
                this.loading = true;
                let range = this.dateRange;
                API.user(range[0] ,range[1]).then((k) => {
                    myChart.setOption(k);
                    this.loading = false;
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
        margin-top: 83px;
        .chart-main{
            margin-left:20px;
        }
    }
</style>