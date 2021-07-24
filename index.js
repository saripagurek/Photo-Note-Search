const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const port = 3000;
const publicFolder = './public/images';
const fs = require('fs');
const busboy = require('connect-busboy');
const uuid = require('uuid');

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(busboy());

app.get('/', (req, res) => {
  const filenames = fs.readdirSync(publicFolder);
  res.render('home', {
    filenames: filenames,
  });
});

app.post('/upload', (req, res) =>{
  req.pipe(req.busboy);
  req.busboy.on('file', (fieldname, file, filename) => {
    const fstream = fs.createWriteStream(publicFolder + '/' + uuid.v4() + filename);
    file.pipe(fstream);
    fstream.on('close', () => {
      res.redirect('/');
    });
  });
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
});
