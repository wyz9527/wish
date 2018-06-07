"use strict";

var getRandomNum = function(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}

var getRandomArrayElements = function(arr, count) {
    var shuffled = arr.slice(0),
        i = arr.length,
        min = i - count,
        temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

var randArr = function(startNum, endNUm) {
    var numArr = [];
    for (startNum; startNum <= endNUm; startNum++) {
        numArr.push(startNum);
    }
    return numArr;
}

var SubjectItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key; //
        this.title = obj.title; //é¢ç®
        this.opts = obj.opts; //éé¡¹{"A":"å¯¹", "B":"é"}
        this.rightOpt = obj.rightOpt; //æ­£ç¡®ç­æ¡
        this.author = obj.author; //åå»ºé¢ç®çæäºå°å
    } else {
        this.key = 0;
        this.title = ""; //é¢ç®
        this.opts = ""; //éé¡¹{"A":"å¯¹", "B":"é"}
        this.rightOpt = ""; //æ­£ç¡®ç­æ¡
        this.author = ""; //åå»ºé¢ç®çæäºå°å
    }
};

SubjectItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var SubjectContract = function() {
    LocalContractStorage.defineProperty(this, "subjectNum"); //é¢ç®æ»æ°é
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new SubjectItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
}

SubjectContract.prototype = {
    init: function() {
        this.subjectNum = 0;
    },
    //æ°å¢é¢ç®
    addSubject: function(title, opts, rightOpt) {
        title = title.trim();
        rightOpt = rightOpt.trim();
        opts = JSON.parse(opts);
        var from = Blockchain.transaction.from;

        var subject = new SubjectItem();
        subject.key = this.subjectNum;
        subject.title = title;
        subject.opts = opts;
        subject.rightOpt = rightOpt;
        subject.author = from;
        this.repo.put(this.subjectNum, subject);
        this.subjectNum += 1;
    },
    //è·ånumæ¡é¢ç®
    getSubjects: function(num) {
        num = parseInt(num.trim());
        if (num <= 0 || num > 100) {
            throw new Error('é¢ç®æ°éå¿é¡»å¨1-100ä¹é´');
        }
        if (num > this.subjectNum) {
            num = this.subjectNum;
        }
        var startNum = this.subjectNum - (num * getRandomNum(3, 10));
        if (startNum < 0) {
            startNum = 0;
        }
        var endNum = startNum + num * 2;
        if (endNum >= this.subjectNum) {
            endNum = this.subjectNum - 1;
        }
        var rarr = randArr(startNum, endNum);
        var indexArr = getRandomArrayElements(rarr, num);
        var length = indexArr.length;
        var rs = [];
        for (var i = 0; i < length; i++) {
            var item = this.repo.get(indexArr[i]);
            item.rightOpt = '*';
            rs.push(item);
        }
        return rs;
    },
    //æ¹éç­å·
    checkSubjects: function(answers) {
        answers = JSON.parse(answers);
        var rs = [];
        var len = answers.length;
        var ans = {};
        for (var i = 0; i < len; i++) {
            ans = this.repo.get(answers[i].key);
            if (ans.rightOpt == answers[i].choseOpt) {
                //ç­å¯¹
                rs.push({
                    "key": answers[i].key,
                    "rightOpt": ans.rightOpt,
                    "isRight": 1 //æ¯å¦ç­å¯¹ 1=ç­å¯¹
                });
            } else {
                rs.push({
                    "key": answers[i].key,
                    "rightOpt": ans.rightOpt,
                    "isRight": 0
                });
            }
        }

        return rs;
    },
    //è·åé¢åºé¢ç®æ°é
    getSubjectNum: function() {
        return this.subjectNum;
    }
};
module.exports = SubjectContract;