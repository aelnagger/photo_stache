var express = require('express');
var hbs = require('hbs');
var fs = require('fs');

var app = express();

// set the view engine to use handlebars
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: "/var/photos" }))

function logerr(err){
	if(err){
		console.log(err);
	}
}


var blocks = {};

hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context(this));
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});

app.get('/', function(req, res){
    res.render('index');
});

app.get('/thanks', function(req, res){
	res.render('thanks');
});

app.post('/', function(req, res){
	var root = '/var/photos/';
	var dir = root + req.body.first + '_' + req.body.last;
	try{
		fs.stat(dir, function(err, stat){
			if(err || !stat.isDirectory()){
				logerr(dir + ' does not exist. Creating now.');
				fs.mkdirSync(dir);
			}

			function checkDir(dir, cb){
				fs.stat(dir, function(err, stat){
					cb(!err && stat.isDirectory());
				});
			}

			function checkFile(file, cb){
				fs.stat(file, function(err, stat){
					cb(!err && stat.isFile());
				})
			}

			var process = function(file){
				var src = file.path;
				var dest = dir + '/' + file.name;
				checkDir(dir, function(exists){
					if(!exists){
						fs.mkdirSync(dir);
					}
					checkFile(dest, function(exists){
						if(!exists){
							fs.rename(src, dest, logerr);
						} else{
							fs.unlink(src, logerr);
						}
					});
				});
			}

			// Single file
			if(req.files.field.path !== undefined){
				process(req.files.field);
			}
			else{
				// Multiple files.
				for(var i in req.files.field){
					process(req.files.field[i]);
				}
			}
		});
		res.json("OK");
	} catch(err){
		logerr(err);
		res.status(500);
	}
});

app.listen(3000);
console.log('Listening on port 3000');