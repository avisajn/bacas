<template>
    <div class="querylist-panel">
        <div class="condition">
            <slot name="condition"> </slot>
        </div>
        <div class="q-panel">
            <slot name="panel"> </slot>
        </div>
    </div>
</template>
<script>
    export default {
        
    }
</script>
<style scoped lang="less">
    .querylist-panel{
        height:100%;
        position:relative;
        .condition{
            padding: 10px;
            box-shadow: 0 2px 3px rgba(0,0,0,0.05);
            position: absolute;
            top:0px;
            left:0px;
            right:0px;
            background: rgba(255, 255, 255, 0.9);
            z-index:10;
            padding-left: 20px
        }
        .q-panel{
            overflow: auto;
            position: absolute;
            top: 60px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            overflow: auto;
            z-index:3;
        }
    }
</style>

