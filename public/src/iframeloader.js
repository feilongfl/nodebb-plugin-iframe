$(window).on('action:ajaxify.end', function () {
	if (window.location.pathname != "/") {
		for (var i = 0; i < $(".iframe-content").length; i++) {
			console.log($(".iframe-content")[i].id);
			var iframehtml = document.createElement("iframe");
			iframehtml.src = $(".iframe-content")[i].id;
			iframehtml.id = 'iframe';
			$(".iframe-content")[i].appendChild(iframehtml);
			$("#iframe")[i].width = $(".iframe-content")[i].clientWidth;
		}

		window.addEventListener("resize", function () { // Watch for browser/canvas resize events
			for (var i = 0; i < $(".iframe-content").length; i++) {
				$("#iframe")[i].width = $(".iframe-content")[i].clientWidth
			}
		});
	}
});
