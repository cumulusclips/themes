            <div class="related-content mt-3">
                <h3><?= Language::getText('suggestions_header') ?></h3>
                <?php if (count($relatedVideos) > 0) : ?>

                    <div class="related-video-list">
                        <?php $videoService = $this->getService('Video'); ?>
                        <ul class="list-unstyled">

                            <?php foreach ($relatedVideos as $relatedVideo) : ?>
                                <?php $relatedVideoUrl = $videoService->getUrl($relatedVideo);  ?>
                                <li class="media my-2">
                                        <a href="<?= $relatedVideoUrl  ?>" class="related-thumb-link">
                                    <div class="related-thumb-container d-flex bg-dark justify-content-center mr-2">
                                            <img class="related-mini-thumb" src="<?= getVideoThumbUrl($relatedVideo); ?>" alt="">
                                        <small class="duration bg-dark text-light px-1" aria-label="<?= durationInWords($relatedVideo->duration); ?>"><?= $relatedVideo->duration ?></small>
                                    </div>
                                        </a>
                                    <div class="media-body">
                                        <p class="mt-0 mb-1">
                                            <a href="<?= $relatedVideoUrl ?>"><?php echo htmlspecialchars($relatedVideo->title); ?></a>
                                        </p>
                                        <p class="video-author small">
                                            <?= Language::getText('by') ?>: <a href="<?= HOST ?>/members/<?= $relatedVideo->username ?>/"><?= $relatedVideo->username ?></a>
                                        </p>
                                    </div>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>

                <?php else : ?>
                    <strong><?= Language::getText('no_suggestions') ?></strong>
                <?php endif; ?>
            </div>