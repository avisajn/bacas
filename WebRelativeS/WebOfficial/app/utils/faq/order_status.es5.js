const $orderStatus = function (JSONstr) {

  var info = {};
  var returnValue = ''
  try {
    var res = JSON.parse(JSONstr);
    if (res && !res.code) {
      info.state = 'ok';
      var status = Number(res.data.status);
      var subStatus = res.data.sub_status;
      if (status === 1) {
        info.content = 'wait_for_payment';
      } else if (status === 2) {
        info.content = 'payment_received';
      } else if (status === 3) {
        info.content = 'delivering';
      } else if (status === 4 && !subStatus) {
        info.content = 'delivered';
      } else if (subStatus === 601) {
        info.content = 'rejected';
      } else if ([402, 403, 404, 405, 506].indexOf(subStatus) >= 0 ) {
        info.content = 'refunded';
      } else if ([502, 503, 504, 505, 602, 603, 604, 605].indexOf(subStatus) >= 0) {
        info.content = 'canceled';
      } else if (subStatus === 606) {
        info.content = 'cancelled_due_to_timeout'
      } else {
        info.content = 'default'
      }
      returnValue = JSON.stringify(info);
    } else {
      info.state = 'error';
      returnValue = JSON.stringify(info);
    };
  } catch (error) {
    info.state = 'error';
    returnValue = JSON.stringify(info);
  }
}


// 用于js 测试
module.exports = $orderStatus