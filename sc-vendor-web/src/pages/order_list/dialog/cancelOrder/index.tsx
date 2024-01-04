import React, { Component } from 'react'
import { Modal, Button, message } from 'antd';
import './index.scss'
import { words } from './config'
import orderModel from '../../../../model/order.model'

// const { TabPane } = Tabs;

class cancelOrderModel extends Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = this.initialState()
  }
  initialState(): any {
    return {
      words,
      successDataModal: false,
      loading: false,
      cancelData: ""
    }
  }

  // componentDidMount() {
    // console.log(this.props.currentRow)
  // }

  handleCancel() {
    const params = {
      "combined_key": this.props.currentRow.combined_key
    }
    this.setState({loading: true})
    window.$logs('button_click', {
      type: 'cancel_oder_popup',
      about: 'cancel',
    })
    orderModel.cancelOrder(params).then((res: any) => {
      this.props.refreshTab(true)
      if (res.data.success) {
        this.setState({ successDataModal: true , loading: false, cancelData: res.data.data})
      } else {
        this.setState({ loading: false })
        message.error(res.data.msg || '', 1.5)
      }
    }).catch(() => {
      this.setState({ loading: false })
    })
  };
  handleCancelDialog () {
    if (!this.state.loading) {
      window.$logs('button_click', {
        type: 'cancel_oder_popup',
        about: 'later',
      })
      this.props.closeModal(false, 3, false)
    }
  }

  render(): Object {
    const {
      button_cancel,
      button_sure,
      order_number,
      success,
      penalty_text,
      tip,
      regular_order,
      combined_order,
    } = this.state.words
    return (
      <div className="index_page">
        <Modal
          className="cancel-order"
          maskClosable={false}
          visible={this.props.cancelOrderShow}
          onCancel={() => this.handleCancelDialog()}
          footer={[
            <Button type="ghost" size="middle" onClick={() => this.handleCancelDialog()}>
              {button_cancel}
            </Button>,
            <Button type="primary" size="middle" loading={this.state.loading} onClick={() => this.handleCancel()}>
              {button_sure}
            </Button>
          ]}
        >
          <p className="detailImgWrap" dangerouslySetInnerHTML={{ __html: !this.props.currentRow.is_combined_order ? regular_order : combined_order }}></p>
        </Modal>
        <Modal
          title=""
          visible={this.state.successDataModal}
          footer={null}
          onCancel={() => this.props.closeModal(false, 3, false)}
        >
         <div className="cancel-order">
            <div>{order_number}：</div>
            <div className="order-number"> {this.props.currentRow.combined_key}</div>
            <div>{success}</div>
            {this.state.cancelData > 0 ? 
              <div>{penalty_text} Rp{window.$utils.$encodeMoney(this.state.cancelData, true)} .</div>
              : ""
            }
            <div>{tip}</div>
         </div>
        </Modal>
      </div>
    )
  }
}


export default cancelOrderModel