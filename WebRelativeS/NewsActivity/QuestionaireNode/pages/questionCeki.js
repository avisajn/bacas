export const CekiHtmlPage = ({ header, json, content }) => {
    return `
    <!DOCTYPE html>
<html>

<head>
    <title>
       Questionnaire CekiCeki
    </title>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://unpkg.com/jquery"></script>
    <script src="https://surveyjs.azureedge.net/1.5.5/survey.jquery.js"></script>
    <link href="https://surveyjs.azureedge.net/1.5.5/survey.css" type="text/css" rel="stylesheet" />
    <script src="https://cdn.bootcss.com/layer/3.0.3/mobile/layer.js"></script>
    <style type="text/css"></style>
</head>

<body>
    <div id="surveyElement"></div>
    <div id="surveyResult"></div>
    <script type="text/javascript">
    Survey.StylesManager.applyTheme("default");

    var json = ${json}
    window.survey = new Survey.Model(json);
    window.config = this.initParams.apply(window);

    survey.onComplete.add(function(result) {
        config['result'] = result.data;
        result.data && postAction(config);

    });

    $("#surveyElement").Survey({
        model: survey,
    });

    //method
    function initParams() {
        window.param = {
            xuserid: '',
            xusertoken: '',
            xinvitecode: '',
            xpackage: '',
            eventid: '',
            origin: ''
        }
        
        alert(JSON.stringify(${header}))
        alert(JSON.stringify(${header}['x-user-token']))
        alert(JSON.stringify(${header}['x-user-id']))
        alert(JSON.stringify(${header}['x-invite-code']))
        alert(JSON.stringify(${header}['x-app-package-id']))


        this.param.xusertoken = ${header}['x-user-token']
        this.param.xuserid = ${header}['x-user-id'];
        this.param.xinvitecode = ${header}['x-invite-code'] 
        this.param.xpackage = ${header}['x-app-package-id']

        this.param.origin = this.getQueryString('origin');
        this.param.eventid = this.getEventId();
        return param;
    }

    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        return r ? unescape(r[2]) : null;
    }

    function getEventId() {
        let url = window.location.href;
        return "0511ce96-0bef-419c-83a8-d83c8b8a8b23";
    }

    function postAction(data) {
        var cekiHeader = {
            "Content-Type": "application/json"
        }
        var uniqueCode = { user_id: data.xuserid }
        var cekiApi = 'https://flashgo.online/sales/home/questionnaires/user'
        let requestOptionsCek = {
            type: "post",
            url: cekiApi,
            data: JSON.stringify(uniqueCode),
            dataType: 'json',
            headers: cekiHeader,
            success: function(res) {},
            error: function(error) {}
        };
        let requestHeader = {
            "x-user-id": data.xuserid + '___' + data.xpackage,
            "x-user-token": data.xusertoken,
            "x-invite-code": data.xinvitecode,
            "X-App-Package-Id": data.xpackage,
            "Content-Type": "application/json"
        };
        data.result.origin = data.origin //  push/banner

        let postUrl = 'https://api.baca.co.id/api/v1/non-app/questionaire/' + data.eventid;
        let requestOptions = {
            type: "post",
            url: postUrl,
            data: JSON.stringify(data.result),
            dataType: 'json',
            headers: requestHeader,
            success: function(res) {
                if (res && res.errorno == 0) {
                    var coin = res.data.extraCoin;
                    let tip = 'Terimakasih atas partisipasi Anda!'; //提交成功
                    message(tip, 'OK', true, false);
                }
            },
            error: function(error) {
                if (error.status == 410) { //活动已结束
                    let tip = 'Oh, tugas telah berakhir. Nantikan yang berikutnya!';
                    message(tip, 'OK', true, false);
                } else if (error.status == 409) { //已经做过该活动            
                    let tip = 'Anda telah menyelesaikan tugas ini! Sampai ketemu lain waktu!';
                    message(tip, 'OK', true, false);
                }
                let tip = 'Gagal mengirim, silahkan coba lagi'; //提交失败
                message(tip, 'OK', true, true);
                console.log(error);
            }
        };
        $.ajax(requestOptionsCek);

        $.ajax(requestOptions);
    }

    function uniCode(data) {

    }

    function message(desc, btnText, isNeedBack, isShadeClose) {
        var _self = this;
        var index = layer.open({
            content: desc,
            shadeClose: isShadeClose,
            // btn: [btnText],
            yes: function() {
                isNeedBack && _self.toApp();
            }
        })
    }

    function toApp() {
        //fg暂不支持
        // BacaAndroid.goBackToApp();
    }
    </script>
</body>

</html>
  `;
};