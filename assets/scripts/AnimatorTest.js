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
        Manager: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.node.getComponent(cc.Graphics).fillColor = cc.Color.WHITE;
        this.node.getComponent(cc.Graphics).fillRect(-60, -50, 120, 100);
        this.Animator = this.Manager.getComponent('Animator');
        window.test = this;
        console.log(this.node.position);
        this.Animator.animate(
            (r) => {
                this.node.position = new cc.v2(r, this.node.position.y);
            },
            this.node.position.x,
            this.node.position.x + 720,
            2,
            [1, 1]
        )
    },

    update (dt) {

    },
});
