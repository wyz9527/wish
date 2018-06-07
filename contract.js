'use strict';

var getNowFormatDate = function () {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        + seperator2 + date.getSeconds();
    return currentdate;
}


var WishItem = function (text) {
    if (text) {
        var obj   = JSON.parse(text);
        this.key  = obj.key;
        this.nick = obj.nick;
        this.pushTime = obj.pushTime;
        this.content = obj.content;
        this.author = obj.author;
    }else{
        this.key  = 0;
        this.nick = '';
        this.content = '';
        this.author = '';
        this.pushTime = '';
    }
};

WishItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};



var WishContract = function() {
    LocalContractStorage.defineProperty(this, "wishNum");
    LocalContractStorage.defineMapProperty(this, "authorWishList",{
        parse: function(text) { //get
            if( text ){
                return JSON.parse(text);
            }else{
                return [];
            }
        },
        stringify: function(o) { //save
            return JSON.stringify(o);
        }
    });
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) { //get
            return new WishItem(text);
        },
        stringify: function(o) { //save
            return o.toString();
        }
    });
}

WishContract.prototype = {
    init: function() {
        this.wishNum = 0;
    },
    addWish: function( nick, content ) {
        nick = nick.trim();
        content = content.trim();
        var from = Blockchain.transaction.from;

        var wish    = new WishItem();
        wish.key    = this.wishNum;
        wish.nick   = nick;
        wish.content = content;
        wish.author = from;
        wish.pushTime = getNowFormatDate();
        this.repo.put(this.wishNum, wish);
        var authWs = this.authorWishList.get(from);
        if( authWs ){
            authWs.push(this.wishNum);
        }else{
            authWs = [this.wishNum];
        }
        this.authorWishList.put(from,authWs);
        this.wishNum += 1;
    },
    getWishs: function (num) {
        num = parseInt(num.trim());
        if (num <= 0 || num > 200) {
            throw new Error('num too lower or too biger');
        }
        if ( num > this.wishNum) {
            num = this.wishNum ;
        }
        var wishs = [];
        var totalIndex =  this.wishNum - 1;
        for( var i= 0; i < num; i++ ){
            var index =  totalIndex - i;
            wishs.push( this.repo.get(index) );
        }
        return wishs;
    },
    getMyWishs:function (myaddress, start, num ) {
        start = parseInt( start.trim() );
        num = parseInt(num.trim());

        var authWs = this.authorWishList.get(myaddress);
        if( !authWs ){
            authWs = [];
        }
        var wishs = [];
        for( var i = 0; i < num; i++ ){
            var index = start + i;
            if( index >= authWs.length ){
                break;
            }
            wishs.push(this.repo.get(authWs[index]));
        }
        return wishs;
    },
    getWishNum: function() {
        return this.wishNum;
    }
};
module.exports = WishContract;