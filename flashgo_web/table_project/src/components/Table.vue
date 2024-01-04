<template>
  <div class="table">
   
  <el-tabs type="border-card">
    <!-- advance页 -->
    <el-tab-pane label="advanced">
      <el-table  ref="multipleTable" :data="dataAdvanced" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection"  width="85"></el-table-column>
      <el-table-column label="proxy" width="340">
        <template slot-scope="scope">{{ scope.row.proxy}}</template>
      </el-table-column>
      <el-table-column prop="timeout_count"  label="timeout_count"  width="150"></el-table-column>
      <el-table-column  prop="exc_count"  label="exc" show-overflow-tooltip></el-table-column>

      <el-table-column label="操作" width="150">
        <template scope="scope">
          <el-button type="danger" size="small" @click="handleDel()">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    </el-tab-pane>

    <!-- 选择框 -->
    <!-- normal页 -->
    <el-tab-pane label="normal">
      <el-table  ref="multipleTable" :data="dataNormal" tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="85"></el-table-column>
          <el-table-column label="proxy" width="340">
            <template slot-scope="scope">{{ scope.row.proxy}}</template>
          </el-table-column>
          <el-table-column  prop="timeout_count"  label="timeout_count" width="150"></el-table-column>
          <el-table-column prop="exc_count" label="exc" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="150">
          <template scope="scope">
            <el-button type="danger" size="small" @click="handleDeltwo(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

  </el-tabs>

    <el-dialog title="编辑" :visible.sync="dialogTableVisible" :data="dataAdvanced">
      <el-form :model="editForm">
        <el-form-item label="timeout_count" :label-width="formLabelWidth">
          <el-input v-model="editForm.proxy" autocomplete="off"></el-input>
        </el-form-item>
         <el-form-item label="timeout_count" :label-width="formLabelWidth">
          <el-input v-model="editForm.timeout_count" autocomplete="off"></el-input>
        </el-form-item>
         <el-form-item label="exc_count" :label-width="formLabelWidth">
          <el-input v-model="editForm.exc_count" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormVisible = false" >确 定</el-button>
      </div>
    </el-dialog>
 </div>
</template>

<script>
  import axios from 'axios'
  export default {
    data() {
      return {
        gridData: [{
          "proxy": "",
          "timeout_count": 0,
          "exc_count": 0
        }],
        dataAdvanced: [],
        dataNormal:[],

        editFormVisible: true,//编辑界面是否显示
        editLoading: false,
        editFormRules: {
          
        },





        dialogTableVisible: false,
        form: {
          name: ''
         
        },
        formLabelWidth: '120px',
       //编辑界面数据
       editForm: {
          "proxy": 0,
          "timeout_count": 0,
          "exc_count": 0
       }
      
      }
    },

    methods: {
      toggleSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row);

          });
        } else {
          this.$refs.multipleTable.clearSelection();
        }
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
   
      handleDel(id) {//id = id; lable内容
       axios.get(api).then(({id}) => {
           this.$data.dataAdvanced.splice(id, 1)
           alert("删除成功")
        }).catch(error => {
          console.log('Error', error.message);
        })
      },
      handleDeltwo(id) {
        // var api = 'http://13.229.225.151:8889/proxy/get_proxy_pool_status';
        axios.get(api).then(({id}) => {
           this.$data.dataNormal.splice(id, 1)
           alert("删除成功")
        }).catch(error => {
          console.log('Error', error.message);
        })
       
      },
      handleEdit(index) {
        this.dialogTableVisible = true;
        // console.log(this.dataAdvanced[index])
        this.editForm.proxy = this.dataAdvanced[index];
      },

    },
     created() {
      var api = 'http://13.229.225.151:8889/proxy/get_proxy_pool_status';
      window.api = api;
      axios.get(api).then(({data}) => {
        this.dataAdvanced = data.advanced;
        this.dataNormal = data.normal;
        console.log(this.dataAdvanced, this.dataNormal)
      }).catch(error => {
        console.log('Error', error.message);
      })
    }
  }
</script>
 
<style type="text/css" scoped="scoped" >
  .table {
    width: 80%;  
    margin: 0 auto;
  }
</style>