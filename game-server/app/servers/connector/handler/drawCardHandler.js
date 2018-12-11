/**
 * Date: 2018/12/10
 * Author: pwh
 * Description: 抽卡相关接口
 */

 module.exports = function(app){
     return new Handler(app);
 }

 let Handler = function(app){
     this.app = app;
 }

 let handler = Handler.prototype;

 handler.drawCard = function(msg, session, next){
    session.avatar.cardsPool.drawCard(msg.PoolID,msg.type,next);
 }