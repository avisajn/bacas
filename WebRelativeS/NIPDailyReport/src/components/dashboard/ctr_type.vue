<template>
    <tb-panel>
        <div slot="title"><a href="javascript:window.toLink('/ctr_type_chart');">类别点击率统计</a></div>
        <div slot="table">
            <i-table 
                @on-sort-change="onSortChange" 
                v-if="!loading" 
                :columns="columns" 
                class="dash-table" 
                size="small" 
                :data="data"
            ></i-table>
            <Spin fix v-if="loading"></Spin>
        </div>
    </tb-panel>
</template>
<script>
    import tbPanel from './table_panel';
    import API from '../../libs/api';
    let today = window.lastDate;
    export default {
        props : ["date"],
        data (e) {
            return {
                columns: [
                    {title: '类名', key: '_name',sortable: 'custom' ,render(r){
                        return `<a href="javascript:window.toLink('/ctr_type_chart?c=${r._name}')">${r._name}</a>`;
                    }},
                    {title: '展示数', key: 'fetchCount' ,sortable: 'custom'},
                    {title: '阅读数', key: 'readCount' ,sortable: 'custom'},
                    {title: '点击率', key: 'ctr' ,sortable: 'custom'},                
                ],
                data: [],
                loading : true
            };
        },
        ready () {
            this.loading = true;
            API.newsCategoryCtr(today).then((k) => {
                this.data = k;
                this.loading = false;
            },(e) => {
                this.data = [];
                this.loading = false;
            });
        },
        methods : {
            // 当选择列进行排序后
            onSortChange(o){
                const columnName = o.key;
                const order = o.order;  // desc ,esc ,normal
                if(columnName == '_name'){
                    this.sortByString(order);
                    return;
                }
                let arr = this.data;
                let _t1 = 0;
                let _t2 = 0;
                if(order == 'asc'){
                    this.data = arr.sort((v1 ,v2) => {
                        _t1 = parseFloat(v1[columnName]) || 0;
                        _t2 = parseFloat(v2[columnName]) || 0;
                        if(_t1 > _t2) return -1;
                        return 1;
                    });
                }else{
                    this.data = arr.sort((v1 ,v2) => {
                        _t1 = parseFloat(v1[columnName]) || 0;
                        _t2 = parseFloat(v2[columnName]) || 0;
                        if(_t1 > _t2) return 1;
                        return -1;
                    });
                }
            },
            sortByString(o){    // 根据字符串进行排序
                let arr = this.data;
               if(o == 'asc'){
                    this.data = arr.sort((v1 ,v2) => {
                       return v1['_name'].localeCompare(v2['_name'])
                    });
                }else{
                    this.data = arr.sort((v1 ,v2) => {
                        return v2['_name'].localeCompare(v1['_name'])
                    });
                }
            }
        },
        watch : {
            date(n){
                this.loading = true;
                API.newsCategoryCtr(n).then((k) => {
                    this.data = k;
                    this.loading = false;
                },(e) => {
                    this.data = [];
                    this.loading = false;
                });
            }
        },
        components : {
            tbPanel
        }
    }
</script>
<style scoped lang="less">
    
</style>

