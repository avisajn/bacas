<template>
    <div class="header">
        <div class="title"><span>Hadoop Fintech Official Manage</span></div>
        <div class="user-info">
            <Dropdown trigger="click">
                <a href="javascript:void(0)">
                    {{username}}
                    <Icon type="arrow-down-b"></Icon>
                </a>
                <Dropdown-menu slot="list">
                    <Dropdown-item @click="showUpdPassword">修改密码</Dropdown-item>
                    <Dropdown-item divided @click="loginout">退出</Dropdown-item>
                </Dropdown-menu>
            </Dropdown>
        </div>
        <Modal
            :visible.sync="modal"
            title="修改密码"
            class="no-foot-modal"
            width="360"
            >
            <div class="">
                <login-pwd-form v-on:close="closeModal()" ></login-pwd-form>
            </div>
        </Modal>
    </div>
</template>
<script>
    import Store from '../libs/store';
    import API from '../libs/api';
    import Util from '../libs/util';
    import Cookies from 'js-cookie';
    import loginPwdForm from './login/reset_pwd_form';
    export default {
        data(){
            let user = window.userData || {};
            return {
                username : user.username || '-',
                systems : [],
                modal   : false
            }
        },
        ready(){
            
        },
        methods: {
            onMenuControl(){
                this.$emit('menuclick');
            },
            loginout(){
                Cookies.remove('hadoop_token');
                API.login.out().then((k) => {
                    Store.clearSession();
                    if(window.ENV == 'prod'){
                        window.location.reload(true);
                    }else{
                        window.location.reload(true);
                    }
                })
            },
            showUpdPassword(){
                this.modal = true;
            },

            closeModal(){
                this.modal = false;  
            }
        },
        components : {
            loginPwdForm
        }
    }
</script>
<style scoped lang="less">
    .header{
        height:50px;
        color: white;
        background-color: #222;
        border-bottom: #080808 1px solid;
        -moz-box-shadow: 0 0 4px #333;
        -webkit-box-shadow: 0 0 4px #333;
        box-shadow: 0 0 4px #333;


        *background-image: -webkit-gradient(linear,left top,right top,from(#ee5c5b),to(#EF5D5D));
        *background-image: -webkit-linear-gradient(left,#ee5c5b,#EF5D5D);
        *background-image: -moz-linear-gradient(left,#ee5c5b,#EF5D5D);
        *background-image: linear-gradient(to right,#ee5c5b,#EF5D5D);


        font-size: 16px;
        line-height: 50px;
        padding-left: 16px;
        .title{
            line-height:50px;
            position: relative;
            display:inline-block;
            font-weight: bold;
            font-family: Copperplate-Bold;
            font-size: 25px;
        }
        .sys-list{
            display:inline-block;
            height:50px;
            >li{
                display:inline-block;
                height:50px;
                font-size: 13px;
                padding: 0px 10px;
                cursor:pointer;
                -webkit-transition: all .2s ease-in-out;
                transition: all .2s ease-in-out;
                >a{
                    color:white;
                }
            }
            >li:hover{
                background-color:rgba(255,255,255,0.2)
            }
            .checked{
                background-color: #111;
            }
            .checked:hover{
                background-color: #111;
            }
        }
        .user-info{
            float:right;
            display:inline-block;
            font-size: 13px;
            margin-right: 40px;
            .username{
                margin-right:10px;
            }
        }
    }
</style>

