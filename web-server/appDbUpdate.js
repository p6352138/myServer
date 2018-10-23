var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var loginRoute = require('./routes/loginRoute');
var updateRoute = require('./routes/updateRoute');

var app = express();

app.use(methodOverride('__method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'jade');
app.set('views', __dirname + '/public');
app.set('view options', {layout: false});
app.set('basepath',__dirname + '/public');

var router = express.Router();

router.get('/Login', loginRoute);
router.get('/Update', updateRoute);

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

console.log("Web server appDbUpdate has started.");

app.listen(3002);
