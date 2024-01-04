<template>    
    <i-form v-ref:form-validate :rules="ruleValidate" :model="formValidate" :label-width="80">
        <Form-item label="选择角色" prop="roles">
            <i-select :model.sync="formValidate.roles" multiple style="width:400px">
                <i-option v-for="item in rolesData" :value="item.id">{{ item.name }}</i-option>
            </i-select>
        </Form-item>

        <Form-item label="用户名" prop="name">
            <i-input :value.sync="formValidate.name" style="width:400px"></i-input>
        </Form-item>

        <Form-item label="所属国家">
            <Checkbox-group :model.sync="formValidate.country">
                <Checkbox value="id">印尼</Checkbox>
                <Checkbox value="br">巴西</Checkbox>
                <Checkbox value="me">中东</Checkbox>
            </Checkbox-group>
        </Form-item>

        <Form-item label="密码" prop="password" v-if="!formValidate.id">
            <i-input :value.sync="formValidate.password" style="width:400px"></i-input>
        </Form-item>

        <Form-item>
            <i-button type="primary" :loading="loading" @click="formSubmit"> {{btnText}} </i-button>
            <i-button type="ghost" @click="closeModal" style="margin-left: 8px">取消</i-button>
        </Form-item>
    </i-form>
</template>
<script>
    import moment from 'moment';
    import API from '../../libs/api';
    import MD5 from 'blueimp-md5';
    export default {
        props : ['closeModal' ,'data' ,'rolesdata'],
        data (e) {
            return {
                formValidate: {
                    id : '',
                    name: '',
                    password : 'nip1234',
                    roles: [],
                    country : ['id'],
                },
                rolesData : [],
                ruleValidate: {
                    name: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
                },
                loading : false,
                btnText : '提交保存'
            }
        },
        methods: {
            formSubmit(){
                this.$refs['formValidate'].validate((valid) => {
                    if (valid) {
                        let data = this.formValidate;
                        var param = {
                            id : data.id,
                            username : data.name,
                            password : MD5(data.password),
                            roles : data.roles.join(','),
                            country : data.country.join(',')
                        }
                        this.loading = true;
                        this.btnText = '保存中';
                        API.user.saveUser(param).then((v) => {
                            this.loading = false;
                            this.btnText = '保存成功';
                            this.$Notice.success({title: '保存成功！'});
                            this.$emit('success');
                            setTimeout(() => {
                                this.btnText = '提交保存';
                            },2000);
                        } ,(e) => {
                            this.$Notice.error({title: e.err});
                        });
                    } else {
                        this.loading = false;
                        this.btnText = '提交保存';
                        return;
                    }
                })
            },

            closeModal(){
                this.$emit('close')
            },
        },
        watch : {
            data(n ,o){
                this.$refs['formValidate'].resetFields();
                let rids = n.roleids;
                if(rids && rids.length > 0){
                    let news = [];
                    rids.map((k) => {news.push(parseInt(k)); })
                    rids = news;
                }else{
                    rids = [];  
                }

                let country = n.country;
                if(country){
                    if(country.indexOf(',') > 0){
                        let _n = [];
                        country.split(',').map((k) => {
                            _n.push(k);
                        })
                        country = _n;
                    }else{
                        country = [country];
                    }
                }else{
                    country = [];
                }

                this.formValidate = {
                    id : n.id || '',
                    name: n.username || '',
                    password : n.password  || 'nip1234',
                    roles: rids,
                    country : country
                };
            },

            rolesdata(n){
                this.rolesData = n;
            }
        }
    }
</script>
<style scoped lang="less">
    
</style>

