import React, { Component } from 'react'
import orderModel from '../../model/order.model'
import './index.scss'
import { orderListQuery as OrderFilter } from '../../interface/model/order'
import { logisiticDomain } from '../../config'


import { Table, Spin, Radio, Tabs, Form, Button, Input, message, DatePicker, Pagination, FormInstance, Checkbox, Image, Modal } from 'antd';
import { columns, statusTab, words, processStatus, companyName, logsTabName, logsTab, companyOptionsName  } from './config'
import DetailModal from './dialog/detail'
import CancelOrder from './dialog/cancelOrder'
import BatchPickUp from './dialog/batchPickUp'
import ExpressDetail from './dialog/expressDetail'
import EmptyComponent from '../../components/empty'


import Prompt from '../../assets/img/logo/prompt.png'

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

class orderList extends Component<any, any> {
  constructor (props: any) {
    super(props)
    this.state = this.initialState()
   
  }
  initialState():any {
    return {
      words,
      orderListData: [],
      page: 1,
      size: 10,
      index: '2',
      totalNumber: 0,
      loading: true,
      toastLoading: false,
      currentTab: 2,
      count: 0,
      currentItem: {},
      selectedRowKeys: [],  
      selectedRows: [],
      detailModalShow: false,
      pickUpModalShow:false,
      batchPickUpShow: false,
      cancelOrderShow:false,
      cancelOrderModel: false,
      expressDetailShow: false,
      exportLoading: false,
      checkedAll: false,
      formSearch: [],
      statistics: [],
      formInit: {
        status: 0,
        page_id: 1,
        size: 10,
        product_code: null,
        product_title: '',
        combined_key: null,
        created_time_min: null,
        created_time_max: null,
        process_status: 0,
        express_no: null,
        express_company_id: 0,
        delivery_time_min: null,
        delivery_time_max: null,
        express_label_printed: null,
        sort_direction: null,
        express_picked_up: null
      },
      filter: {
        page_id: 1,
        status: 2
      },
      dates: [],
      errorTip: "",
      isModalVisible: false,
      downloadAllLoading: false,
      downloadSelLoading: false,
      loadingTip: ""
    }
  }

  componentDidMount() {
    this.handleShipmentsDisplayCount()
    this.getDataList(this.state.page)
    const form = [...Array(7)].map(_ => React.createRef<FormInstance>());
    this.setState({ formSearch: form })
  }
  // 搜索表单
  formatFormSearch(id: number) {
    const productId = 
      <Form.Item label={this.state.words.product_id} name="product_code" key={1}>
        <Input onPressEnter={(e:any)=> this.handleSearch(e)} />
      </Form.Item>
    const productTitle = 
      <Form.Item label={this.state.words.product_title} name="product_title" key={2}>
        <Input onPressEnter={(e:any)=> this.handleSearch(e)} />
      </Form.Item>
    const orderNumber = 
      <Form.Item label={this.state.words.order_number} name="combined_key" key={3}>
          <Input onPressEnter={(e:any)=> this.handleSearch(e)} />
        </Form.Item>
    const logisticsNumber =
      <Form.Item label={this.state.words.logistics_number} name="express_no" key={4}>
        <Input onPressEnter={(e:any)=> this.handleSearch(e)} />
      </Form.Item>
    const processStatusForm = 
      <Form.Item label={this.state.words.process_status} name="process_status" key={5}>
        <Radio.Group onChange={(e: any) => this.onChangeStatus(e, 'process_status')} >
          <Radio.Button value={0}>{processStatus[0].name}</Radio.Button>
          <Radio.Button value={1}>{processStatus[1].name}</Radio.Button>
        </Radio.Group>
      </Form.Item>
    const processForm = 
      <Form.Item label={this.state.words.process_status} name="process_status" key={6}>
        <Radio.Group onChange={(e: any) => this.onChangeStatus(e, 'process_status' )}>
          {
            processStatus.map((val: any, id: number) => {
              return (
                <Radio.Button value={val.id} key={id} >{val.name}</Radio.Button>
              )
            })
          }
        </Radio.Group>
      </Form.Item>
    const company = 
      <Form.Item label={this.state.words.logistics_company} name="express_company_id" key={7}>
        <Radio.Group onChange={(e: any) => this.onChangeStatus(e, 'express_company_id')}>
          {
            companyName.map((val: any, id: number) => {
              return (
                <Radio.Button value={val.id} key={id}>{val.name}</Radio.Button>
              )
            })
          }
        </Radio.Group>
      </Form.Item>
    const companyType =
      <Form.Item label={this.state.words.logistics_options_company} name="express_service_type" key={15}>
        <Radio.Group onChange={(e: any) => this.onChangeStatus(e, 'express_service_type')}>
          {
            companyOptionsName.map((val: any, id: number) => {
              return (
                <Radio.Button value={val.id} key={id}>{val.name}</Radio.Button>
              )
            })
          }
        </Radio.Group>
      </Form.Item>
    const orderStatus =
      <Form.Item label={this.state.words.status} name="status" key={8}>
        <Radio.Group onChange={(e: any) => this.onChangeStatus(e, 'status')}>
          {
            statusTab.map((val: any) => {
              return (
                <Radio.Button value={val.id} key={val.id}>{val.name}</Radio.Button>
              )
            })
          }
        </Radio.Group>
      </Form.Item>
    const pickUpTime = 
      <Form.Item label={this.state.words.request_pick_up_time} name="delivery_time_min" key={9}>
        <RangePicker
          dropdownClassName="order_history_datepicker"
          allowEmpty={[true, true]}
          allowClear={true}
          onChange={(dates:any) => {
            let datesCopy = [...dates]
            if (datesCopy.length !== 2) return
            datesCopy[0]?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            datesCopy[1]?.set({ hour: 23, minute: 59, second: 59, millisecond: 59 })
            if (datesCopy[0] && datesCopy[1])  this.handleSearch(dates)

          }}
          value={this.state.words.request_pick_up_time}
        ></RangePicker>
      </Form.Item>
    const createTime = 
      <Form.Item label={this.state.words.created_time} name="created_time_min" key={10}>
        <RangePicker
          dropdownClassName="order_history_datepicker"
          allowEmpty={[true, true]}
          allowClear={true}
          onChange={(dates:any) => {
            let datesCopy = [...dates];
            if (datesCopy.length !== 2) return
            datesCopy[0]?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            datesCopy[1]?.set({ hour: 23, minute: 59, second: 59, millisecond: 59 })
            if (datesCopy[0] && datesCopy[1])  this.handleSearch(dates)
          }}
          value={this.state.words.created_time}
        ></RangePicker>
      </Form.Item>
    const searchButtonForm = 
      <Form.Item label="" key={11}>
        <Button type="primary" onClick={(e: any) => this.handleSearch(e)}> {this.state.words.search}</Button>
      </Form.Item>
    const exportList = 
      <Form.Item label="" key={12}>
        <Button type="primary" loading={this.state.exportLoading} onClick={() => this.handleExportManifest()}>{this.state.words.button_export_manifest_list}</Button>
      </Form.Item>
    const downloadExpressButtonForm =
      <Form.Item label="" key={13}>
        <Button danger onClick={() => this.handlePrintSelect()} loading={this.state.downloadSelLoading} className="down-sel-btn"> {this.state.words.select_express}</Button>
        <Button danger onClick={() => this.handleCheckPrint()} loading={this.state.downloadAllLoading}> {this.state.words.express_down_load}</Button>
      </Form.Item>
    const form = [
      {
        id: 0,
        key: 0,
        item: [productId, productTitle, orderNumber, logisticsNumber, processForm, pickUpTime, orderStatus, company, companyType, createTime, searchButtonForm, exportList,]
      },
      {
        id: 1,
        key: 1,
        item: [productId, productTitle, orderNumber, logisticsNumber, processForm, pickUpTime, orderStatus, company, companyType, createTime, searchButtonForm, exportList, ]
      },
      {
        id: 2,
        key: 2,
        item: [productId, productTitle, orderNumber, createTime, processStatusForm, searchButtonForm, ]
      },{
        id: 3,
        key: 3,
        item: [productId, productTitle, orderNumber, logisticsNumber, processForm, company, companyType, pickUpTime, createTime, searchButtonForm, exportList, downloadExpressButtonForm]
      }, {
        id: 4,
        key: 4,
        item: [productId, productTitle, orderNumber, logisticsNumber,  company, companyType, createTime, searchButtonForm]
      }, {
        id: 5,
        key: 5,
        item: [productId, productTitle, orderNumber, logisticsNumber, company, companyType, createTime, searchButtonForm]
      }, {
        id: 6,
        key: 6,
        item: [productId, productTitle, orderNumber, logisticsNumber, company, companyType, createTime, searchButtonForm]
      }
    ]
    return (
      <div>
        <Form
          layout="inline"
          className="components-table-demo-control-bar"
          style={{ marginBottom: 16 }}
          initialValues={this.state.formInit}
          ref={this.state.formSearch[id]}
          key={id}
          autoComplete="off"
        >
          {
            form[id].item.map((val:any, index: number) => {
              if (id === 1) {
                return ""
              } else {
                return val
              }
            })
          }
        </Form>
      </div>
    )
  }

  refreshTab(e: boolean) {
    this.getDataList(this.state.page)
  }

  // 导出发货清单
  handleExportManifest() {
    let id: Array<string> = []
    this.state.orderListData.forEach((item: any) => {
      id.push(item.combined_key)
    })
    const params = {
      "combined_keys": id
    }
    this.setState({exportLoading: true})
    orderModel.exportExpressList(params).then((res: any) => {
      if (res.data.success) {
        this.handleDownload(res.data.data.file_name)
        window.$logs('export_order_btn', {
          result: 'success',
          page: this.state.currentTab ? 'orders_delivering' : `orders_all`
        })
      } else {
        if (res.data.code === 7000015) {
          this.handleShowToast(this.state.words.export_no_order, 'error')
          window.$logs('export_order_btn', {
            result: 'no_new',
            page: this.state.currentTab ? 'orders_delivering' : `orders_all`
          })
        } else {
          this.handleShowToast(res.data.msg, 'error')
          window.$logs('export_order_btn', {
            result: 'fail',
            page: this.state.currentTab ? 'orders_delivering' : `orders_all`
          })
        }
      }
      this.setState({ exportLoading: false })
    }).catch(() => {
      window.$logs('export_order_btn', {
        result: 'fail',
        page: this.state.currentTab ? 'orders_delivering' : `orders_all`
      })
      this.handleShowToast(this.state.words.export_error, 'error')
      this.setState({ exportLoading: false })
    })
  }
  // 下载发货清单
  handleDownload(fileName: string) {
    this.setState({ exportLoading: true })
    orderModel.getDownloadPdf(fileName).then((res: any) => {
      if (res.data) {
        const link = document.createElement('a')
        const blobData = new Blob([res.data], { type: 'application/pdf' })
        link.href = URL.createObjectURL(blobData)
        link.download = `Mokkaya manifest-${localStorage.getItem('user_name')}-${window.$utils.$time(null, 10)} downloaded.pdf`
        link.style.display = "none"
        link.click()
        this.handleShowToast(this.state.words.export_success, 'success')

      } else {
        this.handleShowToast(this.state.words.export_error, 'error')
      }
    }).then((res: void) => {
      this.setState({ exportLoading: false })
    })
  }

  // toast样式
  handleShowToast(content: string, type: any) {
    this.setState({ toastLoading: true })
    message[type]({
      content: content,
      className: 'custom-class',
      style: {
        marginTop: '35vh',
      },
      duration: 1.5,
    });
    setTimeout(() => {
      this.setState({ toastLoading: false })
    }, 1500);
  }

  // 批量叫快递按钮 
  handleBatchPickUp() {
    if(this.state.selectedRowKeys.length <= 0) {
      this.handleShowToast('Harap pilih pesanan terlebih dahulu', 'error')
    } else {
      this.setState({ batchPickUpShow: true})
    }
  }

  // 列表中的显示
  handlFormatExpandTable(row:any) {
    return (
      <div className="desc-orders">
        <div className="desc-left">
          <div className="item">
            {row.orders.map((val: any, key: number) => {
              return (
                // returnd sku []不展示此sku
                val.order_sku.length === 0 && this.state.currentTab === 5 ? "" :
                <div className="product-info" key={key}>
                  {/* <img className="product-image" src={val.image_url} alt="" /> */}
                  <Image
                    className="product-image"
                    src={val.image_url}
                  />
                  <div className="product-title">
                    <div className="name"> 
                      {val.product_title}
                      <a href={val.product_weblink} target="_blank" rel="noreferrer">{this.state.words.open_link}</a>
                    </div>
                    <div className="split-sku">
                      <div> 
                        {
                          val.order_sku.map((sku_item: any, sku_idx: number) => {
                            return (
                              <div className="sku-price">
                                <div key={sku_idx}>
                                  <span className="product-sku">
                                    {sku_item.sku_properties.toString()}
                                  </span>
                                  {sku_item.sku_properties.length > 0 ? <span className="amount">*</span> : ""}
                                  <span className="amount">{sku_item.amount}</span>
                                  {sku_item.status_description && (row.sub_status === 402 || row.sub_status === 403 || row.sub_status === 404 || row.sub_status === 405)  ? <span className="status_desc">{sku_item.status_description}</span> : ""}
                                </div>
                              </div>
                            )
                          })
                        }
                      </div>
                      {
                        (row.status === 3 || row.status === 4) && !(row.sub_status === 402 || row.sub_status === 403 || row.sub_status === 404 || row.sub_status === 405) ?
                          <span className="amount-price">Rp {window.$utils.$encodeMoney(val.contract_price, true)} * <span className="amount">{this.formatAmount(val)}</span></span>
                          : ""
                      }
                    </div>
                  </div>
                  {row.status === 2 ?
                    <div className="price">
                      <span>{!row.is_combined_order ? this.state.words.total_price : this.state.words.price}</span>
                      <span>Rp {window.$utils.$encodeMoney(val.contract_price, true)} * <span className="amount">{this.formatAmount(val)}</span></span>
                    </div>
                    : "" }
                </div>
              )
            })}
          </div>
        </div>
        {
          row.status === 3 || row.status === 4 || row.sub_status === 601 ?
            <div className="express">
              {row.order_express_info ? <div>{row.order_express_info.express_name} : <span className="express-no" onClick={() => this.handlePrintLable(row)}>{row.order_express_info.express_no}</span></div> : ""}
              <>
                {
                  row.order_express_info && row.order_express_info.records && row.order_express_info.records[0] ?
                  <div className="action express-button" onClick={() => this.handleOpenDialog(row, 'expressDetailShow')}>
                    {this.state.words.button_express_detail}: 
                    <div> {window.$utils.$time(row.order_express_info.records[0].time, 8)}:{row.order_express_info.records[0].description}</div>
                  </div>
                  : ""
                }
                {
                  row.order_express_info && row.order_express_info.created_time ?
                    <div className="time">{this.state.words.request_pick_up_time}: {window.$utils.$time(row.order_express_info.created_time, 8)}</div>
                    : ''
                }
              </>
            </div>
            : ""
        }
        <div className="item-button">
          <button className="action detail-btn" onClick={() => this.handleOpenDialog(row, 'detailModalShow', 'order_detail')}>{this.state.words.action_order_detail}</button>
          {row.status === 2 ? <>
            <button className="action pick-up" onClick={() => this.handleOpenDialog(row, 'pickUpModalShow')}>{this.state.words.action_request_pickup}</button>
            <button className="action cancel-order" onClick={() => this.handleOpenDialog(row, 'cancelOrderShow', 'cancel_order')}>{this.state.words.action_cancel}</button>
          </> : 
            (row.status === 3 && !row.express_label_printed && row.process_status !== "pick up sukses"?
            <button className="action pick-up" onClick={() => this.handlePrintLable(row)}>{this.state.words.button_print_label}</button> : "")
          }
        </div>
      </div>
    )
  }
  // 计算sku数量
  formatAmount(item: any) {
    const arr:Array<number> = []
    item.order_sku.forEach((val: any) => {
      arr.push(val.amount)
    })
    const reducer = (accumulator: any, currentValue: any) => accumulator + currentValue;
    return arr.reduce(reducer)
  }


  // 关闭弹窗
  closeModal(val: any, type: number, refresh: boolean) {
    if (type === 1) {
      this.setState({ detailModalShow: false })
    } else if (type === 3) {
      this.setState({ cancelOrderShow: false })
    } else if (type === 4) {
      this.setState({ batchPickUpShow: false, pickUpModalShow: false, })
    } else if (type === 5) {
      this.setState({ expressDetailShow: false })
    }

    if (refresh) {
      this.handleChangeTab('3')
      this.getDataList(this.state.page)
      this.handleRowSelectChange([], []);
    }
  }
  // 打开弹窗
  handleOpenDialog(val: any, dialog: string, about?: string ) {
    if (about) {
      window.$logs('button_click', {
        type: 'action',
        about,
        page: logsTabName[this.state.currentTab]
      })
    }
    if (dialog === 'expressDetailShow') {
      window.$logs('button_click', {
        type: 'action',
        about: 'logistics',
        page: logsTabName[this.state.currentTab]
      })
    }
    this.setState({ currentItem: JSON.parse(JSON.stringify(val)) }, () => {
      this.setState({ [dialog]: true })
    })
  }
  // 打开快递单链接
  handlePrintLable(val: any) {
    window.$logs('button_click', {
      type: 'action',
      about: 'print_label',
      page: logsTabName[this.state.currentTab]
    })
    window.$logs('button_click', {
      type: 'action',
      about: 'express_number',
      page: logsTabName[this.state.currentTab]
    })
    var encode = encodeURI(val.order_express_info.express_no);
    window.open(logisiticDomain + btoa(encode))
  }
  
  // 切换分页
  handleChangePagination(e: number) {
    this.setState({ page: e , checkedAll: false}, () => {
      this.handleRowSelectChange([], []);
      this.getDataList(e)
    })
  }
  // 全选按钮
  handleBatchSelect(e:any) {
    this.setState({ checkedAll: !this.state.checkedAll})
    const { orderListData, selectedRowKeys } = this.state;
    if (orderListData.length === selectedRowKeys.length) {
      this.handleRowSelectChange([], []);
    } else {
      const index:Array<any>= [];
      orderListData.forEach((item: any) => {
        index.push(item.combined_key)
      });
      this.handleRowSelectChange(index, orderListData)
    }
  }
  handleRowSelectChange = (selectedRowKeys:Array<any>, selectedRows:Array<any>) => {
    this.setState({
      selectedRowKeys: selectedRowKeys,
      checkedAll: true
    }, () => {
      this.setState({ selectedRows: selectedRows})
    })
  }

  onChangeStatus(e: any, name: string) {
    let formData = this.state.formSearch[this.state.currentTab].current.getFieldValue()
    let filter: OrderFilter = {}
    filter.status = formData.status ? formData.status : this.state.currentTab
    if (name === "status") {
      filter.from_search = true
      filter[name] = e.target.value 
    } else if (name === "express_company_id" || name === 'express_service_type') {
       filter[name] = e.target.value || null
    } else if (name === "process_status") {
      filter = this.formatParams(filter, e.target.value)
    } 
    if (formData.process_status) {
      const data = this.formatParams(filter, formData.process_status)
      filter = {...filter, ...data}
    }
    const obj = { ...formData, ...filter }
    this.setState({ filter: obj, page: 1}, () => {
      this.getDataList(1)
    })
    
  }
  formatParams(params:any, status:any) {
    if (status === 1) {
      // 上线时要改为48小时
      params.hours_to_cancel_max = 1
      delete params.express_label_printed
      params.express_picked_up = false
    } else if (status === 2) {
      params.express_label_printed = false
      delete params.hours_to_cancel_max
      params.express_picked_up = false
    } else if (status === 3) {
      params.express_label_printed = true
      delete params.hours_to_cancel_max
      params.express_picked_up = false
    } else if (status === 4) {
      params.express_picked_up = true
      if (!params.status) {
        params.status = 3
        this.changeStatus()
      }
      delete params.hours_to_cancel_max
      delete params.express_label_printed
    } else if (status === 0) {
      delete params.express_picked_up
      delete params.hours_to_cancel_max
      delete params.express_label_printed
    }
    return params
  }
  changeStatus() {
    this.state.formSearch[this.state.currentTab].current.setFieldsValue({ status: 3 })
  }
  handleSearch(e: any) {
    let formData = this.state.formSearch[this.state.currentTab].current.getFieldValue()
    let copyData = JSON.parse(JSON.stringify(formData))
    const filter: OrderFilter = {}
    if (formData.created_time_min && formData.created_time_min.length === 2) {
      const [created_time_min, created_time_max] = formData.created_time_min
      copyData.created_time_min = created_time_min ? Math.ceil(new Date(created_time_min).getTime() /1000): 0
      copyData.created_time_max = created_time_max ? Math.ceil(new Date(created_time_max).getTime() /1000): 0
    }
    if (formData.delivery_time_min && formData.delivery_time_min.length === 2) {
      const [delivery_time_min, delivery_time_max] = formData.delivery_time_min
      copyData.delivery_time_min = delivery_time_min ? Math.ceil(new Date(delivery_time_min).getTime()/1000) : 0
      copyData.delivery_time_max = delivery_time_max ? Math.ceil(new Date(delivery_time_max).getTime()/1000) : 0
    }
    copyData.status = copyData.status || this.state.currentTab
    const data = this.formatParams(copyData, formData.process_status)

    const obj = { ...filter, ...data}

    this.setState({ filter: obj, errorTip: this.state.words.search_error, page: 1 }, () => {
      this.getDataList(1)
    })
  }

  // 切换status tab
  handleChangeTab(e: any) {
    this.setState({ errorTip: this.state.words.empty_words, index: e })
    const filter:OrderFilter = {status: 0}
    filter.status = Number(e)
    this.state.formSearch[this.state.currentTab].current.resetFields()
    this.setState({ currentTab: Number(e), loading: true, filter, page: 1, loadingTip: "" }, () => {
      this.handleRowSelectChange([], []);
      this.getDataList(1, 'tab')
      window.$logs('button_click', {
        about: `${logsTab[this.state.currentTab]}`,
        page: 'order_list'
      })
    })

  }
  // 获取所有数据
  getDataList(pageId: number, from?: string) {
    let params: OrderFilter = this.state.filter
    params.page_id = pageId
    let time = 0
    this.setState({count: new Date().getTime() + this.state.count, loading: true, loadingTip: ""}, ()=> {
      time = this.state.count
    })
    // 统计search
    window.$logs('button_click', {
      type: 'search',
      sub_type: from ? `order status=${logsTabName[this.state.currentTab]}` : `search`,
      content: Object.entries(this.state.filter).map((val: any) => `${val[0]}=${val[1]}`).join(';'),
      page: logsTabName[this.state.currentTab]
    })
    orderModel.getOrderList(params).then((res: any) => {
      if (time === this.state.count) {
        if (res.data.success) {
          const reducer = (accumulator:any, currentValue:any) => accumulator + currentValue;
          const { UnDelivered, Delivering, Received, Refunded, Ineffective } = res.data.data.statistics
          let arr = [Object.values(res.data.data.statistics).reduce(reducer), UnDelivered, Delivering, Received, Refunded, Ineffective]

          this.setState({
            orderListData: res.data.data.items.map((val: any, index: number) => ({ ...val, key: index })),
            loading: false,
            totalNumber: res.data.data.total_page,
            statistics: arr
          })
          const _t = res.data.data.items
          const label_printed = _t.filter((val: any) => val.express_label_printed)
          const label_not_printed = _t.filter((val: any) => !val.express_label_printed)
          const auto_cancel_warning = _t.filter((val: any) => val.process_status === 'hampir batal otomatis')
          const successfully_pick_up = _t.filter((val: any) => val.process_status === 'pick up sukses')
          this.handleLogs(label_printed, 'label_printed')
          this.handleLogs(label_not_printed, 'label_not_printed')
          this.handleLogs(auto_cancel_warning, 'auto_cancel_warning')
          this.handleLogs(successfully_pick_up, 'successfully_pick_up')
        } else {
          this.handleShowToast(this.state.words.failed, 'error')
          this.setState({ loading: false })
        }
      } else {
        return 
      }
    }).catch(() => {
      this.setState({ loading: false })
    })
  }

  // 统计 process_status
  handleLogs(data: any, type: string) {
    if (data.length > 0) {
      window.$logs('show', {
        type: 'process_status',
        process_status: type,
        page: logsTabName[this.state.currentTab],
        combined_key: data.map((val: any) => val.combined_key).join(',')
      })
    }
  }
  

  // 修改排序
  handleTableChange(pa:any, fi: any, sorter:any) {
    const {columnKey, order} = sorter
    const filter: OrderFilter = this.state.filter
    if (columnKey === "create_time") {
      filter.sort_direction = order === 'ascend' ? 'asc' : 'desc'
    }
    this.setState({filter}, () =>{
      this.getDataList(1)
    })
  }
  //发货警示弹框
  handleShipmentsShow() {
    this.setState({ isModalVisible: false })
  }
  //判断警示弹框展示次数
  handleShipmentsDisplayCount() {
    const endTime:number = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1).getTime()
    const timeArr:Array<number> = [endTime]
    if (!localStorage.getItem('endTime')) {
      localStorage.setItem('endTime', JSON.stringify(timeArr))
    } else {
      const shallowArr:Array<number | null> = JSON.parse(localStorage.getItem('endTime') ?? '[]')
      if (!shallowArr.includes(endTime)) {
        shallowArr.push(endTime)
        localStorage.setItem('endTime', JSON.stringify(shallowArr))
        localStorage.removeItem('shipmentsCount')
      }  
    }
    const resultCount:any = localStorage.getItem('shipmentsCount')
    if (resultCount && + resultCount < 2) {
      this.setState({ isModalVisible: true })
      const qs:string = JSON.stringify(parseInt(resultCount) + 1)
      localStorage.setItem('shipmentsCount',qs)
    } else if(resultCount && + resultCount === 2){
      this.setState({ isModalVisible: false })
      // Modal.info(null).destroy()
    } else {
      this.setState({ isModalVisible: true })
      localStorage.setItem('shipmentsCount','1')
    }
  }
  

  handleCheckPrint () {
    window.$logs('button_click', {
      type: 'batch_print_pickup_order',
      about: 'print_pickup_orders_not_print',
      page: 'order_list',
    })
    this.setState({ loading: true, downloadAllLoading: true, loadingTip: this.state.words.loading_tips })
    orderModel.getAllNotPrinted().then((res: any) => {
      this.setState({ loading: false, downloadAllLoading: false, loadingTip: this.state.words.loading_tips })
      if (res.data.success) {
        this.handlePrintAll()
      } else {
        if (res.data.code === 7004001) {
          // 超过50个弹窗展示
          window.$logs('popup_show', { type: 'batch_print_pickup_order', page: 'order_list', about: 'print_pickup_orders_50_popup_show'})
          Modal.confirm({
            width: 580,
            maskClosable: true,
            closable: true,
            content: this.state.words.print_allow_toast,
            okText: this.state.words.print_allow_toast_ok,
            cancelText: this.state.words.print_allow_toast_no,
            onOk: () => {
              this.handlePrintAll()
              // 超过50个点击确认
              window.$logs('button_click', { type: 'batch_print_pickup_order', page: 'order_list', about: 'print_pickup_orders_50_popup_continue'})
            },
            onCancel: () => {
              window.$logs('button_click', { type: 'batch_print_pickup_order', page: 'order_list', about: 'print_pickup_orders_50_popup_cancel' })
            }
          })
        } else {
          this.handleShowToast(this.state.words.failed, 'error')
          window.$logs('button_click', {type: 'check_number', about: 'error'})
        }
      }
    }).catch((err: any) => {
      this.setState({ loading: false, downloadAllLoading: false, loadingTip: this.state.words.loading_tips })
      this.handleShowToast(this.state.words.failed, 'error')
      window.$logs('button_click', { type: 'check_number', about: err })
    })
  }
 
  // 批量打印所有未打印的订单
  async handlePrintAll() {
    const params = { combined_ids: [], all_not_print: true}
    this.setState({ loading: true, downloadAllLoading: true, loadingTip: this.state.words.loading_tips})
    orderModel.getBatchExpress(params).then((result: any) => {
      this.setState({ loading: false, downloadAllLoading: false, loadingTip: this.state.words.loading_tips })
      if (result.data && result.data.success) {
        window.open(result.data.url, '_blank')
      } else {
        Modal.confirm({ maskClosable: false, closable: true, content: result.data.msg || this.state.words.failed, okText: this.state.words.button_sure, })
      }
      window.$logs('print_all', { type: result.data.success, about: result.data })
    }).catch((err: any) => {
      this.setState({ loading: false, downloadAllLoading: false, loadingTip: this.state.words.loading_tips })
      Modal.confirm({ maskClosable: false, closable: true, content: this.state.words.download_error, okText: this.state.words.button_sure })
      window.$logs('print_all', { type: 'error', about: err })
    })
  }

  // 批量打印已选中的
  async handlePrintSelect() {
    let logs = {
      type: 'button_click',
      about: 'print_pickup_orders_selected',
      page: 'order_list',
    }
    if (this.state.selectedRows.length === 1) {
      var encode = encodeURI(this.state.selectedRows[0].order_express_info.express_no)
      window.open(logisiticDomain + btoa(encode))
      window.$logs('button_click', { ...logs, order_id: this.state.selectedRows.map((val: any) => Number(val.combined_key)) })
    } else if (this.state.selectedRows.length > 1) {
      const params = {
        combined_ids: this.state.selectedRows.map((val: any) => Number(val.id)),
        all_not_print: false
      }
      const logObj = { ...logs, order_id: this.state.selectedRows.map((val: any) => Number(val.combined_key))}
      this.setState({ loading: true, downloadSelLoading: true, loadingTip: this.state.words.loading_tips })
      orderModel.getBatchExpress(params).then((result: any) => {
        this.setState({ loading: false, downloadSelLoading: false, loadingTip: this.state.words.loading_tips })
        if (result.data && result.data.success) {
          window.open(result.data.url, '_blank')
          window.$logs('button_click', { ...logObj, result: 'success' })
        } else {
          Modal.confirm({ maskClosable: false, closable: true, content: result.data.msg || this.state.words.failed, okText: this.state.words.button_sure })
          window.$logs('button_click', { ...logObj, result: 'failed'})
        }
      }).catch(() => {
        this.setState({ loading: false, downloadSelLoading: false, loadingTip: this.state.words.loading_tips })
        Modal.confirm({ maskClosable: false, closable: true, content: this.state.words.download_error, okText: this.state.words.button_sure })
        window.$logs('button_click', { ...logObj, result: 'failed' })
      })
    } else {
      this.handleShowToast(this.state.words.no_selected, 'error')
      window.$logs('button_click', { ...logs, order_id: 'no_selected' })
    }
  }

  render ():Object {
    const {
      selectedRowKeys, 
      loading, 
      orderListData, 
      totalNumber, 
      currentItem,
      toastLoading, 
      loadingTip,
    }  = this.state
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.handleRowSelectChange,
    }
    const antIcon = <div />
    return (
      <div className="order-list">
        <Modal
          footer={null}
          title={null}
          visible={this.state.isModalVisible}
          centered={true}
          closable={false}
          className="shipments_modal"
          width={"650px"}
          destroyOnClose={true}
          getContainer={false}
        >
          <div className="shipments_wrapper">
            <img src={Prompt} alt="" />
            <h1>{this.state.words.shipments_title}</h1>
            <h1>{ this.state.words.shipments_primary_title}</h1>
            <div dangerouslySetInnerHTML={{ __html: this.state.words.shipments_content }}></div>
            <button onClick={() => this.handleShipmentsShow()}>Saya mengerti</button>
          </div>
        </Modal>
        <Spin spinning={toastLoading} indicator={antIcon}>
          {<Tabs activeKey={this.state.index} onChange={(e:any) => this.handleChangeTab(e)}>
            {statusTab.map((val: any, idx: number) => {
              return (
                <TabPane tab={val.name + (loading ? "" : val.id === 0 ? "" : ' (' + this.state.statistics[idx] + ')') } key={val.id}>
                  {
                    this.formatFormSearch(val.id)
                  }
                  <Spin spinning={loading} tip={loadingTip}>
                    <Table 
                      scroll={{ x: '100%' }}
                      columns={columns} 
                      dataSource={this.state.orderListData} 
                      bordered
                      rowSelection={[2, 3].includes(this.state.currentTab) ? rowSelection : undefined}
                      rowKey={item => item.combined_key}
                      onChange={(pagination:any, filters:any, sorter:any) => this.handleTableChange(pagination, filters, sorter)} 
                      expandable={{
                        expandedRowRender: (val:any) => (this.handlFormatExpandTable(val)),
                        rowExpandable: record => record.combined_key !== 'Not Expandable',
                      }}
                      expandIconColumnIndex={-1}             
                      defaultExpandAllRows={true}
                      expandedRowKeys={this.state.orderListData.map((item:any) => item.combined_key)}
                      pagination={false}
                      locale={{
                        emptyText: EmptyComponent({ errorTip: this.state.errorTip})
                      }}
                    />
                  </Spin>
                </TabPane>
              )
            })}
          </Tabs>
          }
          <Pagination 
            defaultCurrent={this.state.page} 
            showTotal={total => `Total ${totalNumber}`}
            total={totalNumber} 
            showSizeChanger={false}
            showQuickJumper={false} 
            pageSize={this.state.size}
            current={this.state.page}
            onChange={(e: any) => this.handleChangePagination(e)}
          />
          {
            this.state.currentTab === 2 ? 
            <>
              <Checkbox
                className="select-all"
                indeterminate={orderListData.length !== this.state.selectedRowKeys.length && this.state.selectedRowKeys.length !== 0}
                onChange={(e: any) => this.handleBatchSelect(e)}
                  checked={orderListData.length === this.state.selectedRowKeys.length && orderListData.length !== 0 && this.state.checkedAll}
              >{this.state.words.button_select_all}
              </Checkbox>
                <Button type="primary" className="batch-request" size="middle" onClick={() => this.handleBatchPickUp()}>
                  {this.state.words.button_batch_request_pickup}
                </Button>
                </>
              : ""
          }
          {
            this.state.detailModalShow ? 
              <DetailModal 
                detailModalShow={this.state.detailModalShow} 
                currentRow={currentItem} 
                closeModal={(val: any, type: number, refresh: boolean) => this.closeModal(val, type, refresh)}
              ></DetailModal> : null 
          }
          {
            this.state.pickUpModalShow ? 
              <BatchPickUp 
                requestType="single"
                batchPickUpShow={this.state.pickUpModalShow}
                batchData={[currentItem]}
                closeModal={(val: any, type: number, refresh: boolean) => this.closeModal(val, type, refresh)}
              ></BatchPickUp>: null
          }
          {
            this.state.cancelOrderShow ? 
              <CancelOrder 
                cancelOrderShow={this.state.cancelOrderShow}  
                currentRow={currentItem} 
                refreshTab={(val: boolean) => this.refreshTab(val)}
                closeModal={(val: any, type: number, refresh: boolean) => this.closeModal(val, type, refresh)}
              ></CancelOrder> : null
          }
          {
            this.state.batchPickUpShow ? 
              <BatchPickUp 
                requestType="batch"
                batchPickUpShow={this.state.batchPickUpShow} 
                batchData={JSON.parse(JSON.stringify(this.state.selectedRows))}
                closeModal={(val: any, type: number, refresh: boolean) => this.closeModal(val, type, refresh)}
              ></BatchPickUp>: null
          }
          {
            this.state.expressDetailShow ?
              <ExpressDetail
                expressDetailShow={this.state.expressDetailShow}
                data={currentItem}
                closeModal={(val: any, type: number, refresh: boolean) => this.closeModal(val, type, refresh)}
              ></ExpressDetail> : null
          }
        </Spin>
      </div>
    )
  }
}

export default orderList