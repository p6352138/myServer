/**
 * Date: 2018/12/18
 * Author: pwh
 * Description: 建筑组件
 */

let Component = _require('../component');
let buildingData = _require('../../data/Building')
let consts = _require('../../public/consts')

let BuildingComponent = function(entity){
    Component.Call(this,entity);
}

util.inherits(BuildingComponent, Component);
module.exports = BuildingComponent;

let pro = BuildingComponent.prototype;

pro.init = function(opts){
    this._initDbData(opts.building );

    this.buildinger = new Array();
}

pro._initDbData = function (data) {
    if(data == null)
    {
        this.buildings = new Array();

        for(var key in buildingData)
        {
            this.buildings[key] = 0;
        }
    }
    else
    {
        this.buildings = data;
    }
   
};

pro._getBuilding = function(id){
    switch(id)
    {
        
    }
}

pro._creatBuildinger = function(id){
    buildingData[id]
    var building = {

    };
}

pro.getPersistData = function(){
    return this.buildings;
}

///升级建筑
pro.upgradeBuilding = function(id,next){
    ///没有空闲队列
    if(this.buildinger[0] != null && this.buildinger[1] != null)
        return next(null, {code: consts.BuildingCode.MAX_BUILDINGER});

    var data = buildingData[id];
    var curBuilding = this._getBuilding(id);

    if(data.Product.length <= curBuilding)
        return next(null, {code: consts.BuildingCode.MAX_LV});
    
    if(this.buildinger[0] == null)
    {
        
    }
}

///新增建筑队列
pro.newUpgradeBuilding = function(id,count,next){
    
}

// 升级完成
pro.buildingUpgraded = function(){

}
