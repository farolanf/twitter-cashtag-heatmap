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
    });
})