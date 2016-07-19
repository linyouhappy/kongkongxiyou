Ext.onReady(function(){

	Ext.BLANK_IMAGE_URL ='../ext-4.0.7-gpl/resources/themes/images/default/tree/s.gif'; 
	
   var sceneStore = Ext.create('Ext.data.Store', {
	id:'sceneStoreId',
	autoLoad:false,
	pageSize:5,
    fields:['serverId','areaId','id','name','kindId','kindName','type','position','entityId','teamId','level','hp','maxHp','mp','maxMp','range','walkSpeed'],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'requests'
        }
    }
});

/**
 * userGrid,detail users' message
 */
var sceneGrid=Ext.create('Ext.grid.Panel', {
	id:'sceneGridId',
	region:'center',
    store: sceneStore,
    columns:[
		{xtype:'rownumberer',width:50,sortable:false},
		{text:'serverId',dataIndex:'serverId',width:120},
		{text:'areaId',dataIndex:'areaId',width:100},
		{text:'id',dataIndex:'id',width:100},
		{text:'name',dataIndex:'name',width:100},
		{text:'kindId',dataIndex:'kindId',width:100},
		{text:'kindName',dataIndex:'kindName',width:100},
		{text:'type',dataIndex:'type',width:100},
		{text:'position',dataIndex:'position',width:100},
		{text:'entityId',dataIndex:'entityId',width:100},
		{text:'teamId',dataIndex:'teamId',width:100},
		{text:'level',dataIndex:'level',width:100},
		{text:'hp',dataIndex:'hp',width:100},
		{text:'maxHp',dataIndex:'maxHp',width:100},
		{text:'mp',dataIndex:'mp',width:100},
		{text:'maxMp',dataIndex:'maxMp',width:100},
		{text:'range',dataIndex:'range',width:100},
		{text:'walkSpeed',dataIndex:'walkSpeed',width:100}
		],
	 tbar:[{
          xtype:'button',
          text:'refresh',
          handler:refresh
         }]
});


var viewport=new Ext.Viewport({
	    layout:'border',
	    items:[sceneGrid]
	});
	refresh();
});

function refresh(){
   window.parent.client.request('sceneInfo', null, function(err, msg) {
    if(err) {
      console.error('fail to request scene info:');
      console.error(err);
      return;
    }
 
    // compose display data
    var data = [];
    for(var id in msg) {
    	for(var i=0;i<msg[id].length;i++){
    		data.push({
		      	serverId : id,
		      	areaId:msg[id][i]['areaId'],
		      	id:msg[id][i]['id'],
		      	name : msg[id][i]['name'],
		      	kindId : msg[id][i]['kindId'],
		      	kindName : msg[id][i]['kindName'],
		      	type : msg[id][i]['type'],
		      	position : '('+msg[id][i].x+','+msg[id][i].y+')',
		      	entityId : msg[id][i]['entityId'],
		      	teamId : msg[id][i]['teamId'],
		      	level : msg[id][i]['level'],
		      	hp : msg[id][i]['hp'],
		      	maxHp : msg[id][i]['maxHp'],
		      	mp : msg[id][i]['mp'],
		      	maxMp : msg[id][i]['maxMp'],
		      	range : msg[id][i]['range'],
		      	walkSpeed : msg[id][i]['walkSpeed'],
		    });
    	}
    }
    var store = Ext.getCmp('sceneGridId').getStore();
    store.loadData(data);
  });
}	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
