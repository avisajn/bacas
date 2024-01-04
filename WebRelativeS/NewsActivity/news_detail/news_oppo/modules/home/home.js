define(function (require, exports, module) {
	// M 在C中获取
	// V
	MVC.addView("footer", function (M) {
		$footer = $("#footer");
		var data = M.get("footer");

		var tpl = `
			<div class="inner">
				<div id="container">
					<div class="block block1">
						<h2>LatestPost</h2>
						<ul><%=block1_tpl%></ul>
					</div>
					<div class="block block2">
						<h2>Flickr</h2>
						<ul><%=block2_tpl%></ul>
					</div>
					<div class="block block3">
						<h2>About</h2>
						<div class="bottom">
							<%=block3_tpl%>
						</div>
					</div>
					<div class="block block4">
						<h2>Get in Touch</h2>
						<p><input type="text" /><label>Name*</label></p>
						<p><input type="text" /><label>Email*</label></p>
						<p><textarea></textarea>
						<p><button type="button">Submit</button></p>
					</div>
				</div>
			</div>
			<div id="copyright">
				<p>&copy; 2011 Zeences Design. All Right Reserved.</p>
			</div>`;

		var block1_tpl = `
			<li>
				<div class="left">
					<span><%=title%></span>
					<span><%=month%></span>
				</div>
				<div class="right"><%=content%></div>
			</li>`;
		var block2_tpl = `<li><img src="<%=src%>" alt="" /></li>`;
		var block3_tpl = `<p><%=content%></p>`;

		var html = "";
		var block1_html = "";
		var block2_html = "";
		var block3_html = "";

		// 格式化模板
		var format = _.template(tpl);
		var block1_format = _.template(block1_tpl);
		var block2_format = _.template(block2_tpl);
		var block3_format = _.template(block3_tpl);
		for (var i = 0; i < data.LatestPost.data.length; i++) {
			block1_html += block1_format({
				title: data.LatestPost.data[i].title,
				month: data.LatestPost.data[i].month,
				content: data.LatestPost.data[i].content
			})
		};
		for (var i = 0; i < data.Flickr.images.length; i++) {
			block2_html += block2_format({
				src: data.Flickr.images[i]
			})
		};
		for (var i = 0; i < data.About.data.length; i++) {
			block3_html += block3_format({
				content: data.About.data[i]
			})
		};
		// // for循环设置大模板的title
		// for (var i = 0; i < data.length; i++) {
		// 	html = format({
		// 		title1: data[1].title,
		// 		title2: data[2].title,
		// 		title3: data[3].title,
		// 	})
		// };
		// console.log(html);
		// 最后设置大模板
		html = format ({
			block1_tpl: block1_html,
			block2_tpl: block2_html,
			block3_tpl: block3_html,
		});
		console.log(html);
		$footer.append(html);
		return $footer;
	});

	MVC.addCtrl("footer", function (M, V) {
		$.ajax({
			url: "./data/list.json",
			data: "",
			type: "get",
			dataType: "json",
			success: function (data) {
				M.add("footer", data.data)
				$footer = V.create("footer");
			}
		})
	})
})