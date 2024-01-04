import * as types from '../mutation'
const state = {
  index: true,
  list: [
  { path: '/AppBar', title: '标1题' }
  ]
}

// getters
const getters = {
  checkoutList: state => state.list,
  checkoutindexstate: state => state.index
}
const mutations = {
  [types.CHANGE_INDEX_STATE] (state) {
    state.index = !state.index
  }
}
export default {
  state,
  getters,
  mutations
}
