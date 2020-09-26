(function(global, factory) {
    factory(global);
})(window, function(global) {

    "use strict";
    var contactEle, msgEle = {},
        chatBoxEle;
    var conf = {
        isInit: false
    }

    function viewInit() {
        contactEle = $($('.mainView .panel-body').remove().get(0));
        msgEle.l = $($('.msgs>.msg.l').remove().get(0));
        msgEle.r = $($('.msgs>.msg.r').remove().get(0));
        chatBoxEle = $($('[cus-id="chatBox"]').get(0));
        var sendMsg = $('#sendMsg');
        sendMsg.click(() => {
            var content = $('.editor>textarea').val();
            if (!content) {
                alert('please input message to send!');
                return;
            }
            $('.editor>textarea').val('');
            var userName = $('[cus-id="chatBox"][data-UserName]:not(.hide)').attr('data-UserName');
            if (!userName) {
                alert('please choose a person to send!');
                return;
            }
            wc.sendMsg({
                type: 'text',
                Msg: {
                    Content: content,
                    FromUserName: wc.WcData.user.UserName,
                    ToUserName: userName,
                    Type: 1
                }
            }, (data) => {
                if (!data || !data.BaseResponse || data.BaseResponse.Ret) {
                    alert('message send failed!');
                }
            });
        });
        conf.isInit = true;
    }

    function changeChatBox(contact) {
        var ele = getChatBox(contact);
        $('[cus-id="chatBox"]').addClass('hide');
        ele.removeClass('hide');
        return true;
    }

    function getChatBox(contact) {
        var selector = '[cus-id="chatBox"][data-UserName="' + contact.UserName + '"]';
        var ele = $(selector);
        if (!ele.length) {
            ele = chatBoxEle.clone();
            ele.attr('data-UserName', contact.UserName).addClass('hide');
            $('.panel-heading', ele).html(contact.NickName);
            $('.mainView .chatArea').prepend(ele);
        }
        return ele;
    }

    function refreshContact(contactList) {
        if (!conf.isInit) {
            return false;
        }
        $('.mainView .panel-body').remove();
        for (var contact of contactList) {
            var cont = contactEle.clone();
            $('span', cont).html(contact.NickName);
            $('input', cont).val(contact.UserName);
            $('#contactList').append(cont);
        }
        $('input[name="contact"]').change((evet) => {
            $('input[name="contact"]').parent().removeClass('highlight');
            $('input[name="contact"]:checked').parent().addClass('highlight');
            $(window).trigger('contact.change', $('input[name="contact"]:checked').val());
        });
        return true;
    }

    function onMsg(msg) {
        switch (msg.MsgType) {
            case wc.msgType.MSGTYPE_TEXT:
                add2ChatBox(msg);
                break;
            case 0:

                break;
            default:

                break;

        }
    }
    /* 
     *    msg = {
     *        FromUserName: '',
     *        fromGroupUser: '',
     *        realContent: ''
     *    }
     */
    function add2ChatBox(msg) {
        var contact = wc.getContact(msg.FromUserName);
        if (!contact) {
            return false;
        }
        var ele, msgE;
        var nickName = '',
            content = msg.realContent || msg.Content;
        content = content.replace(/\n/g, '<br>');
        if (wc.WcData.user.UserName === contact.UserName) {
            nickName = contact.NickName;
            contact = wc.getContact(msg.ToUserName);
            if (!contact) {
                return false;
            }
            ele = getChatBox(contact);
            msgE = msgEle.r.clone();
        } else {
            ele = getChatBox(contact);
            contact = wc.getContact(msg.fromGroupUser || msg.FromUserName);
            if (!contact) {
                return false;
            }
            nickName = contact.NickName;
            msgE = msgEle.l.clone();
        }
        if (!ele.length) {
            return false;
        }
        $('.username', msgE).html(nickName);
        $('.content', msgE).html(content);
        var msgsEle = $('.msgs', ele);
        msgsEle.append(msgE);
        msgsEle.animate({
            scrollTop: msgsEle.prop('scrollHeight')
        }, 'slow');
        return true;
    }



    (() => {
        $(window).on('load', viewInit);
        $(window).on('contact.refresh', (event, contactList) => {
            return refreshContact(contactList);
        });
        $(window).on('contact.currentChange', (event, contact) => {
            return changeChatBox(contact);
        });
        $(window).on('contact.change', (event, contact) => {
            var contactObj = wc.getContact(contact);
            return $(window).trigger('contact.currentChange', [contactObj]);
        });
        $(window).on('contact.msg', (event, msg) => {
            return onMsg(msg);
        })
    })();


});