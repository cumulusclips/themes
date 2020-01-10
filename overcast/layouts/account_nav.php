            <div class="media-nav-block">
                <h4><?=Language::GetText('manage_media')?></h4>

                <ul class="nav flex-column">
                    <?php if ($config->enableUserUploads): ?>
                        <li class="nav-item"><a href="<?php echo HOST; ?>/account/upload/video/" class="nav-link"><?=Language::GetText('upload_video')?></a></li>
                        <li class="nav-item"><a href="<?php echo HOST; ?>/account/videos/" class="nav-link"><?=Language::GetText('my_videos')?></a></li>

                        <?php if ($config->allowVideoAttachments): ?>
                            <li class="nav-item"><a href="<?php echo HOST; ?>/account/attachments/" class="nav-link"><?php echo Language::GetText('account_menu_attachments'); ?></a></li>
                        <?php endif; ?>
                    <?php endif; ?>
                    <li class="nav-item"><a href="<?php echo HOST; ?>/account/playlists/" class="nav-link"><?=Language::GetText('my_playlists')?></a></li>
                </ul>
            </div>

            <div class="settings-nav-block">
                <h4><?=Language::GetText('account_settings')?></h4>

                <ul class="nav flex-column">
                    <li class="nav-item"><a href="<?php echo HOST; ?>/account/profile/" class="nav-link"><?=Language::GetText('update_profile')?></a></li>
                    <li class="nav-item"><a href="<?php echo HOST; ?>/account/privacy-settings/" class="nav-link"><?=Language::GetText('privacy_settings')?></a></li>
                    <li class="nav-item"><a href="<?php echo HOST; ?>/account/change-password/" class="nav-link"><?=Language::GetText('change_password')?></a></li>
                </ul>
            </div>

            <div class="community-nav-block">
                <h4><?=Language::GetText('community')?></h4>
                <ul class="nav flex-column">
                    <li class="nav-item"><a href="<?php echo HOST; ?>/account/subscriptions/" class="nav-link"><?=Language::GetText('my_subscriptions')?></a></li>
                    <li class="nav-item"><a href="<?php echo HOST; ?>/account/subscribers/" class="nav-link"><?=Language::GetText('my_subscribers')?></a></li>
                    <li class="nav-item"><a href="<?php echo HOST; ?>/account/message/inbox/" class="nav-link"><?=Language::GetText('inbox')?></a></li>
                    <li class="nav-item"><a href="<?php echo HOST; ?>/account/message/send/" class="nav-link"><?=Language::GetText('send_message')?></a></li>
                </ul>
            </div>
