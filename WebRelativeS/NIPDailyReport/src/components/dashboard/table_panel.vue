<template>
    <div class="dashboard-table-panel">
        <div class="title">
            <slot name="title"></slot>
        </div>
        <div class="d-table">
            <slot name="table"></slot>
        </div>
    </div>
</template>
<script>
    export default {
        
    }
</script>
<style scoped lang="less">
    .dashboard-table-panel{
        border-bottom: 1px dashed #d8d3d3;
        padding-bottom: 20px;
        margin-right: 20px;
        .title{
            font-size: 16px;
            margin-bottom: 10px;
        }
        .d-table{
            position:relative;
        }
    }
</style>

