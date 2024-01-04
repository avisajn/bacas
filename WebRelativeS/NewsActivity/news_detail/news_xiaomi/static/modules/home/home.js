define(function (require, exports, module) {
	// M 在c中获取
	// V
	MVC.addView("news", function (M) {
		$news = $("#news");
		var data = M.get("news");

	var tpl = `
		<div class="top">
			<h1 class="title"><%=related_tpl%></h1>
			<div class="info">
				<p>
					<span class="from">TribunJatim </span>
					<%=time_tpl%>
				</p>
			</div>
			<div class="article">
				<div class="content"><%=content_tpl%></div>
			</div>
			<div class="button"><a href="https://app.appsflyer.com/com.jakarta.baca?pid=wapmi">Powered by Baca</a></div>
		</div>
		<div class="separator"></div>
		<div id="adad">
			<div id="ad-content" style="background: #EBEBEB; position: relative; padding: 5px 0 20px 0;">
				<div style="display:none; position:absolute;" id="im_6421_clickTarget"></div>
				<script type="text/javascript"> (function() {var e=window,g=encodeURIComponent,h=document,k='parent',l='appendChild',n='postMessage',q='setAttribute',r='createElement',s='',t='"}}',u='&',v='*',w='0',x='2',y='=',z='?',A='Events',B='_blank',C='a',D='click',E='clickCallback',F='clickTarget',G='error',H='event',I='function',J='height',L='href',M='iatSendClick',N='iframe',O='img',P='impressionCallback',Q='m=',aa='object',ba='onclick',ca='openLandingPage',da='recordEvent',R='seamless',S='src',ea='target',fa='viewability_custom_render_beacon',T='width', ga='{"action":"openexternaltizen", "attrib" : {"landingurl" : "';e.inmobi=e.inmobi||{};var U=e.inmobi;U.d=U.d||[];U.c=function(a,b){for(var c=U.d,d=0;d<c.length;d++)c[d].call(this,a,b)};U.recordEvent=U.c; function V(a){function b(a,b){c.c(a,b)}this.m=a.os;this.k=a.lp;this.l=a.lps;this.f=a.tc;this.i=a.bcu;this.b=a.ns;this.n=a.ws;this.h=a.sc;this.g=a.vbd;this.a=a.eventTrackerMap;a=this.b;var c=this;e[a+ca]=function(){var a=V.e(c.k),b=e.mraid,m=a;if(22===c.m){if('undefined'!==typeof e[k]&&null!=e[k]&&'undefined'!==typeof e[k][n]&&null!=e[k][n]&&typeof e[k][n]===I)e[k][n](ga+a+t,v)}else'undefined'!==typeof b&&null!=b&&'undefined'!==typeof b.openExternal?b.openExternal(m):(a=V.e(c.l),b=h[r](C),b[q](ea, B),b[q](L,a),h.body[l](b),V.j(b))};e[a+E]=function(a){W(c,a)};e[a+P]=function(){X(c)};e[a+da]=b;this.h&&U.d.push(b)}U.Bolt=V;function Y(a,b){if(null!=b)for(var c=b.length,d=0;d<c;d++)Z(a,b[d])}V.j=function(a){if(typeof a.click==I)a.click.call(a);else if(a.fireEvent)a.fireEvent(ba);else if(a.dispatchEvent){var b=h.createEvent(A);b.initEvent(D,!1,!0);a.dispatchEvent(b)}};V.e=function(a){return a.replace(/\$TS/g,s+(new Date).getTime())}; function Z(a,b){var c=h.getElementById(a.b+F),d=h[r](N);d[q](S,b);d[q](R,R);d[q](J,w);d[q](T,x);c[l](d)}function W(a,b){var c=e[a.b+M];c&&c();c=a.a.CLICK;if(null!=c)for(var d=c.length,f=0;f<d;f++)Z(a,V.e(c[f]));a.n&&(b=b||eval(H),'undefined'!==typeof b&&(c=void 0!=b.touches?b.touches[0]:b,e.external.notify(JSON.stringify({o:c.clientX,p:c.clientY}))))} function X(a){if(null!=a.f)try{var b=h.getElementById(a.b+F),c=a.f,d=h[r](N);d[q](R,R);d[q](J,w);d[q](T,x);b[l](d);var f=d.contentWindow;f&&(f.document.write(c),f.document.close())}catch(m){}} function $(a,b,c){function d(b,c,f){if(!(0>=f)){var m=h.getElementById(a.b+F),p=h[r](O);p[q](S,b);p[q](J,w);p[q](T,x);void 0!=p.addEventListener&&p.addEventListener(G,function(){e.setTimeout(function(){3E5<c&&(c=3E5);d(b,2*c,f-1)},c*Math.random())},!1);m[l](p)}}var f=a.i,m=z;0<=f.indexOf(z)&&(m=u);f+=m+Q+b;if(c)for(var K in c)f+=u+g(K)+y+g(c[K]);d(f,1E3,5);18==b&&X(a);8==b&&W(a,null);9==b||10==b?Y(a,a.a.MEDIA_START):12==b&&1==c.q?Y(a,a.a.MEDIA_QUARTILE_1):12==b&&2==c.q?Y(a,a.a.MEDIA_QUARTILE_2):12== b&&3==c.q?Y(a,a.a.MEDIA_QUARTILE_3):13==b&&Y(a,a.a.MEDIA_END)}V.prototype.c=function(a,b){if('undefined'===typeof b||null===b||typeof b!==aa)b={};if(0!==this.g&&18==a){var c=Object.create(b);c.action=fa;$(this,99,c);var d=this;e.setTimeout(function(){$(d,a,b)},1E3*this.g)}else $(this,a,b)};})(); (function() {var a=window,c='handleClick',e='handleTouchEnd',f='handleTouchStart';a.inmobi=a.inmobi||{};function g(b,h){this.b=h;this.a=this.c=!1;var d=this;a[b+c]=function(){d.click()};a[b+f]=function(){d.start(a.event)};a[b+e]=function(){d.end()}}a.inmobi.OldTap=g;g.prototype.click=function(){this.c||this.b()};g.prototype.start=function(b){this.a=this.c=!0;b&&b.preventDefault()};g.prototype.end=function(){this.a&&(this.a=!1,this.b())};})(); new window.inmobi.Bolt({"os":3,"lp":"market://details?id\u003dcom.shopee.id\u0026referrer\u003dinmobi-3d5fc9c9-0168-1000-e213-0106a1a20077","lps":"market://details?id\u003dcom.shopee.id\u0026referrer\u003dinmobi-3d5fc9c9-0168-1000-e213-0106a1a20077","ct":["https://c.w.inmobi.com/c.asm/HDa-s4T96sq_BRbggQsUWBRmFUgbAVgYJDczMTk0ZDg4LWQzNzAtNDUzMS1hMGQ3LTA1ZGY4NjU1MTMxYxwVBBUYFQIV7AQVAiUAKAd1bmtub3duGAMyLjAAEwEcF84ZUdob_BjAFx-F61G4tlpAABUAGBxZMjl0TG1waGEyRnlkR0V1WW1GallTNXNhWFJsFsC4AhwcFoDAwJag8uTfehaR6q-lwL7_8zsAABUYFwAAAAAAgExAEhQAHBIZBQAWwLgCGANVU0QAGIgCFqAfFoCS9AEWnuOB64BaN_Fo44i1-OQ-FBwXAAAAAAAA8D8X_Knx0k1iYD8XAAAAAAAAAAAUBBIYODhGTCtrSHF1VXBVYUdKT3dBTDA2TTh1MzFJS1VBdjZKa3JQMFRMeG1QQVRDK1ZlcithRmEvZz09GAZCQU5ORVIcPBwWgMDAlqDy5N96FpHqr6XAvv_zOwAW5oOL07a_w6xfFQASAAA5FcA-IhQAFsawmbzfUygYcGVyZi1hZHBvb2xfcHJvZF9kZncyXzE2FAQSPBUAACwVAABTASagHxUCERgFMC4wMDIcFoDAwJag8uTfehaR_u_lq77_7DsAFaDKzRAVygEVABUBFAQAGAE3AA/93f21bca?at\u003d1\u0026am\u003d0"],"bcu":"http://et.w.inmobi.com/c.asm/HDa-s4T96sq_BRbggQsUWBRmFUgbAVgYJDczMTk0ZDg4LWQzNzAtNDUzMS1hMGQ3LTA1ZGY4NjU1MTMxYxwVBBUYFQIV7AQVAiUAKAd1bmtub3duGAMyLjAAEwAcF84ZUdob_BjAFx-F61G4tlpAABUAGBxZMjl0TG1waGEyRnlkR0V1WW1GallTNXNhWFJsFsC4AhwcFoDAwJag8uTfehaR6q-lwL7_8zsAABUYFwAAAAAAgExAEhQAHBIZBQAWwLgCGANVU0QAGIgCFqAfFoCS9AEWnuOB64BaN_Fo44i1-OQ-FBwXAAAAAAAA8D8X_Knx0k1iYD8XAAAAAAAAAAAUBBIYODhGTCtrSHF1VXBVYUdKT3dBTDA2TTh1MzFJS1VBdjZKa3JQMFRMeG1QQVRDK1ZlcithRmEvZz09GAZCQU5ORVIcPBwWgMDAlqDy5N96FpHqr6XAvv_zOwAW5oOL07a_w6xfFQASAAA5FcA-IhQAFsawmbzfUygYcGVyZi1hZHBvb2xfcHJvZF9kZncyXzE2FAQSPBUAACwVAABTASagHxUCERgFMC4wMDIcFoDAwJag8uTfehaR_u_lq77_7DsAFaDKzRAVygEVABUBFAQAGAE3AA/b1013bca","ws":false,"ns":"im_6421_","sc":true,"vbd":0,"eventTrackerMap":{"CLICK":["https://c.w.inmobi.com/c.asm/HDa-s4T96sq_BRbggQsUWBRmFUgbAVgYJDczMTk0ZDg4LWQzNzAtNDUzMS1hMGQ3LTA1ZGY4NjU1MTMxYxwVBBUYFQIV7AQVAiUAKAd1bmtub3duGAMyLjAAEwEcF84ZUdob_BjAFx-F61G4tlpAABUAGBxZMjl0TG1waGEyRnlkR0V1WW1GallTNXNhWFJsFsC4AhwcFoDAwJag8uTfehaR6q-lwL7_8zsAABUYFwAAAAAAgExAEhQAHBIZBQAWwLgCGANVU0QAGIgCFqAfFoCS9AEWnuOB64BaN_Fo44i1-OQ-FBwXAAAAAAAA8D8X_Knx0k1iYD8XAAAAAAAAAAAUBBIYODhGTCtrSHF1VXBVYUdKT3dBTDA2TTh1MzFJS1VBdjZKa3JQMFRMeG1QQVRDK1ZlcithRmEvZz09GAZCQU5ORVIcPBwWgMDAlqDy5N96FpHqr6XAvv_zOwAW5oOL07a_w6xfFQASAAA5FcA-IhQAFsawmbzfUygYcGVyZi1hZHBvb2xfcHJvZF9kZncyXzE2FAQSPBUAACwVAABTASagHxUCERgFMC4wMDIcFoDAwJag8uTfehaR_u_lq77_7DsAFaDKzRAVygEVABUBFAQAGAE3AA/93f21bca?at\u003d1\u0026am\u003d0"]}}); new window.inmobi.OldTap("im_6421_", function() { window['im_6421_openLandingPage'](); window['im_6421_recordEvent'](8); }); </script>
				<style>
					.inmC { margin-left: auto; margin-right: auto; display: block; }
				</style>
				<div>
					<img border="0" class="inmC" onload="im_6421_recordEvent(99, {'action': 'image_loaded'});" src="http://i.l.inmobicdn.net/banners/FileData/1c90a74a-ca26-4011-afc0-0dba1a1eb779.jpeg" alt="Shopee" height="250" width="300">
					<div id="img-overlay-0" onclick="im_6421_handleClick()" ontouchstart="im_6421_handleTouchStart()" ontouchend="im_6421_handleTouchEnd()">
					</div>
					<div id="img-overlay-1" onclick="im_6421_handleClick()" ontouchstart="im_6421_handleTouchStart()" ontouchend="im_6421_handleTouchEnd()">
					</div>
					<div id="img-overlay-2" onclick="im_6421_handleClick()" ontouchstart="im_6421_handleTouchStart()" ontouchend="im_6421_handleTouchEnd()">
					</div>
				</div>
				<style>
					html,body{margin:0 auto;height:100%;width:100%;} #img-overlay-1{ position:absolute;top:0;height:100%;width:50%;left:25%;visibility: hidden; } #img-overlay-2{ position:absolute;top:0;height:100%;width:35%;left:32.5%;visibility: hidden; } #img-overlay-0{ position:absolute;top:0;height:100%;width:100%;left:0;visibility: hidden; }
				</style>
				<script type="text/javascript"> var userAgent = window.navigator.userAgent; var deviceOS = userAgent.match(/iPhone|iPad|iPod/i) ? "ios" : (userAgent.match(/Android/i) ? "android" : ""); var ctrFactor = parseInt("0", 10); var supplyHeight = 250; if(deviceOS === "ios" && supplyHeight === 250){ if(ctrFactor >=0 && ctrFactor <=2){ ctrFactor = ctrFactor; }else{ ctrFactor = 0; } } else { ctrFactor = 0; } var overlayDiv = document.querySelector("#img-overlay-" + ctrFactor); overlayDiv.style.visibility = "visible"; var onViewable = function() { /* send impression beacon */ im_6421_recordEvent(18); }; if(false && typeof mraid !== "undefined" && mraid != null) { if (typeof(mraid.isViewable) === "function" && mraid.isViewable()) { onViewable(); } else { mraid.addEventListener("viewableChange", function(viewable) { if (viewable) { mraid.removeEventListener("viewableChange", arguments.callee); onViewable(); } }); } }else{ onViewable(); } </script>
			</div>
		</div>
		<div class="separator"></div>
		<div class="rel_list">	
			<p class="ttl">Berita terkait</p>
				<div class="berita">
					<ul>
						<li>
							<a href="javascript:void(0);">
								<div class="left">
									<p>Nissa Sabyan Sempat Pinasan Saat Manaauna</p>
									<span class="little">wowkeren</span>
								</div>
								<img src="http://baca.co.id/api/v1/NewsImage/b2854716-8780-43cb-bd2a-0381827b326c?allowRedirect=true&thumbnail=true" alt="" />
							</a>
						</li>
						<li>
							<a href="javascript:void(0);" class="img">
								<div class="left">
									<p>Nissa Sabyan Sempat Pinasan Saat Manaauna</p>
									<span class="little">wowkeren</span>
								</div>
								<img src="http://baca.co.id/api/v1/NewsImage/b2854716-8780-43cb-bd2a-0381827b326c?allowRedirect=true&thumbnail=true" alt="" />
							</a>
						</li>
					</ul>
				</div>
		</div>`;





		var related_tpl = '<%=title%>';
		var content_tpl = '<%=content%>';
		var time_tpl = '<%=time%>';
		var mounts_tpl = '<%=mounts%>';
		var img_tpl = '<%=img%>';

		var li_tpl = `
			<li>
				<a href="<%=href%>"><%=title%></a>				
			</li>`;
		// 定义变量，接受格式化完的模板
		var html = "";
		var related_html = "";
		var content_html = "";
		var time_html  = "";
		var mounts_html = "";
		var img_html = "";
		// 格式化模板
		var format = _.template(tpl);
		var related_format = _.template(related_tpl);
		var content_format  = _.template(content_tpl);
		var time_format = _.template(time_tpl);
		var mounts_format = _.template(mounts_tpl);
		var img_format = _.template(img_tpl);
		// for (var i = 0; i < data.length; i++) {
			related_html += related_format({
				title: data.Title,
			})
			content_html += content_format({
				content: data.Html,
			})

			time_html += time_format({
				time: data.CreatedAt.substring(0,10) +"&nbsp;"  +"&nbsp;"+ data.CreatedAt.substring(11,16) ,
			})
			mounts_html += mounts_format({
				mounts: data.Likes,
			})
			img_html += img_format({
				img: data.news_like,
			})
		// 二级模板暂时省略
		// 大模板
		html = format({
			logo_src: data.logo,
			related_tpl: related_html,
			time_tpl: time_html,
			content_tpl: content_html,
			mounts_tpl: mounts_html,
			img_tpl: img_html,
		})
		$news.append(html);
		return $news;
	});

	MVC.addCtrl("news", function (M, V) {
		$.ajax({
			url: "./data.json",
			data: "",
			type: "get",
			dataType: "json",
			success: function (data) {
				console.log(data)
				M.add("news", data)
				var $news = V.create("news");
				var hash = data.NewsId;
				console.log(location.search);
				// 根据点击的那个id跳转
				location.hash = hash;
				var $like = document.getElementById("like");
				var $zan_like = document.getElementById("zan_like");
				var x = $(".monuts").html() ;
				var y = $(".lit").html();
			}
		})

	})
})