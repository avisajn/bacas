function gotoDownload(campaign) {
    window.location.href = 'https://app.appsflyer.com/com.cari.promo.diskon?pid=webapp&utm_source=webapp&c=' + campaign
}

function gotoTarget(target) {
    window.location.href = target
}

function closeDownload() {
    $('.banner-background').hide()
}