const routers = {
    '/login': {
        name : 'login',
        component (resolve) {
            require(['./views/login.vue'], resolve);
        }
    },

    '/help': {
        name : 'help',
        component (resolve) {
            require(['./views/help.vue'], resolve);
        }
    },

    '/setpassword': {
        name : 'setpassword',
        component (resolve) {
            require(['./views/password-form.vue'], resolve);
        }
    },
};
export default {
    getRouter(){
        const hash = window.location.hash;
        if(hash.indexOf('setpassword') > 0){
            return routers;
        }

        // if(hash.indexOf('administrator') > 0){
            
        // }


        routers['/'] = {
            name : 'report',
            component (resolve) {require(['./views/report.vue'], resolve); }
        };





        return routers;
    }
};