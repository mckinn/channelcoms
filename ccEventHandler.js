var request = require('request');

const hao_view = {
    token: 'replace',
    user_id: 'replace',
    view: {
        type: 'home',
        blocks: [{
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Click to Authenticate - APP - 12/31c'
            },
            accessory: {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'watch me'
                },
                url: 'https://slack.com/oauth/authorize?scope=channels:history,groups:history,im:history,mpim:history,bot&client_id=337577310114.861150093250&state=arglebargle&redirect_uri=https://channelcoms.herokuapp.com/slack/authAttempt'
            }
        }]
    }
};

const request_options = {
    url: 'https://slack.com/api/views.publish',
    auth: {
        bearer: 'bearerToken'
    },
    json: true,
    body: {},
};

const hao = function (
    event,
    token
) {
    console.log("*** in home_app_opened handler ***")
    console.log(JSON.stringify(event));
    console.log(event.type);
    hao_view.user_id = event.user;
    hao_view.token = token;
    console.log("VIEW: " + JSON.stringify(hao_view));
    request_options.auth.bearer = token;
    request_options.body = hao_view;
    console.log("OPTIONS: " + JSON.stringify(request_options));
    const requested = request.post(request_options, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
    });
    console.log("REQUESTED: " + JSON.stringify(requested));
}

const ccEvents = {
    app_home_opened: {
        name: "app_home_opened",
        handler: hao
    },
};

module.exports = ccEvents;