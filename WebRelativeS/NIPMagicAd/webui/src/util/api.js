import Fetch from './fetch';
import Store from './store';
import moment from 'moment';

const getStoreInterface = function(url, options, { key, ttl } = {}) {
  if (key) {
    const localData = Store.get(key);
    if (localData) {
      return new Promise((r, f) => {
        r(localData);
      });
    } else {
      return Fetch(url, options).then((k) => {
        Store.set(key, k, ttl || 2 * 24 * 60 * 60);
        return k;
      })
    }
  } else {
    return Fetch(url, options);
  }
}


export default {
  // 

  offer: {
    getadunit() {
      return getStoreInterface('/api/magicad/adunit', null, { key: 'adunitdata', ttl: 10 * 60 });
    },
    getadunits() {
      return getStoreInterface('/api/magicad/adunit', null, { key: 'adunitdatas', ttl: 10 * 60 });
    },
    getpublisher() {
      return getStoreInterface('/api/magicad/publisher', null, { key: 'publisher', ttl: 5 * 60 });
    },
    getadtype() {
      return getStoreInterface('/api/magicad/adtype', null, { key: 'adtype', ttl: 10 * 60 });
    },
    savepublisher(param) {
      return getStoreInterface('/api/magicad/publisher', { method: 'post', body: param, isFormRequest: true });
    },

    saveoffer(param) {
      return getStoreInterface('/api/magicad/offer', { method: 'post', body: param, isFormRequest: true });
    },
    updOffer(param) {
      return getStoreInterface('/api/magicad/updimg', { method: 'post', body: param, isFormRequest: true });
    },

    upload(form) {
      return getStoreInterface('/api/magicad/uploadimage', { method: 'post', body: form, attach: true, isFormRequest: true });
    },
    uploadpage(param) {
      return getStoreInterface('/api/magicad/uploadpage', { method: 'post', body: param });
    },
    getofferlist(page = 1, u) {
      return getStoreInterface('/api/magicad/offer?page=' + page + (u ? ('&u=' + u) : '')).then((k) => {
        return k;
      });
    },

    deleteRow(id) {
      return getStoreInterface('/api/magicad/offer?id=' + id, { method: 'delete', body: { id: id } });
    },
    getmcc() {
      return getStoreInterface('/api/magicad/mccmnc', null, { key: 'getmcc', ttl: 10 * 60 });
    },
    getbrand() {
      return getStoreInterface('/api/magicad/devicebrand', null, { key: 'getbrand', ttl: 10 * 60 });
    },

  },


};
