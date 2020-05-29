class Comment {
  constructor () {
    this.replyToText = $('meta[name="reply_to"]').attr('content')
    this.replyText = $('meta[name="reply"]').attr('content')
    this.reportAbuseText = $('meta[name="report_abuse"]').attr('content')

    this.templateUrl = cc.themeUrl + '/blocks/comment.html'
    this.requestUrl = cc.baseUrl + '/actions/comments/get/'

    this.lastCommentId = this.getLastCommentId()
    this.commentCount = Number($('#comment-count').text())
    this.loadMoreComments = (this.commentCount > 5) ? true : false
    this.cardTemplate = $(".comment-stream .template")
  }

  getLastCommentId () {
    return $('#comments-list-block > div:last-child').data('comment')
  }

  

  appendNew (responseData, commentForm) {
    // Append new comment if auto-approve comments is on
    if (responseData.other.autoApprove === true) {
      let cardData = responseData.other.commentCard
      let cardElement = this.buildCard(cardData)

      // Remove 'no comments' message if present 
      $('#no-comments').remove()

      // Update comment count text and property
      $('#comment-count').text(responseData.other.commentCount)
      this.commentCount = responseData.other.commentCount
    }
    this.resetCommentForms(commentForm)
  }

  // Set load more button to "loading..."
  startLoadingButton (loadingButton) {
    let loadMoreText = loadingButton.html()
    let loadingText = loadingButton.data('loading_text')
    loadingButton.html(loadingText)

    return loadMoreText
  }

  finishLoadingButton (loadMoreText) {
    let visibleCards = $('#comments-list-block .comment').length

    // Hide load more button if no more comments are available
    if (visibleCards < this.commentCount) {
      this.loadMoreComments = true
      $('.loadMoreComments button').html(loadMoreText)
    } else {
      this.loadMoreComments = false
      $('.loadMoreComments').remove()
    }
  }

  insertMoreCards (responseData) {
    let lastCommentKey = responseData.other.commentCardList.length - 1
    this.lastCommentId = responseData.other.commentCardList[lastCommentKey].comment.commentId
    for (let key in responseData.other.commentCardList) {
      let card = responseData.other.commentCardList[key]
      let cardId = card.comment.commentId
      $('#comments-list-block').find(`div[data-comment=${cardId}]`).remove()
      this.buildCard(card)
    }
  }

  // Handle reply form setup when user clicks a reply button
  // TODO: Indent reply form to match parent.
  insertReplyForm (parentCommentNode) {
    let commentForm = $('#comments > .commentForm')
    this.resetCommentForms(commentForm)
    let parentComment = parentCommentNode
    let replyForm = commentForm.clone()
    let parentAuthor = parentComment.find(".commentAuthor a").html()

    // Clean up and re-use cloned comment form
    replyForm.find(".comment-form-head").remove()
    replyForm.find(".comment-label-text").text(`${this.replyToText} ${parentAuthor}`)
    replyForm.find(".form-actions button").text('Post Reply')
    replyForm.addClass('commentReplyForm')
    parentComment.after(replyForm)
    replyForm.find('input[name="parentCommentId"]').val(parentComment.data('comment'))
    replyForm.find('textarea').focus().val('')
  }

  /**
   * Generates comment card dom structure and content
   * @param object cardData The CommentCard object for the comment being appended
   * @return object the jQuery object for the newly filled comment card element
   */
  buildCard (cardData) {
    const template = $.templates('#comment-card-template')
    cardData.memberUrl = cc.baseUrl + '/members/'
    cardData.replyText = this.replyText
    cardData.replyToText = this.replyToText
    cardData.reportAbuseText = this.reportAbuseText
    cardData.datePosted = moment(cardData.comment.dateCreated).format('MM/DD/YYYY')

    const parentId = cardData.comment.parentId
    if (parentId !== 0) {
      const parentCard = $(`[data-comment="${parentId}"]`)
      cardData.indent = ' ' + this.getIndent(parentCard)

      const renderedCard = template.render(cardData)
      parentCard.after(renderedCard)
    } else {
      const renderedCard = template.render(cardData)
      $('#comments-list-block').append(renderedCard)
    }
  }

  // Apply indent class
  getIndent(parentComment) {
    let indentClass = null
    if (parentComment.hasClass('commentIndentTriple') || parentComment.hasClass('commentIndentDouble')) {
      indentClass = 'commentIndentTriple'
    } else if (parentComment.hasClass('commentIndent')) {
      indentClass = 'commentIndentDouble'
    } else {
      indentClass = 'commentIndent'
    }
    return indentClass
  }

  // Remove reply form and empty the main comment box
  resetCommentForms (commentForm) {
    // if it's a reply, remove the reply form
    $('.commentReplyForm').remove()
    // clear out top-level form
    commentForm.find(".comment-box").val('')
  }
}

let comment = new Comment()

// Submit 'comment form' and attach new comment to thread
$('.comments-actionable').on("submit", "form", function (event) {
  var url = cc.baseUrl + '/actions/comment/add/'
  var commentForm = $(this)
  var callback = function (responseData) {
    let comment = new Comment()
    comment.appendNew(responseData, commentForm)
    cc.displayMessage(responseData.result, responseData.message, '.comment-form-head')
  }

  $.post(url, $(this).serialize(), callback, 'json')
  event.preventDefault()
})

$('.loadMoreComments button').on('click', function (event) {
  if (comment.loadMoreComments) {
    let loadMoreText = comment.startLoadingButton($(this))
    let data = {
      videoId: cc.videoId,
      lastCommentId: comment.getLastCommentId(),
      limit: 5
    }
    let callback = function (responseData) {
      let comment = new Comment()
      comment.insertMoreCards(responseData)
      comment.finishLoadingButton(loadMoreText)
    }
    $.get(comment.requestUrl, data, callback, 'json')
  }
  event.preventDefault()
})

$(".comments-actionable").on('click', '.reply', function (event) {
  comment.insertReplyForm($(this).parents('.comment'))
})

