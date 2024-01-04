<template>
  <div class="panel-container">
    <div v-show="loading" class="loading-panel">
      <mu-circular-progress :size="50" :strokeWidth="5" />
    </div>
    <mu-flexbox class="mt8 mt-panel">
      <mu-flexbox-item :class="{ flexhide: !tbGrid.open ,'flex-demo':true} " style="flex: 1.5 1 auto">
        <mu-table :showCheckbox="false">
          <mu-thead>
            <mu-tr>
              <mu-th>name</mu-th>
              <mu-th style="width:146px">start_time</mu-th>
              <mu-th style="width:146px">end_time</mu-th>
              <mu-th style="width:220px"></mu-th>
            </mu-tr>
          </mu-thead>
          <mu-tbody>
            <mu-tr v-for="(item ,idx) in tbGrid.data" :key="item.offer_id">
              <mu-td>{{item.name}}</mu-td>
              <mu-td>{{item.start_time_str}}</mu-td>
              <mu-td>{{item.end_time_str}}</mu-td>
              <mu-td>
                <mu-flat-button label="CLONE" class="table-button demo-flat-button" @click="cloneRow(item.offer_id)" primary />
                <mu-flat-button label="MODIFY" class="table-button demo-flat-button" @click="updRow(item.offer_id)" primary />
                <mu-flat-button label="DELETE" class="table-button demo-flat-button" @click="deleteRow(idx,item.offer_id)" primary />
              </mu-td>
            </mu-tr>
          </mu-tbody>
        </mu-table>
        <div class="load-more" v-show="!tbGrid.showNoRow" @click="nextGridPage()"> More </div>
      </mu-flexbox-item>
      <mu-flexbox-item class="flex-demo">
        <div style="background:white;">
          <mu-flat-button label="History" icon="view_list" @click="toggleList()" />
          <div class="panel">
            <table class="panel-form">
              <tr>
                <td class="td-label">AdUnit</td>
                <td class="td-panel">
                  <mu-select-field :maxHeight="maxHeight" @change="onUnitSelect" :errorText="formItemsCheck.adunit" :disabled="isModify" v-model="formItems.adunit">
                    <mu-menu-item v-for="item in adunit.data" :key="item.id" :title="item.name" :value="item.id" />
                  </mu-select-field>
                </td>
              </tr>
              <tr>
                <td class="td-label">Advertiser</td>
                <td class="td-panel">
                  <mu-select-field :maxHeight="maxHeight" :disabled="isModify" v-model="formItems.publisher" :errorText="formItemsCheck.publisher">
                    <mu-menu-item v-for="item in publisher.data" :key="item.id" :title="item.name" :value="item.id" />
                  </mu-select-field>
                  <mu-float-button icon="add" mini style="ba
										ckground-color:#7e57c2;" @click="open" />
                </td>
              </tr>
              <tr>
                <td class="td-label">AdType</td>
                <td class="td-panel" id="adtype_m">
                  <mu-select-field ref="adtype" @change="onAdtypeSelect" :maxHeight="maxHeight" :disabled="isModify" v-model="formItems.adtype" :errorText="formItemsCheck.adtype">
                    <mu-menu-item v-for="item in adtype.data" :key="item.id" :title="item.type" :value="item.id" />
                  </mu-select-field>
                </td>
              </tr>
            </table>
          </div>
          <div class="panel">
            <table class="panel-form">
              <tr>
                <td class="td-label">Name</td>
                <td class="td-panel">
                  <mu-text-field :disabled="isModify" :errorText="formItemsCheck.name" v-model="formItems['name']" />
                </td>
              </tr>
              <tr>
                <td class="td-label">Start Time</td>
                <td class="td-panel">
                  <div class="time-picker">
                    <mu-date-picker autoOk hintText="date" :shouldDisableDate="disableDateStart" :errorText="formItemsCheck.start_time" :disabled="isModify" change="dateChangeStart" v-model="formItems['start_time']" />
                  </div>
                  <div class="time-picker">
                    <mu-time-picker hintText="time" :disabled="isModify" v-model="formItems['start_time_picker']" format="24hr" />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="td-label">End Time</td>
                <td class="td-panel">
                  <div class="time-picker">
                    <mu-date-picker autoOk hintText="date" :disabled="isModify" :shouldDisableDate="disableDateEnd" :errorText="formItemsCheck.end_time" v-model="formItems['end_time']" />
                  </div>
                  <div class="time-picker">
                    <mu-time-picker hintText="time" :disabled="isModify" v-model="formItems['end_time_picker']" format="24hr" />
                  </div>
                </td>
              </tr>
              <tbody v-show="!isModify">
                <tr v-show="formItems.adunit!='1'">
                  <td class="td-label">Title</td>
                  <td class="td-panel">
                    <mu-text-field :errorText="formItemsCheck.title" v-model="formItems['title']" />
                  </td>
                </tr>
                <tr v-show="formItems.adunit!='1'">
                  <td class="td-label">Description</td>
                  <td class="td-panel">
                    <mu-text-field :errorText="formItemsCheck.description" v-model="formItems['description']" />
                  </td>
                </tr>
                <tr v-show="formItems.adunit!='1'">
                  <td class="td-label">CallToAction</td>
                  <td class="td-panel">
                    <mu-text-field :errorText="formItemsCheck.cta_text" v-model="formItems['cta_text']" />
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Cap Type</td>
                  <td class="td-panel">
                    <mu-radio label="none_cap" name="group" nativeValue="none_cap" v-model="formItems['cap_type']" class="demo-radio" />
                    <mu-radio label="impression_cap" name="group" nativeValue="impression_cap" v-model="formItems['cap_type']" class="demo-radio" />
                    <mu-radio label="click_cap" name="group" nativeValue="click_cap" v-model="formItems['cap_type']" class="demo-radio" />
                  </td>
                </tr>
                <tr>
                  <td class="td-label">IsCPD</td>
                  <td class="td-panel">
                    <mu-radio label="yes" name="cpd" nativeValue="true" v-model="formItems['cpd']" class="demo-radio" />
                    <mu-radio label="no" name="cpd" nativeValue="false" v-model="formItems['cpd']" class="demo-radio" />
                  </td>
                </tr>
                <tr v-show="formItems['cap_type'] == 'impression_cap'">
                  <td class="td-label">Impression Cap</td>
                  <td class="td-panel">
                    <mu-text-field type="number" :errorText="formItemsCheck.impression_cap" v-model="formItems['impression_cap']" />
                  </td>
                </tr>
                <tr v-show="formItems['cap_type'] == 'click_cap'">
                  <td class="td-label">Click Cap</td>
                  <td class="td-panel">
                    <mu-text-field type="number" :errorText="formItemsCheck.click_cap" v-model="formItems['click_cap']" />
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Cpm</td>
                  <td class="td-panel">
                    <mu-text-field v-model="formItems['cpm']" />
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Ses Filter</td>
                  <td class="td-panel">
                    <mu-checkbox name="form_ses_filter" nativeValue="1" v-model="formItems['ses_filter']" label="A" class="demo-checkbox" />
                    <mu-checkbox name="form_ses_filter" nativeValue="2" v-model="formItems['ses_filter']" label="B" class="demo-checkbox" />
                    <mu-checkbox name="form_ses_filter" nativeValue="3" v-model="formItems['ses_filter']" label="C" class="demo-checkbox" />
                    <mu-checkbox name="form_ses_filter" nativeValue="4" v-model="formItems['ses_filter']" label="D" class="demo-checkbox" />
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Age Filter</td>
                  <td class="td-panel">
                    <mu-checkbox name="form_age_filter" nativeValue="1" v-model="formItems['age_filter']" label="0-25" class="demo-checkbox" />
                    <mu-checkbox name="form_age_filter" nativeValue="2" v-model="formItems['age_filter']" label="25-35" class="demo-checkbox" />
                    <mu-checkbox name="form_age_filter" nativeValue="3" v-model="formItems['age_filter']" label="35-50" class="demo-checkbox" />
                    <mu-checkbox name="form_age_filter" nativeValue="4" v-model="formItems['age_filter']" label="50+" class="demo-checkbox" />
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Gender Filter</td>
                  <td class="td-panel">
                    <mu-checkbox name="form_gender_filter" nativeValue="1" v-model="formItems['gender_filter']" label="Male" class="demo-checkbox" />
                    <mu-checkbox name="form_gender_filter" nativeValue="2" v-model="formItems['gender_filter']" label="FeMale" class="demo-checkbox" />
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Location Filter</td>
                  <td class="td-panel" style="position:relative;">
                    <mu-raised-button :label="check_city_1_values.length+'('+formItems.city_filter.length+')'" ref="address_button" @click="address_open=true" />
                    <mu-popover :trigger="address_trigger" :open="address_open" @close="address_open=false">
                      <div class="my-custom-address clearfix">
                        <div class="left-province">
                          <div>
                            <div class="clearfix check-item" @click="(e) => city_1_item_click(e ,idx)" v-for="(item,idx) in locationData">
                              <mu-checkbox @change="(v) => city_1_item_change(v,item.id ,idx)" name="group" :nativeValue="item.id+''" v-model="check_city_1_values" class="custom-check" />
                              <span class="custom-text">{{item.name}}</span>
                            </div>
                          </div>
                        </div>
                        <div class="right-city">
                          <div>
                            <div class="clearfix check-item" v-for="(item,idx) in address_level2_data">
                              <mu-checkbox name="group" :nativeValue="item.id+''" v-model="formItems.city_filter" :label="item.name" class="custom-check" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </mu-popover>
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Brand Filter</td>
                  <td class="td-panel" style="position:relative;">
                    <mu-raised-button ref="provider_button" @click="provider_open=true" :label="this.formItems.device_brand_filter.length+''" />
                    <mu-popover :trigger="provider_trigger" :open="provider_open" @close="provider_open=false">
                      <div class="my-custom-address clearfix">
                        <div class="clearfix check-item" v-for="(item,idx) in options">
                          <mu-checkbox name="form_provider_filter" :nativeValue="item.name" v-model="formItems['device_brand_filter']" :label="item.name" class="custom-check" />
                        </div>
                      </div>
                    </mu-popover>
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Provider Filter</td>
                  <td class="td-panel" style="position:relative;">
                    <mu-raised-button ref="code_button" @click="code_open=true" :label="this.formItems.mcc_mnc_filter.length+''" />
                    <mu-popover :trigger="code_trigger" :open="code_open" @close="code_open=false" class="code_width">
                      <div class="my-custom-address clearfix">
                        <div class="clearfix check-item" v-for="(item,idx) in options_str">
                          <mu-checkbox name="form_code_filter" :nativeValue="item.code+''" v-model="formItems['mcc_mnc_filter']" :label="item.value" class="custoformItemsm-check" />
                        </div>
                      </div>
                    </mu-popover>
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Package Id</td>
                  <td class="td-panel" style="position:relative;">
                    <mu-raised-button ref="package_button" @click="package_open=true" :label="this.formItems.package_id.length+''" />
                    <mu-popover :trigger="package_trigger" :open="package_open" @close="package_open=false">
                      <div class="my-custom-address clearfix">
                        <div class="clearfix check-item">
                          <mu-checkbox name="form_package_id" nativeValue="com.jakarta.baca" v-model="formItems['package_id']" label="com.jakarta.baca" class="custom-check" />
                        </div>
                        <div class="clearfix check-item">
                          <mu-checkbox name="form_package_id" nativeValue="com.jakarta.baca.lite" v-model="formItems['package_id']" label="com.jakarta.baca.lite" class="custom-check" />
                        </div>
                      </div>
                    </mu-popover>
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Must Installed</td>
                  <mu-text-field v-model="formItems['must_installed']" />
                </tr>
                <tr>
                  <td class="td-label">Must Not Installed</td>
                  <mu-text-field v-model="formItems['must_not_installed']" />
                </tr>
                <tr>
                  <td class="td-label">Target Url</td>
                  <td class="td-panel">
                    <mu-text-field :errorText="formItemsCheck.target_url" v-model="formItems['target_url']" />
                    <mu-flat-button label="test" @click="testUrl('target_url')" mini class="demo-flat-button" />
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Click Callback Url</td>
                  <td class="td-panel">
                    <mu-text-field :errorText="formItemsCheck.click_callback_url" v-model="formItems['click_callback_url']" />
                    <mu-flat-button label="test" @click="testUrl('click_callback_url')" mini class="demo-flat-button" />
                  </td>
                </tr>
                <tr>
                  <td class="td-label">Impression Callback Url</td>
                  <td class="td-panel">
                    <mu-text-field :errorText="formItemsCheck.impression_callback_url" v-model="formItems['impression_callback_url']" />
                    <mu-flat-button label="test" @click="testUrl('impression_callback_url')" mini class="demo-flat-button" />
                  </td>
                </tr>
              </tbody>
              <tr>
                <td class="td-label" id="youtobe">Creative</td>
                <td class="td-panel" v-if="formItems.static_creative_url">
                  <mu-text-field v-model="formItems['static_creative_url']" />
                </td>
                <td class="td-panel td-panel-file" v-if="!formItems.static_creative_url">
                  <mu-text-field style="min-height: 32px;" v-model="formItems['creative_url']">
                    <input type="file" onchange="return window.offer.onFileFinish()" id="create_url_file" class="file-button" multiple="multiple">
                  </mu-text-field>
                  <span style="position: relative; top: 18px;left: 24px;">
                    <mu-icon style="color:#00cc66;" v-if="adunit.limitTrue == true" value="check_circle" />
                    <mu-icon style="color:#ff3300;" v-if="!adunit.limitTrue" value="highlight_off" />
                  </span>
                  <div style="font-size:10px;">
                    <span>{{formItemsCheck.creative_url}}</span><br />
                    <span>width/height = {{adunit.ratio}}；file size <= {{adunit.limit/1024}} kb</span> </div> </td> </tr> <tr>
                <td class="td-label"></td>
                <td class="td-panel">
                  <mu-raised-button v-show="!isModify" class="demo-raised-button" @click="saveForm" label="Submit" icon="save" backgroundColor="#00cc66" primary />
                  <mu-raised-button v-show="isModify" class="demo-raised-button" @click="saveForm" label="Update" icon="save" backgroundColor="#00cc66" primary />
                  <mu-raised-button class="demo-raised-button" @click="reSetForm" label="Reset" icon="cached" />
                </td>
              </tr>
            </table>
            <div v-if="formStatus == 2" class="mask-loading">
              <mu-circular-progress :size="60" :strokeWidth="5" />
            </div>
            <mu-snackbar v-if="formStatus == 3" message="Save success！" />
            <mu-snackbar v-if="formStatus == 4" message="Save failed！" />
            <mu-snackbar v-if="formStatus == -9" message="Incorrect picture" />
          </div>
          <mu-dialog :open="dialog" title="Add Publisher" dialogClass="dialogClass">
            <div v-if="publisher.btnStatus == 2" class="mask-loading">
              <mu-circular-progress :size="40" />
            </div>
            <mu-popup position="top" popupClass="demo-popup-top" :open="publisher.btnStatus == 3">Save success</mu-popup>
            <mu-text-field label="publisher name" v-model="publisher.formName" :errorText="publisher.checkTitle" />
            <mu-flat-button label="Cancel" slot="actions" primary @click="close" />
            <mu-flat-button label="Save" slot="actions" primary @click="savePublisher" color="#00cc66" />
          </mu-dialog>
        </div>
      </mu-flexbox-item>
    </mu-flexbox>
  </div>
</template>
<script>
import API from '../util/api';
import Util from '../util/util';
import Store from '../util/store';
import City from '../util/city';
import moment from 'moment';

window.moment = moment;
export default {
  data() {
    return {
      checkbox: {
        value1: [],
        value2: false,
        value3: false
      },

      options_str: [],
      options: [],
      value5: [],
      value11: [],
      dialog: false,
      loading: true,
      maxHeight: 300,

      address_open: false,
      provider_open: false,
      code_open: false,
      package_open: false,

      address_trigger: null,
      code_trigger: null,
      provider_trigger: null,
      package_trigger: null,

      address_level2_data: [],
      check_city_1_values: [],
      locationData: City.getData(),

      adunit: {
        data: [],
        ratio: '',
        limit: '',
        limitTrue: false,
      },

      publisher: {
        data: [],
        formName: '',
        checkTitle: '',
        btnStatus: 1, // 1:edit ,2:saving ,3:success ,4:failed
      },
      adtype: {
        data: [],
      },
      // 表单
      formItems: {
        adunit: -1,
        publisher: -1,
        adtype: -1,
        cpd: 'false',
        cap_type: 'none_cap',
        start_time: '',
        end_time: '',
        start_time_picker: '00:00',
        end_time_picker: '00:00',
        cpm: '',
        ses_filter: [],
        age_filter: [],
        gender_filter: [],
        city_filter: [],
        mcc_mnc_filter: [],
        device_brand_filter: [],
        package_id: ['com.jakarta.baca', 'com.jakarta.baca.lite'],
        must_installed: [],
        must_not_installed: [],

        name: '',
        title: '',
        width: '',
        height: '',
        cta_text: '',
        impression_cap: '',
        click_cap: '',
        target_url: '',
        click_callback_url: '',
        impression_callback_url: '',
        creative_url: '',
        youtube_url: '',
        description: '',
        static_creative_url: '',
      },

      isModify: false,
      modifyId: 0,
      formStatus: 1, // 1:edit ,2:saving ,3:success ,4:failed
      formItemsCheck: {
        adunit: '',
        publisher: '',
        adtype: '',
        start_time: '',
        end_time: '',
        name: '',
        title: '',
        width: '',
        height: '',
        cta_text: '',
        impression_cap: '',
        click_cap: '',
        target_url: '',
        click_callback_url: '',
        impression_callback_url: '',
        creative_url: '',
        description: '',
      },

      tbGrid: {
        open: false,
        data: [],
        selectRow: {},
        current: 1,
        showNoRow: false,
      },
      queryRole: '',
      provider_list: [],
      code_list: [],

    }
  },
  methods: {
    city_1_item_click(e, i) {
      const current = this.locationData[i];
      if (current && current.children) {
        this.address_level2_data = current.children;
      }
    },

    city_1_item_change(v, id, idx) {
      let is_checked = false;
      for (let i = 0, len = v.length; i < len; i++) {
        if (v[i] == id) {
          is_checked = true;
          break;
        }
      }
      const current = this.locationData[idx];
      const old_data = this.formItems.city_filter;
      if (current && current.children) {
        if (is_checked) {
          current.children.map((k) => old_data.push(k.id));
          this.formItems.city_filter = old_data;
        } else {
          const obj_id = {};
          current.children.map((k) => obj_id[k.id] = true);
          const new_obj = [];
          old_data.map((k) => {
            if (!obj_id[k]) new_obj.push(k);
          });
          this.formItems.city_filter = new_obj;
        }
      }
    },
    toggleList() {
      this.tbGrid.open = !this.tbGrid.open;
    },
    testUrl(type) {
      if (!this.formItems[type]) {
        this.formItemsCheck[type] = 'required!';
        return;
      }
      this.formItemsCheck[type] = '';
      let href = this.formItems[type];
      window.open(href);
    },

    disableDateStart(date) {
      const max = this.formItems.end_time;
      if (max) {
        return date.getTime() >= new Date(max).getTime();
      }
    },
    disableDateEnd(date) {
      const start_time = this.formItems.start_time;
      if (start_time) {
        if (date.getTime() <= (new Date(start_time).getTime() - 60 * 60 * 24 * 1000)) return true;
        return false;
      }
      return false;
    },
    check() {
      const param = this.formItems;
      if (!param.adunit) { this.formItemsCheck.adunit = 'required！'; return; } else { this.formItemsCheck.adunit = ''; }
      if (!param.publisher) { this.formItemsCheck.publisher = 'required！'; return; } else { this.formItemsCheck.publisher = ''; }

      if (typeof param.adtype == 'undefined') {
        this.formItemsCheck.adtype = 'required！';
        return;
      } else {
        this.formItemsCheck.adtype = '';
      }
      if (!param.start_time) { this.formItemsCheck.start_time = 'required！'; return; } else { this.formItemsCheck.start_time = ''; }
      if (!param.end_time) { this.formItemsCheck.end_time = 'required！'; return; } else { this.formItemsCheck.end_time = ''; }
      if (!param.name) { this.formItemsCheck.name = 'required！'; return; } else { this.formItemsCheck.name = ''; }
      if (param.adunit != '1') {
        if (!param.title) { this.formItemsCheck.title = 'required！'; return; } else { this.formItemsCheck.title = ''; }
        if (!param.cta_text) { this.formItemsCheck.cta_text = 'required！'; return; } else { this.formItemsCheck.cta_text = ''; }
        if (!param.description) { this.formItemsCheck.description = 'required！'; return; } else { this.formItemsCheck.description = ''; }
      }
      if (!param.target_url) { this.formItemsCheck.target_url = 'required！'; return; } else { this.formItemsCheck.target_url = ''; }
      return true;
    },

    updRow(id) {
      this.cloneRow(id);
      this.isModify = true;
      this.modifyId = id;
    },

    deleteRow(idx, id) {
      if (confirm('确认要删除吗？')) {
        API.offer.deleteRow(id).then((e) => {
          this.tbGrid.data.splice(idx, 1);
        }, (e) => {

        });
      }
    },

    cloneRow(id) {
      this.isModify = false;
      const dataAll = this.tbGrid.data;
      const adunitData = this.adunit.data;
      let row;
      for (let i = 0, len = dataAll.length; i < len; i++) {
        if (dataAll[i]['offer_id'] == id) {
          row = dataAll[i];
          break;
        }
      }
      let adcurrentData = null;
      const adunit_id = row.adunit_id;
      for (let i = 0, len = adunitData.length; i < len; i++) {
        if (adunitData[i].id == adunit_id) {
          adcurrentData = adunitData[i];
          break;
        }
      }
      const adtype_id = row.adtype_id;
      this.formItems.adunit = adunit_id;
      this.formItems.publisher = row.publisher_id;
      this.formItems.adtype = adtype_id;

      this.formItems.start_time = row.start_time;
      this.formItems.end_time = row.end_time;

      this.formItems.start_time_picker = row.start_time_str.substring(11, 16);
      this.formItems.end_time_picker = row.end_time_str.substring(11, 16);

      this.formItems.name = row.name;
      this.formItems.title = row.title;
      this.formItems.width = row.width;

      this.formItems.cpm = row.cpm;
      this.formItems.cpd = row.cpd;
      const ses_filter = row.ses_filter;
      this.formItems.ses_filter = ses_filter ? (ses_filter.indexOf(',') > 0 ? ses_filter.split(',') : new Array(ses_filter)) : [];

      const age_filter = row.age_filter;
      this.formItems.age_filter = age_filter ? (age_filter.indexOf(',') > 0 ? age_filter.split(',') : new Array(age_filter)) : [];

      const gender_filter = row.gender_filter;
      this.formItems.gender_filter = gender_filter ? (gender_filter.indexOf(',') > 0 ? gender_filter.split(',') : new Array(gender_filter)) : [];

      const city_filter = row.city_filter;
      this.formItems.city_filter = city_filter ? (city_filter.indexOf(',') > 0 ? city_filter.split(',') : new Array(city_filter)) : [];

      const device_brand_filter = row.device_brand_filter;
      this.formItems.device_brand_filter = device_brand_filter ? (device_brand_filter.indexOf(',') > 0 ? device_brand_filter.split(',') : new Array(device_brand_filter)) : [];

      const mcc_mnc_filter = row.mcc_mnc_filter;
      this.formItems.mcc_mnc_filter = mcc_mnc_filter ? (mcc_mnc_filter.indexOf(',') > 0 ? mcc_mnc_filter.split(',') : new Array(mcc_mnc_filter)) : [];

      const package_id = row.package_id + '';
      this.formItems.package_id = package_id ? (package_id.indexOf(',') > 0 ? package_id.split(',') : new Array(package_id)) : [];
      const must_installed = row.must_installed + '';
      this.formItems.must_installed = must_installed;

      const must_not_installed = row.must_not_installed + '';
      this.formItems.must_not_installed = must_not_installed;

      this.formItems.height = row.height;
      this.formItems.cta_text = row.cta;

      const impression_cap = row.impression_cap;
      const click_cap = row.click_cap;

      // none_cap impression_cap click_cap 
      if (impression_cap && impression_cap != '-1') {
        this.formItems.impression_cap = impression_cap;
        this.formItems.click_cap = '';
        this.formItems.cap_type = 'impression_cap';
      } else if (click_cap && click_cap != '-1') {
        this.formItems.click_cap = click_cap;
        this.formItems.impression_cap = '';
        this.formItems.cap_type = 'click_cap';
      } else {
        this.formItems.click_cap = '';
        this.formItems.impression_cap = '';
        this.formItems.cap_type = 'none_cap';
      }

      this.formItems.target_url = row.target_url;
      this.formItems.click_callback_url = row.click_callback_url;
      this.formItems.impression_callback_url = row.impression_callback_url;
      this.formItems.static_creative_url = row.creative_url;
      this.adunit.limitTrue = true;
      this.adunit.ratio = adcurrentData.creative_ratio;
      this.adunit.limit = adcurrentData.creative_size_limitation;
      this.formItems.description = row.description;
    },
    saveForm() {
      let self = this;
      const param = JSON.parse(JSON.stringify(self.formItems));
      // debugger
      const isStaticPic = this.formItems.static_creative_url;
      if(!this.check()){
		return;
	  }
      param.cpd = JSON.parse(param.cpd)
      param.ses_filter = param.ses_filter.join(',');
      param.age_filter = param.age_filter.join(',');
      param.gender_filter = param.gender_filter.join(',');
      param.city_filter = param.city_filter.join(',');
      param.package_id = param.package_id.join(',');
      param.must_installed = param.must_installed;
      param.must_not_installed = param.must_not_installed;
      param.mcc_mnc_filter = param.mcc_mnc_filter.join(',');
      param.device_brand_filter = param.device_brand_filter.join(',');
      if ((!isStaticPic && !window.offer.isCurrent)) {
        this.formStatus = -9;
        setTimeout(() => self.formStatus = 1, 2000);
        return;
      }

      var selectedAdType = this.formItems.adtype;
      this.formStatus = 2;

      const uploadImage = async function() {
          const files = document.getElementById('create_url_file').files;
          var formData = new FormData();

          for (var keyName in files) {
            if (files.hasOwnProperty(keyName) && files[keyName] instanceof File) {
              formData.append(keyName, files[keyName], files[keyName].name);
            }
          }
          const start = moment(param.start_time).format('YYYYMMDD');
          const end = moment(param.end_time).format('YYYYMMDD');
          var nameTitle = param.title || param.name;
          if (self.isModify) {
            nameTitle += '_' + (new Date().getTime());
          }
          formData.append('title', nameTitle);
          formData.append('start', start);
          formData.append('end', end);
          //处理上传图片 
          var imgResult, resUrl = '';
          try {

            imgResult = await API.offer.upload(formData);

          } catch (ex) {
            self.formStatus = 4;
            setTimeout(() => self.formStatus = 1, 2000);
          }

          //判断是sinagleimage类型 且返回图片有且只有一张
          if (selectedAdType == 0 && typeof(imgResult) == 'object' && imgResult.length == 1) {
            resUrl = imgResult[0];
          } else if (selectedAdType > 0 &&
            typeof(imgResult) == 'object' && imgResult.length > 1) {
            var _pageData = {};
            _pageData.title = nameTitle;
            _pageData.adtype = selectedAdType;
            _pageData.image_url_list = imgResult;
            _pageData.target_url = self.formItems.target_url;
            try {
              let _result = await API.offer.uploadpage(JSON.stringify(_pageData));
              if (_result && typeof(_result) == 'string') {
                resUrl = _result;
              }
            } catch (ex) {
              console.log(`处理上传图片异常=>{ex}`);
              self.formStatus = 4;
              setTimeout(() => self.formStatus = 1, 2000);
            }
          }

          if (resUrl != '') {
            self.isModify ? updForm(resUrl) : uploadForm(resUrl);
          }
        },

        uploadForm = function(imgurl) {
          let startTime = param.start_time;
          let endTime = param.end_time;
          param.start_time = moment(startTime + ' ' + (param.start_time_picker || '00:00') + ':00' + window.countryTime).utc().format('YYYY-MM-DD HH:mm:ss');
          param.end_time = moment(endTime + ' ' + (param.end_time_picker || '00:00') + ':00' + window.countryTime).utc().format('YYYY-MM-DD HH:mm:ss');
          param.creative_url = imgurl;

          if (param['cap_type'] == 'none_cap') {
            param['impression_cap'] = '';
            param['click_cap'] = '';
          } else if (param['cap_type'] == 'impression_cap') {
            param['click_cap'] = '';
          } else if (param['cap_type'] == 'click_cap') {
            param['impression_cap'] = '';
          }
          API.offer.saveoffer(param).then((k) => {
            const tbgrid = self.tbGrid.data;
            param.offer_id = k.offer_id;
            param.width = self.formItems.width;
            param.height = self.formItems.height;
            param.adunit_id = param.adunit;
            param.publisher_id = param.publisher;
            param.adtype_id = param.adtype;
            param.cta = param.cta_text;
            param.static_creative_url = imgurl;
            param.start_time = startTime;
            param.start_time_str = startTime + ' ' + param.start_time_picker + ':00';
            param.end_time = endTime;
            param.end_time_str = endTime + ' ' + param.end_time_picker + ':00';
            tbgrid.splice(0, 0, param);
            self.tbGrid.data = tbgrid;
            setTimeout(() => { self.formStatus = 3; }, 1000);
            setTimeout(() => self.formStatus = 1, 10000);
          }, (e) => {
            setTimeout(() => { self.formStatus = 4; }, 1000);
            setTimeout(() => self.formStatus = 1, 2000);
          })
        },

        updForm = function(imgurl) {
          API.offer.updOffer({
            offer_id: self.modifyId,
            width: param.width,
            height: param.height,
            creative_url: imgurl
          }).then((k) => {
            setTimeout(() => { self.formStatus = 3; }, 1000);
            setTimeout(() => {
              self.formStatus = 1;
              self.reSetForm();
            }, 3000);
          }, (e) => {
            setTimeout(() => { self.formStatus = 4; }, 1000);
            setTimeout(() => self.formStatus = 1, 2000);
          })
        }
      if (isStaticPic) {
        uploadForm(isStaticPic);
      } else {
        uploadImage();
      }
    },
    // 保存publisher
    savePublisher() {
      const name = this.publisher.formName;
      if (!name) {
        this.publisher.checkTitle = 'required！';
        return;
      } else {
        this.publisher.checkTitle = '';
      }
      this.publisher.btnStatus = 2;
      API.offer.savepublisher({ name }).then((k) => {
        const res = { id: k, name: name };
        this.publisher.data.push(res);
        this.publisher.btnStatus = 3;
        Store.set('publisher', this.publisher.data, 5 * 60);
        this.dialog = false;
        this.formItems.publisher = k;
        setTimeout(() => {
          this.publisher.btnStatus = 1;
        }, 1000);
      });
    },

    reSetForm() {
      this.formItems.start_time = '';
      this.formItems.start_time_picker = '00:00';
      this.formItems.end_time = '';
      this.formItems.end_time_picker = '00:00';
      this.formItems.name = '';
      this.formItems.title = '';
      this.formItems.width = '';

      this.formItems.cpm = '';
      this.formItems.ses_filter = [];
      this.formItems.age_filter = [];
      this.formItems.gender_filter = [];
      this.formItems.city_filter = [];
      this.formItems.device_brand_filter = [];
      this.formItems.mcc_mnc_filter = [];
      this.formItems.package_id = [];
      this.formItems.must_installed = [];
      this.formItems.must_not_installed = [];

      this.formItems.height = '';
      this.formItems.cta_text = '';
      this.formItems.cap_type = 'none_cap';
      this.formItems.impression_cap = '';
      this.formItems.click_cap = '';
      this.formItems.target_url = '';
      this.formItems.click_callback_url = '';
      this.formItems.impression_callback_url = '';

      this.formItems.static_creative_url = '';
      this.adunit.limitTrue = false;
      this.formItems.description = '';
      this.address_level2_data = [];
      this.check_city_1_values = [];
    },
    open() {
      this.dialog = true
    },
    onUnitSelect(v) {
      const dataAll = this.adunit.data;
      let data = null;
      dataAll.map((k) => { if (k.id == v) { data = k; } })
      this.adunit.ratio = data.creative_ratio;
      this.adunit.limit = data.creative_size_limitation;
      this.checkImage();
    },
    onAdtypeSelect(v) {
      var dataAll = this.adtype.data;
      let data = null;
      dataAll.map((k) => { if (k.id == v) { data = k; } })
      var num = data.id;
      var str = data.type;
      window.num = num;
      window.str = str;
    },
    onProviderSelect(v) {
      console.log(v)
    },
    checkImage() {
      const self = this;
      let file = document.getElementById("create_url_file").files;
      if (file.length <= 0) {
        return;
      }
      for (var i = 0; i < file.length; i++) {
        var fs = file[i]
        let reader = new FileReader();
        reader.onload = function(e) {
          let data = e.target.result;

          let image = new Image();
          image.onload = function() {
            let width = image.width;
            let height = image.height;
            const currentSize = (parseFloat(fs.size / 1024)).toFixed(2);
            const maxSize = (parseFloat(self.adunit.limit / 1024)).toFixed(2);

            let ratio = (parseFloat(width / height)).toFixed(2);
            const trueRatio = self.adunit.ratio;
            const cz = (ratio - parseFloat(trueRatio));
            let str = `当前：宽=${width},高=${height},ratio=${ratio},大小=${currentSize}kb`;
            if (((cz >= 0 && cz <= 0.2) || (cz >= -0.2 && cz <= 0)) && parseFloat(currentSize) <= parseFloat(maxSize)) {
              self.adunit.limitTrue = true;
              self.formItems.width = width;
              self.formItems.height = height;
            } else {
              self.formItems.width = width;
              self.formItems.height = height;
              self.adunit.limitTrue = false;
            }
            self.formItemsCheck.creative_url = str;
          };
          image.src = data;
        };
        reader.readAsDataURL(fs);
      }
    },
    async nextGridPage() {
      const current = this.tbGrid.current;
      const newData = await API.offer.getofferlist(current + 1, this.queryRole);

      if (newData.length <= 0) this.tbGrid.showNoRow = true;
      else {
        const oldData = this.tbGrid.data;
        this.tbGrid.data = oldData.concat(newData);
        this.tbGrid.current = current + 1;
      }

    },
    close() {
      this.dialog = false
    },
  },
  async mounted() {
    this.address_trigger = this.$refs.address_button.$el;
    this.provider_trigger = this.$refs.provider_button.$el;
    this.code_trigger = this.$refs.code_button.$el;
    this.package_trigger = this.$refs.package_button.$el;
    const u_from = Util.getQuery('u');
    let adunitData = null;
    this.queryRole = u_from;
    if (u_from == 'admin') {
      adunitData = await API.offer.getadunits();
    } else {
      adunitData = await API.offer.getadunit();
    }
    this.adunit.data = adunitData || [];
    const publisherData = await API.offer.getpublisher();
    this.publisher.data = publisherData || [];
    const offerList = await API.offer.getofferlist(1, u_from);
    this.tbGrid.data = offerList;
    const adtypeData = await API.offer.getadtype();
    this.options_str = await API.offer.getmcc();
    this.options = await API.offer.getbrand();

    this.adtype.data = adtypeData || [];
    setTimeout(() => {
      const _ad = adunitData[0];
      this.formItems.adunit = _ad.id;
      this.adunit.ratio = _ad.creative_ratio;
      this.adunit.limit = _ad.creative_size_limitation;
      this.formItems.publisher = publisherData[0].id;
      this.formItems.adtype = adtypeData[0].id;

      this.loading = false;
    }, 200);

    const self = this;
    window.offer = {
      onFileFinish: function() {
        const files = document.getElementById("create_url_file").files;
        if (((window.str == "Carousel") || (window.str == "3DCube")) && files.length != 4) {
          alert("必须四张图片，请重新选择");
          return;
        }

        if (((window.str == "SingleImage") || (window.str == "SingleVideo")) && files.length != 1) {
          alert("只能上传一个，请重新选择");
          return;
        }

        const file = document.getElementById("create_url_file").files[0];
        if (file.type.indexOf('image') >= 0) {
          this.isCurrent = true;
          self.checkImage();
          return false;
        } else {
          this.isCurrent = false;
          alert("插入文件的格式不正确,请确认它是一张图片");
          return false;
        }
      },
      isCurrent: false, // 是否符合
    }
  }
}

</script>
<style lang="less">
.flexhide {
  flex: 0 !important;
}

.time-picker {
  width: 150px;
  overflow: hidden;
  display: inline-block;
}

.my-custom-address {
  font-size: 13px !important;
  background-color: #fff !important;
  height: 250px;
  z-index: 1000;
  padding: 10px;
  overflow: auto;

  .right-city {
    position: absolute;
    left: 0px;
    width: 180px;
    top: 0px;
    bottom: 0px;
    overflow: auto;
    border-right: 1px solid #e5e5e5;
    background-color: #fff !important;
    margin-right: 25px;

    .custom-check {
      margin-left: 5px;
      margin-top: 6px;
    }

    .check-item {}

    .check-item:hover {
      background: #e4e4e4;
    }

    .custom-text {
      display: inline-block;
      position: relative;
      top: -7px;
      cursor: pointer;
    }
  }

  .left-province {
    position: absolute;
    right: 22px;
    width: 200px;
    top: 0px;
    bottom: 0px;
    overflow: auto;
    background-color: #fff !important;

    .custom-check {
      margin-left: 5px;
      margin-top: 6px;
    }

    .check-item {}

    .check-item:hover {
      background: #e4e4e4;
    }

    .custom-text {
      display: inline-block;
      position: relative;
      top: -7px;
      cursor: pointer;
    }
  }
}

.panel-container {
  position: fixed;
  top: 64px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  overflow: hidden;

  .mt-panel {
    height: 100%;

    .flex-demo {
      height: 100%;
      overflow-y: auto;
    }
  }
}

.demo-popup-top {
  width: 100%;
  opacity: .8;
  height: 48px;
  line-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 375px;
}

.panel-form {
  height: 100px;
  width: 620px;
  ;
  margin: 0px auto;

  .td-panel {
    width: 444px;

    .mu-text-field {
      width: 340px;
    }
  }

  .td-label {
    text-align: right;
    padding-right: 30px;
    width: 170px;
    font-size: 12px;
    color: gray;
  }

  .mu-text-field {
    margin-bottom: 0px;
  }
}

.dialogClass {
  width: 400px;
  position: relative;
}

.mask-loading {
  position: absolute;
  top: 0px;
  bottom: 0px;
  right: 0px;
  left: 0px;
  text-align: center;
  background: rgba(255, 255, 255, 0.61);
  z-index: 9999999999;
  padding-top: 15%;
}

.td-panel-file {
  .mu-text-field-content {
    padding: 0px;
  }
}

.publisher-btn {
  width: 100px;
  text-align: center;
  margin-top: -10px;

  .mu-circle-wrapper {
    display: block;
  }
}

.load-more {
  text-align: center;
  margin-top: 10px;
  padding: 10px;
  cursor: pointer;
  color: #0079f4;
  text-decoration: underline;
}

.mu-day-button-text {
  z-index: 999999;
}

.file-button {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: .75;
  top: 5px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
  border: none;
  background: none;
  border-radius: 0 0 0 0;
  box-shadow: none;
  display: block;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 32px;
  font-style: inherit;
  font-variant: inherit;
  font-weight: inherit;
  font-stretch: inherit;
  color: rgba(0, 0, 0, .87);
  font-family: inherit;
  position: relative;
  font-size: 12px;
}

.table-button {
  min-width: 60px;

  .mu-flat-button-label {
    padding: 0px;
  }
}

.panel {
  padding: 10px;
  background: white;
  box-shadow: 0 2px 3px rgba(0, 0, 0, .05);
  margin-bottom: 20px;

  .mu-checkbox-icon {
    margin-right: 0px;
    margin-left: 10px;
  }
}

</style>
