RECOGNIZE_SERVER = "http://na.jnu.edu.cn/apps/jwc-helper/verifycode";
VCODE_URL = $('#Table6 tbody').find('tr:eq(9)').find('img').attr('src');

var container = $('#Table6 tbody').find('tr:eq(9)').find('td:eq(0)');
var recognize_count = 0;
if (container.length) {
	recognize();
}

function recognize() {
	if (isImageLoaded()) {
		var image = $('#Table6 tbody').find('tr:eq(9)').find('img');
		var image_dom = image.get(0);
		var canvas = document.createElement("canvas");
		canvas.width = image_dom.width;
		canvas.height = image_dom.height;
		canvas.getContext("2d").drawImage(image_dom, 0, 0);

		$.getJSON(RECOGNIZE_SERVER, {pic: canvas.toDataURL()}, function(data){
			if (data.result) {
				$('#Table6 tbody').find('tr:eq(9)').find('input').val(data.result);
                $('input[name="txtFJM"]').css({
                    //'background-color':"#00BFFF",
                    'color':"#DA1C25",
                    'font-size': "14px",
                    'text-align': "center",
                    'font-weight': "bold",
                    'font-family': "Century Gothic"
                }).attr('title', "不一定能正确识别，请自行修正");
			} else {
				if (recognize_count < 10) {
					refreshVcode()
					setTimeout(recognize, 100);	
				} else {
                    $('input[name="txtFJM"]').val("无法识别");
                }
			}
		});	
	} else if (recognize_count < 10) {
		setTimeout(recognize, 100);	
	}
	recognize_count++;	
}

function refreshVcode() {
	var image = $('#Table6 tbody').find('tr:eq(9)').find('img');
	image.attr('src', VCODE_URL + '?r=' + Math.random());
}

function isImageLoaded() {
	var image = $('#Table6 tbody').find('tr:eq(9)').find('img');
	var image_dom = image.get(0);
	return image_dom.width != 0;
}