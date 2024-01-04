import Numeral from 'numeral'
import Vue from 'vue'

Vue.filter('formatMoney', function(value) {
  return Numeral(value).format('0,0').replace(/,/g, '.')
})
