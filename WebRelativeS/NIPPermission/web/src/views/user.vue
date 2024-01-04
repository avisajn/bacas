<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">用户管理</span>
                <i-input :value.sync="user.queryKey" placeholder="用户名称" style="width: 150px"></i-input>
                <i-button type="primary" icon="ios-search" @click="onSearch(1)">搜索</i-button>
                <i-button type="success" icon="plus" @click="showModaluserForm()">创建用户</i-button>
            </div>
            <div slot="panel" class="tables-panel">
                <i-table 
                    :content="self" 
                    :columns="user.table.columns" 
                    :data="user.table.data"
                ></i-table>
                <br/>
                <Page :total="user.table.total" @on-change="onSearch" class="flr" :current="user.table.page"></Page>
                <Spin size="large" fix v-if="user.table.loading"></Spin>

                <Modal
                    :visible.sync="modal.userform"
                    title="表单"
                    class="no-foot-modal"
                    >
                    <div class="">
                        <user-form 
                            v-bind:rolesdata="rolesData"
                            v-bind:data="user.editRow"
                            v-on:close="closeModal('userform')"
                            v-on:success="onSearch()"
                        ></user-form>
                    </div>
                </Modal>

                <Modal
                    :visible.sync="modal.userinfo"
                    title="权限信息"
                    class="no-foot-modal"
                    width="760"
                    >
                    <div class="">
                        <user-info
                            v-bind:data="userinfo.selectData"
                            v-on:close="closeModal('userinfo')"
                            v-on:success="onSearch()"
                        ></user-info>
                    </div>
                </Modal>

            </div>
        </query-layout>
    </layout-main>
</template>
<script>
    import layoutMain from '../components/layout';
    import queryLayout from '../components/querylayout';
    import userForm from '../components/user/user_form';
    import userInfo from '../components/user/user_info';
    import Util from '../libs/util';
    import API from '../libs/api';
    const country_mapping = {
        'id' : '印尼',
        'br' : '巴西',
        'me' : '中东',
    }
    export default {
        data(){
            return {
                self: this,
                user : {
                    queryKey : '',
                    table : {
                        columns: [
                            {title: '用户ID', key: 'id'},
                            {title: '用户名称', key: 'username'},
                            {title: '拥有的角色', key: 'role' ,render(r){
                                let html = [];
                                r.rolesname.map((k) => {
                                  html.push(`<span>${k}</span>`);
                                })
                                return html;
                            }},
                            {title: '国家权限', key: 'country' ,render(r){
                                const country = r.country;
                                if(!country) return '-';
                                if(country.indexOf(',') >0 ){
                                    let res = [];
                                    country.split(',').map((k) => {
                                        res.push('<span class="cout-tag">'+country_mapping[k]+'</span>');
                                    })
                                    return res.join('');
                                }else{
                                    return '<span class="cout-tag">'+country_mapping[country]+'</span>';
                                }
                            }},
                            {title: '操作', key: 'status', render(r){
                                return `
                                    <i-button type="info" size="small" @click="showModaluserInfo(${r.id})">权限信息</i-button>
                                    <i-button type="warning" size="small" @click="showModaluserForm(${r.id})">修改</i-button>
                                    <i-button type="error" size="small" @click="deleteUser(${r.id} ,'${r.username}')">删除</i-button>
                                `;
                            }},
                        ],
                        data: [],
                        total : 0,
                        pageSize : 10,
                        showTotal : true,
                        loading : true,
                    },
                    editRow : {},
                },

                userinfo : {
                    loading : false,
                    selectData : {}
                },
                
                modal : {
                    userform : false,
                    userinfo : false
                },

                rolesData : []
            }
        },

        ready(){
            window.Loading.hide();
            if(!window.logined){ return;}
            if(!window.sysPermisstion){
                window.location.href = '#!/help';
                return;
            }
            setTimeout(() => {
                this.onSearch();
                API.role.getList({rowCount:10000}).then((k) => {
                    this.rolesData = k.rows;
                })
            } ,200);
        },

        methods : {
            getUserById(id){
                let data = this.user.table.data;
                let editRow = null;
                for(let i=0,len=data.length;i<len;i++){
                    if(data[i].id == id){
                        editRow = data[i];
                        break;
                    }
                }
                return editRow;
            },
            showModaluserForm(id){
                if(id){ // 修改
                    this.user.editRow = this.getUserById(id);
                }else{  // 添加
                    this.user.editRow = {};
                }
                this.modal['userform'] = true;  
            },

            deleteUser(id ,name){
                if(!id) return;
                this.$Modal.confirm({
                    title: '删除确认',
                    content: `确认要删除名字为<span style="color:red;margin:0px 5px;">${name}</span>这个用户吗?`,
                    onOk: () => {
                        const msg = this.$Message.loading('正在加载中...', 0);
                        API.user.delete(id).then((k) => {
                            msg();
                            this.$Notice.success({title: '删除成功！'});
                            this.onSearch();
                        } ,(e) => {
                            msg();
                            this.$Notice.error({
                                title: '遇到了一个错误！',
                                desc: e.err
                            });    
                        })
                    }
                });
            },

            showModaluserInfo(id){
                this.userinfo.selectData = this.getUserById(id);
                this.modal['userinfo'] = true;
            },

            onSearch(page){
                if(this.modal['userform']){
                    this.modal['userform'] = false;
                }
                page = page || this.user.table.page;
                this.user.table.page = page;
                this.user.table.loading = true;
                API.user.getList({key:this.user.queryKey ,current:page}).then((k) => {
                    this.user.table.data = k.rows;
                    this.user.table.total = k.total;
                    this.user.table.loading = false;
                })

            },

            closeModal(type){
                this.modal[type] = false;
            },
        },


        components : {
            layoutMain,
            queryLayout,

            userForm,
            userInfo
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
</style>