hao = function ({
    event
}) {
    console.log("*** in home_app_opened handler ***")
    console.log(event.type);
    console.log(JSON.stringify(event));
}

const ccEvents = {
    app_home_opened: {
        name: "app_home_opened",
        handler: hao
    },
};

module.exports = ccEvents;