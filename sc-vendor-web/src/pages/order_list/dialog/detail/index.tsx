import React, { Component } from 'react'
import { Modal, message, Spin} from 'antd';
import './index.scss'
import { words } from './config'
import orderModel from '../../../../model/order.model'
import { logisiticDomain } from '../../../../config'


class detailModal extends Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = this.initialState()
  }
  initialState(): any {
    return {
      words,
      loading: true,
      detailData: [],
      detailModal: false
    }
  }

  componentDidMount() {
    const parmas = {
      combined_key: this.props.currentRow.combined_key
    }
    this.setState({loading: true})
    orderModel.getDetail(parmas).then((res: any) => {
      if (res.data.success) {
        this.setState({ detailData: res.data.data, loading: false })
      }
    }).catch(() => {
      message.warning(this.state.words.failed, 1.5)
      this.setState({ loading: false })
    })
  }
  formatAmount(data: any) {
    const arr: Array<number> = []
    data.orders.forEach((item: any) => {
      item.order_sku.forEach((val: any) => {
        arr.push(val.amount)
      })
    })
    const reducer = (accumulator: any, currentValue: any) => accumulator + currentValue;
    return arr.reduce(reducer)
  }
  // 打开快递单链接
  handlePrintLable(val: any) {
    var encode = encodeURI(val.order_express_info.express_no);
    window.open(logisiticDomain + btoa(encode))
  }

  render(): Object {
    const { 
      order_number,
      recipient_info,
      address,
      logistics_info,
      pick_up_time,
      order_info,
      status,
      created_time,
      amount,
      total_price,
      product_id,
      sku,
      price,
      default_sku,
      delivered, 
      disbursement_info,
      disbursement_value,
      penalty,
     } = this.state.words
    return (
      <Modal
      title="Detail pesanan"
      visible={this.props.detailModalShow} 
      footer={null}
      maskClosable={false}
      // onOk={() => this.handleOk}
      onCancel={() => this.props.closeModal(false, 1)}
      okButtonProps={{ disabled: true }}
      cancelButtonProps={{ disabled: true }}
      bodyStyle={{ height: '600px', overflowY: 'auto' }}
      width="650px"
      className="order_detail_model"
    >
      <Spin spinning={this.state.loading}>
        <div className="detail">
            <div className="order_id">
              <span>{order_number}:</span>
              <span>{this.state.detailData.combined_key}</span>
            </div>
            <p className="title">{recipient_info}</p>
            <div className="address_name">{this.state.detailData.receiver_location?.name}</div>
            <div className="address_name">{this.state.detailData.receiver_location?.phone_number}</div>
            {
              this.state.detailData.receiver_location ?
                <div className="address_detail">
                  <span>{this.state.detailData.receiver_location.detail_address},</span>
                  <span>{this.state.detailData.receiver_location.city_name},</span>
                  <span>{this.state.detailData.receiver_location.district_name},</span>
                  <span>{this.state.detailData.receiver_location.province_name},</span>
                  <span>{this.state.detailData.receiver_location.post_code}</span>
                  <span>{this.state.detailData.receiver_location.landmark ? `,(${this.state.detailData.receiver_location.landmark})` : ''}</span>
                </div>
                :
                <div className="address_detail">{address}</div>
            }
           {
              (this.state.detailData.status !== 2 && this.state.detailData.status !== 5 && this.state.detailData.status !== 6)
                || (this.state.detailData.sub_status === 402 || this.state.detailData.sub_status === 403 || this.state.detailData.sub_status === 404 || this.state.detailData.sub_status === 405 || this.state.detailData.sub_status === 601)
              ?
                <>
                  <p className="title">{logistics_info}</p>
                  { this.state.detailData.is_cod ? <div className="is-cod">COD</div>: '' }
                  <div className="pick_up_time">
                      {pick_up_time}: {window.$utils.$time(this.state.detailData.order_express_info?.created_time, 8)}
                  </div>
                  {
                    this.state.detailData.order_express_info ?
                      <div>
                        <span>{this.state.detailData.order_express_info.express_name}: </span>
                        <span>{this.state.detailData.order_express_info.express_no}</span>
                        <div className="express-link" onClick={() => { this.handlePrintLable(this.state.detailData) }}>
                          {logisiticDomain + btoa(encodeURI(this.state.detailData.order_express_info.express_no))}
                        </div>
                      </div>
                      : null
                  }
                </> : ""
           }
            
            <p className="title">{order_info}</p>
            <div className="order_status">
              <span>{status}:</span>
              <span>{this.state.detailData.status_description}</span>
            </div>
            <div className="order_info">
              <span>{created_time}: {window.$utils.$time(this.state.detailData.create_time, 8)}</span>
              {this.state.loading ? '' : <span>{amount}: {this.formatAmount(this.state.detailData)}</span>}
              <span>{total_price}: Rp{window.$utils.$encodeMoney(this.state.detailData.total_contract_price, true)}</span>
            </div>
            <table>
              <tbody>
                <tr>
                  <td>{product_id}</td>
                  <td>{sku} </td>
                  <td>{price}</td>
                  {
                    this.state.detailData.sub_status === 403 || this.state.detailData.sub_status === 404 || this.state.detailData.sub_status === 405 ?
                    <td>{status}</td> :  ""
                  }
                </tr>
                {
                  this.state.detailData.orders?.map((val: any, index: number) => {
                    return val.order_sku.map((sku: any, sku_idx: number) => {
                      return (
                        <tr key={sku_idx}>
                          <td>{val.product_code}</td>
                          <td>{sku.sku_properties.toString() || default_sku}</td>
                          <td>Rp{window.$utils.$encodeMoney(val.contract_price, true)} * {sku.amount}</td>
                          {
                            this.state.detailData.sub_status === 403 || this.state.detailData.sub_status === 404 || this.state.detailData.sub_status === 405 ?
                              <td>{sku.status_description ? sku.status_description : (sku.status === 1 ? delivered : '')}</td>
                            : ""
                          }
                        </tr>
                      )
                    })
                  })
                }
              </tbody>
            </table>
            {
              this.state.detailData.disbursement_status === 2 || this.state.detailData.vendor_delayed_penalty || this.state.detailData.vendor_aftersale_penalty ? 
              <p className="title">{disbursement_info}</p> : ""
            }
            {
              this.state.detailData.disbursement_status === 2 ?
                <div className="penalty_line">{disbursement_value}：Rp{window.$utils.$encodeMoney(this.state.detailData.payfor_vendor_money, true)}</div>
              : ""
            }
            {
              this.state.detailData.vendor_delayed_penalty ?
                <div className="penalty_line">{penalty}：Rp{window.$utils.$encodeMoney(this.state.detailData.vendor_delayed_penalty, true)} ({this.state.words.cancel_reason})</div>
                :
                null
            }
            {
              this.state.detailData.vendor_aftersale_penalty ?
                <div className="penalty_line">{penalty}：Rp{window.$utils.$encodeMoney(this.state.detailData.vendor_aftersale_penalty, true)} ({this.state.words.aftersale_reason})</div>
                :
                null
            }
        </div>
      </ Spin>
    </Modal>
    )
  }
}


export default detailModal