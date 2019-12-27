var request = require('request');

const hao_view = {
    token: "xoxb-337577310114-882730030437-UOUesGMfdAxugsYBsWDqyOEt",
    user_id: "U9YJLMEAK",
    view: {
        type: "home",
        blocks: [{
            type: "section",
            text: {
                type: "mrkdwn",
                text: "Click to Authenticate - 12/25.v1"
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "watch me"
                },
                url: "https://slack.com/oauth/authorize?scope=commands,bot&client_id=337577310114.861150093250&state=arglebargle&redirect_uri=https://channelcoms.herokuapp.com/slack/authAttempt"
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
        request_options.auth.bearer = token;
        request_options.body = JSON.stringify(hao_view);
        console.log("OPTIONS: " + JSON.stringify(request_options);
            const requested = request.post(request_options); console.log("REQUESTED: " + JSON.stringify(requested));
        }

        const ccEvents = {
            app_home_opened: {
                name: "app_home_opened",
                handler: hao
            },
        };

        module.exports = ccEvents;