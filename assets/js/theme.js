var d = new Date();
var currentyear = d.getFullYear();
var changedYear = 0;

var minYear = 2014;
var yearToShowDataOnLoad = 2025;

$(function() {
    $('.annualHeading__2uJLv').text(yearToShowDataOnLoad);

    LoadCBPFSummary(yearToShowDataOnLoad);
    changedYear = yearToShowDataOnLoad;

    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $('#scroll').fadeIn();
        } else {
            $('#scroll').fadeOut();
        }
    });
    $('#newsTicker3').breakingNews({
        themeColor: '#f9a828',
        effect: 'slide-left'
    });

    $('#scroll').click(function() {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
        return false;
    });
});

//Previous button click
$('.previous__39nbE').click(function() {

    if (changedYear == 0)
        changedYear = currentyear;

    var objBtnNext;
    if ($('.next__d5jll').length > 0) {
        objBtnNext = $('.next__d5jll');
    } else {
        objBtnNext = $('.inActiveNext__2RFMJ');
    }

    if (changedYear > minYear) {
        changedYear = changedYear - 1;
        $('.annualHeading__2uJLv').text(changedYear);
        objBtnNext.removeClass('inActiveNext__2RFMJ');
        objBtnNext.addClass('next__d5jll');

        if (changedYear == minYear) {
            $(this).removeClass('previous__39nbE');
            $(this).addClass('inActivePrevious__2IRTL');
        }
        const event = new CustomEvent("d3ChartsYear", {
            detail: changedYear
        });
        document.body.dispatchEvent(event);
        LoadCBPFSummary(changedYear);

    } else {
        $(this).removeClass('previous__39nbE');
        $(this).addClass('inActivePrevious__2IRTL');
    }
});

//Next button click
$('.next__d5jll').click(function() {
    if (changedYear == 0)
        changedYear = currentyear;

    var objBtnPrevious;
    if ($('.previous__39nbE').length > 0) {
        objBtnPrevious = $('.previous__39nbE');
    } else {
        objBtnPrevious = $('.inActivePrevious__2IRTL');
    }

    if (changedYear < currentyear) {
        changedYear = changedYear + 1;
        $('.annualHeading__2uJLv').text(changedYear);
        const event = new CustomEvent("d3ChartsYear", {
            detail: changedYear
        });
        document.body.dispatchEvent(event);
        LoadCBPFSummary(changedYear);

        if (changedYear == currentyear) {
            $(this).removeClass('next__d5jll');
            $(this).addClass('inActiveNext__2RFMJ');
        } else if (changedYear >= minYear) {

            objBtnPrevious.removeClass('inActivePrevious__2IRTL');
            objBtnPrevious.addClass('previous__39nbE');
        }
    } else {
        $(this).removeClass('next__d5jll');
        $(this).addClass('inActiveNext__2RFMJ');
    }
});

function LoadCBPFSummary(allocYear) {
    showLoader();
    fetch('https://cbpfapi.unocha.org/vo2/odata/CBPFSummary?allocationYear=' + allocYear)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    //$div1_.textContent = JSON.stringify(data);
                    var obj = data;
                    if ($donors_ != null)
                        $donors_.textContent = obj.donors;

                    if ($partnersFunded_ != null)
                        $partnersFunded_.textContent = obj.partnersFunded;

                    if ($projects_ != null)
                        $projects_.textContent = obj.projectsFunded;

                    if ($contributions_ != null)
                        $contributions_.textContent = '$' + formatNumber(obj.contribTotalAmt);

                    if ($allocations_ != null)
                        $allocations_.textContent = '$' + formatNumber(obj.allocAmt);

                    if ($underApproval_ != null)
                        $underApproval_.textContent = '$' + formatNumber(obj.underApprovalAmt);
                });
            } else console.log('Network response was not ok.');

            hideLoader();
        })
        .catch(function(error) {
            hideLoader();
            console.log('Fetch error: ');
        });
}

function showLoader() {
    $('.loading-panel').show();
}

function hideLoader() {
    $('.loading-panel').hide();
}
// Custom theme code
if ($('.clean-gallery').length > 0) {
    baguetteBox.run('.clean-gallery', {
        animation: 'slideIn'
    });
}

if ($('.clean-product').length > 0) {
    $(window).on("load", function() {
        $('.sp-wrap').smoothproducts();
    });
}

var ranges = [{
        divider: 1e18,
        suffix: 'E'
    },
    {
        divider: 1e15,
        suffix: 'P'
    },
    {
        divider: 1e12,
        suffix: 'T'
    },
    {
        divider: 1e9,
        suffix: 'G'
    },
    {
        divider: 1e6,
        suffix: 'M'
    },
    {
        divider: 1e3,
        suffix: 'k'
    }
];

function formatNumber(num, digits) {
    var si = [{
            value: 1,
            symbol: ""
        },
        {
            value: 1E3,
            symbol: "k"
        },
        {
            value: 1E6,
            symbol: "M"
        },
        {
            value: 1E9,
            symbol: "B"
        },
        {
            value: 1E12,
            symbol: "T"
        },
        {
            value: 1E15,
            symbol: "P"
        },
        {
            value: 1E18,
            symbol: "E"
        }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

let $donors_ = document.querySelector('#donorsFig');
let $partnersFunded_ = document.querySelector('#partnersFundedFig');
let $projects_ = document.querySelector('#projectsFig');
let $contributions_ = document.querySelector('#contributionFig');
let $allocations_ = document.querySelector('#allocationFig');
let $underApproval_ = document.querySelector('#underApprovalFig');
let $updatedOn_ = document.querySelector('#updatedOn');
let $allocationYear = document.querySelector('.annualHeading__2uJLv');

var yearToShowDataOnLoad = 2025;

fetch('https://cbpfapi.unocha.org/vo2/odata/LastModified')
    .then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                //$div1_.textContent = JSON.stringify(data);
                var obj = data;
                if ($updatedOn_ != undefined && $updatedOn_ != null)
                    $updatedOn_.textContent = ConvertJsonDateTime(obj.value[0].last_updated_date);
            });
        } else console.log('Network response was not ok.');
    })
    .catch(function(error) {
        console.log('Fetch error: ');
    });

function ConvertJsonDateTime(jsonDate) {
    var date = new Date(jsonDate);
    var month = date.getMonth() + 1;
    month = month.toString().length > 1 ? month : "0" + month;

    return date.getDate() + "/" + month + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}


$(document).ready(function() {
    // Gets the video src from the data-src on each button
    var $videoSrc;
    $('.video-btn').click(function() {
        $videoSrc = $(this).data("src");
    });
    console.log($videoSrc);
    // when the modal is opened autoplay it  
    $('#myModal').on('shown.bs.modal', function(e) {
        // set the video src to autoplay and not to show related video. Youtube related video is like a box of chocolates... you never know what you're gonna get
        $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
    })
    // stop playing the youtube video when I close the modal
    $('#myModal').on('hide.bs.modal', function(e) {
        // a poor man's stop video
        $("#video").attr('src', $videoSrc);
    })
    // document ready  
});
