<template>
    <layout-main>
        <query-layout slot="main">
            <div slot="condition" class="condition">  
                <span class="title">系统管理</span>
                <i-input :value.sync="sys.queryKey" placeholder="系统名称或ID" style="width: 150px"></i-input>
                <i-button type="primary" icon="ios-search" @click="onSysSearch">搜索</i-button>
                <i-button type="success" icon="plus" @click="showModalSysForm()">创建系统</i-button>
            </div>
            <div slot="panel" class="tables-panel">
                <i-table 
                    :content="self" 
                    :columns="sys.table.columns" 
                    :data="sys.table.data"
                ></i-table>
                <Spin size="large" fix v-if="sys.table.loading"></Spin>

                <Modal
                    :visible.sync="modal.sysform"
                    title="表单"
                    class="no-foot-modal"
                    >
                    <div class="">
                        <sys-form 
                            v-bind:data="sys.editRow"
                            v-on:close="closeModal('sysform')"
                            v-on:success="onSysSearch()"
                        ></sys-form>
                    </div>
                </Modal>

                <Modal
                    :visible.sync="modal.sysinfo"
                    title="权限信息"
                    class="no-foot-modal"
                    width="760"
                    >
                    <div class="">
                        <sys-info
                            v-bind:id="sysinfo.selectId"
                            v-on:close="closeModal('sysinfo')"
                            v-on:success="onSysSearch()"
                        ></sys-info>
                    </div>
                </Modal>

            </div>
        </query-layout>
    </layout-main>
</template>
<script>
    import layoutMain from '../components/layout';
    import queryLayout from '../components/querylayout';
    import sysForm from '../components/sys/sys_form';
    import sysInfo from '../components/sys/sys_info';
    import Util from '../libs/util';
    import API from '../libs/api';

    export default {
        data(){
            return {
                self: this,
                sys : {
                    queryKey : '',
                    table : {
                        columns: [
                            {title: '系统ID', key: 'id'},
                            {title: '系统名称', key: 'name'},
                            {title: '测试地址', key: 'testurl' ,render(r){
                                return `<a href="${r.testurl}" target="_blank">${r.testurl}</a>`;
                            }},
                            {title: '线上地址', key: 'url' ,render(r){
                                return `<a href="${r.url}" target="_blank">${r.url}</a>`;
                            }},
                            {title: '操作', key: 'status', render(r){
                                return `
                                    <i-button type="info" size="small" @click="showModalSysInfo(${r.id})">权限信息</i-button>
                                    <i-button type="warning" size="small" @click="showModalSysForm(${r.id})">修改</i-button>
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

                sysinfo : {
                    loading : false,
                    selectId : ''
                },
                
                modal : {
                    sysform : false,
                    sysinfo : false
                }
            }
        },

        ready(){
            window.Loading.hide();
            setTimeout(() => {
                this.onSysSearch();
            } ,200);
        },

        methods : {
            showModalSysForm(id){
                if(id){ // 修改
                    let data = this.sys.table.data;
                    let editRow = null;
                    for(let i=0,len=data.length;i<len;i++){
                        if(data[i].id == id){
                            editRow = data[i];
                            break;
                        }
                    }
                    this.sys.editRow = editRow;
                }else{  // 添加
                    this.sys.editRow = {};
                }
                this.modal['sysform'] = true;  
            },

            showModalSysInfo(id){
                this.sysinfo.selectId = id;
                this.modal['sysinfo'] = true;
            },

            onSysSearch(){
                if(this.modal['sysform']){
                    this.modal['sysform'] = false;
                }
                this.sys.table.loading = true;
                API.sys.getList({key:this.sys.queryKey}).then((k) => {
                    this.sys.table.data = k.rows;
                    this.sys.table.total = k.total;
                    this.sys.table.loading = false;
                })

            },

            closeModal(type){
                this.modal[type] = false;
            },

            onSearch(){
                
            }
        },


        components : {
            layoutMain,
            queryLayout,

            sysForm,
            sysInfo
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