//server.js
const express = require('express'),
      server = express()
      bodyParser = require('body-parser');

//setting the port.
let localPort = process.env.PORT || 9000;
let thing = {
    name: 'Steve',
    location: 'Canada',
}

console.log('thing: '+JSON.stringify(thing));

server.use(bodyParser.json());  // parse JSON bodies

server.set('port', localPort);

//Adding routes
server.get('/',(request,response)=>{
 response.send('Hello World');
});

server.get('/thing',(request,response)=>{
 response.json(thing);
});

server.put('/parseit',(request,response)=>{
    response.json(request.body);
   });

server.listen(localPort,()=>{
 console.log(`Express server started at port ${localPort}`);
});