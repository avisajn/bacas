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
          <p> ShopBack adalah platform yang memberikan tambahan cashback uang tunai tiap kali kamu belanja di 200+ toko online! Mulai dari gadget, fashion, hotel, pulsa, hingga transportasi online, pasti selalu dapat cashback dengan sekali klik. 
         </p>
        <br>
        Customer Service: 
        help@shopback.co.id</div>

      </mt-tab-container-item>  
      <mt-tab-container-item id="2"> 
      <div class="content">
        <p> 1. Kunjungi <a href="//www.shopback.co.id/baca-lazada" target="_blank">www.shopback.co.id/baca-lazada</a> dan sign up / log in dengan kode  voucher yang Anda dapatkan setelah menukarkan points
        </p>
        <p>2. Klik banner utama yang tertera pada halaman promo dengan terlebih dahulu membaca syarat & ketentuan
        </p>
        <p> 3. Lakukan transaksi seperti biasa di merchant Lazada dan selesaikan pembayaran
        </p>
        <p> 4. Cashback akan masuk secara otomatis ke akun ShopBack Anda dalam waktu 4 x 24 jam (hari kerja)
        </p>
        <p>
              5. Transfer cashback ke rekening bank Anda atau cairkan cashback dalam bentuk pulsa setelah melewati waktu validasi.
        </p>

      </div>
      </mt-tab-container-item>  
      <mt-tab-container-item id="3">  
        <div class="content">
          <p>1. Voucher hanya bisa digunakan 1 kali untuk 1 (satu) transaksi
          </p>
          <p>2. Cashback 50% Maks. Rp 80.000 akan masuk secara otomatis ke dalam akun ShopBack dalam waktu  4 x 24 jam (hari kerja)</p>
          <p>3. Voucher hanya berlaku untuk pengguna baru Shopback
          </p>
          <p>4. Cashback hanya berlaku pada pemesanan final (tidak termasuk ongkos kirim dan biaya tambahan lainnya).
          </p>
          <p>5. Cashback berlaku untuk transaksi Sukses (tidak di cancel atau refund)
          </p>
          <p>6. Cashback tidak berlaku untuk transaksi melalui desktop dan mobile site
          </p>
          <p>7. Cashback tidak berlaku untuk pembelian logam mulia/emas
          </p>
          <p>8. Untuk info lebih lanjut, silahkan lihat syarat dan ketentuan di </p>
          <p><a href="https://www.shopback.co.id/baca-lazada">https://www.shopback.co.id/baca-lazada</a>
          </p>

        </div>
      </mt-tab-container-item>  
    </mt-tab-container>  
  </div>  

</template>
<script>
import axios from 'axios';
 export default {
   name: 'page-navbar',
    data() {
      return {
        selected: '1'
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
  border-bottom: 3px solid #F54437;
}
p{
  margin: 3px;
}
a {
  text-decoration: none;
  color: #BC8F8F;
}
</style>
