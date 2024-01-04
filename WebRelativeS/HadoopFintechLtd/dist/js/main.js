

const url = 'http://idcrawler.vm.newsinpalm.net/hadoop/api/user'
// const url = 'http://localhost:8360/hfoy/user';

$(function () {
  $('#submit').click(function () {
    Form.submit();
  })
});

const List = (function () {
  const $table = $('#tableGrid');

  const loadItem = function (i ,k) {
    const html = [];
    html.push('<tr>');
    html.push('  <th>'+k.username+'</th>');
    html.push('  <td>'+k.email+'</td>');
    html.push('  <td>'+(k.apikey||'')+'</td>');
    html.push('  <td>'+k.demand+'</td>');
    html.push('</tr>');
    return html.join('');
  },

  loadHtml = function(data) {
    const html = [];
    if(data.length <= 0) return '';
    for(var i=0,len=data.length;i<len;i++){
      html.push(loadItem(i+1 ,data[i]));
    }
    $table.html(html.join(''));
  }

  $.ajax({ url: url+'/get' ,type:'get', success: function(e){
    if(e && e.errno >= 0){
      loadHtml(e.data);
    }
  }});

  return {
    reloadList : function () {
      $.ajax({ url: url+'/get' ,type:'get', success: function(e){
        if(e && e.errno >= 0){
          loadHtml(e.data);
        }
      }});
    }
  }


}());


const Form = (function(){
  const $inputs = $('[id^=form_]');
  const $name = $('#form_username');
  const $email = $('#form_email');
  const $password = $('#form_password');

  const verify = function(){  // 验证
    const _name = $name.val();
    if(!_name){
      $name.addClass('input-error');
      return false;
    }else $name.removeClass('input-error');

    const _email = $email.val();
    if(!_email){
      $email.addClass('input-error');
      return false;
    }
    var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if(!myreg.test(_email) && 1==2) {
      layer.open({content: '邮箱错误 ' ,skin: 'msg'});
      $email.addClass('input-error');
      return false;
    }else $email.removeClass('input-error');

    return {
      username : _name ,
      email : _email ,
      t : $password.val() || ''
    };
  }


  return {
    submit : function(){
      const param = verify();
      if(!param) return;
      const _index = layer.open({type: 2});
      $.ajax({ url: url+'/reg' ,type:'POST' ,data:param, success: function(e){
        layer.closeAll();
        if(e.errno <0 || e.errmsg){
            //信息框
            layer.open({content: '出现错误了： '+e.errmsg ,skin: 'msg'});
            return;
        }
        List.reloadList();
        console.log('e:',e);
        // alert('Submitted successfully');
      }});
    }
  }
}());