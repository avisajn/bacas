<template>    
    <i-form v-ref:form-validate :rules="ruleValidate" :model="formValidate">
        <Form-item prop="user">
            <i-input @on-enter="formSubmit" type="text" :value.sync="formValidate.user" placeholder="Username">
                <Icon type="ios-person-outline" slot="prepend"></Icon>
            </i-input>
        </Form-item>
        <Form-item prop="password">
            <i-input @on-enter="formSubmit" type="password" :value.sync="formValidate.password" placeholder="Password">
                <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </i-input>
        </Form-item>

        <Form-item>
            <i-button type="primary" @on-enter="formSubmit" :loading="loading" @click="formSubmit"> {{btnText}} </i-button>
        </Form-item>
    </i-form>
</template>
<script>
    import API from '../../libs/api';
    import Store from '../../libs/store';
    import Cookies from 'js-cookie';
    export default {
        props : ['closeModal' ,'data'],
        data (e) {
            return {
                formValidate: {
                    id : '',
                    user: '',
                    password : '',
                },
                ruleValidate: {
                    user: [{ required: true, message: '请填写用户名', trigger: 'blur' } ],
                    password: [
                        { required: true, message: '请填写密码', trigger: 'blur' },
                        { type: 'string', min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
                    ]
                },
                loading : false,
                btnText : 'Login'
            }
        },
        methods: {
            formSubmit(){
                this.$refs['formValidate'].validate((valid) => {
                    if (valid) {
                        let data = this.formValidate;
                        this.loading = true;
                        this.btnText = '验证中';
                        API.login.login(data.user ,data.password).then((v) => {
                            this.btnText = '获取信息中';
                            // this.$Notice.success({title: 'Login成功！'});
                            Store.set('username',data.user);
                            window.userData = {
                                id : v.id,
                                username : data.user
                            }
                            Cookies.set('hadoop_token' ,v.token ,{ expires: 7 });
                            window.logined = true;
                            if(window.isReset){
                                window.location.reload(true);
                            }else{
                                window.location.href = '#/index';
                            }
                        } ,(e) => {
                            this.loading = false;
                            this.btnText = 'Login';
                            this.$Notice.error({title: e.err});
                        });
                    } else {
                        this.loading = false;
                        this.btnText = 'Login';
                        return;
                    }
                })
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

