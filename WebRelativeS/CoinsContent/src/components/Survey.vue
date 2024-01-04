<!-- <template>
  <div class="activity_one">
      <div class="activity" :style="{'background-image': 'url(' + require('../../public/img/click.png') + ')'}">
        <div style="width: 85%">
          <p style="text-align: left; font-weight: bold;">You have been chosen for this event!</p>
          <p style="text-align: left;"> Fill in a form to get 100 coins!</p>
          <span style="color: #C9945A; font-size: 10px;">Click here>></span>
        </div>
        <span class="time">12:56:13</span>
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
    
  },
  methods: {
     survey() { 
      this.$router.push("/Home")
    }
  }
}
</script>
Add "scoped" attribute to limit CSS to this component only
<style>
.activity_one {
  width: 100%;
}
.activity {
  /* background: url('../../public/img/click.png'); */
  background-repeat:no-repeat;
  background-position:right top;
  width:100%;
  height:100%;
  background-size:100% 100%;
  padding: 5px 10px;
  position: relative;
  box-sizing: border-box;
}
.time {
  margin-right: 20px;
  background-color: #FF6C00;
  display: block;
  font-size: 12px;
  color: #fff;
  padding: 0px 3px;
  vertical-align: middle;
  position: absolute;
  bottom: 37%;
  right: 2%;
}
.arrow {
  right: 2%;
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
</style>
 -->