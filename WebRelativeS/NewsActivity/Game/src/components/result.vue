<template>
  <div class="full">
    <result-page :resultObj="dataObj"></result-page>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  name: 'ResultMainPage',
  data() {
    return {
      dataObj: null,
      mostNum: '',
      name: '',
      dataSource: [{
          number: 1,
          title: 'SI PROFESIONAL',
          desc: 'Kamu punya reflek, kewaspadaan area, dan skill mekanikal yang luar biasa untuk menghabisi semua lawan di peta.',
          info: 'Bandingkan hasilnya dengan temanmu!',
          name: ''
        },
        {
          number: 2,
          title: 'SI HANTU',
          desc: 'Kamu manusia tak terlihat. Tidak ada yang tahu di mana dan kapan kamu akan muncul berikutnya. Serangan gerilya adalah keahlianmu.',
          info: 'Bandingkan hasilnya dengan temanmu!',
          name: ''

        }, {
          number: 3,
          title: 'SI AHLI SIASAT',
          desc: 'Seorang komandan yang cerdas dan penuh strategi. Kamu selalu tenang dan penuh perhitungan sebelum beraksi.',
          info: 'Bandingkan hasilnya dengan temanmu!',
          name: ''

        }, {
          number: 4,
          title: 'SI BERLIAN KASAR',
          desc: '"Game cupu begini terlalu sulit!" Tenang, semua pemain pro berawal dari pemula. Kamu punya potensi tak terbatas.',
          info: 'Bandingkan hasilnya dengan temanmu!',
          name: ''

        }, {
          number: 5,
          title: 'SI HOKI',
          desc: 'Untung beruntung, menang modal hoki tanpa perlu kill.',
          info: 'Bandingkan hasilnya dengan temanmu!',
          name: ''

        }, {
          number: 6,
          title: 'SI KOLEKTOR',
          desc: 'Kamu seorang pengumpul barang. Seperti main game RPG, semua peralatan selalu siap di dalam tas. Seorang support yang baik bagi tim.',
          name: '',
          info: 'Bandingkan hasilnya dengan temanmu!',
        }, {
          number: 7,
          title: 'SI PENYERBU',
          desc: 'Kamu tidak mengenal takut, skill baku tembak terbaik, dan jagoan menembus formasi musuh. Kata mundur tidak ada dalam kamusmu.',
          info: 'Bandingkan hasilnya dengan temanmu!',
          name: ''
        }, {
          number: 8,
          title: 'SI KREATIF',
          desc: 'Kamu sulit untuk diprediksi lawan, cocok berperan untuk semua jenis tugas dalam tim.',
          info: 'Bandingkan hasilnya dengan temanmu!',
          name: ''
        },

      ]
    }
  },
  created() {
    this.name = this.$route.params.name;
    this.mostNum = this.$route.params.number;
    if (this.mostNum) {
      this.dataObj = this.dataSource[this.mostNum - 1];
    }
    if (this.name) {
      this.dataObj.name = this.name;
    }
  }
}

</script>
<style scoped="scoped">
.full {
  width: 100%;
  height: 100%;
}

</style>
