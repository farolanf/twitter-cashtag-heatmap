$(function() {
    var socket = io();
    socket.on('data', function(data) {
        var total = data.total;
        for (var key in data.symbols) {
            var val = data.symbols[key] / total;
            if (isNaN(val)) {
                val = 0;
            }
            
            $('li[data-symbol="' + key + '"]').each(function() {
                $(this).css('background-color', 'rgb(' + Math.round(val * 255) +',0,0)');
                $('.count', this).text(data.symbols[key]);
            });
        }
        $('#last-update').text(new Date().toTimeString());
        const symbols = [];
        const counts = [];
        _.each(data.symbols, function(val, key) {
            symbols.push(key);
            counts.push(val);
        });
        log(`[${counts}]\n`);
    });
})

function log(str) {
    console.log(str);
    $('.log').append(str);
    const el = $('.log')[0];
    el.scrollTop = el.scrollHeight;
}