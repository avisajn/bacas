import React, { Component } from 'react'
import { Table, Spin, Radio, Modal, message, Popover } from 'antd'
import { column, statusList, words } from './config'
import './index.scss'
import productModel from '../../model/product.model'
import { productListQuery as ProductFilter } from '../../interface/model/product'
// import { productItem } from '../../interface/pages/product'
import $header from '../../libs/headers'
import EmptyComponent from '../../components/empty'
// import styles from '../../theme.scss';

// const { TabPane } = Tabs


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
      columns: [],
      loading: true,
      statusList,
      stockModal: false,
      previewModal: false,
      currentCover: '',
      total: 0,
      stockLoading: true,
      filter: {
        status: 0,
        page_size: 10
      },
      currentItem: {},
      firstLoad: true,
      emptyWord: '',
      selectAll: false,
      
    }
  }
  async componentDidMount() {
    
    $header({title: this.props.title})
    // await this.handleColumns()
    this.handleProductList(this.state.page)
    window.addEventListener('keydown', this.handleKeyboard.bind(this), true)
  }
  // 组件注销
  componentWillUnmount () {
    window.removeEventListener('keydown', this.handleKeyboard.bind(this), true)
  }
  // 获取商品详细信息
  handleProductDetail (code:string = ''):Promise<any> {
    return new Promise((resolve:any ,reject:any) => {
      productModel.getProductDetail(code).then((res:any) =>{
        if (res.data && res.data.success) {
          resolve(res.data.data)
        } else {
          reject(new Error('faild'))
        }
      }).catch((err:Error) => {
        reject(new Error(err.message))
      })
    })
  }
  // 配置每一行
  async handleRow (tableData: Array<any>) {
    tableData.map((val:any) => {
      const statusActions = [
        '',
        <button className="action action-4" onClick={(e:any) => this.handleChangeProductStatus(e, val, 2)}>{this.state.words.changeOffline}</button>,
        <button className="action action-5" onClick={(e:any) => this.handleChangeProductStatus(e, val, 1)}>{this.state.words.changeOnline}</button>,
        <button className="action action-4" onClick={(e:any) => this.handleChangeProductStatus(e, val, 2)}>{this.state.words.changeOffline}</button>,
      ]
      val.select = false
      val.action = 
      <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }} className="action_list">
        <button className="action action-3" onClick={() => this.handleStockMoal(val)}>{this.state.words.changeStock}</button>
        {
          statusActions[val.status]
        }
      </div>
      return val
    })
    console.log(this.state.firstLoad)
    if (this.state.firstLoad) {
      this.setState({emptyWord: this.state.words.empty, firstLoad: false})
    } else {
      this.setState({emptyWord: this.state.words.noSearchResult})
    }
    this.setState({tableData})
    return tableData
  }
  // 配置显示弹窗（修改库存）
  handleStockMoal (item:any) {
    window.$logs('button_click', {
      type: 'action',
      about: 'change_stock',
      page: 'products'
    })
    this.setState({stockLoading: true, stockModal: true})
    this.handleProductDetail(item.code).then(res => {
      this.setState({currentItem: res, stockLoading: false})
    }).catch(err => {
      message.error(this.state.words.generalFaild)
    })
    // console.log(item)
  }
  async handleColumns () {
    const columns:Array<any> = column.map((val:any) => {
      if (val.key === 'select') {
        val.title = 
        <div className="checkbox" onClick={() => this.handleSelectAll()}>
          {
            this.state.selectAll ? 
            <i className="iconfont icon-tijiao"></i>
            : 
            null
          }
        </div>
        val.render = (select:boolean, item:any) => {
          return select ? 
          <div className="checkbox" onClick={(e:any) => this.handleSelect(e, item)}>
            <i className="iconfont icon-tijiao"></i>
          </div>
          :
          <div className="checkbox" onClick={(e:any) => this.handleSelect(e, item)}></div>
        }
      } else if (val.key === 'cover_image_url') {
        val.render = (e:string, item:any) => {
          return (<div className="inner_img" style={{ wordWrap: 'break-word', wordBreak: 'break-word', minHeight: '100px' }}>
            <img src={e} onClick={(e:any) => this.handlePreview(e, item)} alt="" />
          </div>)
        }
      } else if (val.key === 'title') {
        val.render = (text:string, item:any) => {
          const ast = <div className="popup_info">
            <p>{text}</p>
            <p>{item.web_link}</p>
          </div>
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
              <Popover content={ast} title={null}>
                <a target="_blank" rel="noreferrer" className="shop_link" href={item.web_link}>{text}</a>
              </Popover>
            </div>
          )
        } 
      }
      return val
    })
    this.setState({columns})
  }
  handlePreview (e:any, item: any) {
    this.setState({currentCover: item.cover_image_url}, () => {
      this.setState({previewModal: true})
    })
  }
  // 资源型函数（接口）
  handleProductList (page:number) {
    const params: ProductFilter = JSON.parse(JSON.stringify(this.state.filter))
    // const oldStatus = this.state.statusList
    params.page_id = page
    params.product_code = this.state.filter.product_code ? this.state.filter.product_code.trim() : ''
    params.title = this.state.filter.title ? this.state.filter.title.trim() : ''
    productModel.getProductList(params).then((res:any) => {
      if (res.data.success) {
        this.setState({
          statusList:  this.state.statusList.map((val:any, index: number) => {
            let statusCount:number = 0
            if (index) {
              statusCount = res.data.data.statistics[index - 1].count
            } else {
              statusCount = window.$utils.$sum(res.data.data.statistics.map((item:any) => item.count))
            }
            return {...val, number: statusCount}
          }),
          page: page++,
          total: res.data.data.total,
          selectAll: false
        })
        return res.data.data.items
      } else {
        return []
      }
    }).then(async (res:any) => {
      const arr:Array<any> = res.map((val:any, index: number) => ({...val, select: false, show_contract_price: window.$utils.$encodeMoney(val.contract_price, true), key: index}))
      await this.handleColumns()
      this.handleRow(arr).then(() => {
        this.setState({
          loading: false
        })
      })
    }).catch(() => {
      this.setState({loading: false})
      message.error(this.state.words.generalFaild)
    })
  }
  handleSelectAll () {
    const {tableData, selectAll} = this.state
    const arr:Array<any> = tableData.map((val:any) => {
      val.select = !selectAll
      return val
    })
    this.setState({selectAll: !selectAll, tableData:arr}, () => {
      this.handleColumns()
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
        this.handleProductList(e)
        
      })
    }
  }
  // 取消弹窗
  handleCancelModal (key:string) {
    if (key === 'stockModal') {
      if (!this.state.stockLoading) {
        this.setState({
          stockModal: false,
          currentItem: {},
        })
      }
    } else if (key === 'previewModal') {
      this.setState({
        currentCover: '',
        previewModal: false
      })
    }

  }
  // 筛选商品状态
  handleChangeStatus (e:any) {
    const currentStatus = e.target.value
    const filter:ProductFilter = this.state.filter
    filter.status = currentStatus
    window.$logs('button_click', {
      type: 'search',
      sub_type: `product_status=${this.state.statusList[currentStatus].title}`,
      content: Object.entries(this.state.filter).map((val:any) => `${val[0]}=${val[1]}`).join(';'),
      page: 'products'
    })
    this.setState({filter, loading: true}, () => {
      this.handleProductList(1)
    })
  }
  // 修改库存金额
  handleChangeStock (e:any, index: number | undefined) {
    const { currentItem } = this.state
    let formatNumber = e.target.value.split('').map((val: string, index:number) => {
      if (!index && val === '0') {
        return ''
      } else if (!(/\d{1}/.test(val))) {
        return ''
      } else {
        return val
      }
    }).join('')
    // console.log(e.target.value)
    if (index || index === 0) {
      currentItem.skus[index].stock = Number(formatNumber).toString()
      currentItem.stock = window.$utils.$sum(currentItem.skus.map((val:any) => val.stock))
      this.setState({currentItem})
    } else {
      currentItem.stock = formatNumber || '0'
      this.setState({currentItem})
    }
  }
  // 选择商品
  handleSelect (e:any, item:any) {
    const tableData = this.state.tableData
    tableData[item.key].select = !item.select
    const selectLength:number = tableData.filter((val:any) => val.select).length
    this.setState({tableData, selectAll: selectLength === this.state.filter.page_size}, () => {
      this.handleColumns()
    })
  }
  // 提交修改库存
  handleSubmitStock () {
    const { currentItem } = this.state
    const stock = {}
    currentItem.skus.forEach((val:any) => {
      stock[val.id] = val.stock
    })
    this.setState({stockLoading: true})
    productModel.setProductStock({code: currentItem.code, stock, etag: currentItem.etag}).then((res:any) => {
      // console.log(res)
      if (res.data.success) {
        this.setState({stockLoading: false, stockModal: false}, () => {
          const changeSum:number = window.$utils.$sum(Object.values(stock))
          if (currentItem.status === 3 && changeSum > 0) {
            message.success(this.state.words.changeStockSuccess2)
          } else if (currentItem.status === 1 && changeSum === 0) {
            message.success(this.state.words.changeStockSuccess3)
          } else {
            message.success(this.state.words.changeStockSuccess)
          }
          this.setState({loading: true}, () => {
            this.handleProductList(this.state.filter.page_id)
          })
        })
      } else {
        message.error(this.state.words.generalFaild)
      }
    }).catch((err:any) => {
      this.setState({stockLoading: false})
      message.error(this.state.words.generalFaild)
    })
  }
  // 搜索按钮点击
  handleSearch () {
    window.$logs('button_click', {
      type: 'search',
      sub_type: 'search',
      content: Object.entries(this.state.filter).map((val:any) => `${val[0]}=${val[1]}`).join(';'),
      page: 'product'
    })
    if (!this.state.loading) {
      this.setState({loading: true}, () => {
        this.handleProductList(1)
      })
    }
  }
  // 修改商品上线下线状态
  handleChangeProductStatus (e:any, item: any, key:number) {
    window.$logs('button_click', {
      type: 'action',
      about: key === 1 ? 'online' : 'offline',
      page: 'products'
    })
    this.setState({loading: true})
    const oldStatus = Number(item.status)
    console.log(oldStatus, key)
    productModel.updateProductStatus({status: key, codes: [item.code]}).then(async (res:any) => {
      if (res.data && res.data.success) {
        message.success(key === 1 ? (item.stock > 0 ? this.state.words.onlineSuccess : this.state.words.onlineNoStockSuccess) : this.state.words.offlineSuccess)
      } else {
        Modal.confirm({
          maskClosable: false,
          closable: true,
          content: res.data.msg || this.state.words.generalFaild,
          cancelButtonProps: { style: { display: 'none' } },
          okText: this.state.words.button_sure,
        })
      }
      this.handleProductList(this.state.filter.page_id)
    })
  }
  // 获取输入
  handleInput (e:any, key:string) {
    const filter:ProductFilter = this.state.filter
    const _v = e.target.value
    filter[key] = _v
    this.setState({filter})
  }
  // 批量修改上线下线规则
  handleStatusList (e:any, key: number) {
    window.$logs('button_click', {
      type: 'batch_button',
      about: key === 1 ? 'online' : 'offline',
      page: 'products'
    })
    const codes:Array<any> = JSON.parse(JSON.stringify(this.state.tableData)).filter((val:any) => val.select).map((val:any) => val.code)
    if (!codes.length) {
      message.error(this.state.words.chooseOne)
    } else {
      this.setState({loading: true}, () => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
      })
      productModel.updateProductStatus({status: key, codes}).then(async (res:any) => {
        if (res.data && res.data.success) {
          message.success(key === 1 ? this.state.words.onlineManySucess : this.state.words.offlineManySucess)
        } else {
          Modal.confirm({
            maskClosable: false,
            closable: true,
            content: res.data.msg || this.state.words.generalFaild,
            cancelButtonProps: { style: { display: 'none' } },
            okText: this.state.words.button_sure,
          })
        }
        this.handleProductList(this.state.filter.page_id)
      })
    }
  }
  // 回车搜索
  handleKeyboard (e:any) {
    if (e.keyCode === 13) {
      const inputs:any = document.getElementsByTagName('input')
      for (let i = 0; i <= inputs.length - 1; i++) {
        inputs[i].blur()
      }
      this.handleSearch()
    }
  }
  
  

  render () {
    return (
      <div className="index_page">
        <Modal
          footer={null} 
          title={null}
          maskClosable={false}
          visible={this.state.previewModal}
          bodyStyle={{"padding": "0"}} 
          keyboard={true} 
          destroyOnClose={true}
          onCancel={() => this.handleCancelModal('previewModal')}
          width={"480px"}
          className="preview_modal"
        >
          <img style={{ width: "100%" }} src={this.state.currentCover} alt="" />

        </Modal>
        <Modal footer={null} 
          visible={this.state.stockModal} 
          maskClosable={false} 
          title={this.state.currentItem.title}
          keyboard={true}
          onCancel={() => this.handleCancelModal('stockModal')}
        >
          <Spin spinning={this.state.stockLoading}>
            <div className="stock_modal">
              <div className="title_line">
                <span>{this.state.words.stockTitle}</span>
                <span>{this.state.currentItem.stock} {this.state.words.inTotal}</span>
              </div>
              <ul>
                {
                  this.state.currentItem.skus && this.state.currentItem.skus.length ?
                  this.state.currentItem.skus.map((val:any, index:number) => {
                    return (
                      <li key={index}>
                        <span>{val.properties.join(', ')}</span>
                        <div>
                          <input type="text" maxLength={10} value={val.stock} onChange={(e:any) => this.handleChangeStock(e, index)} />
                        </div>
                      </li>
                    )
                  })
                  :
                  <li>
                    <span>{this.state.words.defaultSku}</span>
                    <div>
                      <input type="text" value={this.state.currentItem.stock} onChange={(e:any) => this.handleChangeStock(e, undefined)} />
                    </div>
                  </li>
                }
              </ul>
              <div className="footer_button">
                <button onClick={() => this.handleSubmitStock()}>{this.state.words.submitChangeStock}</button>
              </div>
            </div>
          </Spin>
        </Modal>
        <div className="table_filter">
          <div className="filter_item">
            <span>{this.state.words.product_id}:</span>
            <input maxLength={6} type="text" value={this.state.filter.product_code || ''} onChange={(e:any) => this.handleInput(e, 'product_code')} />
          </div>
          <div className="filter_item">
            <span>{this.state.words.product_title}:</span>
            <input type="text" value={this.state.filter.title || ''} onChange={(e:any) => this.handleInput(e, 'title')} />
          </div>
          {/* <div className="filter_item">
            <span>{this.state.words.shopee_url}</span>
            <input type="text" />
          </div> */}
          <div className="filter_item filter_large">
            <span>{this.state.words.status}:</span>
            <div className="radio_wrap">
            <Radio.Group value={this.state.filter.status} onChange={(e:any) => this.handleChangeStatus(e)}>
              {
                this.state.statusList.map((val:any, index:number) => {
                  return (
                    <Radio.Button value={val.value} key={val.key}>
                      <span>{val.title}</span>
                      {
                        val.number ? 
                        <span>({val.number})</span>
                        : null
                      }
                    </Radio.Button>
                  )
                })
              }
            </Radio.Group>
            </div>
          </div>
          <div className="filter_item filter_large filter_button">
            <div>
              <button onClick={() => this.handleSearch()}>
                <i className="iconfont icon-search"></i>
                <span className="word">{this.state.words.search}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="table_wrap">
          <Spin spinning={this.state.loading} wrapperClassName="table_loading" tip={''}>
            <Table
              bordered
              pagination={{
                total: this.state.total,
                onChange: (e:number) => this.handlePage(e),
                showTotal: () => <div className="total_wrap">{this.state.words.total}: {this.state.total}</div>,
                showQuickJumper: false,
                showSizeChanger: false,
                pageSize: this.state.filter.page_size
              }}
              dataSource={this.state.tableData}
              columns={this.state.columns}
              locale={{
                emptyText: EmptyComponent({errorTip: this.state.emptyWord})
              }}
            />
          </Spin>
        </div>
        {
          !this.state.loading && this.state.tableData.length ?
          <div className="footer_operation">
            <div className="bottom_button">
              <button onClick={(e:any) => this.handleStatusList(e, 1)}>{this.state.words.changeManyOnline}</button>
              <button onClick={(e:any) => this.handleStatusList(e, 2)}>{this.state.words.changeManyOffline}</button>
            </div>
          </div>
          :
          ''
        }
      </div>
    )
  }
}


export default Index