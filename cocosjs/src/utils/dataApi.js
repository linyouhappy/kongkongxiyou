
cb.DataNative = cc.Class.extend({
    ctor:function(data){
        var fields = {};
        data[1].forEach(function(i, k) {
            fields[i] = k;
        });
        data.splice(0, 2);

        var result = {}, item;
        var self=this;
        data.forEach(function(k) {
            item = self.mapData(fields, k);
            result[item.id] = item;
        });

        this.data = result;
    },

    mapData:function(fields, item) {
        var obj = {};
        for (var k in fields) {
            obj[k] = item[fields[k]];
        }
        return obj;
    },

    findBy:function(attr, value) {
        var result = [];
        var i, item;
        for (i in this.data) {
            item = this.data[i];
            if (item[attr] == value) {
                result.push(item);
            }
        }
        return result;
    },

    findById:function(id) {
       return this.data[id];
    },

    all:function() {
       return this.data;
    }
});

var dataApi={
    setData:function(data) {
        if (data) {
             var obj;
             for (var i in data) {
                 obj = dataApi[i];
                 if (obj && obj.set) {
                   obj.set(data[i]);
                 }
             }
        }
    },

    loadNativeData:function(dataName){
        // cc.log("dataName="+dataName);
        require('src/config/'+dataName+'.js');
        dataApi[dataName]=new cb.DataNative(config[dataName]);

    }
};

//dataApi.loadNativeData('talk');
dataApi.loadNativeData('character');
dataApi.loadNativeData('role');
dataApi.loadNativeData('error_code');
dataApi.loadNativeData('area');
dataApi.loadNativeData('npc');
dataApi.loadNativeData('fightskill');
dataApi.loadNativeData('equipment');
dataApi.loadNativeData('item');
dataApi.loadNativeData('transport');
dataApi.loadNativeData('skill_effect');
dataApi.loadNativeData('strength');
dataApi.loadNativeData('item_shop');
dataApi.loadNativeData('task_main');
dataApi.loadNativeData('task_talkm');
dataApi.loadNativeData('task_daily');
dataApi.loadNativeData('skinId');
dataApi.loadNativeData('hpmp');
dataApi.loadNativeData('market');
dataApi.loadNativeData('broadcast');
dataApi.loadNativeData('officer');
dataApi.loadNativeData('guild');
dataApi.loadNativeData('experience');
dataApi.loadNativeData('fightlevel');
dataApi.loadNativeData('guild_town');
dataApi.loadNativeData('words');
dataApi.loadNativeData('myboss');

dataApi.loadNativeData('recharge');
dataApi.loadNativeData('exchange');
dataApi.loadNativeData('gift');
dataApi.loadNativeData('recycle');
dataApi.loadNativeData('fruit_slot');
dataApi.loadNativeData('worldboss');


