/**
 * Date: 2018/9/20
 * Author: pwh
 * Description:
 */

 module.exports = function(app){
    return new Remote(app);
 }

 let Remote = function(app){
     this.app = app;
 }

 let pro = Remote.prototype;

 ///
 pro.drawCard = function(cardsID,cb){
     this.app.drawCardsStub.drawCard(cardsID,cb);
 }