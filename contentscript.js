(function(global,factory){
	factory(global);
})(window,function(global){


var script = document.createElement('script');
var idScript=document.createElement('script');

idScript.src='data:text/javascript;base64,'+btoa("window.extensionID='"+chrome.runtime.id+"';");
idScript.onload=function(){this.remove();};

var editorURL=chrome.extension.getURL('editor.html');
if ("wx2.qq.com"==location.hostname) {
/*	script.src = chrome.extension.getURL('wcScript.js');
	$.ajax({
		url:editorURL,
		success:function(data){
			var html=$.parseHTML(data);
			var body=$("body");
			for (var len=html.length, i=0;i<len;++i){
				body.append(html[i]);
			}
		}
	});*/

} else if ("pub.alimama.com"==location.hostname) {
	script.src = chrome.extension.getURL('aliScript.js');
	jQueryScript=document.createElement('script');
	jQueryScript.src=chrome.extension.getURL('jquery-3.2.1.js');
	jQueryScript.onload = function(){
		this.remove();
	};
	(document.head || document.documentElement).appendChild(jQueryScript);
}
script.onload = function() {
	this.remove();
};

(document.head || document.documentElement).appendChild(script);
(document.head || document.documentElement).appendChild(idScript);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	if(!request.cmd)
  		return;
  	if(!request.args)
  		return;
  	switch(request.cmd){
  		case 'getActionCode':
  			runjs('getActionCode',request.args,sendResponse);
  			return true;
  		break;
  		case 'sendGood':
  			runjs('sendGood',request.args,sendResponse);
  			return true;
  		break;
  		default:

  		break;
  	}

});

function runjs(fun,args,callback){
	ele=document.createElement('script');
	var html='\
		(()=>{\
			var ret='+fun+'.call(window,'+args[0]+');\
			document.currentScript.setAttribute("data-return",ret);\
		})();';
	ele.onload=function(){
		callback(this.dataset.return);
		this.remove();
	};
	url='data:text/javascript;base64,'+btoa(html);
	ele.src=url;
	(document.head || document.documentElement).appendChild(ele);
}

});

confFactory={"LANG":"en_US","EMOTICON_REG":"img\\sclass=\"(qq)?emoji (qq)?emoji([\\da-f]*?)\"\\s(text=\"[^<>(\\s]*\")?\\s?src=\"[^<>(\\s]*\"\\s*","RES_PATH":"/zh_CN/htmledition/v2/","API_jsLogin":"https://login.wx2.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=http…Fwx2.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&lang=en_US","API_login":"https://login.wx2.qq.com/cgi-bin/mmwebwx-bin/login","API_synccheck":"https://webpush.wx2.qq.com/cgi-bin/mmwebwx-bin/synccheck","API_webwxdownloadmedia":"https://file.wx2.qq.com/cgi-bin/mmwebwx-bin/webwxgetmedia","API_webwxuploadmedia":"https://file.wx2.qq.com/cgi-bin/mmwebwx-bin/webwxuploadmedia","API_webwxpreview":"/cgi-bin/mmwebwx-bin/webwxpreview","API_webwxinit":"/cgi-bin/mmwebwx-bin/webwxinit?r=-640606262","API_webwxgetcontact":"/cgi-bin/mmwebwx-bin/webwxgetcontact","API_webwxsync":"/cgi-bin/mmwebwx-bin/webwxsync","API_webwxbatchgetcontact":"/cgi-bin/mmwebwx-bin/webwxbatchgetcontact","API_webwxgeticon":"/cgi-bin/mmwebwx-bin/webwxgeticon","API_webwxsendmsg":"/cgi-bin/mmwebwx-bin/webwxsendmsg","API_webwxsendmsgimg":"/cgi-bin/mmwebwx-bin/webwxsendmsgimg","API_webwxsendmsgvedio":"/cgi-bin/mmwebwx-bin/webwxsendvideomsg","API_webwxsendemoticon":"/cgi-bin/mmwebwx-bin/webwxsendemoticon","API_webwxsendappmsg":"/cgi-bin/mmwebwx-bin/webwxsendappmsg","API_webwxgetheadimg":"/cgi-bin/mmwebwx-bin/webwxgetheadimg","API_webwxgetmsgimg":"/cgi-bin/mmwebwx-bin/webwxgetmsgimg","API_webwxgetmedia":"/cgi-bin/mmwebwx-bin/webwxgetmedia","API_webwxgetvideo":"/cgi-bin/mmwebwx-bin/webwxgetvideo","API_webwxlogout":"/cgi-bin/mmwebwx-bin/webwxlogout","API_webwxgetvoice":"/cgi-bin/mmwebwx-bin/webwxgetvoice","API_webwxupdatechatroom":"/cgi-bin/mmwebwx-bin/webwxupdatechatroom","API_webwxcreatechatroom":"/cgi-bin/mmwebwx-bin/webwxcreatechatroom","API_webwxstatusnotify":"/cgi-bin/mmwebwx-bin/webwxstatusnotify","API_webwxcheckurl":"/cgi-bin/mmwebwx-bin/webwxcheckurl","API_webwxverifyuser":"/cgi-bin/mmwebwx-bin/webwxverifyuser","API_webwxfeedback":"/cgi-bin/mmwebwx-bin/webwxsendfeedback","API_webwxreport":"/cgi-bin/mmwebwx-bin/webwxstatreport","API_webwxsearch":"/cgi-bin/mmwebwx-bin/webwxsearchcontact","API_webwxoplog":"/cgi-bin/mmwebwx-bin/webwxoplog","API_checkupload":"/cgi-bin/mmwebwx-bin/webwxcheckupload","API_webwxrevokemsg":"/cgi-bin/mmwebwx-bin/webwxrevokemsg","API_webwxpushloginurl":"/cgi-bin/mmwebwx-bin/webwxpushloginurl","oplogCmdId":{"TOPCONTACT":3,"MODREMARKNAME":2},"SP_CONTACT_FILE_HELPER":"filehelper","SP_CONTACT_NEWSAPP":"newsapp","SP_CONTACT_RECOMMEND_HELPER":"fmessage","CONTACTFLAG_CONTACT":1,"CONTACTFLAG_CHATCONTACT":2,"CONTACTFLAG_CHATROOMCONTACT":4,"CONTACTFLAG_BLACKLISTCONTACT":8,"CONTACTFLAG_DOMAINCONTACT":16,"CONTACTFLAG_HIDECONTACT":32,"CONTACTFLAG_FAVOURCONTACT":64,"CONTACTFLAG_3RDAPPCONTACT":128,"CONTACTFLAG_SNSBLACKLISTCONTACT":256,"CONTACTFLAG_NOTIFYCLOSECONTACT":512,"CONTACTFLAG_TOPCONTACT":2048,"MM_USERATTRVERIFYFALG_BIZ":1,"MM_USERATTRVERIFYFALG_FAMOUS":2,"MM_USERATTRVERIFYFALG_BIZ_BIG":4,"MM_USERATTRVERIFYFALG_BIZ_BRAND":8,"MM_USERATTRVERIFYFALG_BIZ_VERIFIED":16,"MM_DATA_TEXT":1,"MM_DATA_HTML":2,"MM_DATA_IMG":3,"MM_DATA_PRIVATEMSG_TEXT":11,"MM_DATA_PRIVATEMSG_HTML":12,"MM_DATA_PRIVATEMSG_IMG":13,"MM_DATA_VOICEMSG":34,"MM_DATA_PUSHMAIL":35,"MM_DATA_QMSG":36,"MM_DATA_VERIFYMSG":37,"MM_DATA_PUSHSYSTEMMSG":38,"MM_DATA_QQLIXIANMSG_IMG":39,"MM_DATA_POSSIBLEFRIEND_MSG":40,"MM_DATA_SHARECARD":42,"MM_DATA_VIDEO":43,"MM_DATA_VIDEO_IPHONE_EXPORT":44,"MM_DATA_EMOJI":47,"MM_DATA_LOCATION":48,"MM_DATA_APPMSG":49,"MM_DATA_VOIPMSG":50,"MM_DATA_STATUSNOTIFY":51,"MM_DATA_VOIPNOTIFY":52,"MM_DATA_VOIPINVITE":53,"MM_DATA_MICROVIDEO":62,"MM_DATA_SYSNOTICE":9999,"MM_DATA_SYS":10000,"MM_DATA_RECALLED":10002,"MSGTYPE_TEXT":1,"MSGTYPE_IMAGE":3,"MSGTYPE_VOICE":34,"MSGTYPE_VIDEO":43,"MSGTYPE_MICROVIDEO":62,"MSGTYPE_EMOTICON":47,"MSGTYPE_APP":49,"MSGTYPE_VOIPMSG":50,"MSGTYPE_VOIPNOTIFY":52,"MSGTYPE_VOIPINVITE":53,"MSGTYPE_LOCATION":48,"MSGTYPE_STATUSNOTIFY":51,"MSGTYPE_SYSNOTICE":9999,"MSGTYPE_POSSIBLEFRIEND_MSG":40,"MSGTYPE_VERIFYMSG":37,"MSGTYPE_SHARECARD":42,"MSGTYPE_SYS":10000,"MSGTYPE_RECALLED":10002,"MSG_SEND_STATUS_READY":0,"MSG_SEND_STATUS_SENDING":1,"MSG_SEND_STATUS_SUCC":2,"MSG_SEND_STATUS_FAIL":5,"APPMSGTYPE_TEXT":1,"APPMSGTYPE_IMG":2,"APPMSGTYPE_AUDIO":3,"APPMSGTYPE_VIDEO":4,"APPMSGTYPE_URL":5,"APPMSGTYPE_ATTACH":6,"APPMSGTYPE_OPEN":7,"APPMSGTYPE_EMOJI":8,"APPMSGTYPE_VOICE_REMIND":9,"APPMSGTYPE_SCAN_GOOD":10,"APPMSGTYPE_GOOD":13,"APPMSGTYPE_EMOTION":15,"APPMSGTYPE_CARD_TICKET":16,"APPMSGTYPE_REALTIME_SHARE_LOCATION":17,"APPMSGTYPE_TRANSFERS":2000,"APPMSGTYPE_RED_ENVELOPES":2001,"APPMSGTYPE_READER_TYPE":100001,"UPLOAD_MEDIA_TYPE_IMAGE":1,"UPLOAD_MEDIA_TYPE_VIDEO":2,"UPLOAD_MEDIA_TYPE_AUDIO":3,"UPLOAD_MEDIA_TYPE_ATTACHMENT":4,"PROFILE_BITFLAG_NOCHANGE":0,"PROFILE_BITFLAG_CHANGE":190,"CHATROOM_NOTIFY_OPEN":1,"CHATROOM_NOTIFY_CLOSE":0,"StatusNotifyCode_READED":1,"StatusNotifyCode_ENTER_SESSION":2,"StatusNotifyCode_INITED":3,"StatusNotifyCode_SYNC_CONV":4,"StatusNotifyCode_QUIT_SESSION":5,"VERIFYUSER_OPCODE_ADDCONTACT":1,"VERIFYUSER_OPCODE_SENDREQUEST":2,"VERIFYUSER_OPCODE_VERIFYOK":3,"VERIFYUSER_OPCODE_VERIFYREJECT":4,"VERIFYUSER_OPCODE_SENDERREPLY":5,"VERIFYUSER_OPCODE_RECVERREPLY":6,"ADDSCENE_PF_QQ":4,"ADDSCENE_PF_EMAIL":5,"ADDSCENE_PF_CONTACT":6,"ADDSCENE_PF_WEIXIN":7,"ADDSCENE_PF_GROUP":8,"ADDSCENE_PF_UNKNOWN":9,"ADDSCENE_PF_MOBILE":10,"ADDSCENE_PF_WEB":33,"TIMEOUT_SYNC_CHECK":0,"EMOJI_FLAG_GIF":2,"KEYCODE_BACKSPACE":8,"KEYCODE_ENTER":13,"KEYCODE_SHIFT":16,"KEYCODE_ESC":27,"KEYCODE_DELETE":34,"KEYCODE_ARROW_LEFT":37,"KEYCODE_ARROW_UP":38,"KEYCODE_ARROW_RIGHT":39,"KEYCODE_ARROW_DOWN":40,"KEYCODE_NUM2":50,"KEYCODE_AT":64,"KEYCODE_NUM_ADD":107,"KEYCODE_NUM_MINUS":109,"KEYCODE_ADD":187,"KEYCODE_MINUS":189,"MM_NOTIFY_CLOSE":0,"MM_NOTIFY_OPEN":1,"MM_SOUND_CLOSE":0,"MM_SOUND_OPEN":1,"MM_SEND_FILE_STATUS_QUEUED":0,"MM_SEND_FILE_STATUS_SENDING":1,"MM_SEND_FILE_STATUS_SUCCESS":2,"MM_SEND_FILE_STATUS_FAIL":3,"MM_SEND_FILE_STATUS_CANCEL":4,"MM_EMOTICON_WEB":"_web","RES_IMG_DEFAULT":"/zh_CN/htmledition/v2/images/img.gif","RES_IMG_PLACEHOLDER":"/zh_CN/htmledition/v2/images/spacer.gif","RES_SOUND_RECEIVE_MSG":"/zh_CN/htmledition/v2/sound/msg.mp3","RES_SOUND_SEND_MSG":"/zh_CN/htmledition/v2/sound/text.mp3"}

/*
messageProcess: function(e) {
    var t = this
      , a = contactFactory.getContact(e.FromUserName, "", !0);
    if (!a || a.isMuted() || a.isSelf() || a.isShieldUser() || a.isBrandContact() || titleRemind.increaseUnreadMsgNum(),
    e.MMPeerUserName = t._getMessagePeerUserName(e),
    e.MsgType == confFactory.MSGTYPE_STATUSNOTIFY)
        return void t._statusNotifyProcessor(e);
    if (e.MsgType != confFactory.MSGTYPE_SYSNOTICE && !(utilFactory.isShieldUser(e.FromUserName) || utilFactory.isShieldUser(e.ToUserName) || e.MsgType == confFactory.MSGTYPE_VERIFYMSG && e.RecommendInfo && e.RecommendInfo.UserName == accountFactory.getUserInfo().UserName)) {
        switch (t._commonMsgProcess(e),
        e.MsgType) {
        case confFactory.MSGTYPE_APP:
            try {
                e.MMIsAppMsg = !0,
                t._appMsgProcess(e)
            } catch (e) {}
            break;
        case confFactory.MSGTYPE_EMOTICON:
            t._emojiMsgProcess(e);
            break;
        case confFactory.MSGTYPE_IMAGE:
            t._imageMsgProcess(e);
            break;
        case confFactory.MSGTYPE_VOICE:
            t._voiceMsgProcess(e);
            break;
        case confFactory.MSGTYPE_VIDEO:
            t._videoMsgProcess(e);
            break;
        case confFactory.MSGTYPE_MICROVIDEO:
            t._mircovideoMsgProcess(e);
            break;
        case confFactory.MSGTYPE_TEXT:
            "newsapp" == e.FromUserName ? t._newsMsgProcess(e) : e.AppMsgType == confFactory.APPMSGTYPE_RED_ENVELOPES ? (e.MsgType = confFactory.MSGTYPE_APP,
            t._appMsgProcess(e)) : e.SubMsgType == confFactory.MSGTYPE_LOCATION ? t._locationMsgProcess(e) : t._textMsgProcess(e);
            break;
        case confFactory.MSGTYPE_RECALLED:
            return void t._recalledMsgProcess(e);
        case confFactory.MSGTYPE_LOCATION:
            t._locationMsgProcess(e);
            break;
        case confFactory.MSGTYPE_VOIPMSG:
        case confFactory.MSGTYPE_VOIPNOTIFY:
        case confFactory.MSGTYPE_VOIPINVITE:
            t._voipMsgProcess(e);
            break;
        case confFactory.MSGTYPE_POSSIBLEFRIEND_MSG:
            t._recommendMsgProcess(e);
            break;
        case confFactory.MSGTYPE_VERIFYMSG:
            t._verifyMsgProcess(e);
            break;
        case confFactory.MSGTYPE_SHARECARD:
            t._shareCardProcess(e);
            break;
        case confFactory.MSGTYPE_SYS:
            t._systemMsgProcess(e);
            break;
        default:
            e.MMDigest = _("938b111")
        }
        e.MMActualContent = utilFactory.hrefEncode(e.MMActualContent);
        var n = contactFactory.getContact(e.MMPeerUserName);
        e.MMIsSend || n && (n.isMuted() || n.isBrandContact()) || e.MsgType == confFactory.MSGTYPE_SYS || (accountFactory.isNotifyOpen() && t._notify(e),
        accountFactory.isSoundOpen() && utilFactory.initMsgNoticePlayer(confFactory.RES_SOUND_RECEIVE_MSG)),
        t.addChatMessage(e),
        t.addChatList([e])
    }
}*/