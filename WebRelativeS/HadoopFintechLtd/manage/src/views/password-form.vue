<template>
    <div v-if="!validate" class="login-container error-container">
        <!-- <div>验证不正确</div> -->
        ERROR
        <!-- <p>1.重新请求发送短信</p> -->
    </div>
    <div v-if="validate" class="login-container">

        <h2 class="title">Set Password</h2>
        <div class="login-form">
            <i-form v-ref:form-validate :rules="ruleValidate" :model="formValidate"  :label-width="80">
                <Form-item prop="password" label="Password">
                    <i-input type="password" :value.sync="formValidate.password"></i-input>
                </Form-item>
                <Form-item prop="passwdCheck" label="Password Confirm">
                    <i-input type="password" :value.sync="formValidate.passwdCheck"></i-input>
                </Form-item>

                <div>
                    <i-button type="primary" :loading="loading" @click="formSubmit"> {{btnText}} </i-button>
                </div>
            </i-form>
        </div>
    </div>
</template>
<script>
    import loginForm from '../components/login/login_form';
    import Util from '../libs/util';
    import {decryptCode} from '../libs/des';
    import API from '../libs/api';

    export default {
        data(){
            const validatePass = (rule, value, callback) => {
                value = value+'';
                if (value === '') {
                    callback(new Error('Please enter your new password'));
                } else {
                    if(value.length < 6){
                        callback(new Error('Password length cannot be less than 6 bits'));
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
                    callback(new Error('Please enter your new password again'));
                } else if (value !== this.formValidate.password) {
                    callback(new Error('Two times passwords inconsistent!'));
                } else {
                    callback();
                }
            };
            return {
                self: this,
                formValidate: {
                    oldpwd : '',
                    password : '',
                    passwdCheck: '',
                },
                ruleValidate: {
                    oldpwd: [
                        { required: true, message: 'Required', trigger: 'blur' },
                        { type: 'string', min: 6, message: 'Password length cannot be less than 6 bits', trigger: 'blur' }
                    ],
                    password: [
                        { validator: validatePass, trigger: 'blur' ,min: 6, }
                    ],
                    passwdCheck: [
                        { validator: validatePassCheck, trigger: 'blur' ,min: 6, }
                    ],
                },
                loading : false,
                btnText : 'Submit' ,
                validate : false,
                id : '',
                email : '',

            }
        },

        ready(){
            const token = Util.getQuery('t');
            if(!token) return;
            let param = null;
            try{
                param = decryptCode(token);
            }catch(e){
                return;
            }

            if(!param || !param.time || param.time <= new Date().getTime() || !param.id ) return;
            this.id = param.id;
            this.validate = true;
        },

        methods : {
            formSubmit(){
                this.$refs['formValidate'].validate((valid) => {
                    if (valid) {
                        let data = this.formValidate;
                        this.loading = true;
                        this.btnText = 'saving';
                        data.id = this.id;
                        API.login.setPwd(data).then((v) => {
                            this.loading = false;
                            this.btnText = 'Submit';
                            this.$Notice.success({title: '重置成功！'});
                            this.$emit('close');
                            // window.location.href = '/manage.html';
                            window.isReset = true;
                            window.location.href = '#/login';
                        } ,(e) => {
                            this.loading = false;
                            this.btnText = 'Submit';
                            this.$Notice.error({title: e.err});
                        });
                    } else {
                    //     this.loading = false;
                    //     this.btnText = '登录';
                    //     return;
                    }
                })
            },
        },


        components : {
            loginForm
        }
    }
</script>
<style scoped lang="less">
    .error-container{
        line-height: 200px;
        color: red;
    }
    .login-container{
        background-color: rgba(255, 255, 255, 0.75);
        border-radius: 40px;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);
        padding: 30px;
        margin-bottom: 15px;
        width: 380px;
        height: 260px;
        text-align: center;
        position: absolute;
        top: 50%;
        left: 50%;
        margin: -150px 0 0 -190px;
        -webkit-transition: all 1s 0.5s;
        transition: all 1s 0.5s;
        .title{
            font-weight: bold;
            font-family: Copperplate-Bold;
        }
        .login-form{
            margin-top:20px;
        }
    }
</style>