//server.js
const express = require('express'),
      server = express(),
      bodyParser = require('body-parser'),
      { WebClient } = require('@slack/web-api');

 //note - this port is meaningless to Heroku, 
 // but that does not seem to matter
const localPort = process.env.PORT || 9000;
const web = new WebClient(process.env.SLACK_TOKEN); 
const thing = {
    name: 'Steve',
    location: 'Canada',
}

async function pingUser (textToSend = "hi there") {
    // Use the `auth.test` method to find information about the installing user
    const res = await web.auth.test()
  
    // Find your user id to know where to send messages to
    const userId = res.user_id
    console.log(userId);
    console.log(JSON.stringify(res));
  
    // Use the `chat.postMessage` method to send a message from this app
    await web.chat.postMessage({
      channel: userId,
      text: textToSend,
    });
      console.log(`Message ${textToSend} posted!`);
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
    let {textToSend = "Oh no - nothing"} = request.body;
    pingUser(textToSend);
   });

server.listen(server.get('port'),()=>{
    // console.log(`Express server started at port ${localPort}`);
    console.log('Express server started at port: ', server.get('port') );
});