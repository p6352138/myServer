/**********
 *        加载进度协议
 * @param progress: 进度
 */

function loadProgressProto(progress) {
    this.head = "fight.fightHandler.loadProgress";
    this.data = new loadProgressData(progress);
}

function loadProgressData(progress){
    this.progress = progress;
}

module.exports = loadProgressProto;