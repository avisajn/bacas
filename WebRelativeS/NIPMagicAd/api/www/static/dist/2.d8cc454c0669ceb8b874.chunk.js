webpackJsonp([2],{134:function(e,t,o){var n,i;o(135),n=o(136),i=o(153),e.exports=n||{},e.exports.__esModule&&(e.exports=e.exports.default),i&&(("function"==typeof e.exports?e.exports.options:e.exports).template=i)},135:function(e,t){},136:function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=o(137),a=n(i);t.default={data:function(){return{}},ready:function(){},methods:{},components:{layoutMain:a.default}}},137:function(e,t,o){var n,i;o(138),n=o(139),i=o(152),e.exports=n||{},e.exports.__esModule&&(e.exports=e.exports.default),i&&(("function"==typeof e.exports?e.exports.options:e.exports).template=i)},138:function(e,t){},139:function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=o(140),a=n(i),s=o(148),r=n(s),d=o(93),l=n(d);t.default={data:function(e){var t=!1;return window.sysPermisstion&&(t=!0),{navMenuDisplay:!0,showMenu:t}},ready:function(){window.logined||(console.log("layout.window.logined:",window.logined),window.location.href="#!/login")},components:{navHead:a.default,cmpMenu:r.default},beforeDestroy:function(){},methods:{onMenuClick:function(){this.navMenuDisplay=!this.navMenuDisplay,l.default.set("menu-display",this.navMenuDisplay)}}}},140:function(e,t,o){var n,i;o(141),n=o(142),i=o(147),e.exports=n||{},e.exports.__esModule&&(e.exports=e.exports.default),i&&(("function"==typeof e.exports?e.exports.options:e.exports).template=i)},141:function(e,t){},142:function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=o(93),a=n(i),s=o(14),r=n(s),d=o(130),l=n(d),u=o(131),c=n(u),f=o(143),p=n(f);t.default={data:function(){var e=window.userData||{};return{username:e.username||"-",systems:[],modal:!1}},ready:function(){var e=this;l.default.getAllSystem(function(t){console.log("systems:",t);var o=[];t.map(function(e){2!=e.id&&o.push(e)}),e.systems=o})},methods:{onMenuControl:function(){this.$emit("menuclick")},loginout:function(){r.default.login.out().then(function(e){a.default.clearSession(),"prod"==window.ENV?(c.default.remove("token"),window.location.href="/permission/web/login"):window.location.reload(!0)})},showUpdPassword:function(){this.modal=!0},closeModal:function(){this.modal=!1}},components:{loginPwdForm:p.default}}},143:function(e,t,o){var n,i;o(144),n=o(145),i=o(146),e.exports=n||{},e.exports.__esModule&&(e.exports=e.exports.default),i&&(("function"==typeof e.exports?e.exports.options:e.exports).template=i)},144:function(e,t){},145:function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=o(14),a=n(i),s=o(93),r=(n(s),o(130));n(r);t.default={props:["closeModal","data"],data:function(e){var t=this,o=function(e,o,n){if(o+="",""===o)n(new Error("请输入新密码"));else{if(o.length<6)return void n(new Error("密码长度不能小于6位"));""!==t.formValidate.passwdCheck&&t.$refs.formValidate.validateField("passwdCheck"),n()}},n=function(e,o,n){o+="",""===o?n(new Error("请再次输入新密码")):o!==t.formValidate.password?n(new Error("两次新输入密码不一致!")):n()};return{formValidate:{oldpwd:"",password:"",passwdCheck:""},ruleValidate:{oldpwd:[{required:!0,message:"请填写新密码",trigger:"blur"},{type:"string",min:6,message:"密码长度不能小于6位",trigger:"blur"}],password:[{validator:o,trigger:"blur",min:6}],passwdCheck:[{validator:n,trigger:"blur",min:6}]},loading:!1,btnText:"确认修改"}},methods:{formSubmit:function(){var e=this;this.$refs.formValidate.validate(function(t){if(t){var o=e.formValidate;console.log("data:",o),e.loading=!0,e.btnText="保存中",a.default.login.resetPwd(o).then(function(t){e.loading=!1,e.btnText="提交保存",e.$Notice.success({title:"重置成功！"}),e.$emit("close")},function(t){e.loading=!1,e.btnText="确认修改",e.$Notice.error({title:t.err})})}})},closeModal:function(){this.$emit("close")}},watch:{data:function(e,t){this.$refs.formValidate.resetFields(),this.formValidate={id:e.id||"",name:e.name||"",desc:e.desc||""}}}}},146:function(e,t){e.exports=' <i-form v-ref:form-validate="" :rules=ruleValidate :model=formValidate :label-width=80 _v-49955c76=""> <form-item prop=oldpwd label=旧密码 _v-49955c76=""> <i-input type=password :value.sync=formValidate.oldpwd _v-49955c76=""></i-input> </form-item> <form-item prop=password label=新密码 _v-49955c76=""> <i-input type=password :value.sync=formValidate.password _v-49955c76=""></i-input> </form-item> <form-item prop=passwdCheck label=密码确认 _v-49955c76=""> <i-input type=password :value.sync=formValidate.passwdCheck _v-49955c76=""></i-input> </form-item> <form-item _v-49955c76=""> <i-button type=primary :loading=loading @click=formSubmit _v-49955c76=""> {{btnText}} </i-button> <i-button type=ghost @click=closeModal style="margin-left: 8px" _v-49955c76="">取消</i-button> </form-item> </i-form> '},147:function(e,t){e.exports=' <div class=header _v-9acaadb2=""> <div class=title _v-9acaadb2=""><span _v-9acaadb2="">BACA后台管理系统</span></div> <ul class=sys-list v-if="systems.length > 0" _v-9acaadb2=""> <li v-for="item in systems" _v-9acaadb2=""><a href="#!/preview?page={{item.url}}" _v-9acaadb2="">{{item.name}}</a></li> </ul> <div class=user-info _v-9acaadb2=""> <dropdown trigger=click _v-9acaadb2=""> <a href=javascript:void(0) _v-9acaadb2=""> {{username}} <icon type=arrow-down-b _v-9acaadb2=""></icon> </a> <dropdown-menu slot=list _v-9acaadb2=""> <dropdown-item @click=showUpdPassword _v-9acaadb2="">修改密码</dropdown-item> <dropdown-item divided="" @click=loginout _v-9acaadb2="">退出</dropdown-item> </dropdown-menu> </dropdown> </div> <modal :visible.sync=modal title=修改密码 class=no-foot-modal width=360 _v-9acaadb2=""> <div class="" _v-9acaadb2=""> <login-pwd-form v-on:close=closeModal() _v-9acaadb2=""></login-pwd-form> </div> </modal> </div> '},148:function(e,t,o){var n,i;o(149),n=o(150),i=o(151),e.exports=n||{},e.exports.__esModule&&(e.exports=e.exports.default),i&&(("function"==typeof e.exports?e.exports.options:e.exports).template=i)},149:function(e,t){},150:function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=o(130),a=n(i),s=null;t.default={data:function(e){var t=window.location.hash;return t=t.indexOf("!/")>0?t.substring(2):"/",console.log("hash:",t),{active:t,pages:{}}},ready:function(){var e=this;s?1!=s&&(this.pages=s):!function(){var t=e;a.default.getRights(2,function(e){s=e?e:1,t.pages=e})}()},beforeDestroy:function(){},methods:{onSelect:function(e){window.location.href="#"+e}}}},151:function(e,t){e.exports=' <menu :active-key=active @on-select=onSelect _v-e16c490e=""> <menu-item v-if=pages.user key=/ _v-e16c490e=""><icon type=person _v-e16c490e=""></icon> 用户管理 </menu-item> <menu-item v-if=pages.role key=/role _v-e16c490e=""><icon type=person-stalker _v-e16c490e=""></icon> 角色管理</menu-item> <menu-item v-if=pages.system key=/sys _v-e16c490e=""><icon type=ios-gear _v-e16c490e=""></icon>系统管理</menu-item> </menu> '},152:function(e,t){e.exports=' <div class=g-hd _v-51192b44=""> <nav-head v-on:menuclick=onMenuClick _v-51192b44=""></nav-head> </div> <div class=g-sd :class="{ hideMenu: !showMenu }" _v-51192b44=""> <cmp-menu v-if=showMenu _v-51192b44=""></cmp-menu> </div> <div class=g-mn :class="{ mnShowAll: !showMenu }" _v-51192b44=""> <slot name=main _v-51192b44=""> </slot> </div> '},153:function(e,t){e.exports=' <layout-main _v-afacfbde=""> <div slot=main _v-afacfbde=""> 这里是帮助介绍 </div> </layout-main> '}});