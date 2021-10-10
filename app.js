#!/usr/bin/env node

const http = require('http');
const url = require('url');
const request = require('request');
const https = require('https');

const port = 3000;

const our_server = http.createServer(function (req, res) {
  const queryObject = url.parse(req.url,true).query;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Max-Age": 2592000, // 30 days
  };

  res.writeHead(200, headers);
  if (queryObject.a) {
    const request = require('request');

    request('https://serpapi.com/search.json?q=' + queryObject.a +'&tbm=isch&ijn=0&api_key=PUT_YOUR_SERPAPI_KEY_HERE', { json: true }, (err, res2, body) => {
      if (err) { return console.log(err); }
      // console.log(body.images_results[0].thumbnail);
      // console.log(body);
      let out = Array()
      for (let i=0; i<parseInt(queryObject.items); i++) {
        out.push(body.images_results[i].thumbnail)
      }
      console.log(out)
      res.end(JSON.stringify(out))
    });
  } else {
    res.end("a=something plz"); 
  }
})

our_server.listen(port)

