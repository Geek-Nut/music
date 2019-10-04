/* 封装进度条控制，使用时传入进度条的三个对象和最大宽度 */
(function (window) {
    function Progress(progressLine, progressBar, progerssDot, maxWidth) {
        return new Progress.prototype.init(progressLine, progressBar, progerssDot, maxWidth);
    }
    Progress.prototype = {
        init: function (progressLine, progressBar, progerssDot, maxWidth) {
            this.progressLine = progressLine;
            this.progressBar = progressBar;
            this.progerssDot = progerssDot;
            this.maxWidth = maxWidth;
        },
        isMove: false,/* 用以判断进度条是否处于拖动中，如是则暂停刷新进度条 */
        isTureClick: false,/* 用以判断点击处是否处于进度条中，如不是则不监听鼠标抬起 */
        click: function (callback) {/* 点击后执行回调 */
            var $this = this;
            this.progressLine.click(function (event) {
                var nomorlLeft = $(this).offset().left;
                var eventLeft = event.pageX;
                $this.progressBar.css("width", eventLeft - nomorlLeft);
                $this.progerssDot.css("left", eventLeft - nomorlLeft - 5);
                var pg_value = (eventLeft - nomorlLeft) / $(this).width();
                callback(Number(pg_value).toFixed(5));
            });
        },
        movedChange: function (callback) {/* 移完后执行回调 */
            var $this = this;
            var left;
            //监听鼠标的按下事件
            this.progressLine.mousedown(function () {
                $this.isMove = true;
                $this.isTureClick = true;
                //监听鼠标的移动事件
                $(document).mousemove(function (event) {
                    var nomorlLeft = $this.progressLine.offset().left;
                    var eventLeft = event.pageX;
                    left = eventLeft - nomorlLeft;
                    if (left >= 0 && left <= $this.maxWidth) {
                        $this.progressBar.css("width", left);
                        $this.progerssDot.css("left", left - 5);
                    }
                })
            });
            //监听鼠标的抬起事件
            $(document).mouseup(function () {
                if ($this.isTureClick) {
                    $(document).off("mousemove");
                    var pg_value = left / $this.maxWidth;
                    callback(Number(pg_value).toFixed(5));
                    $this.isMove = false;
                    $this.isTureClick = false;
                }
            });
        },
        movingChange: function (callback) {/* 边移边执行回调 */
            var $this = this;
            this.progressLine.mousedown(function () {
                $this.isMove = true;
                $this.isTureClick = true;
                $(document).mousemove(function (event) {
                    var nomorlLeft = $this.progressLine.offset().left;
                    var eventLeft = event.pageX;
                    var left = eventLeft - nomorlLeft;
                    if (left >= 0 && left <= $this.maxWidth) {
                        $this.progressBar.css("width", left);
                        $this.progerssDot.css("left", left - 5);
                    }
                    if ($this.isTureClick) {
                        var pg_value = left / $this.maxWidth;
                        callback(Number(pg_value).toFixed(5));
                    }
                })
            });
            $(document).mouseup(function () {
                $(document).off("mousemove");
                $this.isMove = false;
                $this.isTureClick = false;
            });
        },
        set: function (Value) {
            if (this.isMove) return;
            var value = this.maxWidth * Value;
            this.progressBar.css("width", value);
            this.progerssDot.css("left", value - 5);
        }
    }
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window);