'use strict';
//轮播图焦点背景颜色
! function(window) {
    const ICON_FOCUS = `#B61B1F`;
    //运动效果
    const TWEEN = {
        /*匀速*/
        linear: (t, b, c, d) => c * t / d + b,
        /*加速曲线*/
        easeIn: (t, b, c, d) => c * (t /= d) * t + b,
        /*减速曲线*/
        easeOut: (t, b, c, d) => -c * (t /= d) * (t - 2) + b
    };
    //默认参数
    const DEFAULT_OPTIONS = {
        sliderWrap: '', //轮播图id或者class
        auto: 1, //自动播放 1或0
        interval: 4000, //停顿时间
        img: [], //图片地址
        effect: 'easeIn', //效果配置
        eType: 'onmouseover', //切换按钮鼠标事件
    };
    //轮播图构造函数
    class Slider {
        constructor(ele, json = {}) {
                this.sliderWrap = document.querySelector(ele);
                this.index = 0;
                this.settings = Object.assign({}, DEFAULT_OPTIONS, json);
                this.init();
            }
            //静态方法,运动框架的封装,高级浏览器或者移动端可以用transform:translate3D(x,y,z)来代替
        static doMove(obj, json, times, fx, fn) {
                let iCur = {};
                let getStyle = (obj, attr) => obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
                for (let attr in json) {
                    iCur[attr] = 0;
                    iCur[attr] = attr == 'opacity' ? Math.round(getStyle(obj, attr) * 100) : parseInt(getStyle(obj, attr));
                }
                let startTime = Date.now();
                clearInterval(obj.timer);
                obj.timer = setInterval(() => {
                    let changeTime = Date.now();
                    let t = times - Math.max(0, startTime - changeTime + times);
                    /*0到2000*/
                    for (let attr in json) {
                        let value = TWEEN[fx](t, iCur[attr], json[attr] - iCur[attr], times);
                        if (attr == 'opacity') {
                            obj.style.opacity = value / 100;
                            obj.style.filter = `alpha(opacity=${value})`;
                        } else {
                            obj.style[attr] = `${value}px`;
                        }
                    }
                    if (t == times) {
                        clearInterval(obj.timer);
                        if (fn) {
                            fn.call(obj);
                        }
                    }
                }, 13);
            }
            //初始化
        init() {
                this.setCssStyle();
                this.settings.auto == 1 && this.autoPlay();
                this.eventType();
                this.nextClick();
            }
            //渲染js动态生成dom节点
        renderdDomTree() {
                //有几张图片就生成几个li
                let liSlider = '';
                let liFlag = '';
                this.settings.img.forEach((item, index) => {
                    liSlider += `<li><a href=${item.href}><img src=${item.imgsrc}></a></li>`;
                    liFlag += `<li></li>`;
                });
                let domStr = `<ul>${liSlider}</ul><ul>${liFlag}</ul><span></span><span></span>`;
                this.sliderWrap.innerHTML = domStr;
            }
            //获取dom节点和设置数据
        getData() {
            this.renderdDomTree();
            this.sliderContent = this.sliderWrap.querySelectorAll('ul')[0];
            this.sliderFlag = this.sliderWrap.querySelectorAll('ul')[1];
            this.sliderSpan = this.sliderWrap.querySelectorAll('span');
            this.iWidth = this.sliderWrap.offsetWidth;
            this.iHeight = this.sliderWrap.offsetHeight;
            this.length = this.sliderContent.querySelectorAll('li').length;
            this.iconCss = `
                cursor:pointer;
                background-color:#3E3E3E;
                width:18px;
                line-height:18px;
                font-size:14px;
                text-align:center;
                border-radius:50%;
                float:left;
                margin:0 5px;
                color:#fff;`;
        }
        setCssStyle() {
                this.getData();
                let sliderLi = this.sliderContent.querySelectorAll('li');
                let iconLi = this.sliderFlag.querySelectorAll('li');
                //设置轮播图容器的样式
                this.sliderWrap.style.cssText = `
                position: relative;
                overflow:hidden;`;
                //设置ul的css样式
                this.sliderContent.style.cssText = `
                width:${this.iWidth * this.length}px;
                height:${this.iHeight}px;
                overflow:hidden;
                position:relative;
                top:0;
                left:0;
                margin:0;
                padding:0;`;
                //设置li的样式
                let slider = Array.from(sliderLi);
                slider.forEach((item, index) => {
                    item.style.cssText = `
                width:${this.iWidth}px;
                height:${this.iHeight}px;
                float:left;
                list-style: none;
                position:relative;
                margin:0;
                padding:0;`;
                });
                //设置图片自适应的样式
                this.setImgStyle();
                //设置轮播图ICON焦点样式
                this.sliderFlag.style.cssText = `
                padding:0;
                margin:0;
                list-style: none;
                position: absolute;
                bottom: 3%;
                left: 50%;
                margin-left: -50px;`;
                let icon = Array.from(iconLi);
                icon.forEach((item, index) => {
                    item.innerHTML = index + 1;
                    item.style.cssText = this.iconCss;
                });
                //设置悬浮点击到下一个上一个的样式
                let cssCommon = `
                position:absolute;
                top:50%;
                margin-top:-30px;
                width:30px;
                line-height:60px;
                text-align:center;
                background:rgba(0,0,0,0.5);
                font-size:30px;
                font-weight:bold;
                color:#fff;
                cursor:pointer;
                display:none;`;
                this.sliderSpan[0].innerHTML = `<`;
                this.sliderSpan[0].style.cssText = `${cssCommon}left:1%;`;
                this.sliderSpan[1].innerHTML = `>`;
                this.sliderSpan[1].style.cssText = `${cssCommon}right:1%;`;
                //设置第一个轮播图ICON焦点样式
                this.sliderFlag.children[0].style.cssText = `${this.iconCss}background-color:${ICON_FOCUS};`;
            }
            //设置图片的分辨率
        setImgStyle() {
                let oImg = this.sliderContent.querySelectorAll('img');
                let oImgArr = Array.from(oImg);
                let imgLoaded = (item) => {
                    item.style.display = 'block';
                    let Iwidth = item.width;
                    let Iheight = item.height;
                    let rate = Iwidth / Iheight;
                    if (Iwidth >= this.iWidth || Iheight >= this.iHeight) { //如果图片原始尺寸超过容器的大小
                        if (item.width / item.height > this.iWidth / this.iHeight) {
                            item.style.width = `${this.iWidth}px`;
                            item.style.height = `${this.iWidth * (item.height / item.width)}px`;
                        } else {
                            item.style.width = `${this.iHeight * (item.width / item.height)}px`;
                            item.style.height = `${this.iHeight}px`;
                        }
                    } else { //如果图片原始尺寸没有超过容器的大小
                        item.style.width = `${Iwidth}px`;
                        item.style.height = `${Iheight}px`;
                    }
                };
                //循坏数组,设置图片样式,等比例缩放
                oImgArr.forEach((item, index) => {
                    ! function(img, callBack) {
                        let timer = setInterval(() => {
                            if (img.complete) {
                                callBack && callBack(item);
                                clearInterval(timer);
                            } else {
                                item.style.display = 'none';
                            }
                        }, 50)
                    }(item, imgLoaded);
                    //让图片上下垂直居中
                    item.style.cssText = `
                        position:absolute;
                        top:0;
                        left:0;
                        bottom:0;
                        right:0;
                        margin:auto;`;
                });
            }
            //轮播图自动播放
        autoPlay() {
                this.autotimer = setInterval(() => {
                    if (this.settings.auto == 0) {
                        return;
                    }
                    this.index++;
                    this.index = this.index === this.length ? 0 : this.index;
                    Slider.doMove(this.sliderContent, {
                        left: -this.index * this.iWidth
                    }, 400, this.settings.effect);
                    //设置轮播图ICON焦点
                    Array.from(this.sliderFlag.children).forEach((ele, index) => {
                        ele.style.cssText = this.iconCss;
                    });
                    this.sliderFlag.children[this.index].style.cssText += `background-color:${ICON_FOCUS};`;
                }, this.settings.interval);
            }
            //点击切换下一张
        nextClick() {
                let sliderSpan = Array.from(this.sliderSpan); //把类数组转换成数组
                this.sliderWrap.onmouseover = () => {
                    this.settings.auto = 0; //定时器停止
                    sliderSpan.forEach((item, index) => {
                        item.style.cssText = item.style.cssText + 'display:block;';
                        item.onclick = () => {
                            index === 0 ? (this.index = this.index === 0 ? this.length - 1 : --this.index) :
                                //上一张
                                (this.index = this.index === this.length - 1 ? 0 : ++this.index)
                                //下一张
                            Array.from(this.sliderFlag.children).forEach((ele, index) => { //设置轮播图ICON焦点
                                ele.style.cssText = this.iconCss;
                            });
                            this.sliderFlag.children[this.index].style.cssText += `background-color:${ICON_FOCUS};`;
                            Slider.doMove(this.sliderContent, {
                                left: -this.index * this.iWidth
                            }, 400, this.settings.effect);
                        }
                    });
                }
                this.sliderWrap.onmouseout = () => {
                    this.settings.auto = 1;
                    sliderSpan.forEach((item, index) => {
                        item.style.cssText += `display:none;`;
                    });
                }
            }
            //点击还是悬浮切换轮播图
        eventType() {
            let oLi = this.sliderFlag.querySelectorAll('li');
            for (let i = 0; i < this.length; i++) {
                oLi[i][this.settings.eType] = (e) => {
                    let ev = e || window.event;
                    ev.stopPropagation ? ev.stopPropagation() : event.cancelBubble = true;
                    this.settings.auto = 0;
                    this.index = i;
                    //设置轮播图ICON焦点
                    Array.from(this.sliderFlag.children).forEach((ele, index) => {
                        ele.style.cssText = this.iconCss;
                    });
                    this.sliderFlag.children[this.index].style.cssText += `background-color:${ICON_FOCUS};`;
                    Slider.doMove(this.sliderContent, {
                        left: -i * this.iWidth
                    }, 400, this.settings.effect);
                }
                if (this.settings.eType === 'onmouseover') {
                    this.sliderFlag[this.settings.eType] = (e) => {
                        let ev = e || window.event;
                        ev.stopPropagation ? ev.stopPropagation() : event.cancelBubble = true;
                    }
                    oLi[i].onmouseout = () => {
                        this.index = i;
                        this.settings.auto = 1;
                    }
                }
            }
        }
    }
    window.Slider = Slider;
}(window);
