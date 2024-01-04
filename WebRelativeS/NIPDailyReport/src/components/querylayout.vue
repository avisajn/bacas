<template>
    <div class="querylist-panel">
        <div class="condition">
            <slot name="condition"> </slot>
            <div class="more" v-if="showmore">
                <div class="condition-more">
                    <slot name="conditionMore"> </slot>
                </div>
            </div>
        </div>
        <div class="q-panel" v-bind:style="{ top : top + 'px' }">
            <slot name="panel"> </slot>
        </div>
    </div>
</template>
<script>
    export default {
        props : ['morehide' ,'showmore' ,'top'],
        data(){
            return {
                
            }
        },
        ready (){
            console.log('top:',this.top)
        },
        methods : {
            
        },
        watch : {
            
        }
    }
</script>
<style scoped lang="less">
    .querylist-panel{
        height:100%;
        position:relative;
        .condition{
            padding: 10px;
            border-bottom: 1px solid #e3e3e3;
            box-shadow: 0 2px 3px rgba(0,0,0,0.05);
            position: absolute;
            top:0px;
            left:0px;
            right:0px;
            background: rgba(255, 255, 255, 0.9);
            .more{
                position:relative;
                top: -32px;
                .tag-click{
                    position: absolute;
                    z-index: 99;
                    cursor: pointer;
                    font-size: 20px;
                    top: 16px;
                    left: 50%;
                    margin-left: -30px;
                    >span{
                        font-size: 12px;
                        position: relative;
                        top: -3px;
                        margin-left: 3px;
                    }
                }
                .condition-more{
                    position: absolute;
                    top: 43px;
                    background: white;
                    left: -10px;
                    right: -10px;
                    border-bottom: 1px solid #e3e3e3;
                    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.05);      
                    text-align: left;
                    padding: 10px;
                } 
            }
            
        }
        .q-panel{
            overflow: auto;
            position: absolute;
            top: 55px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            overflow: auto;
            z-index:2;
        }

        
    }

</style>

