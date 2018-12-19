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

    this.buildinger1 = null;
    this.buildinger2 = null;
}

pro._initDbData = function (data) {
    this.Santo = data.Santo == null ? 0 : data.Santo;
    this.Residential = data.Residential == null ? 0 : data.Residential;
    this.Champ = data.Champ == null ? 0 : data.Champ;
};

pro._getBuilding = function(id){
    switch(id)
    {

    }
}

pro.getPersistData = function(){
    return {
        Santo : this.Santo,
        Residential : this.Residential,
        Champ : this.Champ,
    }
}

///升级建筑
pro.upgradeBuilding = function(id,next){
    ///没有空闲队列
    if(this.buildinger1 != null && this.buildinger2 != null)
        return next(null, {code: consts.BuildingCode.MAX_BUILDINGER});

    var data = buildingData[id];
    var curBuilding = this._getBuilding(id);

    if(data.Product.length <= curBuilding)
        return next(null, {code: consts.BuildingCode.MAX_LV});
    
    if(this.buildinger1 == null)
    {
        
    }
}

///新增建筑队列
pro.newUpgradeBuilding = function(id,count,next){
    
}

//队列1 升级完成
pro.building1Upgraded = function(){

}

//队列2 升级完成
pro.building2Upgraded = function(){

}