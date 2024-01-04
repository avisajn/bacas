// require('moment')
import Numeral from 'numeral'


const allLetter:Array<string> = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'Y', 'z',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
]

const isBig = (str:number) => {
  return str >= 10 ? str : '0' + str
}
const months = (str:number) => {
  // console.log(str)
  const ms = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return str ? ms[str] : ms[0]
}

const $quary = (obj:any | Array<any> = {}, prefix:string = '?'):string => {
  const q:Array<any> = []
  for (const item in obj) {
    q.push([item, obj[item]])
  }
  const ast:string = q.map(val => {
    return val.join('=')
  }).join('&')
  return prefix + ast
}
const $queryParse = (stringQuery:string = ''):any => {
  if (!stringQuery) return false
  const obj:any = {}
  const str = stringQuery[0] === '?' ? stringQuery.substring(1) : stringQuery
  str.split('&').map(val => {
    return val.split('=')
  }).forEach((val:Array<any>) => {
    if (val.length >= 2 && val[0]) {
      obj[val[0]] = val[1]
    }
  })
  return obj
}
const $encodeMoney = (num:number, small:boolean):string  => {
  if (small) {
    return Numeral(num).format('0,0').replace(/,/g, '.')
  } else {
    if (num >= 1000 && num < 1000000) {
      const _n = num / 1000
      return Numeral(_n).format('0,0').replace(/,/g, '.') + 'rb'
    } else if (num >= 1000000) {
      const _n = num / 1000000
      const numArr = _n.toString().split('.')
      if (numArr.length === 1) {
        return Numeral(_n).format('0,0').replace(/,/g, '.') + 'jt'
      } else {
        const numStr = Number(numArr[1][0]) ? numArr[0] + '.' + numArr[1][0] : numArr[0]
        const res = Numeral(numStr).format('0,0.0').replace(/,/g, '.')
        const point = res.lastIndexOf('.')
        const resArr = res.split('')
        resArr[point] = ','
        return resArr.join('') + 'jt'
      }
    } else {
      return Numeral(num).format('0,0').replace(/,/g, '.')
    }
  }
}

const $randomStr = (len = 6) => {
  const arr = []
  for (let i = 0; i <= len - 1; i++) {
    const index = Math.floor(Math.random() * 10000 % allLetter.length)
    arr.push(allLetter[index])
  }
  return arr.join('')
}

const $decodeMoney = (str:string):number => {
  const _s = str.substring(str.length - 3, str.length - 1)
  const _n = str.substring(0, str.length - 3)
  let times = 0
  if (_s === 'rb') times = 1000 
  if (_s === 'jt') times = 1000000
  return Number(_n.replace(/./g, '')) * times
}
const $random = (len = 6) => {
  const ran = Math.random() * 10000 % len
  return Math.floor(ran)
}
const $time = (time:any, key:any, change:any) => {
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
const $native = async (target = 'JAVE_FUNC_NAME', data = {}) => {
  // if (window.pushState) {}
}
const $appgoback = () => { }
const $copy = async (str = 'copy info') => { }
const $uaVersion = (ua:any) => {
  const arr = ua || navigator.userAgent.split(' ')
  let version = ''
  arr.forEach((val:string) => {
    if (/chrome/i.test(val)) version = val
  })
  if (version) {
    return Number(version.split('/')[1].split('.')[0])
  } else {
    return false
  }
}
const $timezone = (timestemp = new Date().getTime(), format = false, timezone = 9, change = false) => {
  // console.log("东8区现在是：" + timestemp)
  // let offset = new Date().getTimezoneOffset()
  // console.log(offset)
  const nowDate = new Date(timestemp).getTime()
  const targetDate = new Date(nowDate)
  // console.log(`东${timezone}区现在是：` + targetDate.getTime())
  if (!format) return targetDate.getTime()
  return $time(targetDate.getTime(), format, change)

}

const $encodeFirebase = function (obj:any = {}, len:number = 50, sip:void |string = '_') {
	const res:any = {}
	for (const i in obj) {
		if (obj[i] && obj[i].length && obj[i].length > len) {
			const wrapTik:string = '^'
			obj[i].split('').map((val:string, index:number) => {
        if (index !== 1 && (index - 1) % len === 0) {
          val += wrapTik
        }
        return val
      }).join('').split(wrapTik).forEach((val:string, index:number) => {
				const tag = i + sip + (index + 1)
				res[tag] = val
			})
		} else {
			res[i] = obj[i]
		}
	}
	return res
}

const $decodeFirebase = function (obj:any = {}, sip = '_') {
	const reg = new RegExp(`.+${sip}[0-9]+$`)
	const res:any = {}
	Object.entries(obj).forEach(val => {
		if (reg.test(val[0])) {
			const _k = val[0].slice(0, val[0].lastIndexOf(sip))
			res[_k] ? res[_k].push(val[1]) : res[_k] = [val[1]]
		} else {
			res[val[0]] = val[1]
		}
	})
	for (const i in res) {
		if (res[i].isArray()) {
			res[i] = res[i].join('')
		}
	}
	return res
}

const $group = (arr:Array<any>, swrg:any) => {
  if (Array.isArray(arr) && arr.length) {
    return false
  } else {
    let muArr:Array<any> = []
    if (typeof swrg === 'number') {
      arr.forEach((val, index) => {
        if (index % swrg === 0) {
          muArr.push([val])
        } else {
          muArr[muArr.length - 1].push(val)
        }
      })
    } else if (typeof swrg === 'string') {
      const obj:any = {}
      arr.forEach(val => {
        if (obj[val.swrg]) {
          obj[val.swrg].push(val)
        } else {
          obj[val.swrg] = [val]
        }
      })
      muArr = Object.values(obj)
    }
    return muArr
  }
}


const $sim = (position:any = null) => {
  const obj = $queryParse(window.location.search)
  if (obj.sim) {
    const arr = obj.sim.split('.')
    if (position) {
      return arr[position]
    } else {
      return null
    }
  } else {
    return false
  }
}

const $color = (str:string, neednot:boolean) => {
	const haxColors = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
	const _s = str.toLowerCase()
	if (_s.length !== 6 ) return false
  const _a = _s.split('')
	if (_a.filter(val => haxColors.includes(val)).length === 6) {
		const arr:Array<any> =[]
		_a.forEach((val, index) => {
			if (index % 2 === 0) {
				arr.push([val])
			} else {
				arr[arr.length - 1].push(val)
			}
    })
    const rgb = arr.map(val => parseInt(val.join(''), 16).toString(10)).join(',')
		return neednot ? rgb :`rgb(${rgb})`
	} else {
		return false
	}
}



const $numberId = () => {
  const userId:string = localStorage.getItem('user_id') || ''
  let s = 0
  userId.split('').forEach(val => {
    s += val.charCodeAt(0)
  })
  return s
}

const $sum = (arr = []) => {
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

const $utils = {$random, $time, $native, $appgoback, $copy, $uaVersion, $timezone, $quary, $queryParse, $encodeMoney, $decodeMoney, $encodeFirebase, $decodeFirebase, $group, $sim, $color, $randomStr, $numberId, $sum }

export default $utils;
