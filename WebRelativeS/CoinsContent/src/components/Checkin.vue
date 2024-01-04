<template>
  <div class="activity_two">
      <div class="activitys">

            <img src="../../public/img/checkin.png" alt="">
          <div style="width: 95%; padding-left: 8%;">
            <p style="font-weight: bold;">Special event! Get more coins for check in!</p>
            <p style=""> Now you can get <span class="blink">200</span> coins by check-in!</p>
          </div>
          <i class="el-icon-arrow-right arrow"></i>  

      </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  name: 'HelloWorld',
  data () {
    return {
      toastone: false,
    }
  },
  created() {
      console.log("2.25.1")
  },
  methods: {
     onSubmit() { 

    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.activity_two {
  width: 100%;
  padding: 8px 10px;
  border-bottom: 1px solid #ccc;
}
.activitys {
  position: relative;
}
img {
  width: 20px;
  height: 20px;
  display: inline-block;
  position: absolute;
  bottom: 37%;
}
.arrow {
  right: 0%;
  font-size: 17px;
  font-weight: bold;
  padding: 0px 3px;
  vertical-align: middle;
  position: absolute;
  bottom: 37%;

}
.style_time {
  width: 20%;

}
@keyframes blink{
  0%{opacity: 1;}
  70%{opacity: .5;}
  90%{opacity: .9;}
  100%{opacity: .6;} 
}
/* 添加兼容性前缀 */
@-webkit-keyframes blink {
  0%{opacity: 1;}
  70%{opacity: .5;}
  90%{opacity: .9;}
  100%{opacity: .6;} 
}
@-moz-keyframes blink {
  0%{opacity: 1;}
  70%{opacity: .5;}
  90%{opacity: .9;}
  100%{opacity: .6;} 
}
@-ms-keyframes blink {
    0%{opacity: 1;}
  70%{opacity: .5;}
  90%{opacity: .9;}
  100%{opacity: .6;} 
}
@-o-keyframes blink {
  0%{opacity: 1;}
  70%{opacity: .5;}
  90%{opacity: .9;}
  100%{opacity: .6;} 
}

.blink{
    color: red;
    font-weight: bold;
    animation: blink 1s linear infinite;  
    -webkit-animation: blink 1s linear infinite;
    -moz-animation: blink 1s linear infinite;
    -ms-animation: blink 1s linear infinite;
    -o-animation: blink 1s linear infinite;
}

</style>
