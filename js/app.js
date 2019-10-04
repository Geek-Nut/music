//入口函数
$(function () {
	//加载滚动条插件
	$(".song-list").mCustomScrollbar();
	//获取一些元素
	$audio = $("audio"); /* 音乐播放标签 */
	$ly_ul = $(".ly-ul");
	$only_ul = $(".only-lyric");
	//引入Player对象
	player = new Player($audio);
	//加载列表
	getPlayerList();
	//监听事件
	initEvent();
})

//加载音乐列表的方法
function getPlayerList() {
	var $musicList = $(".song-list ul");
	$.ajax({
		url: "./songs/songlist.json",
		dataType: "json",
		success: function (data) {
			player.musiclist = data;
			$.each(data, function (index, ele) {
				var $item = creatMusicItem(index, ele);
				$musicList.append($item);
			});
			changeInfor(data[0]);
		},
		error: function (e) {
			console.log("failed");
			console.log(e);
		}
	})
}

//更改界面信息
function changeInfor(music) {
	//更改文字信息
	$(".ms-song").text(music.name);
	$(".ms-singer").text(music.singer);
	$(".ms-album").text(music.album);
	$(".time-time").text("00:00 / " + music.time);
	//更改封面背景
	$(".ms-img img").attr("src", music.cover);
	$(".mask1").css("background", "url(" + music.cover + ")no-repeat center center");
	//清空歌词
	$ly_ul.get(0).innerHTML = "";
	$only_ul.get(0).innerHTML = "";
	//同步歌词
	var lyric = new Lyric(music.link_lrc);
	window.lyric = lyric;
	lyric.parseLryic(function (data) {
		$.each(data, function (index, ele) {
			var item = $("<li>" + ele + "</li>");
			$ly_ul.append(item);
		});
		$.each(data, function (index, ele) {
			var item = $("<li>" + ele + "</li>");
			$only_ul.append(item);
		});
	});
	//刷新歌词和进度条
	if (player.trueIndex == 1) {
		lyric.index = 0;
		progress.set(0);
	};
}

//创建每条音乐的方法
function creatMusicItem(index, music) {
	var $item = $("<li class=\"songs\"><div class=\"song-index\"><span class=\"index-num\">" + (index + 1) + "</span><span class=\"wave disappear\"></1span></div><div class=\"song-div1\"><span class=\"song-name\">" + music.name + "</span><div class=\"song-btns disappear\"><div class=\"list-del\"><div class=\"del-img\"></div></div><div class=\"list-add\"><div class=\"add-img\"></div></div><div class=\"list-play\"><div class=\"play-img \"></div></div></div></div><div class=\"song-singer\">" + music.singer + "</div><div class=\"song-album\">" + music.album + "</div></li>");
	$item.get(0).index = index;
	$item.get(0).music = music;
	return $item;
}

//监听事件
function initEvent() {

	//委托式监听悬停
	$(".song-list").delegate(".songs", "mouseenter", function () {
		$(this).find(".song-btns").removeClass("disappear");
	});
	$(".song-list").delegate(".songs", "mouseleave", function () {
		$(this).find(".song-btns").addClass("disappear");
	});

	//委托式监听点击
	var $stop_start = $(".stop-start");
	//监听歌曲里的播放按钮
	$(".song-list").delegate(".play-img", "click", function () {
		var $songs = $(this).parents(".songs");
		//处理播放图标
		$(this).toggleClass("play-img1");
		$(this).parents(".songs").siblings().find(".play-img").removeClass("play-img1");
		if ($(this).attr("class").indexOf("play-img1") > 0) {
			//当前属于播放状态
			$stop_start.addClass("stop-start1");
		} else {
			//当前属于暂停状态
			$stop_start.removeClass("stop-start1");
		};
		//处理高亮
		$songs.toggleClass("light");
		$songs.siblings().removeClass("light");
		//处理索引数字
		$songs.find(".index-num").toggleClass("disappear");
		$songs.siblings().find(".index-num").removeClass("disappear");
		//处理小波浪
		$songs.find(".wave").toggleClass("disappear");
		$songs.siblings().find(".wave").addClass("disappear");
		//处理播放歌曲问题
		player.playerMusic($songs.get(0).index, $songs.get(0).music)
		//更新界面信息
		changeInfor(player.musiclist[$songs.get(0).index]);
	});
	//监听歌曲里面的删除按钮
	$(".song-list").delegate(".del-img", "click", function () {
		var $songs = $(this).parents(".songs");
		//如果删除的是正在播放的歌曲，自动播放下一首
		if ($songs.get(0).index == player.currentIndex) {
			$(".songs").eq(player.nextMusic() + 1).find(".play-img").trigger("click");
		}
		player.delMusic($songs.get(0).index);
		$songs.remove();
		//重新排序
		$(".songs").each(function (index, ele) {
			ele.index = index - 1;
			$(ele).find(".index-num").text(index);
		});
	});
	//监听播放按钮
	$stop_start.click(function () {
		$(this).toggleClass("stop-start1");
		//判断是否播放过音乐
		if (player.currentIndex == -1) {
			//没有播放过音乐
			$(".songs").eq(1).find(".play-img").trigger("click");
		} else {
			$(".songs").eq(player.currentIndex + 1).find(".play-img").trigger("click");
		}

	});
	//监听上一首按钮
	$(".pre").click(function () {
		if (player.currentIndex == -1) {
			//没有播放过音乐
			$(".songs").eq(1).find(".play-img").trigger("click");
		} else {
			$(".songs").eq(player.preMusic() + 1).find(".play-img").trigger("click");
		}
	});
	//监听下一首按钮
	$(".next").click(function () {
		if (player.currentIndex == -1) {
			//没有播放过音乐
			$(".songs").eq(1).find(".play-img").trigger("click");
		} else {
			$(".songs").eq(player.nextMusic() + 1).find(".play-img").trigger("click");
		}
	});

	//监听播放结束
	$audio.on("ended", function () {
		$(".songs").eq(player.nextMusic() + 1).find(".play-img").trigger("click");
	});

	$(".like-img").click(function () {
		$(this).toggleClass("like-img1");
	});
	$(".only-img").click(function () {
		$(this).toggleClass("only-img1");
	});

	//监听声音图标点击
	$(".voice-bar-img").click(function () {
		//更换图标
		$(this).toggleClass("voice-bar-img1");
		//实现功能
		if ($(this).attr("class").indexOf("voice-bar-img1") > 0) {
			//变为没声音
			player.setVoice(0);
		} else {
			//恢复声音
			var recoverValue = $(".voice-bar-pg").width() / 80;
			player.setVoice(recoverValue);
		}
	});

	//监听播放进度
	var $timed = $(".time-time");
	player.timeUpdate(function (allTime, currentTime, timeStr) {
		//更新进度条
		if (timeStr.indexOf("NaN") < 0) {
			$timed.text(timeStr);
			//计算进度百分比
			var progressValue = currentTime / allTime;
			progress.set(progressValue);
		};
		//同步歌词
		lyric.currentIndex(currentTime);
		var index = lyric.index;
		var $item = $(".ly-ul li");
		var $item1 = $(".only-lyric li");
		if (typeof (index) != "undefined") {
			$item.eq(index).addClass("cur");
			$item.eq(index).siblings().removeClass("cur");
			$(".ly-ul").css("top", -index * 35 + 105);
			$item1.eq(index).addClass("only-cur");
			$item1.eq(index).siblings().removeClass("only-cur");
			$(".only-lyric").css("top", -index * 100 + 200);
		}
	});

	//监听进度条点击
	var timeLine = $(".time-bar-bg"); /* 获取进度条背景 */
	var timeBar = $(".time-bar-pg"); /* 获取进度条前景 */
	var timeDot = $(".time-bar-dot"); /* 获取进度条圆点 */
	progress = new Progress(timeLine, timeBar, timeDot, 650);
	progress.click(function (value) {
		player.set(value);
	});
	progress.movedChange(function (value) {
		player.set(value);
	});

	//监听音量条点击
	var voiceLine = $(".voice-bar-bg"); /* 获取音量条背景 */
	var voiceBar = $(".voice-bar-pg"); /* 获取音量条前景 */
	var voiceDot = $(".voice-bar-dot"); /* 获取音量条圆点 */
	voiceProgress = new Progress(voiceLine, voiceBar, voiceDot, 80);
	voiceProgress.click(function (value) {
		player.setVoice(value);
	});
	voiceProgress.movingChange(function (value) {
		player.setVoice(value);
	});

	//监听键盘
	$(document).keydown(function (e) {
		if (e.keyCode == 32) $(".stop-start").trigger("click");
		if (e.keyCode == 37) $(".pre").trigger("click");
		if (e.keyCode == 39) $(".next").trigger("click");
	});

	//监听纯净模式按钮
	var $pure = $(".only-img");
	var $mian = $(".rel-content");
	var $only = $(".only-mod");
	var $mask1 = $(".mask1");
	$pure.click(function () {
		$mian.toggleClass("disappear");
		$mask1.toggleClass("mask1-new");
		$only.toggleClass("disappear");
	});
}