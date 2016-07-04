<?php

/**
 * Determines the video list filter option based on URL Get parameters
 * @return string Returns the video list filter option
 */
function getActiveSorting()
{
    $load = array('most-viewed', 'most-discussed', 'most-rated');
    if (isset($_GET['load']) && in_array($_GET['load'], $load)) {

        switch ($_GET['load']) {
            case 'most-viewed':
                $return = Language::getText('most_viewed');
                break;
            case 'most-discussed':
                $return = Language::getText('most_discussed');
                break;
            case 'most-rated':
                $return = Language::getText('most_rated');
                break;
        }
    } else {
        $return = Language::getText('most_recent');
    }

    return $return;
}

/**
 * Converts CumulusClips flash message CSS class to corresponding Bootstrap alert class
 * @param string $alert The CumulusClips CSS class to convert
 * @return string Returns the corresponding Bootstrap alert class
 */
function convertAlertToBootstrap($alert)
{
    switch ($alert) {
        case 'errors':
            return 'alert-danger';
        case 'success':
            return 'alert-success';
    }
}

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
            $indentClass = 'comment-indent';
        } else if ($parentIndentClass == 'comment-indent') {
            $indentClass = 'comment-indent-2';
        } else {
            $indentClass = 'comment-indent-3';
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