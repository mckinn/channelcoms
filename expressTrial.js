//server.js
const express = require('express'),
    server = express(),
    bodyParser = require('body-parser'),
    {
        WebClient
    } = require('@slack/web-api'),
    mongoose = require('mongoose');


//note - this port is meaningless to Heroku, 
// but that does not seem to matter
const localPort = process.env.PORT || 9000;
const databaseUrl = process.env.MONDATABASE;
const appToken = process.env.SLACK_TOKEN;
const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_CLIENT_SECRET;

console.log("Database URL is: " + databaseUrl);

mongoose.connect(databaseUrl, {
    useNewUrlParser: true
});
const db = mongoose.connection;

console.log("Auth token is: " + appToken);
const web = new WebClient(appToken);

async function pingUser(textToSend = "hi there") {
    // Use the `auth.test` method to find information about the installing user
    const res = await web.auth.test();

    // Find your user id to know where to send messages to
    const userId = res.user_id
    console.log(userId);
    console.log(JSON.stringify(res));

    // Use the `chat.postMessage` method to send a message from this app
    await web.chat.postMessage({
        channel: "C9XG2PBTN", // General for now
        text: textToSend,
    });
    console.log(`Message ${textToSend} posted!`);
}

async function getCreds({
    code,
    state,
    clientId,
    clientSecret
}) {
    // TODO - think through this from a synchronicity perspextive 
    console.log("code = " + code);
    console.log("state = " + state);
    console.log("clientId = " + clientId);
    console.log("clientSecret = " + clientSecret);

    // Create a client instance just to make this single call, and use it for the exchange
    const result = await (new WebClient()).oauth.access({
        client_id: clientId,
        client_secret: clientSecret,
        code
    });
    console.log("result = ");
    console.log(JSON.stringify(result));
    // destructure the challenge property to an object
    const creds = (({
            access_token,
            scope,
            team_name,
            team_id,
            bot
        }) =>
        ({
            access_token,
            scope,
            team_name,
            team_id,
            bot
        }))(result);
    const cm = new credModel(creds);
    console.log("creds = ");
    console.log(JSON.stringify(creds));
    cm.save(function (err, cm) {
        if (err) return console.error(err);
    });
    console.log("back from save");

};

db.on('error', () => {
    console.error.bind(console, 'connection error:');
    // process.exit(1)
});

let credsSchema = {},
    credModel = {};

// TODO change the flow here to ensure that all of the initialization is done
// in one Promises chain to avoid issues with race conditions.

db.once('open', function () {
    // we're connected!
    console.log(`Database ${databaseUrl} connected`);
    // create schema (class) and model
    credsSchema = new mongoose.Schema({
        access_token: String,
        scope: String,
        team_name: String,
        team_id: String,
        bot: {
            bot_user_id: String,
            bot_access_token: String,
        }
    });
    // as schema change the model needs to be re-generated
    credModel = mongoose.model('UserCredentials', credsSchema);

});

server.use(bodyParser.json()); // parse JSON bodies

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

server.get('/', (request, response) => {
    console.log('Hello World');
    response.json({
        text: "Hello World"
    });
});

server.post('/slack', (request, response) => {
    console.log('validation challenge');
    const body = request.body;
    console.log(JSON.stringify(body));
    // const cha = (({challenge}) => ({challenge}))(body); // destructure the challenge property to an object
    const cha = ( // IFFE
        function ({
            challenge
        }) { // assign challenge the value from the passed object
            return {
                challenge
            }; // return an object, rather than the thing itself
        }
    )(body); // execute the thing
    console.log(JSON.stringify(cha));
    response.json(cha);
});

server.get('/slack/authAttempt', (request, response) => {
    console.log('authorization attempt');
    const code = request.query.code;
    const state = request.query.state;
    console.log("temporary auth = " + code + ", " + state);
    response.status(200);
    console.log("entering getCreds");
    getCreds({
        code,
        state,
        clientId,
        clientSecret
    });
    console.log("back from server.get/authAttempt");
});

server.put('/client/echo', (request, response) => {
    response.json(request.body);
    let {
        textToSend = "Oh no - nothing"
    } = request.body;
    pingUser(textToSend);
});

server.listen(server.get('port'), () => {
    console.log('Express server started at port: ', server.get('port'));
});