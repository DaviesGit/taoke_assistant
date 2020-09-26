
(function(global,factory){
	factory(global);
})(window,function(global){

var goods=[];

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
  	if (!request.cmd)
  		return
  	if (!request.args)
  		return
  	switch(request.cmd){
  		case "addGood":
  			var args=request.args;
  			args.push(sendResponse);
  			addGood.apply(null, args);
  			return true;
  		break;
  		case "sendGood":
  			var args=request.args;
  			args.push(sendResponse);
  			sendGood.apply(null,args);
  		break;
  		default:

  		break;
  	}
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

  	if (!request.cmd)
  		return
  	if (!request.args)
  		return
  	var ret=null;
  	switch(request.cmd){
  		case "addGood":
  			ret=addGood.apply(null, request.args);
  		break;
  		case "sendGood":
  			ret=sendGood.apply(null, request.args);
  		break;
  		default:

  		break;
  	}
  	if(!sendResponse)
  		return;
  	sendResponse(ret);
  	
});


function addGood(good,callback){
	goodInfoArray=good.split('\n');
	if(5!=goodInfoArray.length){
		alert("good format error!");
		return false;
	}
	getRealURL(goodInfoArray[3].match(/\bhttps?:\/\/\S+/gi)[0],(url)=>{
		var regexRes=url.match(/id=\d+/);
		if (!regexRes){
			alert('good url error!');
			callback(false);
		}
		var id=regexRes[0].substr(3);
		client=url.match(/\.[a-z]+\.com/)[0];
		var client=client.substring(1,client.length-4);
		goodInfo={
			tittle:goodInfoArray[0],
			price:goodInfoArray[1],
			activety:goodInfoArray[2],
			buy:goodInfoArray[3],
			intro:goodInfoArray[4],
			client:client,
			id:id
		}
		goods.push(goodInfo);
		callback(true);
	});
}
function sendGood(good,callback){
	runInWc('sendGood',[JSON.stringify(encodeGood(good))],(data)=>{
		//alert(data);
	})
	return true;
}

function runInWc(fun,args,callback){
	chrome.tabs.query({url:'*://wx2.qq.com/*'},function(tabs){
		if(1!=tabs.length)
			return alert("please open the web weChat!");
		chrome.tabs.sendMessage(tabs[0].id,{
			cmd:fun,
			args:args
		},{},callback);
	});
}

function runInAli(fun,args,callback){
	chrome.tabs.query({url:'*://pub.alimama.com/*'},function(tabs){
		if(1!=tabs.length)
			return alert("please open the alimama page");
		chrome.tabs.sendMessage(tabs[0].id,{
			cmd:fun,
			args:args
		},{},callback);
	});
}

setInterval(()=>{
	var good=goods.pop();
	if (!good)
		return;
	runInAli('getActionCode',[JSON.stringify(encodeGood(good))],(data)=>{
		//alert(data);
	})
},10);

function encodeGood(good){
	var newGood={};
	for (var prop in good){
		newGood[prop]=encodeURIComponent(good[prop]);
	}
	return newGood;
}

function getRealURL(url,callback){
	var regexRes=url.match(/id=\d+/);
	if (regexRes&&(
		-1<url.indexOf('item.taobao.com')||
		-1<url.indexOf('detail.tmall.com'))){
		callback(url);
		return;
	}

	chrome.tabs.create({
		url: url
		,active:false},
		(tab)=>{
			var newTab;
			waitFor(()=>{
				chrome.tabs.query({},(tabs)=>{
					for (var len=tabs.length,i=0;i<len;++i){
						if(tabs[i].id===tab.id){
							newTab=tabs[i];
							break;
						}
					}
				})
				if(newTab)
					return -1===newTab.url.indexOf('item.taobao.com') && -1===newTab.url.indexOf('detail.tmall.com');
				return true;
			},()=>{
				callback(newTab.url);
				chrome.tabs.remove(newTab.id);
			})
	});

}

function waitFor(fun,callback){
	if(fun())
		setTimeout(()=>{waitFor(fun,callback)},1);
	else
		callback();
}

function openTaokeAssistant(){
	url=chrome.extension.getURL('webpage/index.html');
	chrome.tabs.create({url: url});
}

openTaokeAssistant();

});

