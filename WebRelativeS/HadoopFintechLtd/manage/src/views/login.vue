<template>
    <div class="login-container">
        <h2 class="title">Hadoop Fintech Official Manage</h2>
        <div class="login-form">
            <login-form></login-form>    
        </div>
    </div>
</template>
<script>
    import loginForm from '../components/login/login_form';
    import Util from '../libs/util';
    import API from '../libs/api';

    export default {
        data(){
            return {
                self: this,
                
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
            
        },

        methods : {
            
        },


        components : {
            loginForm
        }
    }
</script>
<style scoped lang="less">
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