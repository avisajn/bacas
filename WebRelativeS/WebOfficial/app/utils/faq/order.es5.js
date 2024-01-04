const $formatOrder = (JSONStr) => {
  var info = {};
  var returnValue = ''
  try {
    var $date = function (date, key)  {
      var dateTimeStr = ''
      if (!key) {
        if (date.getDate() > 10) {
          dateTimeStr = dateTimeStr.concat(date.getDate())
        } else {
          dateTimeStr = dateTimeStr.concat('0' + date.getDate())
        }
        dateTimeStr = dateTimeStr.concat('-')
        if (date.getMonth() + 1 > 10) {
          dateTimeStr = dateTimeStr.concat(date.getMonth() + 1)
        } else {
          dateTimeStr = dateTimeStr.concat('0' + (date.getMonth() + 1))
        }
        dateTimeStr = dateTimeStr.concat(' ')
        if (date.getHours() > 10) {
          dateTimeStr = dateTimeStr.concat(date.getHours())
        } else {
          dateTimeStr = dateTimeStr.concat('0' + date.getHours())
        }
        dateTimeStr = dateTimeStr.concat(':')
        if (date.getMinutes() > 10) {
          dateTimeStr = dateTimeStr.concat(date.getMinutes())
        } else {
          dateTimeStr = dateTimeStr.concat('0' + date.getMinutes())
        }
        dateTimeStr = dateTimeStr.concat(':')
        if (date.getSeconds() > 10) {
          dateTimeStr = dateTimeStr.concat(date.getSeconds())
        } else {
          dateTimeStr = dateTimeStr.concat('0' + date.getSeconds())
        }
        dateTimeStr = '<b>' + dateTimeStr + '</b>'
      } else {
        dateTimeStr = dateTimeStr.concat(date.getFullYear())
        dateTimeStr = dateTimeStr.concat('-')
        if (date.getMonth() + 1 > 10) {
          dateTimeStr = dateTimeStr.concat(date.getMonth() + 1)
        } else {
          dateTimeStr = dateTimeStr.concat('0' + (date.getMonth() + 1))
        }
        dateTimeStr = dateTimeStr.concat('-')
        if (date.getDate() > 10) {
          dateTimeStr = dateTimeStr.concat(date.getDate())
        } else {
          dateTimeStr = dateTimeStr.concat('0' + date.getDate())
        }
        dateTimeStr = dateTimeStr.concat(' ')
        if (date.getHours() > 10) {
          dateTimeStr = dateTimeStr.concat(date.getHours())
        } else {
          dateTimeStr = dateTimeStr.concat('0' + date.getHours())
        }
        dateTimeStr = dateTimeStr.concat(':')
        if (date.getMinutes() > 10) {
          dateTimeStr = dateTimeStr.concat(date.getMinutes())
        } else {
          dateTimeStr = dateTimeStr.concat('0' + date.getMinutes())
        }
        dateTimeStr = dateTimeStr.concat(':')
        if (date.getSeconds() > 10) {
          dateTimeStr = dateTimeStr.concat(date.getSeconds())
        } else {
          dateTimeStr = dateTimeStr.concat('0' + date.getSeconds())
        }
      }

      return dateTimeStr
    }
    var targetURI = 'nipspecial://switch_to_manual';
    var res = JSON.parse(JSONStr);
    if (res && !res.code) {
      var data = res.data;
      info.state = 'ok';
      if (data.status === 1) {
        var date = new Date(data.order_payment.expired_time * 1000);
        var dateStr = $date(date);
        info.content = 'Hai kak, pesanan kakak ada yang belum dibayar nih. Stok produk yang kakak inginkan sangat terbatas. Silahkan melakukan pembayarannya segera sebelum ' + dateStr + ' agar tidak dibatalkan otomatis oleh sistem.';
      } else if (data.status === 2) {
        var dateNow = new Date().getTime() / 1000;
        var waitting = 3 * 60 * 60;
        if (data.estimated_cancellation_time && data.estimated_cancellation_time - dateNow <= waitting) {
          var date = new Date(data.estimated_cancellation_time * 1000);
          var dateStr = $date(date);
          info.content = 'Saat ini, pesanan kaka sedang bergegas untuk dikemas! Kami akan meminta vendor untuk mengirimkannya sesegera mungkin! Jika pesanan kaka belum diserahkan ke kurir hingga ' + dateStr +', kami akan membatalkan pesanan ini dan memberikan kupon diskon spesial untuk kaka.  Mohon bersabar dan menunggu ya kak, terimakasih!' + 'Jika kakak ingin membatalkan <a href="' + targetURI +'" >klik disini</a>, silahkan klik disini untuk menghubungi admin Mokkaya.';
        } else {
          info.content = 'Vendor sedang menyiapkan pesanan kaka nih. Setelah pesanan dikirim, kaka akan akan mendapatkan pemberitahuan dari kami. Kaka juga dapat memuat ulang aplikasi untuk mendapatkan informasi pengiriman yang terbaru.Jika kakak ingin membatalkan pesanan ini, silahkan <a href="' + targetURI +'" >klik disini</a> untuk menghubungi admin Mokkaya.';
        };
      } else if (data.status === 3) {
        var arr = []
        if (data.order_express_info && data.order_express_info.pickup_time) {
          data.order_express_info.records.forEach(val => {
            if (val.time >= data.order_express_info.pickup_time) {
              arr.push($date(new Date(val.time * 1000), 1) + ' ' + val.description);
            };
          });
        }
        info.express_array = arr.join('$$')
        if (!data.order_express_info || !data.order_express_info.pickup_time) {
          var waitting = 2 * 24 * 60 * 60;
          if (data.estimated_cancellation_time - new Date().getTime() / 1000 <= waitting) {
            var date = new Date(data.estimated_cancellation_time * 1000);
            var dateStr = $date(date);
            info.content = 'Vendor sudah menghubungi pihak kurir untuk memulai proses pengiriman pesanan kakak. Kami juga akan mendesak vendor untuk dapat mempersiapkan pesanan kakak segera! Jika pesanan kakak masih belum pick up hingga ' + dateStr + ', kami akan membatalkan pesanan kakak dan memberikan kompensasi berupa kupon spesial untuk kakak. Mohon bersabar dan menunggu ya kak! Jika kakak ingin membatalkan pesanan ini, silahkan <a href="' + targetURI + '">klik disini</a> untuk menghubungi admin Mokkaya.';
          } else {
            info.content = 'Vendor sudah menghubungi pihak kurir untuk memulai proses pengiriman pesanan kakak. Jika pesanan sudah sukses pick up oleh kurir, kami akan mengirimkan notifikasi kepada kakak.  Kakak juga dapat merefresh aplikasi Mokkaya untuk mendapatkan informasi pengiriman yang terbaru.Jika kakak ingin membatalkan pesanan ini, silahkan <a href="' + targetURI +'">klik disini</a> untuk menghubungi admin Mokkaya.';
          };
        } else {
          var lastTime = 0;
          if (data.order_express_info && data.order_express_info.pickup_time) {
            lastTime = data.order_express_info.pickup_time
          }
          var waitting = 3 * 24 * 60 * 60;
          if (lastTime && new Date().getTime() / 1000 - lastTime  < waitting) {
            var date = new Date(data.order_express_info.pickup_time * 1000);
            var dateStr = $date(date);
            data.order_express_info.records.forEach(val => {
              arr.push($date(new Date(val.time * 1000), 1) + ' ' + val.description)
            });
            var str = 'Pesanan kakak telah berhasil dibawa oleh pihak kurir pada '+ dateStr +' dan sedang dalam proses pengiriman ke alamat tujuan! Lamanya pengiriman tergantung dari alamat vendor dan tujuan pesanan, dengan perkiraan maksimal <b>3 hari</b> kerja untuk pengiriman sesama pulau Jawa. Kakak juga dapat melihat informasi lengkap mengenai riwayat pengiriman pesanan kakak pada halaman detail pesanan. Mohon bersabar dan menunggu ya kak! Silahkan <a href="' + targetURI + '">klik disini</a> untuk menghubungi admin Mokkaya.';
            info.content = str;
          } else {
            data.order_express_info.records.forEach(val => {
              arr.push($date(new Date(val.time * 1000), 1) + ' ' + val.description)
            });
            var str = 'Pesanan kakak sedang dalam proses pengiriman, silahkan <a href="' + targetURI + '">klik disini</a> untuk menghubungi admin Mokkaya';
            info.content = str;
          };
        };
      } else if (data.status === 4 && data.sub_status === 0 && !data.get_supported) {
        var str = '';
        var arr = [];
        if (data.order_express_info && data.order_express_info.pickup_time) {
          data.order_express_info.records.forEach(val => {
            if (val.time >= data.order_express_info.pickup_time) {
              arr.push($date(new Date(val.time * 1000), 1) + ' ' + val.description);
            };
          });
        }
        if (arr.length) {
          info.express_array = arr[0]
        } else {
          info.express_array = '';
        };
        if (!data.has_complaint) {
          var waitting = 3 * 24 * 60 * 60;
          if (!data.delivered_time || new Date().getTime() / 1000 - data.delivered_time <= waitting) {
            var date = new Date(data.delivered_time * 1000 + 5 * 24 * 60 * 60 * 1000);
            var dateStr = $date(date);
            if (data.user_payment_type === 3) {
              str = str.concat('Pesanan kakak telah berhasil diterima di alamat tujuan. Keuntungan kakak akan dicarikan pada ' + dateStr + '. Jika kakak ingin melakukan komplain untuk pesanan kakak, silahkan <a href="' + targetURI + '">klik disini</a> untuk menghubungi admin Mokkaya.');
            } else {
              str = str.concat('Pesanan kakak telah berhasil diterima di alamat tujuan. Jika kakak ingin melakukan komplain untuk pesanan kakak, silahkan <a href="' + targetURI + '">klik disini</a> untuk menghubungi admin Mokkaya.');
            };
          } else {
            var date = new Date(data.delivered_time * 1000 + 5 * 24 * 60 * 60 * 1000);
            var dateStr = $date(date);
            if (data.user_payment_type === 3) {
              str = str.concat('Pesanan ini telah terkirim lebih dari <b>3 hari</b>, sehingga komplain tidak dapat diajukan. Keuntungan kakak akan dicarikan pada ' + dateStr + '. Jika kakak membutuhkan bantuan untuk pesanan yang lainnya, silahkan klik tombol "Bantuan pesanan lain"');
            } else {
              str = str.concat('Pesanan ini telah terkirim lebih dari <b>3 hari</b>, sehingga komplain tidak dapat diajukan. Jika kakak membutuhkan bantuan untuk pesanan yang lainnya, silahkan klik tombol "Bantuan pesanan lain"');
            };
          };
        } else {
          str = 'Pesanan ini telah berhasil dikirimkan, sehingga proses komplain tidak dapat dilakukan. Jika kakak mempunyai pertanyaan untuk pesanan yang lain, silahkan klik tombol "Bertanya pesanan lainnya"'
        }

        info.content = str;
      } else if (data.status === 4 && data.sub_status === 401) {;
        if (data.user_payment_type === 3) {
          info.content = 'Komplain untuk pesanan ini telah berhasil diajukan dan saat ini sedang ditangani oleh tim Mokkaya. Mohon bersabar dan menunggu. Jika komplain tersebut dibatalkan atau tidak dapat dilanjutkan, keuntungan kakak akan dicairkan setelah proses komplain tersebut dinyatakan selesai. Jika kakak mempunyai pertanyaan lain, silahkan <a href="' + targetURI + '">klik disini</a> untuk menghubungi admin Mokkaya';
        } else {
          info.content = 'Komplain untuk pesanan ini telah berhasil diajukan dan saat ini sedang ditangani oleh tim Mokkaya. Mohon bersabar dan menunggu. Jika kakak mempunyai pertanyaan lain, silahkan <a href="' + targetURI + '">klik disini</a> untuk menghubungi admin Mokkaya';
        };
      } else if ([ 402, 403, 404, 405, 506 ].indexOf(data.sub_status) >= 0) {
        info.content = 'Komplain untuk pesanan ini telah selesai untuk diproses. Mohon maaf atas ketidaknyamanan yang kakak alami. Sebagai ungkapan pemintaan maaf, kami akan memberikan 2 kupon spesial untuk kakak. Kami sangat menantikan pesanan kakak selanjutnya. Terima kasih.';
      } else if (data.sub_status === 601) {
        info.content = 'Pesanan ini telah ditolak oleh pembeli. Silahkan menghubungi pembeli kakak untuk menanyakan perihal situasi tersebut. Sesuai dengan peraturan Mokkaya, kami akan memberikan pinalti untuk pesanan ini sebesar 1 kali ongkir. Mohon lebih berhati - hati ya kak. Jika kakak mempunyai pertanyaan lain, silahkan <a href="'+ targetURI +'">klik disini</a> untuk menghubungi admin Mokkaya';
      } else if (data.sub_status === 602) {
        info.content = 'Kami memohon maaf atas dibatalkannya pesanan ini karena suatu hal. Sekali lagi mohon maaf atas ketidaknyamanannya ya kak. Jika kakak mempunyai pertanyaan lain, silahkan <a href="' + targetURI + '">klik disini</a> untuk menghubungi admin Mokkaya';
      } else if (data.sub_status === 603) {
        info.content = 'Kami memohon maaf atas dibatalkannya pesanan ini karena stok produk sudah habis. Sebagai bukti permintaan maaf kami, kami telah memberikan kupon spesial untuk kakak. Jika kakak mempunyai pertanyaan lain, silahkan <a href="' + targetURI + '">klik disini</a> untuk menghubungi admin Mokkaya';
      } else if (data.sub_status === 605) {
        info.content = 'Kami memohon maaf atas dibatalkannya pesanan ini, karena vendor tidak berhasil mengirimkan pesanan kakak sampai dengan waktu yang telah ditentukan. Sebagai bukti permintaan maaf kami, kami telah memberikan kupon spesial untuk kakak. Jika kakak mempunyai pertanyaan lain, silahkan <a href="' + targetURI  + '">klik disini</a> untuk menghubungi admin Mokkaya';
      } else if (data.sub_status === 604) {
        info.content = 'Pesanan ini telah berhasil dibatalkan. Kakak bisa melakukan pembelian kembali melalui aplikasi Mokkaya'
      } else if (data.sub_status === 606) {
        info.content = 'Pesanan ini sudah tidak berlaku karena tidak berhasil dibayar sampai lebih dari 24 jam. Jika diperlukan, kakak dapat mengklik tombol "pesan lagi" untuk melakukan pemesanan ulang dengan data produk dan pembeli yang sama.'
      } else if (data.sub_status === 502) {
        info.content = 'Kami memohon maaf atas dibatalkannya pesanan ini karena suatu hal. Pengembalian dana telah dikembalikan ke dalam saldo kakak, <a href="https://mokkaya.com/webapp/user_center/mywallet?_s=faq"> klik disini untuk melihat saldo>></a>. Sekali lagi mohon maaf atas ketidaknyamanannya ya kak. Jika kakak mempunyai pertanyaan lain, silahkan <a href="'+ targetURI +'">klik disini</a> untuk menghubungi admin Mokkaya';
      } else if (data.sub_status === 503) {
        info.content = 'Kami memohon maaf atas dibatalkannya pesanan ini karena stok produk sudah habis. Pengembalian dana telah dikembalikan ke dalam saldo Mokkaya kakak, <a href="https://mokkaya.com/webapp/user_center/mywallet?_s=faq">klik disini untuk melihat saldo>></a>. Sebagai bukti permintaan maaf kami, kami telah memberikan kupon spesial untuk kakak. Jika kakak mempunyai pertanyaan lain, silahkan  <a href="' + targetURI +'">klik disini</a> untuk menghubungi admin Mokkaya';
      } else if (data.sub_status === 504) {
        info.content = 'Pesanan ini telah berhasil dibatalkan. Pengembalian dana telah dikembalikan ke dalam saldo kakak, <a href="https://mokkaya.com/webapp/user_center/mywallet?_s=faq">klik disini untuk melihat saldo>></a> .Kakak bisa melakukan pembelian kembali melalui aplikasi Mokkaya';
      } else if (data.sub_status === 505) {
        info.content = 'Kami memohon maaf atas dibatalkannya pesanan ini, karena vendor tidak berhasil mengirimkan pesanan kakak sampai dengan waktu yang telah ditentukan. Pengembalian dana telah dikembalikan ke dalam saldo Mokkaya kakak,  <a href="https://mokkaya.com/webapp/user_center/mywallet?_s=faq"> klik disini untuk melihat saldo>></a> . Sebagai bukti permintaan maaf kami, kami telah memberikan kupon spesial untuk kakak. Jika kakak mempunyai pertanyaan lain, silahkan  <a href="' + targetURI + '">klik disini</a> untuk menghubungi admin Mokkaya';
      };
      returnValue = info;
    } else {
      info.state = 'error';
      returnValue = info;
    };
  } catch (error) {
    info.state = 'error';
    returnValue = info;
  };
}


// 用于js原生测试
module.exports = $formatOrder
