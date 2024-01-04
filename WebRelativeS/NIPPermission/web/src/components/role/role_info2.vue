<template>
    <div class="permission-info clearfix">
        <div class="menu">
            <Radio-group :model.sync="sysid" vertical @on-change="onSysChange">
                <Radio v-for="item in sysdata.sys" :value="item.id" >{{ item.name }}</Radio>
            </Radio-group>
        </div>
        <div class="tblist">
            <table>
                <thead>
                   <tr><th>key</th><th>类型</th><th>描述</th></tr>
                </thead>
            </table>
            <div class="scroll">
                <table v-if="listdata.length > 0">
                    <tbody v-if="listdata.length > 0">
                        <tr v-for="item in listdata">
                            <td> 
                                <Checkbox 
                                    :checked="item.checked" 
                                    :value="item.id" 
                                    @on-change="onSubmit(item.id ,item.rid)"
                                >{{item.key}}
                                </Checkbox> 
                            </td>
                            <td>{{item.type}}</td>
                            <td>{{item.desc}}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="tb-none" v-else>
                    没有数据
                </div>
            </div>
            <br/>
            <div style="text-align:right;">
                <i-button type="ghost" @click="closeModal" style="margin-left: 8px">关闭</i-button>
            </div>
        </div>
    </div>
</template>
<script>
    let infoList = null;
    import moment from 'moment';
    import API from '../../libs/api';
    export default {
        props : ['closeModal' ,'id' ,'sysdata'],
        data (e) {
            return {
                sysid : 0,
                roleid : 0,
                listdata : []
            }
        },
        methods: {
            onSysChange(n){
                this.listdata = infoList[n] || [];
                console.log('infoList[n]',infoList[n]);
            },

            closeModal(){
                this.$emit('close')
            },
            getInfoList(){
                let roleid = this.roleid;
                if(!roleid) return;
                API.role.getInfoList(roleid).then((data) => {
                    let _currarr ;
                    let _allarr;
                    let _allarrlen;
                    let _id = null;
                    let ishave = false;
                    for(let item in data){  // 验证系统
                        _currarr = data[item];
                        _allarr = infoList[item];
                        _allarrlen = _allarr.length;
                        for(let i=0,len=_currarr.length;i<len;i++){ // 遍历所拥有的权限
                            ishave = false;
                            _id = _currarr[i];
                            for(let j=0;j<_allarrlen;j++){
                                if(_id == _allarr[j].id){ishave = true; break; }
                            }
                            if(ishave){
                                infoList[item][i].checked = true;
                                infoList[item][i].rid = _id;
                            }else{
                                infoList[item][i].checked = false;
                                infoList[item][i].rid = '';
                            }
                        }
                    }
                    console.log('infoList:',infoList);
                })
            },
            onSubmit(infoid ,_id){
                let param = {
                    sysid : this.sysid,
                    roleid : this.roleid,
                    sysinfoid : infoid,
                };
                if(_id){
                    param['id'] = _id;
                }

                console.log('_id',infoList[this.sysid] ,_id);
                // API.role.setPermisstion(param).then((k) => {
                //     console.log('k',k);
                // })
            }
        },
        watch : {
            id(id ,o){
                if(id){
                    this.roleid = id;
                    this.getInfoList();
                }
            },
            sysdata(n){
                infoList = n.info;
            }
        }
    }
</script>
<style scoped lang="less">
    .permission-info{
        width:728px;
        .menu{width:140px;float:left;}
        .tblist{
            width:588px;
            float:left;
        }
    }
    table{border-collapse:collapse;border-spacing:0;}
    /* 表头固定内容滚动的表格  */
    .tblist{margin:0 0 20px;line-height:18px;}
    .tblist .scroll{max-height:206px;border:1px solid #ddd;border-top:0;overflow-y:auto;}
    .tblist table{width:100%;table-layout:fixed;}
    .tblist th,.tblist td{width:130px;padding:5px;border:1px solid #ddd;}
    .tblist th{font-weight:bold;background:#eee;}
    .tblist thead th:last-child,.tblist tbody td:last-child{width:auto;}
    .tblist tbody tr:nth-child(2n){background:#fafafa;}
    .tblist tbody tr:first-child td{border-top:0;}
    .tblist tbody tr:last-child td{border-bottom:0;}
    .tblist tbody tr td:first-child{border-left:0;}
    .tblist tbody tr td:last-child{border-right:0;}
    .tb-none{
        padding:10px;
        text-align:center;
    }
</style>

