def _get_instance_by_context(proxy):
    get_instance = object.__getattribute__(proxy, '_get_instance')
    instance_name = object.__getattribute__(proxy, '_instance_name')
    return get_instance(instance_name)


def _set_instance(proxy, get_instance, instance_name):
    object.__setattr__(proxy, "_get_instance", get_instance)
    object.__setattr__(proxy, "_instance_name", instance_name)


class Proxy(object):
    def __init__(self, get_instance, instance_name):
        _set_instance(self, get_instance, instance_name)

    def __getattribute__(self, name):
        return getattr(_get_instance_by_context(self), name)

    def __delattr__(self, name):
        delattr(_get_instance_by_context(self), name)

    def __setattr__(self, name, value):
        setattr(_get_instance_by_context(self), name, value)

    def __nonzero__(self):
        return bool(_get_instance_by_context(self))

    def __str__(self):
        return str(_get_instance_by_context(self))

    def __repr__(self):
        return repr(_get_instance_by_context(self))


__INSTANCE_MAGIC_TEMPLATE = '_c57e55c2_%s'


def _set_instance_property(proxy, name, value):
    object.__setattr__(proxy, __INSTANCE_MAGIC_TEMPLATE % name, value)


def _get_instance_property(proxy, name):
    return object.__getattribute__(proxy, __INSTANCE_MAGIC_TEMPLATE % name)


def _get_or_create_instance(proxy):
    instance = _get_instance_property(proxy, 'instance')
    if instance is None:
        instance = _get_instance_property(proxy, 'init')()
        _set_instance_property(proxy, 'instance', instance)
        _set_instance_property(proxy, 'init', None)
        return instance
    else:
        return instance


class LazyProxy(object):
    """
    lazy initialization, call construct when call property or method
    """

    def __init__(self, cls, *lazy_args, **lazy_kwargs):
        _set_instance_property(self, 'init', lambda: cls(*lazy_args, **lazy_kwargs))
        _set_instance_property(self, 'instance', None)

    def __getattribute__(self, name):
        return getattr(_get_or_create_instance(self), name)

    def __delattr__(self, name):
        delattr(_get_or_create_instance(self), name)

    def __setattr__(self, name, value):
        setattr(_get_or_create_instance(self), name, value)

    def __nonzero__(self):
        return bool(_get_or_create_instance(self))

    def __str__(self):
        return str(_get_or_create_instance(self))

    def __repr__(self):
        return repr(_get_or_create_instance(self))

    def __len__(self):
        return len(_get_or_create_instance(self))


class ObjectWrapperProxy(object):

    def __init__(self, instance, **kwargs):
        _set_instance_property(self, 'kwargs', kwargs)
        _set_instance_property(self, 'instance', instance)

    def __getattribute__(self, name):
        instance = _get_instance_property(self, 'instance')
        kwargs = _get_instance_property(self, 'kwargs')
        if name in kwargs:
            return kwargs[name]
        else:
            return getattr(instance, name)

    def __delattr__(self, name):
        delattr(_get_or_create_instance(self), name)

    def __setattr__(self, name, value):
        setattr(_get_or_create_instance(self), name, value)

    def __nonzero__(self):
        return bool(_get_or_create_instance(self))

    def __str__(self):
        return str(_get_or_create_instance(self))

    def __repr__(self):
        return repr(_get_or_create_instance(self))

    def __len__(self):
        return len(_get_or_create_instance(self))
