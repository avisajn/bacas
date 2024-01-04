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

    '/preview': {
    	name : 'preview',
        component (resolve) {
            require(['./views/preview.vue'], resolve);
        }
    },
};
export default {
    getRouter(){
        let permission = window.sysPermisstion || {};
        if(permission['system']){
            routers['/sys'] = {
                name : 'sys',
                component (resolve) {require(['./views/sys.vue'], resolve); }
            };
        }

        if(permission['user']){
            routers['/'] = {
                name : 'user',
                component (resolve) {require(['./views/user.vue'], resolve); }
            };
        }else{
            routers['/'] = {
                name : 'help',
                component (resolve) {require(['./views/help.vue'], resolve); }
            };
        }

        if(permission['role']){
            routers['/role'] = {
                name : 'role',
                component (resolve) {require(['./views/role.vue'], resolve); }
            };
        }

        return routers;
    }
};