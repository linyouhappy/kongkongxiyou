var consts = {};
var config = {};
var MESSAGE = {
    RES: 200,
    ERR: 500,
    PUSH: 600
};
var AttackResult = {
    SUCCESS: 1,
    KILLED: 2,
    MISS: 3,
    NOT_IN_RANGE: 4,
    NO_ENOUGH_MP: 5,
    NOT_COOLDOWN: 6,
    ATTACKER_CONFUSED: 7,
    NO_TARGET: 8,
    CRIT: 9,
    ERROR: -1
};

var FightMode={
    SAFEMODE: 1,
    JUSTICEMODE: 2,
    ALLMODE: 3,
    TEAMMODE: 4,
    GUILDMODE: 5
};

var FightModeName={
    "1":"和 平",
    "2":"善 恶",
    "3":"全 体",
    "4":"组 队",
    "5":"帮 派"
};

var EntityType = {
    PLAYER: 1,
    MOB: 2,
    NPC: 3,
    EQUIPMENT: 4,
    ITEM: 5,
    BAG: 6,
    TRANSPORT: 7
};

var PropertyKind = {
    Attack: 1,
    Hit: 2,
    Defend: 3,
    Crit: 4,
    Dodge: 5,
    Rescrit: 6,
    Wreck: 7,
    Hp: 8,
    Mp: 9
};

var EquipmentType = {
    Weapon: 1,
    Ring: 2,
    Armor: 3,
    Necklace: 4,
    Shoes: 5,
    Belt: 6
};

var ItemType={
    ItemHP:1,
    ItemMP:2,
    ItemGift:3,
    ItemStone:4,
    ItemExp:5
};

var PropertyNames = {
    '1': '攻击',
    '2': '命中',
    '3': '防御',
    '4': '暴击',
    '5': '闪避',
    '6': '抗暴',
    '7': '破甲',
    '8': '红血',
    '9': '蓝血'
};

var MoneyTypes = {
    caoCoin: 1,
    bandCaoCoin: 2,
    crystalCoin: 3,
    bandCrystal: 4
};

var MoneyNames = {
    '1': '炒币',
    '2': '绑定炒币',
    '3': '粉钻',
    '4': '绑定粉钻'
};

var PlaceTypes = {
    Staff: 0,
    CEO: 1,
    Manager: 2
};

var PlaceNames = {
    '0': '员工',
    '1': 'CEO',
    '2': '经理',
};

var TaskState = {
    NOT_START: 0,
    NOT_COMPLETED: 1,
    NOT_DELIVERY: 2,
    COMPLETED: 3,
    FINISH_ALL:4,
};

var TaskType = {
    KILL_MOB: 1,
    COLLECT: 2,
    TALK_NPC: 3
};

var NPCTypes = {
    NORMAL: 0,
    TRANSPORT: 1,
    FEDERATION: 2,
    CHALLENGE: 3,
    MARKET:4,
    DOMAIN:5,
    VIRTUALNPC:6
};

var SkillType = {
    Attack: 4,
    Magic: 7,
}

var TeamConsts = {
    TEAM_ID_NONE: 0,

    YES: 1,
    NO: 0,

    REJECT: 0,
    ACCEPT: 1
};

var GuildConsts = {
    // TEAM_ID_NONE: 0,
    YES: 1,
    NO: 0,
    REJECT: 0,
    ACCEPT: 1
};

var TipsType = {
    TEAM: 1,
    CHALLENGE: 2,
    FRIEND: 3,
    EMAIL: 4,
    MARKET: 5,
    GUILD:6
};

var Pick = {
    SUCCESS: 1,
    VANISH: 2,
    NOT_IN_RANGE: 3,
    BAG_FULL: 4
};

var NPC = {
    SUCCESS: 1,
    NOT_IN_RANGE: 2
};

var AreaType={
    SCENE: 1,
    SINGLE_INSTANCE: 2,
    TEAM_INSTANCE: 3
    // FIGHT_INSTANCE:4
};

var PlayerJob = {
    MANJOB: 1,
    WOMANJOB: 2
};

var AreaKinds = {
    SAFE_AREA: 0,
    DOMAIN_AREA: 1,
    NORMAL_AREA: 2,
    FIGHT_AREA: 3,
    MY_BOSS_AREA: 4,
    WORLD_BOSS_AREA: 5,
    GHOST_AREA:6
};

var AreaStates = {
    NORMAL_STATE: 0,
    DOMAIN_STATE: 1,
    BATTLE_STATE: 2
};

var ChatMaskId={
    NORMALMASK:0,
    GUILDMASK:1,
    MEMBER_LEA_GUILD:2,
};

// var DomainPoints={
//     3001:[1241,179],
//     3002:[1181,223],
//     3003:[1320,230],
//     3004:[1239,200],
//     3005:[1375,200]
// }


consts.recycleRatio = 0.3;

consts.COLOR_GRAY = {
    r: 150,
    g: 150,
    b: 150,
    a: 255
}; //颜色-灰

consts.COLOR_WHITE = {
    r: 255,
    g: 255,
    b: 255,
    a: 255
}; //颜色-白

consts.COLOR_GREEN = {
    r: 110,
    g: 252,
    b: 66,
    a: 255
}; //颜色-绿

consts.COLOR_BLUE = {
    r: 92,
    g: 180,
    b: 255,
    a: 255
}; //颜色-蓝

consts.COLOR_VIOLET = {
    r: 237,
    g: 23,
    b: 255,
    a: 255
}; //颜色-紫

consts.COLOR_GOLD = {
    r: 255,
    g: 207,
    b: 27,
    a: 255
}; //颜色-黄

consts.COLOR_ORANGE = {
    r: 252,
    g: 107,
    b: 0,
    a: 255
}; //颜色-橙

consts.COLOR_RED = {
    r: 250,
    g: 16,
    b: 16,
    a: 255
}; //颜色-红

consts.COLOR_PURE_RED = {
    r: 255,
    g: 0,
    b: 0,
    a: 255
}; //颜色-纯红

consts.COLOR_PURE_GREEN = {
    r: 0,
    g: 255,
    b: 0,
    a: 255
}; //颜色-纯绿

consts.COLOR_PURE_BLUE = {
    r: 0,
    g: 0,
    b: 255,
    a: 255
}; //颜色-纯蓝

consts.COLOR_PURE_YELLOW = {
    r: 255,
    g: 255,
    b: 0,
    a: 255
}; //颜色-纯黄

consts.COLOR_CYANBLUE = {
    r: 125,
    g: 220,
    b: 198,
    a: 255
}; //颜色-青

consts.COLOR_YELLOW = {
    r: 252,
    g: 247,
    b: 46,
    a: 255
}; //颜色-黄

consts.COLOR_MOONLIGHT = {
    r: 0,
    g: 234,
    b: 255,
    a: 255
}; //颜色-月光

// consts.COLOR_AMBER = {
//     r: 252,
//     g: 0,
//     b: 255,
//     a: 255
// }; //颜色-琥珀

consts.COLOR_TERRAGOLD = {
    r: 201,
    g: 182,
    b: 119,
    a: 255
}; //颜色-土黄

consts.COLOR_ORANGEGOLD = {
    r: 255,
    g: 163,
    b: 15,
    a: 255
}; //颜色-橙黄

consts.COLOR_GRAYWHITE = {
    r: 247,
    g: 233,
    b: 209,
    a: 255
}; //颜色-灰白

consts.COLOR_PINK = {
    r: 255,
    g: 12,
    b: 222,
    a: 255
}; //颜色-桃红

consts.COLOR_BROWN = {
    r: 125,
    g: 90,
    b: 52,
    a: 255
}; //颜色-棕色
consts.COLOR_BLACK = {
    r: 0,
    g: 0,
    b: 0,
    a: 255
}; //颜色-黑色

consts.COLOR_CAMBLUE={
    r: 91,
    g: 180,
    b: 255,
    a: 255
}; //颜色-cambridge blue

var colorTbl = [
    consts.COLOR_GRAY,
    consts.COLOR_WHITE,
    consts.COLOR_GREEN,
    consts.COLOR_BLUE,
    consts.COLOR_VIOLET,
    consts.COLOR_RED,
    consts.COLOR_GOLD
];

// Color3B(255,255,255),   //0white
// Color3B(10,180,10),     //1green
// Color3B(91,180,255),    //2cambridge blue
// Color3B(255,80,255),    //3purple
// Color3B(255,20,80),     //4red
// Color3B(255,255,127),   //5golden
// Color3B(232,237,57),    //6 yellow
// Color3B(255,0,0),       //7red

consts.move_dir = {
    1: {
        x: 0,
        y: 1
    },
    2: {
        x: 1,
        y: 1
    },
    3: {
        x: 1,
        y: 0
    },
    4: {
        x: 1,
        y: -1
    },
    5: {
        x: 0,
        y: -1
    },
    6: {
        x: -1,
        y: -1
    },
    7: {
        x: -1,
        y: 0
    },
    8: {
        x: -1,
        y: 1
    }
};

consts.simpleDirectIds = [
    0, //none
    1, //1
    3, //2
    3, //3
    3, //4
    5, //5
    7, //6
    7, //7
    7 //8
];