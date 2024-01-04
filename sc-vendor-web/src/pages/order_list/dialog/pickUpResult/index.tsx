import React, { Component } from 'react'
import { Modal, Table, message, Button, Spin} from 'antd';
import './index.scss'
import { words, columns } from './config'
import orderModel from '../../../../model/order.model'

class ChooseExpressCompanyResult extends Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = this.initialState()
  }
  initialState(): any {
    return {
      words,
      resultData: [],
      company: "",
      errorData: [],
      expressUrl: [],
      toastLoading: false,
      exportLoading: false,
      printAwbModal: false,
      from: 'batch',
      downloadLoading: false,
    }
  }
  // 处理预约快递的结果
  componentDidMount() {
    const data = this.props.resultData
    let _result: Array<any> = []
    data.forEach((val: any) => {
      if (val.success) {
        val._result.express_url = val.express_url
        val._result.express_name = val.express_name
        val._result.express_no = val.express_no
        _result.push(val._result)
      }
    })
    this.setState({ resultData: _result, expressUrl: data.filter((val: any) => val.express_url)})
    const errorNo = data.filter((val: any) => !val.success)
    this.setState({ errorData: errorNo}, () => {
      console.log(this.state.errorData)
    })
  }
  // toast样式
  handleShowToast(content: string, type: any) {
    this.setState({ toastLoading: true })
    message[type]({
      content: content,
      style: {
        marginTop: '35vh',
      },
      duration: 1.5,
    });
    setTimeout(() => {
      this.setState({ toastLoading: false })
    }, 1500);
  }
  // 关闭所有弹窗并刷新
  handleRefresh (about: string) {
    const logs = {
      type: 'request_pickup_result_popup',
      about,
      request_type: this.state.from,
      combined_key: this.state.resultData.map((val: any) => { return val.combined_key }).toString()
    }
    window.$logs('button_click', logs)
    if(this.state.exportLoading) {
      return 
    }

    this.props.closeResultModal(false, true)
  }

  // 导出发货清单
  handleExportManifest () {
    let id:Array<string> = []
    this.state.resultData.forEach((item: any) => {
       id.push(item.combined_key)
    })
    const params = {
      "combined_keys": id
    } 
    this.setState({ exportLoading: true })
    orderModel.exportExpressList(params).then((res:any) => {
      if (res.data.success) {
        window.$logs('export_order_btn', {
          result: 'success',
          page: 'request_pickup_success_popup'
        })
        this.handleDownload(res.data.data.file_name)
      } else {
        if (res.data.code === 7000015) {
          this.handleShowToast(this.state.words.export_no_order, 'error')
          window.$logs('export_order_btn', {
            result: 'no_new',
            page: 'request_pickup_success_popup'
          })
        } else {
          window.$logs('export_order_btn', {
            result: 'fail',
            page: 'request_pickup_success_popup'
          })
          this.handleShowToast(res.data.msg, 'error')
        }
      }
      this.setState({ exportLoading: false })
    }).catch(() => {
      this.setState({ exportLoading: false })
      window.$logs('export_order_btn', {
        result: 'fail',
        page: 'request_pickup_success_popup'
      })
      this.handleShowToast(this.state.words.export_error, 'error')

    })
  }

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

  // 批量打开快递单链接
  async handlePrintAwb () {
    if (this.state.exportLoading) {
      return
    }
    const logs = {
      type: 'request_pickup_result_popup',
      about: 'batch_print_awb',
      request_type: this.state.from,
      combined_key: this.state.resultData.map((val: any) => { return val.combined_key }).toString()
    }
    window.$logs('button_click', logs)
    if (this.state.resultData.length === 1) {
      window.open(this.state.resultData[0].express_url, '_blank')
      return 
    } else if (this.state.resultData.length > 1) {
      // localStorage.removeItem('awbList')
      // localStorage.setItem('awbList', JSON.stringify(this.state.resultData))
      // window.open('./awb_list', '_blank')
      const params = {
        combined_ids: this.state.resultData.map((val: any) => { return val.id }),
        all_not_print: false
      }
      this.setState({ loading: true, downloadLoading: true })
      orderModel.getBatchExpress(params).then((result: any) => {
        this.setState({ loading: false, downloadLoading: false })
        if (result.data && result.data.success) {
          window.open(result.data.url, '_blank')
        } else {
          Modal.confirm({
            maskClosable: false,
            closable: true,
            content: result.data.msg || this.state.words.download_error,
            okText: this.state.words.button_sure,
          })
        }
      }).catch(() => {
        this.setState({ loading: false, downloadLoading: false })
        this.handleShowToast(this.state.words.download_error, 'error')
      })
    }
  }

  render(): Object {
    const antIcon = <div />
    return (
      <div className="pickup-company-result">
        <Modal
          width={800}
          footer={null}
          className="result"
          title={this.state.words.title}
          visible={this.props.resultShow}
          onCancel={() => this.handleRefresh('close')}
          bodyStyle={{ height: '600px', overflowY: 'auto' }}
          maskClosable={false}
        >
        <Spin spinning={this.state.toastLoading} indicator={antIcon}>
          {
            this.state.errorData.length > 0 ?
              <>
                <div className="error-number">{this.state.words.order_number}:</div>
                {
                  this.state.errorData.map((val: any, index: number) => {
                    return (
                      <div className="order-number" key={index}>{val.id}</div>
                    )
                  })
                }
                <div className="error-text">{this.state.words.error_text}</div>
              </> : ""
          }
          {
            this.state.resultData.length > 0 ?
              <div className="result">
                <div>{this.state.words.success_text}</div>
                <div>{this.state.words.pick_up_time}: {window.$utils.$time(new Date().getTime(), 8)}</div>
                <Table
                  columns={columns}
                  dataSource={this.state.resultData}
                  bordered
                  pagination={false}
                  rowKey={item => item.combined_key}
                />
              </div>
              : ""
          }
        </Spin>
         
          <div className="opreate">
            <Button disabled={this.state.resultData.length === 0} className="action action-1" onClick={() => this.handleExportManifest()} loading={this.state.exportLoading}>{this.state.words.button_export_list}</Button>
            <Button disabled={this.state.resultData.length === 0} className="action action-2" onClick={() => this.handlePrintAwb()} loading={this.state.downloadLoading}>{this.state.words.button_print_awb}</Button>
            <Button className="action action-3" onClick={() => this.handleRefresh('ok')}>{this.state.words.button_sure}</Button>
          </div>
        </Modal>
      </div>
    )
  }
}


export default ChooseExpressCompanyResult