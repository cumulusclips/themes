var cc = {

  baseUrl: $('meta[name="baseUrl"]').attr('content'),
  themeUrl: $('meta[name="themeUrl"]').attr('content'),
  loggedIn: $('meta[name="loggedIn"]').attr('content'),
  videoId:  $('meta[name="videoId"]').attr('content'),

  /**
   * Display message sent from the server handler script for page actions
   * @param boolean result The result of the requested action (true = Success, false = Error)
   * @param string message The textual message for the result of the requested action
   * @param bool/string The name of a container to append the message to;  Boolean false if using default.
   * @return void Message block is displayed and styled accordingly with message.
   * If message block is already visible, then it is updated.
   */
  displayMessage: function (result, message, appendContainer = false)
  {
    // if we were sent a parent element to put a message in,
    // and the message element hasn't already been added to it
    if( appendContainer && !$(appendContainer).find('.message').length ) {
      let messageContainer = $('<div></div>')
        .addClass('message alert')
        .html('<p>' + message + '</p>')

      $(appendContainer).append(messageContainer)
    }
    var cssClass = (result === true) ? 'alert-success' : 'alert-danger'
    var existingClass = ($('.message').hasClass('alert-success')) ? 'alert-success' : 'alert-danger'
    $('.message').show()
    $('.message').html(message)
    $('.message').removeClass(existingClass)
    $('.message').addClass(cssClass)
  },

  /**
   * Retrieve localised string via AJAX
   * @param function callback Code to be executed once AJAX call to retrieve text is complete
   * @param string node Name of term node in language file to retrieve
   * @param json replacements (Optional) List of key/value replacements in JSON format
   * @return void Requested string, with any replacements made, is passed to callback
   * for any futher behaviour
   */
  getLocalizedText: function (callback, node, replacements) {
    $.ajax({
      type        : 'POST',
      url         : this.baseUrl+'/language/get/',
      data        : {node:node, replacements:replacements},
      success     : callback
    })
  },

  /**
   * Update playlist icons and messaging when saving videos to playlists.
   * @param obj response from server
   * @param jQuery object containing the dom anchor for the playlist that was clicked
   * @param string action toggle indicator to determine the intent of the click (remove/add)
   */
  savedToPlaylist: function (response, link, action) {
    //Put the server response into the alert container
    this.displayMessage(response.result, response.message, '.header-secondary')

    if (response.result) {
      link.find('.playlist-icon').toggleClass('far')
      link.find('.playlist-icon').toggleClass('fas')
      this.toggleCustomPlaylistIcons(link)

      // For custom (user) playlists, toggle the checkbox icon, and update the alt.
      if(action === 'add') {
        link.find('.playlist-icon').attr('alt', 'Video is in playlist:')
        link.data('action', 'remove')
      } else {
        link.find('.playlist-icon').attr('alt', 'Video is not in playlist:')
        link.data('action', 'add')
      }
      link.data('action', action === 'add' ? 'remove' : 'add')
    } else {
      // Something went wrong, scroll up so user sees alert messaging.
      window.scrollTo(0, 0)
    }
  },

  /**
   * Update ratings when Like button is clicked.
   * @param responseData response from server
   * @param element DOM element/jQuery object of like button.
   */
  showRatingUpdate: function (responseData, element) {
    this.displayMessage(responseData.result, responseData.message, '.header-secondary')
    if (responseData.result === true) {
      //update likes and toggle class
      $('.like .likes').text(responseData.other.likes)
      $('.like').find('i').toggleClass('far')
      $('.like').find('i').toggleClass('fas')
      $('.like').addClass('disabled')
    }
    window.scrollTo(0, 0)
  },

  /**
   * Set checked/unchecked icons for custom playlists when videos are added to them.
   * @param link jQuery/Dom object for the link.
   */
  toggleCustomPlaylistIcons: function (link) {
    if (link.hasClass('customPlaylist')) {
      link.find('.playlist-icon').toggleClass('fa-check-square')
      link.find('.playlist-icon').toggleClass('fa-square')
    }
  },

  /**
   * Set tooltips for clipboardjs.
   * @param btn jQuery/Dom object for the link.
   * @param message Text to display
   */
  setTooltip: function (btn, message) {
    $(btn).tooltip('hide')
      .attr('data-original-title', message)
      .tooltip('show')
  },

  /**
   * Set tooltips for clipboardjs.
   * @param btn jQuery/Dom object for the link.
   */
  hideTooltip: function (btn) {
    setTimeout(function () {
      $(btn).tooltip('hide')
    }, 1000)
  },

  /**
   * Add pagination styles to the appropriate DOM elements.
   * Generated HTML is in core application files.
   */
  paginate: function () {
    $('#pagination').addClass('pagination justify-content-center')
    $('#pagination').wrap('<nav aria-label="page navigation"></nav>')
    $('#pagination').find('li').addClass('page-item')
    $('#pagination').find('a').addClass('page-link')
    $('#pagination').find('strong').addClass('page-link')
    $('#pagination').find('strong').parent().addClass('active')
  },

  /**
   * Update button if the action (subscribe / unsubscribe) was successful.
   * @param responseData response from server with status, etc.
   * @param subscribeButton jQuery/Dom object for the button.
   * @param subscribeType indicates if this is a subscribe/unsubscribe.
   */
  subscribe: function (responseData, subscribeButton, subscribeType) {
    this.displayMessage(responseData.result, responseData.message, '.header-secondary')
    if (responseData.result === true) {
      subscribeButton.text(responseData.other)
      if (subscribeType == 'subscribe') {
        subscribeButton.data('type','unsubscribe')
      } else if (subscribeType == 'unsubscribe') {
        subscribeButton.data('type','subscribe')
      }
    }
    window.scrollTo(0, 0)
  },

  /**
   * Create and add a new playlist to the "dropdown" button on the watch page.
   * TODO: move to jsrender/template.
   * @param createPlaylistResponse response from server with status, etc.
   * @param createPlaylistForm jQuery/Dom object for the creation form.
   * @param video_id id for the initial video being added (i.e. to set playlist thumb).
   */
  createPlaylist: function (createPlaylistResponse, createPlaylistForm, video_id) {
    this.displayMessage(createPlaylistResponse.result, createPlaylistResponse.message, '.header-secondary')
    var newButton = '<button data-playlist_id="' + createPlaylistResponse.other.playlistId + '" data-video_id="'+ video_id +'" data-action="remove" class="dropdown-item btn btn-outline-primary text-left addToPlaylist customPlaylist" href="#"><i class="playlist-icon pr-2 fas fa-check-square" alt="Video is in this playlist."></i>' + createPlaylistResponse.other.name + '</button>'

    // Add the button to the dropdown and clear the form.
    $('.playlist-buttons').append(newButton)
    createPlaylistForm.find('input[type="text"]').val('')
    createPlaylistForm.find('#visibility-public').prop( "checked", true )
  }
}

/**
 * Add a video to a playlist.
 */
$('.addToPlaylist').on('click', function (event) {
  const link = $(this)
  const action = $(this).data('action')
  const url = cc.baseUrl + '/actions/playlist/'
  const data = {
    action: action,
    video_id: $(this).data('video_id'),
    playlist_id: $(this).data('playlist_id')
  }
  const callback = function (response) { cc.savedToPlaylist(response, link, action) }
  $.post(url, data, callback, 'json')
  event.preventDefault()
})

// Attach Subscribe & Unsubscribe action to buttons
$('.subscribe').click(function () {
  const subscribeType = $(this).data('type')
  const url = cc.baseUrl+'/actions/subscribe/'
  const data = {type: subscribeType, user: $(this).data('user')}
  const subscribeButton = $(this)
  const callback = function (responseData) {
    cc.subscribe(responseData, subscribeButton, subscribeType)
  }
  $.post(url, data, callback, 'json')
  event.preventDefault()
})

// Attach add new playlist actions to forms on watch page.
$('form#createNewPlaylist').submit(function (event) {
  const createPlaylistForm = $(this)
  const data = $(this).serialize()
  const url = cc.baseUrl + '/actions/playlist/'
  const video_id = createPlaylistForm.find('#video_id').val()
  const callback = function (createPlaylistResponse) {
    cc.createPlaylist(createPlaylistResponse, createPlaylistForm, video_id)
    $('#newPlaylistModal').modal('hide')
  }
  $.post(url, data, callback, 'json')
  event.preventDefault()
})

// Attach flag action to flag links / buttons
$('.report-abuse-container').on('click', '.report-content', function () {
  const url = cc.baseUrl + '/actions/flag/'
  const data = {
    type: $(this).data('type'),
    id: $(this).data('id')
  }
  const callback = function (response) {
    cc.displayMessage(response.result, response.message, '.header-secondary')
  }
  $.post(url, data, callback, 'json')
  window.scrollTo(0, 0)
  event.preventDefault()
})

// Attach like/rating button.
$('.like').click(function () {
  const url = cc.baseUrl + '/actions/rate/'
  const data = {
    video_id: $(this).data('video_id'),
    rating: $(this).data('rating')
  }
  const callback = function (responseData) {
    cc.showRatingUpdate(responseData, $(this))
  }
  $.post(url, data, callback, 'json')
  event.preventDefault()
})

// Attach changes to support fancy toggle switches, because
// server-side expects form data submitted via drop-downs.
$('form#privacy-settings input.custom-control-input').change(function (e) {
  const inputId = '#' + $(this).attr('id') + '_data'
  if ($(this).is(':checked')) {
    $(inputId).attr('value', 1)
  } else {
    $(inputId).attr('value', 0)
  }
})

// Attach and style pagination links.
cc.paginate()

// ClipboardJS
var clipboard = new ClipboardJS('.btn-clipboard')

clipboard.on('success', function (e) {
  cc.setTooltip(e.trigger, 'Copied!')
  cc.hideTooltip(e.trigger)
})

clipboard.on('error', function (e) {
  cc.setTooltip(e.trigger, 'Copy Failed!')
  cc.hideTooltip(e.trigger)
})

$('.btn-clipboard').tooltip({
  trigger: 'click',
  placement: 'bottom'
})

$('.watch-later-mini').tooltip({ placement: 'bottom' })
