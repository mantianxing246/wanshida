var verifyStr = false//验证有没有通过
var url = null//验证的图片路径
var tokenExpiresTime = null,//token的时间，过期重新请求
    tokenKey = null,//token值
    tokenBeforeTime = null//上一次获得token的时间
$(function () {
    //得到token、验证的图片接口
    $(".sign-in").on("click", function () {
        //如果验证码通过了，就不能够弹出验证
        if (!verifyStr) {
            $("#mpanel").show()
        }
        getKey(1)//1代表图片url改变
    })

    //背景图片调整
    if ($(".container").width() < 1280) {
        $(".bj").css({
            "left": $(".container").width() - 1280 + 150 + "px"
        })
    }
    if (/iPad/.test(navigator.userAgent)) {
        // $(".container").css({
        //     width:"1310px"
        // })
        $(".bj").hide()
        $("body").attr({
            style: "overflow-x:auto"
        })
        $(".isIpad").addClass("ipad-style")
    }

    //同意还是不同意
    $(".checkbox-style").click(function () {
        $("#agree").prop("checked", !$("#agree").is(":checked"));
        $(this).toggleClass("input-background")
        $(this).css({
            outline: "none"
        })
    })

    //当点击注册的时候
    $(".button").click(function () {
        submitButton(verifyStr)
    })

    //点击×的时候关闭弹框
    $(".dialog span").click(function () {
        $(".dialog").hide()
        clearVal()
    })
    $(".dialog2 span").click(function () {
        $(".dialog2").hide()
    })

    //限制输入框的长度
    limitedLength()

    isIe9()//判断是否是ie9

    //失去焦点验证
    clearBlur()
})

//得到token、验证的图片接口
function getKey(urlChange) {
    var date = new Date()
    getAjax({
        url: "/api/user/getKey",
        data: {
            terminalType: "PCTerminal"
        },
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        type: "get",
        success: function (res) {
            tokenExpiresTime = res.data.tokenExpiresTime
            tokenKey = res.data.tokenKey
            tokenBeforeTime = new Date().getTime()
            if (urlChange === 1) {
                url = res.data.url

                //绘出验证码
                $("#mpanel").html("")
                drawCode($("#mpanel"), ["./images/" + url])

                // //当点击验证码刷新的图标时
                $(".icon-refresh").click(function () {
                    getKey(1)
                })
            }
        }, error: function (res) {
            if (new Date().getTime() - date.getTime() > 5000) {
                $(".dialog2").show()
                $(".dialog2 .dialog-container").html("The Internet is slow, please try again later.")
            } else {
                $(".dialog2").show()
                $(".dialog2 .dialog-container").html("The Internet is slow, please try again later.")
            }
        }
    })
}

//注册
function submitButton(verifyStr) {
    var firstName = clearSpace($("#firstName").val()),
        lastName = clearSpace($("#lastName").val()),
        phone = clearSpace($("#phone").val()),
        email = clearSpace($("#email").val()),
        postcode = clearSpace($("#postcode").val()),
        agree = $("#agree").is(":checked"),
        date = new Date()//查看是否时间超时


    //前端判断验证
    if (!regTest(firstName, lastName, phone, email, postcode, agree)) {
        return
    }

    if (!verifyStr) {
        $(".dialog2").show()
        $(".dialog2 .dialog-container").html("Please finish the I'm not a Robot test.")
        return
    }

    //当token超过一定时间，重新走接口
    if (new Date().getTime() - tokenBeforeTime > tokenExpiresTime) {
        $(".dialog2").show()
        $(".dialog2 .dialog-container").html("Network timeout, please refresh and retry")
    }

    //对返回来的token进行加密
    var md5Str = md5("phone:" + phone + "email:" + email + "tokenKey:" + tokenKey)

    getAjax({
        url: "/api/user/add",
        data: { "firstName": firstName, "lastName": lastName, "phone": phone, "email": email, "postcode": postcode },
        type: "post",
        contentType: "application/json;charset=utf-8",
        success: function (res) {
            if (res.errorMsg == "SUCCESS") {
                $(".dialog").show()
                $(".dialog-container").html("Registration is successful")

                setTimeout(function () {
                    clearVal()
                    $(".dialog").hide()
                }, 5000);

            } else {
                if (res.errorMsg.indexOf("mobile") != -1) {
                    $("#phoneError").show()
                    $("#phoneError").html("The mobile phone number has been registered, please try with another mobile phone number")
                    $("#phone").css({
                        border: "1px solid red"
                    })
                    $("#phone").focus()
                } else {
                    $(".dialog").show()
                    $(".dialog-container").html("Network timeout, please refresh and retry")
                }
            }
        },
        error: function (res) {
            if (new Date().getTime() - date.getTime() > 5000) {
                $(".dialog").show()
                $(".dialog-container").html("The Internet is slow, please try again later.")
            } else {
                $(".dialog").show()
                $(".dialog-container").html("Network timeout, please refresh and retry")
            }
        },
        token: md5Str
    })
}

//验证码 
function drawCode(ele, imgName) {
    //验证码
    ele.slideVerify({
        type: 2,        //类型
        vOffset: 5, //误差量，根据需求自行调整
        vSpace: 5,  //间隔
        imgName: imgName,
        imgSize: {
            width: $(".sign-in").width() + "px",
            height: '200px',
        },
        blockSize: {
            width: '40px',
            height: '40px',
        },
        barSize: {
            width: $(".sign-in").width() + "px",
            height: '40px',
        },
        ready: function () {
        },
        success: function () {
            verifyStr = true
            setTimeout(function () {
                $("#mpanel").slideUp(2000, function () {
                    $(".sign-in").html("<span class='sign-success'>&nbsp;√&nbsp;</span>Verification is successful.")
                })
            }, 1000);
        },
        error: function () {
            verifyStr = false
        },
        explain: "Please drag the piece and fit the missing part."
    });

    // //防止手机端浏览器左滑
    $(".verify-bar-area")[0].addEventListener('touchmove', function (e) {
        if (!verifyStr) {
            window.event.returnValue = false;
            // e.preventDefault()
        }
    }, { passive: false })
}

//ajax请求
function getAjax(opt) {
    var URL = location.protocol + "//" + location.host + "/rwc"
    var dataStr = opt.type == "post" ? JSON.stringify(opt.data) : opt.data
    $.ajax({
        url: URL + opt.url,
        data: dataStr,
        type: opt.type,
        success: function (res) {
            opt.success(res)
        },
        error: function (res) {
            opt.error(res)
        },
        timeout: 5000,
        headers: {
            token: opt.token
        },
        contentType: opt.contentType
    })
}

//验证
function regTest(firstName, lastName, phone, email, postcode, agree) {
    var reg = /^[ A-Za-z]*$/, isPass = true//特殊符号
    if (!reg.test(firstName) || !firstName || firstName.length > 60) {
        verification("#firstName", "#firstNameError", "Please fill-in your first name.",
            "More than 60 characters", "Incorrect format. Only letters allowed.", /^[ A-Za-z]*$/, 60)
        isPass = false
    }
    if (!reg.test(lastName) || !lastName || lastName.length > 80) {
        verification("#lastName", "#lastNameError", "Please fill-in your last name.",
            "More than 80 characters", "Incorrect format. Only letters allowed.", /^[ A-Za-z]*$/, 80)
        isPass = false
    }
    //电话
    if (!phone || !/^[0-9]+$/.test(phone) || phone.length > 30) {
        verification("#phone", "#phoneError", "Please fill-in your phone number.",
            "More than 30 characters", "Incorrect format. Only numbers allowed.", /^[0-9]+$/, 30)
        isPass = false
    }
    //邮件
    if (!/^[a-zA-Z0-9'_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(email) || email.length > 80) {
        verification("#email", "#emailError", "Please fill-in your email address.",
            "More than 80 characters", "Incorrect format. Only email address allowed.", /^[a-zA-Z0-9'_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, 80)
        isPass = false
    }
    //postcode
    if (!postcode || !/^[a-z0-9A-Z]+$/.test(postcode) || postcode.length > 30) {
        verification("#postcode", "#postcodeError", "Please fill-in your postcode.",
            "More than 30 characters", "Incorrect postcode, please check again.", /^[a-z0-9A-Z]+$/, 30)
        isPass = false
    }
    //没有选择同意
    if (!agree) {
        $("#agreeError").show()
        isPass = false
    } else {
        $("#agreeError").hide()
    }
    return isPass
}

//清理验证
function clearVal() {
    // setTimeout(function () {
    $("#firstName").val("")
    $("#lastName").val("")
    $("#phone").val("")
    $("#email").val("")
    $("#postcode").val("")

    $("#firstNameError").hide()
    $("#lastNameError").hide()
    $("#phoneError").hide()
    $("#emailError").hide()
    $("#postcodeError").hide()
    $("#agreeError").hide()

    $("#firstName").css({
        border: "1px solid #fff"
    })
    $("#lastName").css({
        border: "1px solid #fff"
    })
    $("#phone").css({
        border: "1px solid #fff"
    })
    $("#email").css({
        border: "1px solid #fff"
    })
    $("#postcode").css({
        border: "1px solid #fff"
    })

    //验证码清除
    $(".checkbox-style").removeClass("input-background")
    $("#agree").prop("checked", false);
    $(".sign-in").html("I am not a Robot.")
    verifyStr = false
    // }, 2000);
}

//限制最大长度
function limitedLength() {
    $("#firstName").on('input', function () {
        var maxlength = 60, val = $(this).val()
        if (maxlength <= val.length) {
            $(this).val(val.substring(0, maxlength))
        }
    })
    $("#lastName").on('input', function () {
        var maxlength = 80, val = $(this).val()
        if (maxlength <= val.length) {
            $(this).val(val.substring(0, maxlength))
        }
    })
    $("#phone").on('input', function () {
        var maxlength = 30, val = $(this).val()
        if (maxlength <= val.length) {
            $(this).val(val.substring(0, maxlength))
        }
    })
    $("#email").on('input', function () {
        var maxlength = 80, val = $(this).val()
        if (maxlength <= val.length) {
            $(this).val(val.substring(0, maxlength))
        }
    })
    $("#postcode").on('input', function () {
        var maxlength = 30, val = $(this).val()
        if (maxlength <= val.length) {
            $(this).val(val.substring(0, maxlength))
        }
    })
}

//首位去空格
function clearSpace(str) {
    str += ""
    return str && str.replace(/^\s+|\s+$/g, "")
}

//失去焦点验证
function clearBlur() {
    $("#firstName").on("blur", function () {
        verification("#firstName", "#firstNameError", "Please fill-in your first name.",
            "More than 60 characters", "Incorrect format. Only letters allowed.", /^[ A-Za-z]*$/, 60)
    })

    $("#lastName").on("blur", function () {
        verification("#lastName", "#lastNameError", "Please fill-in your last name.",
            "More than 80 characters", "Incorrect format. Only letters allowed.", /^[ A-Za-z]*$/, 80)
    })

    $("#phone").on("blur", function () {
        verification("#phone", "#phoneError", "Please fill-in your phone number.",
            "More than 30 characters", "Incorrect format. Only numbers allowed.", /^[0-9]+$/, 30)
    })

    $("#email").on("blur", function () {
        verification("#email", "#emailError", "Please fill-in your email address.",
            "More than 80 characters", "Incorrect format. Only email address allowed.", /^[a-zA-Z0-9'_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, 80)
    })

    $("#postcode").on("blur", function () {
        verification("#postcode", "#postcodeError", "Please fill-in your postcode.",
            "More than 30 characters", "Incorrect postcode, please check again.", /^[a-z0-9A-Z]+$/, 30)
    })
}

//验证的方法
function verification(elStr, elErrorStr, errorStr1, errorStr2, errorStr3, reg, moreThen) {
    // $(elStr).on('blur', function () {
    var firstName = clearSpace($(elStr).val())
    if (!reg.test(firstName) || !firstName || firstName.length > moreThen) {
        $(elErrorStr).show()
        if (!firstName) {
            $(elErrorStr).html(errorStr1)
        } else if (firstName.length > 60) {
            $(elErrorStr).html(errorStr2)
        } else {
            $(elErrorStr).html(errorStr3)
        }
        $(elStr).css({
            border: "1px solid red"
        })
    } else {
        $(elErrorStr).hide()
        $(elStr).css({
            border: "1px solid #fff"
        })
    }
    // })
}

//判断是否是ie9
function isIe9() {
    if (navigator.userAgent.indexOf("MSIE 9.0") > 0) {
        $(".row").eq(0).css({
            width: $(".container").width() / 3 + "px",
            overflow: "hidden",
            position: "relative"
        })
        $(".form-controls").eq(0).css({
            width: $(".row").width() / 2 - 30 + "px",
            float: "left",
            position: "absolute"
        })
        $(".form-controls").eq(1).css({
            width: $(".row").width() / 2 - 30 + "px",
            float: "right",
            position: "absolute",
            right: 0,
            top: 0
        })
        $("#lastNameError").css({
            width: $(".row").width() / 2 - 30 + "px",
            float: "right",
            position: "absolute",
            right: 0,
            top: "-20px"
        })

        $(".row").eq(2).css({
            "margin-left": ($(".container").width() - $(".bottom-contanier").width()) / 2 + "px"
        })
    }
}