<!-- BEGIN COMMENTS LIST -->

<?php if ($commentCount > 0): ?>
    <?php foreach ($commentCardList as $commentCard): ?>
        <?php $commentIndentClass = getCommentIndentClass($commentCard->comment); ?>
<div class="card mb-3 comment <?=$commentIndentClass?>" data-comment="<?=$commentCard->comment->commentId?>">
              <div class="row">
                  <div class="col-md-3 text-center">
                        <?php if($commentCard->avatar): ?>
                            <img src="<?=$commentCard->avatar;?>" class="p-2 my-3 img-thumbnail" alt="">
                        <?php else: ?>
			    <i class="fas fa-user fa-lg py-3 mt-3" alt="<?php echo Language::getText('current_avatar'); ?>" style="font-size: 64px;"></i>
                        <?php endif; ?>
                 </div>
             <div class="col-md-8">
                   <div class="card-body">
			
                            <p class="card-text comment-meta font-weight-light font-italic text-muted">Posted by <span class="commentAuthor"><a href="<?=getUserProfileLink($commentCard->author)?>"><?=$commentCard->author->username?></a></span> on <span class="commentDate"><?=date('m/d/Y', strtotime($commentCard->comment->dateCreated))?></span>
                        <?php if ($commentCard->comment->parentId != 0): ?>
                            <span class="commentReply"><?=Language::getText('reply_to')?> <a href="<?=getUserProfileLink($commentCard->parentAuthor)?>"><?=$commentCard->parentAuthor->username?></a></p>
                        <?php endif; ?>

</p>
                            
                       <p class="comment-body card-text"><?=nl2br($commentCard->comment->comments)?></p>
<div class="commentAction text-right">
  <button type="button" class="reply btn btn-sm btn-outline-secondary"><?=Language::getText('reply')?></button>
  <button type="button" class="flag report_abuse report-content btn btn-sm btn-outline-danger" data-type="comment" data-id="<?=$commentCard->comment->commentId?>"><?=Language::getText('report_abuse')?></button>
</div>
              </div>
            </div>
          </div>
        </div>
<?php endforeach; ?>
                <?php else: ?>
                    <div id="no-comments" class="mt-4 alert alert-info"><?=Language::getText('no_comments')?></div>
                <?php endif; ?>

                

<!-- END COMMENTS LIST -->
