<template>
    <div class="permission-info clearfix">
        <Tabs :active-key="sysid" @on-click="tabClick">
            <Tab-pane v-for="item in sysdata.sys" :label="item.name" :key="item.id+''"></Tab-pane>
        </Tabs>
        <div  style="height:210px;">
            <div v-if="transfer.data.length > 0">
                <Transfer
                    :data="transfer.data"
                    :target-keys="transfer.targetKeys"
                    :titles="transfer.title"
                    :list-style="transfer.listStyle"
                    :render-format="render"
                    class="transfer"
                    @on-change="handleChange">
                </Transfer>
            </div>
        </div>
        <div style="margin-top: 10px;">
            <i-button type="primary" @click="onSubmit">提交保存</i-button>
            <i-button type="ghost" @click="closeModal">关闭</i-button>
        </div>
    </div>
</template>
<script>
    let infoList = null;
    let sysChecked = {};
    import moment from 'moment';
    import API from '../../libs/api';
    export default {
        props : ['closeModal' ,'id' ,'sysdata'],
        data (e) {
            return {
                sysid : 0,
                roleid : 0,
                listdata : [],
                transfer : {
                    title : ['未选择的权限','已选择的权限'],
                    listStyle : {width: '300px', },
                    data : [],
                    targetKeys : [],
                },
            }
        },
        methods: {
            render (item) {
                return item.name + ' - ' + item.label + ' - '+item.desc;
            },
            handleChange (newTargetKeys, direction, moveKeys) {
                sysChecked[this.sysid] = newTargetKeys;
                this.transfer.targetKeys = newTargetKeys;
            },

            tabClick(n){
                this.sysid = n;
                this.transfer.data = [];
                setTimeout((k) => {
                    this.transfer.data = infoList[n];
                },50);
                this.transfer.targetKeys = [];
                this.transfer.targetKeys = sysChecked[n];
            },

            closeModal(){
                this.$emit('close')
            },
            getInfoList(){
                let roleid = this.roleid;
                if(!roleid) return;
                API.role.getInfoList(roleid).then((data) => {
                    console.log('closeModal:',data);
                    sysChecked = data;
                    this.transfer.targetKeys = data[this.sysid] || [];
                })
            },
            onSubmit(){
                console.log('sysChecked:',sysChecked);
                API.role.setPermisstion({data:sysChecked ,roleid:this.roleid}).then((k) => {
                    console.log('k',k);
                    this.$Notice.success({title: '保存成功！'});
                })
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
                let i=0;
                let first = null;
                for(let k in infoList){
                    if(i==0){first = k+''; }
                }
                this.sysid = first;
                this.transfer.data = infoList[first];
            }
        }
    }
</script>
<style scoped lang="less">
    .permission-info{
        width:728px;
        text-align:center;
        .transfer{
            text-align:left;
            display: inline-block;
        }
    }
</style>

