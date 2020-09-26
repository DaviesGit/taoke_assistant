(function(global,factory){
	factory(global);
})(window,function(global){

global.getActionCode=function(good){
	good=decodeGood(good);
	$('#q').val(getGoodURL(good));
	$('[mx-click="search()"]').click();
	var loader=$('.block-switch-loading');
	setTimeout(()=>{
		var proBtn =$('.box-btn-group>.box-btn-left');
		if (1!=proBtn.length){
			alert('not found the good');
			return
		}
		simulateClick('.box-btn-group>.box-btn-left');
		setTimeout(()=>{
			$('.dialog-ft>[mx-click="submit"]').click();
			setTimeout(()=>{
				var url=$('#clipboard-target-2').val()||$('#clipboard-target').val();
				$('[mx-click="tab(4)"]').click();
				var taoToken=$('#clipboard-target-2').val()||$('#clipboard-target').val();
				$('.dialog-ft>[mx-click="close"]').click();
				good.proURL=url;
				good.taoToken=taoToken;
				chrome.runtime.sendMessage(extensionID,{
					cmd:"sendGood",
					args:[good]
				},function(data){
					if(data){
						
					} else {
						
					}
				});
			},5000);
		},5000);
	},5000);
	return;
}

function decodeGood(good){
	var newGood={};
	for (var prop in good){
		newGood[prop]=decodeURIComponent(good[prop]);
	}
	return newGood;
}
function getGoodURL(good){
	if('tmall'===good.client){
		return 'https://detail.tmall.com/item.htm?id='+good.id;
	}else if('taobao'===good.client){
		return 'https://item.taobao.com/item.htm?id='+good.id;
	}else{
		return null;
	}
}

function waitFor(fun,callback){
	if(fun())
		setTimeout(()=>{waitFor(fun,callback)},1000);
	else
		callback();
}
function simulateClick(selector) {
  var evt = document.createEvent("MouseEvents");
  evt.initMouseEvent("click", true, true, window,
    0, 0, 0, 0, 0, false, false, false, false, 0, null);
  var ele=$(selector);
  if(1!=ele.length)
  	return false
  ele[0].dispatchEvent(evt);
  return true;
}



});


