/*window.onload = function () {
    if (!IsBrowserCompatible()) {
        location.href = 'browser-notification.html';
    }
	else {
        document.getElementById('mainBody').style.display = 'block';
    }
};*/
var SupportedBrowserVersions =
{
    InternetExplorer: 11,
    FireFox: 76,
    Chrome: 79,
    MicrosoftEdge: 81,
    Opera: 54,
    Safari: 11
};

window.onload = function () {
    if (!IsBrowserCompatible()) {
        location.href = 'browser-notification.html';
    }
};

function IsBrowserCompatible() {
	
    var browserDetails = GetBrowserDetails();
    var majorVersion = browserDetails.version;
    var browserName = browserDetails.name;

    if (browserName == "MSIE") {
        browserName = "INTERNET EXPLORER";
    }

    switch (browserName.toUpperCase()) {
        case "FIREFOX":
            return majorVersion < SupportedBrowserVersions.FireFox ? false : true;
        case "CHROME":
            return majorVersion < SupportedBrowserVersions.Chrome ? false : true;
        case "INTERNET EXPLORER":
            return 0 < SupportedBrowserVersions.InternetExplorer ? false : true;
        case "EDGE":
            return majorVersion < SupportedBrowserVersions.MicrosoftEdge ? false : true;
        case "OPERA":
            return 0 < SupportedBrowserVersions.Opera ? false : true;
        case "SAFARI":
            return majorVersion < SupportedBrowserVersions.Safari ? false : true;
        default:
            return true;
    }
}
function GetBrowserDetails()
{
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        M[1] = "Internet Explorer";
        M[2] = tem[1];
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) {
            M[1] = tem[1].replace('OPR', 'Opera');
            M[2] = tem[2];
        }
        else { M[1] = "Chrome"; }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);

    var firefox = /firefox/.test(navigator.userAgent.toLowerCase()) && !/webkit /.test(navigator.userAgent.toLowerCase());
    var webkit = /webkit/.test(navigator.userAgent.toLowerCase());
    var opera = /opera/.test(navigator.userAgent.toLowerCase());
    var msie = /edge/.test(navigator.userAgent.toLowerCase()) || /msie/.test(navigator.userAgent.toLowerCase()) || /msie (\d+\.\d+);/.test(navigator.userAgent.toLowerCase()) || /trident.*rv[ :]*(\d+\.\d+)/.test(navigator.userAgent.toLowerCase());
    var prefix = msie ? "" : (webkit ? '-webkit-' : (firefox ? '-moz-' : ''));

    return { name: M[0], version: M[1], firefox: firefox, opera: opera, msie: msie, chrome: webkit, prefix: prefix };
}