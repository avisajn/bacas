<template>
    <layout-main>
        <div slot="main" class="editor-container">
            <div class="header" id="editor_header">
                <ul class="clearfix head-nav">
                    <li v-for="item in jsonFileList" :class="{active: item.name == current.name}" @click="fileTabClick(item.name)" >{{item.name}}</li>
                </ul>
            </div>
            <div class="content-body">
                <div class="content-left-menu">
                    <ul class="left-lists">
                        <li :class="{ active: k==current.key ,edititem:left.editItem == k}"  v-for="k in leftData">
                            <div class="item">
                                <label @click="selectKey(k)">{{k}}</label>
                                <div class="opt-panel">
                                    <span @click="editKey(k)">edit</span>
                                    <span @click="cloneKey(k)">clone</span>
                                    <span @click="deleteKey(k)">del</span>
                                </div>
                            </div>
                            <div v-if="left.editItem == k">
                                <i-input style="width:90px;" @on-enter="saveKeyName" :value.sync="left.newName" size="small" class="editinput"></i-input>
                                <i-button type="primary" size="small" @click="saveKeyName" class="submit">保存</i-button>
                            </div>
                        </li>
                        <li v-show="!keyCreate.edit" class="new clearfix" @click="this.keyCreate.edit = true"> 新建 </li>
                        <li v-show="keyCreate.edit" class="create-panel">
                            <i-input style="width:90px;" @on-enter="createKey" :value.sync="keyCreate.name" size="small" class="editinput"></i-input>
                            <i-button type="primary" size="small" @click="createKey" class="submit">创建</i-button>
                        </li>
                    </ul>
                </div>
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
                        <i-table border 
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
                        </i-table>
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
        </div>
    </layout-main>
</template>
<script>
    
    import layoutMain from '../components/layout';
    import API from '../libs/api';
    import Store from '../libs/store';
    let today = window.lastDate;
    let startDay = window.startDay;

    window.tabSize = function (id) {
        var i,
            self,
            table = document.getElementById(id),
            header = table.rows[0],
            tableX = header.clientWidth,
            length = header.cells.length;

        for (i = 0; i < length; i++) {
            header.cells[i].onmousedown = function () {
                self = this;
                if (event.offsetX > self.offsetWidth - 10) {
                    self.mouseDown = true;
                    self.oldX = event.x;
                    self.oldWidth = self.offsetWidth;
                }
            };
            header.cells[i].onmousemove = function () {
                if (event.offsetX > this.offsetWidth - 10) {
                    this.style.cursor = 'col-resize';
                } else {
                    this.style.cursor = 'default';
                }
                if (self == undefined) {
                    self = this;
                }
                if (self.mouseDown != null && self.mouseDown == true) {
                    self.style.cursor = 'default';
                    if (self.oldWidth + (event.x - self.oldX) > 0) {
                        self.width = self.oldWidth + (event.x - self.oldX);
                    }
                    self.style.width = self.width;
                    table.style.width = tableX + (event.x - self.oldX) + 'px';
                    self.style.cursor = 'col-resize';
                }
            };
            table.onmouseup = function () {
                if (self == undefined) {
                    self = this;
                }
                self.mouseDown = false;
                self.style.cursor = 'default';
                tableX = header.clientWidth;
            };
        }
    };

    window.tableTabLoadDrag = function(){
        const $panel = document.querySelector('.jsonEditorTableGrid');

        const tableHeader = $panel.querySelectorAll('.ivu-table-header>table')[0];
        const tableBody = $panel.querySelectorAll('.ivu-table-body>table')[0];
        const cols = tableHeader.querySelectorAll('colgroup col');
        const bodyCols = tableBody.querySelectorAll('colgroup col');

        let header = tableHeader.rows[0],
            tableX = header.clientWidth,
            length = header.cells.length;

        const loadEvent = function(dom ,col ,bodyCol){
            let self = null;
            dom.onmousedown = function(event){
                self = this;
                // if (event.offsetX > self.offsetWidth - 10) {
                    self.mouseDown = true;
                    self.oldX = event.x;
                    self.oldWidth = self.offsetWidth;
                // }
            }
            dom.onmousemove = function(event){
                if (event.offsetX > this.offsetWidth - 10) {
                    this.style.cursor = 'col-resize';
                } else {
                    this.style.cursor = 'default';
                }
                if (self == undefined) {
                    self = this;
                }
                if (self.mouseDown != null && self.mouseDown == true) {
                    self.style.cursor = 'default';
                    const offsetWidth = (event.x - self.oldX);
                    const width = self.oldWidth + offsetWidth ;
                    col.width = width;
                    bodyCol.width = width;
                    self.style.cursor = 'col-resize';
                }
            }
            dom.onmouseup = function(e){
                if (self == undefined) {
                    self = this;
                }
                const offsetWidth = parseInt(col.width)- parseInt(self.oldWidth);
                const tableWidth = parseInt(tableHeader.style.width ) + offsetWidth;
                tableHeader.style.width = tableWidth+'px';
                
                tableBody.style.width = tableWidth+'px';
                console.log(offsetWidth,tableBody);
                self.mouseDown = false;
                self.style.cursor = 'default';
            }
        }


        for (let i = 0; i < length; i++) {
            loadEvent(header.cells[i] ,cols[i] ,bodyCols[i]);
        }
    }



    export default {
        data(){
            return {
                self : this,
                containerName : '',
                jsonFileList : [] ,
                keyCreate : {
                    edit : false,
                    name : '',
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
                leftData : [],
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
                    column : [],
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
            const defColumn = Store.get('jsoneditor-column') || ['AdExpireInSeconds',
                'AdPlacementCPC',
                'AdPlacementId',
                'AdPlacementName',
                'AdPlacementPriority',
                'AdPlacementType',
                'AdRequestCount',
                'AdRequestTimeoutInSeconds'
            ];
            this.column.baseKeys = defColumn;
            this.loadCloumn();

            this.onContainerSearch();
            window.onEsc = function () {
                self.editOver();
                self.left = {
                    editItem : '',
                    newName : '',
                }
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
                    if(!res.AdUnitDetails) return;
                    const AdUnitDetails = res.AdUnitDetails;
                    self.AdUnitDetails = AdUnitDetails;
                    self.ExpireInSeconds = res.ExpireInSeconds;
                    self.ConfigName = res.ConfigName;
                    self.AppName = res.AppName;
                    const keys = Object.keys(AdUnitDetails);
                    self.leftData = keys.sort((v1 ,v2) => {
                       return v1.localeCompare(v2);
                    });
                    self.current.key = keys[0];
                    const datasource = AdUnitDetails[keys[0]] || [];
                    self.table.datasource = datasource.sort((v1 ,v2) => {
                       return (v1['AdPlacementPriority']+"").localeCompare(v2['AdPlacementPriority']+"")
                    });
                    self.table.loading = false;
                    self.loading = false;
                    setTimeout(function(){
                        window.tableTabLoadDrag();
                    },100);
                    r();
                });
            },

            getSingleColumn(columnName ,isOpt){
                let size = 120;
                const cobj = {sortable: 'custom',title:columnName ,key:columnName};
                // if(columnName.indexOf('AdPlacementCPC') >= 0 || columnName.indexOf('AdPlacementId') >= 0) {
                if(columnName.indexOf('AdRequestTimeoutInSeconds') >= 0 ) {

                }else{
                    cobj['width'] = size;
                }

                if(isOpt){  // 操作列
                    cobj['render'] = function (r) {
                        let v = r[columnName];
                        if(typeof(v) == 'undefined') v = '';
                        if(r.editble == true) 
                            return `<i-input @on-enter="editOver" style="width:30px" :value.sync="table.editRow.${columnName}" size="small" class="editinput"></i-input>
                                    <i-button @click="deleteRow('${r.AdPlacementId}' ,'${r.AdPlacementName}')" type="warning" size="small">删除</i-button>`;
                        return v;
                    };
                }else{
                    cobj['render'] = function (r) {
                        let v = r[columnName];
                        if(typeof(v) == 'undefined') v = '';
                        if(r.editble == true) 
                            return `<i-input @on-enter="editOver" :value.sync="table.editRow.${columnName}" size="small" class="editinput "></i-input>`;
                        if(r.clone == true){
                            return `<span class="clonerow">${v}</span>`;
                        }
                        return v;
                    };
                }
                return cobj;
            },

            loadCloumn(){
                const baseKeys = this.column.baseKeys;
                const columns = [{type: 'selection', width: 40, align: 'center'}];
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
                console.log(k);
                const $panel = document.querySelector('#editor_header');
                let left = 0;
                const $dom = document.querySelectorAll('.head-nav li');
                console.log($dom);
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
            // keys 相关
            selectKey(keyname){
                this.table.loading = true;
                this.current.key = keyname;
                this.clearSelect();
                const newData = this.AdUnitDetails[keyname] || [];
                newData.map((k) => k.editble = false);
                this.table.datasource = newData;
                this.table.select = [];
                setTimeout(() => {
                    this.table.loading = false;
                },100);
            },
            deleteKey(keyname){
                const oldLeftData = JSON.parse(JSON.stringify(this.leftData));
                oldLeftData.remove(keyname);
                // 删除AdUnitDetails中的key
                const AdUnitDetails = JSON.parse(JSON.stringify(this.AdUnitDetails));
                delete AdUnitDetails[keyname];
                this.selectKey(oldLeftData[0]);
                this.leftData = oldLeftData;
                this.AdUnitDetails = AdUnitDetails;
            },
            editKey(keyname){
                this.left = {
                    editItem : keyname,
                    newName : keyname,
                }
            },
            cloneKey(keyname){
                const dataSource = JSON.parse(JSON.stringify(this.AdUnitDetails[keyname]));
                const oldLeftData = this.leftData;
                const newKeyName = keyname+'_clone';
                oldLeftData.push(newKeyName);
                this.leftData = oldLeftData.sort((v1 ,v2) => {
                   return v1.localeCompare(v2);
                });
                this.left.editItem = newKeyName ;
                this.left.newName = newKeyName ;
                this.AdUnitDetails[newKeyName] = dataSource;
                this.selectKey(newKeyName);
            },
            saveKeyName(){
                const oldName = this.left.editItem;
                const newName = this.left.newName;
                const dataDetail = JSON.parse(JSON.stringify(this.AdUnitDetails));
                dataDetail[newName] = dataDetail[oldName];
                delete dataDetail[oldName];
                this.left = {
                    editItem : '',
                    newName : '',
                }
                const leftData = JSON.parse(JSON.stringify(this.leftData));
                leftData.remove(oldName);
                leftData.push(newName);
                this.leftData = leftData.sort((v1 ,v2) => {
                   return v1.localeCompare(v2);
                });
                this.AdUnitDetails = dataDetail;
                this.selectKey(newName);
            },

            createKey(){
                const name = this.keyCreate.name;
                if(!name) {this.keyCreate.edit = false; return; }
                const oldLeftData = this.leftData;
                oldLeftData.push(name);
                this.leftData = oldLeftData.sort((v1 ,v2) => {
                   return v1.localeCompare(v2);
                });
                this.AdUnitDetails[name] = [];
                this.keyCreate.edit = false;
            },

            clearSelect(){
                this.table.editRow = {};
                this.table.selectRowData = {AdPlacementId:'' ,AdPlacementName:''}; 
            },

            deleteRow(id ,name){
                const datasource = this.table.datasource || [];
                const newSource = [];
                datasource.map((k)=>{
                    k.editble = false; 
                    if(k.AdPlacementId == id && k.AdPlacementName == name) return;
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


            onTableSelect(s ,r){
                this.table.select = s;
                console.log('selectRows:',s);
            },
            onTableSelectAll(){
                this.table.select = JSON.parse(JSON.stringify(this.table.datasource ));
            },
            copySelectRow(){
                const selectRows = JSON.parse(JSON.stringify(this.table.select));
                const datasource = JSON.parse(JSON.stringify(this.table.datasource ));
                selectRows.map((k) => {
                    k.AdPlacementId = k.AdPlacementId+'_copy';
                    k.clone = true;
                    datasource.push(k);
                });
                this.table.datasource = datasource.sort((v1 ,v2) => {
                   return (v1['AdPlacementPriority']+"").localeCompare(v2['AdPlacementPriority']+"")
                });
                this.table.select = [];
            },

            createRow(){
                const leftData = this.leftData;
                const key = this.current.key;
                if(leftData.length <= 0){
                    if(!key){
                        this.keyCreate.edit = true;
                        return this.$Message.warning('需要先新建一个key');
                    }
                }else{
                    if(!key){
                        return this.$Message.warning('需要选择左侧的一个key');
                    }
                }
                const datasource = JSON.parse(JSON.stringify(this.table.datasource || []));
                let isEmpty = false;
                datasource.map((k)=>{
                    k.editble = false; 
                    if(!k.AdPlacementId && !k.AdPlacementName) isEmpty = true;
                });
                if(isEmpty) return;
                datasource.push({
                    AdPlacementId : '',
                    AdPlacementName : '',
                    editble : true
                });
                this.table.selectRowData = {
                    AdPlacementId : '',
                    AdPlacementName : '',
                }
                this.table.datasource = datasource;
            },

            editOver(){
                const key = this.current.key;
                if(!key) return;
                const data = JSON.parse(JSON.stringify(this.table.editRow));
                const {AdPlacementId ,AdPlacementName} = this.table.selectRowData;
                const datasource = JSON.parse(JSON.stringify(this.table.datasource || []));
                datasource.map((k) => {
                    k.editble = false;
                    if(k.AdPlacementId == AdPlacementId && k.AdPlacementName == AdPlacementName){
                        delete k.clone;
                        for(let _k in data){
                            k[_k] = data[_k];
                        }
                    }
                });
                this.clearSelect();
                this.table.datasource = datasource;
                const oldAdObjList = this.AdUnitDetails;
                const newObj = {};
                for(let k in oldAdObjList){
                    newObj[k] = oldAdObjList[k];
                }
                newObj[key] = datasource;
                this.AdUnitDetails = JSON.parse(JSON.stringify(newObj));
            },


            onSortChange(o){
                const columnName = o.key;
                let arr = this.table.datasource;
                if(o.order == 'asc'){
                    this.table.datasource = arr.sort((v1 ,v2) => {
                       return (v1[columnName]+"").localeCompare(v2[columnName]+"")
                    });
                }else{
                    this.table.datasource = arr.sort((v1 ,v2) => {
                        return (v2[columnName]+"").localeCompare(v1[columnName]+"")
                    });
                }
            },

            onSubmit(){
                this.editOver();
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
                // 正在编辑的
                const {AdPlacementId:oid ,AdPlacementName:oname} = this.table.selectRowData;
                const data = JSON.parse(JSON.stringify(this.table.editRow));

                const datasource = this.table.datasource || [];
                const AdPlacementId = obj.AdPlacementId;
                const AdPlacementName = obj.AdPlacementName;
                datasource.map((k) => {
                    if(k.AdPlacementId == oid && k.AdPlacementName == oname){
                        for(let _k in data){
                            k[_k] = data[_k];
                        }
                    }
                    if(k.AdPlacementId == AdPlacementId && k.AdPlacementName == AdPlacementName) k.editble = true;
                    else k.editble = false;
                });
                this.table.editRow = JSON.parse(JSON.stringify(obj));
                this.table.selectRowData = {AdPlacementId ,AdPlacementName};
                const overData = JSON.parse(JSON.stringify(datasource));
                this.table.datasource = overData;
                const key = this.current.key;
                console.log('key:',key);
                this.AdUnitDetails[this.current.key] = overData;
            }
        },

        components : {
            layoutMain
        }
    }
</script>
<style scoped lang="less">
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
        .content-left-menu{
            height:100%;
            width:200px;
            border-right:1px solid #d7dde4;
            float:left;
            overflow-x: hidden;
            overflow-y: auto;
        }
        .content-right-table{
            height:100%;
            margin-left:210px;
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
        .edititem{
            .item{
                display : none;

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