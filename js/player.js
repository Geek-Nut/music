/* 封装播放控制 */
(function (window) {
    function Player($audio) {
        return new Player.prototype.init($audio);
    }
    Player.prototype = {
        constructor: Player,
        musiclist: [],
        init: function ($audio) {
            this.$audio = $audio;
            this.audio = $audio.get(0);
        },
        currentIndex: -1,
        trueIndex: 1,
        playerMusic: function (index, music) {
            //判断是否是同一首音乐
            if (this.currentIndex == index) {
                //同一首音乐
                this.trueIndex = 0;
                if (this.audio.paused) {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }
            } else {
                //不是同一首
                this.$audio.attr("src", music.link_url)
                this.audio.play();
                this.currentIndex = index;
                this.trueIndex = 1;
            }
        },
        preMusic: function () {
            var index = this.currentIndex - 1;
            if (index < 0) {
                index = this.musiclist.length - 1;
            }
            return index;
        },
        nextMusic: function () {
            var index = this.currentIndex + 1;
            if (index == this.musiclist.length) {
                index = 0;
            }
            return index;
        },
        delMusic: function (index) {
            this.musiclist.splice(index, 1);
            if (this.currentIndex > index) {
                this.currentIndex--;
            }
        },
        timeUpdate: function (callback) {
            $this = this;
            player.$audio.on("timeupdate", function () {
                var allTime = $this.audio.duration;
                var currentTime = $this.audio.currentTime;
                var timeStr = $this.formatDate(currentTime, allTime);
                callback(allTime, currentTime, timeStr);
            })
        },
        formatDate: function (currentTime, allTime) {
            var endMin = parseInt(allTime / 60);
            var endSec = parseInt(allTime % 60);
            if (endMin < 10) {
                endMin = "0" + endMin;
            };
            if (endSec < 10) {
                endSec = "0" + endSec;
            };
            var curMin = parseInt(currentTime / 60);
            var curSec = parseInt(currentTime % 60);
            if (curMin < 10) {
                curMin = "0" + curMin;
            };
            if (curSec < 10) {
                curSec = "0" + curSec;
            }
            return curMin + ":" + curSec + " / " + endMin + ":" + endSec;
        },
        set: function (value) {
            if (value < 0) value = 0;
            if (value > 1) value = 1;
            this.audio.currentTime = Number(this.audio.duration * value).toFixed(5);
        },
        setVoice: function (value) {
            if (value < 0) value = 0;
            if (value > 1) value = 1;
            this.audio.volume = value;
        }
    }
    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);