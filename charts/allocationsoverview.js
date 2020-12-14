(function d3ChartIIFE() {

	const width = 1100,
		padding = [4, 4, 4, 4],
		panelHorizontalPadding = 4,
		buttonsPanelHeight = 30,
		mapPanelHeight = 510,
		legendPanelHeight = 80,
		legendPanelWidth = 86,
		legendPanelHorPadding = 2,
		legendPanelVertPadding = 2,
		mapZoomButtonHorPadding = 10,
		mapZoomButtonVertPadding = 10,
		mapZoomButtonSize = 26,
		maxColumnRectHeight = 16,
		maxPieSize = 20,
		minPieSize = 1,
		buttonsNumber = 8,
		groupNamePadding = 2,
		topPanelHeight = 60,
		cerfCircleRadius = 20,
		zoomBoundingMarginHor = 26,
		zoomBoundingMarginVert = 6,
		innerTooltipDivWidth = 290,
		clusterIconSize = 18,
		clusterIconPadding = 2,
		labelsColumnPadding = 2,
		unBlue = "#1F69B3",
		cerfColor = "#F9D25B",
		choroplethColorTotal = "#F9D25B",
		choroplethColorRR = "#F0DA8A",
		choroplethColorUnderfunded = "#B8C9E6",
		countriesBackground = "#F4F4F4",
		classPrefix = "allocover",
		globalIsoCode = "0G",
		countryNameMaxLength = 60,
		colorInterpolatorTotal = d3.interpolateRgb("#FFFFFF", d3.color(choroplethColorTotal).darker(0.1)),
		colorInterpolatorRR = d3.interpolateRgb("#FFFFFF", d3.color(choroplethColorRR).darker(0.1)),
		colorInterpolatorUnderfunded = d3.interpolateRgb("#FFFFFF", d3.color(choroplethColorUnderfunded).darker(0.1)),
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		fadeOpacity = 0.2,
		tooltipMargin = 8,
		tooltipSvgWidth = 310,
		tooltipSvgHeight = 80,
		showNamesMargin = 12,
		tooltipSvgPadding = [12, 36, 2, 96],
		height = padding[0] + padding[2] + topPanelHeight + buttonsPanelHeight + mapPanelHeight + (2 * panelHorizontalPadding),
		windowHeight = window.innerHeight,
		currentDate = new Date(),
		currentYear = currentDate.getFullYear(),
		localVariable = d3.local(),
		localStorageTime = 600000,
		duration = 1000,
		shortDuration = 250,
		stickHeight = 2,
		lollipopRadius = 4,
		labelPadding = 2,
		formatMoney0Decimals = d3.format(",.0f"),
		formatSIaxes = d3.format("~s"),
		formatNumberSI = d3.format(".3s"),
		chartTitleDefault = "Allocations",
		vizNameQueryString = "allocationsmap",
		bookmarkSite = "https://pfbi.unocha.org/bookmark.html?",
		dataUrl = "https://cbpfgms.github.io/pf-onebi-data/cerf/cerf_allocationSummary_byorg.csv",
		mapUrl = "https://cbpfgms.github.io/pf-onebi-data/map/unworldmap.json",
		masterFundsUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstCountry.json",
		masterAllocationTypesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstAllocation.json",
		masterUnAgenciesUrl = "https://cerfgms-webapi.unocha.org/v1/agency/All.json",
		masterPartnerTypesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstOrganization.json",
		masterClusterTypesUrl = "https://cbpfgms.github.io/pf-onebi-data/mst/MstCluster.json",
		csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
		moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
			"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
			"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
			"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
		],
		yearsArray = [],
		countryNames = {},
		centroids = {},
		partnerTypes = [],
		cerfAllocationTypes = {},
		cerfTypeKeys = ["3", "4"],
		fundNamesList = {},
		fundAbbreviatedNamesList = {},
		fundIsoCodesList = {},
		fundIsoCodes3List = {},
		fundLatLongList = {},
		partnersList = {},
		clustersList = {},
		allocationTypesList = {},
		uNAgenciesNamesList = {},
		uNAgenciesShortNamesList = {},
		fundNamesListKeys = [],
		separator = "##",
		chartState = {
			selectedYear: [],
			selectedCluster: [],
			selectedCerfAllocation: null,
			showNames: null
		};

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

	let isSnapshotTooltipVisible = false,
		currentHoveredElem;

	const hardcodedAllocations = [{
		isoCode: "XX",
		long: 35.24,
		lat: 38.96
	}, {
		isoCode: "KM",
		long: 43.87,
		lat: -11.87
	}, {
		isoCode: "CV",
		long: -24.01,
		lat: 16
	}, {
		isoCode: "MH",
		long: 171.18,
		lat: 7.13
	}, {
		isoCode: "AG",
		long: -61.8,
		lat: 17.06
	}, {
		isoCode: "DM",
		long: -61.37,
		lat: 15.41
	}, {
		isoCode: "0V",
		long: -66.85,
		lat: 1.23
	}, {
		isoCode: "WS",
		long: -172.1,
		lat: -13.76
	}, {
		isoCode: "XA",
		long: 41.9,
		lat: 3.86
	}, {
		isoCode: globalIsoCode,
		long: -74,
		lat: 40.73
	}];

	const hardcodedRegionals = [41, 31, 110, 103];

	const queryStringValues = new URLSearchParams(location.search);

	if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

	const containerDiv = d3.select("#d3chartcontainer" + classPrefix);

	const showHelp = containerDiv.node().getAttribute("data-showhelp") === "true";

	const showLink = containerDiv.node().getAttribute("data-showlink") === "true";

	const showNamesOption = queryStringValues.has("shownames") ? queryStringValues.get("shownames") === "true" : containerDiv.node().getAttribute("data-shownames") === "true";

	const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

	const selectedResponsiveness = containerDiv.node().getAttribute("data-responsive") === "true";

	const lazyLoad = containerDiv.node().getAttribute("data-lazyload") === "true";

	const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-year");

	//improve this:
	// const selectedCerfAllocation = queryStringValues.has("cerfallocation") && cerfAllocationTypes.indexOf(queryStringValues.get("cerfallocation")) > -1 ? queryStringValues.get("cerfallocation") :
	// 	cerfAllocationTypes.indexOf(containerDiv.node().getAttribute("data-cerfallocation")) > -1 ?
	// 	containerDiv.node().getAttribute("data-cerfallocation") : "total";

	chartState.selectedCerfAllocation = "0";

	chartState.showNames = showNamesOption;

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
		.on("mouseleave", function() {
			isSnapshotTooltipVisible = false;
			snapshotTooltip.style("display", "none");
			tooltip.style("display", "none");
		});

	snapshotTooltip.append("p")
		.attr("id", classPrefix + "SnapshotTooltipPdfText")
		.html("Download PDF")
		.on("click", function() {
			isSnapshotTooltipVisible = false;
			createSnapshot("pdf", true);
		});

	snapshotTooltip.append("p")
		.attr("id", classPrefix + "SnapshotTooltipPngText")
		.html("Download Image (PNG)")
		.on("click", function() {
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

	const topPanel = {
		main: svg.append("g")
			.attr("class", "covmaptopPanel")
			.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
		width: width - padding[1] - padding[3],
		height: topPanelHeight,
		padding: [0, 0, 0, 0],
		moneyBagPadding: 4,
		leftPadding: [180, 380, 710, 926, 1010],
		mainValueVerPadding: 12,
		mainValueHorPadding: 1,
		linePadding: 8
	};

	const buttonsPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "buttonsPanel")
			.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
		width: width - padding[1] - padding[3],
		height: buttonsPanelHeight,
		padding: [0, 0, 0, 0],
		buttonWidth: 54,
		buttonsMargin: 4,
		buttonsPadding: 6,
		buttonVerticalPadding: 4,
		arrowPadding: 18,
		cerfButtonsMargin: 546,
	};

	const mapPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "mapPanel")
			.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding)) + ")"),
		width: width - padding[1] - padding[3],
		height: mapPanelHeight,
		padding: [0, 0, 0, 0],
	};

	const legendPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "legendPanel")
			.attr("transform", "translate(" + (padding[3] + legendPanelHorPadding) + "," + (padding[0] + topPanel.height + buttonsPanel.height + panelHorizontalPadding + mapPanel.height - legendPanelHeight - legendPanelVertPadding) + ")"),
		width: legendPanelWidth,
		height: legendPanelHeight,
		padding: [20, 0, 12, 4],
	};

	const mapZoomButtonPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "mapZoomButtonPanel")
			.attr("transform", "translate(" + (padding[3] + mapZoomButtonHorPadding) + "," + (padding[0] + topPanel.height + buttonsPanel.height + panelHorizontalPadding + mapZoomButtonVertPadding) + ")"),
		width: mapZoomButtonSize,
		height: mapZoomButtonSize * 2,
		padding: [4, 4, 4, 4],
	};

	const checkboxesPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "checkboxesPanel")
			.attr("transform", "translate(" + (padding[3] + mapZoomButtonHorPadding + 1) + "," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding) + mapZoomButtonVertPadding + mapZoomButtonPanel.height + showNamesMargin) + ")"),
		padding: [0, 0, 0, 0],
	};

	const mapPanelClip = mapPanel.main.append("clipPath")
		.attr("id", classPrefix + "mapPanelClip")
		.append("rect")
		.attr("width", mapPanel.width)
		.attr("height", mapPanel.height);

	mapPanel.main.attr("clip-path", "url(#" + classPrefix + "mapPanelClip)");

	const zoomLayer = mapPanel.main.append("g")
		.attr("class", classPrefix + "zoomLayer")
		.style("opacity", 0)
		.attr("cursor", "move")
		.attr("pointer-events", "all");

	const zoomRectangle = zoomLayer.append("rect")
		.attr("width", mapPanel.width)
		.attr("height", mapPanel.height);

	const mapContainer = mapPanel.main.append("g")
		.attr("class", classPrefix + "mapContainer");

	const piesContainer = mapPanel.main.append("g")
		.attr("class", classPrefix + "piesContainer");

	const mapProjection = d3.geoEqualEarth();

	const mapPath = d3.geoPath()
		.projection(mapProjection);

	const radiusScale = d3.scaleSqrt()
		.range([minPieSize, maxPieSize]);

	const colors = d3.range(0.1, 1.1, 0.1).map(function(d) {
		return colorInterpolatorTotal(d);
	});

	const colorScale = d3.scaleQuantile()
		.range(colors);

	const arcGenerator = d3.arc()
		.innerRadius(0);

	const arcGeneratorEnter = d3.arc()
		.innerRadius(0)
		.outerRadius(0);

	const pieGenerator = d3.pie()
		.value(function(d) {
			return d.value;
		})
		.sort(null);

	const zoom = d3.zoom()
		.scaleExtent([1, 20])
		.extent([
			[0, 0],
			[mapPanel.width, mapPanel.height]
		])
		.translateExtent([
			[0, 0],
			[mapPanel.width, mapPanel.height]
		]);

	mapPanel.main.call(zoom);

	const defs = svg.append("defs");

	const filter = defs.append("filter")
		.attr("id", classPrefix + "dropshadow")
		.attr('filterUnits', 'userSpaceOnUse');

	filter.append("feGaussianBlur")
		.attr("in", "SourceAlpha")
		.attr("stdDeviation", 3);

	filter.append("feOffset")
		.attr("dx", 0)
		.attr("dy", 0);

	const feComponent = filter.append("feComponentTransfer");

	feComponent.append("feFuncA")
		.attr("type", "linear")
		.attr("slope", 0.7);

	const feMerge = filter.append("feMerge");

	feMerge.append("feMergeNode");
	feMerge.append("feMergeNode")
		.attr("in", "SourceGraphic");

	mapZoomButtonPanel.main.style("filter", "url(#" + classPrefix + "dropshadow)");

	const tooltipSvgYScale = d3.scalePoint()
		.range([tooltipSvgPadding[0], tooltipSvgHeight - tooltipSvgPadding[2]])
		.padding(0.5);

	const tooltipSvgXScale = d3.scaleLinear()
		.range([tooltipSvgPadding[3], tooltipSvgWidth - tooltipSvgPadding[1]]);

	const tooltipSvgYAxis = d3.axisLeft(tooltipSvgYScale)
		.tickSize(0)
		.tickPadding(5);

	const tooltipSvgXAxis = d3.axisTop(tooltipSvgXScale)
		.tickSizeOuter(0)
		.tickSizeInner(-(tooltipSvgHeight - tooltipSvgPadding[0] - tooltipSvgPadding[2]))
		.ticks(3)
		.tickPadding(4)
		.tickFormat(function(d) {
			return "$" + formatSIaxes(d).replace("G", "B");
		});

	Promise.all([fetchFile("unworldmap", mapUrl, "world map", "json"),
			fetchFile("masterFunds", masterFundsUrl, "master table for funds", "json"),
			fetchFile("masterAllocationTypes", masterAllocationTypesUrl, "master table for allocation types", "json"),
			fetchFile("masterUnAgenciesTypes", masterUnAgenciesUrl, "master table for un agencies", "json"),
			fetchFile("masterPartnerTypes", masterPartnerTypesUrl, "master table for partner types", "json"),
			fetchFile("masterClusterTypes", masterClusterTypesUrl, "master table for cluster types", "json"),
			fetchFile("allocationsData", dataUrl, "allocations data", "csv")
		])
		.then(rawData => csvCallback(rawData));

	function fetchFile(fileName, url, warningString, method) {
		if (localStorage.getItem(fileName) &&
			JSON.parse(localStorage.getItem(fileName)).timestamp > (currentDate.getTime() - localStorageTime)) {
			const fetchedData = method === "csv" ? d3.csvParse(JSON.parse(localStorage.getItem(fileName)).data, d3.autoType) :
				JSON.parse(localStorage.getItem(fileName)).data;
			console.info("CERF chart info: " + warningString + " from local storage");
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
					console.info("CERF chart, " + error);
				};
				console.info("CERF chart info: " + warningString + " from API");
				return fetchedData;
			});
		};
	};

	function csvCallback([mapData,
		masterFunds,
		masterAllocationTypes,
		masterUnAgenciesTypes,
		masterPartnerTypes,
		masterClusterTypes,
		rawData
	]) {

		preProcessData(rawData);
		validateYear(selectedYearString);
		createFundNamesList(masterFunds);
		createUnAgenciesNamesList(masterUnAgenciesTypes);
		createPartnersList(masterPartnerTypes);
		createClustersList(masterClusterTypes);
		createAllocationTypesList(masterAllocationTypes);

		cerfAllocationTypes["0"] = "Total";

		if (!lazyLoad) {
			draw(rawData, mapData);
		} else {
			const chartDiv = document.getElementById("allocation-overview");
			let observer = new MutationObserver(function(mutations) {
				const show = mutations.some(function(e) {
					return e.target.classList.contains("show")
				});
				if (show) {
					observer.disconnect();
					draw(rawData, mapData)
				};
			});
			observer.observe(chartDiv, {
				attributes: true
			});
		};

		//end of csvCallback
	};

	function draw(rawData, mapData) {

		//TEST
		// topPanel.main.append("rect")
		// 	.attr("width", topPanel.width)
		// 	.attr("height", topPanel.height)
		// 	.style("opacity", 0.15);
		// mapLayer.append("rect")
		// 	.attr("width", mapPanel.width)
		// 	.attr("height", mapPanel.height)
		// 	.style("opacity", 0.15);
		// legendPanel.main.append("rect")
		// 	.attr("width", legendPanel.width)
		// 	.attr("height", legendPanel.height)
		// 	.style("fill", "green")
		// 	.style("opacity", 0.15);
		// mapZoomButtonPanel.main.append("rect")
		// 	.attr("width", mapZoomButtonPanel.width)
		// 	.attr("height", mapZoomButtonPanel.height)
		// 	.style("fill", "blue")
		// 	.style("opacity", 0.15);
		//TEST

		const data = processData(rawData);

		verifyCentroids(data.map);

		//createTitle(rawData);

		createButtonsPanel(rawData);

		createMap(mapData);

		createZoomButtons();

		createCheckboxes();

		createTopPanel(data);

		createChoropleth(data);

		createLegend(data);

		createFooterDiv();

		if (showHelp) createAnnotationsDiv();

		//end of draw
	};

	function createTitle(rawData) {

		const title = titleDiv.append("p")
			.attr("id", classPrefix + "d3chartTitle")
			.html(chartTitle);

		const helpIcon = iconsDiv.append("button")
			.attr("id", classPrefix + "HelpButton");

		helpIcon.html("HELP  ")
			.append("span")
			.attr("class", "fa fa-info")

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
				timer = d3.interval(loopButtons, 2 * duration);
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

		helpIcon.on("click", createAnnotationsDiv);

		downloadIcon.on("click", function() {

			const csv = createCsv(rawData); //CHANGE

			const currentDate = new Date();

			const fileName = classPrefix + "_" + csvDateFormat(currentDate) + ".csv";

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

	function createMap(mapData) {

		const countryFeatures = topojson.feature(mapData, mapData.objects.wrl_polbnda_int_simple_uncs);

		countryFeatures.features = countryFeatures.features.filter(d => d.properties.ISO_2 !== "AQ");

		mapProjection.fitExtent([
			[mapPanel.padding[3], mapPanel.padding[0]],
			[(mapPanel.width - mapPanel.padding[1] - mapPanel.padding[3]), (mapPanel.height - mapPanel.padding[0] - mapPanel.padding[2])]
		], countryFeatures);

		const paths = mapContainer.selectAll(null)
			.data(countryFeatures.features)
			.enter()
			.append("path")
			.attr("d", mapPath)
			.attr("class", classPrefix + "MapPath")
			.style("fill", countriesBackground);

		const borders = mapContainer.append("path")
			.attr("d", mapPath(topojson.mesh(mapData, mapData.objects.wrl_polbnda_int_simple_uncs, (a, b) => a !== b)))
			.attr("class", classPrefix + "Border")
			.style("fill", "none")
			.style("stroke", "#C5C5C5")
			.style("stroke-width", "1px");

		const cerfCircle = mapContainer.append("circle")
			.datum({
				properties: {
					ISO_2: globalIsoCode
				}
			})
			.attr("class", classPrefix + "MapPath")
			.attr("cx", function() {
				const globalCerf = hardcodedAllocations.find(function(e) {
					return e.isoCode === globalIsoCode
				});
				return mapProjection([globalCerf.long, globalCerf.lat])[0]
			})
			.attr("cy", function() {
				const globalCerf = hardcodedAllocations.find(function(e) {
					return e.isoCode === globalIsoCode
				});
				return mapProjection([globalCerf.long, globalCerf.lat])[1]
			})
			.attr("r", cerfCircleRadius)
			.style("fill", countriesBackground)
			.style("stroke", "#C5C5C5")
			.style("stroke-width", "1px");

		const cerfText = mapContainer.append("text")
			.attr("class", classPrefix + "CerfText")
			.attr("x", function() {
				const globalCerf = hardcodedAllocations.find(function(e) {
					return e.isoCode === globalIsoCode;
				});
				return mapProjection([globalCerf.long, globalCerf.lat])[0]
			})
			.attr("y", function() {
				const globalCerf = hardcodedAllocations.find(function(e) {
					return e.isoCode === globalIsoCode;
				});
				return mapProjection([globalCerf.long, globalCerf.lat])[1] + cerfCircleRadius + 8;
			})
			.text("CERF Global");

		countryFeatures.features.forEach(function(d) {
			centroids[d.properties.ISO_2] = {
				x: mapPath.centroid(d.geometry)[0],
				y: mapPath.centroid(d.geometry)[1]
			}
		});

		// centroids.XX = centroids.TR;

		//Countries with problems:
		//"KM","WS","AG","DM","MH","CV"
		//Comoros, (west) Samoa, Antigua and Barbuda, Dominica, Marshall Islands, Cabo Verde
		//And the fake codes: XV, XA and XG
		hardcodedAllocations.forEach(function(d) {
			const projected = mapProjection([d.long, d.lat]);
			centroids[d.isoCode] = {
				x: projected[0],
				y: projected[1]
			};
		});

		//end of createMap
	};

	function createZoomButtons() {

		const zoomInGroup = mapZoomButtonPanel.main.append("g")
			.attr("class", classPrefix + "zoomInGroup")
			.attr("cursor", "pointer");

		const zoomInPath = zoomInGroup.append("path")
			.attr("class", classPrefix + "zoomPath")
			.attr("d", function() {
				const drawPath = d3.path();
				drawPath.moveTo(0, mapZoomButtonPanel.height / 2);
				drawPath.lineTo(0, mapZoomButtonPanel.padding[0]);
				drawPath.quadraticCurveTo(0, 0, mapZoomButtonPanel.padding[0], 0);
				drawPath.lineTo(mapZoomButtonPanel.width - mapZoomButtonPanel.padding[1], 0);
				drawPath.quadraticCurveTo(mapZoomButtonPanel.width, 0, mapZoomButtonPanel.width, mapZoomButtonPanel.padding[1]);
				drawPath.lineTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height / 2);
				drawPath.closePath();
				return drawPath.toString();
			});

		const zoomInText = zoomInGroup.append("text")
			.attr("class", classPrefix + "zoomText")
			.attr("text-anchor", "middle")
			.attr("x", mapZoomButtonPanel.width / 2)
			.attr("y", (mapZoomButtonPanel.height / 4) + 7)
			.text("+");

		const zoomOutGroup = mapZoomButtonPanel.main.append("g")
			.attr("class", classPrefix + "zoomOutGroup")
			.attr("cursor", "pointer");

		const zoomOutPath = zoomOutGroup.append("path")
			.attr("class", classPrefix + "zoomPath")
			.attr("d", function() {
				const drawPath = d3.path();
				drawPath.moveTo(0, mapZoomButtonPanel.height / 2);
				drawPath.lineTo(0, mapZoomButtonPanel.height - mapZoomButtonPanel.padding[3]);
				drawPath.quadraticCurveTo(0, mapZoomButtonPanel.height, mapZoomButtonPanel.padding[3], mapZoomButtonPanel.height);
				drawPath.lineTo(mapZoomButtonPanel.width - mapZoomButtonPanel.padding[2], mapZoomButtonPanel.height);
				drawPath.quadraticCurveTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height, mapZoomButtonPanel.width, mapZoomButtonPanel.height - mapZoomButtonPanel.padding[2]);
				drawPath.lineTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height / 2);
				drawPath.closePath();
				return drawPath.toString();
			});

		const zoomOutText = zoomOutGroup.append("text")
			.attr("class", classPrefix + "zoomText")
			.attr("text-anchor", "middle")
			.attr("x", mapZoomButtonPanel.width / 2)
			.attr("y", (3 * mapZoomButtonPanel.height / 4) + 7)
			.text("−");

		const zoomLine = mapZoomButtonPanel.main.append("line")
			.attr("x1", 0)
			.attr("x2", mapZoomButtonPanel.width)
			.attr("y1", mapZoomButtonPanel.height / 2)
			.attr("y2", mapZoomButtonPanel.height / 2)
			.style("stroke", "#ccc")
			.style("stroke-width", "1px");

		//end of createZoomButtons
	};

	function createCheckboxes() {

		const showNamesGroup = checkboxesPanel.main.append("g")
			.attr("class", classPrefix + "showNamesGroup")
			.attr("cursor", "pointer");

		const outerRectangle = showNamesGroup.append("rect")
			.attr("width", 14)
			.attr("height", 14)
			.attr("rx", 2)
			.attr("ry", 2)
			.attr("fill", "white")
			.attr("stroke", "darkslategray");

		const innerCheck = showNamesGroup.append("polyline")
			.style("stroke-width", "2px")
			.attr("points", "3,7 6,10 11,3")
			.style("fill", "none")
			.style("stroke", chartState.showNames ? "darkslategray" : "white");

		const showNamesText = showNamesGroup.append("text")
			.attr("class", classPrefix + "showNamesText")
			.attr("x", 16)
			.attr("y", 11)
			.text("Show All");

		showNamesGroup.on("click", function() {

			chartState.showNames = !chartState.showNames;

			if (queryStringValues.has("shownames")) {
				queryStringValues.set("shownames", chartState.showNames);
			} else {
				queryStringValues.append("shownames", chartState.showNames);
			};

			innerCheck.style("stroke", chartState.showNames ? "darkslategray" : "white");

			const allLabels = mapContainer.selectAll("." + classPrefix + "countryNames");

			allLabels.style("display", null);

			if (!chartState.showNames) displayLabels(allLabels);

		});

		//end of createCheckboxes
	};

	function createTopPanel(data) {

		let mainValue = 0,
			rapidResponseValue = 0,
			underfundedValue = 0,
			projectsValue = data.projects.size,
			numberofCountries = 0,
			numberofRegionals = 0,
			thisOffset;

		const numberofFunds = data.map.length;

		for (row of data.map) {
			mainValue += row[`cerf${separator}0${separator}0`];
			rapidResponseValue += row[`cerf${separator}3${separator}0`];
			underfundedValue += row[`cerf${separator}4${separator}0`];
			if (hardcodedRegionals.includes(row.id)) {
				++numberofRegionals;
			} else {
				++numberofCountries;
			};
		};

		const topPanelMoneyBag = topPanel.main.selectAll("." + classPrefix + "topPanelMoneyBag")
			.data([true])
			.enter()
			.append("g")
			.attr("class", classPrefix + "topPanelMoneyBag contributionColorFill")
			.attr("transform", "translate(" + topPanel.moneyBagPadding + ",6) scale(0.5)")
			.each(function(_, i, n) {
				moneyBagdAttribute.forEach(function(d) {
					d3.select(n[i]).append("path")
						.attr("d", d);
				});
			});

		const previousMainValue = d3.select("." + classPrefix + "topPanelMainValue").size() !== 0 ? d3.select("." + classPrefix + "topPanelMainValue").datum() : 0;
		const previousRapidResponseValue = d3.select("." + classPrefix + "topPanelRapidResponseValue").size() !== 0 ? d3.select("." + classPrefix + "topPanelRapidResponseValue").datum() : 0;
		const previousUnderfundedValue = d3.select("." + classPrefix + "topPanelUnderfundedValue").size() !== 0 ? d3.select("." + classPrefix + "topPanelUnderfundedValue").datum() : 0;
		const previousProjectsValue = d3.select("." + classPrefix + "topPanelProjectsValue").size() !== 0 ? d3.select("." + classPrefix + "topPanelProjectsValue").datum() : 0;
		const previousFundsValue = d3.select("." + classPrefix + "topPanelFundsValue").size() !== 0 ? d3.select("." + classPrefix + "topPanelFundsValue").datum() : 0;
		const previousCountriesValue = d3.select("." + classPrefix + "topPanelCountriesValue").size() !== 0 ? d3.select("." + classPrefix + "topPanelCountriesValue").datum() : 0;
		const previousRegionalsValue = d3.select("." + classPrefix + "topPanelRegionalsValue").size() !== 0 ? d3.select("." + classPrefix + "topPanelRegionalsValue").datum() : 0;

		let mainValueGroup = topPanel.main.selectAll("." + classPrefix + "mainValueGroup")
			.data([true]);

		mainValueGroup = mainValueGroup.enter()
			.append("g")
			.attr("class", classPrefix + "mainValueGroup")
			.merge(mainValueGroup);

		let topPanelMainValue = mainValueGroup.selectAll("." + classPrefix + "topPanelMainValue")
			.data([mainValue]);

		topPanelMainValue = topPanelMainValue.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelMainValue contributionColorFill")
			.attr("text-anchor", "end")
			.merge(topPanelMainValue)
			.attr("y", topPanel.height / 2)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] - topPanel.mainValueHorPadding);

		topPanelMainValue.transition()
			.duration(duration)
			.tween("text", function(d) {
				const node = this;
				const i = d3.interpolate(previousMainValue, d);
				return function(t) {
					const siString = formatSIFloat(i(t))
					node.textContent = "$" + (+siString === +siString ? siString : siString.substring(0, siString.length - 1));
				};
			});

		let topPanelMainText = mainValueGroup.selectAll("." + classPrefix + "topPanelMainText")
			.data([mainValue]);

		topPanelMainText = topPanelMainText.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelMainText")
			.style("opacity", 0)
			.attr("text-anchor", "start")
			.merge(topPanelMainText)
			.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.7)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding);

		topPanelMainText.transition()
			.duration(duration)
			.style("opacity", 1)
			.text(function(d) {
				const valueSI = formatSIFloat(d);
				const unit = valueSI[valueSI.length - 1];
				return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "B" ? "Billion" : "") +
					" allocated";
			});

		let topPanelSubText = mainValueGroup.selectAll("." + classPrefix + "topPanelSubText")
			.data([true]);

		topPanelSubText = topPanelSubText.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelSubText")
			.style("opacity", 0)
			.attr("text-anchor", "start")
			.merge(topPanelSubText)
			.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding);

		topPanelSubText.transition()
			.duration(duration)
			.style("opacity", 1)
			.text(function(d) {
				const yearsText = chartState.selectedYear.length === 1 ? chartState.selectedYear[0] : "years\u002A";
				return "in " + yearsText;
			});

		let topPanelRapidResponseValue = mainValueGroup.selectAll("." + classPrefix + "topPanelRapidResponseValue")
			.data([rapidResponseValue]);

		topPanelRapidResponseValue = topPanelRapidResponseValue.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelRapidResponseValue contributionColorFill")
			.attr("text-anchor", "end")
			.merge(topPanelRapidResponseValue)
			.attr("y", topPanel.height * 0.33)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] - topPanel.mainValueHorPadding);

		topPanelRapidResponseValue.transition()
			.duration(duration)
			.tween("text", function(d) {
				const node = this;
				const i = d3.interpolate(previousRapidResponseValue, d);
				return function(t) {
					node.textContent = "$" + formatSIFloat(i(t));
				};
			});

		const topPanelRapidResponseText = mainValueGroup.selectAll("." + classPrefix + "topPanelRapidResponseText")
			.data([true])
			.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelRapidResponseText")
			.attr("text-anchor", "start")
			.attr("y", topPanel.height * 0.33)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
			.text("Rapid Response");

		let topPanelUnderfundedValue = mainValueGroup.selectAll("." + classPrefix + "topPanelUnderfundedValue")
			.data([underfundedValue]);

		topPanelUnderfundedValue = topPanelUnderfundedValue.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelUnderfundedValue contributionColorFill")
			.attr("text-anchor", "end")
			.merge(topPanelUnderfundedValue)
			.attr("y", topPanel.height * 0.67)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] - topPanel.mainValueHorPadding);

		topPanelUnderfundedValue.transition()
			.duration(duration)
			.tween("text", function(d) {
				const node = this;
				const i = d3.interpolate(previousUnderfundedValue, d);
				return function(t) {
					node.textContent = "$" + formatSIFloat(i(t));
				};
			});

		const topPanelUnderfundedText = mainValueGroup.selectAll("." + classPrefix + "topPanelUnderfundedText")
			.data([true])
			.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelUnderfundedText")
			.attr("text-anchor", "start")
			.attr("y", topPanel.height * 0.67)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
			.text("Underfunded");

		let topPanelProjectsValue = mainValueGroup.selectAll("." + classPrefix + "topPanelProjectsValue")
			.data([projectsValue]);

		topPanelProjectsValue = topPanelProjectsValue.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelProjectsValue contributionColorFill")
			.attr("text-anchor", "end")
			.merge(topPanelProjectsValue)
			.attr("y", topPanel.height / 2)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] - topPanel.mainValueHorPadding);

		topPanelProjectsValue.transition()
			.duration(duration)
			.tween("text", function(d) {
				const node = this;
				const i = d3.interpolateRound(previousProjectsValue, d);
				return function(t) {
					node.textContent = i(t);
				};
			});

		let topPanelProjectsText = mainValueGroup.selectAll("." + classPrefix + "topPanelProjectsText")
			.data([projectsValue])
			.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelProjectsText")
			.attr("text-anchor", "start")
			.attr("y", topPanel.height / 2)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
			.text(d => d > 1 ? "Projects" : "Project");

		let topPanelFundsValue = mainValueGroup.selectAll("." + classPrefix + "topPanelFundsValue")
			.data([numberofFunds]);

		topPanelFundsValue = topPanelFundsValue.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelFundsValue contributionColorFill")
			.attr("text-anchor", "end")
			.merge(topPanelFundsValue)
			.attr("y", topPanel.height / 2)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[3] - topPanel.mainValueHorPadding);

		topPanelFundsValue.transition()
			.duration(duration)
			.tween("text", function(d) {
				const node = this;
				const i = d3.interpolateRound(previousFundsValue, d);
				return function(t) {
					node.textContent = i(t);
				};
			});

		let topPanelFundsText = mainValueGroup.selectAll("." + classPrefix + "topPanelFundsText")
			.data([numberofFunds])
			.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelFundsText")
			.attr("text-anchor", "start")
			.attr("y", topPanel.height / 2)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[3] + topPanel.mainValueHorPadding)
			.text(d => d > 1 ? "Funds" : "Fund");

		let topPanelCountriesValue = mainValueGroup.selectAll("." + classPrefix + "topPanelCountriesValue")
			.data([numberofCountries]);

		topPanelCountriesValue = topPanelCountriesValue.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelCountriesValue contributionColorFill")
			.attr("text-anchor", "end")
			.merge(topPanelCountriesValue)
			.attr("y", topPanel.height * 0.33)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[4] - topPanel.mainValueHorPadding);

		topPanelCountriesValue.transition()
			.duration(duration)
			.tween("text", function(d) {
				const node = this;
				const i = d3.interpolateRound(previousCountriesValue, d);
				return function(t) {
					node.textContent = i(t);
				};
			});

		const topPanelCountriesText = mainValueGroup.selectAll("." + classPrefix + "topPanelCountriesText")
			.data([numberofCountries])
			.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelCountriesText")
			.attr("text-anchor", "start")
			.attr("y", topPanel.height * 0.33)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[4] + topPanel.mainValueHorPadding)
			.text(d => d > 1 ? "Countries" : "Country");

		let topPanelRegionalsValue = mainValueGroup.selectAll("." + classPrefix + "topPanelRegionalsValue")
			.data([numberofRegionals]);

		topPanelRegionalsValue = topPanelRegionalsValue.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelRegionalsValue contributionColorFill")
			.attr("text-anchor", "end")
			.merge(topPanelRegionalsValue)
			.attr("y", topPanel.height * 0.67)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[4] - topPanel.mainValueHorPadding);

		topPanelRegionalsValue.transition()
			.duration(duration)
			.tween("text", function(d) {
				const node = this;
				const i = d3.interpolateRound(previousRegionalsValue, d);
				return function(t) {
					node.textContent = i(t);
				};
			});

		const topPanelRegionalsText = mainValueGroup.selectAll("." + classPrefix + "topPanelRegionalsText")
			.data([numberofRegionals])
			.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelRegionalsText")
			.attr("text-anchor", "start")
			.attr("y", topPanel.height * 0.67)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[4] + topPanel.mainValueHorPadding)
			.text(d => d > 1 ? "Regionals" : "Regional");

		let overRectangle = topPanel.main.selectAll("." + classPrefix + "topPanelOverRectangle")
			.data([true]);

		overRectangle = overRectangle.enter()
			.append("rect")
			.attr("class", classPrefix + "topPanelOverRectangle")
			.attr("width", topPanel.width)
			.attr("height", topPanel.height)
			.style("pointer-events", "all")
			.style("opacity", 0)
			.merge(overRectangle);

		overRectangle.on("mouseover", function() {

				const mouseContainer = d3.mouse(containerDiv.node());

				const mouse = d3.mouse(this);

				tooltip.style("display", "block")
					.html(null);

				const tooltipContainer = tooltip.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("width", "280px");

				const tooltipData = [{
					title: "Total:",
					property: mainValue
				}, {
					title: "Rapid Response:",
					property: rapidResponseValue
				}, {
					title: "Underfunded:",
					property: underfundedValue
				}];

				tooltipData.forEach(function(e, i) {
					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 56%")
						.html(e.title);

					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 44%")
						.style("justify-content", "flex-end")
						.html("$" + formatMoney0Decimals(e.property).replace("G", "B"));
				});

				const tooltipSize = tooltip.node().getBoundingClientRect();

				localVariable.set(this, tooltipSize);

				thisOffset = this.getBoundingClientRect().top - containerDiv.node().getBoundingClientRect().top - (tooltipSize.height - this.getBoundingClientRect().height) / 2;

				tooltip.style("top", thisOffset + "px")
					.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
						mouseContainer[0] + 14 + "px" :
						mouseContainer[0] - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");
			})
			.on("mousemove", function() {

				const mouseContainer = d3.mouse(containerDiv.node());

				const mouse = d3.mouse(this);

				const tooltipSize = localVariable.get(this);

				tooltip.style("top", thisOffset + "px")
					.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
						mouseContainer[0] + 14 + "px" :
						mouseContainer[0] - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");
			})
			.on("mouseout", function() {
				if (isSnapshotTooltipVisible) return;
				tooltip.style("display", "none");
			});

		//end of createTopPanel
	};

	function createButtonsPanel(rawData) {

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

		const buttonsCerfGroup = buttonsPanel.main.selectAll(null)
			.data(Object.entries(cerfAllocationTypes).map(e => ({
				value: e[0],
				name: e[1]
			})))
			.enter()
			.append("g")
			.attr("class", classPrefix + "buttonsCerfGroup")
			.attr("transform", "translate(" + (buttonsPanel.cerfButtonsMargin) + ",0)")
			.style("cursor", "pointer");

		const buttonsCerfRects = buttonsCerfGroup.append("rect")
			.attr("rx", "2px")
			.attr("ry", "2px")
			.attr("class", classPrefix + "buttonsCerfRects")
			.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
			.attr("y", buttonsPanel.buttonVerticalPadding)
			.style("fill", function(d) {
				return d.value === chartState.selectedCerfAllocation ? unBlue : "#eaeaea";
			});

		const buttonsCerfText = buttonsCerfGroup.append("text")
			.attr("class", classPrefix + "buttonsCerfText")
			.attr("font-family", "Arial")
			.attr("font-size", 12)
			.attr("y", buttonsPanel.height / 1.6)
			.attr("x", buttonsPanel.buttonsPadding)
			.style("fill", function(d) {
				return d.value === chartState.selectedCerfAllocation ? "white" : "#444";
			})
			.text(function(d) {
				return d.name;
			})
			.each(function() {
				localVariable.set(this.parentNode, this.getComputedTextLength())
			});

		buttonsCerfRects.each(function() {
			d3.select(this)
				.attr("width", localVariable.get(this.parentNode) + 2 * buttonsPanel.buttonsPadding);
		});

		buttonsCerfGroup.each(function(_, i) {
			d3.select(this).attr("transform", "translate(" + (i ? localVariable.get(this.previousSibling) : buttonsPanel.cerfButtonsMargin) + ",0)")
			localVariable.set(this, this.getBBox().width + buttonsPanel.buttonsMargin + (i ? localVariable.get(this.previousSibling) : buttonsPanel.cerfButtonsMargin));
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
				if (d3.event.altKey) clickButtonsRects(d, true);
				if (localVariable.get(this) !== "clicked") {
					localVariable.set(this, "clicked");
					setTimeout(function() {
						if (localVariable.get(self) === "clicked") {
							clickButtonsRects(d, false);
						};
						localVariable.set(self, null);
					}, 250);
				} else {
					clickButtonsRects(d, true);
					localVariable.set(this, null);
				};
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
				.attr("id", "pbinadInnerTooltipDiv");

			innerTooltip.html("Click for selecting a year. Double-click or ALT + click for selecting a single month.");

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

			const data = processData(rawData);

			verifyCentroids(data.map);

			createTopPanel(data);

			createChoropleth(data);

			createLegend(data);

			setYearsDescriptionDiv();

			//end of clickButtonsRects
		};

		buttonsCerfRects.on("mouseover", mouseOverButtonsCerfRects)
			.on("mouseout", mouseOutButtonsCerfRects);

		function mouseOverButtonsCerfRects(d) {
			d3.select(this).style("fill", unBlue);
			buttonsCerfText.filter(function(e) {
					return e.value === d.value
				})
				.style("fill", "white");
		};

		function mouseOutButtonsCerfRects(d) {
			if (d.value === chartState.selectedCerfAllocation) return;
			d3.select(this).style("fill", "#eaeaea");
			buttonsCerfText.filter(function(e) {
					return e.value === d.value
				})
				.style("fill", "#444");
		};


		buttonsCerfRects.on("click", function(d) {

			chartState.selectedCerfAllocation = d.value;

			if (queryStringValues.has("cerfallocation")) {
				queryStringValues.set("cerfallocation", d);
			} else {
				queryStringValues.append("cerfallocation", d);
			};

			buttonsPanel.main.selectAll("." + classPrefix + "buttonsCerfRects")
				.style("fill", function(e) {
					return e.value === chartState.selectedCerfAllocation ? unBlue : "#eaeaea";
				});

			buttonsPanel.main.selectAll("." + classPrefix + "buttonsCerfText")
				.style("fill", function(e) {
					return e.value === chartState.selectedCerfAllocation ? "white" : "#444";
				});

			const data = processData(rawData);

			createTopPanel(data);

			createChoropleth(data);

			createLegend(data);

		});

		//end of createButtonsPanel
	};

	function createChoropleth(unfilteredData) {

		const data = unfilteredData.map.filter(function(d) {
			return d[`cerf${separator}${chartState.selectedCerfAllocation}${separator}0`];
		});

		zoom.on("zoom", zoomed);

		if (data.length) {
			zoomToBoundingBox(data);
		} else {
			zoom.transform(mapPanel.main.transition().duration(duration), d3.zoomIdentity)
		};

		const allValues = data.map(function(d) {
			return d[`cerf${separator}${chartState.selectedCerfAllocation}${separator}0`];
		}).sort(function(a, b) {
			return a - b
		});

		const thisInterpolator = chartState.selectedCerfAllocation === "0" ? colorInterpolatorTotal :
			chartState.selectedCerfAllocation === "3" ? colorInterpolatorRR : colorInterpolatorUnderfunded;

		const newColors = d3.range(0.1, 1.1, 0.1).map(function(d) {
			return thisInterpolator(d);
		});

		colorScale.domain(allValues)
			.range(newColors);

		const countries = mapContainer.selectAll("." + classPrefix + "MapPath")
			.data(data, function(d) {
				return d.properties ? d.properties.ISO_2 : d.isoCode;
			});

		const countriesExit = countries.exit()
			.attr("pointer-events", "none")
			.transition()
			.duration(duration)
			.style("fill", countriesBackground);

		countries.attr("pointer-events", "all")
			.transition()
			.duration(duration)
			.style("fill", function(d) {
				return colorScale(d[`cerf${separator}${chartState.selectedCerfAllocation}${separator}0`]);
			});

		let countryNames = mapContainer.selectAll("." + classPrefix + "countryNames")
			.data(data.filter(function(e) {
				return centroids[e.isoCode] && !hardcodedRegionals.includes(e.id);
			}), function(d) {
				return d.isoCode
			});

		const countryNamesExit = countryNames.exit().remove();

		const countryNamesEnter = countryNames.enter()
			.append("text")
			.attr("class", classPrefix + "countryNames")
			.attr("x", function(d) {
				return centroids[d.isoCode].x;
			})
			.attr("y", function(d) {
				return centroids[d.isoCode].y;
			})
			.text(function(d) {
				return d.countryAbbreviation;
			})
			.call(wrapText2, countryNameMaxLength);

		countryNames = countryNamesEnter.merge(countryNames);

		if (!chartState.showNames) {
			countryNames.each((_, i, n) => d3.select(n[i]).style("display", null)).call(displayLabels);
		};

		const globalCountry = mapContainer.selectAll("." + classPrefix + "MapPath")
			.filter(d => d.properties ? d.properties.ISO_2 === globalIsoCode : d.isoCode === globalIsoCode);

		const globalDatum = data.find(e => e.isoCode === globalIsoCode);

		if (globalDatum && globalDatum[`cerf${separator}${chartState.selectedCerfAllocation}${separator}0`]) {
			globalCountry.style("opacity", 1);
			mapContainer.select("." + classPrefix + "CerfText").style("opacity", 1);
		} else {
			globalCountry.style("opacity", 0);
			mapContainer.select("." + classPrefix + "CerfText").style("opacity", 0);
		};

		countries.on("mouseover", mouseover)
			.on("mouseout", function() {
				tooltip.html(null)
					.style("display", "none");
			});

		function mouseover(d) {

			tooltip.style("display", "block")
				.html(null);

			const innerTooltipDiv = tooltip.append("div")
				.style("max-width", innerTooltipDivWidth + "px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltipDiv.append("div")
				.style("margin-bottom", "12px")
				.append("strong")
				.style("font-size", "16px")
				.html(d.country);

			const tooltipContainer = innerTooltipDiv.append("div")
				.style("display", "flex")
				.style("margin-bottom", "8px")
				.style("width", "100%");

			tooltipContainer.append("div")
				.style("display", "flex")
				.style("flex", "0 60%")
				.html(cerfAllocationTypes[chartState.selectedCerfAllocation]);

			tooltipContainer.append("div")
				.style("display", "flex")
				.style("flex", "0 40%")
				.style("justify-content", "flex-end")
				.html("$" + formatMoney0Decimals(d[`cerf${separator}${chartState.selectedCerfAllocation}${separator}0`]).replace("G", "B"));

			innerTooltipDiv.append("div")
				.style("margin-bottom", "2px")
				.style("font-size", "12px")
				.style("color", "#444")
				.html("Allocations by sector");

			const svgData = Object.keys(clustersList).map(e => ({
					cluster: clustersList[e],
					clusterId: e,
					value: d[`cerf${separator}${chartState.selectedCerfAllocation}${separator}${e}`]
				})).filter(e => e.value)
				.sort((a, b) => b.value - a.value);

			const tooltipSvgPadding = [16, 28, 4, 86],
				tooltipSvgHeight = tooltipSvgPadding[0] + tooltipSvgPadding[2] + maxColumnRectHeight * 1.4 * svgData.length;

			const tooltipSvg = innerTooltipDiv.append("svg")
				.attr("width", innerTooltipDivWidth)
				.attr("height", tooltipSvgHeight);

			const yScale = d3.scaleBand()
				.domain(svgData.map(e => e.cluster))
				.range([tooltipSvgPadding[0], tooltipSvgHeight - tooltipSvgPadding[2]])
				.paddingInner(0.5)
				.paddingOuter(0.5);

			const xScale = d3.scaleLinear()
				.range([tooltipSvgPadding[3], innerTooltipDivWidth - tooltipSvgPadding[1]])
				.domain([0, d3.max(svgData, e => e.value)]);

			const xAxis = d3.axisTop(xScale)
				.tickSizeOuter(0)
				.tickSizeInner(-(tooltipSvgHeight - tooltipSvgPadding[0] - tooltipSvgPadding[2]))
				.ticks(3)
				.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

			const yAxis = d3.axisLeft(yScale)
				.tickPadding(clusterIconSize + 2 * clusterIconPadding)
				.tickSize(3);

			tooltipSvg.append("g")
				.attr("class", classPrefix + "xAxisGroupColumnBySector")
				.attr("transform", "translate(0," + tooltipSvgPadding[0] + ")")
				.call(xAxis)
				.selectAll(".tick")
				.filter(d => d === 0)
				.remove();

			tooltipSvg.append("g")
				.attr("class", classPrefix + "yAxisGroupColumnBySector")
				.attr("transform", "translate(" + tooltipSvgPadding[3] + ",0)")
				.call(customAxis);

			function customAxis(group) {
				const sel = group.selection ? group.selection() : group;
				group.call(yAxis);
				sel.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.text(d => clusterNamesScale(d).split(" ")[0])
					.attr("x", -(yAxis.tickPadding() + yAxis.tickSize()))
					.attr("dy", d => clusterNamesScale(d).indexOf(" ") > -1 ? "-0.3em" : "0.32em")
					.append("tspan")
					.attr("dy", "1.1em")
					.attr("x", -(yAxis.tickPadding() + yAxis.tickSize()))
					.text(d => clusterNamesScale(d).split(" ")[1]);
				if (sel !== group) group.selectAll(".tick text")
					.filter(d => d.indexOf(" ") > -1)
					.attrTween("x", null)
					.tween("text", null);
			};

			tooltipSvg.selectAll(null)
				.data(svgData)
				.enter()
				.append("rect")
				.attr("stroke", "#aaa")
				.attr("stroke-width", 0.5)
				.attr("height", yScale.bandwidth())
				.attr("width", 0)
				.style("fill", chartState.selectedCerfAllocation === "0" ? choroplethColorTotal : chartState.selectedCerfAllocation === "3" ? choroplethColorRR : choroplethColorUnderfunded)
				.attr("x", xScale(0))
				.attr("y", d => yScale(d.cluster))
				.transition()
				.duration(duration)
				.attr("width", d => xScale(d.value) - tooltipSvgPadding[3]);

			tooltipSvg.selectAll(null)
				.data(svgData)
				.enter()
				.append("text")
				.attr("class", classPrefix + "labelsColumnBySector")
				.attr("x", tooltipSvgPadding[3] + labelsColumnPadding)
				.attr("y", d => yScale(d.cluster) + yScale.bandwidth() / 2)
				.transition()
				.duration(duration)
				.attr("x", d => xScale(d.value) + labelsColumnPadding)
				.textTween((d, i, n) => {
					const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d.value);
					return t => d.value ? formatSIFloat(interpolator(t)).replace("G", "B") : 0;
				});

			tooltipSvg.selectAll(null)
				.data(svgData)
				.enter()
				.append("image")
				.attr("x", tooltipSvgPadding[3] - clusterIconPadding - clusterIconSize - yAxis.tickSize())
				.attr("y", d => yScale(d.cluster) - (clusterIconSize - yScale.bandwidth()) / 2)
				.attr("width", clusterIconSize)
				.attr("height", clusterIconSize)
				.attr("href", d => clustersIconsData[d.clusterId]);

			const thisBox = this.getBoundingClientRect();

			const containerBox = containerDiv.node().getBoundingClientRect();

			const tooltipBox = tooltip.node().getBoundingClientRect();

			const thisOffsetTop = (thisBox.bottom + thisBox.top) / 2 - containerBox.top - (tooltipBox.height / 2);

			const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + (2 * tooltipMargin) ?
				thisBox.right - containerBox.left + tooltipMargin :
				thisBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

			tooltip.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");
		};

		function zoomed() {

			mapContainer.attr("transform", d3.event.transform);

			mapContainer.selectAll("circle." + classPrefix + "MapPath, ." + classPrefix + "Border")
				.style("stroke-width", 1 / d3.event.transform.k + "px");

			mapContainer.select("." + classPrefix + "CerfText")
				.style("font-size", 10 / d3.event.transform.k + "px")
				.attr("y", function() {
					const globalCerf = hardcodedAllocations.find(function(e) {
						return e.isoCode === globalIsoCode;
					});
					return mapProjection([globalCerf.long, globalCerf.lat])[1] + cerfCircleRadius + 8 / d3.event.transform.k;
				});

			const allLabels = mapContainer.selectAll("." + classPrefix + "countryNames");

			allLabels.style("font-size", 10 / d3.event.transform.k + "px")

			if (!chartState.showNames) {
				allLabels.each((_, i, n) => d3.select(n[i]).style("display", null)).call(displayLabels);
			};

			//end of zoomed
		};

		mapZoomButtonPanel.main.select("." + classPrefix + "zoomInGroup")
			.on("click", function() {
				zoom.scaleBy(mapPanel.main.transition().duration(duration), 2);
			});

		mapZoomButtonPanel.main.select("." + classPrefix + "zoomOutGroup")
			.on("click", function() {
				zoom.scaleBy(mapPanel.main.transition().duration(duration), 0.5);
			});

		function zoomToBoundingBox(data) {

			//Change this: use the bounding box of the geometry instead of a centroid

			const boundingBox = data.reduce((acc, curr) => {
				if (centroids[curr.isoCode]) {
					acc.n = Math.min(acc.n, centroids[curr.isoCode].y - zoomBoundingMarginVert);
					acc.s = Math.max(acc.s, centroids[curr.isoCode].y + zoomBoundingMarginVert);
					acc.e = Math.max(acc.e, centroids[curr.isoCode].x + zoomBoundingMarginHor);
					acc.w = Math.min(acc.w, centroids[curr.isoCode].x - zoomBoundingMarginHor);
				};
				return acc;
			}, {
				n: Infinity,
				s: -Infinity,
				e: -Infinity,
				w: Infinity
			});

			const midPointX = (boundingBox.w + boundingBox.e) / 2;
			const midPointY = (boundingBox.n + boundingBox.s) / 2;
			const scale = Math.min(mapPanel.width / (boundingBox.e - boundingBox.w), mapPanel.height / (boundingBox.s - boundingBox.n));
			const translate = [mapPanel.width / 2 - scale * midPointX, mapPanel.height / 2 - scale * midPointY];

			zoom.transform(mapPanel.main.transition().duration(duration),
				d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

		};

		//end of createChoropleth
	};

	function createLegend(data) {

		const legendTitle = legendPanel.main.selectAll("." + classPrefix + "legendTitle")
			.data([true])
			.enter()
			.append("text")
			.attr("class", classPrefix + "legendTitle")
			.attr("x", legendPanel.padding[3])
			.attr("y", legendPanel.padding[0] - 10)
			.text("Legend");

		let legendRects = legendPanel.main.selectAll("." + classPrefix + "LegendRects")
			.data([colorScale.domain()[0]].concat(colorScale.quantiles()));

		legendRects = legendRects.enter()
			.append("rect")
			.attr("class", classPrefix + "LegendRects")
			.attr("y", legendPanel.padding[0])
			.attr("x", function(_, i) {
				return legendPanel.padding[3] + i * 11
			})
			.style("stroke", "#444")
			.attr("width", 9)
			.attr("height", 11)
			.merge(legendRects)
			.style("fill", function(d) {
				return colorScale(d);
			});

		const legendColorLines = legendPanel.main.selectAll("." + classPrefix + "LegendColorLines")
			.data(d3.range(2))
			.enter()
			.append("line")
			.attr("class", classPrefix + "LegendColorLines")
			.attr("y1", legendPanel.padding[0] + 10)
			.attr("y2", legendPanel.padding[0] + 20)
			.attr("x1", function(d) {
				return d ? legendPanel.padding[3] + 108 : legendPanel.padding[3];
			})
			.attr("x2", function(d) {
				return d ? legendPanel.padding[3] + 108 : legendPanel.padding[3];
			})
			.style("stroke-width", "1px")
			.style("shape-rendering", "crispEdges")
			.style("stroke", "#444");

		let legendColorTexts = legendPanel.main.selectAll("." + classPrefix + "LegendColorTexts")
			.data(d3.extent(colorScale.domain()));

		legendColorTexts = legendColorTexts.enter()
			.append("text")
			.attr("class", classPrefix + "LegendColorTexts")
			.attr("y", 42)
			.attr("x", function(_, i) {
				return i ? legendPanel.padding[3] + 108 : legendPanel.padding[3];
			})
			.attr("text-anchor", function(_, i) {
				return i ? "end" : "start";
			})
			.merge(legendColorTexts);

		legendColorTexts.transition()
			.duration(duration)
			.textTween(function(d) {
				const i = d3.interpolate(reverseFormat(this.textContent) || 0, d);
				return function(t) {
					return d3.formatPrefix(".0", i(t))(i(t)).replace("G", "B");
				};
			});

		//end of createLegend
	};

	function preProcessData(rawData) {

		rawData.forEach(function(row) {
			if (yearsArray.indexOf(+row.AllocationYear) === -1) yearsArray.push(+row.AllocationYear);
		});

		yearsArray.sort(function(a, b) {
			return a - b;
		});

		//end of preProcessData
	};

	function createFundNamesList(fundsData) {
		fundsData.forEach(row => {
			fundNamesList[row.id + ""] = row.PooledFundName;
			fundAbbreviatedNamesList[row.id + ""] = row.PooledFundNameAbbrv;
			fundNamesListKeys.push(row.id + "");
			fundIsoCodesList[row.id + ""] = row.ISO2Code;
			fundIsoCodes3List[row.id + ""] = row.CountryCode;
			fundLatLongList[row.ISO2Code] = [row.latitude, row.longitude];
		});
	};

	function createUnAgenciesNamesList(unAgenciesTypesData) {
		unAgenciesTypesData.forEach(row => {
			uNAgenciesNamesList[row.agencyID + ""] = row.agencyName.toLowerCase();
			uNAgenciesShortNamesList[row.agencyID + ""] = row.agencyShortName.toLowerCase();
		});
	};

	function createPartnersList(partnersData) {
		partnersData.forEach(row => {
			partnersList[row.id + ""] = row.OrganizationTypeName;
		});
	};

	function createClustersList(clustersData) {
		clustersData.forEach(row => {
			clustersList[row.id + ""] = row.ClustNm;
		});
	};

	function createAllocationTypesList(allocationTypesData) {
		allocationTypesData.forEach(row => {
			allocationTypesList[row.id + ""] = row.AllocationName;
			if (cerfTypeKeys.includes(row.id + "")) cerfAllocationTypes[row.id + ""] = row.AllocationName;
		});
	};

	function verifyCentroids(data) {
		data.forEach(row => {
			if (!centroids[row.isoCode] || isNaN(centroids[row.isoCode].x) || isNaN(centroids[row.isoCode].y)) {
				if (!isNaN(fundLatLongList[row.isoCode][0]) || !isNaN(fundLatLongList[row.isoCode][1])) {
					centroids[row.isoCode] = {
						x: mapProjection([fundLatLongList[row.isoCode][1], fundLatLongList[row.isoCode][0]])[0],
						y: mapProjection([fundLatLongList[row.isoCode][1], fundLatLongList[row.isoCode][0]])[1]
					};
				} else {
					centroids[row.isoCode] = {
						x: mapProjection([0, 0])[0],
						y: mapProjection([0, 0])[1]
					};
					console.warn("Attention: " + row.isoCode + "(" + row.countryName + ") has no centroid");
				};
			};
		});
	};

	function processData(rawData) {

		const data = {
			map: [],
			bar: [],
			projects: new Set()
		};

		rawData.forEach(function(row) {
			if (chartState.selectedYear.indexOf(+row.AllocationYear) > -1) {

				row.ProjList.toString().split("##").forEach(e => data.projects.add(e));

				const foundCountry = data.map.find(function(d) {
					return d.id === row.PooledFundId;
				});

				if (foundCountry) {
					populateCountryObject(foundCountry, row);
				} else {
					const countryObject = {
						id: row.PooledFundId,
						country: fundNamesList[row.PooledFundId],
						countryAbbreviation: fundAbbreviatedNamesList[row.PooledFundId],
						isoCode: fundIsoCodesList[row.PooledFundId],
						allocations: []
					};
					Object.keys(cerfAllocationTypes).forEach(outerRow => {
						Object.keys(clustersList).forEach(innerRow => {
							countryObject[`cerf${separator}${outerRow}${separator}${innerRow}`] = 0;
						});
						countryObject[`cerf${separator}${outerRow}${separator}0`] = 0;
					});
					populateCountryObject(countryObject, row);
					data.map.push(countryObject);
				};
			};
		});

		return data;

		function populateCountryObject(obj, row) {
			obj[`cerf${separator}0${separator}0`] += row.Budget;
			obj[`cerf${separator}0${separator}${row.ClusterId}`] += row.Budget;
			obj[`cerf${separator}${row.AllocationSurceId}${separator}0`] += row.Budget;
			obj[`cerf${separator}${row.AllocationSurceId}${separator}${row.ClusterId}`] += row.Budget;
			obj.allocations.push(row);
		};

		//end of processData
	};

	function createCsv(datahere) {

		const csv = d3.csvFormat(changedDataHere);

		return csv;
	};

	function setYearsDescriptionDiv() {
		yearsDescriptionDiv.html(function() {
			if (chartState.selectedYear.length === 1) return null;
			const yearsList = chartState.selectedYear.sort(function(a, b) {
				return a - b;
			}).reduce(function(acc, curr, index) {
				return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
			}, "");
			return "\u002ASelected years: " + yearsList;
		});
	};

	function validateYear(yearString) {
		const allYears = yearString.split(",").map(function(d) {
			return +(d.trim());
		}).sort(function(a, b) {
			return a - b;
		});
		allYears.forEach(function(d) {
			if (d && yearsArray.indexOf(d) > -1) chartState.selectedYear.push(d);
		});
		if (!chartState.selectedYear.length) chartState.selectedYear.push(new Date().getFullYear());
	};

	function capitalize(str) {
		return str[0].toUpperCase() + str.substring(1)
	};

	function parseTransform(translate) {
		const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
		group.setAttributeNS(null, "transform", translate);
		const matrix = group.transform.baseVal.consolidate().matrix;
		return [matrix.e, matrix.f];
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

	function wrapText2(text, width) {
		text.each(function() {
			let text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1,
				y = text.attr("y"),
				x = text.attr("x"),
				dy = 0,
				tspan = text.text(null)
				.append("tspan")
				.attr("x", x)
				.attr("y", y)
				.attr("dy", dy + "em");
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node()
					.getComputedTextLength() > width) {
					line.pop();
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

	function createAnnotationsDiv() {

		const padding = 6;

		const overDiv = containerDiv.append("div")
			.attr("class", classPrefix + "OverDivHelp");

		const helpSVG = overDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height);

		const arrowMarker = helpSVG.append("defs")
			.append("marker")
			.attr("id", classPrefix + "ArrowMarker")
			.attr("viewBox", "0 -5 10 10")
			.attr("refX", 0)
			.attr("refY", 0)
			.attr("markerWidth", 12)
			.attr("markerHeight", 12)
			.attr("orient", "auto")
			.append("path")
			.style("fill", "#E56A54")
			.attr("d", "M0,-5L10,0L0,5");

		const mainTextWhite = helpSVG.append("text")
			.attr("font-family", "Roboto")
			.attr("font-size", "26px")
			.style("stroke-width", "5px")
			.attr("font-weight", 700)
			.style("stroke", "white")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", 320)
			.text("CLICK ANYWHERE TO START");

		const mainText = helpSVG.append("text")
			.attr("class", classPrefix + "AnnotationMainText contributionColorFill")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", 320)
			.text("CLICK ANYWHERE TO START");

		helpSVG.on("click", function() {
			overDiv.remove();
		});

		//end of createAnnotationsDiv
	};

	function createFooterDiv() {

		let footerText = "© OCHA CERF Section " + currentYear;

		const footerLink = " | For more information, please visit <a href='https://pfbi.unocha.org'>pfbi.unocha.org</a>";

		if (showLink) footerText += footerLink;

		footerDiv.append("div")
			.attr("class", "d3chartFooterText")
			.html(footerText);

		//end of createFooterDiv
	};

	function createSnapshot(type, fromContextMenu) {

		const downloadingDiv = d3.select("body").append("div")
			.style("position", "fixed")
			.attr("id", classPrefix + "DownloadingDiv")
			.style("left", window.innerWidth / 2 - 100 + "px")
			.style("top", window.innerHeight / 2 - 100 + "px");

		const downloadingDivSvg = downloadingDiv.append("svg")
			.attr("class", classPrefix + "DownloadingDivSvg")
			.attr("width", 200)
			.attr("height", 100);

		const downloadingDivText = "Downloading " + type.toUpperCase();

		const svgRealSize = svg.node().getBoundingClientRect();

		svg.attr("width", svgRealSize.width)
			.attr("height", svgRealSize.height);

		const listOfStyles = [
			"font-size",
			"font-family",
			"font-weight",
			"fill",
			"stroke",
			"stroke-dasharray",
			"stroke-width",
			"opacity",
			"text-anchor",
			"text-transform",
			"shape-rendering",
			"letter-spacing",
			"white-space"
		];

		const imageDiv = containerDiv.node();

		setSvgStyles(svg.node());

		if (type === "png") {
			iconsDiv.style("opacity", 0);
		} else {
			topDiv.style("opacity", 0)
		};

		snapshotTooltip.style("display", "none");

		html2canvas(imageDiv).then(function(canvas) {

			svg.attr("width", null)
				.attr("height", null);

			if (type === "png") {
				iconsDiv.style("opacity", 1);
			} else {
				topDiv.style("opacity", 1)
			};

			if (type === "png") {
				downloadSnapshotPng(canvas);
			} else {
				downloadSnapshotPdf(canvas);
			};

			if (fromContextMenu && currentHoveredElem) d3.select(currentHoveredElem).dispatch("mouseout");

		});

		function setSvgStyles(node) {

			if (!node.style) return;

			let styles = getComputedStyle(node);

			for (let i = 0; i < listOfStyles.length; i++) {
				node.style[listOfStyles[i]] = styles[listOfStyles[i]];
			};

			for (let i = 0; i < node.childNodes.length; i++) {
				setSvgStyles(node.childNodes[i]);
			};
		};

		//end of createSnapshot
	};

	function downloadSnapshotPng(source) {

		const currentDate = new Date();

		const fileName = classPrefix + "_" + csvDateFormat(currentDate) + ".png";

		source.toBlob(function(blob) {
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			if (link.download !== undefined) {
				link.setAttribute("href", url);
				link.setAttribute("download", fileName);
				link.style = "visibility:hidden";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} else {
				window.location.href = url;
			};
		});

		d3.select("#" + classPrefix + "DownloadingDiv").remove();

	};

	function downloadSnapshotPdf(source) {

		const pdfMargins = {
			top: 10,
			bottom: 16,
			left: 20,
			right: 30
		};

		d3.image("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/bilogo.png")
			.then(function(logo) {

				let pdf;

				const point = 2.834646;

				const sourceDimentions = containerDiv.node().getBoundingClientRect();
				const widthInMilimeters = 210 - pdfMargins.left * 2;
				const heightInMilimeters = widthInMilimeters * (sourceDimentions.height / sourceDimentions.width);
				const maxHeightInMilimeters = 180;
				let pdfHeight;

				if (heightInMilimeters > maxHeightInMilimeters) {
					pdfHeight = 297 + heightInMilimeters - maxHeightInMilimeters;
					pdf = new jsPDF({
						format: [210 * point, (pdfHeight) * point],
						unit: "mm"
					})
				} else {
					pdfHeight = 297;
					pdf = new jsPDF();
				}

				let pdfTextPosition;

				createLetterhead();

				const intro = pdf.splitTextToSize("TEXT HERE.", (210 - pdfMargins.left - pdfMargins.right), {
					fontSize: 12
				});

				const fullDate = d3.timeFormat("%A, %d %B %Y")(new Date());

				pdf.setTextColor(60);
				pdf.setFont('helvetica');
				pdf.setFontType("normal");
				pdf.setFontSize(12);
				pdf.text(pdfMargins.left, 48, intro);

				pdf.setTextColor(65, 143, 222);
				pdf.setFont('helvetica');
				pdf.setFontType("bold");
				pdf.setFontSize(16);
				pdf.text(chartTitle, pdfMargins.left, 65);

				pdf.setFontSize(12);

				pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
					fullDate + "</span></div>", pdfMargins.left, 70, {
						width: 210 - pdfMargins.left - pdfMargins.right
					},
					function(position) {
						pdfTextPosition = position;
					});

				pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, heightInMilimeters);

				const currentDate = new Date();

				pdf.save(classPrefix + "_" + csvDateFormat(currentDate) + ".pdf");

				d3.select("#" + classPrefix + "DownloadingDiv").remove();

				function createLetterhead() {

					const footer = "© OCHA CBPF Section 2019 | For more information, please visit pfbi.unocha.org";

					pdf.setFillColor(65, 143, 222);
					pdf.rect(0, pdfMargins.top, 210, 15, "F");

					pdf.setFillColor(236, 161, 84);
					pdf.rect(0, pdfMargins.top + 15, 210, 2, "F");

					pdf.setFillColor(255, 255, 255);
					pdf.rect(pdfMargins.left, pdfMargins.top - 1, 94, 20, "F");

					pdf.ellipse(pdfMargins.left, pdfMargins.top + 9, 5, 9, "F");
					pdf.ellipse(pdfMargins.left + 94, pdfMargins.top + 9, 5, 9, "F");

					pdf.addImage(logo, "PNG", pdfMargins.left + 2, pdfMargins.top, 90, 18);

					pdf.setFillColor(236, 161, 84);
					pdf.rect(0, pdfHeight - pdfMargins.bottom, 210, 2, "F");

					pdf.setTextColor(60);
					pdf.setFont("arial");
					pdf.setFontType("normal");
					pdf.setFontSize(10);
					pdf.text(footer, pdfMargins.left, pdfHeight - pdfMargins.bottom + 10);

				};

			});

		//end of downloadSnapshotPdf
	};

	function displayLabels(labelSelection) {
		labelSelection.each(function(d) {
			const outerElement = this;
			const outerBox = this.getBoundingClientRect();
			labelSelection.each(function(e) {
				if (outerElement !== this) {
					const innerBox = this.getBoundingClientRect();
					if (!(outerBox.right < innerBox.left ||
							outerBox.left > innerBox.right ||
							outerBox.bottom < innerBox.top ||
							outerBox.top > innerBox.bottom)) {
						if (e[`cerf${separator}${chartState.selectedCerfAllocation}${separator}0`] < d[`cerf${separator}${chartState.selectedCerfAllocation}${separator}0`]) {
							d3.select(this).style("display", "none");
						} else {
							d3.select(outerElement).style("display", "none");
						};
					};
				};
			});
		});
	};

	function formatSIFloat(value) {
		const length = (~~Math.log10(value) + 1) % 3;
		const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
		let siString = d3.formatPrefix("." + digits, value)(value);
		if (siString[siString.length - 1] === "G") {
			siString = siString.slice(0, -1) + "B";
		};
		return siString;
	};

	//end of d3ChartIIFE
}());