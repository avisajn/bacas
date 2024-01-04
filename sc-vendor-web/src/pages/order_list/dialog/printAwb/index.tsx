import React, { Component } from 'react'
import { Button} from 'antd';
import './index.scss'
import { words,  } from './config'

class printAwbList extends Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = this.initialState()
  }
  initialState(): any {
    return {
      words,
      resultData: [],
      printAwbModal: false,
    }
  }
  componentDidMount() {
    const data: string | null = localStorage.getItem('awbList')
    
     if(data) {
      this.setState({
        resultData: JSON.parse(data)
      }, () => {
        console.log(this.state.resultData)
      })
     }

  }

  // 打开快递单链接
  handlePrintAwb (item: any) {
    window.$logs('button_click', {
      about: 'print',
      page: 'print_label'
    })
    window.open(item.express_url, '_blank')
  }

  render(): Object {
    const { 
      order_number,
      logistics_number,
      button_print_label
    } = this.state.words
    return (
      <div className="result-awb">
        {
          this.state.resultData.length > 0 ? 
          <table>
            <tbody>
                <tr>
                <td>{order_number}</td>
                <td>{logistics_number} </td>
                <td></td>
              </tr>
              {this.state.resultData.map((val: any, idx: number) => {
                return (
                  <tr key={idx}>
                    <td>{val.combined_key}</td>
                    <td>
                      <div>{val.express_name}</div>
                      <a target="_blank" href={val.express_url} rel="noreferrer">{val.express_no}</a>
                    </td>
                    <td>
                      <Button type="primary" size="middle" onClick={() => this.handlePrintAwb(val)}>{button_print_label}</Button>
                    </td>
                </tr>
                ) 
              })}
            </tbody>
          </table>
          : ""
        }
      </div>
    )
  }
}


export default printAwbList