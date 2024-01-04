const forwardTimes = []
let tag = false
let pretime = null
let page = null


// 确认离开
const handleLeave = function () {
   try {
    MokkayaAndroid.closeWebWindow()
  } catch (error) {
    window.close()
  }
  gtag('event', 'popup_show', { type: 'popup', click_type: 'click', click_resulr: 'yes', about: 'survey_callbak', survey_id: document.querySelector('.survey_id').innerText})
}


// 取消离开
const handleCancel = function () {
  const innerModel = document.querySelector('.inner_model')
  document.body.removeChild(innerModel)
  gtag('event', 'popup_show', { type: 'popup', click_type: 'click', click_resulr: 'cancel', about: 'survey_callbak', survey_id: document.querySelector('.survey_id').innerText})
}

// 数据key - value 转换
const handleFormatData = (e) => {
  const data = {}
  data.age_range = Number(e['Age range'])
  data.online_sales_experience = Number(e['online sales experience'])
  data.online_yes_sale_long = Number(e['online yes how long'])
  data.online_yes_sale_value = Number(e['online yes how much'])
  data.online_no_sale_value = Number(e['online no how much'])
  data.offline_sales_experience = Number(e['offline sales experience'])
  data.offline_yes_sale_time = Number(e['offline yes how long'])
  data.offline_yes_sale_value = Number(e['offline yes how much'])
  data.offline_no_sale_value = Number(e['offline no how much'])
  data.job = Number(e['Occupation'])
  data.province_id = Number(e['Geographic location'])
  data.city_id = e['city']
  data.district_id = e['district']
  const res = {}
  for (let i in data) {
    if (!isNaN(data[i])) {
      res[i] = data[i]
    }    
  }
  res.categories = e['category'].join(',')
  return res
}

//表单提交
const handleLocalData = function () {
  const { [forwardTimes.length - 1]: {times} } = forwardTimes
    const { [times.length - 1]: [start, end] } = times
    forwardTimes.push({ currentPage: forwardTimes.length + 1, times: [[end, +new Date()]] })
    const count_time = forwardTimes.map(item => {
      const total_time = item.times.flatMap(([start, end]) => [end - start]).reduce((prev, current) => {
        return prev + current
      }, 0)
      return { currentPage: item.currentPage, totalSeconds: `${total_time / 1000}` }
    })
  const duration = count_time.map(({ totalSeconds }) => totalSeconds ).join(',')
  return {
    type: 'survey',
    about: 'submit',
    count_time: duration
  };
}


// 提交数据
const handleSubmit = async function (formation) {
  // console.log(data)
  const data = handleFormatData(formation)
  const headers = {}
  try {
    const userInfo = MokkayaAndroid.getLoginUserInfo()
    const user = JSON.parse(userInfo)
    headers["X-UserId"]  = user.userId
    data.reseller_id = user.userId
    headers.Authorization = user.idToken
  } catch (error) {
    headers["X-UserId"] = localStorage.getItem('user_id')
    data.reseller_id = localStorage.getItem('user_id')
    headers.Authorization = localStorage.getItem("Authorization")
  }
  return await axios({
    headers,
    method: 'post',
    url: `${document.querySelector('.requst_url').innerText}/api/v1/user_question`,
    data
  })
}

const handleStatus = async () => {
  const headers = {}
  try {
    const userInfo = MokkayaAndroid.getLoginUserInfo()
    const user = JSON.parse(userInfo)
    headers["X-UserId"]  = user.userId
    headers.Authorization = user.idToken
  } catch(error) {
    headers["X-UserId"]  = localStorage.getItem('user_id')
    headers.Authorization = localStorage.getItem("Authorization")
  }
  return await axios({
    url: `${document.querySelector('.requst_url').innerText}/api/v1/show_question`,
    headers,
    method: 'get',
  })
}

window.onload = async function () {
  const surveyStatus = await handleStatus()
  // console.log(surveyStatus)
  window.completeSurvey  = false
  const createdCurrentTime = new Date().getTime()
  if (surveyStatus.data.success && surveyStatus.data.data) {
    document.querySelector('.loading').style.display = 'none'
    Survey.surveyStrings.completeText = 'Submit'
    Survey.surveyStrings.pageNextText = 'Selanjutnya'
    Survey.surveyStrings.pagePrevText = 'Kembali'
    Survey.surveyStrings.requiredError = 'wajib dijawab'
    Survey.surveyStrings.optionsCaption = 'pilih...'
    const defaultThemeColors = Survey.StylesManager.ThemeColors["default"]
    defaultThemeColors["$main-color"] = "#FF3B6D"
    defaultThemeColors["$main-hover-color"] = "#FF3B6D"
    defaultThemeColors["$text-color"] = "#4a4a4a"
    console.dir(Survey.StylesManager)
    Survey.StylesManager.ThemeCss['.sv_main.sv_default_css input[type="button"]'] = 'font-size: 15px; padding: 0; border-radius: 5px; width: 140px; max-width: 45%; height: 40px;'
    Survey.StylesManager.ThemeCss['.sv_main.sv_default_css .sv_body'] = ' margin-bottom: 68px;'
    Survey.StylesManager.ThemeCss['.sv_main.sv_default_css .sv_nav'] = 'position: fixed; bottom: 0; left: 0; width: calc(100% - 100px); margin-top: 68px; padding: 1em 50px; background: #fff;'
    Survey.StylesManager.applyTheme()
    const info = document.querySelector('#data-info').innerText
    const json = JSON.parse(info)
    window.survey = new Survey.Model(json)
    survey.render("surveyElement");
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
            return
          }
          const len = forwardTimes[currentPage - 2].times.length - 1
          const preTime = forwardTimes[currentPage - 2].times[len][1]
          const item = forwardTimes.findIndex(item => item.currentPage === currentPage)
          if (item !== -1) {
            forwardTimes[item].times.push([preTime, +new Date()])
            return
          }
          forwardTimes.push({
            currentPage,
            times:[[preTime,+new Date()]]
         })
        }    
        gtag('event', 'button_click', { type: 'survey', about: isNextPage ? 'next' : 'prev' })
      } else {
        tag = true
        pretime = +new Date()
        page = currentPage
        gtag('event', 'button_click', { type: 'survey', about: isNextPage ? 'next' : 'prev' })
      }
    });
    
    window.survey.onComplete.add(function (sender) {
      document.querySelector('.loading').style.display = 'flex'
      handleSubmit(sender.data).then(res => {
        // console.log(res)
        if (res.data.success) {
          document.querySelector('#surveyResult').innerHTML = `<div style="padding: 100px 20px; line-height: 22px; color: #333; text-align: center;">Terimakasih atas jawabanmu. Kupon sudah tersedia di akunmu.</div>`
          gtag('event', 'button_click', {result: 'success', survey_id: document.querySelector('.survey_id').innerText, ...handleLocalData()})
        } else {
          document.querySelector('#surveyResult').innerHTML = `<div style="padding: 100px 20px; line-height: 22px; color: #333; text-align: center;">Submit gagal. Coba lagi.${JSON.stringify(res.data)}</div>`  
          gtag('event', 'button_click', {result: 'fail', fail_reason: res.data.msg, survey_id: document.querySelector('.survey_id').innerText, ...handleFormatData()})
          // gtag('event', 'fel_error_log', { type: 'error survey submit', msg: res.data.msg })
        }
        return res.data.success
      }).then(res => {
        window.completeSurvey = true
        document.querySelector('.loading').style.display = 'none'
        if (res) {
          setTimeout(() => {
            window.appGoBack() 
          }, 2000)
        }
      }).catch(err => {
        console.log(err)
        window.completeSurvey = true
        document.querySelector('.loading').style.display = 'none'
        document.querySelector('#surveyResult').innerHTML = `<div style="padding: 100px 20px; line-height: 22px; color: #333; text-align: center;">Submit gagal. Coba lagi.</div>`
      })
    })
    gtag('event', 'page_show', { type: 'survey' , about: 'profit', survey_id: document.querySelector('.survey_id').innerText})
  } else {
    window.completeSurvey = true
    document.querySelector('.loading').style.display = 'none'
    document.querySelector('#surveyResult').innerHTML = `<div style="padding: 100px 20px; line-height: 22px; color: #333; text-align: center;">Anda telah berpartisipasi.</div>`
    gtag('event', 'page_show', { type: 'survey' , about: 'has_done', survey_id: document.querySelector('.survey_id').innerText})
  }

}

window.appGoBack = function () {
  if (window.completeSurvey) {
     try {
      MokkayaAndroid.closeWebWindow()
    } catch (error) {
      window.close()
    }
  } else if (document.querySelector('.inner_model') || document.querySelector('.loading').style.display !== 'none') {
    return false
  } else {
    const innerModel = document.createElement('div')
    innerModel.setAttribute('class', 'inner_model')
    innerModel.setAttribute('style', 'position: fixed; width: 100%; height: 100%; z-index: 99; left: 0; top: 0; background: rgba(0, 0, 0, 0.5);display: flex; justify-content: center; align-items: center;')
    innerModel.innerHTML = `
      <div class="model_wiondow" style="font-family: Roboto, Roboto-Regular; width: 100%; margin: 0 8%; padding: 4%; background: #fff; border-radius: 12px;">
        <div style="display: flex; justify-content: center; align-items: center; padding-bottom: 20px;;">
          <img style="width: 157px;" src="/public/img/survey/back.png" alt="">
        </div>
        <div style="line-height: 22px; text-align: center; margin-bottom: 21px;">Tinggal selangkah untuk meraih kupon, yakin mau kembali?</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button onclick="handleLeave()" style="outline:none; width: 130px; height: 40px; margin: 0; padding: 0; border:1px solid #e1e1e1; border-radius: 20px; background: none;color: #8d8d8d;">Ya, kembali</button>
          <button onclick="handleCancel()" style="outline:none; width: 130px; height: 40px; margin: 0; padding: 0; border:1px solid #FF3F59; border-radius: 20px; background: #FF3F59;color: #fff;">Lanjut jawab</button>
        </div>
      </div>
    `
    innerModel.ontouchmove = function (e) {
      e.stopPropagation()
    }
    document.body.appendChild(innerModel)
    gtag('event', 'popup_show', { type: 'popup', click_type: 'back' , about: 'survey_callbak', survey_id: document.querySelector('.survey_id').innerText})
  }
}






