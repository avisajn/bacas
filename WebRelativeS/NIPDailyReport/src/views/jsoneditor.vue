<template>
    <layout-main>
        <div slot="main" class="editor-container">
            <div class="header" id="editor_header">
                <ul class="clearfix head-nav">
                    <li v-for="item in jsonFileList" :class="{active: item.name == current.name}" @click="fileTabClick(item.name)" >{{item.name}}</li>
                </ul>
            </div>
            <div class="content-body">
                <div class="content-right-table">
                    <div class="table-nav">
                        <i-button type="info" @click="createRow" size="small">新建行</i-button>
                        <i-button type="success" size="small" @click="copySelectRow">复制选中行</i-button>
                        <div class="custom-column" style="display: inline-block;">
                            <i-button v-show="!column.edit" type="success" size="small" @click="column.edit = true">添加一列</i-button>
                            <div v-show="column.edit">
                                <i-input style="width:90px;" @on-enter="addColumnToTable" :value.sync="column.newName" size="small" placeholder="column name" class="editinput"></i-input>
                                <i-button type="primary" size="small" @click="addColumnToTable" class="submit">创建</i-button>
                            </div>
                        </div>
                        <!-- <i-button type="primary" size="small">按关键字修改</i-button> -->
                        <div class="head-btn-panel editinput">
                            <i-input size="small" @on-enter="onContainerSearch" :value.sync="containerName" style="width:100px;" placeholder="container name"></i-input>
                            <i-button type="primary" shape="circle" icon="ios-search" size="small" @click="onContainerSearch"></i-button>
                            <i-button type="text" @click="form.modal = true">新建JSON文件</i-button>
                            <i-button type="text" @click="onSubmit">{{submitText}}</i-button>
                        </div>
                    </div>
                    <div class="table-panel">
                        <table cellspacing="0" cellpadding="0" border="0" class="custom-tb">
                            <colgroup>
                              <col width="40">
                              <col width="85">
                              <col width="150">
                              <col width="80">
                              <col width="auto">
                              <col width="120">
                              <col width="100">
                              <col width="90">
                              <col width="80">
                              <col width="100">
                            </colgroup>
                          <thead>
                            <tr>
                                <th></th>
                                <th @click="onSortChange(c)" v-for="c in table.column"> <span>{{c.title}}</span></th>
                            </tr>
                          </thead>
                          <tbody>
                                <tr @dblclick="onTableDblClick(row)" :key="row.i" v-for="row in table.datasource">
                                    <td class="td-checkbox"><input v-model="table.select" :value="row.i" type="checkbox"></td>
                                    <td v-for="c in table.column" v-bind:style="{ width: c.width?c.width+'px':false}">
                                        <span v-bind:class="{ 'cloned': row.clone }" v-show="!row.editble">{{row[c.key]}}</span>
                                        <div v-show="row.editble" v-bind:style="{width:c.opt?'130px':'auto'}">
                                            <input class="edit-input" @keyup.enter="editOver" v-bind:style="{width:c.opt?'80px':'100%'}" v-model="table.editRow[c.key]"></input>
                                            <button v-if="c.opt" @click="deleteRow(row.i)">删除</button>
                                        </div>
                                    </td>
                                </tr>
                          </tbody>
                        </table>
                        <!-- <i-table border 
                            size="small"
                            :content="self"
                            :columns="table.column" 
                            :data="table.datasource"
                            class="jsonEditorTableGrid"
                            @on-select="onTableSelect"
                            @on-select-all="onTableSelectAll"
                            @on-sort-change="onSortChange" 
                            @on-row-dblclick="onTableDblClick"
                        >
                        </i-table> -->
                        <Spin fix v-if="table.loading"></Spin>
                    </div>
                </div>
            </div>
            <div v-show="loading" class="panel-loading">
                <Spin size="large" class="myloading"></Spin>
            </div>
            <Modal
                title="表单"
                :visible.sync="form.modal"
                class="no-foot-modal">
                <Tabs 
                    active-key="key_form"
                    @on-click="formTabClick"
                >
                    <Tab-pane key="key_form" label="表单">
                        <i-form v-ref:form-validate label-position="top" :rules="form.ruleValidate" :model="form.formValidate">
                            <Form-item prop="filename" label="File Name">
                                <i-input type="text" :value.sync="form.formValidate.filename">
                                </i-input>
                            </Form-item>
                            <Form-item prop="AppName" label="AppName">
                                <i-input type="text" :value.sync="form.formValidate.AppName">
                                </i-input>
                            </Form-item>
                            <Form-item prop="ConfigName" label="ConfigName">
                                <i-input type="text" :value.sync="form.formValidate.ConfigName">
                                </i-input>
                            </Form-item>
                            <Form-item prop="ExpireInSeconds" label="ExpireInSeconds">
                                <i-input type="text" :value.sync="form.formValidate.ExpireInSeconds">
                                </i-input>
                            </Form-item>
                        </i-form>
                    </Tab-pane>

                    <Tab-pane label="代码">
                        <i-input :value.sync="form.code" type="textarea" :autosize="{minRows: 10,maxRows: 10}"></i-input>
                    </Tab-pane>
                </Tabs>
                <div>
                    <i-button type="primary" long @click="formJsonSubmit"> {{form.btnText}} </i-button>
                </div>
            </Modal>

            <!-- <Modal
                title="排序规则"
                :visible.sync="sort.modal"
                class="no-foot-modal"> -->
               <!--  <draggable :value.sync="table.column" :options="{group:'people'}" @start="drag=true" @end="drag=false">
                   <div v-for="k in table.column">{{k.title}}</div>
                </draggable> -->
                <!-- <div v-dragable-for="k in table.column"> -->
                  <!-- <p>{{l.title}}</p> -->
                <!-- </div> -->
            <!-- </Modal> -->
        </div>
    </layout-main>
</template>
<script>
    // import draggable from 'vuedraggable'; 
    import layoutMain from '../components/layout';
    import firstBy from 'thenby';
    import API from '../libs/api';
    import Store from '../libs/store';
    let today = window.lastDate;
    let startDay = window.startDay;


    export default {
        data(){
            return {
                self : this,
                containerName : '',
                jsonFileList : [] ,

                sort : {
                    modal : true,
                    clickSort : [],
                    tableColumn  : []
                },

                form : {
                    formValidate: {
                        filename : '',
                        AppName : '',
                        ConfigName: '',
                        ExpireInSeconds : '',
                    },
                    ruleValidate: {
                        filename: [{ required: true, trigger: 'blur' } ],
                        AppName: [{ required: true, trigger: 'blur' } ],
                        ConfigName: [{ required: true, trigger: 'blur' } ],
                        ExpireInSeconds: [{ required: true, trigger: 'blur' } ],
                    },
                    loading:false,
                    modal : false,
                    btnText : '提交',
                    code : ''
                },

                submitText : '提交',

                current : {
                    name : '',
                    key : '',
                },
                column : {
                    baseKeys : [],
                    edit : false,
                    newName : '',
                },
                left : {
                    editItem : '',
                    newName : '',
                },
                table : {
                    datasource : [],
                    loading : false,
                    select : [],
                    column : [{
                        title : '-',
                        key : 'AdPlacementId'
                    }],
                    editRow : {
                        AdExpireInSeconds : '',
                        AdPlacementCPC : '',
                        AdPlacementId : '',
                        AdPlacementName : '',
                        AdPlacementPriority : '',
                        AdPlacementType : '',
                        AdRequestCount : '',
                        AdRequestTimeoutInSeconds : '',
                    },
                    selectRowData : {},
                },
                // 每个JSON文件共有的
                AdUnitDetails : {} ,
                AppName : '',
                ConfigName : '',
                ExpireInSeconds : '',
                loading : true
            }
        },

        ready(){
            window.Loading.hide();
            const self = this;
            // get container name
            this.containerName = Store.get('json-container-name') || 'test';
            

            this.onContainerSearch();
            window.onEsc = function () {
                self.editOver();
            }
        },

        methods : {
            getContent(name){
                const self = this;
                const containerName = self.containerName;
                if(!containerName) return this.$Notice.error({title: 'Container 为空'});
                this.loading = true;
                return new Promise(async function(r){
                    self.current.name = name;
                    const res = await API.json.getContent(name ,containerName);
                    const AdUnitDetails = res.AdUnitDetails;
                    if(!AdUnitDetails) return;
                    let defColumn = res.ColumnMapping;
                    if(defColumn.length <= 0){
                        defColumn = Store.get('json-editor-column-mapping');
                    }else{
                        Store.set('json-editor-column-mapping' ,defColumn);
                    }
                    self.column.baseKeys = defColumn;
                    self.loadCloumn();

                    self.AdUnitDetails = AdUnitDetails;
                    self.ExpireInSeconds = res.ExpireInSeconds;
                    self.ConfigName = res.ConfigName;
                    self.AppName = res.AppName;
                    const datasource = JSON.parse(JSON.stringify(AdUnitDetails));
                    // self.table.datasource = datasource.sort((v1 ,v2) => {
                    //    return (v1['AdPlacementPriority']+"").localeCompare(v2['AdPlacementPriority']+"")
                    // });

                    self.table.datasource = datasource.sort(
                        firstBy(function (v1, v2) { return (v1['Type']+"").localeCompare(v2['Type']+""); })
                        .thenBy(function (v1, v2) { return (v1['AdPlacementPriority']+"").localeCompare(v2['AdPlacementPriority']+""); })
                    );

                    self.table.loading = false;
                    self.loading = false;
                    // setTimeout(function(){
                    //     window.tableTabLoadDrag();
                    // },100);
                    r();
                });
            },

            getSingleColumn(columnName ,isOpt){
                const obj = {
                    title:columnName ,
                    key:columnName ,
                    opt:isOpt,
                    order : 'asc'
                }
                if(columnName == 'AdPlacementId') obj['width'] = 380;
                return obj;
            },

            loadCloumn(){
                const baseKeys = this.column.baseKeys;
                const columns = [];
                for(let i=0,len=baseKeys.length;i<len;i++){
                    if(i == (len-1)){ // last
                        columns.push(this.getSingleColumn(baseKeys[i], true));
                    }else{
                        columns.push(this.getSingleColumn(baseKeys[i], false));
                    }
                }
                this.table.column = columns;
            },
            addColumnToTable(){
                const name = this.column.newName;
                if(!name){
                    this.column.edit = false;
                    return;
                }
                const base = JSON.parse(JSON.stringify(this.column.baseKeys));
                base.push(name);
                Store.set('jsoneditor-column',base ,60*60*24*30);
                this.column.baseKeys = base;
                this.column.newName = '';
                this.column.edit =false;
                this.loadCloumn();
            },

            onContainerSearch(){
                const self = this;
                const containerName = self.containerName;
                if(!containerName) return this.$Notice.error({title: 'Container 为空'});
                self.loading = true;
                API.json.getlist(containerName).then(async function(k){
                    if(k.err) {
                        self.loading = false;
                        return self.$Notice.error({title: '错误', desc: k.err ,duration:7});
                    }
                    Store.set('json-container-name' ,containerName);
                    self.jsonFileList = k;
                    await self.getContent(k[0].name);
                    self.loading = false;
                });
            },

            // 新建JSON表单系列
            formTabClick(t){
                const {AppName, ConfigName, ExpireInSeconds} = this.form.formValidate;
                this.form.code = JSON.stringify({
                    AdUnitDetails : [],
                    AppName: AppName,
                    ConfigName: ConfigName,
                    ExpireInSeconds: ExpireInSeconds
                });
            },
            formJsonSubmit(){
                const self = this;
                const containerName = self.containerName;
                if(!containerName) return this.$Notice.error({title: 'Container 为空'});
                this.$refs['formValidate'].validate((valid) => {
                    if (valid) {
                        let data = this.form.formValidate;
                        let filename = data.filename;
                        if(filename.indexOf('.json')<0) filename = filename+'.json';
                        this.form.loading = true;
                        this.form.btnText = '提交中';
                        API.json.creageJsonFile({
                            name : filename ,
                            appname : data.AppName,
                            configname : data.ConfigName,
                            expireinseconds : data.ExpireInSeconds,
                            cname : containerName+''
                        }).then((k) => {
                            const oldFileList = this.jsonFileList;
                            oldFileList.push({name:filename});
                            this.jsonFileList = JSON.parse(JSON.stringify(oldFileList));

                            // 提交成功！
                            this.form.loading = false;
                            this.form.btnText = '新建';
                            this.$Notice.info({title: '提交成功'});



                        },(e) => {
                            this.form.loading = false;
                            this.form.btnText = '提交';
                            this.$Notice.error({title: e.err});
                        });
                        
                    } else {
                        this.form.loading = false;
                        this.form.btnText = '登录';
                        return;
                    }
                })
            },

            async fileTabClick(k){
                const $panel = document.querySelector('#editor_header');
                let left = 0;
                const $dom = document.querySelectorAll('.head-nav li');
                for(let i=0,len=$dom.length;i<len;i++){
                    const {textContent ,clientWidth }=  $dom[i];
                    if(textContent == k){
                        break;
                    }
                    left += clientWidth;
                }
                left = (left-100) < 0 ? 0 : (left-100);
                $panel.scrollLeft = left;
                await this.getContent(k);
            },
            clearSelect(){
                this.table.editRow = {};
                this.table.selectRowData = {AdPlacementId:'' ,AdPlacementName:''}; 
            },

            deleteRow(i ){
                const datasource = this.table.datasource || [];
                const newSource = [];
                datasource.map((k)=>{
                    k.editble = false; 
                    if(k.i == i) return;
                    newSource.push(k);
                });
                this.table.datasource = newSource;
                // 先赋值
                const adunitDetail = JSON.parse(JSON.stringify(this.AdUnitDetails));
                const key = this.current.key;
                if(!key) return;
                adunitDetail[key] = newSource;
                this.AdUnitDetails = adunitDetail;

            },


            onTableSelect(s ,r ,i){
                console.log('s:',s,r,i);
                return;
                this.table.select = s;
            },
            onTableSelectAll(){
                this.table.select = JSON.parse(JSON.stringify(this.table.datasource ));
            },
            copySelectRow(){
                const selectRows = JSON.parse(JSON.stringify(this.table.select));

                let datasource = JSON.parse(JSON.stringify(this.table.datasource ));
                const newData = [];
                let _temp_i = null;
                let k = null;
                let selectRowsLen = selectRows.length;
                for(let i=0,len=datasource.length;i<len;i++){
                    k = datasource[i];
                    _temp_i = k.i;
                    for(let j=0;j<selectRowsLen;j++){
                        if(_temp_i == selectRows[j]) {
                            const _t = JSON.parse(JSON.stringify(k))
                            _t.AdPlacementId = _t.AdPlacementId+'_copy';
                            _t.clone = true;
                            _t.i = _t.AdPlacementId +'-'+(Math.random()*10000);
                            newData.push(_t);
                            break;
                        }
                    }
                }
                datasource = datasource.concat(newData);
                this.table.datasource = datasource;
                this.table.select = [];
            },

            createRow(){
                const datasource = JSON.parse(JSON.stringify(this.table.datasource || []));
                let isEmpty = false;
                datasource.map((k)=>{
                    k.editble = false; 
                    if(!k.i) isEmpty = true;
                });
                if(isEmpty) return;
                const i = new Date().getTime();
                datasource.push({i : i, editble : true });
                this.table.selectRowData = {i : i }
                this.table.datasource = datasource;
            },

            editOver(){
                // console.log('editOver:');
                // return;
                this.table.loading = true;
                const data = JSON.parse(JSON.stringify(this.table.editRow));
                
                const {i} = this.table.selectRowData;
                const datasource = JSON.parse(JSON.stringify(this.table.datasource || []));
                datasource.map((k) => {
                    k.editble = false;
                    if(k.i == i){
                        for(let _k in data){
                            k[_k] = data[_k];
                        }
                        delete k.clone;
                    }
                });
                this.clearSelect();
                this.table.datasource = datasource;
                this.AdUnitDetails = datasource;
                this.table.loading = false;
            },


            onSortChange(o){
                const columnName = o.key;
                let arr = this.table.datasource;
                if(o.order == 'asc'){
                    o.order = 'desc';
                    if(columnName == 'AdPlacementPriority'){
                        this.table.datasource = arr.sort((v1 ,v2) => {
                           return (v1[columnName]+"").localeCompare(v2[columnName]+"")
                        });
                    }else{
                        this.table.datasource = arr.sort(
                            firstBy(function (v1, v2) { return (v1[columnName]+"").localeCompare(v2[columnName]+""); })
                            .thenBy(function (v1, v2) { return (v1['AdPlacementPriority']+"").localeCompare(v2['AdPlacementPriority']+""); })
                        );
                    }

                }else{
                    o.order = 'asc';
                    if(columnName == 'AdPlacementPriority'){
                        this.table.datasource = arr.sort((v1 ,v2) => {
                           return (v1[columnName]+"").localeCompare(v2[columnName]+"")
                        });
                    }else{
                        this.table.datasource = arr.sort(
                            firstBy(function (v1, v2) { return (v2[columnName]+"").localeCompare(v1[columnName]+""); })
                            .thenBy(function (v1, v2) { return (v1['AdPlacementPriority']+"").localeCompare(v2['AdPlacementPriority']+""); })
                        );
                    }
                }
            },

            onSubmit(){
                this.editOver();
                // return;
                if(this.submitText != '提交') return;
                const self = this;
                const containerName = self.containerName;
                if(!containerName) return this.$Notice.error({title: 'Container 为空'});
                this.submitText = '提交中...';
                
                API.json.submitContent({
                    AdUnitDetails : this.AdUnitDetails,
                    AppName : this.AppName,
                    ConfigName : this.ConfigName,
                    ExpireInSeconds : this.ExpireInSeconds,
                } ,this.current.name ,containerName).then((k) => {
                    if(k.err) {
                        self.$Notice.error({title: '错误', desc: k.err ,duration:7});
                    }else{
                        this.submitText = '保存完成！';
                    }
                    setTimeout((k) => {
                        this.submitText = '提交';
                    },2000);
                })
            },

            onTableDblClick(obj){
                // this.table.loading = true;
                setTimeout(() => {
                    const {i:oi} = this.table.selectRowData;
                    const data = JSON.parse(JSON.stringify(this.table.editRow));

                    const datasource = JSON.parse(JSON.stringify(this.table.datasource  || []));
                    const i = obj.i;
                
                    datasource.map((k) => {
                        if(k.i == oi){
                            for(let _k in data){
                                k[_k] = data[_k];
                            }
                        }
                        if(k.i == i) k.editble = true;
                        else k.editble = false;
                    });
                    this.table.editRow = JSON.parse(JSON.stringify(obj));
                    this.table.selectRowData = {i:i};
                    // const overData = JSON.parse(JSON.stringify(datasource));
                    this.table.datasource = datasource;
                    // setTimeout(() => {
                        // this.table.loading = false;
                    // },100);
                },10);
                // 正在编辑的
                // this.AdUnitDetails[this.current.key] = overData;
            }
        },

        components : {
            layoutMain ,
            // draggable
        }
    }
</script>
<style scoped lang="less">
    .custom-tb{
        th{
            background-color: #f5f7f9;
            padding:2px 4px;
            text-align:left;
            border-bottom: 1px solid #e3e8ee;
            border-right: 1px solid #e3e8ee;
            cursor:pointer;
            >span{
                display: inline-block;
                position:relative;
                padding-right: 5px;
                text-overflow: ellipsis;
                white-space: normal;
                word-break: break-all;
            }
            >span::after{
                content:'';
                background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEUAAACKioqKioqLi4uKioqKiopqMWV4AAAABXRSTlMA8GBAMNp6pJ8AAAAgSURBVAjXYyASMClAGabBEJpFNNABQxVCCqYYoZ04AAC+pAKpS6FeCwAAAABJRU5ErkJggg==');
                display: inline-block;
                width: 8px;
                height: 12px;
                background-size: 16px;
                background-repeat: no-repeat;
                background-position: -5px -3px;
                position: absolute;
                right: -4px;
                top: 50%;
                margin-top: -5px;
            }
        }
        tbody{
            td{
                border-right: 1px solid #e3e8ee;
                border-bottom:1px solid #e3e8ee;
                padding:4px;
            }
            .edit-input{
                width:100%;
                min-width: 50px;
            }
            .cloned{
                color: #39f;
            }
        }
    }

    .editor-container{
        height: 100%;
        width: 100%;
        overflow: hidden;
    }
    .header{
        overflow-x: scroll;
    }
    .head-nav{
        height: 36px;
        margin: 10px 20px 0px 20px;
        border-bottom: 1px solid #d7dde4;
        position:relative;
        white-space: nowrap;
        >li{
            display:inline-block;
            height: 100%;
            line-height: 29px;
            margin-right: 15px;
            cursor:pointer;
            white-space: nowrap;
        }
        .active{
            color: #5cadff;
            -webkit-transition: color .3s ease-in-out;
            transition: color .3s ease-in-out;
            border-bottom:2px solid #39f;
        }
    }
    .content-body{
        position: absolute;
        left: 0px;
        right: 0px;
        bottom: 0px;
        top: 50px;
        margin: 0px 20px;
        .content-right-table{
            height:100%;
            margin-left:0px;
            overflow: hidden;
            position: relative;
            .table-nav{
                position: absolute;
                top: 0px;
                right: 0px;
                left: 0px;
                height: 35px;
                z-index: 9;
                margin-top: 5px;
                box-shadow: 0px 2px 4px rgba(222, 216, 216, 0.48);
            }
            .table-panel{
                position: absolute;
                top: 44px;
                bottom: 0px;
                overflow: auto;
                left: 0px;
                right: 0px;
            }
        }
    }
    .left-lists{
        li{
            border-bottom: 1px solid rgba(187, 187, 187, 0.18);
            border-left: 2px solid rgba(255, 255, 255, 0);
            cursor: pointer;
            position:relative;
            height: 30px;
            line-height: 30px;
            .item{
                >label{
                    position:absolute;
                    left:0px;
                    top:0px;
                    bottom:0px;
                    right:85px;
                }
                >.opt-panel{
                    position:absolute;
                    right:0px;
                    top:0px;
                    bottom:0px;
                    width:85px;
                    display:none;
                }
            }
        }
        .active{
            background: rgba(51, 153, 255, 0.7);
            color: white;
            .item{
                >.opt-panel{
                    display:inline-block;
                    color: red;
                }
            }
        }
        .new{
            color: #00cc66;
        }
    }
    .panel-loading{
        position: absolute;
        left: 0px;
        background: rgba(0, 0, 0, 0.16);
        right: 0px;
        top: 0px;
        bottom: 0px;
        z-index: 99999;
        text-align: center;
        .myloading{
            display: inline-block;
            top: 50%;
            position: fixed;
            margin-top: -20px;
        }
    }
    .head-btn-panel{
        float:right;
    }
</style>