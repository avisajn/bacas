
export default {
    getRouter(){
       const permission = window.permission || {};
        let routers = {
            '/help' : {
                name : 'help', component (resolve) {require(['./views/help.vue'], resolve); }
            }
        };

        if(permission["news"]){    
            routers['/'] = { // news
                name : 'news', component (resolve) {require(['./views/news.vue'], resolve); }
            };
        }else{
            routers['/'] = { // news
                name : 'temp', component (resolve) {require(['./views/film.vue'], resolve); }
            };
        }

        routers['/temp'] = { // news
            name : 'temp', component (resolve) {require(['./views/film.vue'], resolve); }
        };



        return routers;
    }
};