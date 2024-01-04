<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">角色管理</span>
                <i-input :value.sync="role.queryKey" placeholder="角色名称" style="width: 150px"></i-input>
                <i-button type="primary" icon="ios-search" @click="onSearch">搜索</i-button>
                <i-button type="success" icon="plus" @click="showModalSysForm()">创建角色</i-button>
            </div>
            <div slot="panel" class="tables-panel">
                <i-table 
                    :content="self" 
                    :columns="role.table.columns" 
                    :data="role.table.data"
                ></i-table>
                <Spin size="large" fix v-if="role.table.loading"></Spin>

                <Modal
                    :visible.sync="modal.sysform"
                    title="表单"
                    class="no-foot-modal"
                    >
                    <div class="">
                        <sys-form 
                            v-bind:data="role.editRow"
                            v-on:close="closeModal('sysform')"
                            v-on:success="onSearch()"
                        ></sys-form>
                    </div>
                </Modal>

                <Modal
                    :visible.sync="modal.roleinfo"
                    title="权限信息"
                    class="no-foot-modal"
                    width="760"
                    >
                    <div class="">
                        <role-info
                            v-bind:sysdata="sysData"
                            v-bind:id="roleinfo.selectId"
                            v-on:close="closeModal('roleinfo')"
                            v-on:success="onSearch()"
                        ></role-info>
                    </div>
                </Modal>

            </div>
        </query-layout>
    </layout-main>
</template>
<script>
    import layoutMain from '../components/layout';
    import queryLayout from '../components/querylayout';
    import sysForm from '../components/role/role_form';
    import roleInfo from '../components/role/role_info';
    import Util from '../libs/util';
    import API from '../libs/api';

    export default {
        data(){
            return {
                self: this,
                role : {
                    queryKey : '',
                    table : {
                        columns: [
                            {title: '角色ID', key: 'id'},
                            {title: '角色名称', key: 'name'},
                            {title: '描述', key: 'desc'},
                            {title: '操作', key: 'status', render(r){
                                return `
                                    <i-button type="info" size="small" @click="showModalRoleinfo(${r.id})">分配权限</i-button>
                                    <i-button type="warning" size="small" @click="showModalSysForm(${r.id})">修改</i-button>
                                    <i-button type="error" size="small" @click="deleteRole(${r.id} ,'${r.name}')">删除</i-button>
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

                sysData : [],

                roleinfo : {
                    loading : false,
                    selectId : ''
                },
                
                modal : {
                    sysform : false,
                    roleinfo : false
                }
            }
        },

        ready(){
            window.Loading.hide();
            setTimeout(() => {
                this.onSearch();
                API.sys.getAllSysInfo().then((k) => {
                    this.sysData = k;
                })
            } ,200);
        },

        methods : {

            deleteRole(id ,name){
                if(!id) return;
                this.$Modal.confirm({
                    title: '删除确认',
                    content: `确认要删除名字为<span style="color:red;margin:0px 5px;">${name}</span>这个角色吗?`,
                    onOk: () => {
                        const msg = this.$Message.loading('正在加载中...', 0);
                        API.role.delete(id).then((k) => {
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


            showModalSysForm(id){
                if(id){ // 修改
                    let data = this.role.table.data;
                    let editRow = null;
                    for(let i=0,len=data.length;i<len;i++){
                        if(data[i].id == id){
                            editRow = data[i];
                            break;
                        }
                    }
                    this.role.editRow = editRow;
                    console.log('asdf',editRow);
                }else{  // 添加
                    this.role.editRow = {};
                }
                this.modal['sysform'] = true;  
                console.log('sdf',this.modal) ;
            },

            showModalRoleinfo(id){
                this.roleinfo.selectId = id;
                this.modal['roleinfo'] = true;
            },

            onSearch(){
                if(this.modal['sysform']){
                    this.modal['sysform'] = false;
                }
                this.role.table.loading = true;
                API.role.getList({key:this.role.queryKey}).then((k) => {
                    this.role.table.data = k.rows;
                    this.role.table.total = k.total;
                    this.role.table.loading = false;
                })

            },

            closeModal(type){
                this.modal[type] = false;
            },
        },


        components : {
            layoutMain,
            queryLayout,

            sysForm,
            roleInfo
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