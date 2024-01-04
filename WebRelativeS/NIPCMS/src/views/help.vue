<template>
    <layout-main>
        <div slot="main">
            help
        </div>
    </layout-main>
</template>
<script>
    
    import layoutMain from '../components/layout';

    let today = window.lastDate;
    let startDay = window.startDay;
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
            layoutMain
        }
    }
</script>
<style scoped lang="less">
    
</style>