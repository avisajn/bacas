<template>
  <div class="page-navbar">
    <mt-navbar class="page-part" v-model="selected">
      <mt-tab-item id="1">Deskripsi</mt-tab-item>
      <mt-tab-item id="2">Mekanisme</mt-tab-item>
      <mt-tab-item id="3">S&K</mt-tab-item>
    </mt-navbar>

    <mt-tab-container v-model="selected">
      <mt-tab-container-item id="1">
        <div class="content">
          <p>Belanja hemat dengan potongan harga Rp 50.000 dan minimum transaksi Rp 500.000 hanya di Bhinneka!</p>
          <p>Ayo belanja produk 3C: Computer, communication technology & consumer electronics yang asli bikin tenang hanya di Bhinneka! Selain produknya dijamin asli, Bhinneka juga memiliki service centre tersertifikasi sendiri. Jadi tidak perlu ragu kena tipu-tipu belanja di sini!</p>
          <br>BELANJA DI SINI:
          www.bhinneka.com
        </div>
      </mt-tab-container-item>
      <mt-tab-container-item id="2">
        <div class="content">
          <p>
            Pembelian di
            <a href="//www.bhinneka.com" target="_blank">www.bhinneka.com</a>:
          </p>
          <p>
            1. Kunjungi
            <a href="//www.bhinneka.com" target="_blank">www.bhinneka.com</a>
          </p>
          <p>2. Klik “Registrasi” atau “Sign in” apabila sudah memiliki akun Bhinneka</p>
          <p>3. Pilih produk dengan klik pada gambar produk, Anda akan diarahkan ke halaman detail produk</p>
          <p>4. Masukkan produk yang anda inginkan ke dalam kerang belanja dengan klik “Beli”</p>
          <p>5. Dalam jendela pop-up klik “Lanjut ke pembayaran”, masukkan kode voucher Anda pada kolom yang tersedia, lalu klik “Validate eCoupon” dan klik “Lanjut”</p>
          <p>6. Isi data pembeli dan data penerima, pilih metode pengiriman, lalu klik “Lanjut”</p>
          <p>7. Pilih metode pembayaran dan total transaksi akan disesuaikan dengan kode voucher yang digunakan</p>
          <p>8. Klik “lanjut” dan Anda akan diarahkan ke halaman pembayaran (hanya jika menggunakan kartu kredit, internet banking, uang elektronik, kartu debit dan Kredivo)</p>
          <p>9. Selesaikan proses pembayaran dan transaksi telah diproses</p>
        </div>
      </mt-tab-container-item>
      <mt-tab-container-item id="3">
        <div class="content">
          <p>1. Diskon Rp 50.000 minimal pembelian Rp 500.000</p>
          <p>
            2. Voucher hanya berlaku untuk member di
            <a href="//www.bhinneka.com" target="_blank">www.bhinneka.com</a>
          </p>
          <p>3. Voucher hanya berlaku untuk 1 (satu) kali transaksi di www.bhinneka.com atau di Bhinneka store</p>
          <p>4. Voucher berlaku untuk pembelian semua produk yang dijual dan dikirim oleh Bhinneka.com kecuali promo Murah of The Day dan berlaku untuk semua produk di Bhinneka Store</p>
          <p>5. Voucher tidak berlaku untuk metode pembayaran tunai ditempat (untuk pembelian di www.bhinneka.com)</p>
          <p>6. Voucher berlaku untuk metode pengiriman JNE YES, ONS, tunai di tempat dan pick up di Bhinneka store (untuk pembelian di www.bhinneka.com)</p>
          <p>7. Voucher tidak dapat diuangkan</p>
          <p>8. Promo ini tidak bisa digabungkan dengan promo lainnya</p>
          <p>9. Bhinneka berhak melakukan pembatalan pesanan jika ditemui adanya pelanggarann atau penyalahgunaan promosi ini, serta membatalkan transaksi yang sudah berhasil dilakukan</p>
          <p>10. Kebijakan dapat berubah sewaktu – waktu tanpa ada pemberitahuan sebelumnya, serta mutlak merupakan keputusan Bhinneka</p>
        </div>
      </mt-tab-container-item>
    </mt-tab-container>
  </div>
</template>
<script>
import axios from "axios";
export default {
  name: "page-navbar",
  data() {
    return {
      selected: "1"
    };
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.page-navbar {
  position: relative;
}
.content {
  font-size: 14px;
  color: #666666;
  padding: 0px 16px;
}
.mint-navbar {
  border-bottom: 1px solid #e0e0e0;
  /*   position: fixed;
  top: 0px; */
}
.mint-tab-item-label {
  font-size: 13px;
  color: #333333;
  font-weight: bold;
}
.mint-navbar .mint-tab-item.is-selected {
  border-bottom: 3px solid #f54437;
}
p {
  margin: 3px;
}
a {
  text-decoration: none;
  color: #bc8f8f;
}
</style>
