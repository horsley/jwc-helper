/**
 * Created with JetBrains PhpStorm.
 * User: horsley
 * Date: 13-2-22
 * Time: 下午3:27
 * To change this template use File | Settings | File Templates.
 */
    //******************** dirty code, 切勿模仿 *****************************
    //关于日历文件的标准rfc5545: http://tools.ietf.org/html/rfc5545
var schedule_globals = {};
if ($('input[name="btnExpKcb"]').length !== 0) {
    schedule_globals.semester_start = new Date(2013, 2, 3); //校历周日开始算的,month从0开始算
    //schedule_globals.semester_start = new Date(2012, 8, 2); //测试上学期
    //@todo: 这里不科学，要么每个学期更新这里的值，要么得有个计算办法，要么录入校历
    schedule_globals.time_now = getNowTime();
    schedule_globals.vevents = [];
    schedule_globals.course_time = [];
    schedule_globals.ics = "";
    schedule_globals.tds = [];

    $('#btnExpKsb').after('<button id="btnExpIcs">导出本学期课程日历</button>');
    $('#btnExpIcs').click(function(){
        $('#btnExpIcs').html("请稍候...").attr('disabled','disabled')
        var form1 = $('form[name="Form1"]');
        var post_data1 = form1.serialize() + '&btnExpKcb=%B5%BC%B3%F6%BB%F2%B4%F2%D3%A1%BF%CE%B3%CC%B1%ED'; //导出课程表的按钮内容

        $.ajax({ //提交了之后302 redirect,这个http层面的问题在这里无法解决，只好在下面再请求一次
            type: "POST",
            url: form1.attr('action'),
            data: post_data1,
            complete: function(){
                $.get('http://jwc.jnu.edu.cn/Web/Secure/TeachingPlan/wfrm_Prt_Report.aspx', function(data){
                    var url_next = $(data).find('#ReportFrameReportViewer1').attr('src');
                    $.get(url_next, function(data){
                        //var url_next = $(data).find('#report').attr('src'); //你妹你的破烂html结构，选不鸟
                        var regex_result = data.match(/<frame src="([^j].*?)"\sid="report/);
                        var url_next = regex_result[1].replace(/&amp;/g, "&");
                        $.get(url_next, function(data){
                            var the_table = $(data).find('table:last');
                            $(the_table).find('tr').each(function(i){
                                if (i == 0 || i == 1) return;
                                var tr = $(this);
                                tr.find('td').each(function(j){
                                    var td = $(this);
                                    var td_content = $.trim(td.text().replace(/\n/g, ''));
                                    if (td_content == '') return;

                                    if (i == 2) {
                                        parseCourseTime(td_content, j);
                                    } else {
                                        var course_arr;
                                        if (course_arr = parseKcbTD(td_content, i, j)) for (var n in course_arr) {
                                            schedule_globals.vevents.push(makeIcsVevent(course_arr[n]));
                                        }
                                    }
                                });
                            });
                            schedule_globals.ics = makeIcs(schedule_globals.vevents);
                            $('#btnExpIcs').html("生成完成！")
                                .after('<a download = "课程表.ics" href="'+ makeDownloadUri(schedule_globals.ics) + '">下载日历</a>');
                        });
                    });
                });
            }
        });


        return false;
    });

    function makeIcsVevent(course) {
        var date = "" + course.start_date.getFullYear() + appendzero(course.start_date.getMonth() + 1) + appendzero(course.start_date.getDate());

        var vevent = "BEGIN:VEVENT\r\n";
        vevent += "DTSTART;TZID=Asia/Shanghai:" + date + "T" + course.time.start + "\r\n";
        vevent += "DTEND;TZID=Asia/Shanghai:" + date + "T" + course.time.end + "\r\n";
        vevent += "RRULE:FREQ=WEEKLY;" + (course.interval == 2 ? "INTERVAL=2;" : "") + "COUNT=" + course.count +";BYDAY=" + course.byday + "\r\n";
        vevent += "DTSTAMP:" + schedule_globals.time_now + "\r\n";
        vevent += "UID:" + createUUID() + "@horsley.lee\r\n";
        vevent += "CREATED:" + schedule_globals.time_now + "\r\n";
        vevent += "DESCRIPTION:\r\n";
        vevent += "LAST-MODIFIED:" + schedule_globals.time_now + "\r\n";
        vevent += "LOCATION:" + course.place + "\r\n";
        vevent += "SEQUENCE:0\r\n";
        vevent += "STATUS:CONFIRMED\r\n";
        vevent += "SUMMARY:" + course.name + "\r\n";
        vevent += "TRANSP:OPAQUE\r\n";
        vevent += "END:VEVENT\r\n";
        return vevent;
    }

    function makeIcs(vevents) {
        var ics = "BEGIN:VCALENDAR\r\n";
        ics += "PRODID:-//Horsley Lee//JNU Course Calendar 1.0.0//CN\r\n";
        ics += "CALSCALE:GREGORIAN\r\n";
        ics += "METHOD:PUBLISH\r\n";
        ics += "BEGIN:VTIMEZONE\r\n";
        ics += "TZID:Asia/Shanghai\r\n";
        ics += "BEGIN:STANDARD\r\n";
        ics += "TZOFFSETFROM:+0800\r\n";
        ics += "TZOFFSETTO:+0800\r\n";
        ics += "TZNAME:CST\r\n";
        ics += "DTSTART:19700101T000000\r\n";
        ics += "END:STANDARD\r\n";
        ics += "END:VTIMEZONE\r\n";

        for (var i in vevents) {
            ics += vevents[i];
        }

        ics += "END:VCALENDAR\r\n";
        return ics;
    }

    function parseKcbTD(td, i, j){
        var regex = /(单周|双周|从第(\d+)至(\d+)周|)\s?(.*?)\s课程：(.*?)\(\d+\)/gm;

        if (regex.test(td)) {
            regex.lastIndex = 0;
            var info, retArr;
            retArr = [];
            while (info = regex.exec(td)) {
                if (!info || info.length != 6) return false;
                var course = {};
                course.name = info[5];
                course.place = info[4];
                course.start_date = new Date(schedule_globals.semester_start); //第一周
                course.start_date.setDate(course.start_date.getDate() + i - 2); //周起始日校正
                course.interval = 0; //默认每周
                course.byday = getDay(i);
                course.time = schedule_globals.course_time[j];
                course.count = 16;
                if (info[1] == '双周' || info[1] == '单周') {
                    course.interval = 2;
                    course.count = 8;
                    if (info[1] == '双周') {
                        course.start_date.setDate(course.start_date.getDate() + 7); //双周校正
                    }
                } else if (info[1] != "" && info[2] != undefined && info[3] != undefined) { //从x周到y周
                    course.count = info[3] - info[2] + 1;
                    course.start_date.setDate(course.start_date.getDate() + (info[2] - 1) * 7); //起始周校正
                }
                retArr.push(course);
            }
            return retArr;
        } else {
            return false;
        }
    }

    function parseCourseTime(td, j) {
        var regex = /(\d\d):(\d\d)-(\d\d):(\d\d)/;
        var time = regex.exec(td);
        if (!time || time.length != 5) return false;
        schedule_globals.course_time[j] = {
            start: time[1] + time[2] + "00",
            end: time[3] + time[4] + "00"
        };
    }

    function getDay(i) {
        var day = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
        return day[i - 3];
    }

    function appendzero(obj) {
        if (obj < 10) return "0" + "" + obj;
        else return obj;
    }

    function getNowTime() {
        var date = new Date();
        var now = "" + date.getFullYear() + appendzero(date.getMonth() + 1) + appendzero(date.getDate());
        now += "T" + appendzero(date.getHours()) + appendzero(date.getMinutes()) + appendzero(date.getSeconds()) + "Z";
        return now;
    }

    //@link: http://stackoverflow.com/a/873856/1191759
    function createUUID() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        return s.join("");
    }
    function makeDownloadUri(content) {
        return "data:text/calendar;charset=utf-8," + encodeURI(content);
    }
}

