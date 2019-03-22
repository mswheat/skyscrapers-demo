// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        Timestamp: 0,
        SwingRate: 2,
        MaxAngle: 30
    },

    onLoad () {
        this.Graphics = this.node.getComponent(cc.Graphics);
        this.Graphics.fillColor = cc.Color.WHITE;
        this.Graphics.fillRect(-5, 0, 10, -500);
    },

    start () {

    },

    update (dt) {
        this.Timestamp += dt;
        this.node.setRotation(Math.sin(this.Timestamp * this.SwingRate) * this.MaxAngle);
    },
});
