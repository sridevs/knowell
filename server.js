'use strict';
let http = require('http');
let handler = require('./api/routers/router');

let server = http.createServer(handler);

server.listen(8080, (err) => {
    if(err) return console.log('Something went wrong while booting server');
    console.log('listening at 8080..');
});
