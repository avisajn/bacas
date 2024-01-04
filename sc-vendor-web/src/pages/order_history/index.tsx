import React, { Component } from 'react'
import { Table, Spin, DatePicker, message, Pagination } from 'antd'
import { column, words } from './config'
import './index.scss'
import orderModel from '../../model/order.model'
import { orderHistoryQuery } from '../../interface/model/order'
import $header from '../../libs/headers'
import EmptyComponent from '../../components/empty'

const { RangePicker } = DatePicker;


class Index extends Component<any, any> {
  constructor (props: any) {
    super(props)
    this.state = this.initialState()
  }
  initialState ():any {
    return {
      words,
      page: 1,
      tableData: [],
      columns: column,
      loading: true,
      total: 0,
      filter: {
        page_size: 10
      },
      dates: [],
      emptyWord: '',
      downLoadFrom: ['', words.fromBack, words.fromApp],
      firstLoad: true
    }
  }
  componentDidMount () {
    $header({title: this.props.title})
    this.handleList(this.state.page)
  }
  // 资源型函数（接口）
  handleList (page:number) {
    const params: orderHistoryQuery = JSON.parse(JSON.stringify(this.state.filter))
    params.page = page
    orderModel.getExportedOrders(params).then((res:any) => {
      if (this.state.firstLoad) {
        this.setState({emptyWord: this.state.words.empty, firstLoad: false})
      } else {
        this.setState({emptyWord: this.state.words.noSearchResult})
      }
      if (res.data.success) {
        // console.log(page)
        this.setState({page, total: res.data.data.total})
        return res.data.data.items
      } else {
        return []
      }
    }).then(async (res:any) => {
      this.setState({
        loading: false,
        tableData: res.map((val:any, index:number) => ({...val, order_info: val.order_info.map((item:any, i:number) => ({...item, key: i})), key: index}))
      })
    }).catch((err:any) => {
      this.setState({loading: false})
    })
  }
  // 翻页
  handlePage (e:number) {
    if (!this.state.loading) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
      this.setState({
        loading: true
      }, () => {
        this.handleList(e)
      })
    }
  }
  // 获取选择日期
  handleDate (e:any, dates:Array<string>) {
    const [created_time_start,  created_time_end] = dates
    const filter:orderHistoryQuery = this.state.filter
    filter.created_time_start = created_time_start ? new Date(created_time_start).getTime() / 1000 : 0
    filter.created_time_end = created_time_end ? new Date(created_time_end).getTime() / 1000 : 0
    this.setState({filter, dates: e})
  }

  // 获取输入信息
  handleInput (e: any) {
    const _v:string = e.target.value
    const filter:orderHistoryQuery  = this.state.filter
    filter.order_no = _v
    this.setState({filter})
  }

  // 搜索
  handleSearch () {
    this.setState({loading: true}, () => {
      this.handleList(1)
    })
  }

  // 整理请求参数
  handleDownload (_e:any, fileName:string) {
    
    this.setState({loading: true})
    orderModel.getDownloadPdf(fileName).then((res:any) => {
      if (res.data) {
        const link = document.createElement('a')
        const blobData = new Blob([res.data], { type: 'application/pdf' })
        link.download = `Mokkaya manifest-${localStorage.getItem('user_name')}-${window.$utils.$time(null, 10)} downloaded.pdf`
        link.href = URL.createObjectURL(blobData)
        link.style.display = "none"
        link.target = "_blank"
        link.click()
        message.success(this.state.words.downloadSuccess)
        window.$logs('export_order_btn', {
          result: 'success',
          page: 'manifest_list_history'
        })
      } else {
        message.error(this.state.words.generalFaild)
        window.$logs('export_order_btn', {
          result: 'fail',
          page: 'manifest_list_history'
        })
      }
    }).then((res:void)=> {
      this.setState({loading: false})
      window.$logs('export_order_btn', {
        result: 'fail',
        page: 'manifest_list_history'
      })
    })
  }
  render () {
    return (
      <div className="order_history_page">
        <div className="top_tip">*<span>{this.state.words.top_tip}</span></div>
        <div className="table_filter">
          <div className="filter_item">
            <span>{this.state.words.export_time}:</span>
            <div className="picker_wrap">
              <RangePicker
                dropdownClassName="order_history_datepicker"
                allowEmpty={[true, true]}
                allowClear={true}
                onChange={(e:any, dateStrings: [string, string]) => this.handleDate(e, dateStrings)}
                value={this.state.dates}
              ></RangePicker>
            </div>
            {/* <input type="text" value={this.state.filter.export_time || ''} onChange={(e:any) => this.handleInput(e)} /> */}
          </div>
          <div className="filter_item">
            <span>{this.state.words.order_no}:</span>
            <input type="text" value={this.state.filter.order_no || ''} onChange={(e:any) => this.handleInput(e)} />
          </div>
          <div className="filter_item filter_button">
            <div>
              <button onClick={() => this.handleSearch()}>
                <i className="iconfont icon-search"></i>
                <span className="word">{this.state.words.search}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="table_wrap">
          <Spin spinning={this.state.loading} wrapperClassName="table_loading">
            {
              this.state.tableData.length ?
              this.state.tableData.map((item:any, index: number) => {
                return (
                  <div className="table_item" key={index}>
                    <div className="table_top">
                      <div>
                        <span>{this.state.words.export_time}:</span>
                        <span>{window.$utils.$time(item.export_time * 1000)}</span>
                        <span> via {this.state.downLoadFrom[item.source]}</span>
                      </div>
                      <div>
                        <button onClick={(e:any) => this.handleDownload(e, item.file_name)}>{this.state.words.download}</button>
                        <span>{this.state.words.download_tip}</span>
                      </div>
                    </div>
                    <div className="table_info">
                    <Table
                        bordered
                        pagination={false}
                        dataSource={item.order_info}
                        columns={this.state.columns}
                      />
                    </div>
                  </div>
                )
              })
              :
              EmptyComponent({errorTip: this.state.emptyWord})
            }
          </Spin>
        </div>
        {
          !this.state.loading ?
          <div className="page_wrap">
            <Pagination
              total={this.state.total}
              onChange={(e:number) => this.handlePage(e)}
              showTotal={() => <div className="total_wrap">{this.state.words.total}: {this.state.total}</div>}
              showQuickJumper={false}
              showSizeChanger={false}
              current={this.state.page}
              pageSize={this.state.filter.page_size}
            ></Pagination>
          </div>
          :
          null
        }

      </div>
    )
  }
}


export default Index