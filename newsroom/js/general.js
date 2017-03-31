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


    // Play Video Page
    if ($('.play-layout').length) {

        // Set video player height for extra small screens
        var videoPlayer = videojs("video-player")

        // Go to next video in playlist carousel when video is done playing
        videoPlayer.on('ended', function(event){
            var $next = $('.playlist .active').next();
            if ($next.length !== 0) {
                setTimeout(function(){
                    window.location = $next.find('.video').attr('href');
                }, cumulusClips.goToNextVideoDelay);
            }
        });

    }   // END Play Video page

}); // END jQuery
