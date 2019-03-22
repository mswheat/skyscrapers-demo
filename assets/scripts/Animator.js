import { CubicBezier } from './lib/Bezier';

cc.Class({
  extends: cc.Component,

  properties: {
    ts: 0,
    animations: []
  },

  onLoad () {
      
  },

  start () {

  },

  update (dt) {
    this.ts += dt;
    let i = 0;
    while (i < this.animations.length) {
      let a = this.animations[i];
      if (this.ts > a.start + a.duration) {
        this.animations.splice(i, 1);
        continue;
      }
      try {
        let t = (this.ts - a.start) / a.duration;
        let r = a.easeFunc(...a.bezierPoints, t);
        // r = Math.max(0, Math.min(r, 1));
        a.callback((a.dest - a.src) * r + a.src);
      } catch(e) {
        console.error(e);
        this.animations.splice(i, 1);
        continue;
      }
      i++;
    }
  },

  /**
   * 动画接口
   * @param {*} callback 回调函数 x => {}
   * @param {*} src x起始数值
   * @param {*} dest x结束数值
   * @param {*} duration 时长
   * @param {*} bezierPoints 贝塞尔控制点（e.g. [1, 1]）
   */
  animate (callback, src, dest, duration, bezierPoints) {
    let easeFunc;
    if (!bezierPoints || !(bezierPoints instanceof Array) || bezierPoints.length !== 2) {
      console.error('Wrong bezierPoints lenth.');
      return;
    } else {
      easeFunc = CubicBezier;
    }
    if (easeFunc) {
      this.animations.push({
        callback, 
        src, 
        dest, 
        start: this.ts, 
        duration, 
        bezierPoints,
        easeFunc
      });
    }
  }

});
