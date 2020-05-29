            <?php if ($loggedInUser): ?>
                <!-- BEGIN COMMENTS FORM -->

                    <form id="addComment" action="" method="post">
                      <div class="form-group">
		        <label class="d-block"><span class="comment-label-text">Add Comments</span>
				<textarea class="form-control comment-box" name="comments" rows="3" placeholder="<?=Language::getText('comments')?>"></textarea>
			</label>
                      </div>
                        <input type="hidden" name="videoId" value="<?=$video->videoId?>" />
                        <input type="hidden" name="parentCommentId" value="" />
			<div class="form-actions text-right mb-4">
				<button type="submit" class="btn btn-primary submit-comment"><?=Language::getText('comments_button')?></button>
			</div>
                    </form>
    
                <!-- END COMMENTS FORM -->

            <?php else: ?>
                <?php if ($config->enableRegistrations): ?>
                    <p class="commentMessage"><?=Language::getText('comments_login_register', array('login_link' => HOST . '/login/?redirect=' . urlencode($this->getService('Video')->getUrl($video)), 'register_link' => HOST . '/register/'))?></p>
                <?php else: ?>
                    <p class="commentMessage"><?=Language::getText('comments_login', array('login_link' => HOST . '/login/?redirect=' . urlencode($this->getService('Video')->getUrl($video))))?></p>
                <?php endif; ?>
            <?php endif; ?>


