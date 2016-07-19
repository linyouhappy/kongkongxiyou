module.exports = {
  AttackResult: {
    SUCCESS: 1,
    KILLED: 2,
    MISS: 3,
    NOT_IN_RANGE: 4,
    NO_ENOUGH_MP: 5,
    NOT_COOLDOWN: 6,
    ATTACKER_CONFUSED: 7,
    NO_TARGET: 8,
    CRIT: 9,
    NOT_SKILL: 10,
    ERROR: -1
  },

  KICKTIME:1800000,
  
  BLACKHOLEFUNC:function() {},

  FightMode: {
    SAFEMODE: 1,
    JUSTICEMODE: 2,
    ALLMODE: 3,
    TEAMMODE: 4,
    GUILDMODE: 5
  },

  RES_CODE: {
    SUC_OK: 1, // success
    ERR_FAIL: -1, // Failded without specific reason
    ERR_USER_NOT_LOGINED: -2, // User not login
    ERR_CHANNEL_DESTROYED: -10, // channel has been destroyed
    ERR_SESSION_NOT_EXIST: -11, // session not exist
    ERR_CHANNEL_DUPLICATE: -12, // channel duplicated
    ERR_CHANNEL_NOT_EXIST: -13 // channel not exist
  },

  MYSQL: {
    ERROR_DUP_ENTRY: 1062
  },

  PLAYER: {
    level: 1,
    reviveTime: 30000,
    RECOVER_WAIT: 10000, //You must wait for at lest 10s to start recover hp.
    RECOVER_TIME: 10000 //You need 10s to recover hp from 0 to full.
  },

  BornPlace: {
    x: 346,
    y: 81,
    width: 126,
    height: 129
  },

  MESSAGE: {
    RES: 200,
    ERR: 500,
    PUSH: 600
  },

  EntityType: {
    PLAYER: 1,
    MOB: 2,
    NPC: 3,
    EQUIPMENT: 4,
    ITEM: 5,
    BAG: 6
  },

  ItemType: {
    ItemHP: 1,
    ItemMP: 2,
    ItemGift: 3,
    ItemStone: 4,
    ItemExp: 5
  },

  SkillType: {
    ATTACK: 1,
    BUFF: 2,
    ATTACKBUFF: 3,
    PASSIVE: 4
  },

  Pick: {
    SUCCESS: 1,
    VANISH: 2,
    NOT_IN_RANGE: 3,
    BAG_FULL: 4
  },

  NPC: {
    SUCCESS: 1,
    NOT_IN_RANGE: 2
  },

  TaskState: {
    NOT_START:0,
    NOT_COMPLETED:1,
    NOT_DELIVERY: 2,
    COMPLETED:3
  },

  PlayerJob:{
    MANJOB:1,
    WOMANJOB:2
  },

  TaskType: {
    KILL_MOB: 1,
    COLLECT: 2,
    TALK_NPC: 3
  },

  PropertyKind: {
    Attack: 1,
    Hit: 2,
    Defend: 3,
    Crit: 4,
    Dodge: 5,
    Rescrit: 6,
    Wreck: 7,
    Hp: 8,
    Mp: 9
  },

  EquipmentType: {
    Weapon: 1,
    Ring: 2,
    Armor: 3,
    Necklace: 4,
    Shoes: 5,
    Belt: 6
  },

  MoneyTypes: {
    caoCoin: 1,
    bandCaoCoin: 2,
    crystal: 3,
    bandCrystal: 4
  },

  NpcType: {
    TALK_NPC: '0',
    TRAVERSE_NPC: '1'
  },

  Event: {
    chat: 'onChat'
  },

  ActionType: {
    DEFAULT: 0,
    MOVE: 1,
    REVIVE: 2
  },

  GuildAffiche:{
    GETBUILD:1,
    GETEQUIP:2,
    JOININ:3,
    LEAVE:4,
    APPOINT:5,
    FIRE:6
  },

  /**
   * Traverse npc, the key is the npc id, the value is the taret's area id.
   */
  TraverseNpc: {
    301: 2,
    302: 4,
    305: 1,
    306: 3,
    309: 2,
    303: 5
  },

  /**
   * Traverse task, the key is traverse npc's id, the value is task id.
   */
  TraverseTask: {
    //3008: 3
  },

  AreaType: {
    SCENE: 1,
    SINGLE_INSTANCE: 2
      // TEAM_INSTANCE: 3,
      // FIGHT_INSTANCE:4
  },

  AreaKinds: {
    SAFE_AREA:0,
    DOMAIN_AREA:1,
    NORMAL_AREA: 2,
    FIGHT_AREA: 3,
    MY_BOSS_AREA: 4,
    WORLD_BOSS_AREA: 5,
    GHOST_AREA:6
  },

  AreaStates:{
    NORMAL_STATE:0,
    DOMAIN_STATE:1,
    BATTLE_STATE:2
  },

  GuildConsts: {
    YES: 1,
    NO: 0,
    REJECT: 0,
    ACCEPT: 1
  },

  Channel: {
    WORLD: 1,
    AREA: 2,
    FACTION: 3,
    TEAM: 4,
    PRI: 5,
    SYSTEM: 6,
    MARQUEE: 7
  },

  ChatMaskId: {
    NORMALMASK: 0,
    GUILDMASK: 1,
    MEMBER_LEA_GUILD: 2,
  },

  PlaceTypes: {
    Staff: 0,
    CEO: 1,
    Manager: 2
  },

  /**
   * Team
   */
  TEAM: {
    TEAM_ID_NONE: 0, // player without team(not in any team)
    PLAYER_ID_NONE: 0, // none player id in a team(placeholder)
    AREA_ID_NONE: 0, // none area id (placeholder)
    USER_ID_NONE: 0, // none user id (placeholder)
    SERVER_ID_NONE: 0, // none server id (placeholder)
    PLAYER_INFO_NONE: '', // none player info (placeholder)
    // JOIN_TEAM_RET_CODE: {
    //   OK             : 1,  // join ok
    //   NO_POSITION      : -1, // there is no position
    //   ALREADY_IN_TEAM  : -2, // already in the team
    //   IN_OTHER_TEAM    : -3, // already in other team
    //   SYS_ERROR        : -4  // system error
    // }, // return code of trying to join a team

    OK: 1, // join ok
    NO_POSITION: -1, // there is no position
    ALREADY_IN_TEAM: -2, // already in the team
    IN_OTHER_TEAM: -3, // already in other team
    SYS_ERROR: -4, // system error
    NO_CAPTION: -5, // there is no caption


    TEAM_TITLE: {
      MEMBER: 0,
      CAPTAIN: 1
    }, // team member title(member/captain)

    REJECT: 0,
    ACCEPT: 1,

    // sys return
    OK: 1,
    FAILED: 0,

    // yes / no
    YES: 1,
    NO: 0,

    DEFAULT_NAME: ''
  },

  DomainConst: {
    START_HOUR: 20,
    START_MINUTE: 30,
    END_HOUR: 21,
    END_MINUTE: 0
  },

  recycleRatio:0.3,
  /**
   * check a entity that whether can be picked.
   */
  isPickable: function(entity) {
    return entity && (entity.type === module.exports.EntityType.EQUIPMENT || entity.type === module.exports.EntityType.ITEM);
  },

  /**
   * check a entity that whether can be attacked.
   */
  isAttackable: function(entity) {
    return entity && (entity.type === module.exports.EntityType.PLAYER || entity.type === module.exports.EntityType.MOB);
  }
};