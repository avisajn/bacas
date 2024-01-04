# 一刷返回的条数
FEEDS_PAGE_SIZE = 10

# 缓存的feed流长度
CACHE_FEEDS_LENGTH = 1000

# 缓存feed流重新刷新时间间隔
CACHE_FEEDS_TIMEOUT = 15 * 60

PRE_LOAD_CACHE_FEEDS_TIMEOUT = CACHE_FEEDS_TIMEOUT - 60

# feed流单个召回路径的长度
FEEDS_RECALL_LENGTH = 100

# 快捷入口feed流长度
FEEDS_SHORTCUT_LENGTH = 8

# 计算出的平均值和标准差
STATISTIC = {
    1: {
        's_sales': 169.67, 'a_sales': 4.02,
        's_comments': 482.27, 'a_comments': 41.17,
        's_stars': 2.39, 'a_stars': 1.96,
        's_view_count': 0, 'a_view_count': 0
    },
    2: {
        's_sales': 61.07, 'a_sales': 12.96,
        's_comments': 402.95, 'a_comments': 153.93,
        's_stars': 1.11, 'a_stars': 4.22,
        's_view_count': 0, 'a_view_count': 0
    },
    3: {
        's_sales': 1180.28, 'a_sales': 121.46,
        's_comments': 34.79, 'a_comments': 7.99,
        's_stars': 2.18, 'a_stars': 1.51,
        's_view_count': 77135.09, 'a_view_count': 4250.43
    },
    4: {
        's_sales': 0.95, 'a_sales': 0.01,
        's_comments': 81.67, 'a_comments': 14.18,
        's_stars': 2.39, 'a_stars': 2.42,
        's_view_count': 0, 'a_view_count': 0
    },
    5: {
        's_sales': 555.34, 'a_sales': 43.55,
        's_comments': 684.81, 'a_comments': 106.73,
        's_stars': 2.1, 'a_stars': 3.45,
        's_view_count': 0, 'a_view_count': 0
    },
    6: {
        's_sales': 0, 'a_sales': 0,
        's_comments': 8.52, 'a_comments': 0.99,
        's_stars': 2.16, 'a_stars': 1.62,
        's_view_count': 0.44, 'a_view_count': 0.01
    },
    7: {
        's_sales': 0, 'a_sales': 0,
        's_comments': 0, 'a_comments': 0,
        's_stars': 0, 'a_stars': 0,
        's_view_count': 0, 'a_view_count': 0
    },
    8: {
        's_sales': 0, 'a_sales': 0,
        's_comments': 5.61, 'a_comments': 1407,
        's_stars': 4.45, 'a_stars': 1.25,
        's_view_count': 0, 'a_view_count': 0
    }
}

APP_PACKAGE_NAMES = {
    1: 'jd.cdyjy.overseas,market.indonesia',
    2: 'com.lazada.android',
    3: 'com.bukalapak.android',
    4: 'com.tokopedia.tkpd',
    5: 'com.shopee.id',
    6: 'bilibili.mobile.commerce',
    7: 'com.zalora.android',
    8: 'com.alibaba.aliexpresshd'
}

OLD_SELL_IDS_SET = {1, 2, 3, 4, 5, 6}

BLACK_ECOMMERCE_IDS = {3}

FLASH_BLACK_ECOMMERCE_IDS = {}

OLD_APP_SELL_IDS_SET = {1, 2, 3, 4, 5, 6} - set(BLACK_ECOMMERCE_IDS)

USE_MAPPING_SELL = {2, 3, 4}

NEWS_TYPE_MAPPING = {
    'article': 0,
    'image_text': 2,
    'video': 3
}


class NewsType(object):
    Article = 0
    ImageText = 2
    Video = 3


GENDER_CONFIG = [
    {
        'id': 1,
        'title': 'Pria',
        'image_url': "https://cdn.flashgo.online/admin/20190724_3046301c91164f1cbb0e89fc2e1b1b7d.png",
        'image_base64': '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'
    },
    {
        'id': 2,
        'title': 'Wanita',
        'image_url': "https://cdn.flashgo.online/admin/20190724_7bf4ae0c0d0c4b1c910d0a5b5b9cf963.png",
        'image_base64': '/9j/4AAQSkZJRgABAQAASABIAAD/4QBARXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAABSqADAAQAAAABAAABSgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgBSgFKAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMABgYGBgYGCgYGCg0KCgoNEg0NDQ0SFxISEhISFxwXFxcXFxccHBwcHBwcHCEhISEhIScnJycnLCwsLCwsLCwsLP/bAEMBBwcHCwoLEwoKEy4fGR8uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLv/dAAQAFf/aAAwDAQACEQMRAD8A+qaKKKACiiigAooooAKKKKACiiigAooooAKKjaVR05qIyMfagCwSB1NMMqjpzVaigCYzHsKYZHPemUUALuY9zSZNFFABRmiigBdzeppwkcd6ZRQBKJW708TDuKr0UAWwynoadVKnB2HQ0AW6KhWUfxcVMCDyKACiiigAooooAKKKKACiiigAooooAKKKKAP/0PqmiiigAooooAKKKKACiiigAopGYKMmqzSFuOgoAmaQDgcmoGZm602igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAClBI5FJRQBOsvZqmBB5FUqcrFelAFuimK4b60+gAooooAKKKKACiiigAooooA//R+qaKKKACiiigAooooAKjeQLx3pJJMcL1qvQApJJyaSiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACp0k7N+dQUUAXaKrpJjhulWKACiiigAooooAKKKKAP/S+qaKKKACiiigAqKSTHyjrSyPtHHWq1ABRRRQAUUUUAFFFFABRRRQAUUUUAFFcp4g8a+GvDI26rdqsuMiFPnkP/AR0+pwK8Z1n47XDMY/D9gqL2kuiWJ/4AhAH/fRoKUG9j6Ror4m1D4meN9RYmTUpYVPRYMRAfioB/M1ytxrGr3bF7q8uJmPeSRmP6mlc0VF9WfoHRX53+bLu37m3eueau2+savaMHtby4hYd45GU/oaLj9j5n6B0V8Taf8AEzxvpzAx6lLMo6rPiUH8WBP5GvSNG+O1wrCPxBYK695LUlSP+AOSD/30KLkuk0fSNFcp4f8AGvhrxMNulXatLjJhf5JB/wABPX6jIrq6Zm1bcKKKKBBRRRQAUUUUAFFFFABUscm3g9KiooAu0VBG/wDCfwqegAooooAKKKKAP//T+qaKKKACkZgoyaWqsjbjx0FADSSTk0lFFABRRRQAUUUUAFFFFABRRXIeMPGel+DtP+03p8yeQEQW6n5pCP5KO5/meKBpX0Rtazrel6BYvqOrTrBCnc9WPoo6kn0FfMvi74w6xrBez0Ddp9r08wH9+4/3h9z6Lz71514j8Tav4pv2v9WlLnny4xwkan+FR2+vU965+lc6IU0txzu8jmSRizMckk5JJ7k02iikahRRRQAUUUUAFFFFADkd43EkbFWU5BBwQR3Br2Pwj8YdY0cpZ6/u1C16eYT+/Qf7x+/9G5968aooJcU9z7/0bW9L1+xTUdJnWeF+46qfRh1BHoa1a+C/DnibV/C1+t/pMpQ8eZGeUkUfwsO/16jtX2L4P8Z6X4x0/wC02R8ueMAT27H5oyf5qex/keKaZzzp8p19FFFMzCiiigAooooAKKKKACrMb7hg9RValUlTkUAXKKQEEZFLQAUUUUAf/9T6pooooAjlbAwOpqtTmbc2abQAUUUUAFFFFABRRRQAUUU13SNDJIQqqCSTwAB1JoA57xV4lsfCmjy6te/Nt+WKMHBkkPRR/MnsMmvifX9e1HxJqcuq6m++WQ8AfdRR0VR2A/8Arnmul+InjCXxbrryRMfsNsTHbJ2x3fHq5Gfpgdq4GpbOqnCyCiiig0CiiigAooooAKKKKACiiigAooooAK2dA17UfDepxarpj7JYzyD911PVWHcH/wCuOaxqKBH3j4V8S2PivR4tWsvl3fLLGTkxyDqp/mD3GDXR18U/DvxhL4S11JJWP2G5IjuU7Y7Pj1QnP0yO9faiOkiCSMhlYAgjkEHoRTRyzhysdRRRTICiiigAooooAKKKKAJYmwdp71Yql0q2rblzQA6iiigD/9X6pqOVsLj1qSq0hy30oAjooooAKKKKACiiigAooooAK8d+Mnif+yNAXRrZ8XGo5VsHlYV+/wD99cL7jNexV8T/ABK13+3vF95Ojbobdvs0XptjyCR7Ftx/GkzSnG7ODooopHUFFFFABRXdfDjRv7a8WWsbruitibmXIyMR9M/VsCr3xF8FyeGdRN5ZoTp9yxMZHSNjyYz/AOy+o+hqeZX5R8ulzzeiiiqEFFFFABRRRQAUUUUAFFFFABX1l8G/E/8Aa+gNo1y+bjTsKuTy0Lfc/wC+eV9hivk2u8+Guu/2D4vs53bbDcN9ml9NsmACfYNtP4UIipG6PtiiiiqOQKKKKACiiigAooooAKmibnb61DSg4OaALlFA5GaKAP/W+qCcAmqdWZThcetVqACiiigAooooAKKKKACiiigDH8Q6kNH0K+1TvbW8ki+7BTtH4nAr4EJLEsxyTySa+yPi5dm18C3iDgzvFEPxcMf0U18bUmdFFaXCiiikbBRRXfeAPB0virVA9wpWwtyGnfpuPURg+p7+g/Ck3ZXYJX0PYvhJ4dbS9DbV7lcTagQy56iJfu/99Ek/TFemajp1nqtlLp+oRiWCZdrqf6ehHUHtVtESNFjjAVVAAA4AA6AU6uJyu7nSlZWPkXxr4C1DwpcNcRBp9Pdv3c2OVz0V8dD79D+lcBX3pNBDcwvb3CLJHICrI4BUg9QQeteD+LvhESXv/CvuWtHP/otj/Jvz7VvCrfSRlKn1R4HRVi6tLqxna1vYnhlQ4ZJAVYfgar1uZhRRRQAUUUUAFFFFABSglSGU4I5BFJRQB9+eHtSGsaFY6p3ubeORvZio3D8DkVsV5p8I7s3XgWzQ8mB5Yj+Dlh+jCvS6o4pKzsFFFFAgooooAKKKKACiiigCzEcrj0qSq8J5I9asUAf/1/qKY8gVDT5DlzTKACiiigAooooAKKKKACiiigDxz44SbPB8K/376Nf/AByQ/wBK+Tq+r/jhHJL4Ws4olLu+oxqqqMkkxy4AHrXnXh74SyTxLdeIZmh3DIgixvH+8xyB9AD9ayqVIw1kdmHg5LQ8VpQCSABknoK+s9P+Gvg2IMGsRKeOZHc/+zYrq9P8OaDpLB9OsbeBx/GqDd/311/Ws1XTV0bui07M+b/Cnwv1nXJEudTRrGzzklxiVx/sqemfU8ema+mtL0ux0axj07ToxFDEMKo/Uk9ye5rQorKc3LcuMUgoooqCgooooAxtZ8PaN4gh8jVrZJwBhWIw6/7rDBH4GvGdb+CzgtN4euwR1ENzwfwdR/Nfxr3+iqjNrYlxT3PizVfB3ibRSTf2EyovWRBvT/vpcgfjXM1981i3/hzQNUJbULC3mY/xtGu7/vrGf1rVVu6IdLsfEFFfWN38KPBlzkx28tuT/wA8pW/k+4Vgz/BTQmP+j3t0n+/sf+SrVqtEn2bPmyivoJ/ghAT+71Vx9YAf/ZxUY+Bw76uf/Af/AO20/ax7i5GeA0V71/wpi2UlX1NyRxkRAf8Asxrz3xX4E1Xwv/pDEXNoTgToMbSegdedufqR70o1oSdkypUpJXaPefgfJv8AB8y/3L6Rf/HIz/WvY68X+Bn/ACKV1/2EJP8A0VFXtFbo4J/EwooooICiiigAooooAKKKKAHIcMKt1Sq7QB//0Pp1uWP1pKD1ooAKKKKACiiigAooooAKKKKAMDWo7e4aCOZFcwP5yE87X2soI98MaxJZiDtTt1Na+oZ+1Nn0H8q585yc15VeTc3c+hwVNKmjV05mbzNxz0/rWnWXpn/LT8P61qVUNjOv8bCiiiqMjwX4m+OdVstUbQNIla2EKqZpE4dmcBgA3UAAjpzmsXwD4+1qLWrfStVuJLu3u5BEDKSzo7HCkMecZwCCa7D4h/Dy9129/trRdrTsoWaFiF3bRgMpPGccEHHSsnwN8MtUstVi1fX1WEWzb44QwdmcdCSpIAB565zXqRlQ9hZ7/jc42qntD3qiisnWp5ILPMR2l2C5HXGCf6V5iV9Dvpwc5KKNaiuE024livIwrHDuFYdjk4ru6co2NMRQdJ2ucf458RyeF9AfULdQ08jiGHdyA7AnJ+gBNfNkPjvxbBeC9Gozu2clHbdGfbZ93H0Ar6e8WeHYvFGiyaXI3lvkSRP12uvQkehBIPsa+f4fhP4ukvBbyxxRxZwZzIpXHqFB3foK9DByoqD57X8zza6nzLlPorw3rC6/odrq6rs89MsvYMpKsB7ZBxW3WXoulW+h6Vb6VakmO3TaCepPUk/UkmtSvPnbmfLsdUb21CiiipGc/LK6zvg8bjwfrTpobe/tXtrlBJFKpR0bkEHqKhn/ANfJ/vH+dTW2cNXM9z0ZRXLczvhjozaBp2p6WSSsWpSGNj3RoomU/kefevSqx9G2eVPs6+b8312L/TFbFevSleKbPm66tUkkFFFFWZBRRRQAUUUUAFFFFABVpWG0fSqtSBuKAP/R+nKKD1ooAKKKKACiiigAooooAKKKKAMDWpLe3aCSZ1Qzv5KA8bn2swA98KaxJYSTuT8RXKfHCSSLwtZyxMUdNRjZWU4IIilwQfWvOvD3xakgiW18QwtNtGBPFjef95TgH6gj6Vw4ig2+aJ62DxHLFKR75pysvmbhjp/WtOuR8MeLNE8RvLFpUxd4lDOrIykA8dxg/hXXVlFNKzNaklKTaCopJoouHYD2p7tsRm9ATXOsxYlmOSaJSsaUaXPudBHLHKMowNSVzsUjRuHXtXRURlcValyPQKw/EH/Hmn/XQfyNblZmrWsl3abIuWVgwHrjI/rVx3DDySqRbOQsv+PyD/rov8xXoVcZp+m3Zu0eSNkVGDEsMdOa7OqqPU6cfNOSswooqreSNHD8vVjis27HFGPM7D2uYEO1nGfzqZWVxuU5HtXN1dsZGWbZ2b+lQp6nTPDpRumbFFFFaHIc/LE7TvgcbjyfrSzTW9havc3LiOKJS7u3AAHU1w+q/E/wvYSyxxvLcSxuylY0I5BweW2jGe4zXivivx3qnif/AEcgW1mDkQoc7sdC5/ix+A9qiFCUnrojoqYlJWPpL4Y6y2v6dqeqEELLqUgjU9kWGJVH1wOfevSq8X+Bn/IpXX/YQk/9FRV7RXpxVlZHhVHeTbCiiimQFFFFABRRRQAUUUUAFLSU8DigD//S+nW+8frSU+QYc0ygAooooAKKKKACiiigAooqOWWOGNpZmVEUZZmOAB7k0AeN/HP/AJFK1/7CEf8A6Klr5Tr6P+Mfifw/q2gwaZpl7Dc3Ed6kjLEdwCiOQE7h8vUjvXzhUs6qS909U+D98tr4sNs5wLq3eNR/tLh/5Ka+pa+G9D1N9G1i01ROTbyq5A7qD8w/EZFfcEMsc8STwsGSRQysOhBGQa5qy1udVN6WHkAgg9DWLLaSxt8oLL2IrborncbnRTquGxkW9pIzhpBtUc89616KKaVgqVHN3YhZQQpIBPQetLXKeJ7K6ZYNWsMmazbdtHOVPXj27+2a1dK1mz1aASQMA+PnjJ+ZT9PT3p2NpYZ+xVaDuuvk/wDgmtSFlXG4gZOBn1pks0UEZlmdURerMcAfnXDNM/ifWolts/YbNt7P03MP8e3tk0JBhsM6t5N2it3/AF1Z3tRTRCaMoePQ+9S0UHMnZ3RgtbTqcbCfpzV+0tmjPmScHsKv0VCgkbTxEpKwVUv7uPT7G4v5fuW8Tyt9EBJ/lVuvM/ivrI0zwq9ohxLfOIV9do+Zz+Qx+NaRV3Y527K58qO7SOXc5ZiST7mm0UV3HMfVnwM/5FK6/wCwhJ/6Kir2ivnL4ReMPDWg+H59O1e9S2ne8eVVdWwUMcag7gCOqnvX0DY6jYanD9o064iuYz/HE4cfmCapHJUTuy5RRRQQFFFFABRRRQAUUUUAFWVX5R9KrVdHAxQB/9P6hlHzZqKrEw4BqvQAUUUUAFFFFABRRRQBgeJfEen+FtJl1bUW+VOEQfekc9FX3P6DmvjnxV421zxbctJfylLcHMdshIjQduP4j7nn6Diuw+MviCTU/E/9kI2bfTlCADoZHAZz+HC/ga8gpM6acLK4UUUUjUK+oPhL4kXVNEOjXD5uLDhQerQn7p/4Cfl9hivl+trw9rl34c1aHVrPloj8yHo6HhlP1H5HmonHmVioysz7forM0bV7LXdNh1SwbdFMuR6qe6n0IPBrTrjOgKKKKACuav8AwppV7KZ1DQSE5LRHAJ+mCPyxXS0UGtGvUpPmpysccnguxLhrqeeYD+FmAH+NdVbWtvZwiC1RY0Xoq1PRRcuti61ZWqSugooooOcKKKKACvkj4leJF8Q+InS2fda2YMMRHRjn52H1PGe4Ar2H4n+M10PTzo1g/wDpt2hDEHmKI8E/7zdB+fpXy5XRRh9pmVSXQKKKK3MgrT0nWdU0K7W+0m4e3lHdDwR6MOjD2IxWZRQI+zPh78QLfxlaNBchYdRgAMsY6OvTeme2eo7fiK9Ir4I8Na3ceHNctdYtycwSAuB/Eh4dfxXNfekciTRrLEQyOAykdCDyDTRzVI2eg+iiimZhRRRQAUUUUAOUZYCrdVohls+lWaAP/9T6nYZUiqlXaqONrEUANooooAKKKKACiiigD4U8ceZ/wmOr+b1+2zflvOP0xXLV6/8AGXw/Jpnif+10XFvqKhwR0EiAK4/HhvxNeQVJ2Rd0gooooKCiiigDuPBHjW78I3xJDS2UxHnQg/8Aj6+jD9RwexH1lpmqWOsWUeoadKs0MgyrD9QR2I7g18K10nhvxXq/ha7+0abJ8jEeZC/Mbj3Hr6EcisqlPm1RcZ20Z9q0VwPhf4i6B4kVYWcWl2eDBKQMn/YbgN9OD7V31czTW5snfYKKKKQwooooAKKKgubq2soGubyVIYkGWeRgqj6k8UAT1wHjfx3Y+FLYwRbZtQkX93D2XPRn9B6Dqf1HEeLfi7FGr2HhYb3+6btx8o/3FPX6nj2NeBXFxPdzPc3MjSyyHc7uSWJPck1tCl1kZyn0RJe3t1qN3LfXsjSzTMWd26kn/PA7VVoorpMQooooAKKKKACvvjwz5n/CN6Z5v3/sUG76+Wua+JPDWh3HiPXLXR7cHM8gDkfwoOXb8FzX3pHGkMaxRAKiAKoHQAcAU0YVnsh9FFFMwCiiigAooooAsRDC59alpAMACloA/9X6pqGVcjd6VNQRkYNAFKilIwcGkoAKKKKACiiigDA8S+HNP8U6TLpOor8r8o4+9G46MvuP1HFfHPirwTrnhK5aO/iL25OI7lATG47c/wAJ9jz9RzX3LUcsUc0bRTKrowwysMgj3BpWLhNxPzvor7dvPhx4HvnMk+lwgt18otEPyjZRVH/hU/w//wCgZ/5Hn/8AjlFjX2yPjCivs/8A4VP8P/8AoGf+R5//AI5R/wAKn+H/AP0DP/I8/wD8cosP2yPjCivs/wD4VP8AD/8A6Bn/AJHn/wDjlH/Cp/h//wBAz/yPP/8AHKLB7ZHxhXb6J8Q/FWhBYoLozwrwIrj94uPQH7wHsCK+mP8AhU/w/wD+gZ/5Hn/+OUf8Kn+H/wD0DP8AyPP/APHKTjfcFXS2Nxb0fxr+VSi7hPcj8KrNZyD7pDfpUJgmXqp/DmvOuz1OWLND7VB/e/Q003kQ6ZNUPKl/uN+VKIZTwFP8qLsORHkfjX4oavo+rXGi6XbxIYQn76TLsd6BuF4AxnHOa8R1bXtZ12UTatdSXBHIDH5V/wB1RhR+Ar69m+HXhHWZTqWr2Pm3UuPMfzZVztG0cK4HQDoKi/4VP8P/APoGf+R5/wD45XdTgrJnnVKy5mj4wor7P/4VP8P/APoGf+R5/wD45R/wqf4f/wDQM/8AI8//AMcrSxHtkfGFFfZ//Cp/h/8A9Az/AMjz/wDxyj/hU/w//wCgZ/5Hn/8AjlFg9sj4wor7P/4VP8P/APoGf+R5/wD45R/wqf4f/wDQM/8AI8//AMcosHtkfGFaek6Nqmu3a2Ok273Ep7IOAPVj0Ue5OK+wofhd4DgbcmloT/tySuPyZyK7Ox06w0yH7Pp1vFbRj+CJAg/IAUWE6y6HB/D34f2/g20ae5KzajOAJZB0ReuxM9s9T3P0FekUUUzBu7uwooooEFFFFABUkS5bPpUdWo12r9aAH0UUUAf/1vqmiiigCGVf4hUFXSMjBqoy7TigBtFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFU5b62i4Lbj6LzVCTVj/yyT8WNbQoTlsjeGGqS2QUUUV5B6IUUUUAalt/qV/H+dT1z5v54HMa4KjsRVmPVkPEqEe45r1oYafIpJdDiqYWpdySNeiq8VzBN/q2BPp0NWKzcWtGcsotOzQUUUUhBRRRQAUUUUAFFFFABRRRQAUUUDnigCSNdzewqzTUXaMU6gAooooA//9f6pooooAKY67h70+igClRU8ifxD8agoAKKKKACiiigAooooAKKilmjgTfIcD+dc/dX0lwdo+VPT1+tbUqEqm2xvRw8qm2xp3GpRRfLF87fpWNNdTzn943HoOBVeivTp0IQ2PVpYeFPZahRRRWxuW0ucDDjPuKmFxF61nUVw1Muoyd9iHTTNL7RF6/pUTXQ/gH51SopQy2jF3eoKmhzMWJY9TTaKK7kklZFhV6C/nh4J3r6H/GqNFKUFJWkiZwjJWkjqLe9huOAdrf3TVuuN6citW01IriO45HZu4+tcFbCNawPOr4Jr3qZu0UisGAZTkHoaWuE88KKKKACiiigAooooAKniT+I/hTI03HJ6VZoAKKKKACiiigD/9D6pooooAKKKKACq8iY+YdKsUUAUqKlkj28jpUVABRRRQAVBcXCW0e9/wAB60+WVIYzI/QVy8873Ehd/wAB6CujD0PaO72OrDYf2ju9hJ55Lh98h+g7CoaKK9ZJJWR7CSSsgooopjCiiigAooooAKKKKACiiigAooooAKKKKAL1pevbHa3KHqPT6V0aOrqHQ5B6GuOq/Y3ht32P9w9fb3rjxOH5vejucWKw3MueG50lFJ15FLXmHkhRRRQAU5ELGhELGrQAUYFAAAAMCloooAKKKKACiiigD//R+qaKKKACiiigAooooAKgePuv5VPRQBSoqy8YbkcGsfUpmgh2Dhn4/DvVQg5SUUXTg5yUUZV/defLsU/IvT3PrVCiivbhBRXKj3oQUIqKCiiiqKCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA3NMutw+zueR936ela9ccjsjB1OCDkV1kEoniWRe46e9eZi6XK+ddTysbR5Zc62ZLUiRluT0p6Rd2/Kpq4zhEAAGBS0UUAFFFFABRRRQAUUUUAf/0vqmiiigAooooAKKKKACiiigAqKWGKdNkqhh71LRTTtqhptao5q60eSPL2x3r/dPUf41isrKSrAgjqDXf1WuLS3uRiVQT2PQ/nXZSxjWkzupY5rSepxFFbdxosq/NbtvHoeD/hWRJFJE22VSp9xXdCrGfws9CnVhP4WR0UUVoaBRRRQAUUUUAFFFFABRRRQAUUUUAFFFKFLHaoJJ7CgBKK1INJupcGT92vv1/Kt22022t8MBub+839K56mJhHzOapi4Q82YFrplxcYZhsT1P9BXTW1rFax+XHn1JPrViivPq15VNHsebWxMqmj2CiiisDnCiiigAooooAKKKKACiiigD/9P6pooooAKKKKACiiigAooooAKKKKACiiigAprokg2uoYehGadRQBlzaRaScoCh9un5Gs2XRZ15idXHvwa6ait44mpHqdEMVUj1OKksbyP70Tfhz/KqpBU4YYPvXf0jKrDDAH610Rxr2aOmGPezRwFFdjc21vjPlpn/AHRXPzogPCgfhXXCpzdDthV5uhnUVIQM1YiVSeQK0bNGynRXU2tvA2N0aH6qK1FjjT7ihfoMVz1MRy9Dmq4nk6HFJa3Mn3I2Pvjir0ej3b/f2oPc5P6V1VFcssbN7I5JY+b+FWMaLRbdeZWZz6dBWpFBDAMRIF+gqWiuedWcviZyzrTn8TCiiiszMKKKKACiiigAooooAKKKKACiiigAooooA//Z'
    }
]


class ShareUrlMapping(object):
    DEAL = 'http://flashgo.online/webapp/deals/{}'
    VIDEO = 'http://flashgo.online/webapp/videodetail/{}'
    NEWS = 'http://flashgo.online/webapp/newsdetail/{}'


AUTHOR_AVATAR_CDN_FORMAT = 'https://cdn.flashgo.online/media-icons/{}.jpg'

ROUTE_NAME_TARGET_MAPPING = {
    'channel': 'com.cari.promo.diskon.activity.FeedChannelActivity',
    'cheapest': 'com.cari.promo.diskon.activity.FeedChannelActivity',

    'tab': 'com.cari.promo.diskon.activity.MainActivity',
    'usercenter': 'com.cari.promo.diskon.activity.MainActivity',
    'video_feed': 'com.cari.promo.diskon.activity.MainActivity',
    'recommend': 'com.cari.promo.diskon.activity.MainActivity',

    'news_detail': 'com.cari.cari.promo.diskon.activity.ArticleDetailCommonActivity',
    'article_detail': 'com.cari.cari.promo.diskon.activity.ArticleDetailCommonActivity',
    'image_detail': 'com.cari.cari.promo.diskon.activity.ArticleDetailCommonActivity',

    'flash': 'com.cari.promo.diskon.activity.FlashChannelActivity',
    'deal_detail': 'com.cari.promo.diskon.activity.ProductDetailActivity',
    'video_detail': 'com.cari.cari.promo.diskon.activity.ArticleVideoDetailActivity',
    'favorite': 'com.cari.promo.diskon.activity.FavoriteActivity',

    'topic_list': 'com.cari.cari.promo.diskon.topic_square.view.activity.TopicSquareActivity',
    'topic_detail': 'com.cari.cari.promo.diskon.activity.TopicDetailActivity',

    'cps_order_records': 'com.cari.cari.promo.diskon.activity.OrderDetailActivity',
    'cashback_share': 'com.cari.cari.promo.diskon.activity.ShareCashActivity'
}

TITLE_NEGATIVE_WORDS_LIST = [
    'giveaway'
]


def assert_unique(cls):
    attrs = {}
    for k, v in cls.__dict__.items():
        if not k.startswith('_') and k.isupper():
            if v in attrs:
                raise ValueError('for value %s has different key(%s,%s)' % (v, attrs[v], k))
            attrs[v] = k
    return cls


# Mainly for lists with two types, article and author
@assert_unique
class NewsFeedTypeMapping(object):
    ARTICLE = 1
    AUTHOR = 2
    TOPIC = 3


@assert_unique
class RedisKeyPrefix(object):
    NEWS = 'N:'
    DEAL = 'D:'
    COMMENT = 'C:'
    AUTHOR = 'A:'
    HOME = 'H:'
    USER = 'U:'
    TOPIC = 'T:'
    OFFLINE = 'F:'
    SEARCH = 'S:'
    COUPON = 'CP:'
    FAVORITE = 'FAV:'
    COMMON = 'COM:'
    BONUSES = 'B:'


USER_AVATAR_URL = 'https://d2hhrn98zk31zg.cloudfront.net/'
NEWS_THUMB_IMAGE_PATH = 'news-images/thumbs/refine'
NEWS_DEFAULT_THUMB_IMAGE = {
    'url': 'https://cdn.flashgo.online/admin/20190619_392cf5d455e14db383f3e45327fe6e7b.png',
    'width': 16,
    'height': 9
}

CHECK_COMMENT_INVALIDATION_URL = 'http://idtest.vm.newsinpalm.net/garbage_identifier'

INVALID_CATEGORY_IDS = {
    5556,
    9704,
    9710,
    10685,
    14581,
    14582,
    14584,
}

ADMIN_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXNzYWdlIjoiXHU2NjBlXHU1ZTc0XHU4MDAzXHU0ZTAwXHU0ZTJhXHU2ZTA1XHU1MzRlXHU3Njg0XHU4YmExXHU3Yjk3XHU2NzNhXHU0ZTEzXHU3ODU1XHU1M2VmXHU1OTdkPyIsImRhdGUiOiIyMDE5MTAyNSIsInVzZXIiOiJMaW5nZmVuZ0hlIn0.DGSuYwodxeyesuaIQhkrn4rLlbQeji2XkrsPPuyPDu'

VAPE_NEGATIVE_WORDS_SET = {
    "rta", "bentoel", "vapetrick", "arak", "dunhill", "nikotin", "merokok", "voopoo", "perokok", "nord", "vapeboss",
    "renova", "hexohm", "samsu", "geekvape", "squonk", "marboro", "pall mall", "u mild", "podpackers", "vaping",
    "vaper", "vapour", "tobacco", "minuman alkohol", "miras", "suorin", "nicotine", "djarum", "eciggarette", "juul",
    "udud", "smok", "caliburn", "cerutu", "atomizer", "sampoerna", "minuman keras", "surya pro mild", "iswitch", "rda",
    "vaporizer", "istick", "vaporesso", "uwell", "pod", "vave", "vapresso", "vap", "smonk", "druga", "smoktech",
    "puntung", "rokok", "class mild", "tembakau", "ciu", "kretek", "moti", "vape", "a mild", "vapouriz", "la light",
    "dji sam soe", "vapepackers", "lucky strike", "upods", "samsoe", "gudang garam", "vaptio", "rayvapor", "pro mild",
    "marlboro", "nic", "cigar", "cigarette", "coil", "throat hit", "mipod", "rokok elektrik", "liquid", "vapezoo",
    "mod", "joyetech", "vapor", "star mild"
}

EROTIC_NEGATIVE_WORDS_SET = {
    'entot', 'perkosa', 'coli', 'orgasm toys', 'boneka sex', 'pedofil', 'coli silikon', 'tetek', 'vagina', 'g-spot',
    'vibrator sex', 'sex toy', 'mainan sex', 'hentai', 'ngewe', 'adult video', 'pelacur', 'sex', 'oral', 'ewe',
    'alat bantu kesehatan wanita', 'mastrubation', 'kondom', 'sex vibrator', 'entod', 'orgasm toy', 'seks', 'puting',
    'nekopoi', 'clitoris', 'titan gel', 'alat bantu sex', 'mastrubasi', 'meki', 'alat bantu seks', 'seks doll', 'porn',
    'vibrator seks', 'xnxx', 'zinah', 'milf', 'alat bantu pria', 'vibrator wanita', 'perangsang', 'memek pussy',
    'dildo', 'sepong', 'condom', 'fingering', 'striptease', 'pornhub', 'orgy', 'toket', 'hentai film',
    'alat bantu wanita', 'kentod', 'sodomi', 'cialis', 'seks toys', 'kentot', 'seks vibrator', 'klitoris',
    'doggy style', 'gspot', 'adegan ranjang', 'durex', 'alat coli', 'sexual', 'mainan dewasa', 'alat fantasi pria',
    'anal', 'penis', 'memek', 'obat kuat', 'g spot', 'jav', 'oppai', 'sex toys', 'viagra', 'boneka seks', 'orgasme',
    'seks toy', 'mainan seks', 'sex doll', 'seksual', 'handjob', 'blowjob', 'film semi', 'bondage',
    'alat bantu kesehatan pria', 'kontol', 'porno', 'film hentai', 'bdsm', 'kumpul kebo', 'striptis', 'blue film',
    'sexy', 'seksi', 'buah dada', 'payudara', 'vibrator', 'lingerie', 'pelir', 'bikini', 'swimwear', 'miss v',
    'senggama', 'intim', 'ejakulasi', 'bercinta', 'gay', 'ngentod', 'bisyar', 'sange', 'terangsang', 'toy adult',
    'adult toy', 'pemuas', 'boob', 'boobs', 'butt lift', 'hubungan badan', 'berhubungan badan', 'erotis',
    'gairah', 'vibrat', 'vibrating'
}

NEGATIVE_WORDS_SET = VAPE_NEGATIVE_WORDS_SET | EROTIC_NEGATIVE_WORDS_SET

UPLOAD_FILE_PATH = '/datadrive/flashgo/logs/python/uploadfiles/'

MIN_USER_AUTHOR_ID = 100000
