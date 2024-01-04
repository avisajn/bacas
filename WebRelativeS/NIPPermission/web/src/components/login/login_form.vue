<template>    
    <i-form v-ref:form-validate :rules="ruleValidate" :model="formValidate">
        <Form-item prop="user">
            <i-input type="text" :value.sync="formValidate.user" placeholder="Username">
                <Icon type="ios-person-outline" slot="prepend"></Icon>
            </i-input>
        </Form-item>
        <Form-item prop="password">
            <i-input type="password" :value.sync="formValidate.password" placeholder="Password">
                <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </i-input>
        </Form-item>

        <Form-item>
            <i-button type="primary" :loading="loading" @click="formSubmit"> {{btnText}} </i-button>
        </Form-item>
    </i-form>
</template>
<script>
    import API from '../../libs/api';
    import Store from '../../libs/store';
    import Util from '../../libs/util';
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
                btnText : '登录'
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
                            // this.$Notice.success({title: '登录成功！'});
                            Store.set('username',data.user);
                            window.userData = {
                                id : v.id,
                                roleids : v.rids,
                                username : data.user
                            }
                            Cookies.set('token' ,v.token ,{ expires: 7 });
                            window.logined = true;
                            Util.getRights(2 ,function (k) {
                                window.sysPermisstion = k;
                                window.location.href = '#!/';
                                window.location.reload();
                            });
                        } ,(e) => {
                            this.loading = false;
                            this.btnText = '登录';
                            this.$Notice.error({title: e.err});
                        });
                    } else {
                        this.loading = false;
                        this.btnText = '登录';
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

