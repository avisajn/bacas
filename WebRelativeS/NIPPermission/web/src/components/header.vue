<template>
    <div class="header">
        <div class="title"><span>BACA后台管理系统</span></div>
        <ul class="sys-list" v-if="systems.length > 0">
            <!-- <li v-for="item in systems"><a href="#!/preview?page={{item.url}}">{{item.name}}</a></li> -->
            <li v-for="item in systems"><a target="_blank" href="{{item.url}}">{{item.name}}</a></li>
        </ul>
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
            let self = this;
            Util.getAllSystem(function(d){
                console.log('systems:',d);
                let newArr = [];
                d.map((k) => {
                    if(k.id != 2){
                        newArr.push(k);
                    }
                })
                self.systems = newArr;
            })
        },
        methods: {
            onMenuControl(){
                this.$emit('menuclick');
            },
            loginout(){
                API.login.out().then((k) => {
                    Store.clearSession();
                    if(window.ENV == 'prod'){
                        Cookies.remove('token')
                        window.location.href = '/permission/web/login';
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
        font-size: 16px;
        line-height: 50px;
        padding-left: 16px;
        .title{
            line-height:50px;
            position: relative;
            display:inline-block;
            padding: 0px 10px;
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

