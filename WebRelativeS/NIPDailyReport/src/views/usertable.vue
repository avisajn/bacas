<template>
    <layout-main>
        <query-layout slot="main" showmore="true" top="250">
            <div slot="condition" class="condition">  
                <span class="title">用户数据统计 - 表格</span>
                <div class="checkpanel">
                    <Radio-group class="radio-panel" :model.sync="select_mode">
                        <Radio value="mode1"> <span>All</span> </Radio>
                        <Radio value="mode2"> <span>Custom</span> </Radio>
                    </Radio-group>
                    <Checkbox-group v-if="select_mode=='mode2'" :model.sync="mode2.checked" style="display:inline-block;" @on-change="">
                        <Checkbox 
                            v-for="item in mapping" 
                            :value="item.key" 
                            :style="{color:item.color}"
                        >{{item.text}}</Checkbox>
                    </Checkbox-group>
                </div>
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
                <i-button type="primary" icon="ios-search" @click="onSearch">搜索</i-button>
                <i-button type="success" icon="ios-search" @click="onExport">导出</i-button>
            </div>
            <div slot="conditionMore">
                <i-form v-ref:form-inline :label-width="120" class="condition-more-panel" :model="param">
                    <Row>
                        <i-col span="8">
                            <Form-item label="categoryid:"> 
                                <i-input :value.sync="param.categoryid" class="more-input"></i-input> 
                            </Form-item>
                        </i-col>
                        <i-col span="8">
                            <Form-item label="mediaid"> 
                                <i-input :value.sync="param.mediaid" class="more-input"></i-input> 
                            </Form-item>
                        </i-col>
                        <i-col span="8">
                            <Form-item label="clickindex"> 
                                <i-input :value.sync="param.clickindex" class="more-input"></i-input> 
                            </Form-item>
                        </i-col>
                    </Row>
                    <Row>
                        <i-col span="8">
                            <Form-item label="requestcategoryid"> 
                                <i-input :value.sync="param.requestcategoryid" class="more-input"></i-input> 
                            </Form-item>
                        </i-col>
                        <i-col span="8">
                            <Form-item label="newstype"> 
                                <i-input :value.sync="param.newstype" class="more-input"></i-input> 
                            </Form-item>
                        </i-col>
                    </Row>
                    <Row>
                        <i-col span="24">
                            <Form-item label="group by" style="margin-right:22px;"> 
                                <i-select :model.sync="param.groupby" filterable multiple >
                                    <i-option v-for="item in newsTypeList" :value="item.value">{{ item.label }}</i-option>
                                </i-select>
                            </Form-item>
                        </i-col>
                    </Row>
                    <Row>
                        <i-col span="24">
                            <Form-item label="tag" style="margin-right:22px;"> 
                                <i-select :model.sync="param.tag" filterable multiple style="max-height:50px;">
                                    <i-option v-for="item in tagData" :value="item.value">{{ item.label }}</i-option>
                                </i-select>
                            </Form-item>
                        </i-col>
                    </Row>
                </i-form>

            </div>
            <div slot="panel" class="tables-panel">
                <i-table 
                    v-if="!loading" 
                    :columns="columns" 
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

    let today = window.lastDate;
    let startDay = window.startDay;
    const earlyDate = window.earlyDay;
    const overData = Date.now() - 86400000;
    let _config = window.config;
    const tbColumns = [
        // {title: 'up', key: 'up' ,sortable: 'custom'},
        // {title: 'down', key: 'down' ,sortable: 'custom'},
        {title: 'impression', key: 'present' ,sortable: 'custom'},
        {title: 'click', key: 'click' ,sortable: 'custom'},
        {title: 'ctr', key: 'ctr' ,sortable: 'custom'},
    ];
    const columnsMapping = {
        'date' : 'left(date, 8)' ,
        'categoryid' : 'categoryid',
        'tag' : 'tag',
        'clickindex' : 'click_index',
        'requestcategoryid' : 'requestcategoryid',
        'newstype' : 'newstype',
        'mediaid' : 'mediaid'
    }
    let myChart = null;
    export default {
        data(){
            return {
                param : {
                    dateRange: [startDay, today],
                    categoryid : '',
                    tag : [],
                    clickindex : '',
                    requestcategoryid : '',
                    newstype : '',
                    mediaid : '',
                    groupby : [],
                },

                select_mode : 'mode1',
                mode2 : {
                    checked : ['RelativeNews'],
                },

                mapping : [
                    { key:'RelativeNews'    , text: 'RelativeNews'    , color:'#333'}
                ],

                tagData : [
                    {value:"4Paradigm:Content", label:"4Paradigm:Content"},
                    {value:"4Paradigm:FAVOR", label:"4Paradigm:FAVOR"},
                    {value:"4Paradigm:Fresh", label:"4Paradigm:Fresh"},
                    {value:"4Paradigm:FunnyPictures", label:"4Paradigm:FunnyPictures"},
                    {value:"4Paradigm:Joke", label:"4Paradigm:Joke"},
                    {value:"4Paradigm:Location", label:"4Paradigm:Location"},
                    {value:"4Paradigm:Predict_Hot", label:"4Paradigm:Predict_Hot"},
                    {value:"4Paradigm:Random", label:"4Paradigm:Random"},
                    {value:"4Paradigm:TAG", label:"4Paradigm:TAG"},
                    {value:"4Paradigm:TAG-Log", label:"4Paradigm:TAG-Log"},
                    {value:"4Paradigm:Video", label:"4Paradigm:Video"},
                    {value:"4Paradigm:VideoInFeed", label:"4Paradigm:VideoInFeed"},
                    {value:"4Paradigm:VideoTagInFeed", label:"4Paradigm:VideoTagInFeed"},
                    {value:"4Paradigm_NewUser:Content", label:"4Paradigm_NewUser:Content"},
                    {value:"4Paradigm_NewUser:FAVOR", label:"4Paradigm_NewUser:FAVOR"},
                    {value:"4Paradigm_NewUser:Fresh", label:"4Paradigm_NewUser:Fresh"},
                    {value:"4Paradigm_NewUser:Location", label:"4Paradigm_NewUser:Location"},
                    {value:"4Paradigm_NewUser:Predict_Hot", label:"4Paradigm_NewUser:Predict_Hot"},
                    {value:"BACKUP_HOT", label:"BACKUP_HOT"},
                    {value:"COMPOSITE:Collaborate-TAG", label:"COMPOSITE:Collaborate-TAG"},
                    {value:"COMPOSITE:Content", label:"COMPOSITE:Content"},
                    {value:"COMPOSITE:FAVOR", label:"COMPOSITE:FAVOR"},
                    {value:"COMPOSITE:Fresh", label:"COMPOSITE:Fresh"},
                    {value:"COMPOSITE:FunnyPictures", label:"COMPOSITE:FunnyPictures"},
                    {value:"COMPOSITE:Joke", label:"COMPOSITE:Joke"},
                    {value:"COMPOSITE:Location", label:"COMPOSITE:Location"},
                    {value:"COMPOSITE:Predict_Hot", label:"COMPOSITE:Predict_Hot"},
                    {value:"COMPOSITE:Promotion", label:"COMPOSITE:Promotion"},
                    {value:"COMPOSITE:Random", label:"COMPOSITE:Random"},
                    {value:"COMPOSITE:TAG", label:"COMPOSITE:TAG"},
                    {value:"COMPOSITE:TAG-Log", label:"COMPOSITE:TAG-Log"},
                    {value:"COMPOSITE:TAG-Relative", label:"COMPOSITE:TAG-Relative"},
                    {value:"COMPOSITE:UGC", label:"COMPOSITE:UGC"},
                    {value:"COMPOSITE:Video", label:"COMPOSITE:Video"},
                    {value:"COMPOSITE:VideoInFeed", label:"COMPOSITE:VideoInFeed"},
                    {value:"COMPOSITE:VideoTagInFeed", label:"COMPOSITE:VideoTagInFeed"},
                    {value:"COMPOSITE:Weighted_Predict_Hot", label:"COMPOSITE:Weighted_Predict_Hot"},
                    {value:"COMPOSITE_NewUser:Content", label:"COMPOSITE_NewUser:Content"},
                    {value:"COMPOSITE_NewUser:FAVOR", label:"COMPOSITE_NewUser:FAVOR"},
                    {value:"COMPOSITE_NewUser:Fresh", label:"COMPOSITE_NewUser:Fresh"},
                    {value:"COMPOSITE_NewUser:Location", label:"COMPOSITE_NewUser:Location"},
                    {value:"COMPOSITE_NewUser:Predict_Hot", label:"COMPOSITE_NewUser:Predict_Hot"},
                    {value:"COMPOSITE_NewUser:UGC", label:"COMPOSITE_NewUser:UGC"},
                    {value:"COMPOSITE_NewUser:Weighted_Predict_Hot", label:"COMPOSITE_NewUser:Weighted_Predict_Hot"},
                    {value:"RelativeNews:Hot", label:"RelativeNews:Hot"},
                    {value:"RelativeNews:Relative", label:"RelativeNews:Relative"},
                    {value:"SEARCH", label:"SEARCH"},
                    {value:"Trending_News", label:"Trending_News"},
                ],
                
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
                newsTypeList : [
                    {value: 'date' , label: 'date'},
                    {value: 'categoryid' , label: 'categoryid'},
                    {value: 'clickindex' , label: 'clickindex'},
                    {value: 'tag' , label: 'tag'},
                    {value: 'requestcategoryid' , label: 'requestcategoryid'},
                    {value: 'newstype' , label: 'newstype'},
                    {value: 'mediaid' , label: 'mediaid'},
                ],
                columns: tbColumns,
                dataAll: [],    // 所有的数据，当数据多的时候，需要从dataAll中获取数据
                dataTable : [], // 展示给table的数据
                loading : false ,
                total : 0,  // 总条数
                current : 1,
                pagesize : 100,
                sortableData : {} , // 排序后的数据
            }
        },

        ready(){
            window.Loading.hide();
        },

        methods : {
            onDateChange(d){
                this.param.dateRange = d;
            },
            onSearch(){
                this.loading = true;
                API.userBaseDataQuery(this.getParam()).then((k) => {
                    this.dataAll = k;
                    this.total = k.length;
                    let narr = JSON.parse(JSON.stringify(tbColumns));
                    const param = this.param;
                    param.groupby.map((k ,i) => {
                        narr.splice(i, 0, {title: k, key: columnsMapping[k]});  
                        if(k == 'categoryid'){
                            narr.splice(i, 0, {title: 'CategoryName', key: 'CategoryName'});
                        }
                    })

                    this.columns = narr;
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

            onExport(){
                if(this.dataAll.length <= 0){
                    return;
                }
                const range = this.param.dateRange;
                const title = moment(range[0]).format('YYYYMMDD')+'~'+moment(range[1]).format('YYYYMMDD');
                this.$refs.table.exportCsv({
                    filename: title,
                    columns: this.columns,
                    data: this.dataAll
                });
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

            getParam(){
                const _param = this.param;
                const range = _param.dateRange;
                console.log('range:',range);
                let with_relative = 0;
                let param = {};
                const mode = this.select_mode;  // 如果模式为1的话
                if(mode == 'mode2'){
                    const checked = this.mode2.checked;
                    for(let i=0,len=checked.length;i<len;i++){
                        if(checked[i] == 'RelativeNews'){
                            param['with_relative'] = 1;
                        }
                    }
                    if(!param['with_relative']) param['with_relative'] = -1;
                }else{
                    param['with_relative'] = 0;
                }
                
                
                param['daterange'] = moment(range[0]).format('YYYY-MM-DD')+' - '+moment(range[1]).format('YYYY-MM-DD');
                if(_param["categoryid"]) param['categoryid'] = _param["categoryid"];
                if(_param["clickindex"]) param['clickindex'] = _param["clickindex"];
                if(_param["tag"]) param['tag'] = _param["tag"].join(',');
                if(_param["requestcategoryid"]) param['requestcategoryid'] = _param["requestcategoryid"];
                if(_param["newstype"]) param['newstype'] = _param["newstype"];
                if(_param["mediaid"]) param['mediaid'] = _param["mediaid"];
                if(_param["groupby"] && _param["groupby"].length > 0) param['groupby'] = _param["groupby"];
                console.log(param);
                return param;
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
        .checkpanel{
            position: absolute;
            left: 150px;
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