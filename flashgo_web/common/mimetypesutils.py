MIME_TYPES = dict(
    txt='text/plain',
    htm='text/html',
    html='text/html',
    php='text/html',
    css='text/css',
    js='application/javascript',
    json='application/json',
    xml='application/xml',
    swf='application/x-shockwave-flash',
    flv='video/x-flv',

    # images
    png='image/png',
    jpe='image/jpeg',
    jpeg='image/jpeg',
    jpg='image/jpeg',
    gif='image/gif',
    bmp='image/bmp',
    ico='image/vnd.microsoft.icon',
    tiff='image/tiff',
    tif='image/tiff',
    svg='image/svg+xml',
    svgz='image/svg+xml',
    webp='image/webp',

    # archives
    zip='application/zip',
    rar='application/x-rar-compressed',
    exe='application/x-msdownload',
    msi='application/x-msdownload',
    cab='application/vnd.ms-cab-compressed',

    # audio/video
    mp3='audio/mpeg',
    ogg='audio/ogg',
    qt='video/quicktime',
    mov='video/quicktime',

    # adobe
    pdf='application/pdf',
    psd='image/vnd.adobe.photoshop',
    ai='application/postscript',
    eps='application/postscript',
    ps='application/postscript',

    # ms office
    doc='application/msword',
    rtf='application/rtf',
    xls='application/vnd.ms-excel',
    ppt='application/vnd.ms-powerpoint',

    # open office
    odt='application/vnd.oasis.opendocument.text',
    ods='application/vnd.oasis.opendocument.spreadsheet',
)


def guess_types(filename):
    if '.' in filename:
        suffix = filename.rsplit('.', 1)[1].lower()
        if suffix in MIME_TYPES:
            return suffix, MIME_TYPES[suffix]
        else:
            return '', None
    else:
        return '', None
