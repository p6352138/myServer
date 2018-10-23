/**
 * Date: 2018/7/10
 * Author: liuguolai
 * Description:
 */

var AddArm = _require('./addArm');
var DamageListenerBuff = _require('./damageListenerBuff');
var OnDamageListenerBuff = _require('./onDamageListenerBuff');
var DieListenerBuff = _require('./dieListenerBuff');
var DrawCardListenerBuff = _require('./drawCardListenerBuff');
var HealBuff = _require('./healBuff');
var ModPropBuff = _require('./modPropBuff');
var ModPropPctBuff = _require('./modPropPctBuff');
var RecoverMpRateBuff = _require('./recoverMpRateBuff');
var UseCardListenerBuff = _require('./useCardListenerBuff');
var TauntBuff = _require('./tauntBuff');
var DotBuff = _require('./dotBuff');
var GetMPBuff = _require('./getMPBuff');
let FireMarkBuff = _require('./fireMarkBuff');
let TimeListenerBuff = _require('./timeListenerBuff');

var buffLogic = {
    addArm: AddArm,
    damageListener: DamageListenerBuff,
    onDamageListener: OnDamageListenerBuff,
    dieListener: DieListenerBuff,
    drawCardListener: DrawCardListenerBuff,
    heal: HealBuff,
    modProp: ModPropBuff,
    modPropPct: ModPropPctBuff,
    recoverMpRate: RecoverMpRateBuff,
    useCardListener: UseCardListenerBuff,
    dot: DotBuff,
    taunt: TauntBuff,
    getMP: GetMPBuff,
    fireMark: FireMarkBuff,
    timeListener: TimeListenerBuff,
};

var buffRegister = module.exports;

buffRegister.getBuffLogic = function (clzName) {
    return buffLogic[clzName];
};
