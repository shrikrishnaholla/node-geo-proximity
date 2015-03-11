var geohash = require('ngeohash');


function queryByRanges(set, ranges, with_values, callBack) {

    var multi = set.client.multi();

    if (with_values === undefined) {
        buildMultiWithoutValues(ranges, set.zset, multi);
    } else {
        buildMultiWithValues(ranges, set.zset, multi);
    }

    multi.exec(function(err, replies) {

        if (err) {
            if (typeof callBack === 'function') callBack(err, null);
        } else {
            if (with_values) processResultsWithValues(replies, callBack);
            else processResultsWithoutValues(replies, callBack);
        }
    });
}

function buildMultiWithValues(ranges, zset, multi) {
    var range = [];

    for (i = 0; i < ranges.length; i++) {
        range = ranges[i];
        multi.ZRANGEBYSCORE(zset, range[0], range[1], 'WITHSCORES');
    }
}

function buildMultiWithoutValues(ranges, zset, multi) {
    var range = [];

    for (i = 0; i < ranges.length; i++) {
        range = ranges[i];
        multi.ZRANGEBYSCORE(zset, range[0], range[1]);
    }
}

function processResultsWithoutValues(replies, callBack) {
    var concatedReplies = [];

    for (var i = 0; i < replies.length; i++) {
        concatedReplies = concatedReplies.concat(replies[i]);
    }

    if (typeof callBack === 'function') callBack(null, concatedReplies);
}

function processResultsWithValues(replies, callBack) {

    var concatedReplies = [],
        k = 0,
        decoded;

    for (var i = 0; i < replies.length; i++) {
        for (var j = 0; j < replies[i].length; j += 2) {
            decoded = geohash.decode_int(replies[i][j + 1], 52);
            concatedReplies[k] = [replies[i][j], decoded.latitude, decoded.longitude];
            k++;
        }
    }

    if (typeof callBack === 'function') callBack(null, concatedReplies);
}


module.exports = exports = queryByRanges;