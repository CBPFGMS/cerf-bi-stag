(function d3ChartIIFE() {

	//Important: D3 version is 5.x
	//All listeners using the arguments in the sequence: datum, index, node group

	const width = 1100,
		padding = [14, 4, 4, 4],
		panelHorizontalPadding = 4,
		buttonsPanelHeight = 30,
		buttonsNumber = 18,
		contributionsPanelHeight = 420,
		allocationsPanelHeight = 600,
		height = padding[0] + padding[2] + buttonsPanelHeight + panelHorizontalPadding + contributionsPanelHeight + allocationsPanelHeight,
		centralCircleRadiusRate = 0.18,
		unBlue = "#1F69B3",
		contributionColor = "#65A8DC",
		allocationColor = "#FBD45C",
		classPrefix = "cesank",
		countryNameMaxLength = 60,
		maxDonorsNumber = 20,
		othersId = "others",
		othersName = "Others",
		fundId = "fund",
		maxYearsListNumber = 4,
		partnersPadding = 50,
		namesPadding = 10,
		donorValuesPadding = 10,
		textMinimumMargin = 6,
		nameWidth = 92,
		angle = -45,
		minStrokeWidth = 1,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isBookmarkPage = window.location.hostname + window.location.pathname === "cbpfgms.github.io/cerf-bi-stag/bookmark.html",
		bookmarkSite = "https://cbpfgms.github.io/cerf-bi-stag/bookmark.html?",
		fadeOpacity = 0.2,
		tooltipMargin = 8,
		circleWhiteBorder = 14,
		nodeWidth = 16,
		linksOpacity = 0.3,
		fadeOpacityNodes = 0.1,
		fadeOpacityLinks = 0.02,
		freeNodeSpace = (width - padding[1] - padding[3]) * (1 - 2 * centralCircleRadiusRate),
		windowHeight = window.innerHeight,
		currentDate = new Date(),
		currentYear = currentDate.getFullYear(),
		localVariable = d3.local(),
		localStorageTime = 3600000,
		duration = 1000,
		shortDuration = 250,
		formatMoney0Decimals = d3.format(",.0f"),
		formatSIaxes = d3.format("~s"),
		formatNumberSI = d3.format(".3s"),
		partnerColorsArray = d3.schemeCategory10.reverse(),
		allYearsOption = "all",
		chartTitleDefault = "Sankey diagram",
		vizNameQueryString = "sankey",
		allocationsDataUrl = "https://cbpfgms.github.io/pfbi-data/allocationSummarySankey.csv",
		contributionsDataUrl = "https://cbpfgms.github.io/pfbi-data/contributionSummarySankey.csv",
		masterDonorsUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstDonor.json",
		masterFundsUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
		masterAllocationTypesUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstAllocation.json",
		masterUnAgenciesUrl = "https://cerfgms-webapi.unocha.org/v1/agency/All.json",
		masterPartnersUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstOrganization.json",
		masterClustersUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstCluster.json",
		csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
		yearsArray = [],
		yearsArrayAllocations = [],
		yearsArrayContributions = [],
		lists = {
			donorNames: {},
			donorIsoCodes: {},
			donorTypes: {},
			fundNames: {},
			fundRegions: {},
			fundAbbreviatedNames: {},
			fundIsoCodes: {},
			fundIsoCodes3: {},
			allocationTypes: {},
			partnerTypes: {},
			unAgencyNames: {},
			unAgencyShortNames: {},
			clusterNames: {},
			clusterShortNames: {}
		},
		separator = "##",
		chartState = {
			selectedYear: [],
			selectedFund: []
		};

	let isSnapshotTooltipVisible = false,
		cerfPooledFundId,
		currentHoveredElement;

	const clustersIconsData = {
		"1": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4JJREFUeNrsWstx2zAQpTi+hx2IriB0BaavuZiqwNI9M5IqsFiBpZncQ1UQ5pJrqArCVCCkgigdBPAsM2uEn90lJeqAN6OhBYLEfh72A9nzHBwcHBwcHBwczoOJ9MF3H7/F+hLD1+LPpw/FuYTUa831JdSfk/7kei11UYW1AC/6srKGUy3IZmBFA335rj8RGjZKP+i1Ssk7fYEQUY2yBs/6Xjiwc1eWsgbGCF+kL/QFzyTCexLcN4yHl1T4JLx3FZAonDcodoJ7Q2LfMF5cTGGIkGtLafP3Qt8b1MP6fZm+bK1hE6xmY6SlCO3ZXBo1BWkp62PYiWBxk5LmEC1tSu+GSk2Q519qorSBYdlestZEoOyqY9pWC7LuqWxCTD3G24uzKAw59kicftunGtJr/a5hUBMeOFUeJ2g9M+Yue+7XgPHI0+BRGko8TlEx78HoR+b8Ocg3qIcTptUD8BTXuyEyLGdLJEMrvCQm/VxKtRrB0465awkrfKLVq9SQdXkWzYkFzcQTo2or0VoJldY+07sp6oHrEFmeWTLpXBl2Rywu9lxa+4wAlFH2blUNCbonPHdLLD0LtMUeeysMBUCAvEuhKPZyCO/g0JlbOu45tPYZQqgOOv9TGOZmVMtbdE45mx4aDEVllE/MvZUQU4IMU+uZN3nSpCv92VgBrVqnEFZoKdW4fgc1sXc9BqWrNjLHY1CLf4aq7YiUfl8FK2GxUvXosVhhCAgPVr6LqQpD4WE8t0a1btQQEFMQWnRWBXv+DuRtxQ0hCmKKU6usABQwHjWHe1UgOtW0eZUhE2p0bjmYGLR5iDhzQcEZRPkjHBgswBDGkOZYN9PjK6C54gascx/xcBQOEUNSUPoHUDYBjy61skdgwatxOtKRXdLG51a4BOELi5KYShnMUYhqG0TV2CpSqmOb/w7W4cRjPA8bb4HwuxaFX49d7IYcTkDuGox4SzwP21+a0vjsCgtMNVjdXMWoqtRYCr/Ro6cgP5nz1dgKG/zyLgDYJlehsCeh+FjwhZZuq3g4mDKpfEBj92N4uPD6/YAWEvO+Gs3DA9GY8qNbcK1Bqy5d1bWbuJA4MN99GFth1cPTaszg1ldhJXxWtdC2jT3lqJQ2LZngv3dK1MpFnDjR0GKycCN8ztTTX9H3NcH6JWr0Pa/7R+2q4ThZRp1BE5J7Dg4ODg4ODg4OV4S/AgwACGRWo71tfIgAAAAASUVORK5CYII=",
		"2": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAkNJREFUeNrs2FFOwkAQANDS8C/eQG9QTyD99Ue5Afz7ASdQToAk/gMnEH/8BU8AN6A3EG/grE6TDSns7HbbZepMsoGEtuzLbKfTjaN/FrGABSxgAQtYwAIOFm2fF7t4/LiCDzUSGB3tpz2MLYzs+/UuCwlueQZ/HUCLQoHXMN4Bv+QO3mB2qaEyP4XxAvg9O/ABvoP4exh9Q+Z/4YB+ZgsuwD/BGBKW+wDga9ZgDf4AHzPCfT6uKtutuosGot8Ihy4x23vWYETP8L42hXqUpT7RoRqPMfE4VfRWWAP4grH5yEKgQ7aWNh1XglWeNbhreXyfLRiWp8vkO47nBX8sqXtxR3gWH+vIrstU7TgAduWIjfC8UgUsDoBNSl5Knb+B63XPdkl7xBZV+iUs8ZH6D8pSryvDkwqw+RJfAFZde0cpanWBR9gm+gyVzRS/53Vhhr16ODD2zROc3LZCbB63p05s14DVl1nq4V4+hVXxGSTDBdi+IdMZLn31+yWMXvS392WDHZj2yVo1YfWYI0zP9NEXfm2fjIKdm+bWrhmr98T58p4aJjrGXZLSWO9gixf7CJ+ZN9RNAB9Yr/ewBXYOExxYvjt7wXoDV4U1hDXWC7gOLJyXL+sMi5cTtnSVDpTZMBsAHLHOYK5YJzBnrDWYO9YK3AQsGdwULAlsgR2dO9bYSwN2SMQ6NwLnluGsSVhSpwVZVk17twlYatHqHdmhYIclgfG9NT3YbmGJdWkpE9M2qATn1lLAAhawgAUsYAF7jR8BBgCbLQD8Xd/0GQAAAABJRU5ErkJggg==",
		"3": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAflJREFUeNrsmc1Nw0AQhTeIOykhHeBUgLlyASpIuCMhKkioACJxJ+kgXLjiVIDpwCWYDpgRz8IsWXttbxJ+3ieNNvLP7LyZXUeaNYYQQgghhBBCPOh1dXBw+RTJ0C9dSt/uT/JfL1iEqahY7Egswu8qUthKbOmTBMxxJnaIOexkFmSwFeZIfJPc8whiLMMpAunCUmwmgSWOOUYeSazz/yj+560FSyBTGSaO2zmya9NHZVyo4GsJLIVQ9T9wPFtU0mZQ8c6N+J66Jt9vmEUNdoEllNUkK4bwKys4vf4i97M1QWelSiWey7/R6mtS4eO6IGrEP1RUJUfV5y39q99n+K+s8J6v07ZiS+8OHVtAqzpsKxb+XUu/veCu4Ct6vubWRd32CMnWBJcqsbT+s5NtxrBVweDV2rvmrwveKRRMwRRMwRRMwRRMwRRMwRRMwRRMwaZ519JJ6QQiC9WyQWdS/eba1t2ZYHQJixbpt9MBua+Dik5Ms5OHss9ojU9j+Uw3KhjtVm3bxh6Pa1LGsFt5dybjncPv1Hz0r/sefmPYRN5T8YsmHc8mfenEdDsKKaqems/GeVGhqKPfFMnSJAc7eYgDbKGB+dqMjwJ9Qrz98CttMcdSDsEIS9nepznmeQw0T9Z6D28CfOGLZf2jD88JIYQQQggh/5h3AQYA8Res+qAu5JgAAAAASUVORK5CYII=",
		"4": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAZxJREFUeNrsmMFtgzAUhnGUexkhI2QEeu2pIzT3SmkmSDpBg9Q7jMCpZzZIMkEZgW7Q5+o/IVzAgG2i/5eejBLsvM+/sV+IIoqiKIqiqHvWw+tXrMPHb688wD5L860D106lHIJupPmQaEIWEoefz6fqbhwW2DdpLi2wET674J5lOwxXM4mkZ5dSYjen2ysHrrbB1oimkrndVh5c1c/sDteZYZnP5raaGPYkzV4iNriqAYqWXTv7p08qfU5BAUvSWyS9NdySYyeuTeeyNEcJ01K+YrKu3oHh6tHwdYVEy55jJZi4jeGW97FuqxldPSPBemgVNqfbygI0RjKTuDrGbT2pQydUTZyElasj3B48uSqEZeby8VETuPp3dDgqyU1HXm+3VQfsC2CXJA2d25aWpaEEDFU1crarpVHWpY0JKAICLBqAaVcp2vnnAQd9iUrpUdpbQMA35HTQOfYpStZ9RsWgwUryO2OnDu8Vj28RmMAEJjCBCUxgAhOYwAQmMIEJTGACE5jAS9Paok8edbzsdqgqoiiKoiiKClW/AgwAtoipDtc9i9MAAAAASUVORK5CYII=",
		"5": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAqtJREFUeNrsmUtOAkEQhhviXrwBnMDxBMjWjXCCwb2JcAL0BEDi3uEE4Mat4wnAEwAnEG9gFfmbVNoZFZlnqEo6w7x66uu/qrpnMEZNTU1NTa0wVsnqQae3L5e08ajVnFMbaovPx6uw9MAEWafNgFo7AtREgM+oPRD8qlTABFoDaE8cZgXfsJXGyjextTYC+KbwwATLYTulVodqY2rBb6ohGrrU7hANfH2H7lsUFhiwr3CYlbyRoBF5/C1/Af4Exfl8K0noSkqwrOiNCO+eUC4ufzkSRjaM6b4nKJ4odJLAc6gnYdtQy4JyUXpnVbHP15+jqFnwjlVcQHMUXBQGmBy7R5HaOUbHuoC1oP24PEYYDwU4p0LgDCQXsfvcgRGyS6jYYCjk6qt0XoS2rMi2cm9D2RkkDuMQqTKH+o1DK3c1AYG7Im9XALNO9wHbxqAMnOnnEseWfA1U7ePctg/kboBndA91NglgH9uxGAAO0ZCcHUHtKRzm0L6g4xVu/BvH+NyUr+V7oHwdisu+/VxDGmp+8JxJjjacnGuhOM0xAH3ARPXTQw5v+xEpIWvCEv2cHRLWhyrsiVy0xceD4yGK0E7tuE5cVXEvFzgPg2rECs3LM6Ttw9fY1h3nrp2Q3M3ZAsQ41zRjANdFAI5bSKyd83IlNUSYLx3o0Bm09Z7PzAR4BkcD7K+wP8P+hH87OecJxz0R1vZtaeL0befuwOm72O/DcQUq6+dXTfa2ENFgjgE4V1Ng/Yj3v/fhv9gGLxazsircNvvNkTV8FNCQTtNOUpp2WnELfKyu5mJFVXqFn396m8G5iVZpBVZgBVZgBVbgVID9iO9V7sLDzws4jZUWr6A+CExDWoEVWIEVWIEVWIEVOCn7z5/UqzIvLQOz/1+ZI6Ompqampna89iXAAKnGKTUuHhXPAAAAAElFTkSuQmCC",
		"6": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABNhJREFUeNrsWktu2lAUNVHneAd1VhBnBXGmnYSsAJhXAq8AWIGD1DlmBcGTTmNWEGcFdXbgrKD1jc6tTp/4GIONRf0ky/Ds93LPPff7iGW1ox3taEc72vH/je73n24T5Liq8W85OWiHFGBfNOCPH99W+W1AU71LZ1hGmjPr4XPGjF8U4BxYDyyH+a2P6VhYrtu3r2pkVk14LSzn4DN8bw7gTYFF5kj4ov6baNACy56hDKcpDIuQUwYOZkTIwQEmLesF9Ein8rkF5uSZV5dpdwoKPBXhEGl1bkC+aIPFXXuMRVGiRICc5NctResU7J/fh3NBpgpc2SbhHDDk7NnjKb/dAawoKQPYB7xiNypogV25AgVH/igABvBvd0elFeHrM8z5KwWtZNf62gCzADBbX8xR8ynYH0EZE/j3eEvg0r1UUWrOCSzFrTpqdwoGHBEsM3x4ATOMAFa+z/BugvdjWa8pCMpzYdoWKq8MSszwLJZ1Zw1aENYBk5EKlM/9AjMhgIs/riH8HRQwphjgkkLk+Ts+i7KWWCdKXO0LgnX4sETYuQiUC65+/AghBwAu9xsAX8LEQ4roGrAewOYE6x0KaFmVAezLoR0PriU1Aj4AZLjEf+8BZq5+SlFc3n0Dux4CmIWU1Yw8vCWnag5egK2M2JoRCDV5VUAfYG8APMB7SygjorSVwbLOXktriuoDxBPMUFnUoKTVVABAGom/AtgIyhkaKcoy9jubSVtGPxuRYPdk8lwvBwBlg0FlWf2U/XiTNXl4lpwikHWOWQxhNED1iNkEcy8AdgvgPoF9p+DFuTikAsWC4ibkImLuy7Kp69j2ULTuE5tzABAff4VwKjQLPocPp+SvKUCPSQn2hqApwfJFUuIhDczJ+mH80Qw+/QAWQzL7EM/1+xq++4bLI4tIDaAucvgt/Jz3EvALAPeqjtI2AlIK/3QAZoV7l8z8s4jI1zzTOxnMVv3XQ+Bz8XkG5j0tWjacoIyMvnpYpNsqy7AKP0YllUAwFWAJhQigV5ShEZ1wvFGaSih/25TedjYy+XWPQKlWsShi4lclTViBhVQ2ar+rOXcGNrVmDigw2eSnHvm6BqagYPUXw9wZtHNqhkf0eWb0uyme+1SMPAK4ba6BYiLqmmbErruPaTqBmdPU4NR52DWiZmq0gAlOSBRAQL7eNXK0g4KD9/57jHtAucl7dKuM0oF50AfTDvWwgIqOCaUrm9jjwNMnsKMDagHuvz9ODTgxGPknH8K0lSmfamefOqGA9kkNi7GKHN/idGSK4qbS0tL0KxvBQqOuRNAVmJe04lMaGaIa61H66RLLMZWnpnL5BGaEPew9hByfh6HVSQEriJF+0m1lICJqRmyqBUiay6A0PiXxCvTK17s6rDKAvUPNiMCw9tfm1kZJWeZsS5R7XUWl9dtq5pC6YFhVP9zEEVVVWi4bCDblU9WTAsbGacMAFyLhmMJj1iCwGbqt6gCjFWsKy3P6vbnSA4BhA8Amm3rmSgCjoDgn6BQ9cX1HPDDtc4CWIuaxqCkfVXhsKUZ6OOWo43feuAzYkwKm2jiwqvsfLAE4Q0dWanSqkAr19sTodY8F+vkLRxlWKwdsMN5DT+yWABmjXFwdC7QWwFuYd6zdvxklKBMTqx3taEc72tGOyx5/BBgAYdccTE/kRqUAAAAASUVORK5CYII=",
		"7": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA61JREFUeNrsWkty2kAQFS720Q0inyD4BMA2G8MJDPtUASfAOQFQ5T1wAsMmW+QToJwgyg3kG6SbeuNqT41AII00SqmrVPowkuepu1+/HtnzGmusscYaa8wZa5X9B7/8+NWjXQ+n0fvL991/C5jALmg31S4vCfSs9oDhyYTARDgPaPcnZfg9jYsxrkM7n85DG/O6swDUp+1IhwfajnQ8wk/BmdsC3MtjT/fyM/hZTnsYE2SgHXE5oe0BoA4pt/ZpiwFWguTo6JO3E+c8jFA8amA9AFggRCPDrRF+W2tgPTzriGe742Hk66thwtIY1JbBi3HsOSasJ8HcJuNxwyLyulUA2GfazUsi2Z8E+rkSwAizxQXP2DD28kyxv3XAADqhbVSxaNrQtroWeCtDbvogj6/wZuCYWozh9b84js/lejvDA18dl8eBFm39XCFNXh6klAzXjJl8fEmbt67I3Z54owsHXoAqaSdJmrVk5WFpld8JBMVA5LcikieM4fN32h4NwoQn+saPxG8x6rUvxvK1nbz31ppspXlAo/CJ3NQEtbp9qquQpB3TeOe0NHL8MQODK009koDh/UvEqGTpSnVVVQgPHxO9Rng8IPQl4ASckNVYdCxvnXc7x8saGcBGAPCW0iREiAgZuku65hlIUOW0nh4LGh/eqrTyAP5mEAAccpsrZaKX5jFE0dSg1f0qPLzVCj57YY1lHGbU/S3rVQCpeGGQoqyiSkgrgyhJRNkJRUgrkuLmPhQLe6aypUfEOA9xFcHSPjw9yaCzE3hI1tcgY+hvr0yXUpZ4OgjDbs62UUXGHpERFzVHq8u0IlTnGUHOigZobU0rxSLkZRbj1OjaBFsG4IVGQlx+hnLJRpUmVdv1Ol0bwILMpEKaIXQ/yIiu9TXQ87p6WG8GzsnBVdp9dQtp56xt8dlKV/sI8TVY2NRKyjDe1NLD+Dwy1pqNo1afJ97nrxWJ6aU41Q9nIK9RxiUhLkfDW7sgZwALBbY+Q0g7aOTE9lxK+yAO0AeDp0N4NiljHmV5+FJXVfhn0SpzWLaD5zokBntvG/SdZbABPCtLjmTuoWjmfa+Erxy2hcdEhDHLyLEhlIdCbvaK/PhdBeCO1ijotTpGdyTFxqDOgBMBLjwz7reW47UFvNfIK8264gXtagsYa1ChyGdPaw/lKuUp7GvN0hoTMyH1IB2X2NimILZNni8KrgmPj5KDhl+WLW4eVnn/WcVJ40YCINW59TLUWGONNdZYYw7bPwEGAKpmb0hI2mYKAAAAAElFTkSuQmCC",
		"8": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAsVJREFUeNrsWlFOwkAQBcK/PUI9AfUE4q8/6AmQfxPhBOAJxMR/6gksP/6CJxBusJ7AegKcMbPJumlLS2fbpexLNi1tt/R13szODLRaDg4ODg4O1qDNebOz+/cANjcwYhjRz8u1aDrhGWymyqEIxpLIx40jrFj5CUZfOxUieSAeNYqwQnxM1va0UzFZ/hnIbxpDmEh7ZO27lEuEQl6kzEelDGiLL+i1jEpMWnghrQj7+LD42c+Y8keGFNGDEWRcjyq5OCQotpkJIrFn8tdvOjWBB5srQe0hQeZFEcI9R7VamOS3IsvokBIM9lg5C8I6Sefw2aLktjDWuM+1rLUN+e9niqXz4tbU8mU6aKGlR/DwYco1KO837eUIuP7c1HN1Da5KExhfJMlEUJS9AOI75fDj0a7DBdSwq8K6iI5luf2r6S+wiTBG4bkrYB0sD1pULialkqKOBgF3puVTx+OyQBops6p/jQK414rycNYSsstEtExK6dPAF7WAez0CyRkVIh63hbkSj4Ahf5aYAmmhvIxGr8MSQ21rfWq5oZRySz4aq76oBDKfiv1+yWKjVsKpxYKSQ28S4sCY4sBxZVr7yGbMqyTLstWHHWEblyXpi7OsGjgDfWXfs5YwEMRAM1bX0db/n1tKvUCrJE395vEp+fDw1Hx4n/TWBX1Xh2ebhQOt6rnFxOPAbseI5scmfZkz05rIXjL4do98+yOnhUOZsFDltbBO0vRgurUjzTLTA5TSs7IBQBF6pR2OqCCQBPL0mKdKwSGoLlZxztkZ4S4eblLI5LVykNIgYCNcJmhVtSQNapc01bOfFS6fbLI+1MJeq1r4dUtaVEx4U6ukEyS+0zMskOBVgfkrPeOC+UZ65lz1MPefztampNKxTXLH0vHQLbwsOH9ZVYzgSjww8d9K8kUbcng9+LEa/d3Ppg4ODg4Op4BfAQYAWQjokdAE5s8AAAAASUVORK5CYII=",
		"9": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAxxJREFUeNrsWstt20AQJQ3fww5MV2B2EOqaS+QKJN0DWKogcQWkgNwtVSD5kqvsCkx3wHSgdJAZ5G2wIcQVudoPGewDFoLNz/LNf4aMooCAgICAgMEg9rHphy8/EvrJaWUnDh9pVb++f3oZNWGQnNJ6aCF6Cntaa5PkY0dkl/TzlVaieYuK1soE8dgyUdbkUw+NnkNJ65GIHwdHGGQPF2hVpe2JLunYItk3i8ajTfrKomZtQnuPK8NkE/hsEtlHRvsVvjW8NBigOu0Hi3JPmDZOkWNdo/Cl4bkjU24i76Nlk4RnHkvkmVPCkHDqkfDUtYZzz01QihjijPDdADo/p4TTARDOXRIeDVwT5tp3gaWqg7kNnHBnZPoBrh0T5p52g8het9TDNZ0zEcTpvBvk+EFpuNY4r1ZYgepvlVU4I/yzaxnI6UNqMtqagiWsIO+h3U5CN9IPO+h/z5IlN7h1pmHarOph1jbw4tqHGXuPhNc+CK99aRcW5pYwbVrbyJsd0GtP04VH6diXy76zaqOEMUW875E7L0GlY1G2xrRzRZ49dvT3z1H7fEx7TGtzED+N2ieYXGKWimu54Ni1XDu8QXyjIGl71cK+vm3k0AyabWv1NhCW3VctKAUz3ZdZdP236M9EU3fIx8JZOHuZhtq2kKqaZy40OBVBGHNoRvjoqzjeEBqfN4v6vS7d0n2MFTVxT/NkU/uI3wT+lCo0x2ljdeJeKUjzupEmJq+SUKtLTNe4D0MAuw7jnQ09+GL0E48eDcMcaeq/GPE8dzwvHQrhi9MSae+tQxBiX3xU5d7REAZpjuDLMyXgE1zgXo7ectqDJaQNQVUmA5ixwgORl6urOzw0P+i7NLRjUgccm4DMQ/Tv50u1FKWnuEcuCW6LIDi8bzwUBczhRCoTraVIdUK7RwhDfAGU4n9/p5+ug5ZuNyWbbCk1E4Ika3UG0+dCZQWBiEqrQL09bA03Gotdg3jd6KYyaDuDmwg/F5Zx24wFgyXcoZs6F/G1TdobYcmnCwSopAPRPdJbPYqgdYZ83tIWWv3YNCAgICAgwCN+CzAARHAgQDk4IuMAAAAASUVORK5CYII=",
		"10": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3tJREFUeNrsmU2O2jAUxzOIfdMTDJxgwg1g203TExD2lYacYOAEQ6XumZ5gYNMt6QkmNyBzg/QGfa/6W7LS2Amx4wlTW4oCIvZ7P79Ph1Hwn42RB/bAHtgDe2AP7IE9sAfuaYxdC/zw9WdEtxBfy9/fP+Uu5d84BI3p9kjXpPJTQVdK4Id3AUygbM0HutYNj+7o2hJ4ebXABDun277GqqrB1l4RdHZ1SYtgN3Q7XQAb4NkT5l4HMCclul7gxirX/UhWvMHnuvHAayDBDdelScE1QMO27trg9iXiejcoYFJ6AqXnikcOgC01iY3nx4r5GeYXbw6McrNXWLWEogfXa1kHbmmVL5eWGaz73NVbegF2EXcN+aDEZma9ArdoInLsfm4pN0TY2MhWszK6UPhJA8uCZ5yN2QOQyDonQXhRiTW3ikfXqNuRVWA0Ai+KnebMOSPFNoA8Y2PO9D3pAJtIa3AtnvDaLAOyqiPCcxtjYHbhFk3ETHLhpBJzyw4GlueEWDOAjFmLZiU0OR6uFVa1UiIuHYjVlKB+KcpXBJ03NltLhpwqYHdIXGJT0g7rp5grkuCuBvyvDtDFai99kIQLq+pq6xxKZrjPO1QBeY1CVedZB9aFdaroeDAqS1CCXSXXpX90Sc91Vqd5aUs5J0UIaddoq6PVwwMJPWuOgtOmPhjZea95ZGqjlx5Zgo0bzr33LZa5N/zd6Xn4sxRDdRk9bnHaiqSEV+3egqY1nAEjfhIpydQlvgm8QDXEb98UG/aENaIhWFh0U1tFwjlC6WVDs1FQjD6p2laDRsY68BLWLTXvqdhycV0XJLnzD03DUUCGsVuPDd05grILTdK6hYU46SQ0h634KDUZMTar6Ti5FQcFk9OYkYUhWLynUsVXhM0QTUGMMEik2C8bsnwAGStFnnDn0lLc3amAsTElDiHis9iA+6DlXy4sy/RFvc3/llQWChG7K3RSc8lKJxwAFq4OIDbfS6coH3LtzAUMLLiAZUXs8+eFwrrZoIERY6+VBoRdNRNuCLCjXLJc/3vY118tnSAqjcVRSnqDBS4qyl6aUcOaTQuvAViM147rlJpGZpAubQqU9xXb4zeAvZXc9c618D6TVq6p1wWusCHp5YMGRmlaoAytFP3xCn3xFp//mS+djvid1Szw4/qSlgf2wB7YA3tgD+yBPfD7H38EGABNForhqWlJKwAAAABJRU5ErkJggg==",
		"11": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmhJREFUeNrsWktuwjAQDah7OEJ6g/QEDdtugBMA+0qUE5SegFbqnvQETTfdAieAGzQ3KNygM9IEWVY+Ezc/O36SZSV4nDzPeMYzxHEsLCwsLCxag15RgcHj9xw6ly6Dy/tDxJDxofPpcg8y+5zxQ+jwOdif6Tnn2gnDi2ygexJu4Uu85YlJMohXaJcMmTE0T7g+AeG7WgnTqv82aI2jPMvgoF9grNfw9vPLmIRNmFb33CDhsIxJbgqOX0HbinuL7mUBt8JGcHS4aIucxZuR07rueVjwU1Ne2o1fnrunQGYN3TNdvoDcmiHjxV66LLJKhJnOLQ4pMe7FsATtIHn60sJO2SbNwVEw3zTnIzsgXJBpHYT7FczpKsgM6/J8fadjaAtht64H5TotycO2ASdqHyonLx1N2qMosANl7ChMdmYPo7c/UijsjNNCsp9d89I+ncw6FZYmNg5bwh0kzEke9grzyjWpLER4iJDPOwkZVzvTQyGXPTKHT+HEFKbk3T8FHsvKsysxaUrYF4yhQRJZmiMqaF2DxjQsaAlDxTbBNJHMKo2sgpXEWMCcQd0FAFFLSCikQvy1wsEs2ahUSXPP1ZUSFoirOD5crGVB5xc6FpoD93bRlFD3g8fmPwWJnm7aJc+NJd1bldKubhpeCjnw3GiTFgr8MnljNSz/x+zSwcZYwjPmPf0JkyaTQtHE1KrlOOO3uVGEE5zVv8xaBw3nOSaXW7HUhfBY0aFpS5hT5jFKw9zU0BjCX4wxB5MIB072Fz9RXllHK8KUEY1SSKMpF/o2RJv0MOHrICQb1vX1j4WFhYWFRQX4E2AAHgyvX5nZrxwAAAAASUVORK5CYII=",
		"12": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAlRJREFUeNrsmrttwzAQhiXCfTSCPUE0gtWmsjdQ+hTWBEEmsIv01gZ2ldYaIRsk3sDZICRwCgjDFnnHhyjkfkAQYFG8+8zXL0pZxmKxWCzWdPXw8rGRR5FAHoXKBXufQAbZy9NWHqcxoSH2SeUCOVkrR8LW2k+f8qh+3p8uI8GW2s+tzOPZG/AN2FGg78CioIUDbAaBB7u3vFYigEoirFJt072FaYIagDVCQwIrRCOubiVtAatDb1xauIVum2GhDT3DlPSeANsPsXaowGzoohqbMmBlGbCHrmAmrx2Gq4JW5wYJa5xPjGMYKqgQLf3lCPsHDXV5g7Veh5HQPtfnwicsynggoWMJvSyinFZi0CQPILBREoEmGx5BiQaB1iMCr6nujgQMa+NhROAD9eFFEAPuLZeLUDJaWm/ABLuYFPQMCauCnOXxhrit0+6fw5/VJ6nG4VGOx+/rskhw6/vyWM0Bpn5753IjoXcx8sgTgI0KnUeAnYMnttFC695BJCI08CpQ2WSBi0BlkwVOSjGAL4HKJgt8DFQ2TWCYdRuLok3oGZqNh0XSS3laImN0Eqa7spaPMF7PurV0rd+7l4YH7y3hSanTuvdQSyrYV2Q+u2BjmLd4JgZLnqV5iye+4m3xIN/1JLXbgQZOBNYJWkwUlgwtJgxLghaeYdVysfC0ZGHqsoYWnmErcFOu6zSlLitoUwvXGeH9rKM5camrzAzvpoXBYCif2lJcj5Zoh4DtDHWZoFvTU9e/+2yJP0yzhB4F9g60NSx552LKH5eyWCwWi5WQfgUYAL6LYU7if3yIAAAAAElFTkSuQmCC",
		"13": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnlJREFUeNrsmt1twjAQxw3ivRkhI4QNyGufyASl75VoJgAmAKS+h07Q9qWvZIMyAiOkG/QsHZIVxcHnj+C295csRBIu98N3zp1BCBaLxWKxWKyBNBryZndPnxm8zGAkeKiBUX+/3J/+DDBASrhnGEsFtK0zjFcYO4BvbgoMDm/RYYEOlcQZfYORGn5EgheUGaf6N7pibAEvVevwIxg9GMIee2ZVJznDuQm0jX/jKzZTw2NdYWwDK/AzR7QhfPs3DpQqlSWsCl2FcGwcYJGSoTz3YGoOttLogUEPHm0tfwNwFqmtYMBppLYY2JfOkdpiYF/6iNRWMOD3SG2RgWWNW2JxsYYx67oI6lgZhjsPvu3QVldxM5M+4NsSfTPShODABsZKKRlXcFNdob7Bvtf2OXpCGyYNQ4PXbkPMcLs+rtCB9izLawvLRefSIjaG3VFCmWEfOayDlo5P5Y4GwZa8dtoVyhrYoDmc9nyT2pmGkcseFcO0D1SmR06YWTXy0hA5vMQFYqtp/SS06MppPHbAHred16e+bR0D2NI0f6nACRq2glZy2zjECbBJqBxWofvC27kfRhteYU2AawfozAE2c4DtjSDqrmX7xgfNucv5nLrnbLD5J4uahea8266l4sSXZRFBgnbY6bwsflNfOZxTHu6t8D+ahLcjbIM++lm0lMpJWEKbLGJzYb/TWZj+YmG8SoPBWlff3lgb9M3/YwkMr4mlYmjV6FPQfriwzGffskozMrBjPvtUYfNLo1W3FEE+k/LWS3t4w3wm563PfnjofHZOJydgzKH9gMB7138IjMU/EwMzMAP/bk082Kgju4bFYrFYLBYrDv0IMAC3PAuok8YHoQAAAABJRU5ErkJggg==",
		"14": "data:image/png;base64,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",
		"15": "data:image/png;base64,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",
		"16": "data:image/png;base64,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"
	};

	const clusterNamesScale = d3.scaleOrdinal()
		.domain(["Food Security",
			"Health",
			"Emergency Shelter and NFI",
			"Water Sanitation Hygiene",
			"Protection",
			"Nutrition",
			"Logistics",
			"Education",
			"COVID-19",
			"Coordination and Support Services",
			"Camp Coordination / Management",
			"Early Recovery",
			"Multi-Sector",
			"Multi-purpose cash (not sector-specific)",
			"Emergency Telecommunications",
			"Mine Action"
		])
		.range(["Food Security",
			"Health",
			"Shelter",
			"Water",
			"Protection",
			"Nutrition",
			"Logistics",
			"Education",
			"COVID-19",
			"Coordination",
			"Camp Coordination",
			"Early Recovery",
			"Multi-Sector",
			"Multi-purpose",
			"Emergency Telecom.",
			"Mine Action"
		]);

	const queryStringValues = new URLSearchParams(location.search);

	if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

	const containerDiv = d3.select("#d3chartcontainer" + classPrefix);

	const showLink = containerDiv.node().getAttribute("data-showlink") === "true";

	const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

	const selectedResponsiveness = containerDiv.node().getAttribute("data-responsive") === "true";

	const lazyLoad = containerDiv.node().getAttribute("data-lazyload") === "true";

	const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-year");

	if (selectedResponsiveness === false) {
		containerDiv.style("width", width + "px")
			.style("height", height + "px");
	};

	const topDiv = containerDiv.append("div")
		.attr("class", classPrefix + "TopDiv");

	const titleDiv = topDiv.append("div")
		.attr("class", classPrefix + "TitleDiv");

	const iconsDiv = topDiv.append("div")
		.attr("class", classPrefix + "IconsDiv d3chartIconsDiv");

	const svg = containerDiv.append("svg")
		.attr("viewBox", "0 0 " + width + " " + height)
		.style("background-color", "white");

	const yearsDescriptionDiv = containerDiv.append("div")
		.attr("class", classPrefix + "YearsDescriptionDiv");

	const footerDiv = containerDiv.append("div")
		.attr("class", classPrefix + "FooterDiv");

	const snapshotTooltip = containerDiv.append("div")
		.attr("id", classPrefix + "SnapshotTooltip")
		.attr("class", classPrefix + "SnapshotContent")
		.style("display", "none")
		.on("mouseleave", () => {
			isSnapshotTooltipVisible = false;
			snapshotTooltip.style("display", "none");
			tooltip.style("display", "none");
		});

	snapshotTooltip.append("p")
		.attr("id", classPrefix + "SnapshotTooltipPdfText")
		.html("Download PDF")
		.on("click", () => {
			isSnapshotTooltipVisible = false;
			createSnapshot("pdf", true);
		});

	snapshotTooltip.append("p")
		.attr("id", classPrefix + "SnapshotTooltipPngText")
		.html("Download Image (PNG)")
		.on("click", () => {
			isSnapshotTooltipVisible = false;
			createSnapshot("png", true);
		});

	const browserHasSnapshotIssues = !isTouchScreenOnly && (window.safari || window.navigator.userAgent.indexOf("Edge") > -1);

	if (browserHasSnapshotIssues) {
		snapshotTooltip.append("p")
			.attr("id", classPrefix + "TooltipBestVisualizedText")
			.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
			.attr("pointer-events", "none")
			.style("cursor", "default");
	};

	const tooltip = containerDiv.append("div")
		.attr("id", classPrefix + "tooltipdiv")
		.style("display", "none");

	containerDiv.on("contextmenu", function() {
		d3.event.preventDefault();
		const thisMouse = d3.mouse(this);
		isSnapshotTooltipVisible = true;
		snapshotTooltip.style("display", "block")
			.style("top", thisMouse[1] - 4 + "px")
			.style("left", thisMouse[0] - 4 + "px");
	});

	const buttonsPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "buttonsPanel")
			.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
		width: width - padding[1] - padding[3],
		height: buttonsPanelHeight,
		padding: [0, 0, 0, 0],
		buttonWidth: 54,
		buttonsMargin: 4,
		buttonsPadding: 6,
		buttonVerticalPadding: 4,
		arrowPadding: 18
	};

	const contributionsPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "mapPanel")
			.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
		width: width - padding[1] - padding[3],
		height: contributionsPanelHeight,
		padding: [90, 0, 0, 0],
	};

	const allocationsPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "mapPanel")
			.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + contributionsPanel.height + (2 * panelHorizontalPadding)) + ")"),
		width: width - padding[1] - padding[3],
		height: allocationsPanelHeight,
		padding: [0, 0, 50, 0],
	};

	const centralCirclePanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "mapPanel")
			.attr("transform", "translate(" + (padding[3] + (width - padding[1] - padding[3]) / 2) + "," + (padding[0] + buttonsPanel.height + contributionsPanel.height + (2 * panelHorizontalPadding)) + ")"),
		radius: (width - padding[1] - padding[3]) * centralCircleRadiusRate
	};

	const defs = svg.append("defs");

	const centralCircleGradient = defs.append("linearGradient")
		.attr("id", classPrefix + "centralCircleGradient")
		.attr("x1", "0%")
		.attr("y1", "0%")
		.attr("x2", "0%")
		.attr("y2", "100%");

	centralCircleGradient.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", contributionColor);

	centralCircleGradient.append("stop")
		.attr("offset", "100%")
		.attr("stop-color", allocationColor);

	const sankeyGeneratorContributions = d3.sankey()
		.nodeSort(null)
		.linkSort((a, b) => a.value - b.value)
		.nodeWidth(nodeWidth)
		.nodePadding(null)
		.nodeId(d => d.id)
		.extent([
			[contributionsPanel.padding[0], 0],
			[contributionsPanel.height - contributionsPanel.padding[2], 2 * centralCirclePanel.radius]
		]);

	const sankeyGeneratorAllocations = d3.sankey()
		.nodeSort(null)
		.linkSort((a, b) => a.value - b.value)
		.nodeWidth(nodeWidth)
		.nodePadding(null)
		.nodeId(d => d.id)
		.extent([
			[allocationsPanel.padding[0], 0],
			[allocationsPanel.height - allocationsPanel.padding[2], 2 * centralCirclePanel.radius]
		]);

	const partnerColorsScale = d3.scaleOrdinal()
		.range(partnerColorsArray);

	const inverseContributionsScale = d3.scaleLinear()
		.domain([0, contributionsPanel.width - contributionsPanel.padding[1] - contributionsPanel.padding[3]])
		.range([contributionsPanel.width - contributionsPanel.padding[1] - contributionsPanel.padding[3], 0]);

	const inverseAllocationsScale = d3.scaleLinear()
		.domain([0, allocationsPanel.width - allocationsPanel.padding[1] - allocationsPanel.padding[3]])
		.range([allocationsPanel.width - allocationsPanel.padding[1] - allocationsPanel.padding[3], 0]);

	Promise.all([
			fetchFile(classPrefix + "MasterDonors", masterDonorsUrl, "master table for donors", "json"),
			fetchFile(classPrefix + "MasterFunds", masterFundsUrl, "master table for funds", "json"),
			fetchFile(classPrefix + "MasterAllocationTypes", masterAllocationTypesUrl, "master table for allocation types", "json"),
			fetchFile(classPrefix + "MasterPartnerTypes", masterPartnersUrl, "master table for partner types", "json"),
			fetchFile(classPrefix + "MasterUnAgencies", masterUnAgenciesUrl, "master table for un agencies", "json"),
			fetchFile(classPrefix + "MasterClusterTypes", masterClustersUrl, "master table for cluster types", "json"),
			fetchFile(classPrefix + "AllocationsData", allocationsDataUrl, "allocations data", "csv"),
			fetchFile(classPrefix + "contributionsData", contributionsDataUrl, "contributions data", "csv")
		])
		.then(allData => fetchCallback(allData));

	function fetchCallback([
		masterDonors,
		masterFunds,
		masterAllocationTypes,
		masterPartners,
		masterUnAgencies,
		masterClusters,
		rawDataAllocations,
		rawDataContributions
	]) {

		createDonorNamesList(masterDonors);
		createFundNamesList(masterFunds);
		createAllocationTypesList(masterAllocationTypes);
		createPartnerTypesList(masterPartners);
		createUnAgenciesNamesList(masterUnAgencies);
		createClustersList(masterClusters);

		//CERF as the only fund
		chartState.selectedFund.push(cerfPooledFundId);

		preProcessData(rawDataAllocations, rawDataContributions);

		validateYear(selectedYearString);

		if (!lazyLoad) {
			draw(rawDataAllocations, rawDataContributions);
		} else {
			d3.select(window).on("scroll." + classPrefix, checkPosition);
			d3.select("body").on("d3ChartsYear." + classPrefix, () => chartState.selectedYear = [validateCustomEventYear(+d3.event.detail)]);
			checkPosition();
		};

		function checkPosition() {
			const containerPosition = containerDiv.node().getBoundingClientRect();
			if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
				d3.select(window).on("scroll." + classPrefix, null);
				draw(rawDataAllocations, rawDataContributions);
			};
		};

		//end of fetchCallback
	};

	function draw(rawDataAllocations, rawDataContributions) {

		//test panels
		// buttonsPanel.main.append("rect")
		// 	.attr("width", buttonsPanel.width)
		// 	.attr("height", buttonsPanel.height)
		// 	.style("fill", "#ccc")
		// 	.style("opacity", 0.2);
		// contributionsPanel.main.append("rect")
		// 	.attr("width", contributionsPanel.width)
		// 	.attr("height", contributionsPanel.height)
		// 	.style("fill", "#ccc")
		// 	.style("opacity", 0.2);
		// allocationsPanel.main.append("rect")
		// 	.attr("width", allocationsPanel.width)
		// 	.attr("height", allocationsPanel.height)
		// 	.style("fill", "#ccc")
		// 	.style("opacity", 0.2);
		// centralCirclePanel.main.append("circle")
		// 	.attr("r", centralCirclePanel.radius)
		// 	.style("fill", "green")
		// 	.style("opacity", 0.2);
		//test panels

		const dataAllocations = processDataAllocations(rawDataAllocations);

		const dataContributions = processDataContributions(rawDataContributions);

		createTitle(rawDataAllocations, rawDataContributions);

		createButtonsPanel(rawDataAllocations, rawDataContributions);

		drawCentralCircle(dataContributions, dataAllocations);

		drawSankeyContributions(dataContributions);

		drawSankeyAllocations(dataAllocations);

		setYearsDescriptionDiv();

		//end of draw;
	};

	function createTitle(rawDataAllocations, rawDataContributions) {

		const title = titleDiv.append("p")
			.attr("id", classPrefix + "d3chartTitle")
			.html(chartTitle);

		//REMOVE THIS:
		topDiv.style("pointer-events", "none");

		//NO HELP ICON FOR NOW
		// const helpIcon = iconsDiv.append("button")
		// 	.attr("id", classPrefix + "HelpButton");

		// helpIcon.html("HELP  ")
		// 	.append("span")
		// 	.attr("class", "fa fa-info")

		const downloadIcon = iconsDiv.append("button")
			.attr("id", classPrefix + "DownloadButton");

		downloadIcon.html(".CSV  ")
			.append("span")
			.attr("class", "fa fa-download");

		const snapshotDiv = iconsDiv.append("div")
			.attr("class", classPrefix + "SnapshotDiv");

		const snapshotIcon = snapshotDiv.append("button")
			.attr("id", classPrefix + "SnapshotButton");

		snapshotIcon.html("IMAGE ")
			.append("span")
			.attr("class", "fa fa-camera");

		const snapshotContent = snapshotDiv.append("div")
			.attr("class", classPrefix + "SnapshotContent");

		const pdfSpan = snapshotContent.append("p")
			.attr("id", classPrefix + "SnapshotPdfText")
			.html("Download PDF")
			.on("click", function() {
				createSnapshot("pdf", false);
			});

		const pngSpan = snapshotContent.append("p")
			.attr("id", classPrefix + "SnapshotPngText")
			.html("Download Image (PNG)")
			.on("click", function() {
				createSnapshot("png", false);
			});

		const playIcon = iconsDiv.append("button")
			.datum({
				clicked: false
			})
			.attr("id", classPrefix + "PlayButton");

		playIcon.html("PLAY  ")
			.append("span")
			.attr("class", "fa fa-play");

		playIcon.on("click", function(d) {
			d.clicked = !d.clicked;

			playIcon.html(d.clicked ? "PAUSE " : "PLAY  ")
				.append("span")
				.attr("class", d.clicked ? "fa fa-pause" : "fa fa-play");

			if (d.clicked) {
				chartState.selectedYear.length = 1;
				loopButtons();
				timer = d3.interval(loopButtons, 3 * duration);
			} else {
				timer.stop();
			};

			function loopButtons() {
				const index = yearsArray.indexOf(chartState.selectedYear[0]);

				chartState.selectedYear[0] = yearsArray[(index + 1) % yearsArray.length];

				const yearButton = d3.selectAll("." + classPrefix + "buttonsRects")
					.filter(function(d) {
						return d === chartState.selectedYear[0]
					});

				yearButton.dispatch("click");

				if (yearsArray.length > buttonsNumber) {

					const firstYearIndex = chartState.selectedYear[0] < yearsArray[buttonsNumber / 2] ?
						0 :
						chartState.selectedYear[0] > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
						yearsArray.length - buttonsNumber :
						yearsArray.indexOf(chartState.selectedYear[0]) - (buttonsNumber / 2);

					const currentTranslate = -(buttonsPanel.buttonWidth * firstYearIndex);

					if (currentTranslate === 0) {
						svg.select("." + classPrefix + "LeftArrowGroup").select("text").style("fill", "#ccc")
						svg.select("." + classPrefix + "LeftArrowGroup").attr("pointer-events", "none");
					} else {
						svg.select("." + classPrefix + "LeftArrowGroup").select("text").style("fill", "#666")
						svg.select("." + classPrefix + "LeftArrowGroup").attr("pointer-events", "all");
					};

					if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
						svg.select("." + classPrefix + "RightArrowGroup").select("text").style("fill", "#ccc")
						svg.select("." + classPrefix + "RightArrowGroup").attr("pointer-events", "none");
					} else {
						svg.select("." + classPrefix + "RightArrowGroup").select("text").style("fill", "#666")
						svg.select("." + classPrefix + "RightArrowGroup").attr("pointer-events", "all");
					};

					svg.select("." + classPrefix + "buttonsGroup").transition()
						.duration(duration)
						.attrTween("transform", function() {
							return d3.interpolateString(this.getAttribute("transform"), "translate(" + currentTranslate + ",0)");
						});
				};
			};
		});

		if (!isBookmarkPage) {

			const shareIcon = iconsDiv.append("button")
				.attr("id", classPrefix + "ShareButton");

			shareIcon.html("SHARE  ")
				.append("span")
				.attr("class", "fa fa-share");

			const shareDiv = containerDiv.append("div")
				.attr("class", "d3chartShareDiv")
				.style("display", "none");

			shareIcon.on("mouseover", function() {
					shareDiv.html("Click to copy")
						.style("display", "block");
					const thisBox = this.getBoundingClientRect();
					const containerBox = containerDiv.node().getBoundingClientRect();
					const shareBox = shareDiv.node().getBoundingClientRect();
					const thisOffsetTop = thisBox.top - containerBox.top - (shareBox.height - thisBox.height) / 2;
					const thisOffsetLeft = thisBox.left - containerBox.left - shareBox.width - 12;
					shareDiv.style("top", thisOffsetTop + "px")
						.style("left", thisOffsetLeft + "20px");
				}).on("mouseout", function() {
					shareDiv.style("display", "none");
				})
				.on("click", function() {

					const newURL = bookmarkSite + queryStringValues.toString();

					const shareInput = shareDiv.append("input")
						.attr("type", "text")
						.attr("readonly", true)
						.attr("spellcheck", "false")
						.property("value", newURL);

					shareInput.node().select();

					document.execCommand("copy");

					shareDiv.html("Copied!");

					const thisBox = this.getBoundingClientRect();
					const containerBox = containerDiv.node().getBoundingClientRect();
					const shareBox = shareDiv.node().getBoundingClientRect();
					const thisOffsetLeft = thisBox.left - containerBox.left - shareBox.width - 12;
					shareDiv.style("left", thisOffsetLeft + "20px");

				});

		};

		if (browserHasSnapshotIssues) {
			const bestVisualizedSpan = snapshotContent.append("p")
				.attr("id", classPrefix + "BestVisualizedText")
				.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
				.attr("pointer-events", "none")
				.style("cursor", "default");
		};

		snapshotDiv.on("mouseover", function() {
			snapshotContent.style("display", "block")
		}).on("mouseout", function() {
			snapshotContent.style("display", "none")
		});

		//helpIcon.on("click", null); //CHANGE THIS

		downloadIcon.on("click", function() {

			const csv = createCsv(rawDataAllocations, rawDataContributions);

			const currentDate = new Date();

			const fileName = vizNameQueryString + "_" + csvDateFormat(currentDate) + ".csv";

			const blob = new Blob([csv], {
				type: 'text/csv;charset=utf-8;'
			});

			if (navigator.msSaveBlob) {
				navigator.msSaveBlob(blob, filename);
			} else {

				const link = document.createElement("a");

				if (link.download !== undefined) {

					const url = URL.createObjectURL(blob);

					link.setAttribute("href", url);
					link.setAttribute("download", fileName);
					link.style = "visibility:hidden";

					document.body.appendChild(link);

					link.click();

					document.body.removeChild(link);

				};
			};

		});

		//end of createTitle
	};

	function createButtonsPanel(rawDataAllocations, rawDataContributions) {

		const clipPath = buttonsPanel.main.append("clipPath")
			.attr("id", classPrefix + "clip")
			.append("rect")
			.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
			.attr("height", buttonsPanel.height);

		const clipPathGroup = buttonsPanel.main.append("g")
			.attr("class", classPrefix + "ClipPathGroup")
			.attr("transform", "translate(" + (buttonsPanel.padding[3]) + ",0)")
			.attr("clip-path", "url(#" + classPrefix + "clip)");

		const buttonsGroup = clipPathGroup.append("g")
			.attr("class", classPrefix + "buttonsGroup")
			.attr("transform", "translate(0,0)")
			.style("cursor", "pointer");

		const buttonsRects = buttonsGroup.selectAll(null)
			.data(yearsArray)
			.enter()
			.append("rect")
			.attr("rx", "2px")
			.attr("ry", "2px")
			.attr("class", classPrefix + "buttonsRects")
			.attr("width", buttonsPanel.buttonWidth - buttonsPanel.buttonsMargin)
			.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
			.attr("y", buttonsPanel.buttonVerticalPadding)
			.attr("x", function(_, i) {
				return i * buttonsPanel.buttonWidth + buttonsPanel.buttonsMargin / 2;
			})
			.style("fill", function(d) {
				return chartState.selectedYear.indexOf(d) > -1 ? unBlue : "#eaeaea";
			});

		const buttonsText = buttonsGroup.selectAll(null)
			.data(yearsArray)
			.enter()
			.append("text")
			.attr("text-anchor", "middle")
			.attr("class", classPrefix + "buttonsText")
			.attr("y", buttonsPanel.height / 1.6)
			.attr("x", function(_, i) {
				return i * buttonsPanel.buttonWidth + buttonsPanel.buttonWidth / 2;
			})
			.style("fill", function(d) {
				return chartState.selectedYear.indexOf(d) > -1 ? "white" : "#444";
			})
			.text(function(d) {
				return d;
			});

		const leftArrow = buttonsPanel.main.append("g")
			.attr("class", classPrefix + "LeftArrowGroup")
			.style("cursor", "pointer")
			.style("opacity", 0)
			.attr("pointer-events", "none")
			.attr("transform", "translate(" + buttonsPanel.padding[3] + ",0)");

		const leftArrowRect = leftArrow.append("rect")
			.style("fill", "white")
			.attr("width", buttonsPanel.arrowPadding)
			.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
			.attr("y", buttonsPanel.buttonVerticalPadding);

		const leftArrowText = leftArrow.append("text")
			.attr("class", classPrefix + "leftArrowText")
			.attr("x", 0)
			.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
			.style("fill", "#666")
			.text("\u25c4");

		const rightArrow = buttonsPanel.main.append("g")
			.attr("class", classPrefix + "RightArrowGroup")
			.style("cursor", "pointer")
			.style("opacity", 0)
			.attr("pointer-events", "none")
			.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding +
				(buttonsNumber * buttonsPanel.buttonWidth)) + ",0)");

		const rightArrowRect = rightArrow.append("rect")
			.style("fill", "white")
			.attr("width", buttonsPanel.arrowPadding)
			.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
			.attr("y", buttonsPanel.buttonVerticalPadding);

		const rightArrowText = rightArrow.append("text")
			.attr("class", classPrefix + "rightArrowText")
			.attr("x", -1)
			.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
			.style("fill", "#666")
			.text("\u25ba");

		if (yearsArray.length > buttonsNumber) {

			clipPathGroup.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding) + ",0)")

			rightArrow.style("opacity", 1)
				.attr("pointer-events", "all");

			leftArrow.style("opacity", 1)
				.attr("pointer-events", "all");

			repositionButtonsGroup();

			checkCurrentTranslate();

			leftArrow.on("click", function() {
				leftArrow.attr("pointer-events", "none");
				const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
				rightArrow.select("text").style("fill", "#666");
				rightArrow.attr("pointer-events", "all");
				buttonsGroup.transition()
					.duration(duration)
					.attr("transform", "translate(" +
						Math.min(0, (currentTranslate + buttonsNumber * buttonsPanel.buttonWidth)) + ",0)")
					.on("end", checkArrows);
			});

			rightArrow.on("click", function() {
				rightArrow.attr("pointer-events", "none");
				const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
				leftArrow.select("text").style("fill", "#666");
				leftArrow.attr("pointer-events", "all");
				buttonsGroup.transition()
					.duration(duration)
					.attr("transform", "translate(" +
						Math.max(-((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth),
							(-(Math.abs(currentTranslate) + buttonsNumber * buttonsPanel.buttonWidth))) +
						",0)")
					.on("end", checkArrows);
			});
		};

		buttonsRects.on("mouseover", mouseOverButtonsRects)
			.on("mouseout", mouseOutButtonsRects)
			.on("click", function(d) {
				const self = this;
				if (d3.event.altKey) {
					clickButtonsRects(d, false);
					return;
				};
				if (localVariable.get(this) !== "clicked") {
					localVariable.set(this, "clicked");
					setTimeout(function() {
						if (localVariable.get(self) === "clicked") {
							clickButtonsRects(d, true);
						};
						localVariable.set(self, null);
					}, 250);
				} else {
					clickButtonsRects(d, false);
					localVariable.set(this, null);
				};
			});

		d3.select("body").on("d3ChartsYear." + classPrefix, function() {
			clickButtonsRects(validateCustomEventYear(+d3.event.detail), true);
			if (yearsArray.length > buttonsNumber) repositionButtonsGroup();
			checkArrows();
		});

		function checkArrows() {

			const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];

			if (currentTranslate === 0) {
				leftArrow.select("text").style("fill", "#ccc");
				leftArrow.attr("pointer-events", "none");
			} else {
				leftArrow.select("text").style("fill", "#666");
				leftArrow.attr("pointer-events", "all");
			};

			if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
				rightArrow.select("text").style("fill", "#ccc");
				rightArrow.attr("pointer-events", "none");
			} else {
				rightArrow.select("text").style("fill", "#666");
				rightArrow.attr("pointer-events", "all");
			}

		};

		function checkCurrentTranslate() {

			const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];

			if (currentTranslate === 0) {
				leftArrow.select("text").style("fill", "#ccc")
				leftArrow.attr("pointer-events", "none");
			};

			if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
				rightArrow.select("text").style("fill", "#ccc")
				rightArrow.attr("pointer-events", "none");
			};

		};

		function repositionButtonsGroup() {

			const firstYearIndex = chartState.selectedYear[0] < yearsArray[buttonsNumber / 2] ?
				0 :
				chartState.selectedYear[0] > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
				yearsArray.length - buttonsNumber :
				yearsArray.indexOf(chartState.selectedYear[0]) - (buttonsNumber / 2);

			buttonsGroup.attr("transform", "translate(" +
				(-(buttonsPanel.buttonWidth * firstYearIndex)) +
				",0)");

		};

		function mouseOverButtonsRects(d) {
			tooltip.style("display", "block")
				.html(null)

			const innerTooltip = tooltip.append("div")
				.style("max-width", "200px")
				.attr("id", classPrefix + "InnerTooltipDiv");

			innerTooltip.html("Click for selecting a single year. Double-click or ALT + click for selecting multiple years.");

			const containerSize = containerDiv.node().getBoundingClientRect();

			const thisSize = this.getBoundingClientRect();

			tooltipSize = tooltip.node().getBoundingClientRect();

			tooltip.style("left", (thisSize.left + thisSize.width / 2 - containerSize.left) > containerSize.width - (tooltipSize.width / 2) - padding[1] ?
					containerSize.width - tooltipSize.width - padding[1] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) < tooltipSize.width / 2 + buttonsPanel.padding[3] + padding[0] ?
					buttonsPanel.padding[3] + padding[0] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) - (tooltipSize.width / 2) + "px")
				.style("top", (thisSize.top + thisSize.height / 2 - containerSize.top) < tooltipSize.height ? thisSize.top - containerSize.top + thisSize.height + 2 + "px" :
					thisSize.top - containerSize.top - tooltipSize.height - 4 + "px");

			d3.select(this).style("fill", unBlue);
			buttonsText.filter(function(e) {
					return e === d
				})
				.style("fill", "white");
		};

		function mouseOutButtonsRects(d) {
			tooltip.style("display", "none");
			if (chartState.selectedYear.indexOf(d) > -1) return;
			d3.select(this).style("fill", "#eaeaea");
			buttonsText.filter(function(e) {
					return e === d
				})
				.style("fill", "#444");
		};

		function clickButtonsRects(d, singleSelection) {

			if (singleSelection) {
				chartState.selectedYear = [d];
			} else {
				const index = chartState.selectedYear.indexOf(d);
				if (index > -1) {
					if (chartState.selectedYear.length === 1) {
						return;
					} else {
						chartState.selectedYear.splice(index, 1);
					}
				} else {
					chartState.selectedYear.push(d);
				};
			};

			const allYears = chartState.selectedYear.map(function(d) {
				return d;
			}).join("|");

			if (queryStringValues.has("year")) {
				queryStringValues.set("year", allYears);
			} else {
				queryStringValues.append("year", allYears);
			};

			buttonsRects.style("fill", function(e) {
				return chartState.selectedYear.indexOf(e) > -1 ? unBlue : "#eaeaea";
			});

			buttonsText.style("fill", function(e) {
				return chartState.selectedYear.indexOf(e) > -1 ? "white" : "#444";
			});

			setYearsDescriptionDiv();

			const dataAllocations = processDataAllocations(rawDataAllocations);

			const dataContributions = processDataContributions(rawDataContributions);

			//CALL DRAWING FUNCTIONS HERE
			drawCentralCircle(dataContributions, dataAllocations);

			drawSankeyContributions(dataContributions);

			drawSankeyAllocations(dataAllocations);

			//end of clickButtonsRects
		};

		//end of createButtonsPanel
	};

	function drawCentralCircle(dataContributions, dataAllocations) {

		const centralCircleBackground = centralCirclePanel.main.selectAll("." + classPrefix + "centralCircleBackground")
			.data([true])
			.enter()
			.append("circle")
			.attr("class", classPrefix + "centralCircleBackground")
			.attr("r", centralCirclePanel.radius + circleWhiteBorder)
			.style("fill", "white");

		const centralCircle = centralCirclePanel.main.selectAll("." + classPrefix + "centralCircle")
			.data([true])
			.enter()
			.append("circle")
			.attr("class", classPrefix + "centralCircle")
			.attr("r", centralCirclePanel.radius)
			.attr("fill", "url(#" + classPrefix + "centralCircleGradient)");

		const centralLine = centralCirclePanel.main.selectAll("." + classPrefix + "centralLine")
			.data([true])
			.enter()
			.append("line")
			.attr("class", classPrefix + "centralLine")
			.attr("x1", -centralCirclePanel.radius * 0.5)
			.attr("x2", centralCirclePanel.radius * 0.5);

		const contributionsValue = dataContributions.nodes.find(e => e.level === 2).value;
		const allocationsValue = dataAllocations.nodes.find(e => e.level === 1).value;

		let contributionsValueText = centralCirclePanel.main.selectAll("." + classPrefix + "contributionsValueText")
			.data([contributionsValue]);

		const contributionsValueTextEnter = contributionsValueText.enter()
			.append("text")
			.attr("class", classPrefix + "contributionsValueText")
			.attr("y", -centralCirclePanel.radius * 0.4)
			.text("$")
			.append("tspan")
			.attr("class", classPrefix + "contributionsValueTextSpan")
			.transition()
			.duration(duration)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d);
				return t => d ? formatSIFloat(interpolator(t)) : 0;
			});

		contributionsValueText.select("tspan")
			.transition()
			.duration(duration)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d);
				return t => d ? formatSIFloat(interpolator(t)) : 0;
			});

		const contributionsText = centralCirclePanel.main.selectAll("." + classPrefix + "contributionsText")
			.data([true])
			.enter()
			.append("text")
			.attr("class", classPrefix + "contributionsText")
			.attr("y", -centralCirclePanel.radius * 0.26)
			.text("Contributions");

		let contributionsSubText = centralCirclePanel.main.selectAll("." + classPrefix + "contributionsSubText")
			.data([true]);

		contributionsSubText = contributionsSubText.enter()
			.append("text")
			.attr("class", classPrefix + "contributionsSubText")
			.attr("y", -centralCirclePanel.radius * 0.14)
			.merge(contributionsSubText)
			.text(() => {
				if (chartState.selectedYear.length === 1) return "for " + chartState.selectedYear[0];
				if (chartState.selectedYear.length > maxYearsListNumber) return "for selected years\u002A";
				const yearsList = chartState.selectedYear.sort((a, b) => a - b)
					.reduce((acc, curr, index) => acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", "), "");
				return "for " + yearsList;
			});

		let allocationsValueText = centralCirclePanel.main.selectAll("." + classPrefix + "allocationsValueText")
			.data([allocationsValue]);

		const allocationsValueTextEnter = allocationsValueText.enter()
			.append("text")
			.attr("class", classPrefix + "allocationsValueText")
			.attr("y", centralCirclePanel.radius * 0.3)
			.text("$")
			.append("tspan")
			.attr("class", classPrefix + "allocationsValueTextSpan")
			.transition()
			.duration(duration)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d);
				return t => d ? formatSIFloat(interpolator(t)) : 0;
			});

		allocationsValueText.select("tspan")
			.transition()
			.duration(duration)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d);
				return t => d ? formatSIFloat(interpolator(t)) : 0;
			});

		const allocationsText = centralCirclePanel.main.selectAll("." + classPrefix + "allocationsText")
			.data([true])
			.enter()
			.append("text")
			.attr("class", classPrefix + "allocationsText")
			.attr("y", centralCirclePanel.radius * 0.44)
			.text("Allocations");

		let allocationsSubText = centralCirclePanel.main.selectAll("." + classPrefix + "allocationsSubText")
			.data([true]);

		allocationsSubText = allocationsSubText.enter()
			.append("text")
			.attr("class", classPrefix + "allocationsSubText")
			.attr("y", centralCirclePanel.radius * 0.56)
			.merge(allocationsSubText)
			.text(() => {
				if (chartState.selectedYear.length === 1) return "in " + chartState.selectedYear[0];
				if (chartState.selectedYear.length > maxYearsListNumber) return "in selected years\u002A";
				const yearsList = chartState.selectedYear.sort((a, b) => a - b)
					.reduce((acc, curr, index) => acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", "), "");
				return "in " + yearsList;
			});

		//end of drawCentralCircle
	};

	function drawSankeyContributions(dataContributions) {

		dataContributions.nodes.reverse();

		const sankeyDataContributions = dataContributions.nodes.length ? sankeyGeneratorContributions(dataContributions) : dataContributions;

		const donorNodes = sankeyDataContributions.nodes.filter(e => e.level === 1);
		const fundNode = sankeyDataContributions.nodes.filter(e => e.level === 2);

		spreadNodes(donorNodes, false);
		spreadNodes(fundNode, false);

		sankeyGeneratorContributions.update(sankeyDataContributions);

		let sankeyNodesContributions = contributionsPanel.main.selectAll("." + classPrefix + "sankeyNodesContributions")
			.data(sankeyDataContributions.nodes, d => d.id);

		const sankeyNodesContributionsExit = sankeyNodesContributions.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const sankeyNodesContributionsEnter = sankeyNodesContributions.enter()
			.append("rect")
			.attr("class", classPrefix + "sankeyNodesContributions")
			.style("fill", contributionColor)
			.style("opacity", 0)
			.attr("y", d => d.x0)
			.attr("x", d => inverseContributionsScale(d.y1))
			.attr("width", d => Math.max(1, inverseContributionsScale(d.y0) - inverseContributionsScale(d.y1)))
			.attr("height", d => d.x1 - d.x0);

		sankeyNodesContributions = sankeyNodesContributionsEnter.merge(sankeyNodesContributions);

		sankeyNodesContributions.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => d.x0)
			.attr("x", d => inverseContributionsScale(d.y1))
			.attr("width", d => Math.max(1, inverseContributionsScale(d.y0) - inverseContributionsScale(d.y1)))
			.attr("height", d => d.x1 - d.x0);

		let sankeyLinksContributions = contributionsPanel.main.selectAll("." + classPrefix + "sankeyLinksContributions")
			.data(sankeyDataContributions.links, d => d.source.id);

		const sankeyLinksContributionsExit = sankeyLinksContributions.exit()
			.transition()
			.duration(duration)
			.style("stroke-opacity", 0)
			.remove();

		const sankeyLinksContributionsEnter = sankeyLinksContributions.enter()
			.append("path")
			.attr("class", classPrefix + "sankeyLinksContributions")
			.attr("stroke-width", d => Math.max(d.width, minStrokeWidth))
			.style("fill", "none")
			.style("stroke", contributionColor)
			.style("stroke-opacity", 0)
			.attr("d", drawLinks());

		sankeyLinksContributions = sankeyLinksContributionsEnter.merge(sankeyLinksContributions);

		sankeyLinksContributions.transition()
			.duration(duration)
			.style("stroke-opacity", linksOpacity)
			.attr("stroke-width", d => Math.max(d.width, minStrokeWidth))
			.attr("d", drawLinks());

		let sankeyDonorNames = contributionsPanel.main.selectAll("." + classPrefix + "sankeyDonorNames")
			.data(donorNodes, d => d.id);

		const sankeyDonorNamesExit = sankeyDonorNames.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const sankeyDonorNamesEnter = sankeyDonorNames.enter()
			.append("text")
			.attr("class", classPrefix + "sankeyDonorNames")
			.style("opacity", 1)
			.attr("x", d => (inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2)
			.attr("y", contributionsPanel.padding[0] - namesPadding)
			.text(d => d.codeId === othersId ? "Others" : lists.donorNames[d.codeId]);

		sankeyDonorNames = sankeyDonorNamesEnter.merge(sankeyDonorNames);

		sankeyDonorNames.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => (inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2);

		let sankeyDonorValues = contributionsPanel.main.selectAll("." + classPrefix + "sankeyDonorValues")
			.data(donorNodes, d => d.id);

		const sankeyDonorValuesExit = sankeyDonorValues.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const sankeyDonorValuesEnter = sankeyDonorValues.enter()
			.append("text")
			.attr("class", classPrefix + "sankeyDonorValues")
			.style("opacity", 1)
			.attr("x", d => (inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2)
			.attr("y", d => d.x1 + namesPadding)
			.text(d => "$0");

		sankeyDonorValues = sankeyDonorValuesEnter.merge(sankeyDonorValues);

		sankeyDonorValues.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => (inverseContributionsScale(d.y1) + inverseContributionsScale(d.y0)) / 2)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.value);
				return t => "$" + formatSIFloat(interpolator(t));
			});

		sankeyNodesContributions.on("mouseover", mouseOverNodesContributions)
			.on("mouseout", mouseOutNodesContributions);

		sankeyLinksContributions.on("mouseover", mouseOverLinksContributions)
			.on("mouseout", mouseOutLinksContributions);

		function mouseOverNodesContributions(datum) {
			sankeyNodesContributions.style("opacity", (_, i, n) => n[i] === this ? 1 : fadeOpacityNodes);
			sankeyLinksContributions.style("stroke-opacity", d => d.source.codeId === datum.codeId ? linksOpacity : fadeOpacityLinks);
			sankeyDonorNames.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
			sankeyDonorValues.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
		};

		function mouseOutNodesContributions() {
			sankeyNodesContributions.style("opacity", 1);
			sankeyLinksContributions.style("stroke-opacity", linksOpacity);
			sankeyDonorNames.style("opacity", 1);
			sankeyDonorValues.style("opacity", 1);
		};

		function mouseOverLinksContributions(datum) {
			sankeyNodesContributions.style("opacity", d => datum.source.codeId === d.codeId ? 1 : fadeOpacityNodes);
			sankeyLinksContributions.style("stroke-opacity", (_, i, n) => n[i] === this ? linksOpacity : fadeOpacityLinks);
			sankeyDonorNames.style("opacity", d => d.codeId === datum.source.codeId ? 1 : fadeOpacityNodes);
			sankeyDonorValues.style("opacity", d => d.codeId === datum.source.codeId ? 1 : fadeOpacityNodes);
		};

		function mouseOutLinksContributions() {
			sankeyNodesContributions.style("opacity", 1);
			sankeyLinksContributions.style("stroke-opacity", linksOpacity);
			sankeyDonorNames.style("opacity", 1);
			sankeyDonorValues.style("opacity", 1);
		};

		//sankeyDonorNames.call(wrapNames, nameWidth);

		//sankeyDonorNames.call(checkCollision);

		//end of drawSankeyContributions
	};

	function drawSankeyAllocations(dataAllocations) {

		dataAllocations.nodes.reverse();

		const sankeyDataAllocations = dataAllocations.nodes.length ? sankeyGeneratorAllocations(dataAllocations) : dataAllocations;

		const fundNode = sankeyDataAllocations.nodes.filter(e => e.level === 1);
		const partnerNodes = sankeyDataAllocations.nodes.filter(e => e.level === 2);
		const clusterNodes = sankeyDataAllocations.nodes.filter(e => e.level === 3);

		spreadNodes(fundNode, false);
		spreadNodes(partnerNodes, true);
		spreadNodes(clusterNodes, false);

		sankeyGeneratorAllocations.update(sankeyDataAllocations);

		let sankeyNodesAllocations = allocationsPanel.main.selectAll("." + classPrefix + "sankeyNodesAllocations")
			.data(sankeyDataAllocations.nodes, d => d.id);

		const sankeyNodesAllocationsExit = sankeyNodesAllocations.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const sankeyNodesAllocationsEnter = sankeyNodesAllocations.enter()
			.append("rect")
			.attr("class", classPrefix + "sankeyNodesAllocations")
			.style("fill", d => d.level === 2 ? partnerColorsScale(d.id) : contributionColor)
			.style("opacity", 0)
			.attr("y", d => d.x0)
			.attr("x", d => inverseAllocationsScale(d.y1))
			.attr("width", d => Math.max(1, inverseAllocationsScale(d.y0) - inverseAllocationsScale(d.y1)))
			.attr("height", d => d.x1 - d.x0);

		sankeyNodesAllocations = sankeyNodesAllocationsEnter.merge(sankeyNodesAllocations);

		sankeyNodesAllocations.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("y", d => d.x0)
			.attr("x", d => inverseAllocationsScale(d.y1))
			.attr("width", d => Math.max(1, inverseAllocationsScale(d.y0) - inverseAllocationsScale(d.y1)))
			.attr("height", d => d.x1 - d.x0);

		let sankeyLinksAllocations = allocationsPanel.main.selectAll("." + classPrefix + "sankeyLinksAllocations")
			.data(sankeyDataAllocations.links, d => d.source.id + d.target.id);

		const sankeyLinksAllocationsExit = sankeyLinksAllocations.exit()
			.transition()
			.duration(duration)
			.style("stroke-opacity", 0)
			.remove();

		const sankeyLinksAllocationsEnter = sankeyLinksAllocations.enter()
			.append("path")
			.attr("class", classPrefix + "sankeyLinksAllocations")
			.attr("stroke-width", d => Math.max(d.width, minStrokeWidth))
			.style("fill", "none")
			.style("stroke", d => d.source.level === 1 ? allocationColor : partnerColorsScale(d.source.id))
			.style("stroke-opacity", 0)
			.attr("d", drawLinks());

		sankeyLinksAllocations = sankeyLinksAllocationsEnter.merge(sankeyLinksAllocations);

		sankeyLinksAllocations.transition()
			.duration(duration)
			.style("stroke-opacity", linksOpacity)
			.attr("stroke-width", d => Math.max(d.width, minStrokeWidth))
			.attr("d", drawLinks());

		let sankeyPartnerNames = allocationsPanel.main.selectAll("." + classPrefix + "sankeyPartnerNames")
			.data(partnerNodes, d => d.id);

		const sankeyPartnerNamesExit = sankeyPartnerNames.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const sankeyPartnerNamesEnter = sankeyPartnerNames.enter()
			.append("text")
			.attr("class", classPrefix + "sankeyPartnerNames")
			.style("opacity", 1)
			.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
			.attr("y", d => d.x0 - namesPadding)
			.text(d => lists.unAgencyShortNames[d.codeId]);

		sankeyPartnerNames = sankeyPartnerNamesEnter.merge(sankeyPartnerNames);

		sankeyPartnerNames.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2);

		let sankeyPartnerValues = allocationsPanel.main.selectAll("." + classPrefix + "sankeyPartnerValues")
			.data(partnerNodes, d => d.id);

		const sankeyPartnerValuesExit = sankeyPartnerValues.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const sankeyPartnerValuesEnter = sankeyPartnerValues.enter()
			.append("text")
			.attr("class", classPrefix + "sankeyPartnerValues")
			.style("opacity", 1)
			.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
			.attr("y", d => d.x1 + namesPadding)
			.text(d => "$0");

		sankeyPartnerValues = sankeyPartnerValuesEnter.merge(sankeyPartnerValues);

		sankeyPartnerValues.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.value);
				return t => "$" + formatSIFloat(interpolator(t));
			});

		let sankeyClusterNames = allocationsPanel.main.selectAll("." + classPrefix + "sankeyClusterNames")
			.data(clusterNodes, d => d.id);

		const sankeyClusterNamesExit = sankeyClusterNames.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const sankeyClusterNamesEnter = sankeyClusterNames.enter()
			.append("text")
			.attr("class", classPrefix + "sankeyClusterNames")
			.style("opacity", 1)
			.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
			.attr("y", d => d.x0 - namesPadding)
			.text(d => lists.clusterShortNames[d.codeId]);

		sankeyClusterNames = sankeyClusterNamesEnter.merge(sankeyClusterNames);

		sankeyClusterNames.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2);

		let sankeyClusterValues = allocationsPanel.main.selectAll("." + classPrefix + "sankeyClusterValues")
			.data(clusterNodes, d => d.id);

		const sankeyClusterValuesExit = sankeyClusterValues.exit()
			.transition()
			.duration(duration)
			.style("opacity", 0)
			.remove();

		const sankeyClusterValuesEnter = sankeyClusterValues.enter()
			.append("text")
			.attr("class", classPrefix + "sankeyClusterValues")
			.style("opacity", 1)
			.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
			.attr("y", d => d.x1 + namesPadding)
			.text(d => "$0");

		sankeyClusterValues = sankeyClusterValuesEnter.merge(sankeyClusterValues);

		sankeyClusterValues.transition()
			.duration(duration)
			.style("opacity", 1)
			.attr("x", d => (inverseAllocationsScale(d.y1) + inverseAllocationsScale(d.y0)) / 2)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.value);
				return t => "$" + formatSIFloat(interpolator(t));
			});

		sankeyNodesAllocations.filter(d => d.level === 2)
			.on("mouseover", mouseOverPartnerNodes)
			.on("mouseout", mouseOutPartnerNodes);

		sankeyNodesAllocations.filter(d => d.level === 3)
			.on("mouseover", mouseOverClusterNodes)
			.on("mouseout", mouseOutClusterNodes);

		sankeyLinksAllocations.filter(d => d.source.level === 1)
			.on("mouseover", mouseOverPartnerLinks)
			.on("mouseout", mouseOutPartnerLinks);

		sankeyLinksAllocations.filter(d => d.source.level === 2)
			.on("mouseover", mouseOverClusterLinks)
			.on("mouseout", mouseOutClusterLinks);

		function mouseOverPartnerNodes(datum) {
			sankeyNodesAllocations.style("opacity", (d, i, n) => d.level === 2 && n[i] === this ? 1 :
				d.targetLinks.filter(e => e.source.id === datum.id).length ? 1 : fadeOpacityNodes);
			sankeyLinksAllocations.style("stroke-opacity", d => d.source.id === datum.id || d.target.id === datum.id ? linksOpacity : fadeOpacityLinks);
			sankeyPartnerNames.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
			sankeyPartnerValues.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
			sankeyClusterNames.style("opacity", d => d.targetLinks.filter(e => e.source.id === datum.id).length ? 1 : fadeOpacityNodes);
			sankeyClusterValues.style("opacity", d => d.targetLinks.filter(e => e.source.id === datum.id).length ? 1 : fadeOpacityNodes);
			sankeyClusterValues.each((d, i, n) => {
				const amountFromPartner = d.targetLinks.reduce((acc, curr) => {
					if (curr.source.id === datum.id) acc += curr.value;
					return acc;
				}, 0);
				d3.select(n[i]).transition()
					.duration(duration)
					.textTween(() => {
						const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, amountFromPartner);
						return t => "$" + formatSIFloat(interpolator(t));
					});
			});
		};

		function mouseOutPartnerNodes() {
			resetOpacity();
		};

		function mouseOverClusterNodes(datum) {
			sankeyNodesAllocations.style("opacity", (d, i, n) => d.level === 3 && n[i] === this ? 1 :
				d.sourceLinks.filter(e => e.target.id === datum.id).length ? 1 : fadeOpacityNodes);
			const linksToCluster = sankeyDataAllocations.nodes.reduce((acc, curr) => {
				const targets = curr.sourceLinks.map(e => e.target.id);
				if (curr.level === 2 && targets.includes(datum.id)) acc.push(curr.id);
				return acc;
			}, []);
			sankeyLinksAllocations.style("stroke-opacity", d => d.target.id === datum.id || linksToCluster.includes(d.target.id) ? linksOpacity : fadeOpacityLinks);
			sankeyPartnerNames.style("opacity", d => linksToCluster.includes(d.id) ? 1 : fadeOpacityNodes);
			sankeyPartnerValues.style("opacity", d => linksToCluster.includes(d.id) ? 1 : fadeOpacityNodes);
			sankeyClusterNames.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
			sankeyClusterValues.style("opacity", d => d.codeId === datum.codeId ? 1 : fadeOpacityNodes);
			sankeyPartnerValues.each((d, i, n) => {
				const amountFromCluster = d.sourceLinks.reduce((acc, curr) => {
					if (curr.target.id === datum.id) acc += curr.value;
					return acc;
				}, 0);
				d3.select(n[i]).transition()
					.duration(duration)
					.textTween(() => {
						const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, amountFromCluster);
						return t => "$" + formatSIFloat(interpolator(t));
					});
			});
		};

		function mouseOutClusterNodes() {
			resetOpacity();
		};

		function mouseOverPartnerLinks(datum) {
			sankeyNodesAllocations.style("opacity", (d, i, n) => datum.target.id === d.id ||
				d.targetLinks.filter(e => e.source.id === datum.target.id).length ? 1 : fadeOpacityNodes);
			sankeyLinksAllocations.style("stroke-opacity", d => d.target.id === datum.target.id || d.source.id === datum.target.id ? linksOpacity : fadeOpacityLinks);
			sankeyPartnerNames.style("opacity", d => d.codeId === datum.target.codeId ? 1 : fadeOpacityNodes);
			sankeyPartnerValues.style("opacity", d => d.codeId === datum.target.codeId ? 1 : fadeOpacityNodes);
			sankeyClusterNames.style("opacity", d => d.targetLinks.filter(e => e.source.id === datum.target.id).length ? 1 : fadeOpacityNodes);
			sankeyClusterValues.style("opacity", d => d.targetLinks.filter(e => e.source.id === datum.target.id).length ? 1 : fadeOpacityNodes);
			sankeyClusterValues.each((d, i, n) => {
				const amountFromPartner = d.targetLinks.reduce((acc, curr) => {
					if (curr.source.id === datum.target.id) acc += curr.value;
					return acc;
				}, 0);
				d3.select(n[i]).transition()
					.duration(duration)
					.textTween(() => {
						const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, amountFromPartner);
						return t => "$" + formatSIFloat(interpolator(t));
					});
			});
		};

		function mouseOutPartnerLinks(datum) {
			resetOpacity();
		};

		function mouseOverClusterLinks(datum) {
			sankeyNodesAllocations.style("opacity", (d, i, n) => datum.target.id === d.id || d.id === datum.source.id ? 1 : fadeOpacityNodes);
			sankeyLinksAllocations.style("stroke-opacity", (d, i, n) => d.target.id === datum.source.id || n[i] === this ? linksOpacity : fadeOpacityLinks);
			sankeyPartnerNames.style("opacity", d => d.id === datum.source.id ? 1 : fadeOpacityNodes);
			sankeyPartnerValues.style("opacity", d => d.id === datum.source.id ? 1 : fadeOpacityNodes);
			sankeyClusterNames.style("opacity", d => d.codeId === datum.target.codeId ? 1 : fadeOpacityNodes);
			sankeyClusterValues.style("opacity", d => d.codeId === datum.target.codeId ? 1 : fadeOpacityNodes);
			sankeyPartnerValues.each((d, i, n) => {
				const amountFromCluster = d.sourceLinks.reduce((acc, curr) => {
					if (curr.target.id === datum.target.id) acc += curr.value;
					return acc;
				}, 0);
				d3.select(n[i]).transition()
					.duration(duration)
					.textTween(() => {
						const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, amountFromCluster);
						return t => "$" + formatSIFloat(interpolator(t));
					});
			});
			sankeyClusterValues.each((d, i, n) => {
				const amountFromPartner = d.targetLinks.reduce((acc, curr) => {
					if (curr.source.id === datum.source.id) acc += curr.value;
					return acc;
				}, 0);
				d3.select(n[i]).transition()
					.duration(duration)
					.textTween(() => {
						const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, amountFromPartner);
						return t => "$" + formatSIFloat(interpolator(t));
					});
			});
		};

		function mouseOutClusterLinks(datum) {
			resetOpacity();
		};

		function resetOpacity() {
			sankeyNodesAllocations.style("opacity", 1);
			sankeyLinksAllocations.style("stroke-opacity", linksOpacity);
			sankeyPartnerNames.style("opacity", 1);
			sankeyPartnerValues.style("opacity", 1);
			sankeyClusterNames.style("opacity", 1);
			sankeyClusterValues.style("opacity", 1);
			sankeyClusterValues.transition()
				.duration(duration)
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.value);
					return t => "$" + formatSIFloat(interpolator(t));
				});
			sankeyPartnerValues.transition()
				.duration(duration)
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent.split("$")[1]) || 0, d.value);
					return t => "$" + formatSIFloat(interpolator(t));
				});
		};

		//sankeyPartnerNames.call(wrapNames, nameWidth);

		//end of drawSankeyAllocations
	};

	function preProcessData(rawDataAllocations, rawDataContributions) {
		yearsArrayAllocations.push(...new Set(rawDataAllocations.map(e => e.allocationYear)));
		yearsArrayContributions.push(...new Set(rawDataContributions.map(e => e.contributionYear)));
		yearsArrayAllocations.sort((a, b) => a - b);
		yearsArrayContributions.sort((a, b) => a - b);
		yearsArrayAllocations.forEach(e => {
			if (yearsArrayContributions.includes(e)) yearsArray.push(e);
		});
	};

	function processDataAllocations(rawDataAllocations) {

		const data = {
			nodes: [],
			links: []
		};

		const fundNode = {
			codeId: null,
			level: 1,
			name: null,
			value: 0,
			id: fundId
		};

		rawDataAllocations.forEach(row => {
			if (chartState.selectedYear.includes(row.allocationYear) && chartState.selectedFund.includes(row.fundId)) {

				const foundPartner = data.nodes.find(d => d.level === 2 && d.codeId === row.partnerCode);

				const foundCluster = data.nodes.find(d => d.level === 3 && d.codeId === row.clusterId);

				if (foundPartner) {
					foundPartner.value += row.budget;
				} else {
					data.nodes.push({
						codeId: row.partnerCode,
						level: 2,
						name: lists.unAgencyNames[row.partnerCode],
						value: row.budget,
						id: "partner#" + row.partnerCode
					});
				};

				if (foundCluster) {
					foundCluster.value += row.budget;
				} else {
					data.nodes.push({
						codeId: row.clusterId,
						level: 3,
						name: lists.clusterNames[row.clusterId],
						value: row.budget,
						id: "cluster#" + row.clusterId
					});
				};

				const foundLinkToPartner = data.links.find(d => d.target === "partner#" + row.partnerCode);

				const foundLinkToCluster = data.links.find(d => d.source === "partner#" + row.partnerCode && d.target === "cluster#" + row.clusterId);

				if (foundLinkToPartner) {
					foundLinkToPartner.value += row.budget;
				} else {
					data.links.push({
						source: fundId,
						target: "partner#" + row.partnerCode,
						value: row.budget
					});
				};

				if (foundLinkToCluster) {
					foundLinkToCluster.value += row.budget;
				} else {
					data.links.push({
						source: "partner#" + row.partnerCode,
						target: "cluster#" + row.clusterId,
						value: row.budget
					});
				};

				fundNode.value += row.budget;

			};
		});

		data.nodes.sort((a, b) => b.value - a.value);

		data.nodes.push(fundNode);

		return data;

		//end of processDataAllocations;
	};

	function processDataContributions(rawDataContributions) {

		const data = {
			nodes: [],
			links: []
		};

		const fundNode = {
			codeId: null,
			level: 2,
			name: null,
			value: 0,
			id: fundId
		};

		rawDataContributions.forEach(row => {
			if (chartState.selectedYear.includes(row.contributionYear) && chartState.selectedFund.includes(row.fundId)) {

				const foundSource = data.nodes.find(d => d.level === 1 && d.codeId === row.donorId);

				if (foundSource) {
					foundSource.value += row.paidAmount + row.pledgedAmount;
				} else {
					data.nodes.push({
						codeId: row.donorId,
						level: 1,
						name: lists.donorNames[row.donorId],
						value: row.paidAmount + row.pledgedAmount,
						id: "donor#" + row.donorId
					});
				};

				const foundLink = data.links.find(d => d.source === "donor#" + row.donorId);

				if (foundLink) {
					foundLink.value += row.paidAmount + row.pledgedAmount;
				} else {
					data.links.push({
						source: "donor#" + row.donorId,
						target: fundId,
						value: row.paidAmount + row.pledgedAmount
					});
				};

				fundNode.value += row.paidAmount + row.pledgedAmount;

			};
		});

		data.nodes.sort((a, b) => b.value - a.value);

		data.nodes = data.nodes.reduce((acc, curr, index) => {
			if (curr.level === 1) {
				if (index < maxDonorsNumber) {
					acc.push(curr)
				} else if (index === maxDonorsNumber) {
					acc.push({
						codeId: othersId,
						level: 1,
						name: othersName,
						value: curr.value,
						id: "donor#" + othersId
					});
				} else {
					acc[maxDonorsNumber].value += curr.value;
				};
			};
			return acc;
		}, []);

		data.nodes.push(fundNode);

		const donorsInData = data.nodes.map(d => d.id);

		data.links = data.links.reduce((acc, curr) => {
			if (donorsInData.includes(curr.source)) {
				acc.push(curr);
			} else {
				const foundOthers = acc.find(e => e.source === "donor#" + othersId);
				if (foundOthers) {
					foundOthers.value += curr.value;
				} else {
					acc.push({
						source: "donor#" + othersId,
						target: fundId,
						value: curr.value
					});
				};
			};
			return acc;
		}, []);

		return data;

		//end of processDataContributions;
	};

	function spreadNodes(nodes, padding) {
		const spacer = freeNodeSpace / (nodes.length + 1);
		nodes.forEach((node, index) => {
			if (padding) {
				node.x0 += partnersPadding;
				node.x1 += partnersPadding;
			};
			node.y0 += spacer * (index + 1);
			node.y1 += spacer * (index + 1);
		});
	};

	function horizontalSource(d) {
		return [inverseContributionsScale(d.y0), d.source.x1];
	};

	function horizontalTarget(d) {
		return [inverseContributionsScale(d.y1), d.target.x0];
	};

	function drawLinks() {
		return d3.linkVertical()
			.source(horizontalSource)
			.target(horizontalTarget);
	};

	function checkCollision(selection) {
		selection.each((_, i, n) => {
			if (n[i + 1]) {
				const previousElementBox = (n[i + 1]).getBoundingClientRect();
				const currentElementBox = (n[i]).getBoundingClientRect();
				if (previousElementBox.right + namesPadding > currentElementBox.left) {
					d3.select(n[i]).style("transform-box", "fill-box")
						.attr("transform", `rotate(${angle})`)
				};
			};
		});
	};

	function wrapNames(text, width) {
		text.each(function() {
			let text = d3.select(this),
				words = text.text().split(/\s+/);
			if (words.length < 2) return;
			let word,
				line = [],
				lineNumber = 0,
				lineHeight = -1.1,
				y = text.attr("y"),
				x = text.attr("x"),
				dy = 0,
				tspan = text.text(null)
				.append("tspan")
				.attr("x", x)
				.attr("y", y)
				.attr("dy", dy + "em");
			while (word = words.pop()) {
				line.unshift(word);
				tspan.text(line.join(" "));
				if (tspan.node()
					.getComputedTextLength() > width) {
					line.shift();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan")
						.attr("x", x)
						.attr("y", y)
						.attr("dy", ++lineNumber * lineHeight + dy + "em")
						.text(word);
				}
			}
		});
	};

	function createDonorNamesList(donorsData) {
		donorsData.forEach(row => {
			lists.donorNames[row.id + ""] = row.donorName;
			lists.donorTypes[row.id + ""] = row.donorType;
			lists.donorIsoCodes[row.id + ""] = row.donorISO2Code;
		});
	};

	function createFundNamesList(fundsData) {
		fundsData.forEach(row => {
			lists.fundNames[row.id + ""] = row.PooledFundName;
			lists.fundAbbreviatedNames[row.id + ""] = row.PooledFundNameAbbrv;
			lists.fundRegions[row.id + ""] = row.RegionName;
			lists.fundIsoCodes[row.id + ""] = row.ISO2Code;
			lists.fundIsoCodes3[row.id + ""] = row.CountryCode;
			if (row.PooledFundName === "CERF") cerfPooledFundId = row.id;
		});
	};

	function createAllocationTypesList(allocationTypesData) {
		allocationTypesData.forEach(row => {
			lists.allocationTypes[row.id + ""] = row.AllocationName;
		});
	};

	function createPartnerTypesList(partnersData) {
		partnersData.forEach(row => {
			lists.partnerTypes[row.id + ""] = row.OrganizationTypeName;
		});
	};

	function createUnAgenciesNamesList(unAgenciesData) {
		unAgenciesData.forEach(row => {
			lists.unAgencyNames[row.agencyID + ""] = row.agencyName;
			lists.unAgencyShortNames[row.agencyID + ""] = row.agencyShortName;
		});
	};

	function createClustersList(clustersData) {
		clustersData.forEach(row => {
			lists.clusterNames[row.id + ""] = row.ClustNm;
			lists.clusterShortNames[row.id + ""] = clusterNamesScale(row.ClustNm);
		});
	};

	function fetchFile(fileName, url, warningString, method) {
		if (localStorage.getItem(fileName) &&
			JSON.parse(localStorage.getItem(fileName)).timestamp > (currentDate.getTime() - localStorageTime)) {
			const fetchedData = method === "csv" ? d3.csvParse(JSON.parse(localStorage.getItem(fileName)).data, d3.autoType) :
				JSON.parse(localStorage.getItem(fileName)).data;
			console.info("CERF BI chart info: " + warningString + " from local storage");
			return Promise.resolve(fetchedData);
		} else {
			const fetchMethod = method === "csv" ? d3.csv : d3.json;
			const rowFunction = method === "csv" ? d3.autoType : null;
			return fetchMethod(url, rowFunction).then(fetchedData => {
				try {
					localStorage.setItem(fileName, JSON.stringify({
						data: method === "csv" ? d3.csvFormat(fetchedData) : fetchedData,
						timestamp: currentDate.getTime()
					}));
				} catch (error) {
					console.info("CERF BI chart, " + error);
				};
				console.info("CERF BI chart info: " + warningString + " from API");
				return fetchedData;
			});
		};
	};

	function validateYear(yearString) {
		if (yearString.toLowerCase() === allYearsOption) {
			chartState.selectedYear.push(allYearsOption);
			return;
		};
		const allYears = yearString.split(",").map(d => +(d.trim())).sort((a, b) => a - b);
		allYears.forEach(d => {
			if (d && yearsArray.includes(d)) chartState.selectedYear.push(d);
		});
		if (!chartState.selectedYear.length) chartState.selectedYear.push(new Date().getFullYear());
	};

	function validateCustomEventYear(yearNumber) {
		if (yearsArray.includes(yearNumber)) {
			return yearNumber;
		};
		while (!yearsArray.includes(yearNumber)) {
			yearNumber = yearNumber >= currentYear ? yearNumber - 1 : yearNumber + 1;
		};
		return yearNumber;
	};

	function setYearsDescriptionDiv() {
		yearsDescriptionDiv.html(function() {
			if (chartState.selectedYear.length <= maxYearsListNumber) return null;
			const yearsList = chartState.selectedYear.sort(function(a, b) {
				return a - b;
			}).reduce(function(acc, curr, index) {
				return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
			}, "");
			return "\u002ASelected years: " + yearsList;
		});
	};

	function parseTransform(translate) {
		const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
		group.setAttributeNS(null, "transform", translate);
		const matrix = group.transform.baseVal.consolidate().matrix;
		return [matrix.e, matrix.f];
	};

	function formatSIFloat(value) {
		const length = (~~Math.log10(value) + 1) % 3;
		const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
		return d3.formatPrefix("." + digits, value)(value).replace("G", "B");
	};

	function reverseFormat(s) {
		if (+s === 0) return 0;
		let returnValue;
		const transformation = {
			Y: Math.pow(10, 24),
			Z: Math.pow(10, 21),
			E: Math.pow(10, 18),
			P: Math.pow(10, 15),
			T: Math.pow(10, 12),
			G: Math.pow(10, 9),
			B: Math.pow(10, 9),
			M: Math.pow(10, 6),
			k: Math.pow(10, 3),
			h: Math.pow(10, 2),
			da: Math.pow(10, 1),
			d: Math.pow(10, -1),
			c: Math.pow(10, -2),
			m: Math.pow(10, -3),
			μ: Math.pow(10, -6),
			n: Math.pow(10, -9),
			p: Math.pow(10, -12),
			f: Math.pow(10, -15),
			a: Math.pow(10, -18),
			z: Math.pow(10, -21),
			y: Math.pow(10, -24)
		};
		Object.keys(transformation).some(function(k) {
			if (s.indexOf(k) > 0) {
				returnValue = parseFloat(s.split(k)[0]) * transformation[k];
				return true;
			}
		});
		return returnValue;
	};

	//end of d3ChartIIFE
}());