// Global vars
cumulusClips.goToNextVideoDelay = 1000; // Milliseconds
cumulusClips.recordsPerPage = parseInt($('meta[name="recordsPerPage"]').attr('content'));;

$(document).ready(function(){

    // Toggles side menu
    $('body').on('click', '.menu-trigger', function(event){
        $('#menu').toggleClass('in');
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


    /**
     * Loads more of a category's videos into list on click
     *
     * @param {Number} data-category ID of category to retrieve videos for
     * @param {Number} data-total Total number of videos available for category
     */
    $('#categories').on('click', '.load-more', function(event) {

        var $loadMoreButton = $(this);
        var total = Number($loadMoreButton.data('total'));
        var url = cumulusClips.baseUrl + '/browse/';
        var data = {
            category_id: $loadMoreButton.data('category'),
            offset: $('#categories .video-list .video').length
        };

        var promises = [];
        promises.push(cumulusClips.apiRequest(url, data, {displayMessage: false, xhr: {type: 'get'}}));
        promises.push(cumulusClips.getTemplate('video'));

        // Fetch videos, template, and text
        $.when.apply($, promises).done(function(videosApiResponse, videoCardTemplate) {

            // Append video cards
            $.each(videosApiResponse.data, function(index, value){
                var videoCard = cumulusClips.buildVideoCard(videoCardTemplate, value, 'category=' + $loadMoreButton.data('slug'));
                $('#categories .video-list').append(videoCard);
            });

            // Remove load more button
            if ($('#categories .video-list .video').length === total) {
                $loadMoreButton.remove();
            }
        });

        event.preventDefault();
    });


    /**
     * Loads a given category into list
     *
     * @param {Number} data-id ID of category to load
     */
    $('#categories .dropdown a').on('click', function(event){

        var $categoryLink = $(this);
        $('#categories h2').text($categoryLink.text());
        $('#categories .dropdown .title').text($categoryLink.text());
        $('#categories .load-more, #categories .video-list, #categories .message').remove();

        var url = cumulusClips.baseUrl + '/browse/';
        var data = {
            category_id: $categoryLink.data('id')
        };

        var promises = [];
        promises.push(cumulusClips.apiRequest(url, data, {displayMessage: false, xhr: {type: 'get'}}));
        promises.push(cumulusClips.getTemplate('video'));
        promises.push(cumulusClips.getText('load_more'));
        promises.push(cumulusClips.getText('no_videos'));

        // Fetch videos, template, and text
        $.when.apply($, promises).done(function(videosApiResponse, videoCardTemplate) {

            if (!!videosApiResponse.data.length) {

                $('#categories .header').after('<div class="video-list"></div>');

                // Append video cards
                $.each(videosApiResponse.data, function(index, value){
                    var videoCard = cumulusClips.buildVideoCard(videoCardTemplate, value, 'category=' + $categoryLink.data('slug'));
                    $('#categories .video-list').append(videoCard);
                });

                // Add load more button if pagination is needed
                if (videosApiResponse.other.total > cumulusClips.recordsPerPage) {
                    var $loadMoreButton = $('<a '
                        + 'href=""'
                        + 'data-slug="' + $categoryLink.data('slug') + '"'
                        + 'data-category="' + $categoryLink.data('id') + '" '
                        + 'data-total="' + videosApiResponse.other.total + '" '
                        + 'class="btn btn-primary btn-lg btn-block load-more"'
                    + '>' + cumulusClips.text['load_more'] + '</a>');
                    $('#categories .video-list').after($loadMoreButton);
                }

            } else {
                $('#categories .header').after('<p class="message">' + cumulusClips.text['no_videos'] + '</p>');
            }
        });

        event.preventDefault();
    });


    /**
     * Expands search form on button click
     */
    $('.search-form .btn').on('click', function(event){

        var $header = $('header');
        var $searchField = $('header input');

        if (!$header.hasClass('focus')) {
            event.preventDefault();
            $header.addClass('focus');
            setTimeout(function(){
                $searchField.focus();
            },300);
        }
    });


    /**
     * Prevent clicks in form from causing it to minimize
     */
    $('.search-form').on('click', function(event){
        event.stopPropagation();
    });


    /**
     * Shrinks search form when clicking outside
     */
    $('body').on('click', function(event){

        var $header = $('header');
        var $searchField = $('header input');

        if ($header.hasClass('focus')) {
            $searchField.val('');
            $header.removeClass('focus');
        }
    });

}); // END jQuery


/**
 * Builds a video card from the video card template
 *
 * @param {String} videoCardTemplate The HTML template to build the video card
 * @param {Object} video The video which will be represented by the card
 * @param {String} query Additional query string to append to video card url
 * @return {jQuery} Returns jQuery object Representing the new video card
 */
cumulusClips.buildVideoCard = function (videoCardTemplate, video, query)
{
    var $videoCard = $(videoCardTemplate);
    var videoUrl = cumulusClips.getVideoUrl(video);

    var url = document.createElement("a");
    if (!!query) {
        url.href = videoUrl;
        url.search = query;
        videoUrl = url.href;
    }

    $videoCard.attr('href', videoUrl);
    $videoCard.find('img').attr('src', cumulusClips.baseUrl + '/cc-content/uploads/thumbs/' + video.filename + '.jpg');
    $videoCard.find('.title').text(video.title);

    return $videoCard;
};
