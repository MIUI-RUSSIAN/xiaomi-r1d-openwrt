var Help = {
    loadJs: function(url, callback, options) {
        options = options || {};
        var head = document.getElementsByTagName('head')[0] || document.documentElement,
            script = document.createElement('script'),
            done = false;
        script.src = url;
        if (options.charset) {
            script.charset = options.charset;
        }
        if ( "async" in options ){
            script.async = options["async"] || "";
        }
        script.onerror = script.onload = script.onreadystatechange = function() {
            if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                done = true;
                if (callback) {
                    callback();
                }
                script.onerror = script.onload = script.onreadystatechange = null;
                head.removeChild(script);
            }
        };
        head.insertBefore(script, head.firstChild);
    },
    loadJSONP: function(url, funName, callback){
        window[funName] = callback;
        QW.loadJs(url + '?call=' + funName);
    },
    getErrCode: function(){
        var url = document.URL;
        if (!/ngcode/.test(url)) {
            return;
        }

        var ngCode = QW.StringH.queryUrl(url,'ngcode');
        $('#errCode').text( '(' + ngCode + ')' );
        var errMsg;
        if (/^4\d{2}/.test(ngCode)) {
            errMsg = this.reason['40x'];
        }
        if (/^5\d{2}/.test(ngCode)) {
            errMsg = this.reason['50x'];
        }
        $('#errMsg').text(errMsg);
    },
    reason: {
        '40x': '您所访问的页面资源不存在',
        '50x': '您所访问的站点内部发生错误'
    },
    getErrType: function(){
        var url = document.URL,
            errType = QW.StringH.queryUrl(url,'errtype');
        if (errType === '1') {
            this.getErrCode();
        }
        if (errType === '2') {
            $('#errMsg').text('您所访问的域名错误或者不存在');
        }

    }
};

if( !window.console ){
    window.console = {
        log: function(){}
    };
}

// 百度统计
var url = document.URL;
var errType = QW.StringH.queryUrl(url,'errtype');
var _hmt = _hmt || [];
_hmt.push(['_setCustomVar', 1, 'pagetype', 'errpage', 3]);
_hmt.push(['_setCustomVar', 2, 'errtype', errType, 3]);

(function() {
  var hm = document.createElement("script");
  hm.src = "//hm.baidu.com/hm.js?ddcb6b5d7f9620078f82e5302a6b7676";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();