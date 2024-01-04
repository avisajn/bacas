'use strict';
import moment from 'moment';
import Base from './base.js';
import DB from '../../db.js';
import fs from 'fs';

import LRU from 'lru-cache';
const cache = LRU({maxAge: 1000 * 60 * 20 });


const avatarArr = ['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg','9.jpg','10.jpg','11.jpg','12.jpg','14.jpg','15.jpg','16.jpg','17.jpg','18.jpg','19.jpg','21.jpg','22.jpg','23.jpg','24.jpg','25.jpg','26.jpg','27.jpg','28.jpg','29.jpg','30.jpg','31.jpg','32.jpg','33.jpg','34.jpg','35.jpg','36.jpg','37.jpg','38.jpg','39.jpg','40.jpg','41.jpg','42.jpg','43.jpg','44.jpg','45.jpg','46.jpg','47.jpg','48.jpg','49.jpg','50.jpg','51.jpg','52.jpg','53.jpg','54.jpg','55.jpg','56.jpg','57.jpg','58.jpg','59.jpg','60.jpg','61.jpg','62.jpg','63.jpg','64.jpg','65.jpg','66.jpg','67.jpg','68.jpg','69.jpg','70.jpg','71.jpg','72.jpg','73.jpg','84.jpg'];
const nameArr = ['Ahmad', 'Levina', 'Christina', 'Natasha', 'Lidya', 'Johan', 'Rangga', 'Dimas', 'Randy', 'Jason'];
const tempResultArr = [[-1,1,1,-1,1,-1], [1,-1,-1,-1,1,1], [1,1,1,1,1,-1], [-1,1,1,1,1,1], [-1,1,1,-1,-1,-1]];
const tempTimeArr = ['15.1','6.88','12.6','15','20','18.4','13.8'];

const db = DB.activity;

// 倔强青铜 （PK<=2次）
// 秩序白银 （PK<=4次 且 胜率>40%）
// 荣耀黄金 （PK<=6次 且 胜率>50%）
// 尊贵铂金 （PK<=8次 且 胜率>60%）
// 永恒钻石 （PK<=10次 且 胜率>70%）
// 最强王者 （PK=10次 且 胜率>90%）
// 次数和胜率都可以根据情况作出改变
const getPw = function (cs ,sl) {
    if(cs <= 2) return 'Perunggu Stubborn';  // '倔强青铜';
    if(cs <= 4 && sl>=40) return 'Silver Rangka';// '秩序白银';
    if(cs <= 6 && sl>=50) return 'Glory Emas';// '荣耀黄金';
    if(cs <= 8 && sl>=60) return 'Premier Platinum';// '尊贵铂金';
    if(cs <= 10 && sl>=70) return 'Berlian Keabadian';// '永恒钻石';
    if(cs <= 10 && sl>=90) return 'Raja Terkuat';// '最强王者';
};

const getRandom = function(min ,max){
    return parseInt(Math.random()*(max-min+1)+min,10);
}

const getFixed = function (v){
    let fixNum = new Number(v+1).toFixed(2);//四舍五入之前加1  
    return new Number(fixNum - 1).toFixed(2);
}


export default class extends Base {

    // 获取获奖名单
    // TODO : 增加memcache缓存
    async prizelistAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow) return this.fail(-1 ,'not allow'); 



        const localData = cache.get('prize-list');
        if(localData && localData.length > 0){
            return this.success(localData);
        }

        let model_film_prize = this.model('film_prize' ,db);
        const currentDateTime = moment().add(7,'h').format('YYYY-MM-DD');
        let userList = await model_film_prize
                                .alias('base')
                                .field('times cs,winning sl,total_times zys,prize_name jp,u.name xm ,u.phone sj')
                                .join('film_user u on  base.user_id=u.id')
                                .order('base.id desc').where(`base.prize_datetime>"${currentDateTime} 00:00:00" and base.prize_datetime<="${currentDateTime} 23:59:59"`)
                                .select();
        
        if(userList.length <= 0){
            // ['Ahmad', 'Levina', 'Christina', 'Natasha', 'Lidya', 'Johan', 'Rangga', 'Dimas', 'Randy', 'Jason'];
            return this.success([]);
        }else{
            let _phone = null;
            userList.map((k) => {
                _phone = k.sj;
                k.sj = _phone && _phone.substring(0,3)+' *** '+_phone.substring(_phone.length-2);
            })
        }

        cache.set('prize-list' ,userList);
        return this.success(userList);
    }
    // 获取排名信息
    async pmlistAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow) return this.fail(-1 ,'not allow'); 

        const currentDate = moment().add(7, 'h').format('MMDD');
        const currentHH = moment().add(7, 'h').format('HH');
        if(currentDate == '0824' && currentHH <= 20){
            return this.success([
                {cs:10 ,sl:100 ,zys:59 ,xm:'Jason' ,sj:'782 *** 559'},
                {cs:10 ,sl:100 ,zys:60 ,xm:'Levina' ,sj:'991 *** 574'},
                {cs:10 ,sl:100 ,zys:60.3 ,xm:'Natasha' ,sj:'079 *** 670'},
                {cs:10 ,sl:90 ,zys:62 ,xm:'Johan' ,sj:'319 *** 824'},
                {cs:10 ,sl:90 ,zys:65 ,xm:'Rangga' ,sj:'021 *** 312'},
            ])
        }
        // select b.* from film_standing b 
        // left join film_user u on u.id = b.user_id 
        // order by b.times desc,b.win desc ,b.total_time 
        // where date='0824';

        const localData = cache.get('standing-pm-'+currentDate);
        if(localData && localData.length > 0){
            return this.success(localData);
        }
        let model_film_standing = this.model('film_standing' ,db);
        let userList = await model_film_standing.field('b.times cs,b.total_time zys,b.winning sl,u.`name` mz,u.phone sj')
                        .alias('b').join('film_user u on u.id = b.user_id ').order('b.times desc,b.win desc ,b.total_time ').limit(0,20).where(`b.date='${currentDate}' and b.times<=10`).select();
        if(userList.length <= 4){
            // ['Ahmad', 'Levina', 'Christina', 'Natasha', 'Lidya', 'Johan', 'Rangga', 'Dimas', 'Randy', 'Jason'];
            userList = [
                {cs:10 ,sl:100 ,zys:59 ,xm:'Jason' ,sj:'782 *** 559'},
                {cs:10 ,sl:100 ,zys:60 ,xm:'Levina' ,sj:'991 *** 574'},
                {cs:10 ,sl:100 ,zys:60.3 ,xm:'Natasha' ,sj:'079 *** 670'},
                {cs:10 ,sl:90 ,zys:62 ,xm:'Johan' ,sj:'319 *** 824'},
                {cs:10 ,sl:90 ,zys:65 ,xm:'Rangga' ,sj:'021 *** 312'},
            ];
        }else{
            let _phone = null;
            userList.map((k) => {
                _phone = k.sj;
                k.sj = _phone && _phone.substring(0,3)+' *** '+_phone.substring(_phone.length-2);
            });
        }

        cache.set('standing-pm-'+currentDate ,userList);
        return this.success(userList);

    }

    // 获取我的信息
    // TODO : 对用户信息增加7天的缓存 
    async myinfoAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow) return this.fail(-1 ,'not allow'); 
        const { ud ,uid } = this.get();
        if(!ud && !uid) return this.fail(-1,'参数错误！');

        // 先获取用户信息
        let model_film_user = this.model('film_user' ,db);
        let user = await model_film_user.where(`k='${ud}' or id='${uid}'`).field('id,name mz,avatar tx,phone sj,address dz,isupd upd').select();
        if(user.length<=0) {
            const avatar_img = 'http://event.baca.co.id/res/a/'+avatarArr[getRandom(0,avatarArr.length-1)];
            let user_id = await model_film_user.add({
                k : ud, 
                name : '-', 
                avatar : avatar_img, 
                phone : '-', 
                address : '-',
                isupd : 0,
            });
            return this.success({
                id : user_id ,
                tx : avatar_img ,
                upd : 0,
                sj : '-',
                mz : '-'
            })
        }
        user = user[0];
        return this.success(user);
    }

    // 获取我的战绩
    // TODO : 对用户信息增加7天的缓存 
    async mystandingAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow) return this.fail(-1 ,'not allow'); 
        const { uid } = this.get();
        if(!uid) return this.fail(-1,'参数错误！');

        // 获取战绩信息
        const currentDate = moment().add(7, 'h').format('MMDD');
        let model_film_standing = this.model('film_standing' ,db);
        let record = await model_film_standing
                .field('times cs,total_time zys,winning sl,win scs')
                .where(`user_id=${uid} and date='${currentDate}'`)
                .select();
        if(record.length <= 0) return this.success({cs:0,sl:0,pw:getPw(0,0),pm:'99+'});
        record = record[0];
        // 获取排名
        const sql = `select b.i from (select (@i:=@i+1) as i,b.user_id from film_standing b,(select @i:=0) as it  where b.date='${currentDate}' and b.times<= 10 order by b.times desc ,b.win desc,b.total_time) b where b.user_id=${uid};`
        let pmInfo = await model_film_standing.query(sql);
        if(pmInfo.length > 0){
            pmInfo = pmInfo[0];
            record.pm = pmInfo.i+1;
        }
        record.pw = getPw(record.cs ,record.sl);

        return this.success(record);
    }

    // 获取我的PK记录
    // TODO : 对交战记录增加缓存
    async myrecordAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow) return this.fail(-1 ,'not allow'); 
        const { uid } = this.get();
        if(!uid) return this.fail(-1,'参数错误！');

        const localData = cache.get('ud-record-'+uid);
        if(localData && localData.length > 0){
            return this.success(localData);
        }

        let model_film_record = this.model('film_record' ,db);
        const currentDate = moment().add(7,'h').format('YYYY-MM-DD');
        let recordList = await model_film_record.field('create_user_name cnm ,create_user_avatar cav ,opponent_user_name onm ,opponent_user_avatar oav ,total_time zys ,res jg ,addtime tm').where(`create_user_id=${uid} and addtime<='${currentDate} 23:59:59' and addtime>='${currentDate} 00:00:00' `).select();
        if(recordList.length <= 0) return this.success([]);
        cache.set('ud-record-'+uid ,recordList);
        return this.success(recordList);
    }

    // 得到已经使用的题库的序号
    async gettikunotAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow) return this.fail(-1 ,'not allow'); 
        const { uid } = this.get();
        if(!uid) return this.success({'_1':1,'_2':2,'_3':3,'_4':4,'_5':5,'_6':6,'_7':7,'_8':8,'_9':9,'_10':10});
        // 先匹配已经玩过的题库，之后从没玩过的里头随机挑选一个用户
        let model_film_record = this.model('film_record' ,db);
        const currentDate = moment().add(7,'h').format('YYYY-MM-DD');
        let tiku_ids = await model_film_record.field('tiku_id').where(`create_user_id=${uid} and addtime<='${currentDate} 23:59:59' and addtime>='${currentDate} 00:00:00' `).select();
        let otherObjs = {'_1':1,'_2':2,'_3':3,'_4':4,'_5':5,'_6':6,'_7':7,'_8':8,'_9':9,'_10':10};
        if(tiku_ids.length > 0){
            tiku_ids.map(({tiku_id}) => delete otherObjs['_'+tiku_id]);
        } 
        return this.success(otherObjs);
    }

    // 得到一个题库
    async gettikuAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow) return this.fail(-1 ,'not allow'); 
        const { uid,tk:currentTikuId } = this.get();
        if(!uid || !currentTikuId) return this.fail(-1,'参数错误！');
        const currentDate = moment().add(7,'h').format('YYYY-MM-DD');
        let model_film_record = this.model('film_record' ,db);
        // 获取题库的内容
        let model_film_tiku = this.model('film_tiku' ,db);
        let tiku_info = await model_film_tiku.field('no tk_id,question_json').where(`date='${moment().add(7, 'h').format('MMDD')}' and no=${currentTikuId}`).select();
        if(tiku_info.length <= 0) return this.fail(-1,'匹配出错！');
        tiku_info = tiku_info[0];
        try{
            const question = JSON.parse(tiku_info.question_json);
            tiku_info.question_json = question;
        }catch(e){
            // 得到一个默认的题库
            return this.fail(-1,'获取问题出错！');
        }
        let order = [];
        // 根据随机数进行排序
        if(parseInt(Math.random()*10) > 5) order.push('id desc');
        if(parseInt(Math.random()*10) < 7) order.push('total_time desc');
        if(parseInt(Math.random()*10) > 5) order.push('record_json desc');
        if(parseInt(Math.random()*10) > 5) order.push('res desc');
        if(parseInt(Math.random()*10) > 5) order.push('create_user_id desc');
        if(parseInt(Math.random()*10) > 5) order.push('opponent_user_id desc');


        // 根据剩余的题库中，随意选一个对手
        let opponent =  await model_film_record.field('create_user_id oid ,create_user_name onm,create_user_avatar oav,record_json jg,total_time zys')
                                .where(`create_user_id!=${uid} and tiku_id=${currentTikuId} and addtime<='${currentDate} 23:59:59' and addtime>='${currentDate} 00:00:00'`)
                                .order(order.join(',')).select();
        if(opponent.length <= 5){
            // 随机生成一个对手
            opponent = {
                oid : getRandom(1,20),
                onm : nameArr[getRandom(0,nameArr.length-1)],
                oav : 'http://event.baca.co.id/res/a/' + (avatarArr[getRandom(0,avatarArr.length -1)]),
                jg : tempResultArr[getRandom(0,tempResultArr.length-1)],
                zys : getRandom(6,25)+'.'+getRandom(1,9),
            }
        }else{
            opponent = opponent[0];
            opponent.jg = JSON.parse(opponent.jg);
        }
        return this.success({
            tiku_info,opponent
        });
    }

    // 提交一个PK战绩
    async pstadingAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow || this.method!='post') return this.fail(-1 ,'not allow');
        const { 
            tk:currentTikuId ,  // 题库ID
            cid:create_id ,     // 提交者的用户ID
            cnm:create_name ,   // 提交者的姓名
            cvt:create_avatar , // 提交者的头像

            aid:opponent_id ,   // 对手的id
            anm:opponent_name , // 对手的姓名
            avt:opponent_avatar, // 对手的头像

            zys:total_time ,    // 总用时
            jgjson:record_json, // 结果JSON
            jg:res ,            // 结果：胜负
        } = this.post();


        if(!currentTikuId||!create_id||!create_name||!create_avatar||!opponent_id||!opponent_name||!opponent_avatar||!total_time||!record_json||!res) return this.fail(-1,'参数错误！');

        const currentDate = moment().add(7, 'h').format('MMDD');

        let model_film_record = this.model('film_record' ,db);
        let model_film_standing = this.model('film_standing' ,db);
        // 向记录表中插入一条记录
        const record_id = await model_film_record.add({
            tiku_id : currentTikuId, // 题库ID
            create_user_id : create_id, // 发起用户ID
            create_user_name : create_name, // 发起用户姓名
            create_user_avatar : create_avatar, // 发起用户头像
            opponent_user_id : opponent_id, // PK的用户ID
            opponent_user_name : opponent_name, // PK的用户姓名
            opponent_user_avatar : opponent_avatar, // PK的用户头像
            total_time : total_time, // 总用时
            record_json : record_json, // 战绩JSON串 : [对，错，对，对，错，错]
            res : res, // 结果：胜负
        });

        // 向战绩表中插入修改一条记录
        let oldStanding = await model_film_standing.where(`user_id=${create_id} and date='${currentDate}'`).select();
        if(oldStanding.length <= 0){
            // 先判断是否存在，如果不存在则增加
            await model_film_standing.add({
                user_id : create_id , // 用户ID
                times : '1' , // 参与次数
                total_time : total_time , // 累计用时
                winning : (res=='1'?'100':'0') , // 胜率
                date : currentDate ,// 所属日期
            });
        }else{
            // 有的话，拿出过去的，然后修改其值
            oldStanding = oldStanding[0];
            console.log('oldStanding',oldStanding);
            let win_times = oldStanding.win + (res=='1'?1:0);
            let total_times = ( parseInt(oldStanding.times)+1 );
            await model_film_standing.where(`id=${oldStanding.id}`).update({
                times : total_times,
                total_time : ( parseFloat(oldStanding.total_time)+parseFloat(total_time) ),
                winning : getFixed(parseFloat(win_times/total_times))*100,
                win : win_times
            });
        }
        cache.del('ud-record-'+create_id);
        return this.success('提交成功！');
    }

    // 提交一个用户信息
    async pinfoAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow || this.method!='post') return this.fail(-1 ,'not allow');
        let { 
            uid:user_id ,   // 用户ID
            ud:udKey ,      // 用户的KEY
            nm:name ,       // 姓名
            av:avatar ,       // 头像
            ph:phone ,      // 手机号
            ad:address ,    // 地址
            d:pupd
        } = this.post();
        if(!name||!phone||!address) return this.fail(-1,'参数错误！');
        if(!user_id){
            if(!udKey || !avatar) return this.fail(-1,'参数错误！');
        }
        let model_film_user = this.model('film_user' ,db);
        if(user_id){
            const updParam = {
                name : name,
                phone : phone, 
                address : address,
                isupd : 1,
            };
            if(pupd == '-1' || pupd == -1){
                updParam['isupd'] = 0;
            }
            let upds = await model_film_user.where(`id=${user_id} and isupd=0`).update(updParam);
            if(upds == 0) return this.fail(-1, '不能再次修改了！');
        }else{
           user_id = await model_film_user.add({
                k : udKey, 
                name : name, 
                avatar : avatar, 
                phone : phone, 
                address : address, 
                isupd : 0,
            });
        }
        cache.del('ud-info-'+user_id);
        return this.success({
            id : user_id ,
            msg : '提交成功'
        });
    }

    // 修改用户头像
    async pavatarAction(){
        return this.fail(-1 ,'not allow'); 
        if(!this.allow || this.method!='post') return this.fail(-1 ,'not allow');
        let {uid:user_id , av:avatar } = this.post();
        if(!user_id||!avatar) return this.fail(-1,'参数错误！');
        let model_film_user = this.model('film_user' ,db);
        let upds = await model_film_user.where(`id=${user_id}`).update({avatar : avatar });
        if(upds != 1) return this.fail(-1, '修改失败！');
        cache.del('ud-info-'+user_id);
        return this.success('提交成功！');
    }






}   