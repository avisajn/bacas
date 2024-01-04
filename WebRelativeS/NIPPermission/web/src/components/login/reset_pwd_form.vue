<template>    
    <i-form v-ref:form-validate :rules="ruleValidate" :model="formValidate"  :label-width="80">
        <Form-item prop="oldpwd" label="旧密码">
            <i-input type="password" :value.sync="formValidate.oldpwd"></i-input>
        </Form-item>
        <Form-item prop="password" label="新密码">
            <i-input type="password" :value.sync="formValidate.password"></i-input>
        </Form-item>
        <Form-item prop="passwdCheck" label="密码确认">
            <i-input type="password" :value.sync="formValidate.passwdCheck"></i-input>
        </Form-item>

        <Form-item>
            <i-button type="primary" :loading="loading" @click="formSubmit"> {{btnText}} </i-button>
            <i-button type="ghost" @click="closeModal" style="margin-left: 8px">取消</i-button>
        </Form-item>
    </i-form>
</template>
<script>
    import API from '../../libs/api';
    import Store from '../../libs/store';
    import Util from '../../libs/util';
    export default {
        props : ['closeModal' ,'data'],
        data (e) {
            const validatePass = (rule, value, callback) => {
                value = value+'';
                if (value === '') {
                    callback(new Error('请输入新密码'));
                } else {
                    if(value.length < 6){
                        callback(new Error('密码长度不能小于6位'));
                        return;
                    }
                    if (this.formValidate.passwdCheck !== '') {
                        // 对第二个密码框单独验证
                        this.$refs.formValidate.validateField('passwdCheck');
                    }
                    callback();
                }
            };
            const validatePassCheck = (rule, value, callback) => {
                value = value+'';
                if (value === '') {
                    callback(new Error('请再次输入新密码'));
                } else if (value !== this.formValidate.password) {
                    callback(new Error('两次新输入密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                formValidate: {
                    oldpwd : '',
                    password : '',
                    passwdCheck: '',
                },
                ruleValidate: {
                    oldpwd: [
                        { required: true, message: '请填写新密码', trigger: 'blur' },
                        { type: 'string', min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
                    ],
                    password: [
                        { validator: validatePass, trigger: 'blur' ,min: 6, }
                    ],
                    passwdCheck: [
                        { validator: validatePassCheck, trigger: 'blur' ,min: 6, }
                    ],
                },
                loading : false,
                btnText : '确认修改'
            }
        },
        methods: {
            formSubmit(){
                this.$refs['formValidate'].validate((valid) => {
                    if (valid) {
                        let data = this.formValidate;
                        console.log('data:',data);
                        this.loading = true;
                        this.btnText = '保存中';
                        API.login.resetPwd(data).then((v) => {
                            this.loading = false;
                            this.btnText = '提交保存';
                            this.$Notice.success({title: '重置成功！'});
                            this.$emit('close')
                        } ,(e) => {
                            this.loading = false;
                            this.btnText = '确认修改';
                            this.$Notice.error({title: e.err});
                        });
                    } else {
                    //     this.loading = false;
                    //     this.btnText = '登录';
                    //     return;
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

