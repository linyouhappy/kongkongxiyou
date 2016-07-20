cb.TaskLayer = cc.Class.extend({
    ctor: function(taskNode) {
        taskNode.setPosition(-cc.winSize.width / 2 + 10, cc.winSize.height / 2 - 145);

        var taskLayer = taskNode.getChildByName("taskLayer");
        var menuBtn = taskLayer.getChildByName("menuBtn");
        menuBtn.addTouchEventListener(this.touchEvent, this);

        var taskBtn = taskNode.getChildByName("taskBtn");
        taskBtn.addTouchEventListener(this.touchEvent, this);
        taskBtn.setVisible(false);

        this.taskLayer = taskLayer;
        this.taskBtn = taskBtn;
        this.taskNode=taskNode;

        var richLabelsLayer=cb.RichLabelsLayer.create(180,138);
        taskLayer.addChild(richLabelsLayer);
        richLabelsLayer.setPosition(10,-182);

        richLabelsLayer.enableEvent(true);
        richLabelsLayer.setLabelSpace(10);
        richLabelsLayer.setDivideLineColor(cc.color(198,168,0,150));
        this.richLabelsLayer=richLabelsLayer;

        var self=this;
        richLabelsLayer.addEventListener(function(richLabelId){
            var task=self.allTasks[richLabelId];
            if (task) {
                taskManager.setCurTask(task);
                if(task.isMainTask){
                    if (task.taskState===TaskState.NOT_START) {
                        layerManager.openPanel(cb.kMTaskPanelId,task);
                    }else{
                        taskManager.doTask();
                    }
                }else{
                    taskManager.doTask(); 
                }
            }
        });

        var isHideTaskPanel=taskManager.isHideTaskPanel;
        cc.log("isHideTaskPanel="+isHideTaskPanel);
        if (!isHideTaskPanel) {
            // this.showTaskLayer();

            this.taskLayer.setVisible(true);
            this.taskLayer.setPosition(0, 0);
            this.taskBtn.setVisible(false);
        }else{
            // this.hideTaskLayer();

            this.taskLayer.setPosition(-200, 0);
            this.taskLayer.setVisible(false);
            this.taskBtn.setVisible(true);
        }
    },


    setShowTaskData:function(index,task){
        // cc.log("setShowTaskData task="+JSON.stringify(task));

        var richLabelsLayer=this.richLabelsLayer;

        richLabelsLayer.setCurRichLabel(index);
        richLabelsLayer.clearCurRichLabel();

        var color4B;
        if (task.isMainTask) {
            color4B=cc.color(78,255,0,255);
        }else{
            color4B=cc.color(255,228,0,255);
        }
        richLabelsLayer.setDetailStyle("Arial",18, color4B);
        richLabelsLayer.appendRichText(task.taskBranchText, chat.kTextStyleNormal,1);

        color4B=cc.color(255,255,255,255);
        richLabelsLayer.setTextColor(color4B);
        richLabelsLayer.appendRichText(task.name, chat.kTextStyleNormal,2); 

        color4B=cc.color(255,0,0,255);
        richLabelsLayer.setTextColor(color4B);
        richLabelsLayer.appendRichText(task.stateText, chat.kTextStyleNormal,3); 
        richLabelsLayer.appendRichText("\n", chat.kTextStyleNormal,4);

        color4B=cc.color(255,255,0,255);
        richLabelsLayer.setTextColor(color4B);
        richLabelsLayer.appendRichText(task.actionText, chat.kTextStyleNormal,14);

        color4B=cc.color(0,255,0,255);
        richLabelsLayer.setTextColor(color4B);
        richLabelsLayer.appendRichText(task.targetText, chat.kTextStyleHerf,15);

        if (task.targetCountText) {
            color4B=cc.color(0,255,255,255);
            richLabelsLayer.setTextColor(color4B);
            richLabelsLayer.appendRichText(task.targetCountText, chat.kTextStyleNormal,16);
        }
    },

    // updateTaskData:function(updateTask){
    //     var task;
    //     for (var i = 0; i < this.allTasks.length; i++) {
    //         task=this.allTasks[i]
    //         if (task===updateTask) {
    //             this.setShowTaskData(i,task);
    //             // var richLabelsLayer=this.richLabelsLayer;
    //             // richLabelsLayer.setCurRichLabel(i);
    //             // this.richLabelsLayer.layoutCurRichLabel();
    //             break;
    //         }
    //     }
    // },

    updateTaskDatas:function(){
        var allTasks=taskManager.getAllTasks();
        if (allTasks.length===0) {
            return;
        }
        this.richLabelsLayer.clearAllRichLabels();
        var task;
        for (var i = 0; i < allTasks.length; i++) {
            task=allTasks[i]
            this.setShowTaskData(i,task);
        }
        this.allTasks=allTasks;
        this.richLabelsLayer.layoutRichLabels();
    },

    setDisplayTask: function(enable) {
        if (!taskManager.isHideTaskPanel) {
            if (enable) {
                this.taskLayer.setVisible(true);
                this.taskBtn.setVisible(false);
            } else {
                this.taskLayer.setVisible(false);
                this.taskBtn.setVisible(true);
            }
        }
    },

    showTaskLayer: function() {
        var sequence = cc.MoveTo.create(0.3, cc.p(0, 0));
        this.taskLayer.setVisible(true);
        this.taskLayer.runAction(sequence);
        this.taskBtn.setVisible(false);

        taskManager.isHideTaskPanel=false;
    },

    hideTaskLayer: function() {
        var sequence = cc.Sequence.create(
            cc.MoveTo.create(0.3, cc.p(-200, 0)),
            cc.Hide.create()
        );
        this.taskLayer.runAction(sequence);
        var sequence = cc.Sequence.create(
            cc.DelayTime.create(0.3),
            cc.Show.create()
        );
        this.taskBtn.runAction(sequence);

        taskManager.isHideTaskPanel=true;
    },

    touchEvent: function(sender, type) {
        if (type === ccui.Widget.TOUCH_ENDED) {
            if (sender.getName() === "menuBtn") {
                this.openPlayerMenuLayer();
            } else if (sender.getName() === "taskBtn") {
                this.showTaskLayer();
            }
        }
    },

    closePlayerMenuLayer:function(){
        if (!!this.playerMenuLayer) {
            this.taskNode.removeChild(this.playerMenuLayer.ccsNode);
            this.playerMenuLayer = null;
        }
    },

    openPlayerMenuLayer: function() {
        if (!this.playerMenuLayer) {
            this.playerMenuLayer = new cb.PlayerMenuLayer(this);
        } else {
            this.taskNode.removeChild(this.playerMenuLayer.ccsNode);
            this.playerMenuLayer = null;
        }
    }

});


cb.PlayerMenuLayer = cc.Class.extend({
    ctor: function(taskLayer) {
        var ccsNode = ccs.CSLoader.createNode("uiccs/PlayerMenuLayer.csb");
        taskLayer.taskNode.addChild(ccsNode);
        ccsNode.setPosition(200, 0);
        this.ccsNode = ccsNode;

        this.taskLayer = taskLayer;

        // this.timeOutId=setTimeout(function() {
        //     taskLayer.closePlayerMenuLayer();
        //  },5000);

        var itemBtn = null;
        for (var i = 101; i <= 105; i++) {
            itemBtn = ccsNode.getChildByTag(i);
            if (i === 102) {
                var curPlayer = app.getCurPlayer();
                if (curPlayer.teamId) {
                    this.isHaveTeam=true;
                    itemBtn.setTitleText("组队菜单");
                }
            }
            if (itemBtn) {
                itemBtn.addTouchEventListener(this.touchEvent, this);
            }
        }
    },

    touchEvent: function(sender, type) {
        if (type === ccui.Widget.TOUCH_ENDED) {
            switch (sender.getTag()) {
                //隐藏任务
                case 101:
                    this.taskLayer.hideTaskLayer();
                    break;
                    //创建队伍 or 组队菜单
                case 102:
                    if (this.isHaveTeam) {
                        var curPlayer = app.getCurPlayer();
                        layerManager.openPanel(cb.kMTeamPanelId,curPlayer);
                    }else{
                        teamHandler.createTeam();
                    }
                    break;
                case 103:
                    // teamHandler.leaveTeam();
                    break;
                case 104:
                    // teamHandler.leaveTeam();
                    break;
                case 105:
                    // layerManager.openPanel(cb.kMNewFunctionPanelId,cb.kMBagPanelId);
                    // teamHandler.leaveTeam();
                    break;
            }
            // clearInterval(this.timeOutId);
            this.taskLayer.closePlayerMenuLayer();
        }
    }

});