hao = function (
    event
) {
    console.log("*** in home_app_opened handler ***")
    console.log(JSON.stringify(event));
    console.log(event.type);
}

const ccEvents = {
    app_home_opened: {
        name: "app_home_opened",
        handler: hao
    },
};

module.exports = ccEvents;