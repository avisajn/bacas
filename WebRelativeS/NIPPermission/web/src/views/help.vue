<template>
    <layout-main>
        <div slot="main">
            这里是帮助介绍
        </div>
    </layout-main>
</template>
<script>
    import layoutMain from '../components/layout';

    export default {
        data(){
            return {
                
            }
        },

        ready(){
            window.Loading.hide();
        },

        methods : {
            
        },


        components : {
            layoutMain,
        }
    }
</script>
<style scoped lang="less">
    
</style>