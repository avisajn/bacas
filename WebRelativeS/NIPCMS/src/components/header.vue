<template>
    <div class="header">
        <a href="javascript:;" @click="onMenuControl" class="menu"><Icon type="navicon"></Icon></a>
        <span class="title">CMS</span>
        <div class="language" v-if="show">
            <div class="time" v-if="timeshow">
                The data ends at : <span>{{date}}</span>
            </div>
            <i-select size="small" :model.sync="selectLang" style="width:100px" @on-change="onLangChange">
                <i-option v-for="item in languageData" :value="item.value">{{ item.label }}</i-option>
            </i-select>
        </div>
    </div>
</template>
<script>
    import Store from '../libs/store';
    const mapping = {
        id : 'Indonesia',
        br : 'Brazil'
    }
    export default {
        data(){
            const _country = window.country;
            let show = true;
            let timeshow = true;
            let res = [];
            if(!_country){
                show = false;
            }else{
                if(_country.indexOf(',')){
                    _country.split(',').map((k) => {
                        res.push({value: k, label: mapping[k]});
                    });
                }else{
                    res = [{value: _country, label: mapping[_country]}];
                }
            }
            if(this.getHash().indexOf('crawlfrequency') > 0){
                timeshow = false;
            }
            return {
                languageData : res,
                show : show,
                timeshow : timeshow,
                date : window.lastDate,
                selectLang : Store.get('language')
            }
        },
        ready(){

        },
        methods: {
            onMenuControl(){
                this.$emit('menuclick');
            },

            onLangChange(v){
                Store.set('language' ,v);
                setTimeout(function(){
                    window.location.reload();
                },20);
            },
            getHash(){
                let hash = window.location.hash;
                if(hash.indexOf('!/') > 0){hash = hash.substring(2); }
                else{hash = '/'; }
                return hash;
            }
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
        padding-left: 20px;
        .menu{
            margin-right:10px;
            font-size: 30px;
        }
        .title{
            line-height:50px;
            position: relative;
            top: -5px;
        }
        .language{
            float:right;
            margin-right: 60px;
            .time{
                display: inline-block;
                font-size: 13px;
                margin-right: 20px;
            }
        }
    }
</style>

