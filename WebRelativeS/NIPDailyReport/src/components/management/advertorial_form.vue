<template>    
    <Card class="feed-form">
        <i-form :model="formItem" :label-width="80">
            <Row>
                <i-col span="18">
                    <Form-item label="类型：">
                        <Checkbox-group @on-change="onTypeChange" :model.sync="type" style="width:220px;display:inline-block;">
                            <Checkbox value="Standard" disabled>Standard</Checkbox>
                            <Checkbox value="Promote" :disabled="info.imdisabled">Promote</Checkbox>
                            <Checkbox value="Push">Push</Checkbox>
                        </Checkbox-group>
                        ( CTR: {{info.ctr}}% <span>｜</span>  Impression : {{info.impression}}  <span>｜</span> Clicks : {{info.clicks}}   )
                    </Form-item>
                </i-col>
                <i-col span="6">
                    <Form-item label="新闻：">
                        <i-input :value.sync="formItem.newId" readonly >
                            <i-button @click="onShowNewsModal" slot="append" icon="ios-search">选择</i-button>
                        </i-input>
                    </Form-item>
                </i-col>
            </Row>
            <Row>
                <i-col span="11">
                    <Form-item label="时间范围：">
                        <Date-picker 
                            :value.sync="formItem.dateRange" 
                            type="datetimerange" 
                            format="yyyy-MM-dd HH:mm:ss" 
                            style="width: 300px;"></Date-picker>
                        <span>
                    </Form-item>
                </i-col>

                <i-col span="7">
                    <Form-item label="推送时间：">
                        <Date-picker 
                            :value.sync="formItem.pushdate" 
                            v-if="!info.showtime"
                            type="date" 
                            format="yyyy-MM-dd" 
                            style="width: 160px;"></Date-picker>

                        <Date-picker 
                            :value.sync="formItem.pushdatetime" 
                            v-if="info.showtime"
                            format="yyyy-MM-dd HH"
                            type="datetime" 
                            style="width: 160px;"></Date-picker>
                    </Form-item>
                </i-col>
                 <i-col span="6">
                    <Form-item label="Ses:">
                        <Checkbox-group :model.sync="formItem.ses_filter">
                            <Checkbox value="1">A</Checkbox>
                            <Checkbox value="2">B</Checkbox>
                            <Checkbox value="3">C</Checkbox>
                            <Checkbox value="4">D</Checkbox>
                        </Checkbox-group>
                    </Form-item>
                </i-col>
            </Row>

            <Row>
               
                <i-col span="8">
                    <Form-item label="Age:">
                        <Checkbox-group :model.sync="formItem.age_filter">
                            <Checkbox value="1">0-25</Checkbox>
                            <Checkbox value="2">25-35</Checkbox>
                            <Checkbox value="3">35-50</Checkbox>
                            <Checkbox value="4">50+</Checkbox>
                        </Checkbox-group>
                    </Form-item>
                </i-col>
                <i-col span="5">
                    <Form-item label="Gender:">
                        <Checkbox-group :model.sync="formItem.gender_filter">
                            <Checkbox value="1">Male</Checkbox>
                            <Checkbox value="2">FeMale</Checkbox>
                        </Checkbox-group>
                    </Form-item>
                </i-col>
                <i-col span="11">
                    <Form-item label="Location:">
                        <i-select :model.sync="formItem.city_filter" multiple>
                            <i-option v-for="item in locationData" :value="item.Admin1Code">{{ item.Name1 }}</i-option>
                        </i-select>
                    </Form-item>
                </i-col>


            </Row>
            
            <Row>
                <i-col span="24" style="text-align:center;">
                    <i-button type="primary" @click="formSubmit">提交</i-button>
                    <i-button type="ghost" @click="reset" style="margin-left: 8px">重置</i-button>
                </i-col>
            </Row>
        </i-form>

        <Modal
            :visible.sync="newsList.modal"
            width="700"
            class="modal-no-foot"
            title="选择要推送的新闻">
                <i-form :label-width="130">
                    <Form-item label="新闻ID或标题关键字:">
                        <i-input :value.sync="newsList.key" style="width:300px;">
                            <i-button @click="onNewsSearch" slot="append" icon="ios-search">选择</i-button>
                        </i-input>
                    </Form-item>
                </i-form>

                <div class="tb-list">
                    <i-table 
                        :content="self"
                        size="small"  
                        v-if="!newsList.loading" 
                        :columns="newsList.columns" 
                        :data="newsList.dataCurrent"></i-table>
                    <div style="margin: 10px;overflow: hidden">
                        <div style="float: right;">
                            <Page size="small" :current="newsList.page" :total="newsList.total" show-elevator @on-change="getNewsPage"></Page>
                        </div>
                    </div>
                    <Spin size="large" fix v-if="newsList.loading"></Spin>
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
        props : ['closeModal' ,'data'],
        data () {
            return {
                self : this,
                type: ['Standard'],
                locationData : [{"Admin1Code":"ID.26","Name1":"Sumatra Utara","Name2":"North Sumatra","UnknownCode":"1213642"},{"Admin1Code":"ID.01","Name1":"Aceh","Name2":"Aceh","UnknownCode":"1215638"},{"Admin1Code":"ID.10","Name1":"Yogyakarta","Name2":"Yogyakarta","UnknownCode":"1621176"},{"Admin1Code":"ID.32","Name1":"Sumatra Selatan","Name2":"","UnknownCode":"South Sumatra"},{"Admin1Code":"ID.24","Name1":"Sumatra Barat","Name2":"West Sumatra","UnknownCode":"1626197"},{"Admin1Code":"ID.31","Name1":"Sulawesi Utara","Name2":"North Sulawesi","UnknownCode":"1626229"},{"Admin1Code":"ID.22","Name1":"Sulawesi Tenggara","Name2":"Southeast Sulawesi","UnknownCode":"1626230"},{"Admin1Code":"ID.21","Name1":"Sulawesi Tengah","Name2":"","UnknownCode":"Central Sulawesi"},{"Admin1Code":"ID.38","Name1":"Sulawesi Selatan","Name2":"South Sulawesi","UnknownCode":"1626232"},{"Admin1Code":"ID.37","Name1":"Riau","Name2":"Riau","UnknownCode":"1629652"},{"Admin1Code":"ID.18","Name1":"Nusa Tenggara Timur","Name2":"East Nusa Tenggara","UnknownCode":"1633791"},{"Admin1Code":"ID.17","Name1":"Nusa Tenggara Barat","Name2":"West Nusa Tenggara","UnknownCode":"1633792"},{"Admin1Code":"ID.28","Name1":"Maluku","Name2":"Maluku","UnknownCode":"1636627"},{"Admin1Code":"ID.15","Name1":"Lampung","Name2":"Lampung","UnknownCode":"1638535"},{"Admin1Code":"ID.14","Name1":"Kalimantan Timur","Name2":"East Kalimantan","UnknownCode":"1641897"},{"Admin1Code":"ID.13","Name1":"Kalimantan Tengah","Name2":"Central Kalimantan","UnknownCode":"1641898"},{"Admin1Code":"ID.12","Name1":"Kalimantan Selatan","Name2":"South Kalimantan","UnknownCode":"1641899"},{"Admin1Code":"ID.11","Name1":"Kalimantan Barat","Name2":"West Kalimantan","UnknownCode":"1641900"},{"Admin1Code":"ID.08","Name1":"Jawa Timur","Name2":"East Java","UnknownCode":"1642668"},{"Admin1Code":"ID.07","Name1":"Jawa Tengah","Name2":"Central Java","UnknownCode":"1642669"},{"Admin1Code":"ID.30","Name1":"Jawa Barat","Name2":"West Java","UnknownCode":"1642672"},{"Admin1Code":"ID.05","Name1":"Jambi","Name2":"Jambi","UnknownCode":"1642856"},{"Admin1Code":"ID.04","Name1":"Jakarta","Name2":"Jakarta","UnknownCode":"1642907"},{"Admin1Code":"ID.36","Name1":"Papua","Name2":"Papua","UnknownCode":"1643012"},{"Admin1Code":"ID.03","Name1":"Bengkulu","Name2":"Bengkulu","UnknownCode":"1649147"},{"Admin1Code":"ID.02","Name1":"Bali","Name2":"Bali","UnknownCode":"1650535"},{"Admin1Code":"ID.33","Name1":"Banten","Name2":"Banten","UnknownCode":"1923045"},{"Admin1Code":"ID.34","Name1":"Gorontalo","Name2":"Gorontalo","UnknownCode":"1923046"},{"Admin1Code":"ID.35","Name1":"Kepulauan Bangka-Belitung","Name2":"Bangka-Belitung Islands","UnknownCode":"1923047"},{"Admin1Code":"ID.29","Name1":"Maluku Utara","Name2":"North Maluku","UnknownCode":"1958070"},{"Admin1Code":"ID.39","Name1":"Papua Barat","Name2":"West Papua","UnknownCode":"1996549"},{"Admin1Code":"ID.41","Name1":"Sulawesi Barat","Name2":"West Sulawesi","UnknownCode":"1996550"},{"Admin1Code":"ID.40","Name1":"Kepulauan Riau","Name2":"Riau Islands","UnknownCode":"1996551"},{"Admin1Code":"ID.42","Name1":"Kalimantan Utara","Name2":"North Kalimantan","UnknownCode":"8604684"}],
                info : {
                    ctr : 10 ,
                    impression : 100000 ,
                    clicks : 10000,
                    imdisabled : false,
                    showtime : false,
                },
                formItem: {
                    newId : '',
                    dateRange : '',
                    pushdatetime : '',
                    pushdate : '',
                    categoryId : '',
                    ses_filter : [],
                    age_filter : [],
                    gender_filter : [],
                    city_filter : [],
                },
                newsList : {
                    key : '',
                    modal : false ,
                    loading : false,
                    total : 0,
                    page : 1,
                    dataAll : [],
                    dataCurrent : [],
                    columns :  [
                        {title: 'newId', key: 'newId' ,width:90},
                        {title: 'title', key: 'title'},
                        {title: 'CategoryName', key: 'CategoryName' ,width:150},
                        {title: '-', key: 'newId' ,width:80,render(r){
                            return `<i-button type="info" size="small" @click="onSelectNews('${r.newId}' ,'${r.categoryId}')">选择</i-button>`;
                        }},
                    ],
                }
            }
        },
        ready(){
        },
        methods: {
            formSubmit(){
                const items = this.formItem;
                const type = this.type ;
                if(!items.newId){
                    this.$Notice.error({title: '需要选择一个newId'});
                    return;
                }

                const strType = type.join('');
                if(!items.dateRange || !items.dateRange[0] || !items.dateRange[1]){
                   this.$Notice.error({title: '需要选择时间范围'}); 
                   return;
                }

                if(!items.dateRange || !items.dateRange[0] || !items.dateRange[1]){
                   this.$Notice.error({title: '需要选择时间范围'}); 
                   return;
                }

                let pushdt = '';
                // 选择
                if(strType.indexOf('Push') == -1){  // 没有
                    // if(!items.pushdate){
                    //     this.$Notice.error({title: '需要选择推送日期，精确到天'}); 
                    //     return;
                    // }else{
                        pushdt = items.pushdate || '';
                    // }
                }else{
                    if(!items.pushdatetime){
                        this.$Notice.error({title: '需要选择推送日期，精确到小时'}); 
                        return;
                    }else{
                        pushdt = items.pushdatetime;
                    }
                }
                if(pushdt) pushdt = moment(pushdt).format('YYYY-MM-DD HH:mm:ss.SSS')+'+07:00';
                const categoryId = items.categoryId;
                const param = {
                    PushTime : pushdt,
                    NewsId : items.newId,
                    CategoryId : categoryId.indexOf(',') > 0 ? categoryId.split(',') : categoryId,
                    Start : moment(items.dateRange[0]).format('YYYY-MM-DD HH:mm:ss.SSS')+'+07:00',
                    End : moment(items.dateRange[1]).format('YYYY-MM-DD HH:mm:ss.SSS')+'+07:00',
                    Promote : (strType.indexOf('Promote') != -1 ),
                    Push : (strType.indexOf('Push') != -1 ),
                    SesFilter : items.ses_filter.join(',') ,
                    AgeFilter : items.age_filter.join(',') ,
                    GenderFilter : items.gender_filter.join(',') ,
                    CityFilter : items.city_filter.join(',') ,

                }
                const msg = this.$Message.loading('提交中...', 0);
                console.log('parapM:::' ,param);
                // return;
                let country = '';
                let timeSub = '';
                if(window.lan == 'id'){
                    country = 'id';
                    timeSub = '+07:00';
                }else{
                    // 判断巴西时区
                    country = 'br';
                    timeSub = Util.getBxTimeCode();
                }


                API.advertorial.submit(param ,country).then((e) => {
                    this.$Notice.success({title: '提交成功！'});
                    msg();
                },(e) => {
                    this.$Notice.error({title: '提交失败！'});
                    msg();
                })
            },
            onTypeChange(){
                // a. Standard: CTR: 10%, Impression = 100000, Clicks = 10000
                // b. Standard + Promote: CTR: 8%, Impression = 312500, Clicks = 25000
                // c. Standard + Promote + Push: CTR: 8%, Impression = 1000000, Clicks = 80000
                // d. Standard  + Push: CTR: 8%, Impression = 1000000-312500, Clicks = 80000-25000
                this.info.imdisabled = false;
                this.info.showtime = false;
                let ctr = 10;
                let impression = 100000;
                let clicks = 10000;
                const type = this.type.join('');
                let proin = type.indexOf('Promote') != -1;
                let puin = type.indexOf('Push') != -1;
                if(puin && proin){
                    ctr = 8;
                    impression =  1000000;
                    clicks = 80000;
                    this.info.showtime = true;
                }else{
                    if(proin || puin){
                        if(proin){
                            ctr = 8;
                            impression =  312500;
                            clicks = 25000;
                        }

                        if(puin){
                            // this.info.imdisabled = true;
                            // this.type = ['Standard' ,'Promote' ,'Push'];
                            this.info.ctr = 8;
                            // this.info.impression =  1000000;
                            this.info.impression =  1000000-312500;
                            // this.info.clicks = 80000;
                            this.info.clicks = 80000-25000;
                            this.info.showtime = true;
                            return;
                        }
                    }else{
                        ctr = 10;
                        impression =  100000;
                        clicks = 10000;
                    }
                }
                this.info.ctr = ctr;
                this.info.impression = impression;
                this.info.clicks = clicks;
            },
            reset(){
                this.type = ['Standard'];
                this.formItem.newId = '';
                this.formItem.dateRange = [];
                this.formItem.pushdatetime = '';
                this.formItem.pushdate = '';
                this.info.ctr = 10 ;
                this.info.impression = 100000 ;
                this.info.clicks = 10000;
                this.info.imdisabled = false;
                this.info.showtime = false;
            },
            onShowNewsModal(){
                this.newsList.modal = true;
                this.getNewsPage(1);
            },

            onNewsSearch(){
                const d = this.data.data;
                const key = this.newsList.key;
                if(!key){
                    this.newsList.dataAll = d;
                    this.newsList.total = this.data.totalCount;
                    this.getNewsPage(1);
                    return;
                }
                let _tid = '';
                let _tle = '';
                let data = [];
                let isAdd = false;
                const reg = new RegExp(key,"ig");
                d.map((k) => {
                    isAdd = false;
                    if((k.newId+"").indexOf(key) != -1){
                        isAdd = true;
                    }
                    if(k.title.indexOf(key) != -1){
                        isAdd = true;
                        _tle = k.title.replace(reg ,'<span class="light">'+key+'</span>');
                    }else{
                        _tle = k.title;
                    }
                    if(isAdd){
                        data.push({
                            newId : k.newId,
                            title : _tle ,
                            CategoryName : k.CategoryName
                        });
                    }
                });
                this.newsList.dataAll = data;
                this.newsList.total = data.length;
                this.getNewsPage(1);
            },

            getNewsPage(page){
                page  = page || 1;
                this.newsList.page = page;
                const data = this.newsList.dataAll;
                let res = [];
                for(let i=(page-1)*10;i<page*10;i++){
                    if(!data[i]){break; }
                    res.push(data[i]);
                }
                this.newsList.dataCurrent = res;
            },

            onSelectNews(news_id, categoryId){
                this.newsList.modal = false;
                this.formItem.newId = news_id;
                this.formItem.categoryId = categoryId;
            }
        },
        watch : {
            data(n){
                console.log('n:',n);
                this.newsList.total = n.totalCount;
                this.newsList.dataAll = n.data;
            },
        }
    }
</script>
<style scoped lang="less">
    .feed-form{
        padding:30px;
        margin:50px;
        .tb-list{
            position: relative;
            margin-top: 20px;
            min-height: 100px;
        }
        .ctr-info{

        }
    }
</style>

