cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    },

    start () {

    },

    init (manager) {
        this.Manager = manager;
        this.node.getComponent(cc.Graphics).fillColor = cc.Color.WHITE;
        this.node.getComponent(cc.Graphics).fillRect(-60, -50, 120, 100);
    },

    update (dt) {
        if (this.node.position.y < 0) this.destroy();
    },

    onBeginContact (contact, selfCollider, otherCollider) {
        if (this.Manager && selfCollider.node === this.Manager.CurrentBlock) {
            this.Manager.collideCallback(contact, selfCollider, otherCollider);
        }
    }
});
