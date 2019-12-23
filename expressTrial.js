//server.js
const express = require('express'),
      server = express(),
      bodyParser = require('body-parser'),
      { WebClient } = require('@slack/web-api');

 //note - this port is meaningless to Heroku, 
 // but that does not seem to matter
const localPort = process.env.PORT || 9000;
console.log("AUth token is: " + process.env.SLACK_TOKEN);
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
      channel:  "C9XG2PBTN",   // General for now
      text: textToSend,
    });
      console.log(`Message ${textToSend} posted!`);
  }

console.log('thing: '+JSON.stringify(thing));

server.use(bodyParser.json());  // parse JSON bodies

server.set('port', localPort);

process.on('SIGINT', () => {
  console.log('Control C received.');
  process.exit();
});

process.on('beforeExit', (code) => {
  console.log('Process beforeExit event with code: ', code);
});

process.on('exit', (code) => {
  console.log('Process exit event with code: ', code);
});

//Adding routes

server.get('/',(request,response)=>{
  console.log('Hello World');
  response.json({text:"Hello World"});
});

server.post('/slack',(request,response)=>{
  console.log('validation challenge');
  const body = request.body;
  console.log(JSON.stringify(body));
  // const cha = (({challenge}) => ({challenge}))(body); // destructure the challenge property to an object
  const cha = (                 // IFFE
    function({challenge}) {     // assign challenge the value from the passed object
      return {challenge};       // return an object, rather than the thing itself
    }
  )(body);                      // execute the thing
  console.log(JSON.stringify(cha));
  response.json(cha);
});

server.get('/client/thing',(request,response)=>{
 response.json(thing);
});

server.put('/client/echo',(request,response)=>{
    response.json(request.body);
    let {textToSend = "Oh no - nothing"} = request.body;
    pingUser(textToSend);
   });

server.listen(server.get('port'),()=>{
    console.log('Express server started at port: ', server.get('port') );
});