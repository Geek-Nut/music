/* 封装歌词解析,传入歌词地址
使用时调用parseLyric方法后可在回调中接收歌词
使用currentIndex方法可返回正在播放的歌词索引 */
(function (window) {
    function Lyric(src) {
        return new Lyric.prototype.init(src);
    }
    Lyric.prototype = {
        constructor: Lyric,
        init: function (src) {
            this.src = src;
        },
        rel_timeList: [],
        rel_lyricList: [],
        loadLyric: function (callback) {
            var $this = this;
            $.ajax({
                url: $this.src,
                dataType: "json",
                success: function (data) {
                    var value = data.lyric;
                    callback(value);
                },
                error: function (e) {
                    console.log("failed");
                    console.log(e);
                }
            });
        },
        parseLryic: function (callback) {
            this.rel_timeList = [];
            this.rel_lyricList = [];
            var $this = this;
            var timeList = [];
            var lyricList = [];
            var once = [];
            var stop = true;
            this.loadLyric(function (data) {
                var arry = data.split("\n");
                var time1 = /\[(\d*:\d*\.\d*)\]/;
                $.each(arry, function (i, item) {
                    var res = time1.exec(item);
                    if (res == null) return true;
                    timeList.push(res[1]);
                    //lyricList为直接清除所有时间的歌词
                    lyricList.push(item.replace(/\[\d*:\d*\.\d*\]/g, ""));
                    //once为直接清除一遍时间的歌词，用以继续提取重复的时间和歌词
                    once.push(item.replace(/\[\d*:\d*\.\d*\]/, ""));
                })
                //循环直至once所有时间提取至timelist
                var limit = 20;
                do {
                    //防止死循环，限制循环次数
                    limit--;
                    if (limit < 0) stop = false;
                    var counter = 0;
                    $.each(once, function (i, item) {
                        if (item.indexOf("]") > 0) counter = 1;
                    });
                    if (counter) {
                        $.each(once, function (i, item) {
                            var res1 = time1.exec(item);
                            if (res1 == null) return true;
                            once[i] = item.replace(/\[\d*:\d*\.\d*\]/, "");
                            timeList.push(res1[1]);
                            lyricList.push(lyricList[i]);
                        })
                    } else {
                        stop = false;
                    }
                } while (stop);
                //转换时间格式
                $.each(timeList, function (i, item) {
                    timeList[i] = $this.parseTime(timeList[i]);
                });
                //时间排序，并将排序好的时间赋给rel_timeList
                $.each(timeList, function (i, item) {
                    $this.rel_timeList[i] = item;
                });
                $this.rel_timeList.sort(function (a, b) {
                    return a - b
                });
                //通过排序好的时间，排序歌词，并赋给rel_lyricList
                $.each($this.rel_timeList, function (a, c) {
                    $.each(timeList, function (b, d) {
                        if (c == d) $this.rel_lyricList[a] = lyricList[b];
                    })
                });
                callback($this.rel_lyricList);
            });
        },
        parseTime: function (value) {
            var time = value.split(":");
            var min = parseInt(time[0]) * 60;
            var sec = parseFloat(time[1]);
            var allTime = parseFloat(Number(min + sec).toFixed(2));
            return allTime;
        },
        currentIndex: function (value) {
            var $this = this;
            var index;
            $.each($this.rel_timeList, function (i, item) {
                if (value >= item) $this.index = i;
            });
        }
    }
    Lyric.prototype.init.prototype = Lyric.prototype;
    window.Lyric = Lyric;
})(window);