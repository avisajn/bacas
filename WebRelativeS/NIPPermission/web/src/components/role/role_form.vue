<template>    
    <i-form v-ref:form-validate :rules="ruleValidate" :model="formValidate" :label-width="80">
        <Form-item label="角色名称" prop="name">
            <i-input :value.sync="formValidate.name"></i-input>
        </Form-item>

        <Form-item label="角色描述" prop="desc">
            <i-input type="textarea" :value.sync="formValidate.desc"></i-input>
        </Form-item>

        <Form-item>
            <i-button type="primary" :loading="loading" @click="formSubmit"> {{btnText}} </i-button>
            <i-button type="ghost" @click="closeModal" style="margin-left: 8px">取消</i-button>
        </Form-item>
    </i-form>
</template>
<script>
    import moment from 'moment';
    import API from '../../libs/api';
    export default {
        props : ['closeModal' ,'data'],
        data (e) {
            return {
                formValidate: {
                    id : '',
                    name: '',
                    desc : '',
                },
                ruleValidate: {
                    name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' } ],
                },
                loading : false,
                btnText : '提交保存'
            }
        },
        methods: {
            formSubmit(){
                this.$refs['formValidate'].validate((valid) => {
                    if (valid) {
                        let data = this.formValidate;
                        var param = {
                            id : data.id,
                            name : data.name,
                            desc : data.desc,
                        }
                        this.loading = true;
                        this.btnText = '保存中';
                        API.role.saveRole(param).then((v) => {
                            this.loading = false;
                            this.btnText = '保存成功';
                            this.$Notice.success({title: '保存成功！'});
                            this.$emit('success');
                            setTimeout(() => {
                                this.btnText = '提交保存';
                            },2000);
                        } ,(e) => {
                            this.$Notice.error({title: e.err});
                        });
                    } else {
                        this.loading = false;
                        this.btnText = '提交保存';
                        return;
                    }
                })
            },

            closeModal(){
                this.$emit('close')
            },
        },
        watch : {
            data(n ,o){
                this.$refs['formValidate'].resetFields();
                this.formValidate = {
                    id : n.id || '',
                    name: n.name || '',
                    desc : n.desc || '',
                };

            }
        }
    }
</script>
<style scoped lang="less">
    
</style>

