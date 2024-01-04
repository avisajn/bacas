<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">REVENUE REPORTS</span>
                <Radio-group :model.sync="query.os">
                    <Radio value="all">
                        <Icon type="android-apps"></Icon>
                        <span>ALL</span>
                    </Radio>
                    <Radio value="ios">
                        <Icon type="social-apple"></Icon>
                        <span>IOS</span>
                    </Radio>
                    <Radio value="android">
                        <Icon type="social-android"></Icon>
                        <span>Android</span>
                    </Radio>
                </Radio-group>
                &nbsp;&nbsp;
                <i-select class="f-r"  :model.sync="query.country" style="width:100px;text-align:left;">
                    <i-option v-for="k in query.countryData" :value="k.value">{{ k.name }}</i-option>
                </i-select>
                &nbsp;&nbsp;
                <Date-picker 
                    :value.sync="query.dateRange" 
                    format="yyyy/MM/dd" 
                    :options="query.dateOptions" 
                    type="daterange" 
                    placement="bottom-end" 
                    placeholder="选择日期"
                    class="date" 
                    style="width: 200px">
                </Date-picker>
                <!-- <i-input :value.sync="user.queryKey" placeholder="用户名称" style="width: 150px"></i-input> -->
                <i-button type="primary" icon="ios-search" @click="onSearch(1)">搜索</i-button>
            </div>
            <div slot="panel" class="tables-panel">
                <i-table 
                    @on-sort-change="onSortChange" 
                    :content="self" 
                    :columns="table.columns" 
                    :data="table.data"
                ></i-table>
                <br/>
                <Page v-if="table.total > table.pageSize" :total="table.total" @on-change="onSearch" class="flr" :current="table.page"></Page>
                <Spin size="large" fix v-if="table.loading"></Spin>
            </div>
        </query-layout>
    </layout-main>
</template>
<script>
    import layoutMain from '../components/layout';
    import queryLayout from '../components/querylayout';
    // import userForm from '../components/user/user_form';
    // import userInfo from '../components/user/user_info';
    import Util from '../libs/util';
    import API from '../libs/api';
    import moment from 'moment';

    const today = window.lastDate;
    const startDay = window.startDay;
    export default {
        data(){
            return {

                self: this,
                query : {
                    dateRange: [startDay, today],
                    dateOptions : {
                        disabledDate (date) {
                            return date && date.valueOf() >= Date.now();
                        }
                    },
                    os : 'all',
                    country : 'all',
                    countryData : [
                        {name:'All Country',value:'all'},
                        {name:'AU',value:'au'},
                        {name:'BR',value:'br'},
                        {name:'CA',value:'ca'},
                        {name:'DE',value:'de'},
                        {name:'GB',value:'gb'},
                        {name:'ID',value:'id'},
                        {name:'JP',value:'jp'},
                        {name:'SG',value:'sg'},
                        {name:'US',value:'us'},
                    ],
                },



                queryKey : '',
                table : {
                    columns: [
                        {title: 'Date', key: 'date' ,sortable: 'custom'},
                        {title: 'Click', key: 'click' ,sortable: 'custom'},
                        {title: 'Conversion', key: 'conversion' ,sortable: 'custom'},
                        {title: 'Conversion/Click', key: 'cc' ,render(r){
                            return Util.getFixed(r.conversion/r.click*100)+'%';
                        }},
                        {title: 'Earn', key: 'earn' ,sortable: 'custom' ,render(r){
                            return '$'+Util.getFixed(r.earn/100);
                        }},
                    ],
                    data: [],
                    total : 0,
                    pageSize : 100,
                    showTotal : false,
                    loading : true,
                },
            }
        },

        ready(){
            window.Loading.hide();
            if(!window.logined){ return;}
            setTimeout(() => {
                this.onSearch();
            } ,200);
        },

        methods : {
            // 当选择列进行排序后
            onSortChange(o){
                const columnName = o.key;
                const order = o.order;  // desc ,esc ,normal
                if(columnName == 'date'){
                    this.sortByString(order);
                    return;
                }
                let arr = this.table.data;
                let _t1 = 0;
                let _t2 = 0;
                if(order == 'asc'){
                    this.table.data = arr.sort((v1 ,v2) => {
                        _t1 = parseFloat(v1[columnName]) || 0;
                        _t2 = parseFloat(v2[columnName]) || 0;
                        if(_t1 > _t2) return -1;
                        return 1;
                    });
                }else{
                    this.table.data = arr.sort((v1 ,v2) => {
                        _t1 = parseFloat(v1[columnName]) || 0;
                        _t2 = parseFloat(v2[columnName]) || 0;
                        if(_t1 > _t2) return 1;
                        return -1;
                    });
                }
            },
            sortByString(o){    // 根据字符串进行排序
                let arr = this.table.data;
                if(o == 'asc'){
                    this.table.data = arr.sort((v1 ,v2) => {
                       return v1['date'].localeCompare(v2['date'])
                    });
                }else{
                    this.table.data = arr.sort((v1 ,v2) => {
                        return v2['date'].localeCompare(v1['date'])
                    });
                }
            },



            onSearch(page){
                const { dateRange ,country ,os } = this.query;
                this.table.loading = true;
                API.adreport.getList({
                    country ,
                    os ,
                    traffic_source : window.userData.id,
                    datestart : moment(dateRange[0]).format('YYYY-MM-DD')  ,
                    dateend : moment(dateRange[1]).format('YYYY-MM-DD')
                }).then((k) => {
                    this.table.data = k;
                    this.table.total = k.length;
                    this.table.loading = false;
                } ,(r) => {
                    this.table.data = [];
                    this.table.total = 0;
                    this.table.loading = false;
                    this.$Message.error('获取接口出错了');
                })

            },

            closeModal(type){
                this.modal[type] = false;
            },
        },


        components : {
            layoutMain,
            queryLayout,

            // userForm,
            // userInfo
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
            color: #3091f2;
            display: inline-block;
            float: left;
            font-size: 15px;
            margin-top: 5px;
        }
    }
</style>