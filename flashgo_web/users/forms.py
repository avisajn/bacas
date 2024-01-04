from voluptuous import Required, Schema, All

admin_clear_user_cache_schema = Schema({
    Required('token'): All(str),
    Required('email'): All(str),
    Required('user_id'): All(str)
})
