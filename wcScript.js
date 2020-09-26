(function(global,factory){
	factory(global);
})(window,function(global){

$(".editArea>button").on('click',function(){
	var textarea=$('.editArea>textarea');
	var text=textarea.val();
	if (!text) {
		alert("please input content in the text area!")
		return;
	}
	chrome.runtime.sendMessage(extensionID,{
		cmd:"addGood",
		args:[text]
	},function(data){
		if(data){
			textarea.val("");
		} else {
			alert("add failed!");
		}
	});
})

function decodeGood(good){
	var newGood={};
	for (var prop in good){
		newGood[prop]=decodeURIComponent(good[prop]);
	}
	return newGood;
}

global.sendGood=function(good){
	good=decodeGood(good);
	var msg=good.tittle+'</br>'+good.price+'</br>'+'电脑点击链接购买：'+good.proURL+'</br>'+'手机复制这条消息到淘宝打开购买：'+good.taoToken+'</br>'+good.intro;
	$('#editArea').focus().html(msg).trigger('input');
	$('.btn_send').click();
}

});







