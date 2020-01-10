<div class="card mb-3 border-top-0 rounded-0">
	<div class="row justify-content-between m-3">
		<div class="col-md-7">
			<?php if ($video->disableEmbed == '0' && $video->gated == '0') : ?>
				<!-- EMBED CODE -->
				<form>
					<h5>Direct Link</h5>
						<label for="directLink">Use this to link directly to this page.</label>
					<div class="input-group">
						<input id="directLink" type="text" class="form-control" value="<?= $this->getService('Video')->getUrl($video); ?>" maxlength="130">
						<div class="input-group-append">
							<button class="btn btn-outline-primary btn-clipboard" data-clipboard-target="#directLink" type="button">Copy</button>
						</div>
					</div>
					<h5 class="mt-3">iFrame Embed</h5>
					<div class="form-group">
						<label for="embedCode"><?= Language::getText('embed_text') ?></label>
						<textarea id="embedCode" class="form-control" rows="4">&lt;iframe src="<?= BASE_URL ?>/embed/<?= $video->videoId ?>/" width="480" height="360" frameborder="0" allowfullscreen&gt;&lt;/iframe&gt;</textarea>
						<div class="text-right">
							<button type="button" class="btn btn-sm btn-outline-primary btn-clipboard mt-2" data-clipboard-target="#embedCode">Copy to Clipboard</button>
						</div>
					</div>
					<h5>Auto-Embed Link</h5>
					<div class="input-group">
						<label for="autoEmbedCode">To embed this video on <strong>wordpress and similar sites</strong>, copy and paste this link to auto-embed.</label>
						<input id="autoEmbedCode" type="text" class="form-control" value="<?= BASE_URL ?>/embed/<?= $video->videoId ?>/" maxlength="130">
						<div class="input-group-append">
							<button class="btn btn-outline-primary btn-clipboard" data-clipboard-target="#autoEmbedCode" type="button">Copy</button>
						</div>
					</div>
				</form>
			<?php endif; ?>
		</div>
		<div class="col-md-4 sharing-buttons">
			<h5>Share</h5>
			<p>
				Share this on:
			</p>
			<ul class="list-group">
				<?php if ($app_id = Settings::get('fb_app_id')) : ?>
					<li class="list-group-item">
						<!-- FACEBOOK BUTTON -->
						<meta property="og:url" content="<?= $this->getService('Video')->getUrl($video) ?>/" />
						<meta property="og:title" content="<?php echo htmlspecialchars($video->title); ?>" />
						<meta property="og:description" content="<?php echo htmlspecialchars($video->description); ?>" />
						<meta property="og:image" content="<?= $config->thumbUrl ?>/<?= $video->filename ?>.jpg" />
						<meta property="og:type" content="video" />
						<meta property="og:video" content="<?= $config->h264Url ?>/<?= $video->filename ?>.mp4">
						<meta property="og:video:type" content="video/mp4">
						<meta property="og:video:width" content="640">
						<meta property="og:video:height" content="360">
						<script>
							if (window.location.hash === '#facebook-share') {
								window.close();
							}
						</script>
						<a class="facebook" href="https://www.facebook.com/dialog/share?app_id=<your_app_id>&display=popup&href=<?= urlencode($this->getService('Video')->getUrl($video) . '/') ?>&redirect_uri=<?= urlencode($this->getService('Video')->getUrl($video) . '/#facebook-share') ?>" onClick="window.open(this.href, 'sharewindow','width=550,height=300');return false;"><i class="fab fa-facebook-square"></i> Facebook</a>
					</li>

				<?php endif; ?>
				<!-- TWITTER BUTTON -->
				<li class="list-group-item">
					<a class="twitter" href="" onClick="window.open('https://twitter.com/share?url=<?= urlencode($this->getService('Video')->getUrl($video) . '/') ?>&text=<?= urlencode(Functions::cutOff(htmlspecialchars($video->description), 140)) ?>','sharewindow','width=650,height=400');return false;"><i class="fab fa-twitter-square"></i> Twitter</a>
				</li>

				<!-- ETC -->
				<li class="list-group-item">
					<a href="" onClick="window.open('http://www.reddit.com/submit?url=<?= urlencode($this->getService('Video')->getUrl($video) . '/') ?>','sharewindow','width=650,height=400');return false;"><i class="fab fa-reddit-square"></i> Reddit</a>
				</li>

				<!-- ETC -->
				<li class="list-group-item">
					<a href="" onClick="window.open('https://www.linkedin.com/shareArticle?mini=true&url=<?= urlencode($this->getService('Video')->getUrl($video) . '/') ?>','sharewindow','width=650,height=400');return false;"><i class="fab fa-linkedin"></i> LinkedIn</a>
				</li>

				<!-- ETC -->
				<li class="list-group-item">
					<a href="mailto:?subject=<?= $video->title ?>&body=<?= urlencode($this->getService('Video')->getUrl($video) . '/') ?>"><i class="fas fa-envelope-square"></i> Email</a>
				</li>
			</ul>
		</div>
	</div>
</div>