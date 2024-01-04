<template>
  <div class="full">
    <step-page :dataSource="optionData" :stepConfig="config" @change="selectedFn"></step-page>
  </div>
</template>
<script>
export default {
  name: "StepMainPage",
  data() {
    return {
      config: {
        total: 7,
        currStepIndex: 1,
        description: '',
        selectedValue: '',
      },
      optionData: [],
      dataArray: [],
      stepDataSource: [{ //1
          desc: 'KAMU LEBIH SERING BERMAIN SEPERTI APA?',
          options: [
            { label: '1,5', letter: 'A', text: 'Solo' },
            { label: '3,2', letter: 'B', text: 'Duo' },
            { label: '4,6,7', letter: 'C', text: 'Squad' },
          ]
        },
        { //2
          desc: 'DI MANA TEMPAT MENDARAT FAVORITMU?',
          options: [
            { label: '1', letter: 'A', text: 'Di tengah peta apa saja' },
            { label: '6,7', letter: 'B', text: 'Daerah kota' },
            { label: '2,3,4', letter: 'C', text: 'Daerah terpencil' },
            { label: '8,5', letter: 'D', text: 'Pantai' }
          ]
        },
        { //3
          desc: 'APA SENJATA ANDALANMU?',
          options: [
            { label: '6,4', letter: 'A', text: 'Assault Rifle' },
            { label: '1,3', letter: 'B', text: 'Sniper Rifle' },
            { label: '2,7', letter: 'C', text: 'Machine Gun' },
            { label: '8', letter: 'D', text: 'Granat' },
            { label: '5,8', letter: 'E', text: 'Panci & tinju' }
          ]
        }, { //4
          desc: 'BAGAIMANA STRATEGI BERMAIN FAVORITMU?',
          options: [
            { label: '3,4', letter: 'A', text: 'Ngendok di dalam rumah' },
            { label: '1,2,3', letter: 'B', text: 'Ngumpet di semak, pohon, dan batu' },
            { label: '8,7', letter: 'C', text: 'Selalu naik kendaraan' },
            { label: '7,6,5', letter: 'D', text: 'Baku tembak jarak dekat' },
            { label: '4,6', letter: 'E', text: 'Jaga jarak dari musuh' }
          ]
        },
        { //5
          desc: 'AIR DROP DATANG, YUK SAMPERIN?',
          options: [
            { label: '6,7', letter: 'A', text: 'Kuy lah segera!' },
            { label: '4', letter: 'B', text: 'Jangan woi, bahaya' },
            { label: '3,1', letter: 'C', text: 'Analisa situasi dulu baru putuskan' },
            { label: '2,8', letter: 'D', text: 'Mana lokasinya?' },
            { label: '5', letter: 'E', text: 'Gak butuh!' }
          ]
        }, { //6
          desc: 'LEBIH SERING KEBAGIAN PERAN APA DALAM TIM?',
          options: [
            { label: '1', letter: 'A', text: 'Marksman - Jarak menengah' },
            { label: '7', letter: 'B', text: 'Breacher - Ujung tombak terdepan' },
            { label: '2,3', letter: 'C', text: 'Sniper - Jarak jauh' },
            { label: '6', letter: 'D', text: 'Medic - Support' },
            { label: '4,8', letter: 'E', text: 'Bebas mau ngapain aja' }
          ]
        }, { //7
          desc: 'APA PRIORITASMU KETIKA BERMAIN?',
          options: [
            { label: '1,2', letter: 'A', text: 'Wajib dapat Booyah' },
            { label: '7', letter: 'B', text: 'Fokus kejar musuh yang nyebelin' },
            { label: '3', letter: 'C', text: 'Kemenangan tim adalah yang utama' },
            { label: '8,6', letter: 'D', text: 'Yang penting hepi!' },
            { label: '4,5', letter: 'E', text: 'Main iseng aja' }
          ]
        },
        //  {//1
        //   desc:'你喜欢怎么玩',
        //   options:[
        //    {label:'1,5',letter:'A',text:'单人'},
        //    {label:'3,2',letter:'B',text:'双人'},
        //    {label:'4,6,7',letter:'C',text:'组队'},
        //   ]
        // },
        //  {//2
        //    desc:'选择一个你喜欢的降落地点',
        //    options:[
        //    {label:'1',letter:'A',text:'任何地图的中心'},
        //    {label:'6,7',letter:'B',text:'城市'},
        //    {label:'2,3,4',letter:'C',text:'荒野'},
        //    {label:'8,5',letter:'D',text:'海滩'}
        //    ]
        //  },
        //  {//3
        //    desc:'选择一个你喜欢的武器',
        //    options:[
        //    {label:'6,4',letter:'A',text:'突击步枪'},
        //    {label:'1,3',letter:'B',text:'狙击步枪'},
        //    {label:'2,7',letter:'C',text:'机枪'},
        //    {label:'8',letter:'D',text:'手榴弹'},
        //    {label:'5,8',letter:'E',text:'平底锅 & 我的拳头'}
        //    ]
        //  }, {//4
        //    desc:'选择一种战斗方式',
        //    options:[
        //    {label:'3,4',letter:'A',text:'蹲楼打人'},
        //    {label:'1,2,3',letter:'B',text:'隐藏在灌木丛中，树木和岩石后面'},
        //    {label:'8,7',letter:'C',text:'边飙车边打人'},
        //    {label:'7',letter:'D',text:'混战'},
        //    {label:'4,6',letter:'E',text:'与敌人保持距离'}
        //    ]
        //  },
        //  {//5
        //    desc:'看到空投追不追？',
        //    options:[
        //    {label:'6,7',letter:'A',text:'追呀，兄弟我们走！'},
        //    {label:'4',letter:'B',text:'不去，我不想死'},
        //    {label:'3,1',letter:'C',text:'分析情况再做决定'},
        //    {label:'2,8',letter:'D',text:'飞机在哪儿？'},
        //    {label:'5',letter:'E',text:'不需要!'}
        //    ]
        //  },{//6
        //    desc:'在团队战中，你通常是什么角色？',
        //    options:[
        //    {label:'1',letter:'A',text:'中距离枪手'},
        //    {label:'7',letter:'B',text:'突击兵'},
        //    {label:'2',letter:'C',text:'狙击兵'},
        //    {label:'6',letter:'D',text:'医疗兵'},
        //    {label:'4,8',letter:'E',text:'我做任何我想做的事'}
        //    ]
        //  },{//7
        //    desc:'游戏中你最重要的是什么？',
        //    options:[
        //    {label:'1,2',letter:'A',text:'一定要吃鸡'},
        //    {label:'7',letter:'B',text:'干掉那个打我的人'},
        //    {label:'3',letter:'C',text:'为了团队的胜利'},
        //    {label:'8,6',letter:'D',text:'只要开心就行'},
        //    {label:'4',letter:'E',text:'没什么想法'}
        //    ]
        //  },
      ]
    }
  },
  mounted() {
    this.openPage(0)
  },


  methods: {
    selectedFn(item) {
      this.dataArray.push(item);
      console.log(this.dataArray)
      this.config.selectedValue = '';

      this.optionData.map(opt => {
        opt['checked'] = opt.label == item ? true : false;
      });

      let _self = this;
      setTimeout(() => {
        if (_self.config.currStepIndex == _self.config.total) {
          _self.$router.replace({ name: 'Enname', params: { data: _self.dataArray, source: 'ff' } });
        } else {
          _self.config.currStepIndex++;
          _self.openPage(_self.config.currStepIndex - 1)
        }
      }, 100)

    },
    openPage(index) {
      this.optionData = this.stepDataSource[index]['options'];
      this.config.description = this.stepDataSource[index]['desc'];
    }
  }
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped="scoped">
.full {
  width: 100%;
  height: 100%;
}

</style>
