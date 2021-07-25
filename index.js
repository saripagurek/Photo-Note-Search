const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const port = 3000;
const publicFolder = './public/images';
const fs = require('fs');
const busboy = require('connect-busboy');
const uuid = require('uuid');
// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');
const helpers = require('./models/dbHelpers');

// Creates a client
const client = new vision.ImageAnnotatorClient();


app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(busboy());

app.get('/', async (req, res) => {
  const filenames = await helpers.getAllPhotos();
  res.render('home', {
    filenames: filenames.map(function(row){
      return {
        url: row.filename.substring(16)
      };
      /*TODO: Add timestamp here */
    }),
  });
});

app.get('/search/:query', async (req, res) => {
  const query = req.params.query;
  const filenames = await helpers.getMatchingPhotos(query);
  res.render('search',{
    filenames: filenames.map(function(row){
      return {
        url: row.filename.substring(16)
      };
      /*TODO: Add timestamp here */
    }),
    query: query,
  });
});

app.post('/upload', (req, res) =>{
  req.pipe(req.busboy);
  req.busboy.on('file', (fieldname, file, filename) => {
    const uploadedfileName = publicFolder + '/' + uuid.v4() + filename
    const fstream = fs.createWriteStream(uploadedfileName);
    file.pipe(fstream);
    fstream.on('close', async() => {
       /**
       * TODO(developer): Uncomment the following line before running the sample.
       */

      // Read a local image as a text document
      const [result] = await client.documentTextDetection(uploadedfileName);
      const fullTextAnnotation = result.fullTextAnnotation;
      console.log(`Full text: ${fullTextAnnotation.text}`);
      /*console.log(fullTextAnnotation);
      fullTextAnnotation.pages.forEach(page => {
        page.blocks.forEach(block => {
          console.log(`Block confidence: ${block.confidence}`);
          block.paragraphs.forEach(paragraph => {
            console.log(`Paragraph confidence: ${paragraph.confidence}`);
            paragraph.words.forEach(word => {
              const wordText = word.symbols.map(s => s.text).join('');
              console.log(`Word text: ${wordText}`);
              console.log(`Word confidence: ${word.confidence}`);
              word.symbols.forEach(symbol => {
                console.log(`Symbol text: ${symbol.text}`);
                console.log(`Symbol confidence: ${symbol.confidence}`);
              });
            });
          });
        });
      });*/
      await helpers.add({filename:uploadedfileName, textcontent:fullTextAnnotation.text});
      res.redirect('/');
    });
  });
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
});
