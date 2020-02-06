//server.js
const express = require('express'),
    server = express(),
    bodyParser = require('body-parser'),
    {
        WebClient
    } = require('@slack/web-api'),
    mongoose = require('mongoose'),
    ccEvents = require('./ccEventHandler');

//note - this port is meaningless to Heroku, 
// but that does not seem to matter
const localPort = process.env.PORT || 9000;
const databaseUrl = process.env.MONDATABASE;
const userToken = process.env.SLACK_USER_TOKEN;
const botToken = process.env.SLACK_BOT_TOKEN;
const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_CLIENT_SECRET;

console.log("Database URL is: " + databaseUrl);
if (ccEvents) {
    JSON.stringify(ccEvents)
};

mongoose.connect(databaseUrl, {
    useNewUrlParser: true
});
const db = mongoose.connection;

console.log("Auth token is: " + userToken);
const web = new WebClient(userToken);

// send a message from the provisioned user to the general channel
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
        user_id: String,
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

//Adding routes for direct web access

server.get('/', (request, response) => {
    console.log('Hello World');
    response.json({
        text: "Hello World"
    });
});

// General event handler
// managed in slack as an event subscription...
// https://api.slack.com/apps/ARB4E2R7C/event-subscriptions?


server.post('/slack', (request, response) => {
    console.log('*** event happened ***');
    const body = request.body;
    // console.log("COMPLETE BODY: " + JSON.stringify(body));
    response.sendStatus(200);

    if (body.type == "url_verification") {
        console.log(body.type);
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
    } else {
        console.log(`Main event type = ${body.type}`);
        if (body.type == "event_callback") {
            if (typeof ccEvents[body.event.type] !== 'undefined') {
                ccHandler = ccEvents[body.event.type].handler(body.event, botToken);
            } else {
                console.log("NEW EVENT TYPE:" + body.event.type);
                console.log("NEW EVENT:" + JSON.stringify(body.event));
            }
        }
    }
});

// This is configured as the redirect URL that is passed to SLACK to 
// allow the addition of ann "add to slack" button.  This is part of the
// home page button sequence, but not part of the standard message
// handling stuff.

// configured in https://api.slack.com/apps/ARB4E2R7C/oauth?success=1

server.get('/slack/authAttempt', (request, response) => {

    console.log('authorization attempt' + JSON.stringify(request.url));
    const code = request.query.code;
    const state = request.query.state;
    console.log("temporary auth = " + code);
    console.log("state = " + state);

    response.sendStatus(200);

    let result = {};

    (async () => {
        // Create a client instance just to make this single call, and use it for the exchange
        result = await (new WebClient()).oauth.access({
            client_id: clientId,
            client_secret: clientSecret,
            code
        });
        console.log("IN oauth.access: " + JSON.stringify(result));


        console.log("completed oauth.access await.");
        console.log("Outside oauth.access: " + JSON.stringify(result));

        const creds = (({
                access_token,
                user_id,
                scope,
                team_name,
                team_id,
                bot
            }) =>
            ({
                access_token,
                user_id,
                scope,
                team_name,
                team_id,
                bot
            }))(result);
        console.log("creds = ");
        console.log(JSON.stringify(creds));

        // Save the new credentials in the database
        const cm = new credModel(creds);
        await cm.save(function (err, cm) {
            if (err) console.error(err);
            console.log("db save complete - in save");
        });
        console.log("db save complete - outside save");
    })();

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