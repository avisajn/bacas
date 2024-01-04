
export default {
    getRouter(){
       const permission = window.permission || {};
        let routers = {
            '/help' : {
                name : 'help', component (resolve) {require(['./views/help.vue'], resolve); }
            }
        };


        

        if(permission["dashboard"]){    
            routers['/'] = {
                name : 'index', component (resolve) {require(['./views/dashboard.vue'], resolve); }
            };
        }else{
            routers['/'] = {
                name : 'index', component (resolve) {require(['./views/help.vue'], resolve); }
            };
        }


        if(permission["dashboard-chart"]){     // 这是一类权限，如果有该权限，则dashboard底下所有的表格都可以看
            routers['userchart'] = {
                name : 'userchart', component (resolve) {require(['./views/dashboard-chart/userchart.vue'], resolve); }
            };
            routers['newschart_chart'] = {
                name : 'newschart_chart', component (resolve) {require(['./views/dashboard-chart/newschart.vue'], resolve); }
            };
            routers['news_crawled_chart'] = {
                name : 'news_crawled_chart', component (resolve) {require(['./views/dashboard-chart/news_crawled.vue'], resolve); }
            };
            routers['news_pushed_chart'] = {
                name : 'news_pushed_chart', component (resolve) {require(['./views/dashboard-chart/news_pushed.vue'], resolve); }
            };
            routers['news_without_reltv_chart'] = {
                name : 'news_without_reltv_chart', component (resolve) {require(['./views/dashboard-chart/news_without_reltv.vue'], resolve); }
            };
            routers['special_click_position_chart'] = {
                name : 'special_click_position_chart', component (resolve) {require(['./views/dashboard-chart/special_click_position.vue'], resolve); }
            };


            routers['news_push_client_chart'] = {
                name : 'news_push_client_chart', component (resolve) {require(['./views/dashboard-chart/news_push_client.vue'], resolve); }
            };

            routers['news_push_user_chart'] = {
                name : 'news_push_user_chart', component (resolve) {require(['./views/dashboard-chart/news_push_user.vue'], resolve); }
            };
            routers['news_type_ctr_chart'] = {
                name : 'news_type_ctr_chart', component (resolve) {require(['./views/dashboard-chart/news_type_ctr.vue'], resolve); }
            };

            routers['ctr_chart'] = {
                name : 'ctr_chart', component (resolve) {require(['./views/dashboard-chart/ctr.vue'], resolve); }
            };

            routers['ctr_user_fetch_chart'] = {
                name : 'ctr_user_fetch_chart', component (resolve) {require(['./views/dashboard-chart/ctr_user_fetch.vue'], resolve); }
            };

            routers['ctr_hot_news_chart'] = {
                name : 'ctr_hot_news_chart', component (resolve) {require(['./views/dashboard-chart/ctr_hot_news.vue'], resolve); }
            };

            routers['ctr_type_chart'] = {
                name : 'ctr_type_chart', component (resolve) {require(['./views/dashboard-chart/ctr_type.vue'], resolve); }
            };

        }

        if(permission["dashboard_ctr_type_chart"]){    
            routers['ctr_type_chart'] = {
                name : 'ctr_type_chart', component (resolve) {require(['./views/dashboard-chart/ctr_type.vue'], resolve); }
            };
        }
        
        if(permission["user-table"]){    
            routers['usertable'] = {
                name : 'usertable', component (resolve) {require(['./views/usertable.vue'], resolve); }
            };
        }

        if(permission["key"]){    
            routers['keywordsearch'] = {
                name : 'keywordsearch', component (resolve) {require(['./views/keywordsearch.vue'], resolve); }
            };
        }

        if(permission["newuserpushnews-chart"]){    
            routers['newuserpushnews'] = {
                name : 'newuserpushnews', component (resolve) {require(['./views/newuserpushnews.vue'], resolve); }
            };
        }

        if(permission["crawl-frequency-chart"]){    
            routers['crawlfrequency'] = {
                name : 'crawlfrequency', component (resolve) {require(['./views/crawlfrequency.vue'], resolve); }
            };
        }

        if(permission["InFeedBanner"]){   
            routers['infeedbanner'] = {
                name : 'infeedbanner', component (resolve) {require(['./views/management/infeedbanner.vue'], resolve); }
            };
        }

        if(permission["InFeedBannerChart"]){   
            routers['infeedbannerchart'] = {
                name : 'infeedbannerchart', component (resolve) {require(['./views/management/infeedbannerchart.vue'], resolve); }
            };
        }

        if(permission["Advertorial"]){   
            routers['advertorial'] = {
                name : 'advertorial', component (resolve) {require(['./views/management/advertorial.vue'], resolve); }
            };
        }

        if(permission["crawl-status"]){   
            routers['crawlstatus'] = {
                name : 'crawlstatus', component (resolve) {require(['./views/crawlstatus.vue'], resolve); }
            };
        }

        if(permission["searchpushtable"]){   
            routers['searchpushtable'] = {
                name : 'searchpushtable', component (resolve) {require(['./views/searchpushtable.vue'], resolve); }
            };
        }

        if(permission["jsoneditor"]){   
            routers['jsoneditor'] = {
                name : 'jsoneditor', component (resolve) {require(['./views/jsoneditor.vue'], resolve); }
            };
        }



        return routers;
    }
};