var commit=[
    "雕塑界的一股清流，你要是走上艺术之路，罗丹都要玩儿蛋去了！",
    "雕塑界的业界良心，要是早生几百年，米开朗基罗都要跪舔你！",
    "凶神恶煞，谁见谁怕，你这个活久见的南瓜灯我给满分！",
    "你的南瓜灯已经超神了，正带领人类降妖除魔走向胜利！",
    "你的南瓜灯加个蝴蝶结就是HelloKitty了，不吓人，负分！",
    "你这个南瓜灯雕得天然不刺激，我都不怕鬼能怕吗？！",
    "好好的一个南瓜就这么毁了，骚年你能走点儿心吗？",
    "手残不是病，犯起来要人命，分享给你的小伙伴让他们开开眼吧！",
    "手残乃兵家常事，大侠请重新来过......",
    "看这南瓜被你刻得骨络清奇，想必是大师手笔，少年，练过的吧？",
    "这个南瓜灯实在太抽象，已经无法被评论。",
    "别难过，刻成这样并不是你的错"
];
$(function(){
   $('#start-btn').on('touchstart',function(){
       $('#container').removeClass().addClass('p2');
       $('body').addClass('auto-scroll');
       startGame();
   })
    $('#save-btn').on('touchstart',function(){
        var title=commit[parseInt((commit.length-1)*Math.random())];
        uploadPic(canvas,function(data,pic){
            $('#viewImg').attr('src','data:image/png;base64,'+pic);
            $('#container').removeClass().addClass('p3');
            $('body').addClass('auto-scroll');

            $('.vtext').html(title)
            wxShareConf.title=title;
            wxShareConf.desc=title;
            wxShareConf.link=location.href.match('.*halloween')+'/id-'+data.imageid;
            wxShareConf.imgUrl=data.image;
            fx();
        },function(error){

        },title);
    })
    $('#refresh').on('touchstart',function(){
        startGame();
    })
    $('#reset-btn').on('touchstart',function(){
        $('#container').removeClass().addClass('p2');
        startGame();
    })
    $('#iDO').on('touchstart',function(){
        $(this).hide();
        $('.endPage-btn').removeClass('hide');
        $('#container').removeClass().addClass('p1');
        $('body').removeClass();
    })
    $('#share-btn,.plane').on('touchstart',function(){
        $('.plane')[0].classList.toggle('show');
    })
    $('.view-index').on('touchstart',function(e){
        e.preventDefault();
        var startY=e.originalEvent.changedTouches[0].pageY;
        $('.view-index').on('touchend',function(ee){
            ee.preventDefault();
            if(startY>ee.originalEvent.changedTouches[0].pageY){
                $('#container').addClass('p-text');
            }
        });

    })
    $('.view').on('touchstart',function(e){
        e.preventDefault();
        var startY=e.originalEvent.changedTouches[0].pageY;
        $('.view').on('touchend',function(ee){
            ee.preventDefault();
            if(startY<ee.originalEvent.changedTouches[0].pageY){
                $('#container').removeClass('p-text');
            }
        });
    })
});


var canvas = document.getElementById("cas"), ctx = canvas.getContext("2d");
var x1, y1, a = 1, timeout, totimes = 100, distance = 30;
var saveDot = [];
canvas.width = document.body.offsetWidth*.9;

var rangeSlider = $('#range')[0];

noUiSlider.create(rangeSlider, {
    start: [ 10 ],
    step:1,
    range: {
        'min': [  1 ],
        'max': [ 20 ]
    }
});
rangeSlider.noUiSlider.on('update', function( values, handle ) {
    $('#range-text').html('笔粗：'+values[handle]);
    x1=y1=a=values[handle];
    tapClip();
});


function startGame(){
    var img = new Image();
    img.src = pumpkinImg;
    img.onload = function () {
        img.height=img.height*(canvas.width/img.width);
        img.width=canvas.width;
        canvas.height = img.height;
        var w = canvas.height*img.width/img.height;
        ctx.drawImage(img, (canvas.width-w)/2, 0, w, canvas.height);
        tapClip()
    };
}

function getClipArea(e, hastouch){
    var x;
    var y;
    if(hastouch){
        if(e.targetTouches[0]){
            x=e.targetTouches[0].pageX;
            y=e.targetTouches[0].pageY;
        }else{
            x=e.changedTouches[0].pageX;
            y=e.changedTouches[0].pageY;
        }
    }else{
        x=e.clientX;
        y=e.clientY;
    }
    var ndom = canvas;

    while(ndom.tagName!=="BODY"){
        x -= ndom.offsetLeft;
        y -= ndom.offsetTop;
        ndom = ndom.parentNode;
    }
    return {
        x: x,
        y: y
    }
}

function uploadPic(cas,success,error,text) {

    // Generate the image data
    var pic = cas.toDataURL("image/png");
    pic = pic.replace(/^data:image\/(png|jpg);base64,/, "")
    var data={
        imgData:pic,
        text:text
    }
    // Sending the image data to Server

    $.ajax({
        type: 'POST',
        url: '/special/halloween_upload',
        data: data,
        dataType: 'json',
        success: function(data){
            if(success)
                success(data,pic);
        },
        error: error
    },'json');
}

//通过修改globalCompositeOperation来达到擦除的效果
function tapClip() {
    var hastouch = "ontouchstart" in window ? true : false,
        tapstart = hastouch ? "touchstart" : "mousedown",
        tapmove = hastouch ? "touchmove" : "mousemove",
        tapend = hastouch ? "touchend" : "mouseup";

    var area;
    var x2,y2;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = a * 2;
    //ctx.globalCompositeOperation = "source-out";
    canvas.removeEventListener(tapstart,tStart);
    canvas.removeEventListener(tapmove,tapmoveHandler);
    canvas.removeEventListener(tapend,tapmoveHandler);
    canvas.addEventListener(tapstart, tStart)
    function tStart(e){
        clearTimeout(timeout);
        e.preventDefault();
        area = getClipArea(e, hastouch);

        x1 = area.x;
        y1 = area.y;

        drawLine(x1, y1);
        canvas.addEventListener(tapmove, tapmoveHandler);
        canvas.addEventListener(tapend, tapmoveHandler);
    }
    function tapmoveHandler(e) {
        clearTimeout(timeout);

        e.preventDefault();

        area = getClipArea(e, hastouch);

        x2 = area.x;
        y2 = area.y;
        if(e.type=='touchend'){
            drawLine(x1, y1, x2, y2,true);
        }else{
            drawLine(x1, y1, x2, y2);
        }


        x1 = x2;
        y1 = y2;
    }

}

function drawLine(x1, y1, x2, y2,isEnd){
    ctx.save();
    if(arguments.length==2){
        ctx.beginPath();
        //ctx.arc(x1, y1, a, 0, 2 * Math.PI);
        //ctx.fill();
    }else {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle="#ffd88b";
        ctx.stroke();
        ctx.lineWidth = a*2-4;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle="#79481f";
        ctx.stroke();
        if(isEnd){
            ctx.closePath();
        }
    }
    ctx.restore();
}

function search(name){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
    var r = window.location.search.substr(1).match(reg);
    if (r!=null) return (r[2]); return null;
}
var wxShareConf = {
    title: '恐怖万圣节 刻南瓜来辟邪！',
    desc: '恐怖万圣节 刻南瓜来辟邪！',
    link: location.href,
    imgUrl: location.protocol+lulu+__uri('include/css-pumpkin.png')
};
(function callWxApi(err) {
    var data = {url: location.href};
    if (err) data.err = err;
    $.ajax({
        url: '/special/get_wx_signature',
        type: "POST",
        dataType: 'json',
        data: data,
        success: function (data) {
            wx.config({
                debug: search('debug') || false,
                appId: data.appid,
                timestamp: data.timestamp,
                nonceStr: data.nonceStr,
                signature: data.signature,
                jsApiList: ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage']
            });
            wx.ready(function () {
                fx();
            });
        }
    });
})();


function fx(){
    wx.onMenuShareTimeline({
        title: wxShareConf.title,
        link: wxShareConf.link,
        imgUrl: wxShareConf.imgUrl,
        trigger: function () {
        },
        success: function () {
        },
        cancel: function () {
        },
        fail: function () {
        }
    });
    wx.onMenuShareAppMessage({
        title: wxShareConf.title,
        desc: wxShareConf.desc,
        link: wxShareConf.link,
        imgUrl: wxShareConf.imgUrl,
        trigger: function () {
        },
        success: function () {
        },
        cancel: function () {
        },
        fail: function () {
        }
    });
}
