class Profile {
  constructor () {
    this.videosText = $('meta[name="videos"]').attr('content')
    this.watchAllText = $('meta[name="watch_all"]').attr('content')
    this.watchLaterText = $('meta[name="watch_later"]').attr('content')

    this.thumbUrl = $('meta[name="thumbUrl"]').attr('content')
    this.videoCount = Number($('meta[name="videoCount"]').attr('content'))
    this.playlistCount = Number($('meta[name="playlistCount"]').attr('content'))
    this.watchLaterPlaylistId = $('meta[name="watchLaterPlaylistId"]').attr('content')

    this.videoRequestUrl = cc.baseUrl + '/members/videos'
    this.playlistRequestUrl = cc.baseUrl + '/members/playlists'
    this.videoListUrl = cc.baseUrl + '/api/video/list/'
  }

  chunker(arr, chunkSize) {
    const sets = [] 
    const chunks = Math.ceil(arr.length / chunkSize)
    for (let i = 0, j = 0; i < chunks; i++, j += chunkSize) {
      sets[i] = arr.slice(j, j + chunkSize)
    }
    
    return sets
  }

  loadMorePlaylists (playlistList) {
    for (const playlist of playlistList) {
      playlist.videoCount = playlist.entries.length
      playlist.videosText = this.videosText

      if (playlist.entries.length) {
        playlist.videoThumbId = playlist.entries[0].videoId
        const videoIds = { list: playlist.videoThumbId }
        const profile = this
        $.get (this.videoListUrl, videoIds, this.buildPlaylistMeta(profile, playlist), 'json')
      }
      else {
        const template = $.templates('#playlist-mini-card-template')
        const renderedCard = template.render(playlist)
        $('.playlist-list').append(renderedCard)
      }
    }
  }

  loadVideoGrid (videoList) {
    const columns = 3
    const columnWidth = 12 / columns
    const videoRows = this.chunker(videoList, columns)
    for (const videos of videoRows) {
      const row = $('<div class="row pt-4"></div>')
      for (let video of videos) {
        video = this.loadVideoMeta(video);
        const col = $('<div class="col-md-' + columnWidth + ' video"></div>')
        const template = $.templates('#video-card-template')
        const renderedCard = template.render(video)

        col.append(renderedCard)
        row.append(col)
        $('#videos_list').append(row)
      }

    }
  }

  loadVideoMeta (video) {
    video.thumbUrl = this.thumbUrl
    video.url = this.getVideoUrl(video)
    video.truncatedDescription = this.truncateDescription(video.description)
    video.durationInWords = moment.duration(this.formatDuration(video.duration)).humanize()
    video.memberBaseUrl = cc.baseUrl + '/members/'
    return video
  }

  truncateDescription (description) {
    if (description.length > 250) {
      description = description.substring(0, 250) + '...'
    }
    return description
  }

  formatDuration (duration) {
    let fullDuration = duration
    if (duration.match(/:/g).length === 1) {
      fullDuration = "0:" + duration 
    }
    return fullDuration
  }

  buildPlaylistMeta (profile, playlist) {
    return function (response, textStatus, jqXHR) {
      for (let video of response.data) {
        playlist.thumbUrl = profile.thumbUrl + '/' + video.filename + '.jpg'
        playlist.url = profile.getVideoUrl(video) + '?playlist=' + playlist.playlistId

        const template = $.templates('#playlist-mini-card-template')
        const renderedCard = template.render(playlist)
        $('.playlist-list').append(renderedCard)
      }
    }
  }

/**
* Retrieve the full URL to a video
* @param object video The video whose URL is being retrieved
* @return string Returns the complete URL to given video
*/
  getVideoUrl (video) {
    let url = cc.baseUrl
    url += '/watch/' + video.videoId + '/'
    url += this.generateSlug(video.title) + '/'
    return url
  }

  /**
   * Generate a URL friendly slug from an input string
   * @param string stringToConvert The string to convert into a URL slug
   * @return string Returns a string with non alphanum characters converted to hyphens.
   */
  generateSlug (stringToConvert) {
    let slug = stringToConvert.replace(/[^a-z0-9]+/ig, '-')
    slug = slug.replace(/^-|-$/g, '').toLowerCase()
    return slug
  }
}

const profile = new Profile()

$('#member-videos').on('click', '.loadMoreVideos button', function (event) {
  const loadMoreButton = $(this)
  const userId = loadMoreButton.data('user')
  const retrieveOffset = $('#videos_list .video').length
  const retrieveLimit = Number(loadMoreButton.data('limit'))
  $.ajax({
    url: profile.videoRequestUrl,
    data: { userId: userId, start: retrieveOffset, limit: retrieveLimit },
    dataType: 'json',
    success: function (responseData, textStatus, jqXHR) {
      // Append video cards
      profile.loadVideoGrid(responseData.other.videoList)

      // Remove load more button if we're out of videos to load
      if ($('#videos_list .video').length === profile.videoCount) {
        loadMoreButton.remove()
      }
    }
  })
  event.preventDefault()
})

$('#member-playlists').on('click', '.loadMorePlaylists button', function (event) {
  const loadMoreButton = $(this)
  const userId = loadMoreButton.data('user')
  const retrieveOffset = $('.playlist-list .playlist').length
  const retrieveLimit = Number(loadMoreButton.data('limit'))
  $.ajax({
    url: profile.playlistRequestUrl,
    data: { userId: userId, start: retrieveOffset, limit: retrieveLimit },
    dataType: 'json',
    success: function (responseData, textStatus, jqXHR) {
      // Append video cards
      profile.loadMorePlaylists(responseData.data.playlistList)

      // TODO: Fix.
      // Remove load more button if we're out of videos to load
      if ($('.playlist-list .playlist').length === profile.playlistCount) {
        loadMoreButton.remove()
      }
    }
  })
  event.preventDefault()
})