/**
 * Created with JetBrains PhpStorm.
 * User: horsley
 * Date: 13-3-4
 * Time: 上午1:27
 * To change this template use File | Settings | File Templates.
 */
background_global = {};
background_global.state = {};
chrome.extension.onMessage.addListener(function(request, sender, callback) {
    var id = "course" + request.pkid;
    switch (request.action) {
        case "get_autoreg_state":
            if (background_global.state[id]) {
                callback(background_global.state[id]);
            } else {
                callback(false);
            }
            return;
        case "set_autoreg_state":
            if (background_global.state[id]) { //覆盖更新模式
                for (var p in background_global.state[id]) {
                    if (typeof request.state[p] != 'undefined') {
                        background_global.state[id][p] = request.state[p];
                    }
                }
            } else {
                background_global.state[id] = request.state;
            }
            break;
        case "autoreg_count_inc":
            background_global.state[id].count++;
            callback(background_global.state[id]);
            return;

    }
    callback({a: 1})
});