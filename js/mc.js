/**
 * MediaCloud JS SDK
 *
 * @version 1.0.0
 * @class jssdk
 */
 (function () {
    var noop, MediaCloudJSSDK, Event, TransStatusWatch, onload;
    noop = function () {};

    MediaCloudJSSDK = function () {
        var iframe,
            self = this;
        this.debug = false;
        this._shakeEnable = false;
        this._event = new Event();
        this._request = function (method, params) {
            var src = 'cloudjs://' + method,
                copyParams = {};
            for (var k in params) {
                copyParams[k] = params[k];
            }
            if (copyParams) {
                for (var key in copyParams) {
                    if (copyParams.hasOwnProperty(key)) {
                        if('thumbs' == key){
                            var _thumbs=[];
                            for(var i=0;i<copyParams[key].length;i++){
                                _thumbs.push(encodeURIComponent(copyParams[key][i]))
                            }
                            copyParams[key]=_thumbs;
                        }else if('url' == key){
                            copyParams[key] = decodeURIComponent(copyParams[key])
                        }else{
                            copyParams[key] = encodeURIComponent(copyParams[key]);
                        }
                    }
                }
                src += '?params=' + JSON.stringify(copyParams);
            }
            iframe.src = src;
            self._event.trigger('request');
        };

        this._callback = function (res) {
            if (+res.errId !== 0) {
                self._event.trigger('error', res.errId);
                if (self.debug) {
                    alert('errId:' + res.errId);
                }
                return;
            }
            self._event.trigger(res.method, res.data);
        };

        this._transStatusWatch = new TransStatusWatch(this._event);

        iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.width = '0';
        iframe.style.height = '0';
        if(document.body){
            document.body.appendChild(iframe);
        }else{
            var onload = window.onload || function(){};
            window.onload = function(){
                document.body.appendChild(iframe);
                onload();
            }
        }

    };

    Event = function () {
        var _events = {},
            self = this;
        this.on = function (name, func) {
            var name = name.toLocaleLowerCase().split('.');
            type = name[1] || 'default';
            name = name[0];
            if (!_events[name]) {
                _events[name] = [];
            }
            _events[name].push({
                type: type,
                func: func
            });
            return self;
        };
        this.off = function (name) {
            var i, name = name.toLocaleLowerCase().split('.');
            type = name[1] || 'default';
            name = name[0];
            if (_events[name] && _events[name].length) {
                for (i in _events) {
                    if (i !== name) continue;
                    _events[i] = _events[i].filter(function (key, item) {
                        return (type && type !== key);
                    });
                    if (_events[i].length) {
                        delete _events[i];
                    }
                }
            }
            return self;
        };
        this.trigger = function (name, data) {
            var i, l;
            name = name.toLocaleLowerCase();
            if (!_events[name]) return;
            for (l = _events[name].length, i = l - 1; i >= 0; i--) {
                _events[name][i].func.call(null, data);
            }
            return self;
        };
    };

    TransStatusWatch = function (event) {
        var callbacks = {};
        event.on('transStatusQuery', function (data) {
            if (typeof callbacks[data.id] !== 'function') {
                return;
            }
            callbacks[data.id]({
                status: data.status
            });
            delete(callbacks[data.id]);
        })

        this.add = function (id, func) {
            callbacks[id] = func;
        }
    }

    /**
     * 使用率较高的事件绑定函数
     */
    function normalEventBind(event, name, callback) {
        event
            .off(name)
            .on(name, function (res) {
                callback(res);
                event.off(name);
            });
    }

    /**
     * 获取用户登陆信息
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.userGetInfo = function (callback) {
        normalEventBind(this._event, 'userGetInfo', callback);
        this._request('userGetInfo');
    };

    /**
     * 登陆
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.userLogin = function (callback) {
        normalEventBind(this._event, 'userLogin', callback);
        this._request('userLogin');
    };

    /**
     * 关注内容属性
     */
    MediaCloudJSSDK.prototype.attentionAttr = function (_param) {
        this._request('attentionAttr',_param);
    };
    /**
     * 跳转内容属性列表
     */
    MediaCloudJSSDK.prototype.attrDetail = function (_param) {
        this._request('attrDetail',_param);
    };

    /**
     * 调用原生浏览器打开
     * @constructor
     * @param {String} url 访问URL
     */
    MediaCloudJSSDK.prototype.linkOpen = function (url) {
        this._request('linkOpen', {
            url: url
        });
    };

    /**
     * 一键弹出分享层
     * @constructor
     * @param {Object} option
     * @param {String} option.title     分享标题
     * @param {String} option.content   分享内容
     * @param {String} option.image     分享缩略图
     * @param {String} option.url       分享链接
     */
    MediaCloudJSSDK.prototype.sharePanel = function (option) {
        option = option || {};
        option.type = 0;
        this._request('sharePanel', option);
    };

    /**
     * 分享到微信
     * @constructor
     * @param {Object} option
     * @param {String} option.title     分享标题
     * @param {String} option.content   分享内容
     * @param {String} option.image     分享缩略图
     * @param {String} option.url       分享链接
     */
    MediaCloudJSSDK.prototype.shareWeChat = function (option) {
        option = option || {};
        option.type = 22;

        this._request('sharePanel', option);
    };

    /**
     * 分享到朋友圈
     * @constructor
     * @param {Object} option
     * @param {String} option.title     分享标题
     * @param {String} option.content   分享内容
     * @param {String} option.image     分享缩略图
     * @param {String} option.url       分享链接
     */
    MediaCloudJSSDK.prototype.shareTimeline = function (option) {
        option = option || {};
        option.type = 23;

        this._request('sharePanel', option);
    };

    /**
     * 分享到QQ好友
     * @constructor
     * @param {Object} option
     * @param {String} option.title     分享标题
     * @param {String} option.content   分享内容
     * @param {String} option.image     分享缩略图
     * @param {String} option.url       分享链接
     */
    MediaCloudJSSDK.prototype.shareQQMessage = function (option) {
        option = option || {};
        option.type = 24;

        this._request('sharePanel', option);
    };

    /**
     * 分享到QQ空间
     * @constructor
     * @param {Object} option
     * @param {String} option.title     分享标题
     * @param {String} option.content   分享内容
     * @param {String} option.image     分享缩略图
     * @param {String} option.url       分享链接
     */
    MediaCloudJSSDK.prototype.shareQzone = function (option) {
        option = option || {};
        option.type = 6;

        this._request('sharePanel', option);
    };

    /**
     * 分享到微博
     * @constructor
     * @param {Object} option
     * @param {String} option.title     分享标题
     * @param {String} option.content   分享内容
     * @param {String} option.image     分享缩略图
     * @param {String} option.url       分享链接
     */
    MediaCloudJSSDK.prototype.shareWeibo = function (option) {
        option = option || {};
        option.type = 1;

        this._request('sharePanel', option);
    };

    /**
     * 获取地理位置
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.locationGetInfo = function (callback) {
        normalEventBind(this._event, 'locationGetInfo', callback);
        this._request('locationGetInfo');
    };

    /**
     * 打开地图导航
     * @constructor
     * @param {String} latitude     经度
     * @param {String} longitude    纬度
     * @param {String} address      详细地址
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.locationMap = function (latitude, longitude, address, callback) {
        latitude = latitude.toString();
        longitude = longitude.toString();
        this._request('locationMap', {
            latitude: latitude,
            longitude: longitude,
            address: address || ''
        });
    };

    /**
     * 获取设备信息
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.deviceGetInfo = function (callback) {
        normalEventBind(this._event, 'deviceGetInfo', callback);
        this._request('deviceGetInfo');
    };

    /**
     * 获取网络信息
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.networkGetInfo = function (callback) {
        normalEventBind(this._event, 'networkGetInfo', callback);
        this._request('networkGetInfo');
    };

    /**
     * 监测网络状态变化
     * 注册后每当网络状态变化都会触发回调
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.networkWatch = function (callback) {
        this._event.on('networkWatch', callback);
    };

    /**
     * 二维码扫描
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.qrcodeScan = function (callback) {
        normalEventBind(this._event, 'qrcodeScan', callback);
        this._request('qrcodeScan');
    };

    /**
     * 预览图片
     * @constructor
     * @param {Array} imgs  图片URL集
     * @param {Number} id   起始位置(从0开始)
     */
    MediaCloudJSSDK.prototype.photoPreview = function (imgs, id) {
        this._request('photoPreview', {
            imgs: imgs,
            id: id || 0
        });
    };

    /**
     * 打开拍照/选择图片功能
     * @constructor
     * @param {Number}   maxnum   允许选择图片的最大张数 1~9
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.photoSelect = function (maxnum, callback) {
        maxnum = Math.min(9, Math.max(1, +maxnum));
        normalEventBind(this._event, 'photoSelect', callback);
        this._request('photoSelect', {
            max: maxnum
        });
    };

    /**
     * 音频录制
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.audioRecord = function (callback) {
        normalEventBind(this._event, 'audioRecord', callback);
        this._request('audioRecord');
    };

    /**
     * 音频转码状态查询
     * @constructor
     * @param {String} audioId 音频ID(上传回调获得)
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.audioStatusQuery = function (audioId, callback) {
        this._transStatusWatch.add(audioId, callback);
        this._request('transStatusQuery', {
            id: audioId
        })
    };

    /**
     * 拍摄/上传视频
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.videoSelect = function (callback) {
        var orignCallback = callback;
        callback = function (res) {
            if (res && res.status === 'complete') {
                res.thumb = 'data:image/*;base64,' + res.thumb;
            }
            orignCallback(res);
        };
        normalEventBind(this._event, 'videoSelect', callback);
        this._request('videoSelect');
    };

    /**
     * 视频转码状态查询
     * @constructor
     * @param {String} videoId 视频ID(上传回调获得)
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.videoStatusQuery = function (videoId, callback) {
        this._transStatusWatch.add(videoId, callback);
        this._request('transStatusQuery', {
            id: videoId
        })
    };

    /**
     * 监测摇一摇
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.shakeWatch = function (callback) {
        this._event.on('shakeEnable', function (res) {
            callback(res.status);
        });
        if (!this._shakeEnable) {
            this._request('shakeEnable');
            this._shakeEnable = true;
        }
    };

    /**
     * 跳转到直播
     * @constructor
     * @param string contentid 直播id
     * @param string title 直播标题
     * @param string sharesiteid 分享直播站点id
     */
    MediaCloudJSSDK.prototype.pushLiveViewController = function (contentid, title, sharesiteid) {
        this._request('pushLiveViewController', {
            contentid: contentid,
            title: title || '',
            sharesiteid: sharesiteid || 0
        });
    };

    /**
     * 跳转到电视直播
     * @constructor
     * @param string title
     * @param int sharesiteid
     */
    MediaCloudJSSDK.prototype.pushTvStreamController = function (title, sharesiteid) {
        this._request('pushTvStreamController', {
            title: title || '',
            sharesiteid: sharesiteid || 0
        });
    };

    /**
     * 跳转到报料
     * @controller
     */
    MediaCloudJSSDK.prototype.pushBrokeViewController = function (title) {
        this._request('pushBrokeViewController', {
            title: title || ''
        });
    };

    /**
     * 跳转到问政
     * @constructor
     */
    MediaCloudJSSDK.prototype.pushPoliticsViewController = function (title) {
        this._request('pushPoliticsViewController', {
            title: title || ''
        });
    };

    /**
     * 跳转到两微
     * @constructor
     */
    MediaCloudJSSDK.prototype.push2WeiViewController = function (title) {
        this._request('push2WeiViewController', {
            title: title || ''
        });
    };

    /**
     * 跳转链接
     * @constructor
     */
    MediaCloudJSSDK.prototype.pushLinkViewController = function (url, title) {
        this._request('pushLinkViewController', {
            url: url || '',
            title: title || ''
        });
    };
    
    /**
     * 判断是否是客户端打开
     * @returns {boolean}
     */
    MediaCloudJSSDK.prototype.isClient = function () {

        var status = false,
            cloudIdentify = new RegExp("mediacloudclient");

        if(cloudIdentify.test(navigator.userAgent)) status = true;

        return status;

    };

    /**
     * 获取加密用户登陆信息
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.userGetEncryptInfo = function (callback) {
        normalEventBind(this._event, 'userGetEncryptInfo', callback);
        this._request('userGetEncryptInfo');
    };

    /**
     * 语音阅读
     */
    MediaCloudJSSDK.prototype.readContentController = function (op) {
        this._request('readContentController', {
            op: op || 1
        });
    }

    /**
     * 重新登陆
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.reLogin = function (callback) {
        normalEventBind(this._event, 'reLogin', callback);
        this._request('reLogin');
    };

    /**
     *  打开新的内容详情
     * @param {Object} option
     * @param {Number} option.contenid 内容模型详情id
     * @param {Number} option.appid 内容模型类型id
     * @param {Number} option.siteid 内容模型站点id
     */
    MediaCloudJSSDK.prototype.openContentView = function(option){
        option = option || {};
        this._request('openContentView', option);
    };

    /**
     *  打开频道页
     * @param {Object} option
     * @param {string} option.type 
     * @param {string} option.menuid 
     * @param {string} option.appid 内容模型类型id
     * @param {string} option.name
     */
    MediaCloudJSSDK.prototype.openMenuView = function(option){
        option = option || {};
        this._request('openMenuView', option);
    };

    /**
     *  传递播放音频链接
     * @param {Object} option
     * @param {string} option.url
     */
    MediaCloudJSSDK.prototype.postAudioUrl = function(option){
        option = option || {};
        this._request('postAudioUrl', option);
    };
    

    /**
     * 获取客户端参数
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.getMobileParams = function (callback) {
        normalEventBind(this._event, 'getMobileParams', callback);
        this._request('getMobileParams');
    };

    /**
     * 下载资源
     * @constructor
     * @param {String} url 资源地址
     */
    MediaCloudJSSDK.prototype.downloadResource = function (url, alias) {
        var u = navigator.userAgent,
            isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

        if (this.isClient() && isIOS) {
            this._request('downloadResource', {
                url: url,
                alias: alias
            });
        } else {
            var a = document.createElement("a");

            a.style.display = "none";
            a.setAttribute("download", alias);
            a.setAttribute("href", url);
            a.click();
        }
    };

    /**
     * 获取鄂汇办token
     * @constructor
     * @param {Function} callback
     */
    MediaCloudJSSDK.prototype.getEHBTokenResult = function (callback) {
        normalEventBind(this._event, 'getEHBTokenResult', callback);
        this._request('getEHBTokenResult');
    };

    /**
     * 关闭当前页面
     * @param callback
     */
    MediaCloudJSSDK.prototype.closeCurrentPage = function (callback) {
        normalEventBind(this._event, 'closeCurrentPage', callback);
        this._request('closeCurrentPage');
    };

    window.mc = new MediaCloudJSSDK();
    window.mediaCloudCallback = mc._callback;
}());