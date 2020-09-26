(function(global, factory) {
    factory(global);
})(window, function(global) {

    "use strict";

    var db = {
        users: {},
        currentUserID: 0
    }

    var conf = {
        invitePoints: 10
    }

    var PointsHistory = class {
        constructor() {
            return {
                gainTime: 0,
                consumeTime: 0,
                amount: 0,
                reason: ''
            };
        }
    }

    var Points = class {
        constructor() {
            return {
                total: 0,
                obtainHistory: [],
                totalObtain: 0,
                consumeHistory: [],
                totalConsume: 0,
                inviteGains: 0
            };
        }
    }

    var UserInfo = class {
        constructor() {
            return {
                joinedTime: 0,
                id: 0,
                RemarkName: '',
                NickName: '',
                UserName: ''
            };
        }
    }

    var InviteInfo = class {
        constructor() {
            return {
                invitedUser: [],
                remainUser: []
            };
        }
    }

    var User = class {
        constructor() {
            return {
                id: 0,
                RemarkName: '',
                NickName: '',
                UserName: '',
                points: new Points,
                inviteInfo: new InviteInfo
            };
        }
    }

    var wcDB = {};

    wcDB.User = User;
    wcDB.UserInfo = UserInfo;
    wcDB.PointsHistory = PointsHistory;


    wcDB.newUserID = function() {
        ++db.currentUserID;
        storageDB();
        return db.currentUserID;
    };

    wcDB.newUser = function() {
        var user = new this.User;
        user.id = this.newUserID();
        return user;
    }

    var idStr = wcDB.idStr = function(userID) {
        var id = '';
        if ('number' === typeof userID) {
            id += userID;
            if (8 < id.length) {
                alert('error! user ID out of bound!');
                return '';
            }
            var len = id.length,
                times = 8 - len;
            for (var i = 0; i < times; ++i) {
                id = '0' + id;
            }
        } else if ('string' === typeof userID) {
            for (var name in db.users) {
                if (userID === db.users[name].NickName) {
                    id = name;
                    break;
                }
            }
        } else {
            alert('error! can\'t recognized id!');
            return '';
        }
        return id;
    }

    wcDB.addUser = function(user) {
        if (!user || !user.NickName) {
            alert('user NickName can\'t be empty!');
            return false;
        }
        if (this.getUser(user.NickName)) {
            return false;
        }
        var id = idStr(user.id);
        if (db.users[id]) {
            return false;
        }
        db.users[id] = $.extend(true, {}, user);
        storageDB();
        return true;
    };


    wcDB.getUser = function(userID) {
        var id = idStr(userID);
        if (!id || !db.users[id]) {
            return null;
        }
        return $.extend(true, {}, db.users[id]);
    };

    function getUser(userID) {
        var id = idStr(userID);
        if (!id || !db.users[id]) {
            return null;
        }
        return db.users[id];
    }

    wcDB.updateUser = function(user) {
        if (!user || !user.id) {
            return null;
        }
        var id = idStr(user.id);
        if (!db.users[id]) {
            return null;
        }
        db.users[id] = $.extend(true, {}, user);
        storageDB();
        return db.users[id];
    };

    wcDB.removeUser = function(userID) {
        var id = idStr(userID);
        if (!id || !db.users[id]) {
            return false;
        }
        delete db.users[id];
        storageDB();
        return true;
    }


    wcDB.addPoint = function(userID, point) {
        point = $.extend(true, {}, point);
        var user = getUser(userID);
        if (!user) {
            alert('can\'t add point! user not find!');
            return false;
        }
        if (0 >= point.amount) {
            alert('point amount error! add point must be positive');
            return false;
        }
        if (!point.gainTime) {
            point.gainTime = +new Date;
        }
        user.points.obtainHistory.push(point);
        storageDB();
        return true;
    }
    wcDB.consumePoint = function(userID, point) {
        point = $.extend(true, {}, point);
        var user = getUser(userID);
        if (!user) {
            alert('can\'t add consume point history! user not find!');
            return false;
        }
        if (0 <= point.amount) {
            alert('point amount error! add consume point must be negative');
            return false;
        }
        if (!point.consumeTime) {
            point.consumeTime = +new Date;
        }
        user.points.consumeHistory.push(point);
        storageDB();
        return true;
    }

    wcDB.addInviteInfo = function(userID, invitee) {
        var userInfo = new this.UserInfo;
        userInfo.joinedTime = +new Date;
        userInfo.NickName = invitee;
        var user = getUser(userID);
        if (!user) {
            alert('addInviteInfo failed! can\'t find specified user!');
            return false;
        }
        user.inviteInfo.invitedUser.push(userInfo);
        storageDB();
        return true;
    }

    wcDB.updateInviteInfo = function(userID, groupMembers) {
        var user = getUser(userID);
        if (!user) {
            return false;
        }

        function unique(userInfos) {
            userInfos = $.extend(true, [], userInfos);
            var res = [];
            var user;
            while (user = userInfos.pop()) {
                if (!isInclude(user, userInfos)) {
                    res.push(user);
                }
            }
            return res;
        }

        function isInclude(userInfo, userInfos) {
            for (var user of userInfos) {
                if (user.NickName === userInfo.NickName) {
                    return true;
                }
            }
            return false;
        }
        var inviteInfo = user.inviteInfo;
        inviteInfo.invitedUser = unique(inviteInfo.invitedUser);
        var remain = [];
        for (var userInfo of inviteInfo.invitedUser) {
            if (isInclude(userInfo, groupMembers)) {
                remain.push(userInfo);
            }
        }
        inviteInfo.remainUser = remain;
        storageDB();
        return true;
    }

    var updatePoints = wcDB.updatePoints = function(userID) {
        var id = idStr(userID);
        if (!id || !db.users[id]) {
            return false;
        }
        var user = db.users[id];
        var points = user.points;
        points.inviteGains = conf.invitePoints * user.inviteInfo.remainUser.length;
        points.totalObtain = calcHistory(points.obtainHistory);
        points.totalConsume = calcHistory(points.consumeHistory);
        points.total = points.inviteGains + points.totalObtain + points.totalConsume;
        storageDB();
        return points.total;
    }

    var calcHistory = function(historys) {
        var total = 0;
        for (var pointHistory of historys) {
            total += pointHistory.amount;
        }
        return total;
    }

    var storageDB = wcDB.storageDB = function() {
        if (!db) {
            return false;
        }
        window.localStorage.setItem('wcDB', JSON.stringify(db));
        return true;
    };

    var restoreDB = wcDB.restoreDB = function() {
        var database = JSON.parse(window.localStorage.getItem('wcDB'));
        if (database) {
            db = database;
            return db;
        } else {
            return null;
        }
    };

    wcDB.getDB = function() {
        return db;
    };


    ((global) => {
        restoreDB();
        global.wcDB = wcDB;
    })(global);


});