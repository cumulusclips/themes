// Global vars
var cumulusClips = window.cumulusClips || {text: {}, templates: {}};
cumulusClips.baseUrl = $('meta[name="baseUrl"]').attr('content');
cumulusClips.themeUrl = $('meta[name="themeUrl"]').attr('content');
cumulusClips.loggedIn = $('meta[name="loggedIn"]').attr('content');
cumulusClips.watchLaterPlaylistId = $('meta[name="watchLaterPlaylistId"]').attr('content');

$(function(){

    // Search Auto-Complete
    $('.search-input').autocomplete({
        source: cumulusClips.baseUrl + '/search/suggest/',
        appendTo: '.search-form .autocomplete-container'
    });


    // Init Bootstrap tooltip
    $('[data-toggle="tooltip"]').tooltip();


    /**
     * Toggles display of multiple blocks in a group, i.e. Bootstrap Accordion
     *
     * @param {String} href ID of block to be displayed
     * @param {String} data-parent (optional) Parent container of all blocks in group,
     * if omitted then .collapse-group is used
     */
    $(document).on('click', '[data-toggle="blocks"]', function(event) {

        var parentSelector = $(this).data('parent') || $(this).parents('.collapse-group');
        var target = $(this).attr('href');

        $(parentSelector).find('.collapse.in').removeClass('in');
        $(target).addClass('in');

        event.preventDefault();
    });


    /**
     * Display confirmation modal on click
     *
     * @param {String} href Url to direct to after confirmation. If button, then parent form is submitted
     * @param {String} data-text Text to use in modal body
     * @param {String} data-button-type (optional) Default btn-primary, Bootstrap button class for confirm button
     */
    $(document).on('click', '[data-toggle="confirm-modal"]', function(event) {

        // Preserve button reference
        var self = this;
        var confirmEvent = event;

        // Retrieve text and template
        var promises = [];
        promises.push(cumulusClips.getTemplate('confirm-modal'));
        promises.push(cumulusClips.getText('cancel'));
        promises.push(cumulusClips.getText('confirm_button'));
        promises.push(cumulusClips.getText('confirm_header'));

        // Proceed with modal once text is obtained
        $.when.apply($, promises).done(function(confirmModalTemplate) {

            var text = $(self).data('text');
            var buttonType = $(self).data('button-type') || 'btn-primary';

            var $modal = $(confirmModalTemplate);

            // Inject text into modal
            $modal.find('.btn-confirm')
                .addClass(buttonType)
                .text(cumulusClips.text['confirm_button']);

            $modal.find('.modal-title').text(cumulusClips.text['confirm_header']);
            $modal.find('.modal-body p').text(text);
            $modal.find('.btn-cancel').text(cumulusClips.text['cancel']);

            // Attach and display modal
            $('body').append($modal);
            $('#confirm-modal').modal('show');

            // Listen for confirm click and navigate to location
            $(document).on('click', '#confirm-modal .btn-confirm', function(event) {

                // Determine whether submit form or redirect
                if (confirmEvent.target.nodeName === 'A') {
                    window.location = $(self).attr('href');
                } else {
                    $(self).parents('form').submit();
                }

            });
        });

        event.preventDefault();
    });


    /**
     * Loads more user's videos into list on click
     *
     * @param {Number} data-user User ID of user whose video to retrieve
     * @param {Number} data-limit Number of videos to retrieve
     * @param {Number} data-total Total number of videos available for user
     */
    $('#member-videos .load-more-btn').on('click', function(event) {

        var $loadMoreButton = $(this);
        var total = Number($loadMoreButton.data('total'));
        var url = cumulusClips.baseUrl + '/members/videos/';
        var data = {
            userId: $loadMoreButton.data('user'),
            start: $('.video-list .video').length,
            limit: $loadMoreButton.data('limit')
        };

        var promises = [];
        promises.push(cumulusClips.apiRequest(url, data, {displayMessage: false, xhr: {type: 'get'}}));
        promises.push(cumulusClips.getTemplate('video'));
        promises.push(cumulusClips.getText('watch_later'));

        // Fetch videos, template, and text
        $.when.apply($, promises).done(function(videosApiResponse, videoCardTemplate) {

            // Append video cards
            $.each(videosApiResponse.other.videoList, function(index, value){
                var videoCard = cumulusClips.buildVideoCard(videoCardTemplate, value);
                $('.video-list').append(videoCard);
            });

            // Remove load more button
            if ($('.video-list .video').length === total) {
                $loadMoreButton.parents('.load-more').remove();
            }
        });

        event.preventDefault();
    });


    /**
     * Loads more user's playlists into list on click
     *
     * @param {Number} data-user User ID of user whose playlists to retrieve
     * @param {Number} data-limit Number of playlists to retrieve
     * @param {Number} data-total Total number of playlists available for user
     */
    $('#member-playlists .load-more-btn').on('click', function(event) {

        var $loadMoreButton = $(this);
        var playlistList = [];
        var total = Number($loadMoreButton.data('total'));
        var url = cumulusClips.baseUrl + '/members/playlists/';
        var data = {
            userId: $loadMoreButton.data('user'),
            start: $('.playlist-list .playlist').length,
            limit: $loadMoreButton.data('limit')
        };

        var promises = [];
        promises.push(cumulusClips.apiRequest(url, data, {displayMessage: false, xhr: {type: 'get'}}));
        promises.push(cumulusClips.getTemplate('playlist'));
        promises.push(cumulusClips.getText('watch_all'));
        promises.push(cumulusClips.getText('videos'));

        // Fetch playlists, template, and text
        $.when.apply($, promises).done(function(playlistApiResponse, playlistCardTemplate) {

            playlistList = playlistApiResponse.data.playlistList;

            // Determine if playlista have videos
            var thumbnailVideos = [];
            $.each(playlistApiResponse.data.playlistList, function(index, playlist){
                if (playlist.entries.length > 0 && thumbnailVideos.indexOf(playlist.entries[0].videoId) === -1) {
                    thumbnailVideos.push(playlist.entries[0].videoId);
                }
            });

            var appendDeferred = $.Deferred();

            // Determine if thumbnails are needed
            if (thumbnailVideos.length) {

                var thumbUrl = cumulusClips.baseUrl + '/api/video/list/';
                var thumbData = {list: thumbnailVideos.join(',')};
                var thumbOptions = {displayMessage: false, xhr: {type: 'get'}};

                // Fetch first video in each playlist
                cumulusClips.apiRequest(thumbUrl, thumbData, thumbOptions)
                    .done(function(videosApiResponse) {

                        // Cycle through each playlist to decorate it's entries
                        $.each(playlistList, function(index, playlist){

                            // Decorate playlist's entries property with it's video object
                            $.each(videosApiResponse.data, function(index, video){
                                if (playlist.entries.length > 0 && playlist.entries[0].videoId === video.videoId) {
                                    playlist.entries[0].video = video;
                                }
                            });
                        });

                        appendDeferred.resolve(true);
                    });

            } else {
                appendDeferred.resolve(true);
            }

            // Append playlist cards
            appendDeferred.done(function() {

                $.each(playlistList, function(index, playlist) {

                    // Append playlist cards to list
                    var playlistCard = cumulusClips.buildPlaylistCard(playlistCardTemplate, playlist);
                    $('.playlist-list').append(playlistCard);

                    // Remove load more button
                    if ($('.playlist-list .playlist').length === total) {
                        $loadMoreButton.parents('.load-more').remove();
                    }
                });

            });
        });

        event.preventDefault();
    });


    /**
     * Disable button until associated checkbox is checked
     *
     * @param {String} data-checkbox Input name of checkbox group that must be checked to enable button
     */
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


    /*
     * Flags content
     *
     * @param {String} data-type Type of item being flagged
     * @param {Number} data-id Id of item being flagged
     */
    $(document).on('click', '.flag', function(event) {

        var url = cumulusClips.baseUrl + '/actions/flag/';
        var data = {type: $(this).data('type'), id: $(this).data('id')};

        cumulusClips.apiRequest(url, data);
        window.scrollTo(0, 0);

        event.preventDefault();
    });


    // Add to Watch Later actions
    $('.video-list').on('click', '.watch-later', function(event) {

        var video = $(this).parents('.video');
        var url = cumulusClips.baseUrl + '/actions/playlist/';
        var data = {
            action: 'add',
            shortText: true,
            video_id: $(this).data('video'),
            playlist_id: $(this).data('playlist')
        };

        // Make call to API to attempt to add video to playlist
        var apiRequestPromise = cumulusClips.apiRequest(url, data, {displayMessage: false});

        apiRequest.done(function(apiResponse) {

            // Append message to video thumbnail
            var resultMessage = $('<div></div>')
                .addClass('alert')
                .html('<p>' + responseData.message + '</p>');
            video.find('.thumbnail').append(resultMessage);

            if (apiResponse.status) {

                // Style message according to add results
                resultMessage.addClass('alert-success');

            } else {

                // Add error highlight in case of duplicate error
                if (apiResponse.httpStatus === 409) {
                    resultMessage.addClass('alert-danger');
                }
            }

            // FadeIn message, pause, then fadeOut and remove
            resultMessage.fadeIn(function(){
                setTimeout(function(){
                    resultMessage.fadeOut(function(){resultMessage.remove();});
                }, 2000);
            });
        });

        event.preventDefault();
    });


    // Attach Subscribe & Unsubscribe action to buttons
    $(document).on('click', '.subscribe', function(event) {
        var subscribeType = $(this).data('type');
        var url = cumulusClips.baseUrl + '/actions/subscribe/';
        var data = {type: subscribeType, user: $(this).data('user')};
        var subscribeButton = $(this);

        // Perform subscription change,
        cumulusClips.apiRequest(url, data).done(function(apiResponse) {

            // Update button if the action (subscribe / unsubscribe) was successful
            if (apiResponse.result === true) {
                subscribeButton.text(apiResponse.other);
                if (subscribeType == 'subscribe') {
                    subscribeButton.data('type','unsubscribe');
                } else if (subscribeType == 'unsubscribe') {
                    subscribeButton.data('type','subscribe');
                }
            }

            window.scrollTo(0, 0);
        });

        event.preventDefault();
    });


    // Regenerate Private URL
    $('.private-url').on('click', function(event){

        var $textElement = $('#' + $(this).attr('href'));
        var $inputField = $('[name="' + $(this).data('field') + '"]');

        $.ajax({
            type    : 'get',
            url     : cumulusClips.baseUrl + '/private/get/',
            success : function(responseData, textStatus, jqXHR) {
                $textElement.text(responseData);
                $inputField.val(responseData);
            }
        });

        event.preventDefault();
    });


    // Cancel out of attachment form
    $('#video-attachments').on('click', '.cancel', function(event){
        $('#video-attachments .add').show();
        $(this).parents('.attachment-form').addClass('hidden');
        event.preventDefault();
    });


    // Discard attachment
    $('#video-attachments').on('click', '.attachment .remove', function(event){

        var $attachment = $(this).parents('.attachment');

        // Update existing attachment list and set corresponding link as "unselected"
        if ($attachment.hasClass('existing-file')) {
            var fileId = $attachment.attr('id').replace(/^existing\-file\-/, '');
            $('#select-existing-file-' + fileId).removeClass('selected');
        }

        $attachment.remove();
        event.preventDefault();
    });


    // Display upload new attachments form
    $('#video-attachments .new').on('click', function(event){
        $('#video-attachments .add').hide();
        $('#video-attachments .attachment-form-upload').removeClass('hidden');
        event.preventDefault();
    });


    // Append uploaded attachment
    $('#video-attachments').on('uploadcomplete', '.uploader', function(event){

        $uploadWidget = getUploadWidget(this);

        // Build attachment widget
        var name = $uploadWidget.find('.name').val();
        var size = $uploadWidget.find('.size').val();
        var temp = $uploadWidget.find('.temp').val();
        var index = $('#video-attachments .attachments .attachment').length;
        var $attachment = cumulusClips.buildAttachmentCard(index, name, size, temp);

        // Append attachment
        $('#video-attachments .attachments').append($attachment);

        // Reset upload form
        resetProgress($uploadWidget);
    });


    // Display existing attachments form
    $('#video-attachments .existing').on('click', function(event){
        $('#video-attachments .add').hide();
        $('.attachment-form-existing').removeClass('hidden');

        event.preventDefault();
    });


    // Select from existing attachments
    $('#video-attachments .attachment-form-existing .list-group-item').on('click', function(event){

        event.preventDefault();

        var fileId = $(this).data('file');

        // Remove attachment if "unselecting" file
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $('#existing-file-' + fileId).remove();
            return;
        }

        // Build attachment widget
        var name = $(this).attr('title');
        var size = $(this).data('size');
        var index = $('#video-attachments .attachments .attachment').length;
        var $attachment = cumulusClips.buildAttachmentCard(index, name, size, fileId);

        // Mark as selected
        $(this).addClass('active');

        // Append attachment
        $('#video-attachments .attachments').append($attachment);
    });




    // Watch Video Page
    if ($('.watch').length > 0) {

        // Init Scrollbar widget
        $scrollbarContainer = $('.scrollbar-outer');
        if (!!$scrollbarContainer.length) {
            $scrollbarContainer.scrollbar();
        }


        // Scroll playlist to active video if viewing a playlist on watch page
        var activePlaylistVideo = $('#playlist .video-list .active');
        $('#playlist .scrollbar-outer').scrollTop(activePlaylistVideo.index()*76);


        // Make entire video tile clickable on watch page playlist widget
        $('#playlist .video-small').on('click', function(event){
            if (event.target.nodeName !== 'A') {
                location = $(this).find('div > a').attr('href');
            }
        });


        // Add/remove video to playlist on watch page
        $('#add-to-playlist').on('click', 'li', function(event){

            var self = this;
            var $link = $(this).find('a');
            var action = $(this).hasClass('added') ? 'remove' : 'add';
            var videoId = $link.data('video');
            var url = cumulusClips.baseUrl + '/actions/playlist/';
            var data = {
                action: action,
                video_id: videoId,
                playlist_id: $link.data('playlist_id')
            };

            // Make API request
            cumulusClips.apiRequest(url, data).done(function(apiResponse) {

                // Verify request was successful
                if (apiResponse.result) {
                    var nameAndCount = $link.text().replace(/\([0-9]+\)/, '(' + apiResponse.other.count + ')');
                    $link.text(nameAndCount);
                    $(self).toggleClass('added');
                }

                window.scrollTo(0, 0);
            });

            event.preventDefault();
        });


        // Create new playlist on watch page
        $('#add-to-playlist form').submit(function(event) {

            var createPlaylistForm = $(this);
            var data = $(this).serialize();
            var url = cumulusClips.baseUrl + '/actions/playlist/';

            cumulusClips.apiRequest(url, data).done(function(apiResponse) {

                // Append new playlist to list of playlists
                $('#add-to-playlist ul').append('<li><a data-playlist_id="'
                    + apiResponse.other.playlistId
                    + '" class="added" href="">'
                    + apiResponse.other.name
                    + ' (' + apiResponse.other.count + ')</a></li>');

                // Reset form
                createPlaylistForm.find('input[type="text"]').val('');
                createPlaylistForm.find('select').val('public');

                window.scrollTo(0, 0);
            });

            event.preventDefault();
        });


        // Attach rating action to like & dislike links
        $('.rating').on('click', function(event) {

            var videoId = $(this).data('video');
            var rating = $(this).data('rating');


            var url = cumulusClips.baseUrl+'/actions/rate/';
            var data = {video_id: videoId, rating: rating};

            // Make API request
            cumulusClips.apiRequest(url, data).done(function(apiResponse) {

                // Verify request was successful
                if (apiResponse.result === true) {
                    $('.actions .left .like').text(apiResponse.other.likes);
                    $('.actions .left .dislike').text(apiResponse.other.dislikes);
                }

                window.scrollTo(0, 0);
            });

            event.preventDefault();
        });


        // Handle reply to comment action
        $('#comments').on('click', '.comment-action .reply', function(event) {

            var $commentForm = $('#comments .comment-form-main');

            // Verify user is logged in
            if (cumulusClips.loggedIn === '1') {

                // Reset/Remove all other comment forms
                cumulusClips.resetCommentForm($commentForm);
                $('.comment-form-reply').remove();

                // Clone main comment form
                var parentComment = $(this).parents('.comment');
                var replyForm = $commentForm.clone();

                // Convert main form clone into reply form
                replyForm.addClass('comment-form-reply');
                replyForm.removeClass('comment-form-main');
                replyForm.removeClass('collapsed');
                replyForm.find('input[name="parentCommentId"]').val(parentComment.data('comment'));

                // Attach and focus on new form
                parentComment.after(replyForm);
                replyForm.find('textarea').focus().val('');

            } else {

                // Display auth error message
                cumulusClips.getText('error_comment_login').done(function(text) {
                    cumulusClips.displayMessage(false, text);
                    window.scrollTo(0, 0);
                });
            }

            event.preventDefault();
        });


        // Expand the general comment form when focused on
        $('#comments .comment-form-main').focusin(function() {

            var $commentForm = $(this);

            if ($commentForm.hasClass('collapsed')) {

                $('.comment-form-reply').remove();

                $commentForm.removeClass('collapsed');
                $commentForm.find('textarea').val('');

                setTimeout(function(){
                    $commentForm.find('.collapsed-hide textarea').blur().focus();
                },100);
            }
        });


        // Handle user cancelling comment form
        $('#comments').on('click', '.comment-form .cancel', function(event) {

            // Remove if reply form, collapse otherwise
            var $commentForm = $(this).parents('.comment-form');
            if ($commentForm.hasClass('comment-form-reply')) {
                $commentForm.remove();
            } else {
                $commentForm.addClass('collapsed');
            }

            event.preventDefault();
        });


        // Submit 'comment form' and attach new comment to thread
        $('#comments').on('submit', 'form', function() {

            var promises = [];
            var url = cumulusClips.baseUrl + '/actions/comment/add/';
            var commentFormContainer = $(this).parent();

            // Submit new comment
            promises.push(cumulusClips.apiRequest(url, $(this).serialize()));

            // Retrieve comment card template
            promises.push(cumulusClips.getTemplate('comment'));

            // Retrieve text for comment card
            promises.push(cumulusClips.getText('reply_to'));
            promises.push(cumulusClips.getText('reply'));
            promises.push(cumulusClips.getText('report_abuse'));

            // Wait for text entries and comment post to be resolved
            $.when.apply($, promises)
                .done(function(commentApiResponse, commentCardTemplate) {

                    // Verify comment was created successfully
                    if (commentApiResponse.result === true) {

                        // Reset comment form
                        if (commentFormContainer.hasClass('comment-form-reply')) {
                            commentFormContainer.remove();
                        } else {
                            cumulusClips.resetCommentForm(commentFormContainer);
                        }

                        // Append new comment if auto-approve comments is on
                        if (commentApiResponse.other.autoApprove === true) {

                            var commentCardElement = cumulusClips.buildCommentCard(
                                commentCardTemplate,
                                commentApiResponse.other.commentCard
                            );
                            var commentCard = commentApiResponse.other.commentCard;

                            // Remove 'no comments' message if this is first comment
                            $('.no-comments').remove();

                            // Update comment count text
                            $('.comment-total').text(commentApiResponse.other.commentCount);
                            $('#comments .load-more-btn').data('total', commentApiResponse.other.commentCount)

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
                });

            event.preventDefault();
        });


        /**
         * Loads more comments for video and appends to list
         *
         * @param {Number} data-video ID of video comments are being loaded for
         * @param {String} data-loading-text Text to display while comments are being retrieved
         * @param {Number} data-total Total number of comments for video
         * @param {Number} data-comment (on .comment) ID of comment
         */
        $('#comments .load-more-btn').on('click', function(event) {

            var $loadMoreButton = $(this);
            var lastCommentId = $('.comment-list .comment:last-child').data('comment');
            var commentCount = parseInt($loadMoreButton.data('total'));
            var visibleCommentCount = $('.comment-list .comment').length;
            var loadMoreComments = commentCount > visibleCommentCount ? true : false;

            // Verify that more comments are available
            if (loadMoreComments) {

                var promises = [];
                var url = cumulusClips.baseUrl + '/actions/comments/get/';
                var data = {
                    videoId         : $loadMoreButton.data('video'),
                    lastCommentId   : lastCommentId,
                    limit           : 5
                };
                var loadingText = $loadMoreButton.data('loading-text');
                var loadMoreText = $loadMoreButton.text();
                $loadMoreButton.text(loadingText);

                // Retrieve comment card template
                promises.push(cumulusClips.getTemplate('comment'));

                // Retrieve subsequent comments
                promises.push(cumulusClips.apiRequest(url, data, {displayMessage: false, xhr: {type: 'get'}}));

                // Retrieve text for comment card
                promises.push(cumulusClips.getText('reply_to'));
                promises.push(cumulusClips.getText('reply'));
                promises.push(cumulusClips.getText('report_abuse'));

                // Resolve promises together
                $.when.apply($, promises)
                    .done(function(commentCardTemplate, commentsApiResponse) {

                        var lastCommentKey = commentsApiResponse.other.commentCardList.length-1;
                        lastCommentId = commentsApiResponse.other.commentCardList[lastCommentKey].comment.commentId;

                        // Loop through comment data set, inject into comment template and append to list
                        $.each(commentsApiResponse.other.commentCardList, function(key, commentCard){

                            $('.comment-list').find('div[data-comment="' + commentCard.comment.commentId + '"]').remove();
                            var commentCardElement = cumulusClips.buildCommentCard(
                                commentCardTemplate,
                                commentCard
                            );

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
                        if ($('.comment-list .comment').length < commentCount) {
                            $loadMoreButton.text(loadMoreText);
                        } else {
                            $('#comments .load-more').remove();
                        }
                    });
            }

            event.preventDefault();
        });
    }




    // Registration page actions
    if ($('.register').length > 0) {

        cumulusClips.getText('username_minimum');
        cumulusClips.getText('checking_availability');

        var delay;
        var validLengthReachedOnce = false;

        $('.register input[name="username"]').keyup(function() {

            var username = $(this).val();
            clearTimeout(delay);

            if (username.length >= 4) {

                validLengthReachedOnce = true;
                $('.register .help-block').html(cumulusClips.text['checking_availability'] + '&hellip;');

                delay = setTimeout(function(){

                    var url = cumulusClips.baseUrl + '/actions/username/';
                    var data = {username:username};

                    // Make API request to search for username
                    cumulusClips.apiRequest(url, data).done(function(apiResponse) {

                        $('.register .help-block').text(apiResponse.message);
                        if (apiResponse.result === true) {
                            $('.register .has-feedback').addClass('has-success').removeClass('has-error');
                            $('.register .form-control-feedback').addClass('glyphicon-ok').removeClass('glyphicon-remove');
                        } else {
                            $('.register .has-feedback').addClass('has-error').removeClass('has-success');
                            $('.register .form-control-feedback').addClass('glyphicon-remove').removeClass('glyphicon-ok');
                        }

                    });

                }, 500);

            } else if (validLengthReachedOnce) {
                $('.register .has-feedback').addClass('has-error').removeClass('has-success');
                $('.register .form-control-feedback').addClass('glyphicon-remove').removeClass('glyphicon-ok');
                $('.register .help-block').text(cumulusClips.text['username_minimum']);
            }
        });
    }

});




/****************
GENERAL FUNCTIONS
****************/

/**
 * Retrieves the full URL to a video
 *
 * @param {Object} video The video whose URL is being retrieved
 * @return {String} Returns the absolute URL to given video
 */
cumulusClips.getVideoUrl = function(video)
{
    var url = cumulusClips.baseUrl;
    url += '/watch/' + video.videoId + '/';
    url += cumulusClips.generateSlug(video.title) + '/';
    return url;
};

/**
 * Generates a URL friendly slug from an input string
 *
 * @param {String} stringToConvert The string to convert into a URL slug
 * @return {String} Returns a string with non alphanum characters converted to hyphens
 */
cumulusClips.generateSlug = function(stringToConvert)
{
    var slug = stringToConvert.replace(/[^a-z0-9]+/ig, '-');
    slug = slug.replace(/^-|-$/g, '').toLowerCase();
    return slug;
};

/**
 * Displays alert message on page
 *
 * @param {Boolean} result The type of alert to display (true = Success, false = Error)
 * @param {String} message The textual message for the alert
 */
cumulusClips.displayMessage = function(result, message)
{
    var cssClass = (result === true) ? 'alert-success' : 'alert-danger';
    var existingClass = ($('.alert').hasClass('alert-success')) ? 'alert-success' : 'alert-danger';
    $('.alert').removeClass('hidden');
    $('.alert').html(message);
    $('.alert').removeClass(existingClass);
    $('.alert').addClass(cssClass);
};

/**
 * Formats bytes into human readable format
 *
 * @param {Number} bytes Total number of bytes
 * @param {Number} precision Decimal places to use in final value
 * @return {String} Returns human readable formatted bytes
 */
cumulusClips.formatBytes = function(bytes, precision)
{
    var units = ['b', 'KB', 'MB', 'GB', 'TB'];
    bytes = Math.max(bytes, 0);
    var pwr = Math.floor((bytes ? Math.log(bytes) : 0) / Math.log(1024));
    pwr = Math.min(pwr, units.length - 1);
    bytes /= Math.pow(1024, pwr);
    return Math.round(bytes, precision) + units[pwr];
};

/**
 * Retrieves language file text
 *
 * @param {String} node Name of node in language file to retrieve
 * @param {Object} replacements (Optional) List of key/value replacements in JSON format
 * @return {Promise} Returns promise that is resolved with request language text
 */
cumulusClips.getText = function(node, replacements)
{
    var textDeferred = $.Deferred();

    if (cumulusClips.text[node]) {
        textDeferred.resolve(cumulusClips.text[node]);
    } else {

        $.ajax({
            type    : 'POST',
            url     : cumulusClips.baseUrl+'/language/get/',
            data    : {node:node, replacements:replacements},
        }).done(function(data){
            cumulusClips.text[node] = data;
            textDeferred.resolve(data);
        });

    }

    return textDeferred.promise();
};

/**
 * Retrieves template file contents
 *
 * @param {String} templateName Name template to load
 * @return {Promise} Returns promise that is resolved with template file contents
 */
cumulusClips.getTemplate = function(templateName)
{
    var templateDeferred = $.Deferred();

    // Verify if template has already been loaded
    if (!cumulusClips.templates[templateName]) {

        // Retrieve template
        var xhrPromise = $.get(cumulusClips.themeUrl + '/blocks/' + templateName + '.html');

        xhrPromise.done(function(data) {
            cumulusClips.templates[templateName] = data;
            templateDeferred.resolve(data);
        });

    } else {
        templateDeferred.resolve(cumulusClips.templates[templateName]);
    }

    return templateDeferred.promise();
};

/**
 * Makes API request
 *
 * @param {String} url Location of the action's server handler script
 * @param {Object|String} data The data to be provided in the API request
 * @param {Object} options (optional) Custom options for AIP request
 *  - displayMessage {Boolean} Whether to display general alert after API request is complete
 *  - xhr {Object} Custom XHR options to be provided to jQuery.ajax()
 * @return {Promise} Returns promise that is resolved with a uniform API response
 */
cumulusClips.apiRequest = function(url, data, options)
{
    var requestOptions = $.extend(true, {
        displayMessage : true,
        xhr : {
            type        : 'POST',
            data        : data,
            dataType    : 'json',
            url         : url
        }
    }, options);

    var decoratedDeferred = $.Deferred();

    // Make request and decorate response into a uniform API response
    $.ajax(requestOptions.xhr)
        .done(function(responseData, textStatus, jqXHR) {

            // Extract response headers
            var headers = {};
            jqXHR.getAllResponseHeaders().trim().split("\n").map(function(header){
                var parts = header.split(':');
                var headerName = parts.shift();
                headers[headerName] = parts.join(':').trim();
            });

            responseData.headers = headers;
            responseData.httpStatus = jqXHR.status;

            // Resolve decorated promise
            decoratedDeferred.resolve(responseData);

        })
        .fail(function(jqXHR, textStatus, errorThrown ){

            var responseData = {};

            // Extract response headers
            var headers = {};
            jqXHR.getAllResponseHeaders().trim().split("\n").map(function(header){
                var parts = header.split(':');
                var headerName = parts.shift();
                headers[headerName] = parts.join(':').trim();
            });

            // CumulusClips generated error
            if (jqXHR.responseJSON) {

                $.extend(
                    responseData,
                    {
                        httpStatus: jqXHR.status,
                        headers: headers
                    },
                    jqXHR.responseJSON
                );

            } else {

                // Other HTTP Error
                requestOptions.displayMessage = false;
                responseData = {
                    httpStatus: jqXHR.status,
                    headers: headers,
                    status: false,
                    message: ''
                };

            }

            // Resolve decorated promise
            decoratedDeferred.resolve(responseData);
        });

    // Return decorated promise to others in chain
    return decoratedDeferred.promise().always(function(apiResponse){

        // Display message to user
        if (requestOptions.displayMessage) {
            cumulusClips.displayMessage(apiResponse.result, apiResponse.message);
        }

    });
};

/**
 * Generates attachment card HTML to be appended to attachment list on video upload/edit page
 *
 * @param {Number} index Index of newly created attachment within list of attachments
 * @param {String} name Full name of file to be attached
 * @param {Number} size Size of attached file in bytes
 * @param {Number|String} file If file is an existing attachment then file ID is expected, otherwise absolute path to upload temp file
 * @return {jQuery} Returns jQuery object reprensenting attachment card
 */
cumulusClips.buildAttachmentCard = function(index, name, size, file)
{
    var fieldName = (typeof file === 'number') ? 'file' : 'temp';
    var displayFilename = (name.length > 35) ? name.substring(0, 35) + '...' : name;
    displayFilename += ' (' + cumulusClips.formatBytes(size, 0) + ')';

    // Build card
    var $attachment = $('<div class="attachment">'

        // Append form values
        + '<input type="hidden" name="attachment[' + index + '][name]" value="' + name + '" />'
        + '<input type="hidden" name="attachment[' + index + '][size]" value="' + size + '" />'
        + '<input type="hidden" name="attachment[' + index + '][' + fieldName + ']" value="' + file + '" />'

        // Append progress bar template
        + '<div class="upload-progress">'
            + '<a class="remove" href=""><span class="glyphicon glyphicon-remove"></span></a>'
            + '<span class="title">' + displayFilename + '</span>'
            + '<span class="pull-right glyphicon glyphicon-ok"></span>'
        + '</div>'

    + '</div>');

    // Mark attachment as existing
    if (typeof file === 'number') {
        $attachment
            .addClass('existing-file')
            .attr('id', 'existing-file-' + file);
    }

    return $attachment;
};

/**
 * Generates comment card HTML to be appended to comment list on play page
 *
 * @param {String} commentCardTemplate The HTML template of the comment card
 * @param {Object} commentCardData The CommentCard object for the comment being appended
 * @return {jQuery} The jQuery object for the newly filled comment card element
 */
cumulusClips.buildCommentCard = function(commentCardTemplate, commentCardData)
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
    var $commentAuthor = commentCard.find('.comment-author');
    $commentAuthor.text(commentCardData.author.username);
    if ($commentAuthor.is('a')) {
        $commentAuthor.attr('href', cumulusClips.baseUrl + '/members/' + commentCardData.author.username)
    }

    // Set comment date
    var commentDate = new Date(commentCardData.comment.dateCreated.split(' ')[0]);
    monthPadding = (String(commentDate.getMonth()+1).length === 1) ? '0' : '';
    datePadding = (String(commentDate.getDate()).length === 1) ? '0' : '';
    commentCard.find('.comment-date').text(monthPadding + (commentDate.getMonth()+1) + '/' + datePadding + commentDate.getDate() + '/' + commentDate.getFullYear());

    // Set comment action links
    commentCard.find('.comment-action .reply').text(cumulusClips.text['reply']);
    commentCard.find('.flag')
        .text(cumulusClips.text['report_abuse'])
        .attr('data-id', commentCardData.comment.commentId);

    // Set reply to text if app.
    if (commentCardData.comment.parentId !== 0) {

        $commentReplyLabel = commentCard.find('.comment-reply');
        $commentReplyLabel.prepend(cumulusClips.text['reply_to'] + ' ');

        // Set link to parent comment author's profile
        $commentReplyLabel.find('.comment-parent-author')
            .attr('href', cumulusClips.baseUrl + '/members/' + commentCardData.parentAuthor.username)
            .text(commentCardData.parentAuthor.username);

    } else {
        commentCard.find('.comment-reply').remove();
    }

    // Set comment text
    commentCardData.comment.comments = commentCardData.comment.comments.replace(/</g, '&lt;');
    commentCardData.comment.comments = commentCardData.comment.comments.replace(/>/g, '&gt;');
    commentCard.find('.comment-text').html(commentCardData.comment.comments.replace(/\r\n|\n|\r/g, '<br>'));

    return commentCard;
};

/**
 * Resets the main comment form to it's default state
 *
 * @param {jQuery} commentForm jQuery object for the comment form's immediate container
 */
cumulusClips.resetCommentForm = function (commentForm)
{
    commentForm.addClass('collapsed');
    var commentField = commentForm.find('textarea');
    commentField.val(commentField.attr('title'));
};

/**
 * Builds a video card from the video card template
 *
 * @param {String} videoCardTemplate The HTML template to build the video card
 * @param {Object} video The video which will be represented by the card
 * @return {jQuery} Returns jQuery object Representing the new video card
 */
cumulusClips.buildVideoCard = function (videoCardTemplate, video)
{
    var $videoCard = $(videoCardTemplate);
    var url = cumulusClips.getVideoUrl(video);

    $videoCard.find('img').attr('src', cumulusClips.baseUrl + '/cc-content/uploads/thumbs/' + video.filename + '.jpg');
    $videoCard.find('.duration').text(video.duration);
    $videoCard.find('.video-title, .thumbnail a').attr('title', video.title).attr('href', url);
    $videoCard.find('.video-title').text(video.title);
    $videoCard.find('.watch-later')
        .attr('data-playlist', cumulusClips.watchLaterPlaylistId)
        .attr('data-video', video.videoId)
        .attr('title', cumulusClips.text['watch_later']);

    return $videoCard;
};

/**
 * Builds a playlist card from the playlist card template
 *
 * @param string playlistCardTemplate The HTML template to build the playlist card
 * @param object playlist The playlist which will be represented by the card
 * @return object Returns jQuery object Representing the new playlist card
 */
cumulusClips.buildPlaylistCard = function(playlistCardTemplate, playlist)
{
    var playlistCard = $(playlistCardTemplate);
    if (playlist.entries.length === 0) {
        playlistCard.addClass('playlist-empty');
        playlistCard.find('a').remove();
        playlistCard.find('img').attr('src', cumulusClips.themeUrl + '/images/playlist_placeholder.png');
        playlistCard.find('.title').text(playlist.name);
    } else {
        playlistCard.find('.watch-all').append(cumulusClips.text['watch_all']);
        playlistCard.find('.thumb').remove();
        playlistCard.find('img').attr('src', cumulusClips.baseUrl + '/cc-content/uploads/thumbs/' + playlist.entries[0].video.filename + '.jpg');
        playlistCard.find('.title a').text(playlist.name);
        playlistCard.find('a')
            .attr('href', cumulusClips.getVideoUrl(playlist.entries[0].video) + '?playlist=' + playlist.playlistId)
            .attr('title', playlist.name);
    }
    playlistCard.find('.video-count').html(playlist.entries.length + '<br>' + cumulusClips.text['videos']);
    return playlistCard;
};
