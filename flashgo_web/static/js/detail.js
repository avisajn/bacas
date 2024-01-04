function back() {
    window.location.href = 'http://kasbon.cash/ads/flashgo/index.html'
}

function goToDetail(dealId) {
    window.location.href = 'http://flashgo.online/sales/deals/webapp/detail/' + dealId
}

function gotoDownload(campaign) {
    window.location.href = 'https://app.appsflyer.com/com.cari.promo.diskon?pid=webapp&utm_source=webapp&c=' + campaign
}

function gotoTarget(target) {
    window.location.href = target
}

function closeDownload() {
    $('.banner-background').hide()
}

function showCountdown(start_time) {
    const countDownDate = new Date(start_time).getTime();
    const x = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        if (distance > 0) {
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);
            if (hours < 10) {
                hours = '0' + Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            }
            if (minutes < 10) {
                minutes = '0' + Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            }
            if (seconds < 10) {
                seconds = '0' + Math.floor((distance % (1000 * 60)) / 1000);
            }
            $('#span-hours').text(hours);
            $('#span-minutes').text(minutes);
            $('#span-seconds').text(seconds);
        } else {
            $('#span-hours').text('00');
            $('#span-minutes').text('00');
            $('#span-seconds').text('00');
        }

        if (distance < 0) {
            clearInterval(x);
        }
    }, 1000);
}
