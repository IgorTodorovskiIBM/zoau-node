const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const ds = require('../lib/zoau.js').datasets;
const zoau = require('../lib/zoau.js')

const fetch = require("node-fetch");

var default_filter = "ITODORO.CSRC";

// REST API
router.get('/list_members/:pds', (req, res) => {
  ds.list_members(req.params.pds).then(value => {
    value = value.map(function(el) { 
      return req.params.pds + "(" + el + ")"; 
    }) 
    var data = []
    value.forEach(function(object){
      data.push({
        name: object,
      });
    });
    res.json(data);
  }, reason => {
    // rejection
  });
});

router.get('/read_pds/:pds', (req, res) => {
  zoau.datasets.read("'" + req.params.pds + "'").then(function(contents) {
    res.json({"contents": contents});
  }, reason => {
    // rejection
  });
});


// UI Routes
router.all('/', async (req, res) => {
  if (req.body.filter)
    filter = req.body.filter
  else
    filter = default_filter

  fetch('http://localhost:3000/list_members/' + filter).then(res2 => res2.json()).then(function(data) {
    var files = {};
    for (index = 0; index < data.length; ++index) {
      files[data[index].name] = data[index].name;
      selected = files[data[index].name]
    }

    if (req.body.filename)
      selected = req.body.filename

    fetch('http://localhost:3000/read_pds/' + selected).then(res3 => res3.json()).then(function(contents) {
      var data = { "files":files, "selected":selected, "contents":contents.contents, "filter":filter};
      res.render('edit', {
        data: data,
        info: {},
        csrfToken: req.csrfToken()
      })
    })
  })
})

router.post('/build', async (req, res) => {
  fetch('http://localhost:3000/list_members/' + req.body.filter).then(res2 => res2.json()).then(function(data) {
    var files = {};
    for (index = 0; index < data.length; ++index) {
      files[data[index].name] = data[index].name;
    }
    selected = req.body.filename

    // Compile and run 
    var output = require('child_process').execSync('cd /tmp/ && xlc -+ -o a.out ' + "\"//'" + selected + "'\"" + " && ./a.out").toString();
    
    // TODO: Write current contents

    zoau.datasets.read("'" + selected + "'").then(function(contents) {
      var data = { "files":files, "selected":selected, "contents":contents, "filter":filter};
      res.render('edit', {
        data: data,
        info: {"output":output},
        csrfToken: req.csrfToken()
      })
    })
  })
})


module.exports = router
