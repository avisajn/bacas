<template>  
    <i-table 
        :content="self" 
        :columns="list.columns" 
        :data="list.data"
        height="240"
        stripe
        size="small"
    ></i-table>  
    <br/>
    <div style="text-align:right;">
        <i-button type="ghost" @click="closeModal">关闭</i-button>
    </div>
</template>
<script>
    import moment from 'moment';
    import API from '../../libs/api';
    export default {
        props : ['closeModal' ,'data'],
        data (e) {
            return {
                user : {},
                list : {
                    columns: [
                        {title: '系统名称', key: 'sysname'},
                        {title: '类型', key: 'type' ,render(r){
                            if(r.type == 1) return '页面';
                            if(r.type == 2) return '功能';
                            return '类型出错：'+r.type;
                        }},
                        {title: 'key', key: 'key'},
                        {title: '描述', key: 'desc'},
                    ],
                    data: [],
                    loading : false,
                }
            }
        },
        methods: {
            closeModal(){
                this.$emit('close')
            },
            getInfoList(){
                let user = this.user;
                if(!user) return;
                API.user.getPermisstion(user.id ,user.roleids.join(',')).then((k) => {
                    this.list.data = k;
                })
            },
        },
        watch : {
            data(user ,o){
                if(user){
                    this.user = user;
                    this.getInfoList();
                }
            }
        }
    }
</script>
<style scoped lang="less">
    .sysinfo-list-panel{
        padding-right: 10px;
        border-right: 1px solid #e4e4e4;
        .ivu-table-row{
            cursor:pointer;
        }
    }
    .btn-group{
        padding: 5px;
        text-align: right;
        border-bottom:1px solid #e4e4e4;
    }
</style>

