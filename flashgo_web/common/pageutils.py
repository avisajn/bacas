from typing import Optional


class Pageable(object):

    def __init__(self, page_id, count):
        self._next_page_id = page_id
        self._count = count
        self._has_next_page = True

    def get_next_page_id(self, *filters) -> Optional[int]:
        current_page_id = self._next_page_id
        if self._has_next_page:
            if len(self.get_next_page(*filters)) > 0:
                self._next_page_id = current_page_id
                return self._next_page_id
            else:
                self._has_next_page = False
                return None
        else:
            return None

    def __get_next_page(self):
        if self._has_next_page:
            data = self._next_page()
            if data is not None and len(data) > 0:
                self._next_page_id += 1
                return data
            else:
                self._next_page_id += 1
                self._has_next_page = False
                return []
        else:
            return []

    def get_next_page(self, *filters, min_count=1, max_iter=20) -> list:
        data = []
        for _ in range(0, max_iter):
            if self.has_next_page() and len(data) < min_count:
                items = self.__get_next_page()
                if items is not None and len(items) > 0:
                    for filter_ in filters:
                        items = filter_(items)
                    data += items
                else:
                    self._has_next_page = False
                    # 及时退出
                    break
            else:
                break
        return data

    def _next_page(self):
        raise NotImplementedError()

    def has_next_page(self):
        return self._has_next_page


class FunctionAsPageable(Pageable):
    def __init__(self, page_id, count, f, **kwargs):
        super().__init__(page_id, count)
        self.__f = f
        self.__kwargs = kwargs

    def _next_page(self):
        return self.__f(page_id=self._next_page_id, count=self._count, **self.__kwargs)


def wrap_filter_to_filter_list(f, **kwargs):
    def inner(_):
        data = []
        for item in _:
            filter_item, ok = f(item, **kwargs)
            if ok:
                data.append(filter_item)
        return data

    return inner


def wrap_filter_list(f, **kwargs):
    def inner(_):
        return f(_, **kwargs)

    return inner
