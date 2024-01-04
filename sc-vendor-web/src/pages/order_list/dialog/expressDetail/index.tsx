import React, { Component } from 'react'
import { Modal, Empty } from 'antd';
import './index.scss'
import { words } from './config'

class expressDetailModal extends Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = this.initialState()
  }
  initialState(): any {
    return {
      words,
      loading: false,
      
    }
  }

  componentDidMount() {
    console.log(this.props.data)
  }

  render(): Object {
    return (
      <div>
        <Modal
          className="express-detail"
          visible={this.props.expressDetailShow}
          maskClosable={false}
          onCancel={() => this.props.closeModal(false, 5, false)}
          footer={null}
          bodyStyle={{ height: '600px', overflowY: 'scroll' }}
        >
          {
            this.props.data.order_express_info.records && this.props.data.order_express_info.records[0] ?
              this.props.data.order_express_info.records.map((val: any) => {
                return (
                  <div className="details">
                  <div>{window.$utils.$time(val.time, 8)}</div>
                  <div>{val.description}</div>
                </div>
                )
              })
            : <div className="empty"><Empty description={false} /></div>}
          
        </Modal>
      </div>
    )
  }
}


export default expressDetailModal