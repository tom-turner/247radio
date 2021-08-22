const express = require('express');
const expressLayouts = require('express-layouts')
const app = express();
const http = require('http').Server(app);
const port = process.env.port || 5000;
const fs = require('fs')
const bp = require('body-parser');
const path = require('path');
const multer = require('multer');

function formatIn(input) {
	return input.replace(/\s/g,'-')
}

function convert(file, callback) {
    ffmpeg(file)
        .output(file +'.mp3')
       	.on('progress', function(progress) {
			callback({ message: progress.percent })
		})
        .on('end', function() {                    
            console.log('conversion ended');
            callback({ ended : 'ended', });
        }).on('error', function(err){
            callback({ err : err});
        }).run();
}

function getUnratedSong() {
	let files = fs.readdirSync('public/uploads/')
	return 'uploads/' + files.filter( file => file.slice(-4) == '.mp3' )[0]
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },
  
    filename: function(req, file, cb) {
    	const filename = '<'+ formatIn(req.body.artist) + '><' + formatIn(req.body.songTitle) + '>'
        cb(null, filename + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
var ffmpeg = require('fluent-ffmpeg');

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts);
app.set('layout', 'application');
app.set('view engine', 'ejs'); 


app.post('/upload', upload.single('file'), (req, res) => {
	try {
	convert(req.file.path, (event) => {
		if(event.ended){
			console.log('upload complete')
			fs.unlink(req.file.path, (err) =>  {
				err ? console.log(err) : console.log(req.file.path, 'removed')
			})
			return res.redirect('/thanks')
		}
		if(event.err) {
		}
	})
	}
	catch{
		return res.send('Upload failed, likely because of a bad input. Go back and try again')
	}
});

app.post('/rate', (req, res) => {
	console.log(req.body)
})


app.get('/thanks', (req, res) => {
	res.render('thankyou.ejs')
})

app.get('/moderator', (req, res) => {

	let nextSong = getUnratedSong()

	console.log(nextSong)

	res.render('moderator.ejs', { song: nextSong })
})

app.get('/', (req, res) => {
  res.render('submit.ejs');
});


const server = http.listen(process.env.PORT || port, function() {
  console.log('listening on *:' + port);
});