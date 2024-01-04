import './index.scss';
import { errorTip } from './config'

const EmptyComponent = (props:any = {}) => {
  return (
    <div className="null_data">
      <i className="iconfont icon-meiyoushuju" />
      <p>{props?.errorTip || errorTip}</p>
    </div>
  )
}

export default EmptyComponent;