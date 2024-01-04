<template>    
    <Row>
        <i-col span="15" class="sysinfo-list-panel">
            <i-table 
                :content="self" 
                :columns="list.columns" 
                :data="list.data"
                @on-row-click="onRowClick"
                height="340"
                class="sys-info-table"
                stripe
                size="small"
            ></i-table>
        </i-col>
        <i-col span="9" class="form-panel">
            <div class="btn-group">
                <i-button type="success" @click="setCurrent()">创建新的权限</i-button>
            </div>
            
            <i-form v-ref:form-validate :rules="form.ruleValidate" :model="form.formValidate" :label-width="80">
                <Form-item label="权限类型" prop="type">
                    <Radio-group :model.sync="form.formValidate.type">
                        <Radio value="1">页面</Radio>
                        <Radio value="2">功能</Radio>
                    </Radio-group>
                </Form-item>

                <Form-item label="key" prop="key">
                    <i-input :value.sync="form.formValidate.key"></i-input>
                </Form-item>

                <Form-item label="描述" prop="desc">
                    <i-input type="textarea" :value.sync="form.formValidate.desc"></i-input>
                </Form-item>
                <Form-item>
                    <i-button type="primary" :loading="loading" @click="formSubmit"> {{form.btnText}} </i-button>
                    <i-button type="ghost" @click="closeModal" style="margin-left: 8px">关闭</i-button>
                </Form-item>
            </i-form>
        </i-col>
    </Row>
</template>
<script>
    import moment from 'moment';
    import API from '../../libs/api';
    export default {
        props : ['closeModal' ,'id'],
        data (e) {
            return {
                sysid : 0,
                form : {
                    formValidate: {
                        id : '',
                        type: 1,
                        key : '',
                        desc: '',
                    },
                    ruleValidate: {key: [{ required: true, message: 'key不能为空', trigger: 'blur' } ], },
                    loading : false,
                    btnText : '提交保存'
                },
                list : {
                    columns: [
                        {title: '类型', key: 'type' ,width:60,render(r){
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
            formSubmit(){
                this.$refs['formValidate'].validate((valid) => {
                    if (valid) {
                        let data = this.form.formValidate;
                        var param = {
                            id : data.id,
                            type : data.type,
                            key : data.key,
                            desc : data.desc,
                            sysid : this.sysid
                        }
                        this.form.btnText = '保存中';
                        API.sys.saveSysInfo(param).then((v) => {
                            this.form.btnText = '保存成功';
                            this.$Notice.success({title: '保存成功！'});
                            this.getInfoList();
                            this.$refs['formValidate'].resetFields();
                            this.form.formValidate = {id : '', type: 1, key : '', desc: ''}
                            setTimeout(() => {this.form.btnText = '提交保存'; },2000);
                        } ,(e) => {
                            this.$Notice.error({title: e.err});
                        });
                    } else {
                        this.form.btnText = '提交保存';
                        return;
                    }
                })
            },

            closeModal(){
                this.$emit('close')
            },
            getInfoList(){
                let sysid = this.sysid;
                if(!sysid) return;
                API.sys.getInfoList(sysid).then((k) => {
                    this.list.data = k;
                })
            },
            setCurrent(p){
                if(p){

                }else{
                    this.form.formValidate = {id : '', type: 1, key : '', desc: ''};
                }
            },

            onRowClick(r){
                this.form.formValidate = {
                    id : r.id,
                    type : r.type,
                    key : r.key,
                    desc : r.desc,
                }
            }
        },
        watch : {
            id(id ,o){
                if(id){
                    this.sysid = id;
                    this.getInfoList();
                }
                this.$refs['formValidate'].resetFields();
                this.form.formValidate = {id : '', type: 1, key : '', desc: ''}

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

