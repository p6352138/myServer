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
    this._initDbData(opts.building);

    if(opts.buildinger == null)
        this.buildinger = new Array();
    else
        this.buildinger = opts.buildinger;
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

pro.getPersistData = function(){
    return {
        building : this.buildings,
        buildinger : this.buildinger,
    }
}

///升级建筑
pro.upgradeBuilding = function(id,next){
    ///没有空闲队列
    if(this.buildinger[0] != null && this.buildinger[1] != null)
        return next(null, {code: consts.BuildingCode.MAX_BUILDINGER});

    var data = buildingData[id];

    if(data.Product.length <= this.buildings[id])
        return next(null, {code: consts.BuildingCode.MAX_LV});
    
    for(let i =0 ;i <2 ;i++)
    {
        if(this.buildinger[i] == null)
        {
            var time = data.Time[this.buildings[id]];
            setTimeout(buildingUpgraded(id,i).bind(this),time);
            this.buildinger[i] = {id : id , index : i,time : new Date().getTime() + time}

            return next(null,{code : consts.BuildingCode.OK,buildinger:this.buildinger})
        }
    }
}

///新增建筑队列
pro.newUpgradeBuilding = function(id,count,next){
    
}

// 升级完成
pro.buildingUpgraded = function(id,index){

}
