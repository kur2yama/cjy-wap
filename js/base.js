(function (base, min, max, scaling) {
    var cacheWidth = 0;
    var timer;
    var docEl = document.documentElement;
    var recalc = function () {
        var clientWidth = docEl.clientWidth;
        if (!clientWidth) return;
        clientWidth = Math.max(Math.min(clientWidth, max), min);
        if (cacheWidth !== clientWidth) {
            clearInterval(timer);
            cacheWidth = clientWidth;
            docEl.style.fontSize = scaling * (clientWidth / base) + 'px';
        }
    }
    recalc();
    setTimeout(recalc, 300);
    if (!window.addEventListener) return;
    var resizeWithTimer = function () {
        timer = setInterval(recalc, 10);
    }
    if ('onorientationchange' in window) window.addEventListener('orientationchange', resizeWithTimer);
    if ('onresize' in window) window.addEventListener('resize', resizeWithTimer);
})(375, 300, 768, 100);
