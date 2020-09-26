(function(global, factory) {
    factory(global);
})(window, function(global) {

    "use strict";

    var msgType = {
        MSGTYPE_TEXT: 1,
        MSGTYPE_IMAGE: 3,
        MSGTYPE_VOICE: 34,
        MSGTYPE_VIDEO: 43,
        MSGTYPE_MICROVIDEO: 62,
        MSGTYPE_EMOTICON: 47,
        MSGTYPE_APP: 49,
        MSGTYPE_VOIPMSG: 50,
        MSGTYPE_VOIPNOTIFY: 52,
        MSGTYPE_VOIPINVITE: 53,
        MSGTYPE_LOCATION: 48,
        MSGTYPE_STATUSNOTIFY: 51,
        MSGTYPE_SYSNOTICE: 9999,
        MSGTYPE_POSSIBLEFRIEND_MSG: 40,
        MSGTYPE_VERIFYMSG: 37,
        MSGTYPE_SHARECARD: 42,
        MSGTYPE_SYS: 1e4
    };



    var WcData = {
        status: {
            isLogin: false,
            continuoussynccheckerrors: 0,
            checkLoginTimes: 0,
            SyncKey: null
        },
        loginInfo: {
            Skey: '',
            sid: '',
            uin: '',
            uuid: ''
        },
        contact: {
            allContacts: null,
            groupContacts: [],
            officialContacts: [],
            contacts: [],
            groupMembers: null
        },
        msg: {
            queue: [],
            isSending: false
        },
        user: null
    };

    var wc = {
        WcData: WcData,
        msgType: msgType
    };

    var conf = {
        managedGroup: [],
        mainURL: 'https://wx.qq.com/',
        mainURLwx: 'wx'
    };

    conf.managedGroup.isUserNameIn = function(UserName) {
        for (var group of this) {
            if (UserName === group.UserName) {
                return true;
            }
        }
        return false;
    };
    conf.managedGroup.isNickNameIn = function(NickName) {
        for (var group of this) {
            if (NickName === group.NickName) {
                return true;
            }
        }
        return false;
    };

    /*
     *	{
     *		NickName:'',
     *		UserName:
     *	}
     */
    conf.managedGroup.add = function(user) {
        var user = $.extend({}, user);
        if (user.NickName) {
            user.UserName = toUserName(user.NickName);
        } else if (user.UserName) {
            user.NickName = toNickName(user.UserName);
        } else {
            return false;
        }
        if (!user.NickName || !user.UserName) {
            return false;
        }
        this.push(user);
        return true;
    };

    wc.getContact = function getContact(UserName) {
        for (var contact of WcData.contact.allContacts) {
            if (UserName === contact.UserName) {
                return contact;
            }
        }
        if (UserName === WcData.user.UserName) {
            return WcData.user;
        }
        return null;
    }

    function toUserName(NickName) {
        for (var contact of WcData.contact.allContacts) {
            if (NickName === contact.NickName) {
                return contact.UserName;
            }
        }
        return '';
    }

    function touserid(nickName) {
        var nickName = nickName.substring(0, 7);
        var base62 = $.encodeBase62(nickName);
        return base62;
    }

    function toNickName(UserName) {
        for (var contact of WcData.contact.allContacts) {
            if (UserName === contact.UserName) {
                return contact.NickName;
            }
        }
        return '';
    }

    function toGroupMemNickName(groupUserName, userName) {
        var group = getGroup(groupUserName);
        if (!group) {
            alert('toGroupMemNickName function error! can\'t find the specified group!');
            return '';
        }
        for (var mem of group.MemberList) {
            if (userName === mem.UserName) {
                return mem.NickName;
            }
        }
        return '';
    }

    function getGroup(groupUserName) {
        for (var group of WcData.contact.groupMembers) {
            if (groupUserName === group.UserName) {
                return group;
            }
        }
        return null;
    }


    function getDeviceID() {
        return "e" + ("" + Math.random().toFixed(15)).substring(2, 17);
    }


    function getWcUUID(callback) {
        var url = 'https://login.wx.qq.com/jslogin?appid=wx782c26e4c19acffb&lang=en_US';
        $.ajax({ url: url }).done((data) => {
            var match = data.match(/window\.QRLogin\.uuid[^;]+;/);
            if (!match) {
                alert('WcChat "getWcUUID" network return value error!');
                callback('');
                return;
            }
            var match = match[0].match(/\".+\"/);
            if (!match) {
                alert('uuid expression value error!');
                callback('');
                return;
            }
            var uuid = match[0].substring(1, match[0].length - 1);
            callback(uuid);
        });
    }

    function showQRCode(uuid) {
        var url = 'https://login.weixin.qq.com/qrcode/' + uuid;
        $('#QRCode').attr('src', url);
    }

    function checkLogin(callback) {
        if (WcData.status.checkLoginTimes) {
            ++WcData.status.checkLoginTimes;
        } else {
            WcData.status.checkLoginTimes = 1;
        }
        if (10 < WcData.status.checkLoginTimes) {
            alert('login time out! please refresh this page!');
            callback('');
            return;
        }
        if (!WcData.loginInfo.uuid) {
            alert('not find uuid in WcData object!');
            callback('');
            return;
        }
        var url = 'https://login.wx.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid=' + WcData.loginInfo.uuid + '&tip=0&r=' + ~new Date();
        $.ajax({ url: url }).done((data) => {
            var match = data.match(/window.code[^;]+;/);
            if (!match) {
                alert('can\'t get Login status code!');
                callback('');
                return;
            }
            match = match[0].match(/=\d+;/);
            if (!match) {
                alert('can\'t get Login status code!');
                callback('');
                return;
            }
            var code = match[0].substring(1, match[0].length - 1);
            switch (code) {
                case '408':
                    checkLogin(callback);
                    break;
                case '400':
                    checkLogin(callback);
                    break;
                case '201':
                    checkLogin(callback);
                    break;
                case '200':
                    try {
                        var match = data.match(/window\.redirect_uri[^;]+;/);
                        if (!match) {
                            throw 'redirect url error!';
                        }
                        match = match[0].match(/\".+\"/);
                        if (!match) {
                            throw 'redirect url value error!';
                        }
                        var url = match[0].substring(1, match[0].length - 1);
                        match = url.match(/wx\d?\.qq\.com/);
                        if (!match) {
                            throw 'redirect url format error!';
                        }
                        // change global URL conf.
                        var temp = match[0];
                        conf.mainURL = 'https://' + temp + '/';
                        conf.mainURLwx = temp.substring(0, temp.length - 7);
                    } catch (e) {
                        alert(e);
                        callback('');
                        return;
                    }
                    callback(url);
                    return;
                    break;
                default:
                    alert('checklogin status error!');
            }
        });
    }

    function WcLogin(url, callback) {
        $.ajax({ url: url }).done(callback);
    }

    function baseRequest(callback) {
        chrome.cookies.getAll({ url: conf.mainURL }, (cookies) => {
            var loginData = {
                loginInfo: {}
            };
            for (var cookie of cookies) {
                switch (cookie.name) {
                    case 'wxuin':
                        loginData.loginInfo.uin = cookie.value;
                        break;
                    case 'wxsid':
                        loginData.loginInfo.sid = cookie.value;
                        break;
                    default:

                }
                if (loginData.loginInfo.uin && loginData.loginInfo.sid) {
                    callback(loginData);
                    return;
                }
            }
            //alert('can\'t find WeChat cookies!');
            callback(null);
        });
    }

    function webwxinit(callback) {
        $.ajax({
            dataType: 'json',
            type: 'POST',
            url: conf.mainURL + 'cgi-bin/mmwebwx-bin/webwxinit?r=' + ~new Date(),
            data: JSON.stringify({
                BaseRequest: {
                    Uin: WcData.loginInfo.uin,
                    Sid: WcData.loginInfo.sid,
                    Skey: "",
                    DeviceID: getDeviceID()
                }
            })
        }).done((data) => {
            if (!data.BaseResponse || data.BaseResponse.Ret) {
                callback(null);
                return;
            }
            if (!data.User || !data.SyncKey) {
                callback(null);
                return;
            };
            var ret = {
                user: data.User,
                status: {
                    SyncKey: data.SyncKey
                },
                loginInfo: {
                    Skey: data.SKey
                }
            };
            callback(ret);
        });
    }

    function webwxgetcontact(callback) {
        if (!WcData.loginInfo.Skey) {
            alert('WeChat login data error!');
            callback();
            return;
        }
        var url = conf.mainURL + 'cgi-bin/mmwebwx-bin/webwxgetcontact?r=' + new Date().getTime() + '&seq=0&skey=' + WcData.loginInfo.Skey;
        $.ajax({
            url: url,
            dataType: 'json'
        }).done((data) => {
            if (!data.BaseResponse || data.BaseResponse.Ret) {
                callback(null);
                return;
            }
            callback(data.MemberList);
        });
    }

    function parseContact(contact) {
        for (var ctc of contact.allContacts) {
            if ('@@' === ctc.UserName.substr(0, 2)) {
                contact.groupContacts.push(ctc);
            } else if (0 < ctc.AttrStatus) {
                contact.contacts.push(ctc);
            } else {
                contact.officialContacts.push(ctc);
            }
        }
        return true;
    }

    function webwxbatchgetcontact(groupContacts, callback) {
        if (0 === groupContacts.length) {
            callback([]);
            return;
        }
        var url = conf.mainURL + 'cgi-bin/mmwebwx-bin/webwxbatchgetcontact?type=ex&r=' + (+new Date);
        $.ajax({
            url: url,
            data: JSON.stringify({
                BaseRequest: getBaseRequest(),
                Count: groupContacts.length,
                List: groupContacts
            }),
            dataType: 'json',
            type: 'POST'
        }).done((data) => {
            if (!data.BaseResponse || data.BaseResponse.Ret) {
                callback(null);
                return;
            }
            callback(data.ContactList);
        });
    }


    function getBaseRequest() {
        if (!WcData.loginInfo.uin || !WcData.loginInfo.sid || !WcData.loginInfo.Skey) {
            return null;
        }
        var BaseRequest = {
            Uin: WcData.loginInfo.uin,
            Sid: WcData.loginInfo.sid,
            Skey: WcData.loginInfo.Skey,
            DeviceID: getDeviceID()
        }
        return BaseRequest;
    }

    function login(callback) {
        function login_(callback) {
            getWcUUID((uuid) => {
                WcData.loginInfo.uuid = uuid;
                showQRCode(uuid);
            });
            setTimeout(() => {
                checkLogin((url) => {
                    if (!url) {
                        return false;
                    }
                    WcLogin(url, () => {
                        baseRequest((data) => {
                            if (!data) {
                                alert('baseRequest can\'t get the specified cookies');
                                callback(false);
                                return;
                            }
                            $.extend(true, WcData, data);
                            webwxinit((data) => {
                                if (!data) {
                                    alert('webwxinit error!');
                                    callback(false);
                                    return;
                                }
                                $.extend(true, WcData, data);
                                callback(true);
                            });
                        })
                    });
                });
            }, 1000);
        }
        baseRequest((baseReq) => {
            function next(baseReq) {
                if (baseReq) {
                    $.extend(true, WcData, baseReq);
                    webwxinit((data) => {
                        if (!data) {
                            login_(callback);
                            return;
                        }
                        $.extend(true, WcData, data);
                        callback(true);
                    });
                } else {
                    login_(callback);
                }
            }
            if (baseReq) {
                next(baseReq);
            } else {
                conf.mainURL = 'https://wx2.qq.com/';
                conf.mainURLwx = 'wx2';
                baseRequest((baseReq) => {
                    next(baseReq);
                });
            }
        });
    }

    function getsynckey() {
        var synckeys = '';
        var list = WcData.status.SyncKey.List;
        for (var len = list.length, i = 0; i < len; ++i) {
            synckeys += list[i].Key + '_' + list[i].Val;
            if (i < len - 1) {
                synckeys += '|';
            }
        }
        return synckeys;
    }

    function runReceive(callback) {
        synccheck((data) => {
            if (!data || '0' !== data.retcode) {
                alert('synccheck error!');
                return;
            }
            if ('0' !== data.selector) {
                webwxsync((data) => {
                    if (!data || data.BaseResponse.Ret) {
                        alert('retrieve message faild!');
                        return;
                    }
                    WcData.status.SyncKey = data.SyncKey;
                    msgProc(data, () => {
                        runReceive(callback);
                    });
                });
            } else {
                runReceive(callback);
            }
            callback(data);
        });
    }

    function synccheck(callback) {
        if (!WcData.loginInfo.Skey || !WcData.loginInfo.sid || !WcData.loginInfo.uin || !WcData.status.SyncKey || !WcData.status.SyncKey.List) {
            alert("WcData object member missing!");
            callback(null);
            return;
        }
        var url = 'https://webpush.' + conf.mainURLwx + '.qq.com/cgi-bin/mmwebwx-bin/synccheck?r=' + new Date().getTime() +
            '&skey=' + encodeURIComponent(WcData.loginInfo.Skey) +
            '&sid=' + encodeURIComponent(WcData.loginInfo.sid) +
            '&uin=' + WcData.loginInfo.uin +
            '&deviceid=' + getDeviceID() +
            '&synckey=' + encodeURIComponent(getsynckey());
        $.ajax({ url: url }).done((data) => {
            var obj = {};
            try {
                var reg = data.match(/retcode: *\"\d*\"/);
                if (!reg)
                    throw 'synccheck return value error!';
                var str = reg[0];
                reg = str.match(/\"\d*\"/);
                if (!reg)
                    throw 'synccheck return value error!';
                str = reg[0];
                obj.retcode = str.substring(1, str.length - 1);
                reg = data.match(/selector: *\"\d*\"/);
                if (!reg)
                    throw 'synccheck return value error!';
                str = reg[0];
                reg = str.match(/\"\d*\"/);
                if (!reg)
                    throw 'synccheck return value error!';
                str = reg[0];
                obj.selector = str.substring(1, str.length - 1);
            } catch (e) {
                ++WcData.status.continuoussynccheckerrors;
                if (10 < WcData.status.continuoussynccheckerrors) {
                    alert(e);
                    alert('more than 10 times synccheck error!');
                    callback(null);
                    return;
                } else {
                    synccheck(callback);
                    return;
                }
            }
            WcData.status.continuoussynccheckerrors = 0;
            callback(obj);
        });
    }

    function webwxsync(callback) {
        if (!WcData.loginInfo.Skey || !WcData.loginInfo.sid || !WcData.loginInfo.uin || !WcData.status.SyncKey || !WcData.status.SyncKey.List) {
            alert("WcData object member missing!");
            callback(null);
            return;
        }
        var url = conf.mainURL + 'cgi-bin/mmwebwx-bin/webwxsync?sid=' + encodeURIComponent(WcData.loginInfo.sid) +
            'S&skey=' + WcData.loginInfo.Skey;
        var baseReq = getBaseRequest();
        if (!baseReq) {
            callback(null);
            return;
        }
        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify({
                BaseRequest: baseReq,
                SyncKey: WcData.status.SyncKey
            }),
            dataType: 'json'
        }).done((data) => {
            callback(data);
        });
    }

    function webwxstatusnotify(userInfo, callback) {
        $.ajax({
            url: conf.mainURL + 'cgi-bin/mmwebwx-bin/webwxstatusnotify',
            type: 'POST',
            data: JSON.stringify({
                BaseRequest: getBaseRequest(),
                ClientMsgId: +new Date,
                Code: 1,
                FromUserName: userInfo.from,
                ToUserName: userInfo.to
            }),
            dataType: 'json'
        }).done((data) => {
            callback(data);
        });
    }

    function modContactProc(contacts) {
        for (var contact of contacts) {
            if (conf.managedGroup.isNickNameIn(contact.NickName)) {
                for (var group of WcData.contact.groupMembers) {
                    if (group.UserName === contact.UserName) {
                        group.MemberCount = contact.MemberCount;
                        group.MemberList = contact.MemberList;
                        break;
                    }
                }
            }
        }
    }

    function msgProc(msgs, callback) {
        if (0 < msgs.ModContactCount) {
            modContactProc(msgs.ModContactList);
        }
        var msgArray = msgs.AddMsgList;
        for (var msg of msgArray) {
            switch (msg.MsgType) {
                case msgType.MSGTYPE_TEXT:
                    if ("newsapp" === msg.FromUserName) {
                        break;
                    }
                    if (msg.AppMsgType || msg.SubMsgType) {
                        break;
                    }
                    if (WcData.user.UserName === msg.FromUserName) {
                        if (parseMsg(msg))
                            $(window).trigger('contact.msg', [msg]);
                        break;
                    }
                    textMsgProc(msg, () => {});
                    break;
                case msgType.MSGTYPE_SYS:
                    sysMsgProc(msg, () => {});
                    break;
                case msgType.MSGTYPE_VERIFYMSG:
                    verifyMsgProc(msg);
                    break;
                case '':

                    break;
                case '':

                    break;
                default:

                    break;
            }
        }
        callback();
    }

    function verifyMsgProc(msg) {
        var user = {
            Value: msg.RecommendInfo.UserName,
            VerifyUserTicket: msg.RecommendInfo.Ticket
        }
        setTimeout(() => {
            confirmVerify(user);
        }, 5000);
    }
    /* 
     *    user = {
     *        Value: '@xxxx',
     *        VerifyUserTicket: 'xxxx'
     *    }
     */
    function confirmVerify(user) {
        $.ajax({
            url: '',
            data: JSON.stringify({
                BaseRequest: getBaseRequest(),
                Opcode: 3,
                SceneList: [33],
                SceneListCount: 1,
                VerifyContent: '',
                VerifyUserList: [user],
                VerifyUserListSize: 1,
                skey: WcData.loginInfo.Skey
            }),
            dataType: 'json',
            type: 'POST'
        }).done((data) => {
            if (!data.BaseResponse || data.BaseResponse.Ret) {
                alert('confirmVerify function error! can\'t verify user!');
                return;
            }
        });
    }

    function textMsgProc(msg, callback) {
        if (!parseMsg(msg)) {
            callback();
            return;
        }
        if (msg.isGroupMsg) {
            groupMsgProc(msg, callback);
        } else {
            var nickName = toNickName(msg.FromUserName);
            turingReply({
                Content: msg.realContent,
                FromUserName: WcData.user.UserName,
                userid: touserid(nickName),
                sendTime: +new Date() + (Math.random() * 2 + 3) * 1000,
                ToUserName: msg.FromUserName
            }, callback);
        }
        $(window).trigger('contact.msg', [msg]);
    }

    function parseMsg(msg) {
        var msgContent = msg.Content;
        msg.isGroupMsg = false;
        msg.fromGroupUser = '';
        msg.realContent = msgContent;
        if ('@@' === msg.FromUserName.substring(0, 2)) {
            var fromGroupUser;
            try {
                var reg = msgContent.match(/:<br\/>.*.$/);
                if (!reg)
                    throw 'message format error!';
                msgContent = reg[0];
                msgContent = msgContent.substr(6);
                reg = msg.Content.match(/@[^:]+:/);
                if (!reg) {
                    throw 'message format error!';
                }
                fromGroupUser = reg[0];
                fromGroupUser = fromGroupUser.substring(0, fromGroupUser.length - 1);
            } catch (e) {
                alert(e);
                return false;
            }
            msg.isGroupMsg = true;
            msg.fromGroupUser = fromGroupUser;
            msg.realContent = msgContent;
        }
        return true;
    }

    function groupMsgProc(msg, callback) {
        var queryInvitedStr = '\u9080\u8BF7\u67E5\u8BE2'; //邀请查询;
        var res = msg.realContent.indexOf('@' + WcData.user.NickName + '\u2005');
        if (-1 === res) {
            callback();
            return false;
        }
        res = msg.realContent.indexOf(queryInvitedStr);
        if (-1 !== res) {
            queryInvited(msg, () => {});
        } else {
            var content = msg.realContent;
            var nickName = toNickName(msg.fromGroupUser);
            content = content.replace('@' + WcData.user.NickName + '\u2005', '');
            turingReply({
                Content: content,
                FromUserName: WcData.user.UserName,
                userid: touserid(nickName),
                sendTime: +new Date() + (Math.random() * 2 + 3) * 1000,
                ToUserName: msg.FromUserName
            }, callback);
        }
    }

    function queryInvited(msg, callback) {
        var nickName = toGroupMemNickName(msg.FromUserName, msg.fromGroupUser);
        var group = getGroup(msg.FromUserName);
        if (!group || !nickName) {
            alert('queryInvited function error! can\'t get group or user info!');
            callback();
            return;
        }
        wcDB.updateInviteInfo(nickName, group.MemberList);
        wcDB.updatePoints(nickName);
        var user = wcDB.getUser(nickName);
        var invitedUser = user.inviteInfo.invitedUser.length;
        var remainUser = user.inviteInfo.remainUser.length;
        var leftUser = invitedUser - remainUser;

        var content = '\u4F60\u597D\uFF01 ' + nickName + '\n' +
            '\u9080\u8BF7\u603B\u4EBA\u6570\uFF1A' + invitedUser + '\u4EBA' + '\n' +
            '\u79BB\u7FA4\u4EBA\u6570\uFF1A' + leftUser + '\u4EBA' + '\n' +
            '\u6709\u6548\u4EBA\u6570\uFF1A' + remainUser + '\u4EBA' + '\n' +
            '\u6709\u6548\u79EF\u5206\uFF1A' + user.points.total + '\u5206' + '\n' +
            '-----------------' + '\n' +
            '\u6EE1100\u79EF\u5206\u5373\u53EF\u8054\u7CFB\u7FA4\u4E3B\u5151\u6362\u5956\u54C1\uFF01';
        /*
        你好！nickName
        邀请总人数：xx人
        离群人数：xx人
        有效人数：xx人
        有效积分：xx分
        -----------------
        满100积分即可联系群主兑换奖品！
        */


        sendMsg({
            type: 'text',
            Msg: {
                Content: content,
                FromUserName: msg.ToUserName,
                ToUserName: msg.FromUserName,
                Type: 1
            }
        }, (data) => {
            callback();
        });

    }

    function sysMsgProc(msg, callback) {
        if (!conf.managedGroup.isUserNameIn(msg.FromUserName)) {
            callback();
            return;
        }
        var content = msg.Content;
        var reg = content.match(/\".+\" invited \".+\" to the group chat/);
        if (!reg) {
            reg = content.match(/\".+\"\u9080\u8BF7\".+\"\u52A0\u5165\u4E86\u7FA4\u804A/); /*  /\".+\"邀请\".+\"加入了群聊/ */
        }
        if (!reg) {
            callback();
            return;
        }
        content = reg[0];
        reg = content.match(/\"[^\"]+\"/g);
        if (2 !== reg.length) {
            callback();
            return;
        }
        var inviter = reg[0];
        var invitee = reg[1];
        inviter = inviter.substring(1, inviter.length - 1);
        invitee = invitee.substring(1, invitee.length - 1);
        updateInviteInfo(inviter, invitee);
        welNewMem(inviter, invitee, msg.FromUserName);
        webwxbatchgetcontact([{ UserName: msg.FromUserName }], (data) => {
            if (!data || data.length !== 1) {
                alert('can\'t update group members info!');
            }
            updateGroupMember(data[0]);
            callback();
        });
    }

    function updateInviteInfo(inviter, invitee) {
        var user = wcDB.getUser(inviter);
        if (!user) {
            alert('can\'t find the inviter!');
            return;
        }
        var invitees = invitee.split('\u3001');
        for (var invite of invitees) {
            wcDB.addInviteInfo(inviter, invite);
        }
    }
    /* 
        *欢迎“xxx”入坑， 感谢“xxx”的邀请。
        *本群是天猫淘宝超值优惠券分享群， 本群的商品都是精选的超划算全网最低价商品， 并且配上超值优惠券。
        *新人请看下群公告喔。
        *-- -- -- -- -- -- -- -- -- -- -- -- -- --
        *在本群每邀请10人， 即可在群里任意挑选一件15元以下的商品， 免单喔。

     */
    function welNewMem(inviter, invitee, group) {
        var msg = '\u6B22\u8FCE\u201C' + invitee + '\u201D\u5165\u5751\uFF0C \u611F\u8C22\u201C' + inviter + '\u201D\u7684\u9080\u8BF7\u3002\n' +
            '\u672C\u7FA4\u662F\u5929\u732B\u6DD8\u5B9D\u8D85\u503C\u4F18\u60E0\u5238\u5206\u4EAB\u7FA4\uFF0C\u672C\u7FA4\u7684\u5546\u54C1\u90FD\u662F\u7CBE\u9009\u7684\u8D85\u5212\u7B97\u5168\u7F51\u6700\u4F4E\u4EF7\u5546\u54C1\uFF0C\u5E76\u4E14\u914D\u4E0A\u8D85\u503C\u4F18\u60E0\u5238\u3002\n' +
            '\u65B0\u4EBA\u8BF7\u770B\u4E0B\u7FA4\u516C\u544A\u5594\u3002\n' +
            '----------------------------\n' +
            '\u5728\u672C\u7FA4\u6BCF\u9080\u8BF710\u4EBA\uFF0C\u5373\u53EF\u5728\u7FA4\u91CC\u4EFB\u610F\u6311\u9009\u4E00\u4EF615\u5143\u4EE5\u4E0B\u7684\u5546\u54C1\uFF0C\u514D\u5355\u5594\u3002';
        sendMsg({
            type: 'text',
            sendTime: +new Date() + (Math.random() * 2 + 2) * 1000,
            Msg: {
                Content: msg,
                FromUserName: WcData.user.UserName,
                ToUserName: group,
                Type: 1
            }
        }, () => {});
    }


    /*
     *msg={
     *	Content:'',
     *	FromUserName:'',
     *  userid:'',
     *  sendTime:0, //-1 send immediately  >0 send at specified timestamp(will add to queue)
     *	ToUserName:''
     *}
     */

    function turingReply(msg, callback) {
        // callback();
        // return;
        turing({
            userid: msg.userid,
            content: msg.Content
        }, (data) => {
            console.log(msg.Content);
            console.log(data);
            if (!data) {
                callback();
                return;
            }
            sendMsg({
                type: 'text',
                sendTime: msg.sendTime,
                Msg: {
                    Content: data,
                    FromUserName: msg.FromUserName,
                    ToUserName: msg.ToUserName,
                    Type: 1
                }
            }, (data) => {
                callback();
            });
        });
    }

    /*
     *	msg={
     *	type:'text',
     *  sendTime:0, //-1 send immediately  >0 send at specified timestamp(will add to queue)
     *  callback:null,
     *	Msg:{
     *		Content:'',
     *		FromUserName:'',
     *		ToUserName:'',
     *		Type:1
     *      }
     *	}
     */

    var sendMsg = wc.sendMsg = function(msg, callback) {
        function _send(msg, callback) {
            msg.Msg.ClientMsgId = clientMsgId();
            msg.Msg.LocalID = msg.Msg.ClientMsgId;
            switch (msg.type) {
                case 'text':
                    sendText(msg, callback);
                    break;
                case 'image':
                    sendImg(msg, callback);
                    break;
                default:
                    callback();
                    break;
            }
        }

        function sendLoop() {
            WcData.msg.isSending = true;
            var msg = WcData.msg.queue.shift();
            if (!msg) {
                WcData.msg.isSending = false;
                return;
            }
            _send(msg, (data) => {
                if (!data) {
                    msg.callback(null);
                    return;
                }
                msg.callback(data);
                var timeout = 3000;
                if (WcData.msg.queue.length > 3) {
                    timeout = 10000 / WcData.msg.queue.length;
                    if (timeout < 1000) {
                        timeout = 1000;
                    }
                }
                setTimeout(sendLoop, timeout);
            });
        }
        msg.callback = callback;
        if ('undefined' === typeof msg.sendTime) {
            WcData.msg.queue.push(msg);
        } else if (-1 === msg.sendTime) {
            _send(msg, callback);
        } else if (msg.sendTime - (+new Date()) <= 100) {
            WcData.msg.queue.push(msg);
        } else if ('number' === typeof msg.sendTime) {
            setTimeout(() => {
                WcData.msg.queue.push(msg);
                if (!WcData.msg.isSending) {
                    sendLoop();
                }
            }, msg.sendTime - (+new Date()));
        }
        if (!WcData.msg.isSending) {
            sendLoop();
        }
    }

    function sendText(msg, callback) {
        $.ajax({
            url: conf.mainURL + 'cgi-bin/mmwebwx-bin/webwxsendmsg',
            type: 'POST',
            data: JSON.stringify({
                BaseRequest: getBaseRequest(),
                Msg: msg.Msg,
                Scene: 0
            }),
            dataType: 'json'
        }).done((data) => {
            var Msg = msg.Msg;
            Msg.MsgType = Msg.Type;
            $(window).trigger('contact.msg', [Msg]);
            if (!data || !data.BaseResponse || data.BaseResponse.Ret) {
                alert('sendText function error! can\'t send text');
                callback(null);
                return;
            }
            callback(data);
        });
    }

    function sendImg(msg, callback) {

    }

    function webwxuploadmedia(file, callback) {

    }

    function clientMsgId() {
        return (+new Date + '' + Math.random().toFixed(3)).replace(".", "");
    }

    function webwxoplog(userName, remarkName, callback) {
        if (!userName || !remarkName) {
            alert('please check the userName and remarkname!');
            callback(null);
            return;
        }
        var url = conf.mainURL + 'cgi-bin/mmwebwx-bin/webwxoplog';
        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify({
                BaseRequest: getBaseRequest(),
                CmdId: 2,
                RemarkName: remarkName,
                UserName: userName
            }),
            dataType: 'json'
        }).done((data) => {
            if (!data.BaseResponse || data.BaseResponse.Ret) {
                callback(null);
                return;
            }
            callback(data);
        });
    }
    /* 
     *    msg = {
     *        userid: '', //1-32bit a-z A-Z 0-9
     *        content: ''
     *    }
     */
    function turing(msg, callback) {
        if (!msg || !msg.content) {
            alert('request msg info error!');
            callback('');
            return;
        }
        if (!msg.userid) {
            msg.userid = 'anonymous';
        }
        $.ajax({
            url: 'http://www.tuling123.com/openapi/api',
            type: 'POST',
            data: JSON.stringify({
                key: 'a837f7e383c945f397c8f9b8ec6fc4c8',
                info: msg.content,
                userid: msg.userid
            }),
            contentType: "application/json; charset=utf-8",
            dataType: 'json'
        }).done((data) => {
            if (!data || !data.code) {
                alert('turing robot return value error!');
                callback('');
                return;
            }
            switch (data.code) {
                case 100000:
                    callback(data.text);
                    beak;
                case 200000:
                    var msg = reak;
                case 200000:
                    var msg = data.text + '\n\u94FE\u63A5\u5730\u5740: ' + data.url; //链接地址;
                    callback(msg);
                    break;
                default:
                    callback('');
            }
        });
    }

    function updateGroups(groups, groupNames) {
        for (var group of groups) {
            if (groupNames.isUserNameIn(group.UserName)) {
                updateGroupMember(group);
            }
        }
    }

    function updateGroupMember(group) {
        var members = group.MemberList;
        var user;
        for (var mem of members) {
            user = wcDB.getUser(mem.NickName);
            if (user) {
                user.UserName = mem.UserName;
                wcDB.updateUser(user);
            } else {
                user = wcDB.newUser();
                user.NickName = mem.NickName;
                user.UserName = mem.UserName;
                wcDB.addUser(user);
            }
        }
    }

    function init() {
        $('#monitor').click((event) => {
            var userName = $('[cus-id="chatBox"][data-UserName]:not(.hide)').attr('data-UserName');
            if (!userName) {
                alert('please choose a group to monitor!');
                return;
            }
            if ('@@' !== userName.substr(0, 2)) {
                alert('please choose a group to monitor!');
                return;
            }
            conf.managedGroup.add({ UserName: userName });
            updateGroups(WcData.contact.groupMembers, conf.managedGroup);
            event.target.remove();
        })
    }


    (() => {
        login((res) => {
            if (!res) {
                return false;
            }
            $('#QRCode').css('display', 'none');
            WcData.status.isLogin = true;
            webwxgetcontact((data) => {
                WcData.contact.allContacts = data;
                parseContact(WcData.contact);
                $(window).trigger('contact.refresh', [WcData.contact.allContacts])
                var groupCtc = [];
                for (var contact of WcData.contact.groupContacts) {
                    groupCtc.push({
                        UserName: contact.UserName
                    });
                }
                webwxbatchgetcontact(groupCtc, (data) => {
                    if (!data) {
                        alert('can\'t get group member! webwxbatchgetcontact function error!');
                        return;
                    }
                    WcData.contact.groupMembers = data;
                    $(document).ready(init);
                    runReceive((data) => {

                    });
                });
            })
        });
        window.wc = wc;

    })();




});



/*
send({
	type:'text',
	Msg:{
		Content:'ivmitsnvdsm have been received!',
		FromUserName:'@317c8e9c13994f7f37c98e9d62fd855596214c05e996ff798267cb85b506cdc2',
		ToUserName:'@@bde61457d22424ecb9fa6ce97d268438830c63a5879e3c8c61c40198e90fd7d7',
		Type:1
	}
},(data)=>{
	console.log(data);
});


turing({
	content:'你好吗？'
},(data)=>{
	console.log(data);
});


*/