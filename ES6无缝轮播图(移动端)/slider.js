 ! function(window) {
     const DEFAULT_OPTIONS = { //默认参数
         sliderWrap: '', //轮播图id
         auto: 1, //自动播放 1或0
         interval: 3000, //** 停顿时间
         imgurl: '' //图片地址
     };
     class Slider {
         constructor(el, json = {}) {
             this.sliderWrap = document.querySelector(el);
             this.index = 0;
             this.settings = Object.assign({}, DEFAULT_OPTIONS, json);
             this.init_data();
         }
         static set_position(obj, distance) { //更改轮播图位置
             obj.style.webkitTransform = `translate3d(${distance}px,0,0)`;
             obj.style.transform = `translate3d(${distance}px,0,0)`;
         }
         static set_focusIcon(obj, x) { //设置轮播图ICON焦点
             for (let i = 0, len = obj.children.length; i < len; i++) {
                 obj.children[i].className = '';
             }
             obj.children[x].className = 'active';
         }
         init_data() { //初始化数据
             document.addEventListener('touchstart', (ev) => ev.preventDefault()); //阻止默认事件
             this.get_element();
             this.settings.auto === 1 && this.auto_play();
             this.touch_event();
         }
         get_element() { //获取元素对象
             this.sliderContent = this.sliderWrap.querySelectorAll('ul')[0];
             this.sliderContent.innerHTML += this.sliderContent.innerHTML;
             this.sliderFlag = this.sliderWrap.querySelectorAll('ul')[1];
             this.iWidth = this.sliderWrap.offsetWidth;
             this.length = this.sliderContent.children.length;
             this.sliderContent.style.width = `${this.length}00%`;
             Array.from(this.sliderContent.children).forEach(
                 (element, index) => element.style.width = `${1 / this.length * 100}%`);
         }
         auto_play() { //自动播放
             clearInterval(this.autotimer);
             this.autotimer = setInterval(() => {
                 this.index++;
                 this.sliderContent.style.transition = ".5s";
                 Slider.set_position(this.sliderContent, -this.index * this.iWidth);
                 Slider.set_focusIcon(this.sliderFlag, this.index % (this.length / 2));
                 setTimeout(() => {
                     if (this.index === this.length - 1) {
                         this.sliderContent.style.transition = "none";
                         this.index = this.length / 2 - 1;
                         Slider.set_position(this.sliderContent, -this.index * this.iWidth);
                     }
                 }, 600);
             }, this.settings.interval);
         }
         touch_event() { //手指滑动轮播图
             let isMove = true;
             let isFirst = true;
             let touchStart, touchMove, touchEnd, iStartPageX, iStartPageY;
             touchStart = (e) => {
                 clearInterval(this.autotimer);
                 isMove = true;
                 isFirst = true;
                 iStartPageX = e.changedTouches[0].pageX;
                 iStartPageY = e.changedTouches[0].pageY;
             };
             touchMove = (e) => {
                 if (!isMove) {
                     return;
                 }
                 let iDisX = (e.changedTouches[0].pageX - iStartPageX);
                 let iDisY = (e.changedTouches[0].pageY - iStartPageY);
                 if (isFirst) {
                     isFirst = false;
                     //用户向下滑动就不会触发轮播图抖动
                     if (Math.abs(iDisY) > Math.abs(iDisX)) {
                         isMove = false;
                     }
                 }
                 if (isMove) {
                     this.sliderContent.style.transition = 'none';
                     (this.index === 0) && (this.index = this.length / 2);
                     (this.index === this.length - 1) && (this.index = this.length / 2 - 1);
                     Slider.set_position(this.sliderContent, -this.index * this.iWidth + iDisX);
                 }
             };
             touchEnd = (e) => {
                 let iDisX = e.changedTouches[0].pageX - iStartPageX;
                 this.sliderContent.style.transition = '.5s';
                 this.index = this.index - Math.round(iDisX / this.iWidth);
                 Slider.set_position(this.sliderContent, -this.index * this.iWidth);
                 Slider.set_focusIcon(this.sliderFlag, this.index % (this.length / 2));
                 this.auto_play();
             }
             this.sliderContent.addEventListener("touchstart", touchStart, false);
             this.sliderContent.addEventListener("touchmove", touchMove, false);
             this.sliderContent.addEventListener("touchend", touchEnd, false);
         }
     }
     window.Slider = Slider;
 }(window);
 new Slider('#sliderWrap');
