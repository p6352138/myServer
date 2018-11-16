/**
 * Date: 2018/9/13
 * Author: liuguolai
 * Description:
 */
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var accessTokenRoute = require("./routes/accessTokenRoute");
var AccessTokenMgr = require('./manager/accessTokenMgr');

var app = express();

app.use(methodOverride('__method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'jade');
app.set('views', __dirname + '/public');
app.set('view options', {layout: false});
app.set('basepath',__dirname + '/public');

var router = express.Router();

router.get('/AccessToken', accessTokenRoute);

app.use("/", router);

if ('development' == app.get('env')) {
    app.use(express.static(__dirname + '/public'));
    app.use(errorhandler({ dumpExceptions: true, showStack: true }));
}

if ('production' == app.get('env')) {
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(errorhandler());
}

accessTokenMgr = new AccessTokenMgr();
accessTokenMgr.getAccessToken();

console.log("Web server appCenterControl has started.");

app.listen(4001);
