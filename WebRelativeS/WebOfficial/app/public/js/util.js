const $utils = {
  $queryParse (str) {
    const arr = str.replace('?', '').split('&')
    console.log(arr)
    const obj = {}
    arr.forEach(val => {
      if (val.includes('=')) {
        const inner = val.split('=')
        obj[inner[0]] = decodeURIComponent(inner[1])
      }
    })
    console.log(obj)
    return obj
  }
}





