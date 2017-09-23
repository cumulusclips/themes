$(document).ready(function(){

    // Establish params for playlist carousel
    var windowWidth = $('.playlist-carousel .window').width();
    var slideWidth = $('.playlist-carousel .slide').width();
    var totalSlides = $('.playlist-carousel .slide').length;
    var gutterWidth = $('.playlist-carousel .slide').outerWidth(true) - slideWidth;
    var visibleSlides = 0;
    var totalWidth = 0;
    var slidesMoving = false;

    // Calculate number of slides visible in window
    while (totalWidth < windowWidth) {

        var proposedSlides = visibleSlides+1;
        var totalGutterWidth = (proposedSlides*gutterWidth) - gutterWidth;
        var totalSlideWidth = proposedSlides*slideWidth;

        // Exit loop if maximum width has been achieved
        if (windowWidth < totalSlideWidth + totalGutterWidth) {
            break;
        }

        visibleSlides++;
    }


    // Determine visible slide offset
    var maxPossibleOffset = (totalSlides <= visibleSlides) ? 0 : totalSlides - visibleSlides;
    var carouselOffset = $('.playlist-carousel').data('offset');
    var appliedCarouselOffset = (carouselOffset !== undefined)
        ? (parseInt(carouselOffset) > maxPossibleOffset ? maxPossibleOffset : carouselOffset)
        : 0

    // Set initial position markers on slides
    $('.playlist-carousel .slide').each(function(index, element){
        var position = index - appliedCarouselOffset;
        $(this)
            .data('window-position', position)
            .attr('window-position', position);
    });


    // Set initial position of slides
    $('.playlist-carousel .slide').css('left', (slideWidth+gutterWidth) * (-1*appliedCarouselOffset));


    // Disable direction buttons if all slides are visible
    if (totalSlides <= visibleSlides) {
        $('.playlist-carousel .next').attr('disabled', true);
        $('.playlist-carousel .previous').attr('disabled', true);
    } else {

        // Disable previous button if page loads with first slide in first place
        if (parseInt($('.playlist-carousel .slide').eq(0).data('window-position')) === 0) {
            $('.playlist-carousel .previous').attr('disabled', true);
        }

        // Disable next button if page loads with last slide being visible
        if (parseInt($('.playlist-carousel .slide').eq(totalSlides-1).data('window-position')) === visibleSlides-1) {
            $('.playlist-carousel .next').attr('disabled', true);
        }
    }


    // Make carousel visible
    setTimeout(function(){
        $('.playlist-carousel').css('opacity', 1);
    }, 300);


    // Handle clicking next slide on playlist carousel
    $('.playlist-carousel').on('click', '.next', function(event){

        event.preventDefault();

        // Disable movement if not moving, ignore click otherwise
        if (slidesMoving) return false;
        slidesMoving = true;

        // Re-enable movement after CSS transition
        setTimeout(function(){
            slidesMoving = false;
        }, 250);

        // Block any action if disabled
        if ($(this).attr('disabled') == 'disabled') return false;

        var lastSlideElement = $('.playlist-carousel .slide')[totalSlides-1];
        var firstSlideElement = $('.playlist-carousel .slide')[0];

        // Prevent carousel from scrolling beyond last slide
        if (parseInt($(lastSlideElement).data('window-position')) === visibleSlides-1) {
            return false;
        }

        // Move slides to the left one spot
        shiftSlidePositions(false, slideWidth, gutterWidth);

        // Disable next button if end of carousel is reached
        toggleNextSlideButton(lastSlideElement, visibleSlides);

        // Disable previous button if beginning of carousel is reached
        togglePreviousSlideButton(firstSlideElement);
    });


    // Handle clicking next slide on playlist carousel
    $('.playlist-carousel').on('click', '.previous', function(event){

        event.preventDefault();

        // Disable movement if not moving, ignore click otherwise
        if (slidesMoving) return false;
        slidesMoving = true;

        // Re-enable movement after CSS transition
        setTimeout(function(){
            slidesMoving = false;
        }, 250);

        // Block any action if disabled
        if ($(this).attr('disabled') == 'disabled') return false;

        var lastSlideElement = $('.playlist-carousel .slide')[totalSlides-1];
        var firstSlideElement = $('.playlist-carousel .slide')[0];

        // Prevent carousel from scrolling beyond first slide
        if (parseInt($(firstSlideElement).data('window-position')) === 0) {
            return false;
        }

        // Move slides to the right one spot
        shiftSlidePositions(true, slideWidth, gutterWidth);

        // Disable next button if end of carousel is reached
        toggleNextSlideButton(lastSlideElement, visibleSlides);

        // Disable previous button if beginning of carousel is reached
        togglePreviousSlideButton(firstSlideElement);
    });


    /**
     * Shifts positions of slides in carousel one spot
     *
     * @var Boolean forward Shifts slides forward if true, backwards otherwise
     * @var Number slideWidth The width of each slide in pixels
     * @var Number gutterWidth The width of the slide gutter in pixels
     * @return void Slides are shifted
     */
    function shiftSlidePositions(forward, slideWidth, gutterWidth)
    {
        // Determine whether slides are shifting forward or backward
        var direction = (forward) ? 1 : -1;

        // Update the CSS position of the slides one spot
        var currentOffset = parseInt($('.playlist-carousel .slide').css('left'));
        var newOffset = currentOffset + (direction * (slideWidth+gutterWidth));
        $('.playlist-carousel .slide').css('left', newOffset)

        // Update window position markers
        $('.playlist-carousel .slide').each(function(index, element){
            var windowPosition = $(this).data('window-position');
            $(this).data('window-position', windowPosition + direction);
        });
    }

    /**
     * Toggles whether the next slide button is enabled/disabled
     *
     * @var HTMLElement lastSlideElement The DOM element for the last slide in the carousel
     * @var Number visibleSlides The number of slides visible in the carousel window
     * @return void Next button is toggled
     */
    function toggleNextSlideButton(lastSlideElement, visibleSlides)
    {
        if (parseInt($(lastSlideElement).data('window-position')) === visibleSlides-1) {
            $('.playlist-carousel .next').attr('disabled', true);
        } else {
            $('.playlist-carousel .next').attr('disabled', null);
        }
    }

    /**
     * Toggles whether the previous slide button is enabled/disabled
     *
     * @var HTMLElement firstSlideElement The DOM element for the first slide in the carousel
     * @return void Next button is toggled
     */
    function togglePreviousSlideButton(firstSlideElement)
    {
        if (parseInt($(firstSlideElement).data('window-position')) === 0) {
            $('.playlist-carousel .previous').attr('disabled', true);
        } else {
            $('.playlist-carousel .previous').attr('disabled', null);
        }
    }
});
