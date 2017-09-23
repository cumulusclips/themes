// Global vars
cumulusClips.goToNextVideoDelay = 1000; // Milliseconds

$(document).ready(function(){

    $('.nav').on('click', '.mobile-menu-trigger', function(event){
        $('#mobile-menu').toggleClass('in');
        $('#overlay').toggleClass('in');
        event.preventDefault();
    });

    $('.nav').on('click', '.mobile-search-trigger', function(event){
        $('#mobile-search').toggleClass('in');
        $('#overlay').toggleClass('in');
        event.preventDefault();
    });


    // Player layout
    if ($('#video-player').length) {

        // Go to next video in playlist carousel when video is done playing
        var videoPlayer = videojs("video-player");
        videoPlayer.on('ended', function(event){
            var $next = $('.playlist .active').next();
            if ($next.length !== 0) {
                setTimeout(function(){
                    window.location = $next.find('.video').attr('href');
                }, cumulusClips.goToNextVideoDelay);
            }
        });
    }

}); // END jQuery
