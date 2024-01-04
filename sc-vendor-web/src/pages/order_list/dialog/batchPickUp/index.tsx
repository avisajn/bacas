import React, { Component } from 'react'
import { Modal, Popconfirm } from 'antd';
import './index.scss'
import { words } from './config'
import ChooseExpressCompany from '../chooseExpressCompany/index'

// const { TabPane } = Tabs;

class BatchPickUp extends Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = this.initialState()
  }
  initialState(): any {
    return {
      words,
      confirmShow: [],
      confirmDialog: false,
      data: [],
      chooseCompanyModal: false,
      from: ''
    }
  }

  componentDidMount() {
    this.state.confirmShow.forEach((val: any) => {
      val.confirmDialog = false
    })
    this.setState({ data: this.props.batchData, from: this.props.requestType})
  }

  handleRemoveOrder(val: any) {
    window.$logs('button_click', {
      type: 'stock_check_popup',
      about: 'close',
      request_type: this.state.from,
      combined_key: val.combined_key
    })
    this.setState({ confirmDialog: true})
  }

  // 二次确认删除子订单
  handleDeleteOrder(index: any) {
    const copyData = this.state.data
    if (copyData.length === 1) {
      this.props.closeModal(false, 4)
    }
    copyData.splice(index, 1)
    this.setState({ data: copyData })
  }

  // 二次确认点击later
  handleLater() {
    this.props.closeModal(false, 4)
    window.$logs('button_click', {
      type: 'stock_check_popup',
      about: 'later',
      request_type: this.state.from,
      combined_key: this.state.data.map((val: any) => { return val.combined_key }).toString()
    })
  }
  // 二次确认是否为所选订单
  handleSubmit = () => {
    window.$logs('button_click', {
      type: 'stock_check_popup',
      about: 'pickup',
      request_type: this.state.from,
      combined_key: this.state.data.map((val: any) => { return val.combined_key }).toString()
    })
    Modal.confirm({
      maskClosable: false,
      closable: true, 
      onCancel: () => this.setState({ chooseCompanyModal: true }, () => {
        this.props.closeModal(false, 4)
        window.$logs('button_click', {
          type: 'pack_remind',
          about: 'close',
          request_type: this.state.from,
          combined_key: this.state.data.map((val: any) => { return val.combined_key }).toString()
        })
      }),
      content: this.state.words.double_confirm,
      cancelButtonProps: { style: { display: 'none' } },
      okText:  this.state.words.button_sure,
      onOk: async () => {
        this.setState({ chooseCompanyModal: true }, () => {
          window.$logs('button_click', {
            type: 'request_pickup',
            request_type: this.state.from,
            page: 'orders_to_be_shipped',
            combined_key: this.state.data.map((val: any) => { return val.combined_key }).toString()
          })
          window.$logs('button_click', {
            type: 'pack_remind',
            about: 'pickup',
            request_type: this.state.from,
            combined_key: this.state.data.map((val: any) => { return val.combined_key }).toString()
          })
        })
      }
    })
  }

  handleChooseExpreseCompany(e: any) {
    this.setState({
      chooseCompanyModal: true
    })

  }
  closeCompanyModal(val: boolean, refresh: boolean) {
    this.setState({ chooseCompanyModal: val})
    this.props.closeModal(false, 4, refresh)
  }

  render(): Object {
    return (
      <div className="batch-pick-up">
        <Modal
          title={this.state.words.title}
          width="700px"
          maskClosable={false}
          visible={this.props.batchPickUpShow}
          onOk={() => this.handleSubmit()}
          onCancel={() => this.handleLater()}
          okText={this.state.words.button_sure}
          cancelText={this.state.words.button_cancel}
          bodyStyle={{ height: '490px', overflowY: 'auto'}}
        > 
          {
            this.state.data.map((item: any, idx: number) => {
              return (
                <div className="orders" key={idx}>
                  <div className="order-item">
                    <div className="order-number">
                      <span>{this.state.words.order_number +': ' + item.combined_key}</span>
                      <Popconfirm
                        visible={this.state.data[idx].confirmDialog}
                        title={this.state.words.resure_title}
                        onConfirm={() => this.handleDeleteOrder(idx)}
                        okText="Yes"
                        cancelText={this.state.words.button_cancel}
                      >
                        <span onClick={() => this.handleRemoveOrder(item)} className="delete"> <i className="iconfont icon-close"></i> </span>
                      </Popconfirm>
                    </div>
                    <div className="sku">
                      {
                        item.orders.map((sku_item: any, index: number) => {
                          return (
                            <>
                              <p>{sku_item.product_title}</p>
                              <table>
                                <tbody>
                                  {sku_item.order_sku.map((sku: any, sku_idx: number) => {
                                    return  <tr key={sku_idx}>
                                      <td>{sku.sku_properties.toString() || this.state.words.default_sku}</td>
                                      <td>{sku.amount}</td>
                                    </tr>
                                    })
                                  }
                                  </tbody>
                              </table>
                            </>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>
              )
            })
          }
        </Modal>
        {
        this.state.chooseCompanyModal ? 
          <ChooseExpressCompany 
            requestType={this.state.from}
            show={this.state.chooseCompanyModal} 
            data={this.state.data} 
            closeCompanyModal={(val: any, refresh: boolean) => this.closeCompanyModal(val, refresh)}
          ></ChooseExpressCompany> 
          : null 
        }
      </div>
    )
  }
}


export default BatchPickUp