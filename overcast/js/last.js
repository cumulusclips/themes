/*
 * Final JS to run after all other scripts are loaded.  
 */

// Set up theater mode toggles 
$(function () {
  var player = videojs('vjs_video_3_html5_api')

  player.theaterMode({
    elementToToggle: 'video-col',
    className: 'col-md-12'
  })
})
