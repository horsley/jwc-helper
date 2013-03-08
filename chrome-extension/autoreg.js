/**
 * Created with JetBrains PhpStorm.
 * User: horsley
 * Date: 13-3-4
 * Time: 上午1:07
 * To change this template use File | Settings | File Templates.
 */

if ($('#btnReset').length >  0) { //开课列表页面
    var Pkid = getCoursePKID();
    if (Pkid != 0) {
        chrome.extension.sendMessage({action: "get_autoreg_state", pkid: Pkid}, function(state) {
            if (state) { //第二次及以后的进入页面
                if (state.finish) {
                    $('#btnReset').before('<button id="autoreg" title="点击开始自动刷新选课">自动选课</button>');
                    $('#autoreg').before('自动选课完成，共刷新 '+ state.count + ' 次');
                    $('#autoreg').click(autoRegInit);
                } else {
                    $('#btnReset').before('<button id="autoreg" title="点击停止自动选课">停止自动选课</button>');
                    $('#autoreg').click(function(){
                        chrome.extension.sendMessage({action: "set_autoreg_state", state: {finish: true}, pkid: Pkid});
                    });
                    auto_task();
                }
            } else { //未开始自动刷课
                    $('#btnReset').before('<button id="autoreg" title="点击开始自动刷新选课">自动选课</button>');
                    $('#autoreg').click(autoRegInit);
            }
        });
    } else {
        $('#btnReset').before('<button id="autoreg" disabled="disabled" title="只能监控单一课程，请通过排课班号搜索出具体一个课程">自动选课</button>');
    }
} else if ($('#btnQr').length > 0) {//确认选课页面
    var Pkid = getCoursePKID();
    chrome.extension.sendMessage({action: "get_autoreg_state", pkid: Pkid}, function(state) {
        if (state && !state.finish) {
            $('#btnQr').get(0).click();
            chrome.extension.sendMessage({action: "set_autoreg_state", state: {finish: true}, pkid: Pkid});
        }
    });

}

function getCoursePKID() {
    if ($('#btnReset').length >  0) { //开课列表页面
        if ($('table:last').find('tr').length != 2) {
            return 0;
        }
        var tr = $('table:last').find('tr:last');
        return parseInt(tr.find("td:eq(1)").text());
    } else if ($('#btnQr').length > 0) {//确认选课页面
        return parseInt($('#txtFpkbh').text())
    }
}

function autoRegInit(){ //点击开始自动刷课
    chrome.extension.sendMessage({action: "set_autoreg_state", state: {finish: false, count:1}, pkid: Pkid}, function(){
        auto_task();
    });
    return false;
}
function autoReg() { //点击选课
    var tr = $('table:last').find('tr:last');
    tr.find("td:eq(0)").find('a').get(0).click();
}

function checkCourseAvailable() { //容量检查
    if ($('table:last').find('tr').length != 2) {
        return 0;
    }
    var tr = $('table:last').find('tr:last');
    return ((parseInt(tr.find("td:eq(10)").text()) - parseInt(tr.find("td:eq(11)").text())) > 0);
}

function auto_task() {
    var pre_check = checkCourseAvailable();
    if (pre_check === 0) {
        return;
    } else if (pre_check) {
        autoReg();
    } else {
        chrome.extension.sendMessage({action: "autoreg_count_inc", pkid: Pkid}, function(state) {
            var timer = setTimeout(function(){
                $('#btnRefresh').get(0).click();
            }, 2000);
            $('#autoreg').before('容量不足，等待2秒后自动刷新,已刷新 '+ state.count + ' 次');
        });

    }
}