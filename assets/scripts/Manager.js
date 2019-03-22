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
        BlockPrefab: cc.Prefab, // 方块预制体
        DynamicLayer: cc.Node, // 相对于镜头的动态层，用来挂载方块
        AnimatorNode: cc.Node, // 动画工具类js的挂载节点
        Stick: cc.Node, // 顶上的棍子
        StaticLayer: cc.Node, // 相对于镜头的静态层
        Ground: cc.Node, // 地面
        allBlocks: [], // 所有方块的数组
        LooseBlockNum: 6, // 上层非静态方块数
        Height: 0, // 高度计数器
        Timestamp: 0, // 时间计数器
        Score: cc.Node, // 分数Label的Node
        MainCamera: cc.Node // 主摄像头
    },

    onLoad () {
        // 开启物理特性和调试绘制
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        cc.director.getCollisionManager().enabledDrawBoundingBox = true
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().debugDrawFlags = 
            cc.PhysicsManager.DrawBits.e_aabbBit |
            cc.PhysicsManager.DrawBits.e_pairBit |
            cc.PhysicsManager.DrawBits.e_centerOfMassBit |
            cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit;
        cc.director.getPhysicsManager().gravity = cc.v2(0, -1280);
        // 获取动画工具类脚本
        this.Animator = this.AnimatorNode.getComponent('Animator');
    },

    start () {
        // 后面用到的Block:
        // PrevBlock: 上一个成功建造的方块
        // ActivatedBlock: 悬挂在Stick上的方块
        // CurrentBlock: 当前正在下落的方块
        this.newBlock();
    },
    /**
     * 释放方块操作
     */
    clearActivatedBlock() {
        // 如果不存在悬挂方块则不处理
        if (!this.ActivatedBlock) return;
        // 解除Stick和悬挂方块的连接
        this.Stick.getComponent(cc.RevoluteJoint).enabled = false;
        // 清除悬挂方块的x轴速度和角速度、旋转角度
        this.ActivatedBlock.getComponent(cc.RigidBody).linearVelocity = new cc.v2();
        this.ActivatedBlock.rotation = 0;
        this.ActivatedBlock.getComponent(cc.RigidBody).angularVelocity = 0;
        // 设置当前下落方块为释放的方块
        this.CurrentBlock = this.ActivatedBlock;
        // 清除悬挂方块
        this.ActivatedBlock = null;
    },
    /**
     * 生成新方块
     */
    newBlock() {
        // 如果已存在悬挂方块则不处理
        if (this.ActivatedBlock) return;
        let newBlock = cc.instantiate(this.BlockPrefab);

        // 设置悬挂位置
        newBlock.position = this.Stick.convertToWorldSpace(new cc.v2(0, -550));
        newBlock.rotation = this.Stick.rotation;
        // 初始化方块
        let script = newBlock.getComponent('BlockGraphics');
        script.init(this);
        // 设置悬挂方块为新方块
        this.ActivatedBlock = newBlock;
        // 添加进节点
        this.DynamicLayer.addChild(newBlock);
        // 设置Stick和新方块的连接
        this.Stick.getComponent(cc.RevoluteJoint).connectedBody = newBlock.getComponent(cc.RigidBody);
        this.Stick.getComponent(cc.RevoluteJoint).enabled = true;
    },
    /**
     * 碰撞回调
     * @param {*} contact 
     * @param {*} selfCollider 
     * @param {*} otherCollider 
     */
    collideCallback(contact, selfCollider, otherCollider) {
        // 如果碰撞主体不是当前正在下落的方块则忽略
        if (selfCollider.node !== this.CurrentBlock) return;
        // 处理第一个方块与地面的连接
        if (this.allBlocks.length === 0) {
            let b0 = this.Ground;
            let b1 = selfCollider.node;
            b1.getComponent(cc.RevoluteJoint).connectedAnchor = new cc.v2(b1.position.x, 100);
            b1.getComponent(cc.RevoluteJoint).connectedBody = b0.getComponent(cc.RigidBody);
            b1.getComponent(cc.RevoluteJoint).enabled = true;
            b1.getComponent(cc.RevoluteJoint).apply();
            this.allBlocks.push(this.CurrentBlock);
            
            this.PrevBlock = this.CurrentBlock;
            this.CurrentBlock = null;
        } else if (otherCollider.node === this.PrevBlock) {
            // 下落方块与上次成功的方块碰撞
            let offset = Math.abs(selfCollider.node.position.x - this.PrevBlock.position.x);
            // 判断碰撞位置x轴偏移
            if (offset < 92) {
                // 连接方块
                let b0 = otherCollider.node;
                let b1 = selfCollider.node;
                let wp = b1.convertToWorldSpace(new cc.v2(0, -70));
                let pp = b0.convertToNodeSpace(wp);
                b1.getComponent(cc.RevoluteJoint).connectedAnchor = new cc.v2(pp.x, 70);
                b1.getComponent(cc.RevoluteJoint).connectedBody = b0.getComponent(cc.RigidBody);
                b1.getComponent(cc.RevoluteJoint).enabled = true;
                b1.getComponent(cc.RevoluteJoint).apply();

                // success
                this.Height++;
                this.allBlocks.push(this.CurrentBlock);

                // 如果当前方块数量大于阈值，则设置摇摆方块和静态方块
                if (this.Height > this.LooseBlockNum) {
                    this.scheduleOnce(() => {
                        this.rotBlock = this.allBlocks[this.allBlocks.length - this.LooseBlockNum - 1];
                        this.rotBlock.getComponent(cc.RigidBody).type = 0;
                    }, 0);
                }

                // Combo
                // if (offset < 20) {
                //     let x = this.PrevBlock.position.x;
                //     this.scheduleOnce(() => {
                //         selfCollider.node.position = new cc.v2(x, selfCollider.node.position.y);
                //     }, 0);
                // }

                this.PrevBlock = this.CurrentBlock;
                this.CurrentBlock = null;
            }
        }
        this.newBlock();
        this.Score.getComponent(cc.Label).string = this.allBlocks.length;
    },
    update (dt) {
        this.Timestamp += dt;
        // 让悬挂方块的旋转方向与Stick同步
        if (this.ActivatedBlock) {
            this.ActivatedBlock.rotation = this.Stick.rotation;
        }
        // 设置底部旋转方块的旋转量
        if (this.rotBlock) {
            this.rotBlock.rotation = Math.sin(this.Timestamp * 2) * 60;// Math.min(this.Height / 2, 20);
        }
        // 如果当前下落方块落到屏幕下方，则生成新方块（扣血）
        if (this.CurrentBlock && this.CurrentBlock.position.y < this.StaticLayer.position.x) {
            this.newBlock();
        }
        // 移动摄像机到最顶上方块的位置
        if (this.allBlocks.length > 0) {
            this.Animator.animate(
                y => {
                    this.StaticLayer.position = new cc.v2(this.StaticLayer.position.x, y)
                    this.MainCamera.position = new cc.v2(this.StaticLayer.position.x + 360, y + 640)
                },
                this.StaticLayer.position.y,
                this.allBlocks[this.allBlocks.length - 1].position.y - 480,
                1, 
                [1, 1]
            );
        } else {
            this.Animator.animate(
                y => {
                    this.StaticLayer.position = new cc.v2(this.StaticLayer.position.x, y)
                    this.MainCamera.position = new cc.v2(this.StaticLayer.position.x + 360, y + 640)
                },
                this.StaticLayer.position.y,
                this.Ground.position.y - 480,
                1, 
                [1, 1]
            );
        }
        // 设置Stick的位置(RigidBody无法跟着父节点位移，所以独立设置)
        this.Stick.position = new cc.v2(this.Stick.position.x, this.StaticLayer.position.y + 1580);
    }
});
