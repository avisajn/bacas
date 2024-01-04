// const COUNT_TIME = []
// const durationTime = initializeTime => completeTime => {
//   COUNT_TIME.push([initializeTime,completeTime])
// }
const forwardTimes = []
let tag = false
let pretime = null
let page = null
window.survey.onCurrentPageChanged.add(function(data,{ isNextPage }) {
  const { lastVisibleIndex: currentPage } = survey.currentPage
  if (isNextPage) {
    if (currentPage === 1 && !tag) {
      forwardTimes.push({
        currentPage,
        times:[[createdCurrentTime,+new Date()]]
     })
    } else {
      if (tag) {
        forwardTimes[page].times.push([pretime, +new Date()])
        tag = false
        console.log(forwardTimes);
        return
      }
      const len = forwardTimes[currentPage - 2].times.length - 1
      const preTime = forwardTimes[currentPage - 2].times[len][1]
      const item = forwardTimes.findIndex(item => item.currentPage === currentPage)
      if (item !== -1) {
        forwardTimes[item].times.push([preTime, +new Date()])
        console.log(forwardTimes);
        return
      }
      forwardTimes.push({
        currentPage,
        times:[[preTime,+new Date()]]
     })
    }    
    console.log(forwardTimes);
  } else {
    tag = true
    pretime = +new Date()
    page = currentPage
    // if (!tag) {
    //   const perCurrentTime = +new Date()
    // }
    // const {[forwardTimes[currentPage].times.length - 1]: [start,end]} = forwardTimes[currentPage].times
    // forwardTimes[currentPage].times.push(end,)
    // backTimes.push({
    //   currentPage: currentPage + 1,
    //   times: [+new Date()]
    // })
    // // backTimes.page = currentPage + 1
    // // backTimes.times = [...backTimes.times || [], +new Date()]
    // console.log(backTimes);
  }
  //表单提交
  function handleLocalData () {
    const { [forwardTimes.length - 1]: {times} } = forwardTimes
      const { [times.length - 1]: [start, end] } = times
      forwardTimes.push({ currentPage: forwardTimes.length + 1, times: [[end, +new Date()]] })
      console.log(forwardTimes);
      const count_time = forwardTimes.map(item => {
        const total_time = item.times.flatMap(([start, end]) => [end - start]).reduce((prev, current) => {
          return prev + current
        }, 0)
        return { currentPage: item.currentPage, totalSeconds: `${total_time / 1000}s` }
      });
    //count_time:[{currentPage:1,totalSeconds:1.5s},{currentPage:2,totalSeconds:2.5s}]
    const question_id = count_time.map(({ currentPage }) => currentPage ).join(',')
    const duration = count_time.map(({ totalSeconds }) => totalSeconds ).join(',')
    return {
      type: 'survey',
      about:'submit',
      count_time:{question_id,duration}
    };
  }
  // if (isNextPage && tag) {
  //   console.log(currentPage);
  //   forwardTimes.set(currentPage,+new Date())
  //     console.log(forwardTimes.entries());
  // } else {
  //   tag = false
  //   const backTimes = new Map(forwardTimes)
  //   if (isNextPage) {
  //     backTimes.set(currentPage, +new Date())
  //     console.log(backTimes.entries());
  //     return
  //   }
    
  //   backTimes.set(currentPage + 1, +new Date())
  //   console.log(backTimes.entries());
  
    // if (backTimes.has(currentPage + 1)) {
    //   backTimes.set(currentPage + 1,+new Date())
    // }
      // console.log(currentPage + 1);
      // timesArray.splice(currentPage)
      // console.log(timesArray);
    // }
  });



      
