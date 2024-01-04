import type { Stream } from "stream"

const isBig = (str:number):string => {
  return str >= 10 ? str.toString() : '0' + str
}
const months = (str:number):string => {
  // console.log(str)
  const ms = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return str ? ms[str] : ms[0]
}
 
// 装换金额样式
export const $formatMoney = (money:string = '', asts:string | void = '.'):string => {
  const arr:Array<Array<string>> = []
  money.split('').reverse().forEach((val:string, index: number) => {
    if (index % 3 === 0) {
      arr.push([val])
    } else {
      arr[arr.length - 1].push(val)
    }
  })
  return arr.map((val:Array<string>) => val.reverse().join('')).reverse().join(asts || '.')
}
export const $query = (obj:any = {}, has:boolean | void = false, complex:boolean | void = false):string | null => {
  if (obj.constructor !== Object) return null
  const arr = Object.entries(obj)
  let str = ''
  arr.forEach(val => {
    if (complex && (Array.isArray(val[1]) || val[1] instanceof Object)) {
      // console.log(val[1])
      let inner = ``
      for (const k in val[1]) {
        // console.log(k, val[1])
        inner += `${val[0]}=${val[1][k]}&`
      }
      str += inner
    } else {
      str += `${val[0]}=${val[1]}&`
    }
  })
  const qs = str.substring(0, str.length - 1)
  if (qs) return has ? '?' + qs : qs
  return null
}
export const $queryParse = (string = '') => {
  if (!string) return false
  const obj = {}
  const str = string[0] === '?' ? string.substring(1) : string
  str.split('&').map(val => {
    return val.split('=')
  }).forEach(val => {
    if (val.length >= 2 && val[0]) {
      obj[val[0]] = val[1]
    }
  })
  return obj
}
// 时间处理相关函数
export const $time = (time:any, key:any | void, change:any | void):string => {
  time = time < 9999999999 ? time * 1000 : time
  let ts = time ? new Date(time) : new Date()
  // console.log(moment(time).tz('America/Los_Angeles'))
  let y = ts.getFullYear()
  let m = ts.getMonth()
  let date = ts.getDate()
  const hour = ts.getHours()
  const mm = ts.getMinutes()
  const s = ts.getSeconds()
  if (Number(key) === 1) {
    if (new Date().getFullYear() === y) {
      return `${isBig(date)}/${months(m)} ${isBig(hour)}:${isBig(mm)}:${isBig(s)}`
    } else {
      return `${isBig(date)}/${months(m)}/${y} ${isBig(hour)}:${isBig(mm)}:${isBig(s)}`
    }
  } else if (Number(key) === 2) {
    if (hour === 0 && mm === 0 && s === 0 && change === 1) {
      ts = time ? new Date(time - 1 * 60 * 1000) : new Date()
      y = ts.getFullYear()
      m = ts.getMonth()
      date = ts.getDate()
    }
    // console.log(date, m, y, hour, mm, s, time)
    // console.log(ts)
    return `${isBig(date)}/${months(m)}/${y}`
  } else if (Number(key) === 3) {
    return `${isBig(hour)}:${isBig(mm)}:${isBig(s)}`
  } else if (key === 4) {
    return `${isBig(date)}/${months(m)} ${isBig(hour)}:${isBig(mm)}`
  } else if (key === 5) {
    const isToday = (new Date().getFullYear() === y) && (new Date().getMonth() === m) && (new Date().getDate() === date)
    if (isToday) {
      return 'Hari ini'
    } else {
      if (new Date().getFullYear() === y) {
        return `${isBig(date)}/${months(m)}`
      } else {
        return `${isBig(date)}/${months(m)}/${y}`
      }
    }
  } else if (key === 6) {
    return `${y}-${isBig(m + 1)}-${isBig(date)} ${isBig(hour)}:${isBig(mm)}:${isBig(s)}`
  } else if (key === 7) {
    return `${y}-${isBig(m + 1)}-${isBig(date)}`
  } else if (key === 8) {
    return `${isBig(date)}-${isBig(m + 1)}-${y} ${isBig(hour)}:${isBig(mm)}:${isBig(s)}`
  } else if (key === 9) {
    const isToday = (new Date().getFullYear() === y) && (new Date().getMonth() === m) && (new Date().getDate() === date)
    if (isToday) {
      return 'Hari ini'
    } else {
      if (new Date().getFullYear() === y) {
        return `${isBig(date)}/${months(m)} ${isBig(hour)}:${isBig(mm)}:${isBig(s)}`
      } else {
        return `${isBig(date)}/${months(m)}/${y} ${isBig(hour)}:${isBig(mm)}:${isBig(s)}`
      }
    }
  } else if (key === 10) {
    return `${isBig(date)} ${months(m)} ${y}_${isBig(hour)}${isBig(mm)}`
  } else {
    return `${isBig(date)}/${months(m)}/${y} ${isBig(hour)}:${isBig(mm)}:${isBig(s)}`
  }
}

// 格式化金额
export const $decodeMoney = (str:string):number => {
  const _s = str.substring(str.length - 3, str.length - 1)
  const _n = str.substring(0, str.length - 3)
  let times = 0
  if (_s === 'rb') times = 1000 
  if (_s === 'jt') times = 1000000
  return Number(_n.replace(/./g, '')) * times
}
export const $random = (len = 6) => {
  const ran = Math.random() * 10000 % len
  return Math.floor(ran)
}

// 数组求和
export const $sum = (arr:Array<number> = []):number => {
  let s = 0
  arr.forEach(val => {
    if (Number(val)) {
      s += Number(val)
    } else {
      s += 0
    }
  })
  return s
}

export const $stream2Buffer = async (readableStream:Stream):Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks:Array<Buffer> = []
    readableStream.on("data", (data) => {
      const res:Buffer = data instanceof Buffer ? data : Buffer.from(data)
      chunks.push(res);
    })
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks))
    })
    readableStream.on("error", reject)
  })
}