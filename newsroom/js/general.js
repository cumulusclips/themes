// Global vars
var cumulusClips = {};
cumulusClips.baseUrl = $('meta[name="baseUrl"]').attr('content');
cumulusClips.themeUrl = $('meta[name="themeUrl"]').attr('content');
cumulusClips.loggedIn = $('meta[name="loggedIn"]').attr('content');
cumulusClips.breakPoints = {
    xs: 0,
    sm: 768,
    md: 992,
    lg: 1200
};
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


    // Toggle visibility of one block with another
    $('[data-toggle="toggle"]').on('click', function(event){
        var targetedBlock = $(this).attr('href');
        var parentContainer = $(this).attr('data-parent');
        $(this).parents(parentContainer).toggle();
        $(targetedBlock).toggle();
        event.preventDefault();
    });


    // Tabs Show/Hide Block
    $('.tabs a').click(function(event){
        // Skip for non show/hide tabs
        if ($(this).data('block') == 'undefined') return;

        // Hide all blocks except for targeted block
        var block = '#' + $(this).data('block');
        $('.tab_block').not(block).hide();

        // Toggle targeted block
        if ($(this).parent().hasClass('keepOne')) {
            $(block).show();
        } else {
            $(block).toggle({
                complete:function(){$(block).trigger('tabToggled');},
                duration:0
            });
        }
        event.preventDefault();
    });


    // Show/Hide Block
    $(document).on('click', '.showhide', function(event){
        // Retrieve and toggle targeted block
        var block = $(this).data('block');
        $('#'+block).toggle();

        // Prevent link click through
        if ($(this).is('a')) event.preventDefault();
    });


    // Attach confirm popup to confirm action links
    $(document).on('click', '.confirm', function(event) {
        // Code to execute once string is retrieved
        var location = $(this).attr('href')
        var callback = function(confirmString){
            var agree = confirm(confirmString);
            if (agree) window.location = location;
        }

        // Retrieve confirm string
        getText(callback, $(this).data('node'), $(this).data('replacements'));
        event.preventDefault();
    });


    // Disable button until associated checkbox is checked
    $.each($('.checkbox-disable'), function(index, value) {
        var $element = $(value);
        var checkboxFieldName = $element.data('checkbox');

        // Set button's initial state
        $element.prop('disabled', !$('input[name="' + checkboxFieldName + '"]:checked').length > 0);

        // Toggle buttons disabled state based on checkbox's checked status
        $(document).on('change', 'input[name="' + checkboxFieldName + '"]', function(event) {
            $element.prop('disabled', !$('input[name="' + checkboxFieldName + '"]:checked').length > 0);
        });
    });


    // Attach flag action to flag links / buttons
    $(document).on('click', '.flag', function(){
        var url = cumulusClips.baseUrl+'/actions/flag/';
        var data = {type: $(this).data('type'), id: $(this).data('id')};
        executeAction(url, data);
        window.scrollTo(0, 0);
        return false;
    });




    // Registration page actions
    if ($('.register').length > 0) {
        var delay;
        var validLengthReached = false;
        var minMessage = '';
        var checkAvailability = '';
        getText (function(data){minMessage = data;}, 'username_minimum');
        getText (function(data){checkAvailability = data;}, 'checking_availability');

        $('.register input[name="username"]').keyup(function() {
            var username = $(this).val();
            clearTimeout(delay);
            if (username.length >= 4) {
                validLengthReached = true;
                $('.register .help-block').html(checkAvailability + '&hellip;');
                delay = setTimeout(function(){

                    // Make call to search for username
                    $.ajax({
                        type: 'POST',
                        url: cumulusClips.baseUrl + '/actions/username/',
                        data: {username:username},
                        dataType: 'json',
                        success: function(response, textStatus, jqXHR) {
                            $('.register .help-block').text(response.message);
                            if (response.result === true) {
                                $('.register .has-feedback').addClass('has-success').removeClass('has-error');
                                $('.register .form-control-feedback').addClass('glyphicon-ok').removeClass('glyphicon-remove');
                            } else {
                                $('.register .has-feedback').addClass('has-error').removeClass('has-success');
                                $('.register .form-control-feedback').addClass('glyphicon-remove').removeClass('glyphicon-ok');
                            }
                        }
                    });

                }, 500);
            } else if (validLengthReached) {
                $('.register .has-feedback').addClass('has-error').removeClass('has-success');
                $('.register .form-control-feedback').addClass('glyphicon-remove').removeClass('glyphicon-ok');
                $('.register .help-block').text(minMessage);
            }
        });
    }


    // Play Video Page
    if ($('.play-layout').length) {

        getText(function(responseData, textStatus, jqXHR){cumulusClips.replyToText = responseData;}, 'reply_to');
        getText(function(responseData, textStatus, jqXHR){cumulusClips.replyText = responseData;}, 'reply');
        getText(function(responseData, textStatus, jqXHR){cumulusClips.reportAbuseText = responseData;}, 'report_abuse');
        getText(function(responseData, textStatus, jqXHR){cumulusClips.logInToPostText = responseData;}, 'error_comment_login');
        $.get(cumulusClips.themeUrl + '/blocks/comment.html', function(responseData, textStatus, jqXHR){cumulusClips.commentCardTemplate = responseData;});
        cumulusClips.lastCommentId = $('.comment-list .comment:last-child').data('comment');
        cumulusClips.commentCount = Number($('.comment-list').data('comment-count'));
        cumulusClips.loadMoreComments = (cumulusClips.commentCount > 5) ? true : false;
        cumulusClips.videoId = $('meta[name="videoId"]').attr('content');
        videojs.options.flash.swf = cumulusClips.themeUrl + '/images/video-js.swf';


        // Set video player height for extra small screens
        var videoPlayer = videojs("video-player").ready(function(){
            if (getBreakPoint() === 'xs') {
                resizePlayer($(window).width()-30);
            }
        });


        // Go to next video in playlist carousel when video is done playing
        videoPlayer.on('ended', function(event){
            var $next = $('.playlist .active').next();
            if ($next.length !== 0) {
                setTimeout(function(){
                    window.location = $next.find('.video').attr('href');
                }, cumulusClips.goToNextVideoDelay);
            }
        });


        // Update width & breakpoint on re-size
        $(window).on('resize', function(){
            cumulusClips.breakPoint = getBreakPoint();
            cumulusClips.width = $(window).width();
            if (cumulusClips.breakPoint === 'xs') {
                resizePlayer($(window).width()-30);
            }
        });


        // Submit 'comment form' and attach new comment to thread
        $('#comments').on('submit', 'form', function(){
            var url = cumulusClips.baseUrl+'/actions/comment/add/';
            var commentForm = $(this).parent();
            var callback = function(responseData) {

                if (responseData.result === true) {

                    // Reset comment form
                    if (commentForm.hasClass('comment-form-reply')) {
                        commentForm.remove();
                    } else {
                        resetCommentForm(commentForm);
                    }

                    // Append new comment if auto-approve comments is on
                    if (responseData.other.autoApprove === true) {
                        var commentCardElement = buildCommentCard(cumulusClips.commentCardTemplate, responseData.other.commentCard);
                        var commentCard = responseData.other.commentCard;

                        // Remove 'no comments' message if this is first comment
                        $('.no-comments').remove();

                        // Update comment count text
                        $('.comment-count').text(responseData.other.commentCount);
                        $('.comment-list').data('comment-count', responseData.other.commentCount);

                        // Append comment to list
                        if (commentCard.comment.parentId !== 0) {
                            var parentComment = $('[data-comment="' + commentCard.comment.parentId + '"]');

                            // Determine indent class
                            var indentClass;
                            if (parentComment.hasClass('comment-indent-3') || parentComment.hasClass('comment-indent-2')) {
                                indentClass = 'comment-indent-3';
                            } else if (parentComment.hasClass('comment-indent')) {
                                indentClass = 'comment-indent-2';
                            } else {
                                indentClass = 'comment-indent';
                            }

                            commentCardElement.addClass(indentClass);
                            parentComment.after(commentCardElement)
                        } else {
                            $('.comment-list').append(commentCardElement);
                        }
                    }
                }
                window.scrollTo(0, 0);
            }
            executeAction(url, $(this).serialize(), callback);
            return false;
        });


        // Handle reply to comment action
        $('#comments').on('click', '.reply', function(event){
            // Verify user is logged in
            if (cumulusClips.loggedIn === '1') {
                var commentForm = $('#comments form');
                var parentComment = $(this).parents('.comment');
                var replyForm = commentForm.clone();
                commentForm.find('input[name="parentCommentId"]').val(parentComment.data('comment'));
                commentForm.find('textarea').focus().val('');
            } else {
                displayMessage(false, cumulusClips.logInToPostText);
                window.scrollTo(0, 0);
            }
            event.preventDefault();
        });


        // Load more comments
        $('#comments .load-more button').on('click', function(event){

            var button = this;

            // Verify that more comments are available
            if (cumulusClips.loadMoreComments) {
                var data = {videoId:cumulusClips.videoId, lastCommentId:cumulusClips.lastCommentId, limit: 5};
                var loadingText = $(button).data('loading-text');
                var loadMoreText = $(button).text();
                $(button).text(loadingText);

                // Retrieve subsequent comments
                $.ajax({
                    type        : 'get',
                    data        : data,
                    dataType    : 'json',
                    url         : cumulusClips.baseUrl + '/actions/comments/get/',
                    success     : function(responseData, textStatus, jqXHR){
                        var lastCommentKey = responseData.other.commentCardList.length-1;
                        cumulusClips.lastCommentId = responseData.other.commentCardList[lastCommentKey].comment.commentId;

                        // Loop through comment data set, inject into comment template and append to list
                        $.each(responseData.other.commentCardList, function(key, commentCard){
                            $('.comment-list').find('div[data-comment="' + commentCard.comment.commentId + '"]').remove();
                            var commentCardElement = buildCommentCard(cumulusClips.commentCardTemplate, commentCard);

                            // Determine indentation
                            if (commentCard.comment.parentId !== 0) {
                                var parentComment = $('[data-comment="' + commentCard.comment.parentId + '"]');
                                // Determine indent class
                                var indentClass;
                                if (parentComment.hasClass('comment-indent-3') || parentComment.hasClass('comment-indent-2')) {
                                    indentClass = 'comment-indent-3';
                                } else if (parentComment.hasClass('comment-indent')) {
                                    indentClass = 'comment-indent-2';
                                } else {
                                    indentClass = 'comment-indent';
                                }
                                commentCardElement.addClass(indentClass);
                            }

                            // Append comment to list
                            $('.comment-list').append(commentCardElement);
                        });

                        // Hide load more button if no more comments are available
                        if ($('.comment-list .comment').length < cumulusClips.commentCount) {
                            cumulusClips.loadMoreComments = true;
                            $(button).text(loadMoreText);
                        } else {
                            cumulusClips.loadMoreComments = false;
                            $(button).parent().remove();
                        }
                    }
                });
            }
            event.preventDefault();
        });
    }   // END Play Video page

}); // END jQuery



/****************
GENERAL FUNCTIONS
****************/

/**
 * Retrieve localised string via AJAX
 * @param function callback Code to be executed once AJAX call to retrieve text is complete
 * @param string node Name of term node in language file to retrieve
 * @param json replacements (Optional) List of key/value replacements in JSON format
 * @return void Requested string, with any replacements made, is passed to callback
 * for any futher behaviour
 */
function getText(callback, node, replacements)
{
    $.ajax({
        type        : 'POST',
        url         : cumulusClips.baseUrl+'/language/get/',
        data        : {node:node, replacements:replacements},
        success     : callback
    });
}

/**
 * Send AJAX request to the action's server handler script
 * @param string url Location of the action's server handler script
 * @param json || string data The data to be passed to the server handler script
 * @param function callback (Optional) Code to be executed once AJAX call to handler script is complete
 * @return void Message is display according to server response. Any other
 * follow up behaviour is performed within the callback
 */
function executeAction(url, data, callback)
{
    $.ajax({
        type        : 'POST',
        data        : data,
        dataType    : 'json',
        url         : url,
        success     : function(responseData, textStatus, jqXHR){
            displayMessage(responseData.result, responseData.message);
            if (typeof callback != 'undefined') callback(responseData, textStatus, jqXHR);
        }
    });
}

/**
 * Display message sent from the server handler script for page actions
 * @param boolean result The result of the requested action (true = Success, false = Error)
 * @param string message The textual message for the result of the requested action
 * @return void Message block is displayed and styled accordingly with message.
 * If message block is already visible, then it is updated.
 */
function displayMessage(result, message)
{
    var cssClass = (result === true) ? 'alert-success' : 'alert-danger';
    var existingClass = ($('.alert').hasClass('alert-success')) ? 'alert-success' : 'alert-danger';
    $('.alert').removeClass('hidden');
    $('.alert').html(message);
    $('.alert').removeClass(existingClass);
    $('.alert').addClass(cssClass);
}

/**
 * Format number of bytes into human readable format
 * @param int bytes Total number of bytes
 * @param int precision Accuracy of final round
 * @return string Returns human readable formatted bytes
 */
function formatBytes(bytes, precision)
{
    var units = ['b', 'KB', 'MB', 'GB', 'TB'];
    bytes = Math.max(bytes, 0);
    var pwr = Math.floor((bytes ? Math.log(bytes) : 0) / Math.log(1024));
    pwr = Math.min(pwr, units.length - 1);
    bytes /= Math.pow(1024, pwr);
    return Math.round(bytes, precision) + units[pwr];
}

/**
 * Generates comment card HTML to be appended to comment list on play page
 * @param string commentCardTemplate The HTML template of the comment card
 * @param object commentCardData The CommentCard object for the comment being appended
 * @return object the jQuery object for the newly filled comment card element
 */
function buildCommentCard(commentCardTemplate, commentCardData)
{
    var commentCard = $(commentCardTemplate);
    commentCard.attr('data-comment', commentCardData.comment.commentId);

    // Set comment avatar
    if (commentCardData.avatar !== null) {
        commentCard.find('img').attr('src', commentCardData.avatar);
    } else {
        commentCard.find('img').attr('src', cumulusClips.themeUrl + '/images/avatar.png');
    }

    // Set comment author
    commentCard.find('.comment-author')
        .text(commentCardData.author.username);

    // Set comment date
    var commentDate = new Date(commentCardData.comment.dateCreated.split(' ')[0]);
    monthPadding = (String(commentDate.getMonth()+1).length === 1) ? '0' : '';
    datePadding = (String(commentDate.getDate()).length === 1) ? '0' : '';
    commentCard.find('.comment-date').text(monthPadding + (commentDate.getMonth()+1) + '/' + datePadding + commentDate.getDate() + '/' + commentDate.getFullYear());

    // Set comment action links
    commentCard.find('.reply').text(cumulusClips.replyText);
    commentCard.find('.flag')
        .text(cumulusClips.reportAbuseText)
        .attr('data-id', commentCardData.comment.commentId);

    // Set reply to text if apl.
    if (commentCardData.comment.parentId !== 0) {
        commentCard.find('.comment-reply').text(cumulusClips.replyToText + ' ');
        // Determine parent comment author's text
        var parentCommentAuthorText;
        parentCommentAuthorText = $('<a>')
            .attr('href', cumulusClips.baseUrl + '/members/' + commentCardData.parentAuthor.username)
            .text(commentCardData.parentAuthor.username);
        commentCard.find('.comment-reply').append(parentCommentAuthorText);
    } else {
        commentCard.find('.comment-reply').remove();
    }

    // Set comment text
    commentCardData.comment.comments = commentCardData.comment.comments.replace(/</g, '&lt;');
    commentCardData.comment.comments = commentCardData.comment.comments.replace(/>/g, '&gt;');
    commentCard.find('.comment-text').html(commentCardData.comment.comments.replace(/\r\n|\n|\r/g, '<br>'));

    return commentCard;
}

/**
 * Builds a video card from the video card template
 * @param string videoCardTemplate The HTML template to build the video card
 * @param object video The video which will be represented by the card
 * @return object Returns jQuery object Representing the new video card
 */
function buildVideoCard(videoCardTemplate, video)
{
    var videoCard = $(videoCardTemplate);
    var url = getVideoUrl(video);
    videoCard.find('img').attr('src', cumulusClips.thumbUrl + '/' + video.filename + '.jpg');
    videoCard.find('.glyphicon-time').after(video.duration);
    videoCard.find('.glyphicon-user').after(video.username);
    videoCard.find('a').attr('title', video.title).attr('href', url);
    videoCard.find('.video-title a').text(video.title);
    return videoCard;
}

/**
 * Retrieve the full URL to a video
 * @param object video The video whose URL is being retrieved
 * @return string Returns the complete URL to given video
 */
function getVideoUrl(video)
{
    var url = cumulusClips.baseUrl;
    url += '/videos/' + video.videoId + '/';
    url += generateSlug(video.title) + '/';
    return url;
}

/**
 * Generate a URL friendly slug from an input string
 * @param string stringToConvert The string to convert into a URL slug
 * @return string Returns a string with non alphanum characters converted to hyphens.
 */
function generateSlug(stringToConvert)
{
    var slug = stringToConvert.replace(/[^a-z0-9]+/ig, '-');
    slug = slug.replace(/^-|-$/g, '').toLowerCase();
    return slug;
}

/**
 * Builds a playlist card from the playlist card template
 * @param string playlistCardTemplate The HTML template to build the playlist card
 * @param object playlist The playlist which will be represented by the card
 * @return object Returns jQuery object Representing the new playlist card
 */
function buildPlaylistCard(playlistCardTemplate, playlist)
{
    var playlistCard = $(playlistCardTemplate);
    if (playlist.entries.length === 0) {
        playlistCard.addClass('playlist-empty');
        playlistCard.find('a').remove();
        playlistCard.find('img').attr('src', cumulusClips.themeUrl + '/images/playlist_placeholder.png');
        playlistCard.find('.title').text(playlist.name);
    } else {
        playlistCard.find('.watch-all').append(cumulusClips.watchAllText);
        playlistCard.find('.thumb').remove();
        playlistCard.find('img').attr('src', cumulusClips.thumbUrl + '/' + playlist.entries[0].video.filename + '.jpg');
        playlistCard.find('.title a').text(playlist.name);
        playlistCard.find('a')
            .attr('href', getVideoUrl(playlist.entries[0].video) + '?playlist=' + playlist.playlistId)
            .attr('title', playlist.name);
    }
    playlistCard.find('.video-count').html(playlist.entries.length + '<br>' + cumulusClips.videosText);
    return playlistCard;
}

function getBreakPoint()
{
    var screenWidth = $(window).width();
    var currentBreakPoint;
    for (var breakPoint in cumulusClips.breakPoints) {
        if (screenWidth >= cumulusClips.breakPoints[breakPoint]) {
            currentBreakPoint = breakPoint;
        } else {
            break;
        }
    }
    return currentBreakPoint;
}

function resizePlayer(width)
{
    var ratio = +(16/9).toFixed(2);
    var height = +(width/ratio).toFixed();
    $('.video-player-container, .video-js, video')
        .width(width)
        .height(height);
}