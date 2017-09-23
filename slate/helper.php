<?php

/**
 * Retrieves videos most recently added to system
 *
 * @return \Video[] Returns list of videos
 */
function getRecentVideos()
{
    $videoMapper = new VideoMapper();
    $db = Registry::get('db');

    $query = "SELECT video_id FROM " . DB_PREFIX . "videos WHERE status = 'approved' AND private = '0' ORDER BY video_id DESC LIMIT 50";
    $recentVideosResults = $db->fetchAll($query);
    return $videoMapper->getVideosFromList(
        Functions::arrayColumn($recentVideosResults, 'video_id')
    );
}

/**
 * Retrieves list of video categories
 *
 * @return \Category[] Returns list of categories
 */
function getCategories()
{
    $categoryService = new CategoryService();
    return array_values($categoryService->getCategories());
}

/**
 * Determines given video's position within given list of videos
 *
 * @param \Video[] $list List of videos to search within
 * @param int $videoId ID of video to search for
 * @return int|boolean Returns index of video within list, false if not found
 */
function getPlaylistOffset(array $list, $videoId)
{
    foreach ($list as $index => $video) {
        if ($video->videoId == $videoId) {
            return $index;
        }
    }

    return false;
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
 * Retrieves paginated video list for given category
 *
 * @param int $categoryId ID of category to retrieve videos for
 * @param int $offset Starting point in video list retrieve videos from
 * @return \Video[] Returns List of videos
 */
function getBatchFromCategory($categoryId, $offset = 0)
{
    $db = Registry::get('db');
    $videoMapper = new VideoMapper();

    $query = "SELECT video_id FROM " . DB_PREFIX . "videos WHERE status = 'approved' AND private = '0' AND category_id = $categoryId ORDER BY video_id DESC LIMIT $offset, " . getRecordsPerPage();
    $result = $db->fetchAll($query);

    return $videoMapper->getVideosFromList(
        Functions::arrayColumn($result, 'video_id')
    );
}

/**
 * Retrieves video count for given category
 *
 * @param int $categoryId ID of category to retrieve count for
 * @return int Returns number of videos in category
 */
function getCategoryTotal($categoryId)
{
    $db = Registry::get('db');

    $query = "SELECT COUNT(video_id) as `count` FROM " . DB_PREFIX . "videos WHERE status = 'approved' AND private = '0' AND category_id = $categoryId";
    $result = $db->fetchRow($query);

    return (int) $result['count'];
}

/**
 * Provides how many videos to display per category page
 *
 * @return int Returns number of videos per category page
 */
function getRecordsPerPage()
{
    return 12;
}