import React, { Component } from 'react'
import { Modal, Radio, Space, Spin, message, Button } from 'antd';
import './index.scss'
import { words } from './config'
import ChooseExpressCompanyResult from '../pickUpResult/index'
import orderModel from '../../../../model/order.model'
// interface Result {
//   result?: string,
//   request_type?: string,
//   express?: Array<string>,
//   combined_key?: string,
//   fail_reason?:string,
// }
class ChooseExpressCompany extends Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = this.initialState()
  }
  initialState(): any {
    return {
      words,
      data: [],
      errorCompany: [],
      loading: false,
      company: "",
      resultModalShow: false,
      resultData: [],
      sender: {},
      errorExpress: [],
      from: '',
      no_company: false,
    }
  }
  // 校验每个单号支持的快递公司
  componentDidMount() {
    this.setState({ data: this.props.data, loading: true, from: this.props.requestType }, () => {
      let chooseData = this.state.data
      const company = chooseData.map((val: any, idx: number) => {
       
        return new Promise((resolve: any, reject: any) => {
          orderModel.getReservationInfo(val).then((res: any) => {
            if (res.data.success) {
              this.setState({ sender: res.data.data.sender })
              resolve({
                id: val.combined_key,
                express_company: res.data.data.express.companies,
                success: res.data.success,
              })
            } else {
              reject({
                id: val.combined_key,
                // express_company: res.data.msg,
                success: res.data.success,
                msg: res.data.msg
              })
            }
          }).catch((err: any) => {
            reject([err])
          })
        })
      })

      Promise.all(company).then((res: any) => {
        let supportCompany: Array<any> = []
        let notSupportCompany: Array<any> = []
        
        chooseData.forEach((item: any, index: number) => {
          if (res[index].express_company.length) {
            item.support_company = res[index].express_company
            item.company_type = item.support_company.filter((val: any) => val.selected)[0]?.id || null
            item.support_company.forEach((i: any) => {
              if (!i.enable) {
                this.setState({ no_company: true })
                notSupportCompany.push(item)
              } else {
                supportCompany.push(item)
              }
            })
          } else {
            notSupportCompany.push(item)
          }
        })
      
        this.setState({ data: supportCompany, errorCompany: notSupportCompany, loading: false, resultData: chooseData })
        if (supportCompany.length > 0) {
          let arr:any = []
          supportCompany.forEach((val: any) => {
            arr.push(val.support_company.map((e: any) => e.name).join(',').toString() + ";")
          })
          window.$logs('popup_show', {
            type: 'choose_express',
            request_type: this.state.from,
            able_choose: arr.toString(),
            combined_key: supportCompany.map((val: any) => val.combined_key).join(',')
          })
        }
      }).catch((err) => {
        // console.log(err)
        message['error']({
          content: this.state.words.failed + ' ' + err.id + ' ' + err.msg,
          className: 'custom-class',
          style: {
            marginTop: '35vh',
          },
          duration: 3.5,
        });
     
        setTimeout(() =>{
          this.props.closeCompanyModal(false)
        }, 4000)
      })
    })
  }
  // 子组件成功后 关闭弹窗
  handleClose() {
    this.setState({ confirmDialog: true })
  }
  // 点击快递公司 增加选中的company_type
  onChange(e: any, idx: number) {
    let copyData = this.state.data
    copyData.forEach((val: any, index: number) => {
      if (index === idx) {
        val.company_type = e.target.value
      }
    })
    this.setState({
      data: copyData,
      resultData: copyData
    })
  }
  // 批量提交确认选择的快递
  handlePickUp = () => {
    const logs = {
      type: 'choose_express_popup',
      about: 'submit',
      request_type: this.state.from,
      combined_key: this.state.resultData.map((val: any) => { return val.combined_key }).toString()
    }
    window.$logs('button_click', logs)

    const no_choose = this.state.resultData.filter((val: any) => {
      return val.company_type === 0
    })
    if (no_choose.length === this.state.resultData.length) {
      this.props.closeCompanyModal(false)
      return 
    }
    const _result = this.state.resultData.filter((val: any) => {
      return val.company_type
    })
    window.$logs('button_click', {
      type: 'request_now',
      request_type: this.state.from,
      express: _result.map((val: any) => val.company_type).join(','),
      combined_key: _result.map((val: any) => val.combined_key).join(',')
    })
    
    this.setState({ loading: true })
    const _express = _result.map((val: any, index: number) => {
      return new Promise((resolve: any, reject: any) => {
        let params = {
          express_id: val.company_type,
          combined_key: val.combined_key,
          location_id: this.state.sender.post_code_id,
          detail: this.state.sender.detail,
          name: this.state.sender.name,
          phone_number: this.state.sender.phone_number
        }
        const expressName: object = {
          2: "JNE Express",
          4: "SiCepat Express",
          27: "SAP"
        }
        setTimeout(() => {
          orderModel.express(params).then((res: any) => {
            if (res.data.success) {
              resolve({
                success: res.data.success,
                id: params.combined_key,
                msg: "",
                _result: val,
                express_url: res.data.data.express_url,
                express_name: res.data.data.express_name,
                express_no: res.data.data.express_no
              })
            } else {
              resolve({
                success: res.data.success,
                id: params.combined_key,
                msg: res.data.msg || "",
                code: res.data.code,
                express_name: expressName[val.company_type]
              })
            }
          }).catch((err: any) => {
            resolve({
              success: false,
              id: params.combined_key,
              msg: err || "",
              express_name: expressName[val.company_type]
            })
          })
        }, 100 * index );
      })
    })
    Promise.all(_express).then(res => {
      let combined_key_success: any = [];
      let combined_key_failed: any = [];
      let fail_reasons:any = [];
      let fail_codes:any = [];
      let express_success: Array<number> = []
      let express_failed: Array<number> = []
      res.forEach((item:any, index:number) => {
        if (item.success) {
          combined_key_success.push(item.id);
          express_success.push(item.express_name)
        } else {
          fail_reasons.push(item.msg);
          fail_codes.push(item.code);
          combined_key_failed.push(item.id);
          express_failed.push(item.express_name)
        }
      });
      let errorObj = {
        result: 'fail',
        request_type: this.state.from,
        express: express_failed.toString(),
        combined_key: combined_key_failed.toString(),
        fail_reason: fail_reasons.join(";"),
        fail_code: fail_codes.join(";")
      };
      let successObj = {
        result: 'success',
        request_type: this.state.from,
        express: express_success.toString(),
        combined_key: combined_key_success.toString()
      };

      if (combined_key_failed.length > 0) {
        window.$logs('confirm_deliver', errorObj)
      } 
      if (combined_key_success.length > 0) {
        window.$logs('confirm_deliver', successObj)
      }
     
      this.setState({
        resultModalShow: true,
        resultData: res,
        loading: false
      })
    }).catch(err => {
      this.setState({
        loading: false
      })
      message.error(this.state.words.error_text, 1.5)
    })
  }

  //  关闭预约快递结果弹窗
  closeResultModal(e: boolean, refresh: boolean) {
    this.setState({ resultModalShow: e })
    this.props.closeCompanyModal(false, refresh)
  }
  handleCloseDialog(about: string) {
   if(!this.state.loading) {
     const logs = {
      type: 'choose_express_popup',
      about,
      request_type: this.state.from,
      combined_key: this.state.resultData.map((val: any) => { return val.combined_key }).toString()
     }
     window.$logs('button_click', logs)
     this.props.closeCompanyModal(false)
   }
  }

  render(): Object {
    return (
      <div className="choose-company">
        <Modal
          width={720}
          title={this.state.words.title}
          visible={this.props.show}
          maskClosable={false}
          onCancel={() => this.handleCloseDialog('close')}
          footer={[
            <Button type="ghost" size="middle" disabled={this.state.loading} onClick={() => this.handleCloseDialog('cancel')}>
              {this.state.words.button_cancel}
            </Button>,
            <Button type="primary" size="middle" loading={this.state.loading} onClick={() => this.handlePickUp()}>
              {this.state.words.button_sure}
            </Button>
          ]}
          bodyStyle={{ height: '590px', overflowY: 'scroll' }}
        >
          {this.state.loading ? <Spin className="spin-loading"></Spin> :
            <>
              { this.state.errorCompany.length > 0 ?
                <>
                  <div className="error-number">{this.state.words.for_no}:</div>
                  {
                    this.state.errorCompany.map((val: any, index: number) => {
                      return <div key={index}>{val.combined_key}</div>
                    })
                  }
                  <div className="error-text" >{this.state.words.error_text}</div>
                </>
                : ""
              }
              <div className="choose">
                {
                  this.state.data.map((item: any, index: number) => {
                    return (
                      <div className="order-item" key={index}>
                        <p className="order-number">{this.state.words.order_number}: {item.combined_key}</p>
                        <div className="order-content">
                          <div className="left">
                            {item.orders.map((sku_item: any, sku_idx: number) => {
                              return (
                                <div className="product" key={sku_idx}>
                                  <div className="image">
                                    <img src={sku_item.image_url} alt="" />
                                  </div>
                                  <div className="content">
                                    <div className="title">{sku_item.product_title}</div>
                                    <div className="sku">
                                      {
                                        sku_item.order_sku.map((val: any, idx: number) => {
                                          return  <div key={idx}>
                                          <span>{val.sku_properties.toString()}</span>
                                          {val.sku_properties && val.sku_properties.length > 0 ? <span className="amount"> * </span> : ""}
                                          <span className="amount">{val.amount}</span>
                                        </div>
                                        })
                                      }
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          <Radio.Group onChange={(e: any) => this.onChange(e, index)} value={this.state.data[index].company_type}>
                            <Space direction="vertical">
                              {item.support_company.map((type: any, typeId: number) => {
                                if (type.enable) {
                                  return <Radio checked={type.selected} value={type.id}
                                   disabled={!type.enable} key={typeId}>{type.name}({type.description})</Radio>
                                } else {
                                  return ""
                                }
                              })}
                              <Radio value={0}>{this.state.words.not_request}</Radio>
                            </Space>
                          </Radio.Group>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </>
          }
        </Modal>
        {this.state.resultModalShow ? <ChooseExpressCompanyResult resultData={this.state.resultData} resultShow={this.state.resultModalShow} closeResultModal={(e: any, refresh: boolean) => this.closeResultModal(e, refresh)}></ChooseExpressCompanyResult> : ""}
      </div>
    )
  }
}


export default ChooseExpressCompany