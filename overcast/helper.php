<?php

/**
 * Retrieves the CSS indentation class to use for a comment card
 * @staticvar array $commentCatalog Internal catalog of generated comment indent classes
 * @param Comment $comment The comment whose indent class will be retrieved
 * @return string Returns the name of the CSS indent class
 */
function getCommentIndentClass(Comment $comment)
{
    static $commentCatalog = array();
    
    // Determine which indent class to provide
    if ($comment->parentId == 0) {
        $indentClass = '';
    } else {
        $parentIndentClass = $commentCatalog[$comment->parentId];
        if ($parentIndentClass == '') {
            $indentClass = 'commentIndent';
        } else if ($parentIndentClass == 'commentIndent') {
            $indentClass = 'commentIndentDouble';
        } else {
            $indentClass = 'commentIndentTriple';
        }
    }
        
    // Update comment catalog and return indent class
    $commentCatalog[$comment->commentId] = $indentClass;
    return $indentClass;
}

/**
 * Builds full URL to a user's profile
 * @param User $user User whose profile URL will be generated for
 * @return string Returns the URL to user's profile 
 */
function getUserProfileLink(User $user)
{
    return HOST . '/members/' . $user->username;
}

/**
 * Retrieves full URL to an image to be used as the given playlist's thumbnail
 * @param Playlist $playlist The playlist to retrieve thumbnail image for
 * @return string Returns URL to the thumbnail for a playlist's card 
 */
function getPlaylistThumbnail(Playlist $playlist)
{
    $config = Registry::get('config');
    $videoMapper = new VideoMapper();
    $video = $videoMapper->getVideoById($playlist->entries[0]->videoId);
    return $config->thumbUrl . '/' . $video->filename . '.jpg';
}

/**
 * Retrieves full URL to an image to be used as the given video thumbnail
 * @param Video $video The video to retrieve thumbnail image for
 * @return string Returns URL to the thumbnail for a video
 */
function getVideoThumbUrl(Video $video)
{
    $config = Registry::get('config');

    if( class_exists('CustomThumbs') ){
        $url = CustomThumbs::thumb_url($video->videoId);
    }
    else {
        $url = $config->thumbUrl . "/" . $video->filename . ".jpg";
    }

    return $url;
}

function watchLaterButton($video, $loggedInUser, $linkText = '')
{

    if($loggedInUser) {
        $playlistService = new PlaylistService();
        $watchLater = $playlistService->getUserSpecialPlaylist($loggedInUser, \PlaylistMapper::TYPE_WATCH_LATER);

    if (isInPlaylist($video, $watchLater)) {
        $dataAction = 'remove';
        $iconClass = ' fas';
        $alt = 'In playlist.';
    } else {
        $dataAction = 'add';
        $iconClass = ' far';
        $alt = 'Not in playlist.';
    }

    $button = <<<BUTTON
<a data-playlist_id="$watchLater->playlistId" data-video_id="$video->videoId" data-action="$dataAction" data-toggle="tooltip" title="Watch Later" class="btn btn-sm btn-outline-success addToPlaylist watch-later-mini" role="button" href="#"><i class="playlist-icon fa-bookmark $iconClass" alt="$alt"></i>$linkText</a>
BUTTON;

    return $button;
    }
}

/**
 * Check to see if this rating was already made by this user.
 * @param object $video Video object
 * @param object $loggedInUser User object for this user
 * @return bool false if it hasn't been rated.
 *
 **/
function isRated($video, $loggedInUser) {
    $liked = false;
    $ratingMapper = new RatingMapper();
    $usersLikes = $ratingMapper->getRatingByCustom(array('video_id' => $video->videoId, 'user_id' => $loggedInUser->userId, 'rating' => 1));
    if (count(get_object_vars($usersLikes))) {
        $liked = true;
    }
    return $liked;
}

/**
 * Output a custom video card block to the browser
 * @param string $viewFile Name of the block to be output
 * @return mixed Block is output to browser
 *
 **/
function videoCardBlock($viewFile, $video)
{
    // Detect correct block path
    $request_block = $this->getFallbackPath("blocks/$viewFile");
    $block = ($request_block) ? $request_block : $viewFile;
    extract(get_object_vars($this->vars));
    include($block);
}
                
/**
 * Set message type class to use bootstrap alert styles
 * @param string $message_type status message passed from controller
 * @return string bootstrap message type
 *
 **/
function setMessageType($message_type)
{
	if ( $message_type == 'errors' ){
		$message_type = 'alert-danger';
	}
	if ( $message_type == 'success' ){
		$message_type = 'alert-success';
	}
	return $message_type;
}

/**
 * Display alert messaging.
 * @param string $message_type
 * @param string $message
 *
 **/
function showAlertMessage($message, $message_type)
{
	$message_type = setMessageType($message_type);
	echo '<div class="alert message ' . $message_type . '" role="alert">' . $message . '</div>';
}
/**
 * Show attachment list item
 * @param array $fileInfo array containing name, size and temp path.
 * @return string html for the attachment item
 *
 **/
function attachmentItem($fileInfo, $attachmentCount, $isNew)
{
	if($isNew) {
		$file = "temp";
	}
	else {
		$file = "file";
	}

	$attachedItem = '
                        <input type="hidden" name="attachment[' . $attachmentCount . '][name]" value="' . $fileInfo['name'] . '" />
                        <input type="hidden" name="attachment[' . $attachmentCount . '][size]" value="' . $fileInfo['size'] . '" />
                        <input type="hidden" name="attachment[' . $attachmentCount . '][' . $file . ']" value="' . $fileInfo[$file] . '" />

                        <div class="upload-ready">
				<p><span class="filename-attached">' . $fileInfo['name'] . ' (' . \Functions::formatBytes($fileInfo['size'],0) . ')</span><a class="float-right btn btn-sm btn-outline-danger remove" href="#" role="button">Remove</a></p>
                        </div>';

	return $attachedItem;
}

/**
 * Get video processing/approval status
 * @param string $status Flag for status state of the video.
 * @return bool 
 *
 **/
function isVideoPending($status)
{
	if (in_array($status, array(VideoMapper::PENDING_CONVERSION, 'processing', VideoMapper::PENDING_APPROVAL))){
		return true;
	}
	else return false;
}

/**
 * Retrieves full URL to an image to be used as the given video thumbnail
 * @param Video $video The video to retrieve thumbnail image for
 * @return string Returns URL to the thumbnail for a video
 */
function getVideoThumbnail(Video $video)
{
	$config = Registry::get('config');
	return $config->thumbUrl . '/' . $video->filename . '.jpg';
}

function isInPlaylist($video, $playlist)
{
	$playlistService = new PlaylistService();
	$playlistMapper = new PlaylistMapper();
	return $playlistService->checkListing($video, $playlistMapper->getPlaylistById($playlist->playlistId));
}

function durationInWords($duration)
{
    if(substr_count($duration, ":") == 1) {
        sscanf($duration, "%d:%d", $minutes, $seconds);
        return $minutes . " Minutes, "  . $seconds . " Seconds";
    } else {
        sscanf($duration, "%d:%d:%d", $hours, $minutes, $seconds);
        return $hours . " Hours, " . $minutes . " Minutes, "  . $seconds . " Seconds";
    }


}