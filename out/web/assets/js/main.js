$(document).ready(function() {

    var stats = {};

    $.getJSON("stats.json", function (data) {
        $.event.trigger({
            type: 'data.ready',
            message: data
        });
    });

});
