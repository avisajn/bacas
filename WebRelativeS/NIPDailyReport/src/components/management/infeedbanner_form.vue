<template>    
    <Card class="feed-form">
        <i-form :model="formItem" :label-width="80">
            <Row>
                <i-col span="7">
                    <Form-item label="Type">
                        <Radio-group :model.sync="type">
                            <Radio value="News">News</Radio>
                            <Radio value="Trending">Trending</Radio>
                        </Radio-group>
                    </Form-item>
                </i-col>
                <i-col span="17">
                    <Form-item label="TargetUrl">
                        <i-input :value.sync="formItem.keyId" placeholder="newsId" v-if="type == 'News'">
                            <i-select :model.sync="formItem.targetBase" slot="prepend" style="width:160px;">
                                <i-option value="http://baca.co.id/">http://baca.co.id/</i-option>
                                <i-option value="http://cennoticias.com/">http://noticias.cennoticias.com/</i-option>
                            </i-select>
                        </i-input>
                        <i-input :value.sync="formItem.keyId" readonly v-if="type == 'Trending'" >
                            <i-select :model.sync="formItem.targetBase" slot="prepend" style="width:160px;">
                                <i-option value="http://baca.co.id/">http://baca.co.id/trending/</i-option>
                                <i-option value="http://cennoticias.com/">http://noticias.cennoticias.com/trending/</i-option>
                            </i-select>
                            <i-button @click="onShowTrendingModal" slot="append" icon="ios-search">Select</i-button>
                        </i-input>
                    </Form-item>
                </i-col>
            </Row>

            <Row>
                <i-col span="12">
                    <Form-item label="ImageUrl">
                        <div class="upload-panel">
                            <input type="file" class="fileupload" id="uploadFile">
                            <!-- <div class="selectBox">
                                <Icon type="plus-round"></Icon>
                            </div> -->
                        </div>
                    </Form-item>
                </i-col>
                <i-col span="12" v-if="type == 'Trending'">
                    <Form-item label="Title" >
                        <i-input :value.sync="formItem.title" placeholder="title"></i-input>
                    </Form-item>
                </i-col>
            </Row>

            <Row>
                <i-col span="24">
                    <Form-item label="timeRange">
                        <Date-picker 
                            :value.sync="formItem.timeRange" 
                            type="datetimerange" 
                            format="yyyy-MM-dd HH:mm:ss" 
                            style="width: 300px;"></Date-picker>
                        <span>
                    </Form-item>
                </i-col>
            </Row>
            
            <Row>
                <i-col span="24" style="text-align:center;">
                    <i-button type="primary" @click="formSubmit">Submit</i-button>
                    <i-button type="ghost" @click="reset" style="margin-left: 8px">Reset</i-button>
                </i-col>
            </Row>
        </i-form>

        <Modal
            :visible.sync="trendingList.modal"
            width="700"
            class="modal-no-foot"
            title="Select Trending">
                Date:
                <Date-picker 
                    :value="trendingList.dateRange" 
                    format="yyyy-MM-dd" 
                    type="daterange" 
                    placement="bottom-end" 
                    @on-change="onSearchTrending"
                    placeholder="Date" 
                    style="width: 200px;display:inline-block;"
                ></Date-picker>
                <div class="tb-list">
                    <i-table 
                        :content="self"
                        size="small"  
                        v-if="!trendingList.loading" 
                        :columns="trendingList.columns" 
                        :data="trendingList.data"></i-table>
                    <Spin size="large" fix v-if="trendingList.loading"></Spin>
                </div>
        </Modal>
    </Card>
</template>
<script>
    import moment from 'moment';
    import API from '../../libs/api';
    import Util from '../../libs/util';
    const urlMapping = {
        id : 'http://baca.co.id/',
        br : 'http://cenoticias.com/'
    }
    const startDate = moment().subtract(7, 'days');
    const endDate = moment().add(1, 'days');

    export default {
        props : ['closeModal' ,'data' ,'rolesdata'],
        data () {
            return {
                self : this,
                type: 'News',
                formItem: {
                    targetBase : 'http://baca.co.id/',
                    keyId : '',
                    title : '',
                    timeRange : '',
                    new_news_id : '',
                },
                trendingList : {
                    modal : false ,
                    loading : false,
                    dateRange : [startDate ,endDate],
                    columns :  [
                        {title: 'Id', key: 'topic_id' , width:250},
                        {title: 'Title', key: 'title'},
                        {title: '-', key: 'title' ,render(r){
                            return `<i-button type="info" size="small" @click="onSelectTrending('${r.topic_id}')">Select</i-button>`;
                        }},
                    ],
                    data : []
                },
                historyData : [],
            }
        },
        ready(){
            let self = this;
            console.log('window.country:',window.lan);
            // API.getTrendingHistory().then((k) => {
            //     this.historyData = k;
            // })
        },
        methods: {

            formSubmit(){
                const items = this.formItem;
                const type = this.type ;
                const $file = document.getElementById('uploadFile');
                let targetBase = items.targetBase;
                if(!items.keyId){
                    this.$Notice.error({title: '当前选中的为'+type+'，需要'+(type == 'Trending'?'选择一个Trending Item':'填写NewsId')});
                    return;
                }
                if(type == 'Trending'){
                    targetBase+='trending/';
                    if(!items.title){
                        this.$Notice.error({title: '当前选中的为Trending，需要填写标题'});
                        return;
                    }
                }

                if(!items.timeRange || !items.timeRange[0] || !items.timeRange[1]){
                   this.$Notice.error({title: '需要选择时间范围，选择后必须单击确认'}); 
                   return;
                }
                const msg = this.$Message.loading('提交中...', 0);


                let country = '';
                let timeSub = '';
                if(targetBase.indexOf('baca.co.id') > 0){
                    country = 'id';
                    timeSub = '+07:00';
                }else{
                    // 判断巴西时区
                    country = 'br';
                    timeSub = Util.getBxTimeCode();
                }
                const self = this;
                var formSubmit = function(param){
                    var files = document.getElementById('uploadFile').files;
                    var formData = new FormData();
                    for (var key in files) {
                        if (files.hasOwnProperty(key) && files[key] instanceof File) {
                            formData.append(key, files[key] ,files[key].name);
                        }
                    }
                    for(var i in param){
                        formData.append(i ,param[i]);
                    }
                    API.dynamicBanner(formData ,country).then((e) => {
                        self.$Notice.success({title: '提交成功！'});
                        msg();
                    },(e) => {
                        self.$Notice.error({title: '提交失败！'});
                        msg();
                    })
                }
                
                let newId = items.keyId;
                let param = {
                    type : type ,
                    targetUrl : targetBase+newId,
                    start :  moment(items.timeRange[0]).format('YYYY-MM-DD HH:mm:ss.SSS')+timeSub,
                    end :  moment(items.timeRange[1]).format('YYYY-MM-DD HH:mm:ss.SSS')+timeSub,
                    title :  items.title,
                }
                if(type == 'Trending'){
                    param.targetUrl = targetBase+newId;
                }
                formSubmit(param);

                
            },
            reset(){
                this.type = 'News';
                this.formItem.targetBase = 'http://baca.co.id/';
                this.formItem.keyId = '';
                this.formItem.title = '';
                this.formItem.timeRange = '';
            },
            onShowTrendingModal(){
                this.trendingList.modal = true;
                this.onSearchTrending();
            },
            onSearchTrending(){
                this.trendingList.loading = true;
                let targetBase = this.formItem.targetBase;
                const dateRange = this.trendingList.dateRange;
                let country = 'br';
                if(targetBase.indexOf('baca.co.id') > 0){
                    country = 'id';
                }
                API.inFeedBanner.getTrendingList(dateRange[0] ,dateRange[1] ,country).then((d) => {
                    console.log('d:' ,d);
                    let newData = [];
                    const historyData = this.historyData;
                    if(historyData.length <= 0){
                        newData = d;
                    }else{
                        let over = {};
                        d.map((j) => {
                            historyData.map((k) => {
                                if(j.new_topic_id){
                                    if(j.topic_id == k.news_id && j.new_topic_id == k.new_news_id){
                                        over[j.topic_id] = true;
                                    }
                                }else{
                                    if(j.topic_id == k.news_id){
                                        over[j.topic_id] = true;
                                    }  
                                }
                            });
                        })
                        d.map((k) => {
                            if(!over[k.topic_id]){ newData.push(k); }
                        })
                    }

                    this.trendingList.data = newData;
                    this.trendingList.loading = false;
                } ,(e) => {
                    this.$Notice.error({title: '获取Trending接口出错！'});
                })
            },

            onSelectTrending(topic_id){
                this.trendingList.modal = false;
                const data = this.trendingList.data;
                let currentData = {};
                data.map((k) => {
                    if(k.topic_id == topic_id){
                        currentData = k;
                    }
                })
                this.formItem.keyId = topic_id;
                this.formItem.title = currentData.title;
                this.formItem.new_news_id = currentData.new_topic_id;
            }
        },
        watch : {
            type(n){
                this.formItem.keyId = '';
                if(n == 'News'){
                    this.formItem.title = '';
                }
            },
        }
    }
</script>
<style scoped lang="less">
    .feed-form{
        padding:50px;
        margin:50px;
        .tb-list{
            position: relative;
            margin-top: 20px;
            min-height: 100px;
        }
        .upload-panel{
            position:relative;
            
            height: 50px;
            .fileupload{
                opacity: 1;
                position:absolute;
                z-index:2;
                top:0px;
                left:0px;
                right:0px;
                bottom:0px;
            }
            .selectBox{
                position: absolute;
                z-index: 1;
                top: 0px;
                left: 0px;
                bottom: 0px;
                border: 1px solid #b3b3b3;
                width: 40px;
                height: 40px;
                text-align: center;
                line-height: 40px;
                font-size: 25px;
                border-style: dashed;
                border-radius: 1px;
                cursor:pointer;
            }
        }
    }
</style>

