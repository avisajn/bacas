webpackJsonp([4],{132:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=o(93),i=(a(n),o(14)),d=(a(i),{getFixed:function(e){var t=new Number(e+1).toFixed(2);return new Number(t-1).toFixed(2)},getQuery:function(e){var t=new RegExp("(^|&)"+e+"=([^&]*)(&|$)"),o=window.location.hash,a=o.substr(o.indexOf("?")+1).match(t);return null!=a?unescape(a[2]):null}});t.default=d},137:function(e,t,o){var a,n;o(138),a=o(139),n=o(148),e.exports=a||{},e.exports.__esModule&&(e.exports=e.exports.default),n&&(("function"==typeof e.exports?e.exports.options:e.exports).template=n)},138:function(e,t){},139:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=o(140),i=a(n),d=o(93);a(d);t.default={data:function(e){return{}},ready:function(){window.logined||(console.log("layout.window.logined:",window.logined),window.location.href="#!/login")},components:{navHead:i.default},beforeDestroy:function(){},methods:{}}},140:function(e,t,o){var a,n;o(141),a=o(142),n=o(147),e.exports=a||{},e.exports.__esModule&&(e.exports=e.exports.default),n&&(("function"==typeof e.exports?e.exports.options:e.exports).template=n)},141:function(e,t){},142:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=o(93),i=a(n),d=o(14),r=a(d),l=o(132),s=(a(l),o(94)),c=a(s),u=o(143),f=a(u);t.default={data:function(){var e=window.userData||{};return{username:e.username||"-",systems:[],modal:!1}},ready:function(){},methods:{onMenuControl:function(){this.$emit("menuclick")},loginout:function(){c.default.remove("hadoop_token"),r.default.login.out().then(function(e){i.default.clearSession(),"prod"==window.ENV?window.location.reload(!0):window.location.reload(!0)})},showUpdPassword:function(){this.modal=!0},closeModal:function(){this.modal=!1}},components:{loginPwdForm:f.default}}},143:function(e,t,o){var a,n;o(144),a=o(145),n=o(146),e.exports=a||{},e.exports.__esModule&&(e.exports=e.exports.default),n&&(("function"==typeof e.exports?e.exports.options:e.exports).template=n)},144:function(e,t){},145:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=o(14),i=a(n),d=o(93),r=(a(d),o(132));a(r);t.default={props:["closeModal","data"],data:function(e){var t=this,o=function(e,o,a){if(o+="",""===o)a(new Error("请输入新密码"));else{if(o.length<6)return void a(new Error("密码长度不能小于6位"));""!==t.formValidate.passwdCheck&&t.$refs.formValidate.validateField("passwdCheck"),a()}},a=function(e,o,a){o+="",""===o?a(new Error("请再次输入新密码")):o!==t.formValidate.password?a(new Error("两次新输入密码不一致!")):a()};return{formValidate:{oldpwd:"",password:"",passwdCheck:""},ruleValidate:{oldpwd:[{required:!0,message:"请填写新密码",trigger:"blur"},{type:"string",min:6,message:"密码长度不能小于6位",trigger:"blur"}],password:[{validator:o,trigger:"blur",min:6}],passwdCheck:[{validator:a,trigger:"blur",min:6}]},loading:!1,btnText:"确认修改"}},methods:{formSubmit:function(){var e=this;this.$refs.formValidate.validate(function(t){if(t){var o=e.formValidate;e.loading=!0,e.btnText="保存中",i.default.login.resetPwd(o).then(function(t){e.loading=!1,e.btnText="提交保存",e.$Notice.success({title:"重置成功！"}),e.$emit("close")},function(t){e.loading=!1,e.btnText="确认修改",e.$Notice.error({title:t.err})})}})},closeModal:function(){this.$emit("close")}},watch:{data:function(e,t){this.$refs.formValidate.resetFields(),this.formValidate={id:e.id||"",name:e.name||"",desc:e.desc||""}}}}},146:function(e,t){e.exports=' <i-form v-ref:form-validate="" :rules=ruleValidate :model=formValidate :label-width=80 _v-4c0b71c1=""> <form-item prop=oldpwd label=旧密码 _v-4c0b71c1=""> <i-input type=password :value.sync=formValidate.oldpwd _v-4c0b71c1=""></i-input> </form-item> <form-item prop=password label=新密码 _v-4c0b71c1=""> <i-input type=password :value.sync=formValidate.password _v-4c0b71c1=""></i-input> </form-item> <form-item prop=passwdCheck label=密码确认 _v-4c0b71c1=""> <i-input type=password :value.sync=formValidate.passwdCheck _v-4c0b71c1=""></i-input> </form-item> <form-item _v-4c0b71c1=""> <i-button type=primary :loading=loading @click=formSubmit _v-4c0b71c1=""> {{btnText}} </i-button> <i-button type=ghost @click=closeModal style="margin-left: 8px" _v-4c0b71c1="">取消</i-button> </form-item> </i-form> '},147:function(e,t){e.exports=' <div class=header _v-a625e49c=""> <div class=title _v-a625e49c=""><span _v-a625e49c="">Hadoop Fintech Official Manage</span></div> <div class=user-info _v-a625e49c=""> <dropdown trigger=click _v-a625e49c=""> <a href=javascript:void(0) _v-a625e49c=""> {{username}} <icon type=arrow-down-b _v-a625e49c=""></icon> </a> <dropdown-menu slot=list _v-a625e49c=""> <dropdown-item @click=showUpdPassword _v-a625e49c="">修改密码</dropdown-item> <dropdown-item divided="" @click=loginout _v-a625e49c="">退出</dropdown-item> </dropdown-menu> </dropdown> </div> <modal :visible.sync=modal title=修改密码 class=no-foot-modal width=360 _v-a625e49c=""> <div class="" _v-a625e49c=""> <login-pwd-form v-on:close=closeModal() _v-a625e49c=""></login-pwd-form> </div> </modal> </div> '},148:function(e,t){e.exports=' <div class=g-hd _v-4b6b8fcf=""> <nav-head _v-4b6b8fcf=""></nav-head> </div> <div class=g-sd :class="{ hideMenu: !showMenu }" _v-4b6b8fcf=""> <cmp-menu v-if=showMenu _v-4b6b8fcf=""></cmp-menu> </div> <div class=g-mn :class="{ mnShowAll: !showMenu }" _v-4b6b8fcf=""> <slot name=main _v-4b6b8fcf=""> </slot> </div> '},154:function(e,t,o){var a,n;o(155),a=o(156),n=o(272),e.exports=a||{},e.exports.__esModule&&(e.exports=e.exports.default),n&&(("function"==typeof e.exports?e.exports.options:e.exports).template=n)},155:function(e,t){},156:function(e,t,o){"use strict";function a(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var n=o(137),i=a(n),d=o(157),r=a(d),l=o(132),s=a(l),c=o(14),u=a(c),f=o(161),p=a(f),v=window.lastDate,m=window.startDay;t.default={data:function(){return{self:this,query:{dateRange:[m,v],dateOptions:{disabledDate:function(e){return e&&e.valueOf()>=Date.now()}},os:"all",country:"all",countryData:[{name:"All Country",value:"all"},{name:"AU",value:"au"},{name:"BR",value:"br"},{name:"CA",value:"ca"},{name:"DE",value:"de"},{name:"GB",value:"gb"},{name:"ID",value:"id"},{name:"JP",value:"jp"},{name:"SG",value:"sg"},{name:"US",value:"us"}]},queryKey:"",table:{columns:[{title:"Date",key:"date",sortable:"custom"},{title:"Click",key:"click",sortable:"custom"},{title:"Conversion",key:"conversion",sortable:"custom"},{title:"Conversion/Click",key:"cc",render:function(e){return s.default.getFixed(e.conversion/e.click*100)+"%"}},{title:"Earn",key:"earn",sortable:"custom",render:function(e){return"$"+s.default.getFixed(e.earn/100)}}],data:[],total:0,pageSize:100,showTotal:!1,loading:!0}}},ready:function(){var e=this;window.Loading.hide(),window.logined&&setTimeout(function(){e.onSearch()},200)},methods:{onSortChange:function(e){var t=e.key,o=e.order;if("date"==t)return void this.sortByString(o);var a=this.table.data,n=0,i=0;"asc"==o?this.table.data=a.sort(function(e,o){return n=parseFloat(e[t])||0,i=parseFloat(o[t])||0,n>i?-1:1}):this.table.data=a.sort(function(e,o){return n=parseFloat(e[t])||0,i=parseFloat(o[t])||0,n>i?1:-1})},sortByString:function(e){var t=this.table.data;"asc"==e?this.table.data=t.sort(function(e,t){return e.date.localeCompare(t.date)}):this.table.data=t.sort(function(e,t){return t.date.localeCompare(e.date)})},onSearch:function(e){var t=this,o=this.query,a=o.dateRange,n=o.country,i=o.os;this.table.loading=!0,u.default.adreport.getList({country:n,os:i,traffic_source:window.userData.id,datestart:(0,p.default)(a[0]).format("YYYY-MM-DD"),dateend:(0,p.default)(a[1]).format("YYYY-MM-DD")}).then(function(e){t.table.data=e,t.table.total=e.length,t.table.loading=!1},function(e){t.table.data=[],t.table.total=0,t.table.loading=!1,t.$Message.error("获取接口出错了")})},closeModal:function(e){this.modal[e]=!1}},components:{layoutMain:i.default,queryLayout:r.default}}},157:function(e,t,o){var a,n;o(158),a=o(159),n=o(160),e.exports=a||{},e.exports.__esModule&&(e.exports=e.exports.default),n&&(("function"==typeof e.exports?e.exports.options:e.exports).template=n)},158:function(e,t){},159:function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={}},160:function(e,t){e.exports=' <div class=querylist-panel _v-8fd6bec6=""> <div class=condition _v-8fd6bec6=""> <slot name=condition _v-8fd6bec6=""> </slot> </div> <div class=q-panel _v-8fd6bec6=""> <slot name=panel _v-8fd6bec6=""> </slot> </div> </div> '},272:function(e,t){e.exports=' <layout-main _v-47cd8dce=""> <query-layout slot=main _v-47cd8dce=""> <div slot=condition class=condition _v-47cd8dce=""> <span class=title _v-47cd8dce="">REVENUE REPORTS</span> <radio-group :model.sync=query.os _v-47cd8dce=""> <radio value=all _v-47cd8dce=""> <icon type=android-apps _v-47cd8dce=""></icon> <span _v-47cd8dce="">ALL</span> </radio> <radio value=ios _v-47cd8dce=""> <icon type=social-apple _v-47cd8dce=""></icon> <span _v-47cd8dce="">IOS</span> </radio> <radio value=android _v-47cd8dce=""> <icon type=social-android _v-47cd8dce=""></icon> <span _v-47cd8dce="">Android</span> </radio> </radio-group> &nbsp;&nbsp; <i-select class=f-r :model.sync=query.country style=width:100px;text-align:left _v-47cd8dce=""> <i-option v-for="k in query.countryData" :value=k.value _v-47cd8dce="">{{ k.name }}</i-option> </i-select> &nbsp;&nbsp; <date-picker :value.sync=query.dateRange format=yyyy/MM/dd :options=query.dateOptions type=daterange placement=bottom-end placeholder=选择日期 class=date style="width: 200px" _v-47cd8dce=""> </date-picker> <i-button type=primary icon=ios-search @click=onSearch(1) _v-47cd8dce="">搜索</i-button> </div> <div slot=panel class=tables-panel _v-47cd8dce=""> <i-table @on-sort-change=onSortChange :content=self :columns=table.columns :data=table.data _v-47cd8dce=""></i-table> <br _v-47cd8dce=""> <page v-if="table.total > table.pageSize" :total=table.total @on-change=onSearch class=flr :current=table.page _v-47cd8dce=""></page> <spin size=large fix="" v-if=table.loading _v-47cd8dce=""></spin> </div> </query-layout> </layout-main> '}});