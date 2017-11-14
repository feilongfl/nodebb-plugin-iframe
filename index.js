(function (bili) {
	"use strict";
	var converts = [{ // Video
		//<img src="https://github.com/feilongfl/pic-bed/raw/master/201711/%E6%BB%91%E7%A8%BD.3mf" alt="" class="img-responsive img-markdown" />
		from: /<a href="(http(?:s)?:\/\/(?:.+))" rel="nofollow">#iframe<\/a>/g,
		//from: /<a href="(?:https?:\/\/)?(?:www\.)?bilibili\.(?:tv|com)\/video\/av(\d+).*?">.+<\/a>/g,
		to: '<div class="iframe">' +
				'<p>框架网址来自：<a href="$1" rel="nofollow">$1</a></p>' +
				'<div class="iframe-content" id="$1">' +
				'</div>' +
				'</div>'
	}];

	bili.parse = function (data, callback) {
		// console.log("aaa");
		// console.log(data);
		try {
			for (var i = 0; i < converts.length; i++)
				data.postData.content = data.postData.content.replace(converts[i].from, converts[i].to);
			callback(null, data);
		} catch (ex) {
			callback(ex, data);
		}
	};

	bili.addScripts = function (scripts, callback) {
		//console.log("o.o...");
		scripts.push('/assets/src/iframeloader.js');
		// scripts.push('/assets/src/3MFLoader.js');
		callback(null, scripts);
	}
})(module.exports);
