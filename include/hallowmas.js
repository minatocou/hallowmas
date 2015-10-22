$(function(){
   $('#start-btn').on('touchstart',function(){
        $('#container').addClass('p2');
       startGame();
   })
    $('#save-btn').on('touchstart',function(){
        uploadPic(canvas,function(pic){
            $('#viewImg').attr('src','data:image/png;base64,'+pic);
            $('#container').removeClass('p1').addClass('p3');
        },function(error){

        });
    })
    $('#refresh').on('touchstart',function(){
        startGame();
    })
    $('#reset-btn').on('touchstart',function(){
        $('#container').removeClass('p3').addClass('p2');
        startGame();
    })
});
var canvas = document.getElementById("cas"), ctx = canvas.getContext("2d");
var x1, y1, a = 10, timeout, totimes = 100, distance = 30;
var saveDot = [];
canvas.width = document.body.offsetWidth*.9;

function startGame(){
    var img = new Image();
    img.src = "include/pumpkin.png";
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
    var x = hastouch ? e.targetTouches[0].pageX : e.clientX;
    var y = hastouch ? e.targetTouches[0].pageY : e.clientY;
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

function uploadPic(cas,success,error) {

    // Generate the image data
    var pic = cas.toDataURL("image/png");
    pic = pic.replace(/^data:image\/(png|jpg);base64,/, "")
    var data={
        imgData:pic
    }
    // Sending the image data to Server
    if(success)
        success(pic);
    //$.ajax({
    //    type: 'POST',
    //    url: 'uploadPic',
    //    data: data,
    //    contentType: 'application/json; charset=utf-8',
    //    dataType: 'json',
    //    success: function(msg){
    //
    //
    //    },
    //    error: error
    //});
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
    ctx.globalCompositeOperation = "destination-out";

    window.addEventListener(tapstart, function (e) {
        clearTimeout(timeout);
        e.preventDefault();
        area = getClipArea(e, hastouch);

        x1 = area.x;
        y1 = area.y;

        drawLine(x1, y1);

        this.addEventListener(tapmove, tapmoveHandler);

        this.addEventListener(tapend, function () {
            this.removeEventListener(tapmove, tapmoveHandler);
            //检测擦除状态
            timeout = setTimeout(function () {
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var dd = 0;
                for (var x = 0; x < imgData.width; x += distance) {
                    for (var y = 0; y < imgData.height; y += distance) {
                        var i = (y * imgData.width + x) * 4;
                        if (imgData.data[i + 3] > 0) { dd++ }
                    }
                }
                if (dd / (imgData.width * imgData.height / (distance * distance)) < 0.4) {
                    canvas.className = "noOp";
                }
            }, totimes)
        });

        function tapmoveHandler(e) {
            clearTimeout(timeout);

            e.preventDefault();

            area = getClipArea(e, hastouch);

            x2 = area.x;
            y2 = area.y;

            drawLine(x1, y1, x2, y2);

            x1 = x2;
            y1 = y2;
        }
    })
}

function drawLine(x1, y1, x2, y2){
//		ctx.save();
//		if(arguments.length==2){
//			saveDot = [[x1, y1]];
//			ctx.beginPath();
//			ctx.arc(x1, y1, a, 0, 2 * Math.PI);
//			ctx.fill();
//		}else {
//			saveDot.push([x2,y2]);
//			if(saveDot.length >= 3){
//				ctx.beginPath();
//				ctx.moveTo(saveDot[0][0], saveDot[0][1]);
//				ctx.quadraticCurveTo(saveDot[1][0], saveDot[1][1], saveDot[2][0], saveDot[2][1]);
//				ctx.stroke();
//				saveDot = [saveDot.pop()];
//			}
//		}
//		ctx.restore();
    ctx.save();
    ctx.beginPath();
    if(arguments.length==2){
        ctx.arc(x1, y1, a, 0, 2 * Math.PI);
        ctx.fill();
    }else {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    ctx.restore();
}

//使用clip来达到擦除效果
function otherClip() {
    var hastouch = "ontouchstart" in window ? true : false,
        tapstart = hastouch ? "touchstart" : "mousedown",
        tapmove = hastouch ? "touchmove" : "mousemove",
        tapend = hastouch ? "touchend" : "mouseup";

    var area;

    canvas.addEventListener(tapstart, function (e) {
        clearTimeout(timeout);
        e.preventDefault();

        area = getClipArea(e, hastouch);

        x1 = area.x;
        y1 = area.y;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x1, y1, a, 0, 2 * Math.PI);
        ctx.clip();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        canvas.addEventListener(tapmove, tapmoveHandler);
        canvas.addEventListener(tapend, function () {
            canvas.removeEventListener(tapmove, tapmoveHandler);

            timeout = setTimeout(function () {
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var dd = 0;
                for (var x = 0; x < imgData.width; x += distance) {
                    for (var y = 0; y < imgData.height; y += distance) {
                        var i = (y * imgData.width + x) * 4;
                        if (imgData.data[i + 3] > 0) {
                            dd++
                        }
                    }
                }
                if (dd / (imgData.width * imgData.height / (distance * distance)) < 0.4) {
                    canvas.className = "noOp";
                }
            }, totimes)

        });

        function tapmoveHandler(e) {
            e.preventDefault();
            area = getClipArea(e, hastouch);
            x2 = area.x;
            y2 = area.y;

            var asin = a * Math.sin(Math.atan((y2 - y1) / (x2 - x1)));
            var acos = a * Math.cos(Math.atan((y2 - y1) / (x2 - x1)));
            var x3 = x1 + asin;
            var y3 = y1 - acos;
            var x4 = x1 - asin;
            var y4 = y1 + acos;
            var x5 = x2 + asin;
            var y5 = y2 - acos;
            var x6 = x2 - asin;
            var y6 = y2 + acos;

            ctx.save();
            ctx.beginPath();
            ctx.arc(x2, y2, a, 0, 2 * Math.PI);
            ctx.clip();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x3, y3);
            ctx.lineTo(x5, y5);
            ctx.lineTo(x6, y6);
            ctx.lineTo(x4, y4);
            ctx.closePath();
            ctx.clip();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            x1 = x2;
            y1 = y2;
        }
    })
}