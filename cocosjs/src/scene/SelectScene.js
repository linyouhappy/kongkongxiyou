var SelectLayer = BaseSceneLayer.extend({
    _ccsNode: null,
    ctor: function() {
        this._super();
        this.createCCSNode("uiccs/SelectLayer.csb");

        this.roleSprites = [];
        var ccsNode = this._ccsNode;
        var role_portrait_01 = ccsNode.getChildByName("role_portrait_01");
        var role_portrait_02 = ccsNode.getChildByName("role_portrait_02");
        var containerLayer = ccsNode.getChildByName("containerLayer");

        var _frontUpSprite = containerLayer.getChildByName("_frontUpSprite");
        var _frontDownSprite = containerLayer.getChildByName("_frontDownSprite");
        var enterButton = _frontDownSprite.getChildByName("enterButton");
        enterButton.addTouchEventListener(this.touchEvent, this);
        enterButton.setSoundEffectFile("");
        // enterButton.setSoundEffectFile("sound/ui/game_start.mp3");

        var roleBtn = ccsNode.getChildByName("roleBtn");
        roleBtn.addTouchEventListener(this.touchEvent, this);
        // roleBtn.setSoundEffectFile("");

        var frontDownNode = containerLayer.getChildByName("frontDownNode");
        this.roleNameTextField = frontDownNode.getChildByName("roleNameTextField");

        var rondomBtn = frontDownNode.getChildByName("rondomBtn");
        rondomBtn.addTouchEventListener(this.touchEvent, this);
        rondomBtn.setPressedActionEnabled(true);

        var createBtn = frontDownNode.getChildByName("createBtn");
        createBtn.addTouchEventListener(this.touchEvent, this);

        var detailNode = ccsNode.getChildByName("detailNode");
        this.roleNameText = detailNode.getChildByName("roleNameText");
        this.maleText = detailNode.getChildByName("maleText");
        this.descText = detailNode.getChildByName("descText");
        this.levelText=detailNode.getChildByName("levelText");
        this.descText.setContentSize(cc.size(180, 120));

        role_portrait_01.setScale(0.5);

        _frontDownSprite.setVisible(false);
        frontDownNode.setVisible(false);
        _frontDownSprite.setPosition(0, -cc.winSize.height / 2 - 180);
        frontDownNode.setPosition(0, -cc.winSize.height / 2 - 180);

        this.roleSprites.push(role_portrait_01);
        this.roleSprites.push(role_portrait_02);

        role_portrait_01.setVisible(false);
        role_portrait_02.setVisible(false);
        role_portrait_01.setPosition(-400,0);
        role_portrait_02.setPosition(0,0);
        detailNode.setVisible(false);

        containerLayer.setLocalZOrder(100);
        detailNode.setLocalZOrder(100);

        this.enterButton = enterButton;
        this.role_portrait_01 = role_portrait_01;
        this.role_portrait_02 = role_portrait_02;
        this._frontUpSprite = _frontUpSprite;
        this._frontDownSprite = _frontDownSprite;
        this.frontDownNode = frontDownNode;
        this.detailNode = detailNode;

        var names = {};
        names.FamilyName = '李,王,张,刘,陈,杨,黄,孙,周,吴,徐,赵,朱,马,胡,郭,林,何,高,梁,郑,罗,宋,谢,唐,韩,曹,许,邓,萧,冯,曾,程,蔡,彭,潘,袁,于,董,余,苏,叶,吕,魏,蒋,田,杜,丁,沈,姜,范,江,傅,钟,卢,汪,戴,崔,任,陆,廖,姚,方,金,邱,夏,谭,韦,贾,邹,石,熊,孟,秦,阎,薛,侯,雷,白,龙,段,郝,孔,邵,史,毛,常,万,顾,赖,武,康,贺,严,尹,钱,施,牛,洪,龚,汤,陶,黎,温,莫,易,樊,乔,文,安,殷,颜,庄,章,鲁,倪,庞,邢,俞,翟,蓝,聂,齐,向,申,葛,柴,伍,覃,骆,关,焦,柳,欧,祝,纪,尚,毕,耿,芦,左,季,管,符,辛,苗,詹,曲,靳,祁,路,涂,兰,甘,裴,梅,童,翁,霍,游,阮,尤,岳,柯,牟,滕,谷,舒,卜,成,饶,宁,凌,盛,查,单,冉,鲍,华,包,屈,房,喻,解,蒲,卫,简,时,连,车,项,闵,邬,吉,党,阳,司,费,蒙,席,晏,隋,古,强,穆,姬,宫,景,米,麦,谈,柏,瞿,艾,沙,鄢,桂,窦,郁,缪,畅,巩,卓,褚,栾,戚,全,娄,甄,郎,池,丛,边,岑,农,苟,迟,保,商,臧,佘,卞,虞,刁,冷,应,匡,栗,仇,练,楚,揭,师,官,佟,封,燕,桑,巫,敖,原,植,邝,仲,荆,储,宗,楼,干,苑,寇,盖,南,屠,鞠,荣,井,乐,银,奚,明,麻,雍,花,闻,冼,木,郜,廉,衣,蔺,和,冀,占,公,门,帅,利,满,欧阳,太史,端木,上官,司马,东方,独孤,南宫,万俟,闻人,夏侯,诸葛,尉迟,公羊,赫连,澹台,皇甫,宗政,濮阳,公冶,太叔,申屠,公孙,慕容,仲孙,钟离,长孙,宇文,司徒,鲜于,司空,闾丘,子车,亓官,司寇,巫马,公西,壤驷,公良,漆雕,乐正,宰父,谷梁,拓跋,轩辕,令狐,段干,百里,呼延,东郭,南门,公户,公玉,公仪,梁丘,公仲,公上,公门,公山,公坚,左丘,公伯,西门,公祖,公乘,贯丘,公皙,南荣,东里,东宫,仲长,子书,子桑,即墨,达奚,褚师,吴铭,公输,昆吾,闾丘,南郭,千代,千乘,申徒,夙沙,完颜,陶丘,耶律,宗正,缁丘';
        names.BoyWord1 = '祚,尊,祖,昮,综,倧,宗,子,濯,琸,卓,壮,铸,助,主,宙,周,州,众,忠,中,智,致,峙,志,之,政,诤,正,晸,拯,征,震,镇,朕,振,稹,缜,真,喆,哲,彰,战,展,斋,曾,泽,则,宰,云,源,元,煜,裕,御,俣,宇,瑜,有,友,勇,永,瀛,鹰,毅,谊,奕,义,以,洋,彦,炎,岩,言,巡,学,选,玄,煊,宣,轩,绪,旭,虚,修,雄,行,星,兴,信,鑫,新,心,勰,瑎,啸,小,翔,祥,宪,舷,贤,先,僖,武,问,闻,文,魏,玮,炜,伟,维,仝,挺,霆,天,滕,腾,涛,弢,泰,旲,僳,宋,竦,松,嗣,俟,思,舜,顺,帅,树,叔,守,轼,势,示,仕,世,士,矢,实,时,石,盛,晟,胜,生,伸,社,绍,劭,善,山,砂,僧,森,飒,若,润,瑞,襦,孺,儒,榕,任,仞,仁,然,群,佺,全,庆,擎,清,钦,强,前,骞,谦,启,奇,浦,朴,濮,蒲,颇,平,乒,频,丕,澎,鹏,彭,朋,旁,攀,欧,弩,宁,楠,穆,慕,木,墨,铭,鸣,明,旻,民,冕,密,茂,昴,迈,马,轮,伦,仑,律,龙,霖,林,列,亮,梁,良,镰,利,吏,立,力,黎,磊,勒,乐,朗,澜,莱,阔,鲲,魁,馗,旷,劻,宽,铿,克,康,侃,勘,铠,凯,竣,珺,骏,峻,俊,钧,君,军,驹,敬,璥,璟,晋,进,金,杰,劼,鲛,骄,江,键,健,剑,建,坚,稼,驾,嘉,家,佳,骥,冀,济,辑,伋,会,辉,候,厚,宏,弘,恒,亨,河,和,合,灏,澔,淏,浩,昊,豪,航,瀚,翰,颔,悍,汗,汉,韩,寒,涵,函,海,国,贵,炅,晷,广,光,冠,固,功,弓,庚,暠,高,钢,刚,倝,澉,富,辅,俯,福,锋,琒,峰,封,风,飞,发,铎,碫,段,端,栋,东,殿,帝,德,儋,代,达,促,琮,骢,赐,创,船,川,矗,储,畴,仇,崈,崇,弛,蚩,铖,珹,诚,承,成,丞,晨,辰,琛,掣,晁,超,倡,玚,偿,琩,昌,产,禅,柴,侪,策,曹,操,舱,沧,仓,参,才,部,博,伯,波,斌,彬,宾,飚,飙,彪,昪,弼,辈,备,邶,豹,保,榜,邦,颁,昂,安';
        names.BoyWord2 = '皑,蔼,霭,安,鞍,岸,按,昂,盎,遨,翱,奥,白,百,佰,柏,班,颁,斑,邦,浜,榜,胞,炮,雹,宝,保,豹,瀑,曝,北,备,倍,焙,奔,本,必,荜,秘,筚,弼,裨,辟,扁,卞,汴,标,彪,骠,表,宾,彬,斌,滨,缤,槟,镔,兵,丙,秉,炳,并,波,玻,帛,泊,勃,铂,博,渤,箔,魄,檗,卜,步,埔,瓿,才,材,财,参,灿,藏,操,策,曾,差,察,昌,长,昶,畅,倡,绰,超,焯,晁,朝,潮,彻,郴,琛,澈,臣,辰,晨,承,盛,程,驰,池,炽,冲,重,崇,绸,畴,酬,筹,楚,处,川,传,创,棰,锤,淳,赐,聪,璁,丛,淙,琮,璀,村,存,锉,达,大,代,岱,玳,单,郸,石,当,铛,党,宕,导,岛,祷,道,得,德,地,灯,登,迪,狄,笛,柢,砥,递,谛,滇,巅,典,淀,雕,顶,鼎,东,栋,斗,督,顿,笃,度,端,缎,煅,锻,敦,铎,恩,发,法,帆,藩,凡,飞,斐,奋,丰,风,枫,峰,烽,锋,逢,福,阜,复,赋,富,盖,溉,概,甘,刚,岗,钢,罡,港,杠,高,诰,革,葛,铬,根,庚,耿,功,宫,恭,巩,贡,钩,构,故,顾,观,冠,莞,管,光,广,归,圭,贵,桂,国,过,海,含,函,涵,韩,寒,汉,翰,瀚,行,巷,蒿,号,毫,豪,貉,昊,浩,皓,灏,禾,合,和,河,赫,鹤,黑,亨,恒,横,衡,弘,宏,泓,洪,鸿,侯,厚,湖,虎,浒,琥,沪,淮,槐,还,环,洹,桓,寰,焕,皇,辉,晖,徽,炜,回,会,荟,惠,火,伙,豁,机,矶,奇,积,计,记,纪,技,系,季,际,继,绩,稷,加,家,嘉,甲,价,驾,架,稼,尖,坚,间,俭,检,简,见,饯,建,剑,健,漳,谏,践,镜,鉴,键,江,将,奖,强,交,佼,皎,觉,教,阶,节,杰,解,介,界,金,津,进,近,劲,晋,京,经,荆,景,敬,径,竞,竟,靖,镜,炯,赳,九,韭,京,居,驹,枸,举,巨,炬,镌,隽,决,诀,军,均,君,钧,俊,郡,峻,浚,骏,竣,开,凯,恺,慨,楷,勘,看,康,慷,科,恪,恳,铿,宽,矿,奎,逵,葵,魁,坤,昆,来,岚,览,榄,郎,朗,浪,烙,乐,雷,镭,磊,棱,冷,漓,黎,礼,里,俚,理,锂,力,历,立,利,沥,连,涟,联,炼,链,良,凉,梁,量,粮,两,亮,谅,晾,辽,廖,燎,列,烈,猎,林,临,淋,磷,嶙,麟,伶,灵,苓,陵,聆,棂,翎,岭,领,令,留,流,陆,龙,栊,胧,隆,弄,楼,嵝,镂,卢,钽,陆,录,鹿,碌,禄,路,吕,旅,律,率,峦,鸾,銮,纶,伦,认,仑,罗,逻,咯,络,马,蔓,幔,芒,茫,毛,卯,茂,貌,魅,蒙,檬,朦,猛,孟,米,觅,宓,秘,密,谧,绵,棉,冕,面,渺,邈,民,闵,名,明,鸣,茗,铭,模,膜,末,万,沫,陌,莫,墨,谋,南,纳,年,廿,念,宁,钮,农,浓,努,欧,偶,排,攀,盘,培,沛,朋,蓬,篷,霹,皮,铍,翩,平,朴,普,浦,谱,铺,瀑,曝,期,齐,其,祈,淇,骐,琪,琦,棋,旗,麒,杞,启,起,绮,汽,恰,千,阡,铅,谦,钱,虔,枪,乔,侨,桥,钦,亲,奏,芹,勤,庆,穹,求,球,逑,酋,曲,去,趣,戌,权,全,诠,泉,拳,缺,鹊,群,仁,壬,荏,忍,任,韧,荣,融,熔,儒,孺,睿,润,桑,森,杉,沙,砂,厦,山,尚,韶,少,邵,绍,哨,稍,社,申,伸,深,审,渗,升,生,声,笙,盛,师,诗,十,什,石,时,识,实,史,始,士,氏,世,示,仕,市,式,势,事,侍,试,视,适,轼,寿,绶,书,树,帅,水,顺,烁,朔,硕,司,松,嵩,颂,苏,酥,肃,穗,岁,梭,所,索,拓,台,太,肽,泰,坛,坦,堂,塘,棠,韬,淘,特,腾,藤,梯,体,天,添,田,铁,烃,亭,庭,霆,挺,通,同,潼,统,透,凸,涂,突,图,土,团,湾,汪,威,巍,韦,为,唯,帷,惟,围,传,必,纬,娓,卫,未,慰,蔚,温,文,稳,沃,夕,希,栖,息,惜,晰,溪,熹,习,席,喜,夏,仙,纤,贤,羡,乡,相,祥,享,翔,响,向,项,逍,萧,霄,孝,肖,笑,效,啸,协,榭,莘,鑫,新,信,兴,星,形,雄,熊,修,胥,虚,旭,炫,绚,学,勋,询,荀,洵,训,讯,迅,汛,逊,涯,延,严,闫,言,炎,研,铅,验,焰,焱,扬,阳,羊,炀,洋,仰,养,瑶,遥,耀,野,冶,业,烨,谒,一,乙,亿,义,艺,忆,议,屹,亦,易,驿,绎,弈,奕,羿,益,谊,逸,毅,因,印,荫,应,英,迎,雍,永,咏,勇,涌,用,优,攸,悠,游,友,有,酉,右,娱,渔,隅,宇,羽,语,育,昱,钰,渊,元,原,源,远,岳,阅,悦,越,粤,云,韫,蕴,栽,再,仔,载,趱,赞,藏,早,择,泽,增,综,赠,曾,斋,占,沾,詹,瞻,展,站,绽,章,彰,长,钊,招,如,朝,昭,兆,沼,照,罩,肇,遮,哲,辙,浙,针,侦,真,稹,臻,振,震,镇,征,峥,铮,正,诤,政,之,支,执,直,值,植,止,祉,至,志,制,治,质,挚,致,秩,智,中,忠,钟,衷,种,仲,众,重,舟,州,洲,轴,昼,铢,竹,竺,渚,瞩,注,柱,炷,祝,著,铸,专,庄,桩,壮,幢,锥,谆,准,桌,茁,卓,咨,资,滋,锱,子,宗,棕,总,奏,组,祖,钻,尊,樽,左,佐,作,轩,涛,然,楠,瑞,清';
        names.GirlWord1 = '宝,无,思,伦,夜,痴,依,香,萱,语,意,含,慕,春,若,依,心,雨,天,如,若,涵,亦,冬,安,芷,绮,飞,若,寒,忆,晓,乐,笑,碧,初,幻,秋,语,幼,灵,傲,冷,念,寻,水,紫,易,惜,诗,青,雁,盼,雪,夏,凝,迎,问,梦,怜,听,静,云,非,飞,若,苏,柳,妙,敏,真,熙,爱,言,品,甜,小,永,心,欣,冰,媛,米,瑶,玉,诺,糖,瑾,丽,庭,琳,薇,可,伦,美,意,语,芳,雅,丝,嘉,千,佩,落,清,维,毓,馨,希,妍,夕,茵,琪,琦,淑,怡,伊,熙,浅,以,影,翎';
        names.GirlWord2 = '俞,倩,倪,倰,偀,偲,妆,佳,亿,仪,寒,宜,女,奴,妶,好,妃,姗,姝,姹,姿,婵,姑,姜,姣,嫂,嫦,嫱,姬,娇,娟,嫣,婕,婧,娴,婉,姐,姞,姯,姲,姳,娘,娜,妹,妍,妙,妹,娆,娉,娥,媚,媱,嫔,婷,玟,环,珆,珊,珠,玲,珴,瑛,琼,瑶,瑾,瑞,珍,琦,玫,琪,琳,环,琬,瑗,琰,薇,珂,芬,芳,芯,花,茜,荭,荷,莲,莉,莹,菊,芝,萍,燕,苹,荣,蕊,芮,蓝,莎,菀,菁,苑,芸,芊,茗,荔,菲,蓉,英,蓓,蕾,薰,颖,芃,蔓,莓,曼,水,淼,滟,滢,淑,洁,清,澜,波,淞,渺,漩,漪,涟,湾,汇,冰,冷,冽,霜,雪,霞,霖,香,馡,馥,秋,秀,露,飘,育,滢,馥,筠,柔,竹,霭,凝,晓,欢,枫,巧,美,静,惠,翠,雅,红,春,岚,嵘,兰,羽,素,云,华,丽,俪,叆,呤,咛,囡,彩,彤,彨,怜,晴,月,明,晶,昭,星,卿,毓,可,璧,青,灵,彩,慧,盈,眉,艳,凡,凤,风,贞,勤,叶,雁,钰,嘉,锦,黛,怡,情,林,梦,越,悦,希,宁,欣,容,丹,彤,颜,影,韵,音,银,纯,纹,思,丝,纤,爽,舒,伊,依,亚,融,园,文,心,火炎,烁,炫,煜,烟,炅,然,冉,平,屏,评,宛,玉,雨';
        this.names = names;

        this.sexToRoleId = [
            10002, 10001
        ];

        role_portrait_01.setTexture("icon/bust/bust_10001.png");
        role_portrait_02.setTexture("icon/bust/bust_10002.png");

        this.roleSpriteIndex = 0;
        // this.setPlayerInfo(this.roleSpriteIndex);
        this.isInit = false;

        cc.log("SelectLayer =======>>");
    },

    getRandomWord: function(names) {
        var word, wordLen, randomPos;
        while (true) {
            wordLen = names.length;
            randomPos = Math.floor(Math.random() * (wordLen / 2)) * 2;
            word = names.substr(randomPos, 1) || "";
            if (word !== ',')
                break;
        }
        return word;
    },

    getRandomName: function(sex) {
        var word1, word2;
        var familyName = this.getRandomWord(this.names.FamilyName);
        if (sex == 1) {
            word1 = this.getRandomWord(this.names.BoyWord1);
            word2 = this.getRandomWord(this.names.BoyWord2);
        } else {
            word1 = this.getRandomWord(this.names.GirlWord1);
            word2 = this.getRandomWord(this.names.GirlWord2);
        }
        return familyName + word1 + word2;
    },

    getPlayerData: function(index) {
        var playerData = null;
        var kindId = this.sexToRoleId[index];

        if (!!this.playerDatas) {
            for (var i = 0; i < this.playerDatas.length; i++) {
                if (this.playerDatas[i].kindId === kindId) {
                    playerData = this.playerDatas[i];
                    break;
                }
            }
        }
        return playerData;
    },

    setPlayerInfo: function(index) {
        if (index !== 1) {
            index = 0;
            this.roleSpriteIndex = 0;
        }

        var kindId = this.sexToRoleId[index];
        var playerData = this.getPlayerData(index);

        var roleInfo = dataApi.role.findById(kindId);
        if (!!playerData) {

            var sequence = cc.Sequence.create(
                cc.MoveTo.create(0.3, cc.p(0, -cc.winSize.height / 2 - 180)),
                cc.Hide.create()
            );
            this.frontDownNode.runAction(sequence);

            var sequence = cc.Sequence.create(
                cc.DelayTime.create(0.3),
                cc.Show.create(),
                cc.MoveTo.create(0.3, cc.p(0, -cc.winSize.height / 2))
            );
            this._frontDownSprite.runAction(sequence);
            this.roleNameText.setString(playerData.name);
            this.levelText.setString(playerData.level);
        } else {
            var playerName = this.getRandomName(index);
            this.roleNameTextField.setString(playerName);

            this.roleNameText.setString(roleInfo.name);

            var sequence = cc.Sequence.create(
                cc.MoveTo.create(0.3, cc.p(0, -cc.winSize.height / 2 - 180)),
                cc.Hide.create()
            );
            this._frontDownSprite.runAction(sequence);

            var sequence = cc.Sequence.create(
                cc.DelayTime.create(0.3),
                cc.Show.create(),
                cc.MoveTo.create(0.3, cc.p(0, -cc.winSize.height / 2))
            );
            this.frontDownNode.runAction(sequence);
            // this.frontDownNode.setVisible(true);
            // this._frontDownSprite.setVisible(false);
            this.levelText.setString("0级");

        }
        this.maleText.setString(roleInfo.male);
        this.descText.setString(roleInfo.desc);
    },

    showRoleSprite: function(index) {
        if (index === this.roleSpriteIndex) {
            this.setPlayerInfo(this.roleSpriteIndex);
            return;
        }

        var preRoleSprite = this.roleSprites[this.roleSpriteIndex];
        this.roleSpriteIndex = this.roleSpriteIndex + 1;
        if (this.roleSpriteIndex > 1) {
            this.roleSpriteIndex = 0;
        }
        var curRoleSprite = this.roleSprites[this.roleSpriteIndex];
        preRoleSprite.stopAllActions();
        curRoleSprite.stopAllActions();

        var sequence = cc.Sequence.create(
            cc.ScaleTo.create(0.3, 0.5),
            cc.MoveTo.create(0.5, cc.p(-400, 0))
        );
        curRoleSprite.runAction(sequence);
        curRoleSprite.setLocalZOrder(0);

        var self = this;
        var onActionCallback = function(sender) {
            cc.log("this.roleSpriteIndex=" + self.roleSpriteIndex);
            self.setPlayerInfo(self.roleSpriteIndex);
            soundManager.stopAllEffectsSound();
            var index=Math.random()>0.5?1:2;
            if (self.roleSpriteIndex===1) {
                soundManager.playEffectSound("sound/ui/select_role_1"+index+".mp3");
            }else{
                soundManager.playEffectSound("sound/ui/select_role_2"+index+".mp3");
            }
        };

        var sequence = cc.Sequence.create(
            cc.MoveTo.create(0.3, cc.p(0, 0)),
            cc.CallFunc.create(onActionCallback)
        );
        var spawn = cc.Spawn.create(
            cc.ScaleTo.create(0.3, 1),
            sequence
        );
        preRoleSprite.runAction(spawn);
        preRoleSprite.setLocalZOrder(1);
    },

    nextRole:function(){
        if (!this.isInit) return;
        var index = this.roleSpriteIndex + 1;
        if (index > 1) index = 0;
        this.showRoleSprite(index);
    },

    touchEvent: function(sender, type) {
        if (type === ccui.Widget.TOUCH_ENDED) {
            var btnName = sender.getName();
            if (btnName === "roleBtn") {
                this.nextRole();
                // if (!this.isInit) return;
                // var index = this.roleSpriteIndex + 1;
                // if (index > 1) index = 0;
                // this.showRoleSprite(index);
            } else if (btnName === "rondomBtn") {
                var playerName = this.getRandomName(this.roleSpriteIndex);
                this.roleNameTextField.setString(playerName);
            } else if (btnName === "createBtn") {
                soundManager.stopAllEffectsSound();
                
                soundManager.enableEffectSound(true);
                soundManager.enableBgMusic(true);
                soundManager.playEffectSound("sound/ui/game_start.mp3");

                var playerName = this.roleNameTextField.getString();
                var kindId = 10002;
                if (this.roleSpriteIndex === 1) {
                    kindId = 10001;
                }
                ///////////////////////////

                clientManager.createPlayer(playerName, kindId);
                cb.CommonLib.removeRes("uiimg/selectscene.plist");
                cb.CommonLib.removeRes("uiimg/load_scene.png");
                // var sdkManager = cb.SDKManager.getInstance();
                // sdkManager.showRewardedAd();
            } else if (btnName === "enterButton") {
                soundManager.stopAllEffectsSound();
                soundManager.playEffectSound("sound/ui/game_start.mp3");

                this.enterGame();
                cb.CommonLib.removeRes("uiimg/selectscene.plist");
                cb.CommonLib.removeRes("uiimg/load_scene.png");
                // var sdkManager = cb.SDKManager.getInstance();
                // sdkManager.showRewardedAd();
            }
        }
    },

    enterGame: function() {
        var playerData = this.getPlayerData(this.roleSpriteIndex);
        if (!playerData) {
            // tipsBoxLayer.showTipsBox("发生致命错误，玩家数据丢失，请重启游戏！");
            return;
        }

        var playerInfo={
            playerId: playerData.playerId,
            name: playerData.name,
            kindId: playerData.kindId,
            level:playerData.level
        };
        clientManager.loginPlayer(playerInfo);
    },

    showPlayer: function(playerDatas, kindId) {
        if (this.isInit) return;

        circleLoadLayer.hideCircleLoad();

        this.isInit = true;
        this.role_portrait_01.setVisible(true);
        this.role_portrait_02.setVisible(true);
        this.detailNode.setVisible(true);

        this.playerDatas = playerDatas;

        if (!kindId) {
            if (!!playerDatas && playerDatas.length > 0) {
                kindId = playerDatas[0].kindId;
            }
        }

        if (!kindId) {
            this.nextRole();
        } else {
            var index = 1;
            if (kindId === 10002) {
                index = 0;
            }
            this.showRoleSprite(index);
        }

        ///////////////////////////////////////
        // this.enterGame();
    }
});

var SelectScene = cc.Scene.extend({
    _selectLayer: null,
    ctor: function() {
        this._super();

        this._selectLayer = new SelectLayer();
        this.addChild(this._selectLayer);

        this.setTag(16882);
    },

    onEnter: function() {
        this._super();
        circleLoadLayer.showCircleLoad();

        soundManager.playerAreaMusic(10000);
    }
});