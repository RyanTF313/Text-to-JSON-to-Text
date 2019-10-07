const express = require('express');
const app = express();
const bodyParser   = require('body-parser');
const fs = require('fs');


// change cohort.txt into input.json to access data
function createJSON(){
  const readStream = fs.createReadStream('./in-out/cohort.txt', 'utf-8');
  const writeStream =
  fs.createWriteStream('./in-out/input.json','utf-8');

  readStream.on('data', (chunk)=>{
    let cohort = {};
    const file = chunk;
    let rc = file.split('||');

    for (let i = 0; i < rc.length-1; i++) {
      let person = rc[i].split('|')
      let obj = {
        'name': person[0].replace('\n',''),
        'age': person[1],
        'company': person[2],
        'gender expression': person[3],
        'race': person[4]
      };
      cohort[i] = obj
    }
    chunk = JSON.stringify(cohort)
    writeStream.write(chunk)
  });
  console.log('cohort.txt loaded...')
};

// update input.json and write in output.json
function updateJSON(obj){
  const readStream = fs.createReadStream('./in-out/input.json', 'utf-8');
  const writeStream =
  fs.createWriteStream('./in-out/output.json','utf-8');

  readStream.on('data', (chunk)=>{
    chunk = JSON.parse(chunk);
    chunk[Object.keys(chunk).length] = obj
    writeStream.write(JSON.stringify(chunk))
  });
  console.log('ouput.json updated....')
};
// create output.txt with output.json to rewrite cohort.txt
function createTxt(){
  const readStream = fs.createReadStream('./in-out/output.json', 'utf-8');
  const writeStream =
  fs.createWriteStream('./in-out/output.txt','utf-8');

  readStream.on('data', (chunk)=>{
    let arr = []
    chunk = JSON.parse(chunk);
    for( key in chunk){
      arr.push( [chunk[key]['name'],' | ',chunk[key]['age'],' | ',chunk[key]['company'],' |',chunk[key]['gender expression'],' | ',chunk[key]['race'],' ||'] )
    }
    for (let i = 0; i < arr.length; i ++){
      arr[i][0] = " "+arr[i][0]
      arr[i] = arr[i].join('')
    }
    chunk = arr.join('')
    writeStream.write(chunk.toString())
  });
  console.log('output.txt updated with output.json...');
};
// rewrite txt with new txt
function updateTXT(){
  fs.createReadStream('./in-out/output.txt').pipe(fs.createWriteStream('./in-out/cohort.txt'));
}

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const data = require('./in-out/input.json');

app.get('/', function (req, res) {
  res.render('index', {
    data: data
  });
});
app.get('/add', function (req, res) {
  res.render('add', {
    data: data
  });
});

app.get('/retrieve', function (req, res) {
  createJSON()
  res.render('index', {
    data: data
  });
});
app.get('/update', function (req, res) {
  createTxt()
  res.render('index', {
    data: data
  });
});
app.get('/checkUpdate', function (req, res) {
  updateTXT()
  res.render('index', {
    data: data
  });
});
app.post('/add', function (req, res) {
  let object = {
    'name': req.body.name,
    'age': req.body.age,
    'company': req.body.company,
    'gender expression': req.body.genderExpression,
    'race': req.body.race
  };
  updateJSON(object);
  res.render('add', {data:data})

})
app.listen(3000, function () {
  console.log('We on http://localhost:3000/ with it');
});
