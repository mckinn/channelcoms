//server.js
const express = require('express'),
      server = express()
      bodyParser = require('body-parser');

 //note - this port is meaningless to Heroku, 
 // but that does not seem to matter
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

server.put('/echo',(request,response)=>{
    response.json(request.body);
   });

server.listen(server.get('port'),()=>{
    // console.log(`Express server started at port ${localPort}`);
    console.log('Express server started at port: ', server.get('port') );
});