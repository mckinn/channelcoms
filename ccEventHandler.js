/* export {
    ccEvents,
}; */

module.exports = ccevents;

const ccEvents = {
    app_home_opened: {
        handler: hao
    },
};

function hao({
    body
}) {
    console.log("*** in home_app_opened handler ***")
    console.log(body.type);
    console.log(JSON.stringify(body));
}