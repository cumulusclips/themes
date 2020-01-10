<h3>More In This Playlist</h3>
<?php $playlistAuthor = $this->getMapper('User')->getUserById($playlist->userId); ?>
<div id="playlistVideos">

  <div class="card">
    <div class="card-img-overlay p-0">
      <div class="playlist-title card-title p-2">
        <span class="h5"><?= $this->getService('Playlist')->getPlaylistName($playlist) ?></span>
        <small class="badge bg-info text-light px-1 float-right"><?= count($playlist->entries) ?> <?= Language::GetText('videos') ?></small>
      <p class="playlist-author card-text">
        A Playlist <?= Language::getText('by') ?>: <a href="<?= HOST ?>/members/<?= $playlistAuthor->username ?>/"><?= $playlistAuthor->username ?></a>
      </p>
      </div>
    </div>
    <div class="d-flex bg-dark justify-content-center">
      <img class="card-img-top playlist-card-topper" src="<?= getPlaylistThumbnail($playlist) ?>" alt="">
    </div>
    <ul class="list-unstyled mb-0">
      <?php $videoService = $this->getService('Video'); ?>
      <?php foreach ($playlistVideos as $playlistVideo) : ?>

        <?php
          $isCurrentVideo = false;
          $videoThumbUrl = $videoService->getUrl($playlistVideo) . "/?playlist=" . $playlist->playlistId;
          ($playlistVideo->videoId == $video->videoId) ? $isCurrentVideo = true : false;  ?>
        <li class="media border-top <?= ($isCurrentVideo) ? ' shadow' : null; ?>">
            <a href="<?= $videoThumbUrl ?>">
          <div class="d-flex bg-dark justify-content-center mr-2 related-thumb-container">
              <img class="playlist-mini-thumb" src="<?= getVideoThumbUrl($playlistVideo); ?>" alt="">
            <small class="duration bg-dark text-light px-1" aria-label="<?= durationInWords($playlistVideo->duration); ?>"><?= $playlistVideo->duration ?></small>
          </div>
            </a>
          <div class="media-body">
            <p class="mt-0 mb-1">
              <?php if ($isCurrentVideo) : ?>
                <span class="current-title font-weight-bold"><?php echo htmlspecialchars($playlistVideo->title); ?> <span class="small now-playing">(now playing)</span></span>
              <?php else : ?>
                <a href="<?= $videoThumbUrl ?>"><?php echo htmlspecialchars($playlistVideo->title); ?></a>
              <?php endif; ?>
<p class="video-author small">
              <?= Language::getText('by') ?>: <a href="<?= HOST ?>/members/<?= $playlistVideo->username ?>/"><?= $playlistVideo->username ?></a> 
</p>
            </p>
          </div>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>

</div>