cb.TutorialManager = cc.Class.extend({
    ctor: function() {},

    destroyHandTouch: function() {
        if (mainPanel && this.tutorialLayer) {
            var tutorialLayer = mainPanel.getChildByTag(52046);
            if (tutorialLayer) {
                mainPanel.removeChild(tutorialLayer);
            }
            this.tutorialLayer = null;
        }
    },

    showHandTouch: function(position, callback) {
        if (!mainPanel)
            return;

        var tutorialLayer = new cb.TutorialLayer();
        tutorialLayer.setPanelData(position, callback);
        mainPanel.addChild(tutorialLayer);
        this.tutorialLayer = tutorialLayer;
    },

    playTutorialSound: function() {
        soundManager.playEffectSound("sound/ui/hand_touch_tips.mp3");
    },

    keepUpTutorial: function(data) {
        if (!this.mainTask) {
            return;
        }
        var kindId = this.mainTask.kindId;
        var mainTask = this.mainTask;
        this.mainTask = null;
        //通知村长
        if (kindId === 3) {
            var position = cc.p(90, cc.winSize.height - 90);
            var self = this;
            this.playTutorialSound();
            this.showHandTouch(position, function() {
                mainPanel.hideControlPanel();

                var position = cc.p(198, 40);
                self.showHandTouch(position, function() {
                    var player = app.getCurPlayer();
                    layerManager.openPanel(cb.kMBagPanelId, player);

                    var position = cc.p(cc.winSize.width / 2 + 70, cc.winSize.height / 2 + 160);
                    self.showHandTouch(position, function() {
                        var bagItems = [];
                        var tmpItems = bagManager.bagItems;
                        for (var key in tmpItems) {
                            bagItems.push(tmpItems[key]);
                        }
                        if (bagItems.length === 0) {
                            var position = cc.p(cc.winSize.width - 40, cc.winSize.height - 60);
                            self.showHandTouch(position, function() {
                                layerManager.clearPanel();
                                var position = cc.p(130, cc.winSize.height - 235);
                                self.showHandTouch(position, function() {
                                    // taskManager.doTask();
                                    // layerManager.openPanel(cb.kMTaskPanelId,self.mainTask);
                                    mainTask.openPanel();
                                });
                            });
                            return;
                        }
                        var itemDetailLayer = new cb.ItemDetailLayer(bagItems[0])
                        itemDetailLayer.setBagPosition(true);

                        var position = cc.p(cc.winSize.width / 2 + 150, cc.winSize.height / 2 - 180);
                        self.showHandTouch(position, function() {
                            itemDetailLayer.operateCmd(10002);

                            var position = cc.p(cc.winSize.width - 40, cc.winSize.height - 60);
                            self.showHandTouch(position, function() {
                                layerManager.clearPanel();
                                var position = cc.p(130, cc.winSize.height - 235);
                                self.showHandTouch(position, function() {
                                    // taskManager.doTask();
                                    // layerManager.openPanel(cb.kMTaskPanelId,self.mainTask);
                                    mainTask.openPanel();
                                });
                            });

                        });
                    });
                });
            });
            //对话村长
        } else if (kindId === 4) {
            var equipment = data;
            
            var self = this;
            layerManager.openPanel(cb.kMNewEquipmentPanelId, equipment);
            if (layerManager.isRunPanel(cb.kMNewEquipmentPanelId)) {
                var curPanel = layerManager.curPanel;
                curPanel.setSingleBtn();

                var position = cc.p(cc.winSize.width / 2 + 20, cc.winSize.height / 2 - 100);
                this.showHandTouch(position, function() {
                    curPanel.equipEquipment();

                    layerManager.clearPanel();
                    self.playTutorialSound();
                    var position = cc.p(130, cc.winSize.height - 235);
                    self.showHandTouch(position, function() {
                        mainTask.openPanel();
                    });
                });
            }
            //请教老头
        } else if (kindId === 9) {
            this.playTutorialSound();
            var self = this;
            var position = cc.p(230, cc.winSize.height - 90);
            this.showHandTouch(position, function() {

                mainPanel.setHpMpVisible();
                var position = cc.p(495, cc.winSize.height - 215);
                self.showHandTouch(position, function() {

                    layerManager.openPanel(cb.kMMakeDrugPanelId);
                    if (layerManager.isRunPanel(cb.kMMakeDrugPanelId)) {
                        var curPanel = layerManager.curPanel;
                        var position = cc.p(cc.winSize.width / 2 - 40, cc.winSize.height / 2 + 90);
                        self.showHandTouch(position, function() {

                            curPanel.setTutorial();
                            var position = cc.p(cc.winSize.width / 2 + 185, cc.winSize.height / 2 - 190);
                            self.showHandTouch(position, function() {

                                curPanel.makeDrug();
                                var position = cc.p(cc.winSize.width - 40, cc.winSize.height - 60);
                                self.showHandTouch(position, function() {

                                    layerManager.clearPanel();
                                    mainPanel.setHpMpVisible();
                                    self.playTutorialSound();
                                    var position = cc.p(130, cc.winSize.height - 235);
                                    self.showHandTouch(position, function() {

                                        mainTask.openPanel();
                                    });
                                });
                            });
                        });
                    }
                });
            });
            //驱赶山狼
        } else if (kindId === 15) {
            var position = cc.p(90, cc.winSize.height - 90);
            var self = this;
            this.playTutorialSound();
            this.showHandTouch(position, function() {
                mainPanel.hideControlPanel();
                var position = cc.p(300, 40);
                self.showHandTouch(position, function() {

                    var player = app.getCurPlayer();
                    layerManager.openPanel(cb.kMSkillPanelId, player);

                    if (layerManager.isRunPanel(cb.kMSkillPanelId)) {
                        var curPanel = layerManager.curPanel;

                        var position = cc.p(cc.winSize.width / 2 - 270, cc.winSize.height / 2 + 130);
                        self.showHandTouch(position, function() {

                            curPanel.setTutorial(1);
                            var position = cc.p(cc.winSize.width / 2 + 170, cc.winSize.height / 2 - 240);
                            self.showHandTouch(position, function() {

                                curPanel.setTutorial(2);
                                var position = cc.p(cc.winSize.width / 2 + 320, cc.winSize.height / 2 + 140);
                                self.showHandTouch(position, function() {

                                    curPanel.setTutorial(3);
                                    var position = cc.p(cc.winSize.width - 40, cc.winSize.height - 60);
                                    self.showHandTouch(position, function() {
                                        layerManager.clearPanel();
                                        self.playTutorialSound();
                                        var position = cc.p(130, cc.winSize.height - 235);
                                        self.showHandTouch(position, function() {

                                            mainTask.openPanel();
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            });
            //学成归来
        } else if (kindId === 18) {
            var position = cc.p(90, cc.winSize.height - 90);
            var self = this;
            this.playTutorialSound();
            this.showHandTouch(position, function() {
                mainPanel.hideControlPanel();
                var position = cc.p(400, 40);
                self.showHandTouch(position, function() {

                    var player = app.getCurPlayer();
                    layerManager.openPanel(cb.kMBuildPanelId, player);

                    if (layerManager.isRunPanel(cb.kMBuildPanelId)) {
                        var curPanel = layerManager.curPanel;
                        var position = cc.p(cc.winSize.width / 2 - 315, cc.winSize.height / 2 + 135);
                        self.showHandTouch(position, function() {

                            curPanel.setTutorial(1);
                            var position = cc.p(cc.winSize.width / 2 + 90, cc.winSize.height / 2 - 150);
                            self.showHandTouch(position, function() {

                                curPanel.setTutorial(2);
                                var position = cc.p(cc.winSize.width / 2 + 355, cc.winSize.height / 2 - 240);
                                self.showHandTouch(position, function() {

                                    curPanel.setTutorial(3);
                                    var position = cc.p(cc.winSize.width - 40, cc.winSize.height - 60);
                                    self.showHandTouch(position, function() {
                                        layerManager.clearPanel();
                                        self.playTutorialSound();
                                        var position = cc.p(130, cc.winSize.height - 235);
                                        self.showHandTouch(position, function() {

                                            mainTask.openPanel();
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            });
        }
    },

    runTutorial: function(mainTask) {
        if(app.getCurArea().areaKind>AreaKinds.NORMAL_AREA){
            return;
        }

        var kindId = mainTask.kindId;
        // cc.log("ERROR:runTutorial====>> kindId="+kindId);
        if (this.lastKindId!==kindId) {
            this.isShowTutorial=false;
        }
        if (this.isShowTutorial)  return;
        this.isShowTutorial=true;

        this.lastKindId=kindId;

        this.mainTask = null;
        //回家吃饭
        if (kindId === 1) {
            mainPanel.setInvisibleItem(cb.kMBagPanelId);
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);


            require('src/scene/PreludeScene.js');
            var preludeScene = new cb.PreludeScene();
            cc.director.pushScene(preludeScene);
            preludeScene.addEventListener(function() {
                mainTask.openPanel();
            });

            //采摘草莓
        } else if (kindId === 2) {
            mainPanel.setInvisibleItem(cb.kMBagPanelId);
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);


            var position = cc.p(130, cc.winSize.height - 235);
            var self = this;
            taskManager.setCurTask(mainTask);
            this.playTutorialSound();
            this.showHandTouch(position, function() {
                if (mainTask.taskState === TaskState.NOT_START) {
                    mainTask.openPanel();
                } else {
                    taskManager.doTask();
                }
            });

            //通知村长
        } else if (kindId === 3) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);


            layerManager.openPanel(cb.kMNewFunctionPanelId, cb.kMBagPanelId);
            taskManager.setCurTask(mainTask);
            this.mainTask = mainTask;

            //对话村长
        } else if (kindId === 4) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);


            var position = cc.p(130, cc.winSize.height - 235);
            var self = this;
            taskManager.setCurTask(mainTask);
            this.playTutorialSound();
            this.showHandTouch(position, function() {
                if (mainTask.taskState === TaskState.NOT_START) {
                    mainTask.openPanel();
                } else {
                    taskManager.doTask();
                }
            });

            // taskManager.setCurTask(mainTask);
            this.mainTask = mainTask;
            //召集人马
        } else if (kindId === 5) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);

            //教训野猪
        } else if (kindId === 6) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);


            taskManager.setCurTask(mainTask);
            mainTask.openPanel();

            //禀告村长
        } else if (kindId === 7) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);


            taskManager.setCurTask(mainTask);
            mainTask.openPanel();

            //小月敷药
        } else if (kindId === 8) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);


            taskManager.setCurTask(mainTask);
            mainTask.openPanel();
            this.mainTask = mainTask;

            //请教老头
        } else if (kindId === 9) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);


            taskManager.setCurTask(mainTask);
            this.mainTask = mainTask;
            if (app.areaId === 1001) {
                this.keepUpTutorial();
            }

        //怒战蜘蛛
        } else if (kindId === 10) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);

            taskManager.setCurTask(mainTask);
            mainTask.openPanel();

            //重伤返回
        } else if (kindId === 11) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);


            taskManager.setCurTask(mainTask);
            mainTask.openPanel();

            //告别玫妹
        } else if (kindId === 12) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);

            taskManager.setCurTask(mainTask);
            mainTask.openPanel();

            //拜师师祖
        } else if (kindId === 13) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);

            taskManager.setCurTask(mainTask);
            mainTask.openPanel();

            //学习武技
        } else if (kindId === 14) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);

            taskManager.setCurTask(mainTask);
            mainTask.openPanel();

            //调查山狼
        } else if (kindId === 15) {
            mainPanel.setInvisibleItem(cb.kMSkillPanelId);
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);


            taskManager.setCurTask(mainTask);
            this.mainTask = mainTask;
            layerManager.openPanel(cb.kMNewFunctionPanelId, cb.kMSkillPanelId);

            //驱赶山狼
        } else if (kindId === 16) {
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);

            taskManager.setCurTask(mainTask);
            mainTask.openPanel();
        
            //星夜返回
        } else if (kindId === 17) {
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);

            taskManager.setCurTask(mainTask);
            mainTask.openPanel();
            
            //学成出师
        } else if (kindId === 18) {
            mainPanel.setInvisibleItem(cb.kMBuildPanelId);
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);

            taskManager.setCurTask(mainTask);
            this.mainTask = mainTask;
            layerManager.openPanel(cb.kMNewFunctionPanelId, cb.kMBuildPanelId);

            //大战八戒
        } else if (kindId === 19) {
            mainPanel.setInvisibleItem(cb.kMGuildPanelId, true);
            layerManager.openPanel(cb.kMNewFunctionPanelId, cb.kMGuildPanelId);

            //审问八戒
        } else if (kindId === 20) {
            taskManager.setCurTask(mainTask);
            // mainTask.openPanel();
        }
    }
});


var tutorialManager = new cb.TutorialManager();

cb.TutorialLayer = cc.Layer.extend({
    ctor: function() {
        this._super();

        this._width = 150;
        this._height = 150;
        this.initView();
        this.openBgTouch();
    },

    initView: function() {
        var container = this;

        var touchSprite = new cc.Sprite("update/gesture_touch.png");
        container.addChild(touchSprite);
        var handSprite = new cc.Sprite("update/gesture_hand.png");
        container.addChild(handSprite);
        touchSprite.setPosition(-20, 20);

        var interval = 0.2;
        var interval2 = 0.4;
        var sequence = cc.Sequence.create(cc.MoveTo.create(interval, cc.p(0, 0)), cc.MoveTo.create(interval2, cc.p(15, -15)));
        handSprite.runAction(cc.RepeatForever.create(sequence));

        sequence = cc.Sequence.create(
            cc.ScaleTo.create(interval, 0.01),
            cc.ScaleTo.create(interval2, 1.1),
            cc.ScaleTo.create(0, 0.01)
        );
        touchSprite.runAction(cc.RepeatForever.create(sequence));
        container.setLocalZOrder(250);
        // mainPanel.addChild(container);
        container.setTag(52046);
    },

    setPanelData: function(position, callback) {
        this.callback = callback;
        this.setPosition(position);
    },

    openBgTouch: function() {
        var onTouchBegan = function(touch, event) {
            return true;
        };
        var self = this;
        var onTouchEnded = function(touch, event) {
            var location = self.convertTouchToNodeSpace(touch);
            if (location.x > -self._width / 2 && location.x < self._width / 2 && location.y > -self._height / 2 && location.y < self._height / 2) {
                tutorialManager.destroyHandTouch();
                if (self.callback) {
                    self.callback();
                }
                soundManager.playEffectSound("sound/ui/button_touch.mp3");
            }
            // else{
            //     tutorialManager.destroyHandTouch();
            // }

        };
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: onTouchBegan,
            onTouchEnded: onTouchEnded
        }, this);
    }

});