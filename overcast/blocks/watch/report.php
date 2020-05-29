<?php $videoService = $this->getService('Video'); ?>
<div class="report-abuse-container row p-3">
        <div class="col-md-3 text-right">
<button type="button" data-type="video" data-id="<?=$video->videoId?>" class="btn btn-danger report-content">Report This</button>
        </div>
        <div class="col">
        <p>Clicking this button will flag this content for review by an administrator.  You can also contact the administrators directly by email at <a href="mailto:<?=Settings::get('admin_email');?>?subject=Innapropriate content on <?=Settings::get('sitename');?>&Video URL: <?=$videoService->getUrl($video)?>"><?=Settings::get('admin_email');?></a>.  </p>
        </div>
</div>
