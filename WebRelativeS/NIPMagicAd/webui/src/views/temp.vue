<template>
	<div class="main-panel">
		<div class="panel">
			<mu-select-field label="adunit" :maxHeight="300" @change="onUnitSelect" :errorText="formItemsCheck.adunit" v-model="formItems.adunit">
			    <mu-menu-item v-for="item in adunit.data"  :key="item.id" :title="item.name" :value="item.id"/>
			</mu-select-field>
			图片尺寸比(宽/高):<span id="text_ratio" style="margin-right:10px;">{{adunit.ratio}}  </span>
			最大:<span  id="text_r">{{adunit.limit}} </span>

			<div style="display: inline-block; float: right;">
				<mu-select-field label="publisher" :maxHeight="300" v-model="formItems.publisher" :errorText="formItemsCheck.publisher">
				    <mu-menu-item v-for="item in publisher.data" :key="item.id" :title="item.name" :value="item.id"/>
				</mu-select-field>
				<mu-float-button icon="add" mini class="demo-float-button" @click="open" />
			</div>
		</div>
		<div class="panel">
			<mu-flexbox>
			    <mu-flexbox-item style="width:60%;min-width:600px;text-align:center;">
					<div class="" style="display: inline-block;text-align:left;">
						<mu-row gutter>
						    <mu-col width="100" tablet="50" desktop="33">
						    	<mu-date-picker autoOk 
						    		:shouldDisableDate="disableDateStart"
						    		:errorText="formItemsCheck.start_time" 
						    		label="start_time" 
						    		change="dateChangeStart"
						    		v-model="formItems['start_time']" 
						    		hintText="offer"/> 
						    </mu-col>
						    <mu-col width="100" tablet="50" desktop="33">
						    	<mu-date-picker autoOk 
						    		:shouldDisableDate="disableDateEnd"
						    		:errorText="formItemsCheck.end_time" 
						    		v-model="formItems['end_time']" 
						    		label="end_time" 
						    		hintText="offer"/> 
						    </mu-col>
						    <mu-col width="100" tablet="50" desktop="33">
						    	<mu-text-field 
						    		:errorText="formItemsCheck.name" 
						    		label="name" 
						    		hintText="offer" v-model="formItems['name']"/>
						    </mu-col>
						</mu-row>

						<mu-row gutter>
						    <mu-col width="100" tablet="50" desktop="33">
						    	<mu-text-field 
						    		:errorText="formItemsCheck.title" 
						    		label="title" 
						    		v-model="formItems['title']" />
						    </mu-col>
						    <mu-col width="100" tablet="50" desktop="33">
						    	<mu-text-field 
						    		:errorText="formItemsCheck.width" 
						    		label="width" 
						    		type="number"
						    		v-model="formItems['width']" />
						    </mu-col>
						    <mu-col width="100" tablet="50" desktop="33">
						    	<mu-text-field 
						    		:errorText="formItemsCheck.height" 
						    		label="height" 
						    		type="number"
						    		v-model="formItems['height']" />
						    </mu-col>
						</mu-row>


						<mu-row gutter>
						    <mu-col width="100" tablet="50" desktop="33">
						    	<mu-text-field 
						    		:errorText="formItemsCheck.cta_text" 
						    		label="cta_text" 
						    		v-model="formItems['cta_text']" />
						    </mu-col>
						    <mu-col width="100" tablet="50" desktop="33">
						    	<mu-text-field 
						    		:errorText="formItemsCheck.target_url" 
						    		label="target_url" 
						    		v-model="formItems['target_url']" />
						    </mu-col>
						    <mu-col width="100" tablet="50" desktop="33">
						    	<mu-text-field 
						    		:errorText="formItemsCheck.click_callback_url" 
						    		label="click_callback_url" 
						    		v-model="formItems['click_callback_url']" />
						    </mu-col>
						</mu-row>

						<mu-row gutter>
						    <mu-col width="100" tablet="50" desktop="33">
						    	<mu-text-field 
						    		:errorText="formItemsCheck.impression_callback_url" 
						    		label="impression_callback_url" 
						    		v-model="formItems['impression_callback_url']" />
						    </mu-col>
						    <mu-col width="100" tablet="50" desktop="33">
								<mu-text-field 
						    		:errorText="formItemsCheck.creative_url" 
						    		label="creative_url" 
						    		v-model="formItems['creative_url']" >
						    		<input type="file" onchange="return window.offer.onFileFinish()" id="create_url_file" class="file-button">
						    	</mu-text-field>
						    </mu-col>
						    <mu-col width="100" tablet="50" desktop="33">
						    	<mu-text-field 
						    		:errorText="formItemsCheck.description" 
						    		label="description" 
						    		v-model="formItems['description']" />
						    </mu-col>
						</mu-row>
					</div>
			    </mu-flexbox-item>
			    <mu-flexbox-item>
			      <mu-raised-button class="demo-raised-button" @click="saveForm" label="提交保存" icon="save" backgroundColor="#00cc66" primary/>
			    </mu-flexbox-item>
		  	</mu-flexbox>
		  	<div v-if="formStatus == 2" class="mask-loading">
		  		<mu-circular-progress :size="60" :strokeWidth="5"/>
		  	</div>
		  	<mu-snackbar v-if="formStatus == 3" message="保存成功！"/>
		  	<mu-snackbar v-if="formStatus == 4" message="保存失败！"/>

		  	<mu-snackbar v-if="formStatus == -9" message="图片不正确"/>
		</div>
		<mu-dialog :open="dialog" title="Add Publisher" dialogClass="dialogClass">
			<div v-if="publisher.btnStatus == 2" class="mask-loading">
				<mu-circular-progress :size="40"/>
			</div>


			<mu-popup position="top" popupClass="demo-popup-top" :open="publisher.btnStatus == 3">
			    添加成功
			</mu-popup>


		    <mu-text-field 
		    	label="publisher name" 
		    	v-model="publisher.formName" 
		    	:errorText="publisher.checkTitle" />
		    <mu-flat-button label="取消" slot="actions" primary @click="close"/>
		    <mu-flat-button label="创建" slot="actions" primary @click="savePublisher" color="#00cc66"/>
		</mu-dialog>
	</div>
</template>

<script>

import API from '../util/api';
import Store from '../util/store';
import moment from 'moment';

export default {
	data () {
	    return {
	    	dialog : false,

	      	adunit : {
		      	data : [],
		      	ratio : '',
		      	limit : '',
	      	},

	      	publisher : {
		      	data : [],

		      	// 表单的两个选项
		      	formName : '',
		      	checkTitle : '',
		      	btnStatus : 1,	// 1:edit ,2:saving ,3:success ,4:failed
	      	},

	      	// 表单
	      	formItems : {
	      		adunit : -1,
	      		publisher : -1,

		      	start_time : '',
				end_time : '',
				name : '',
				title : '',
				width : '',
				height : '',
				cta_text : '',
				target_url : '',
				click_callback_url : '',
				impression_callback_url : '',
				creative_url : '',
				description : '',
	      	},

	      	formStatus : 1, 	// 1:edit ,2:saving ,3:success ,4:failed

	      	formItemsCheck : {
	      		adunit : '',
	      		publisher : '',

				start_time : '',
				end_time : '',
				name : '',
				title : '',
				width : '',
				height : '',
				cta_text : '',
				target_url : '',
				click_callback_url : '',
				impression_callback_url : '',
				creative_url : '',
				description : '',
			}
	    }
	},
 	methods: {
 		disableDateStart(date){
 			const max = this.formItems.end_time;
 			if(max){
 				return date.getTime() >= new Date(max).getTime();
 			}
 		},

 		disableDateEnd(date){
 			const max = this.formItems.start_time;
 			if(max){
 				return max && date.getTime() <= (new Date(max).getTime()-60*60*24*1000);
 			}
 		},


 		check(){
 			const param = this.formItems;
 			if(!param.adunit){ this.formItemsCheck.adunit = 'adunit 为必选项！'; return;}else{this.formItemsCheck.adunit='';}
			if(!param.publisher){ this.formItemsCheck.publisher = 'publisher 为必选项！'; return;}else{this.formItemsCheck.publisher='';}
			if(!param.start_time){ this.formItemsCheck.start_time = 'start_time 为必选项！'; return;}else{this.formItemsCheck.start_time='';}
			if(!param.end_time){ this.formItemsCheck.end_time = 'end_time 为必选项！'; return;}else{this.formItemsCheck.end_time='';}
			if(!param.name){ this.formItemsCheck.name = 'name 为必选项！'; return;}else{this.formItemsCheck.name='';}
			if(!param.title){ this.formItemsCheck.title = 'title 为必选项！'; return;}else{this.formItemsCheck.title='';}
			if(!param.width){ this.formItemsCheck.width = 'width 为必选项！'; return;}else{this.formItemsCheck.width='';}
			if(!param.height){ this.formItemsCheck.height = 'height 为必选项！'; return;}else{this.formItemsCheck.height='';}
			if(!param.cta_text){ this.formItemsCheck.cta_text = 'cta_text 为必选项！'; return;}else{this.formItemsCheck.cta_text='';}
			if(!param.target_url){ this.formItemsCheck.target_url = 'target_url 为必选项！'; return;}else{this.formItemsCheck.target_url='';}
			if(!param.click_callback_url){ this.formItemsCheck.click_callback_url = 'click_callback_url 为必选项！'; return;}else{this.formItemsCheck.click_callback_url='';}
			if(!param.impression_callback_url){ this.formItemsCheck.impression_callback_url = 'impression_callback_url 为必选项！'; return;}else{this.formItemsCheck.impression_callback_url='';}
			// if(!param.creative_url){ this.formItemsCheck.creative_url = 'creative_url 为必选项！'; return;}else{this.formItemsCheck.creative_url='';}
			if(!param.description){ this.formItemsCheck.description = 'description 为必选项！'; return;}else{this.formItemsCheck.description='';}
			return true;
 		},

	    saveForm(){
	    	let self = this;
	    	const param = JSON.parse( JSON.stringify(self.formItems));
	    	if(!this.check()){
	    		return;
	    	}

	    	if(!window.offer.isCurrent){
	    		this.formStatus = -9;
	    		setTimeout(()=> self.formStatus = 1 ,2000);
	    		return;
	    	}

	    	this.formStatus = 2;
	    	const uploadImage = function(){
	    		const files = document.getElementById('create_url_file').files;
    			var formData = new FormData();
                for (var key in files) {
                    if (files.hasOwnProperty(key) && files[key] instanceof File) {
                        formData.append(key, files[key] ,files[key].name);
                    }
                }
                const start =moment(param.start_time).format('YYYYMMDD');
                const end =moment(param.end_time).format('YYYYMMDD');
                formData.append('title' ,param.title);
                formData.append('start' ,start);
                formData.append('end' ,end);

                API.offer.upload(formData).then((e) => {
                	console.log('e:',e);
                    uploadForm(e);
                },(e) => {
                    self.formStatus = 4;
                    setTimeout(()=> self.formStatus = 1 ,2000);
                });
	    	},

	    	uploadForm = function(imgurl){
	    		let imageUrl = '';
		    	param.start_time = moment(param.start_time + ' 00:00:00'+window.countryTime).utc().format('YYYY-MM-DD HH:mm:ss');
		    	param.end_time = moment(param.end_time + ' 00:00:00'+window.countryTime).utc().format('YYYY-MM-DD HH:mm:ss');
	    		param.creative_url = imgurl;
		    	API.offer.saveoffer(param).then((k) => {
		    		self.formStatus = 3;
		    		setTimeout(()=> self.formStatus = 1 ,2000);
		    	} ,(e) => {
		    		self.formStatus = 4;
		    		setTimeout(()=> self.formStatus = 1 ,2000);
		    	})
	    	}

	    	uploadImage();

	    },

	    // 保存publisher
	    savePublisher(){
	    	const name = this.publisher.formName;
	    	if(!name){
	    		this.publisher.checkTitle = 'publisher为必选项！';
	    		return;
	    	}else{
	    		this.publisher.checkTitle = '';
	    	}
	    	this.publisher.btnStatus = 2;
	    	API.offer.savepublisher({name}).then((k) => {
	    		const res = {id:k ,name:name};
	    		this.publisher.data.push(res);
	    		this.publisher.btnStatus = 3;
	    		Store.set('publisher' ,this.publisher.data ,5*60);
	    		this.dialog = false;
	    		this.formItems.publisher = k;
	    		setTimeout(() => {
	    			this.publisher.btnStatus = 1;
	    		} ,1000);
	    	});
	    },


	    open () {
	      this.dialog = true
	    },

	    onUnitSelect(v){
	    	const data = this.adunit.data[v-1];
	    	this.adunit.ratio = data.creative_ratio;
	    	this.adunit.limit = data.creative_size_limitation;
	    },

	    close () {
	      this.dialog = false
	    }
  	},
  	async mounted () {
  		const adunitData = await API.offer.getadunit();
		this.adunit.data = adunitData || [];
		const publisherData = await API.offer.getpublisher();
		this.publisher.data = publisherData || [];
		setTimeout(() => {
			const _ad = adunitData[0];
			this.formItems.adunit = _ad.id;
			this.adunit.ratio = _ad.creative_ratio;
	    	this.adunit.limit = _ad.creative_size_limitation;
			this.formItems.publisher = publisherData[0].id;
		},200);

		window.offer = {
			onFileFinish : function(){
				const file = document.getElementById("create_url_file").files[0];
				if(file.type.indexOf('image') >= 0){
					this.isCurrent = true;
					// console.log('file:' ,file);
					return false;
				}else{
					this.isCurrent = false;
					alert('插入的不是图片！');
					return false;
				}
			},
			isCurrent : false,	// 是否符合
		}
  		

  		// 监听 input 的事件
  	}
}
</script>

<style lang="less">
	.demo-popup-top {
	  width: 100%;
	  opacity: .8;
	  height: 48px;
	  line-height: 48px;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  max-width: 375px;
	}
	.main-panel{
		padding: 20px;
	}
	.dialogClass{
		width : 400px;
		position:relative;
	}
	.mask-loading{
		position: absolute;
	    top: 0px;
	    bottom: 0px;
	    right: 0px;
	    left: 0px;
	    text-align: center;
	    background: rgba(255, 255, 255, 0.61);
	    z-index: 9999999999;
	    padding-top: 25%;
	}
	.publisher-btn{
	    width: 100px;
	    text-align: center;
	    margin-top: -10px;
	    .mu-circle-wrapper{
	    	display:block;
	    }
	}

	.file-button{
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
	    opacity: .75;
    	top: 5px;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		outline: none;
		border: none;
		background: none;
		border-radius: 0 0 0 0;
		box-shadow: none;
		display: block;
		padding: 0;
		margin: 0;
		width: 100%;
		height: 32px;
		font-style: inherit;
		font-variant: inherit;
		font-weight: inherit;
		font-stretch: inherit;
		color: rgba(0,0,0,.87);
		font-family: inherit;
		position: relative;
		font-size: 12px;
	}
	.panel{
		padding:10px;
		background:white;
		box-shadow: 0 2px 3px rgba(0,0,0,.05);
		margin-bottom:20px;
	}
</style>