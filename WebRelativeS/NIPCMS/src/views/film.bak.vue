<template>
    <layout-main>
        <div slot="main" style="padding:10px;">
            <Tabs active-key="key2">
                <Tab-pane label="已经中奖的用户" key="key1" style="min-height:300px;">
                    <div class="condition clearfix">
                        <div style="float:right;">
                            选择日期：
                            <Date-picker 
                                size="small" 
                                :value.sync="prizeList.date"
                                type="date" 
                                format="yyyy-MM-dd" 
                                placeholder="选择日期" 
                                style="width: 200px;display:inline-block;"
                            ></Date-picker>
                            <i-button 
                                size="small" 
                                style="margin-left:10px;" 
                                type="primary"
                                @click="loadPrizeList"
                            >搜索</i-button>
                        </div>
                    </div>
                    <div style="margin-top:20px;position:relative;">
                        <i-table 
                            :content="self"
                            size="small"
                            :columns="prizeList.columns" 
                            :data="prizeList.data"
                        ></i-table>
                        <Spin size="large" fix v-if="prizeList.loading"></Spin>
                    </div>

                </Tab-pane>



                <Tab-pane label="用户战绩列表" key="key2" style="min-height:300px;">
                    <div class="condition clearfix">
                        <div style="float:left;">
                            <i-input size="small" :value.sync="userList.prize" style="width:200px;" placeholder="奖品名称"></i-input>
                            <i-button 
                                size="small" 
                                type="warning"
                                @click="setPrize"
                            >设置为中奖(共选中{{userList.checked.length}}个)</i-button>
                        </div>
                        <div style="float:right;">
                            选择日期：
                            <Date-picker 
                                size="small" 
                                :value.sync="userList.date"
                                type="date" 
                                format="yyyy-MM-dd" 
                                placeholder="选择日期" 
                                style="width: 200px;display:inline-block;"
                            ></Date-picker>
                            <i-button 
                                size="small" 
                                style="margin-left:10px;" 
                                type="primary"
                                @click="loadUserList"
                            >搜索</i-button>
                            <i-button 
                                size="small" 
                                style="margin-left:10px;" 
                                type="primary"
                                @click="exportAllUser"
                            >导出所有的用户</i-button>
                            <i-button 
                                size="small" 
                                style="margin-left:10px;" 
                                type="primary"
                                @click="exportStandingUser"
                            >导出战绩用户(留下战绩的用户)</i-button>

                        </div>
                    </div>
                    <div style="margin-top:20px;position:relative;">
                        <i-table 
                            :content="self"
                            size="small"
                            v-ref:table
                            :columns="userList.columns" 
                            :data="userList.data"
                            @on-selection-change="onSelect"
                        ></i-table>
                        <Spin size="large" fix v-if="userList.loading"></Spin>
                    </div>

                </Tab-pane>
            </Tabs>
        </div>
    </layout-main>
</template>
<script>
    
    import layoutMain from '../components/layout';
    import API from '../libs/api';
    import Util from '../libs/util';
    import moment from 'moment';

    const today = moment(new Date()).format('YYYY-MM-DD');

    export default {
        data(){
            return {
                self : this,
                prizeList : {
                    date : today,
                    columns: [
                        {title: '姓名', key: 'xm'},
                        {title: '手机号', key: 'sj'},
                        {title: '地址', key: 'ad'},
                        {title: '参与次数', key: 'cs'},
                        {title: '总用时', key: 'zys'},
                        {title: '胜率', key: 'sl'},
                        {title: '奖品', key: 'jp'},
                        {title: '设置时间', key: 'time' },
                    ],
                    data: [],
                    loading : false,
                },

                userList : {
                    date : today,
                    loading : false,
                    columns: [ 
                        {type: 'selection', width: 60, align: 'center'},
                        {title: '姓名', key: 'name' ,width:150},
                        {title: '手机号', key: 'phone' ,width:150},
                        {title: '地址', key: 'address' },
                        {title: '统计', key: 'cs' ,render(r){
                            return `<label class="tongji">共参加<span>${r.cs}</span>次PK，共用时<span>${r.zys}</span>秒，胜利<span>${r.win}</span>场，胜率<span>${r.winning}%</span></label>`;
                        }},
                    ],
                    prize : '',
                    checked : [],
                    data: []
                }
            }
        },

        ready(){
           window.Loading.hide();
        },

        methods : {

            // 导出所有用户
            async exportAllUser(){
                const msg = this.$Message.loading('正在加载中...', 0);
                const userList = await API.film_export.alluser();
                this.$refs.table.exportCsv({
                    filename: '所有用户列表',
                    columns: [
                        {"title": "用户key", "key": "k"},
                        // {"title": "姓名", "key": "name"},
                        // {"title": "手机号", "key": "phone"},
                        // {"title": "地址", "key": "address"},
                        // {"title": "创建时间", "key": "addtime"},
                    ],
                    data: userList
                });
                msg();
            },
            // 导出战绩用户
            async exportStandingUser(){
                const msg = this.$Message.loading('正在加载中...', 0);
                const userList = await API.film_export.standingalluser();
                this.$refs.table.exportCsv({
                    filename: '战绩用户列表',
                    columns: [
                        {"title": "地址", "key": "address"},
                        {"title": "次数", "key": "cs"},
                        {"title": "姓名", "key": "name"},
                        {"title": "手机号", "key": "phone"},
                        {"title": "赢的次数", "key": "win"},
                        {"title": "胜率", "key": "winning"},
                        {"title": "总用时", "key": "zys"},
                    ],
                    data: userList
                });
                msg();
            },

            async loadPrizeList(){
                const date = this.prizeList.date;
                this.prizeList.loading = true;
                const newdate = moment(date).format('YYYY-MM-DD');
                const res = await API.film.queryprize(newdate);
                this.prizeList.data = res;
                this.prizeList.loading = false;
            },

            async loadUserList(){
                const date = this.userList.date;
                this.userList.loading = true;
                const newdate = moment(date).format('MMDD');
                const res = await API.film.queryuser(newdate);
                console.log('res;',res);
                this.userList.data = res;
                this.userList.loading = false;
            },

            async setPrize(){
                const userList = this.userList.checked;
                if(userList.length <= 0) return alert('需要勾选中用户');
                const prize = this.userList.prize;
                if(!prize) return alert('需要输入奖项！');
                if(!confirm('确认要设置'+userList.length+'个用户，奖项为 '+prize+' 吗？')){
                    return;
                }
                console.log(prize ,userList);
                for(let i=0,len=userList.length,item;i<len;i++){
                    item = userList[i];
                    const res = await API.film.setprize({uid:item.uid ,pnm:prize});
                    console.log('res:',res);
                }
            },

            onSelect(d){
                this.userList.checked = d;
            },
        },


        components : {
            layoutMain
        }
    }
</script>
<style scoped lang="less">

</style>