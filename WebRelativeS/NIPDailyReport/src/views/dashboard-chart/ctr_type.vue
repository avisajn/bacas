<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">类别点击率统计</span>
                <div class="checkpanel">
                    <Checkbox :checked.sync="comparison" @on-change="chartItemChange">比对</Checkbox>
                    <Radio-group class="radio-panel" :model.sync="select_mode" @on-change="chartItemChange" >
                        <Radio value="mode1"> <span>单TAG数据</span> </Radio>
                        <Radio value="mode2"> <span>多TAG对比</span> </Radio>
                    </Radio-group>
                    <Checkbox-group v-if="select_mode=='mode1'" :model.sync="mode1.checked" style="display:inline-block;" @on-change="chartItemChange">
                        <Checkbox 
                            v-for="item in mapping" 
                            :value="item.key" 
                            :style="{color:item.color}"
                        >{{item.text}}</Checkbox>
                    </Checkbox-group>

                    <Radio-group v-if="select_mode=='mode2'" :model.sync="mode2.checked" style="display:inline-block;" @on-change="chartItemChange">
                        <Radio 
                            v-for="item in mapping" 
                            :value="item.key" 
                        >{{item.text}}</Radio>
                    </Radio-group>
                </div>

                <i-select 
                    v-if="select_mode=='mode1'" 
                    :model.sync="mode1.columnType" 
                    filterable
                    @on-change="chartItemChange" 
                    style="width:200px;text-align:left">
                    <i-option v-for="item in columnMapping"  :value="item.key" >{{item.text}}</i-option>
                </i-select>

                <i-select 
                    v-if="select_mode=='mode2'"
                    :model.sync="mode2.columnType" 
                    filterable 
                    multiple 
                    @on-change="chartItemChange" 
                    style="width:300px;text-align:left;max-height: 54px; overflow: auto;">
                    <i-option v-for="item in columnMapping"  :value="item.key" >{{item.text}}</i-option>
                </i-select>
                <Date-picker 
                    :value.sync="dateRange" 
                    format="yyyy/MM/dd" 
                    @on-change="onDateChange"
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
    
    import layoutMain from '../../components/layout';
    import queryLayout from '../../components/querylayout';
    import API from '../../libs/chartApi';
    import Util from '../../libs/util';
    import ChartUtil from '../../libs/chartUtil';
    import moment from 'moment';

    // 引入 ECharts 主模块
    import echarts from 'echarts';

    let today = window.lastDate;
    let startDay = window.startDay;
    let _config = window.config;

    const earlyDate = window.earlyDay;
    const overData = window.lastTime;

    let myChart = null;
    export default {
        data(){
            return {
                dateRange: [startDay, today],
                chartTitle : '',
                mapping : [
                    { key:'fetchCount'       , text: '展示数'       , color:'#993333'},
                    { key:'readCount'       , text: '阅读数'      , color:'#CCCC00'},
                    { key:'ctr'       , text: '点击率'      , color:'#663366'},
                ],
                columnMapping : [],
                comparison : false,
                select_mode : 'mode1',
                mode1 : {
                    checked : ['fetchCount'],
                    columnType : '',
                },
                mode2 : {
                    checked : 'fetchCount',
                    columnType : []
                },
                charts : {
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
            const c = Util.getQuery('c');
            if(c){this.mode1.columnType = c; this.mode2.columnType = [c]; }
            this.onSearch();
        },

        methods : {
            onDateChange(d){
                this.dateRange = d;
            },
            chartItemChange(){
                const mode = this.select_mode;
                if(mode == 'mode1'){
                    const checked = JSON.parse(JSON.stringify(this.mode1.checked));
                    if(checked.length == 3){
                        checked.splice(0,1);
                    }
                    this.mode1.checked = checked;
                }
                this.setOption();
            },

            async onSearch(){
                this.loading = true;
                let range = this.dateRange;
                const e = await API.newsCategoryCtr(range[0] ,range[1]);
                this.data = e.data;
                this.oldData = e.oldData;
                const {columnMapping ,first} = ChartUtil.getColumnMapping(e.data[0]);
                // this.columnMapping = columnMapping;
                this.columnMapping = Util.mergeArrayObject(this.columnMapping ,columnMapping);
                if(!this.mode1.columnType){
                    this.mode1.columnType = first;
                    this.mode2.columnType = [first];
                }
                this.chartTitle = e.title;
                this.setOption();
                this.loading = false;
            },

            setOption(){
                const mode = this.select_mode;
                const data = this.data;
                const oldData = this.oldData;
                const range = this.dateRange;
                
                const comparison = this.comparison;

                let title = this.chartTitle;
                let arr_legend = null;
                let tooltip = null;
                let returnData = null;
                if(title){
                    if(comparison){
                        title = title.join(' && ');
                    }else{
                        title = title[0];
                    }
                }

                let seriesData = null;
                let yAxisArr = [];

                if(mode == 'mode1'){
                    const nameMapping = this.mapping;
                    const checked = this[mode].checked;
                    arr_legend = ChartUtil.getArrayByChecked(checked ,nameMapping);
                    returnData = ChartUtil.getArrByKeyName(data ,oldData ,this.mode1.columnType);
                    seriesData = ChartUtil.getArrByKeyMapping(returnData._data ,returnData._oldData,arr_legend ,comparison);
                    tooltip = {"trigger": "axis",formatter : function (params) {    // 弹出层格式化
                        let res = params[0].name+':<br/>';
                        for (let i = 0, l = params.length ,n; i < l; i++) {
                            n = params[i].seriesName;
                            res += '<div>';
                            res += n + ' : ' + params[i].value;
                            if(n.indexOf('率') > 0 || n.indexOf('比例') > 0 || n.indexOf('占比') > 0){
                                res += '%';
                            }
                            res += '</div>';
                        }
                        return res;
                    }};
                    const yAxisMapping = {};
                    if(checked.length == 2){    // 两个元素，需要左右两列
                        nameMapping.map((k) => {
                            checked.map((j ,i) => {
                                if(j == k.key){
                                    yAxisMapping[k.text] = i;
                                    yAxisMapping[k.text+'(比对)'] = i;
                                    yAxisArr.push({"type": "value" ,scale: true ,name:k.text ,nameTextStyle:{color:k.color}})
                                }
                            })
                        })
                        seriesData.map((k ,i) => {
                            k.yAxisIndex = yAxisMapping[k.name];
                        })
                    }else{  // 正常一列
                        yAxisArr.push({"type": "value" ,scale: true});
                    }

                }else{
                    yAxisArr.push({"type": "value"});
                    arr_legend = ChartUtil.getArrayByChecked(this[mode].columnType ,this.columnMapping);
                    returnData = ChartUtil.getArrByKeyNames(data ,oldData ,this.mode2.columnType ,this[mode].checked);
                    seriesData = ChartUtil.getArrByKeyMapping(returnData._data ,returnData._oldData,arr_legend ,comparison);
                    tooltip = {"trigger": "axis" ,backgroundColor:'#FAFAFC' ,borderColor:'#ddd',borderWidth:1 ,formatter : function (params) {    // 弹出层格式化
                        let res = '<div style="color:black;">'+params[0].name+':</div>';
                        params = params.sort((v1 ,v2) => {
                            if(v1.value > v2.value) return -1;
                            return 1;
                        });
                        for (let i = 0, l = params.length ,n; i < l; i++) {
                            n = params[i].seriesName;
                            res += '<div style="color:'+params[i].color+';'+(i%2==0?'border-top:1px solid #eee;':'')+'">';
                            res += n + ' : ' + params[i].value;
                            if(n.indexOf('率') > 0 || n.indexOf('比例') > 0 || n.indexOf('占比') > 0){
                                res += '%';
                            }
                            res += '</div>';
                        }
                        return res;
                    }};
                }

                myChart.clear();
                myChart.setOption({
                    "title": {"text": title, "left": "center"},
                    "tooltip": tooltip,
                    "toolbox": {"feature": {"saveAsImage": {} } },
                    "grid": {"left": "5%", "right": "5%", "bottom": "5%", "top": "5%", "containLabel": true },
                    "xAxis": [
                        {
                            "type": "category",
                            "boundaryGap": false,
                            "data": ChartUtil.getDateRangeArray(range[0] ,range[1])
                        }
                    ],
                    "yAxis": yAxisArr,
                    "series": seriesData
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
            left: 120px;
            text-align: left;
            right: 0px;
            font-size: 16px;
            top: 4px;
            .radio-panel{
                border: 1px dashed #bebebe;
                padding-left: 10px;
                margin-right: 10px;
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