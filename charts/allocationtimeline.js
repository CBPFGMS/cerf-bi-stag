(function d3ChartIIFE() {

	//Important: D3 version is 5.x
	//All listeners using the arguments in the sequence: datum, index, node group

	const width = 1100,
		padding = [4, 4, 4, 4],
		chartWidth = width - padding[1] - padding[3],
		stackedHeight = 230,
		stackedHeightAggregate = 460,
		stackedPadding = [22, 50, 36, 244],
		stackedPaddingByGroup = [28, 50, 38, 244],
		arrowPaddingLeft = 28,
		arrowPaddingRight = 28,
		maxYearsListNumber = 1,
		legendTextPadding = 40,
		legendHorPadding = 4,
		iconSize = 28,
		maxTickNumber = 12,
		arrowCircleRadius = 22,
		arrowCircleRadiusByGroup = 16,
		arrowFadeColor = "#f1f1f1",
		tickMove = 3,
		tickStep = (chartWidth - stackedPadding[1] - stackedPadding[3]) / maxTickNumber,
		unBlue = "#1F69B3",
		classPrefix = "alloctimeline",
		sublegendGroupSize = 16,
		bulletSize = 4,
		noDataTextPadding = 180,
		sublegendGroupPadding = -iconSize,
		sublegendGroupVertPadding = 28,
		fundsNumberPadding = 34,
		groupsNumberPadding = 16,
		fundsNumberPaddingByGroup = 28,
		groupsNumberPaddingByGroup = 12,
		numberTitlesPadding = 22,
		innerTooltipWidth = 210,
		tooltipFundsNumber = 20,
		tooltipFundsNumberByGroup = 10,
		tooltipVerticalPadding = 22,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isBookmarkPage = window.location.hostname + window.location.pathname === "cbpfgms.github.io/cerf-bi-stag/bookmark.html",
		bookmarkSite = "https://cbpfgms.github.io/cerf-bi-stag/bookmark.html?",
		fadeOpacity = 0.2,
		tooltipMargin = 8,
		stackGap = 3,
		precision = 30,
		closeFactor = 0.2,
		windowHeight = window.innerHeight,
		currentDate = new Date(),
		currentYear = currentDate.getFullYear(),
		localVariable = d3.local(),
		localStorageTime = 3600000,
		duration = 1000,
		delay = 250,
		shortDuration = 250,
		disabledOpacity = 0.4,
		tickNumberAggregate = 4,
		tickNumberByGroup = 3,
		totalLabelRemainder = 1,
		totalLabelPadding = 4,
		legendGroupPaddingByGroup = 28,
		colorArray = [{
			main: "#8da0cb",
			sub: ["#8DA0CB", "#9D8BD9", "#8BCCD9", "#9194E3", "#91C0E3"]
		}, {
			main: "#fc8d62",
			sub: ["#FC8D62", "#FEB756", "#FE565D", "#FF9F57", "#FF6E57"]
		}, {
			main: "#e5c494",
			sub: ["#E5C494", "#F2DF91", "#F2B091", "#FCDE97", "#FCC697"]
		}, {
			main: "#66c2a5",
			sub: ["#66C2A5", "#63B6CF", "#63CF6F", "#68D9D5", "#68D995"]
		}, {
			main: "#b3b3b3",
			sub: ["#B3B3B3", "#BFB8B6", "#BFB6BF", "#C9C1BF", "#C9BFC4"]
		}],
		colorSubScale = {},
		formatMoney0Decimals = d3.format(",.0f"),
		monthFormat = d3.timeFormat("%b"),
		monthFullNameFormat = d3.timeFormat("%B"),
		monthShortNameParse = d3.timeParse("%b"),
		monthParse = d3.timeParse("%m"),
		monthsArray = d3.range(1, 13, 1).map(d => monthFormat(monthParse(d))),
		approvedDateParse = d3.timeParse("%d/%m/%Y"),
		allYearsOption = "all",
		allRegionsOption = "Select all regions",
		allFundsOption = "Select all countries",
		allEmergencyGroupsOption = "Select all emergency groups",
		chartTitleDefault = "Allocations Timeline",
		vizNameQueryString = "alloctimeline",
		allocationsDataUrl = "https://cbpfgms.github.io/pfbi-data/cerf/cerf_applications.csv",
		masterEmergencyTypeUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstEmergencyType.json",
		masterEmergencyGroupUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstEmergencyGroup.json",
		masterFundsUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstFundv2.json",
		masterRegionsUrl = "https://cbpfgms.github.io/pfbi-data/mst/MstRegion.json",
		csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
		viewOptions = ["aggregated", "group"],
		viewButtonsText = {
			[viewOptions[0]]: "Aggregated View",
			[viewOptions[1]]: "View by Emergency Group"
		},
		yearsArray = [],
		clickedGroup = {},
		lists = {
			fundNames: {},
			fundRegions: {},
			fundAbbreviatedNames: {},
			fundIsoCodes: {},
			fundIsoCodes3: {},
			regionNames: {},
			emergencyTypeNames: {},
			emergencyGroupNames: {},
			emergencyTypesInGroups: {},
			fundsInAllDataList: {},
			regionsInAllDataList: {},
			emergencyGroupsInAllDataList: {}
		},
		inDataLists = {
			regionsInData: [],
			fundsInData: [],
			emergencyGroupsInData: [],
			emergencyTypesInData: []
		},
		inSelectionLists = {
			regionsInData: [],
			fundsInData: [],
			emergencyGroupsInData: []
		},
		separator = "##",
		chartState = {
			selectedYear: [],
			selectedFund: [],
			selectedRegion: [],
			selectedEmergencyGroup: [],
			selectedView: null,
			baseline: null
		};

	let isSnapshotTooltipVisible = false,
		height,
		timer,
		previousDataLength,
		previousXValue,
		currentHoveredElement;

	//emergency groups:
	// 1: "Conflict-related"
	// 2: "Disease Outbreak"
	// 3: "Natural Disaster"
	// 5: "Unspecified Emergency"
	// 6: "Multiple Emergencies"

	const emergencyIconsData = { 
		"1": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QYYBRYhxorNIwAAA+tJREFUaN7VmslrFFEQxn/pjAsuJ8V9CXjxrn0SRI+RiEeXuHSCImoSJ7bGJcm4jRsyIWbU4IZDIi43wah4EgQvjv+AIAiiURG8uAs6HqzBpnnd83obJgVDut/rV/19XfVq6U5drlAcB2SAFiAF3AK6bcv8RkjJFYrjgePAJqAEDAMZ2zJ/EbMYAr4HmAvMBNLAw1yhODmC3mNAFzAbmAPslzGSINCqGF8OPMoVilND6t2sGNuSFIF6j7llwEhIS8xWjM1KisAtn/nlwIOI7pSoGEA38GSskjAk2jQCjyuQiLInErUAQqKpAollEp2m1hyBsUzCcJ6MRRJ1Hpl0EjACrPRZ+xRotC3zs2J9SbXAtsw6xbV1QBuwG5gA3JSs/TOwBaptCQF/DhgAFgHzJIMfDeVC1SQh4PuBdsX0hsgEHCRWV8gT5Yw9yTE2qrhuVAG+w0Pn91gICImvwCqNZHfCcT6suGbIcdzuAx5xqXgIBCCx3nGcAc7IUx+V48NOlT56+oCLkaKQj9/6Rac3tmXO19TzEZiumDptW+bB0HlAwxJ+e+J6AFV3FGNHg4IPTMDhTo0S/j4Ab4GsdGC60gUMAp+Al0CLbZlHYktkUSVXKK4BOoGlMlQE+mzLvFeVTBwR/GlpIVVy0rbM7kQJ5ArFCRISN3h0VgDvgBtArzPly5O/W+Geq23LHHGsSUlP0gos0MT9GrgGnEwpJrMVwly5ZdwnbxycT7tT4+Z7JJKVpccVYnVkgZQbJdUm3hiheV+isWap67w1ggdtUxEoBVBQCnHTUgw6yvJHReBGAAVDrvPnGmvc11yJQOCyag/0OlzJaxOPSr2TUZQBKyrctM91fgr4DWwFGjRy0x/gFXAVOJtEGD0BHPKYztqW2VvTeUBINEm0MWXomSSy+zWRyKSebxeQU4DbQJfuC2F5+ZsBmoEfQB4YtC0z8IY2QoI/J7+FwDRgF3A2gJqMJK8GYDFwAegX3ckRcIBXtYFrA6hqVox1hCGRiqmHBfjiKkeyArQk4faw4/vADw8dHbI+retORkDwfm1gzlWO7OX/94EDrnIh76MnkCWMmMBfAs77lBjw72tNWQbFFf1IDOqQMGIAPwDsKJs8VyjWAzMU181xNEUlKfz8mvftwM7QBAI8+XSY8Cdr0hUs0RaKQJgnH0Y0LDExMIEA4NNRwCssMRCmsFRZoL1a4BUkdgEvpFjLovFlM+XRMVUNvIvExSAvtbws4PUtLJ8U+ChiaL50ygO7aw28lwt1yd91Uh70AflaBK8kICVxm04MrlUXiroZfwPvFVNvxwQBn/g9XK09EIf0SBm9UZrwIRL6b5W/crdmJRV7bWcAAAAASUVORK5CYII=",
		"2": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QgFARQnB5WTawAAA31JREFUaN7tmV1LFFEYx3+7nUs/QOhGXyCyrESKonyhwGpLIwmlYtPtqg07NxHddtHFpuZNlhzyYgvDMF8genWLokxFjb5AKlTfYXK72BMMgzuzM7Oz44LP1ZyZZ57z/M+c87z8J0JAYqQTrcAQkAOSQqqXQcwTJTh5ANQAMQ2ESgMQM13vqEQAZZEtAGFLxCaKnAAe6uE1IdWEQ9SpBuJAHVALHLCozAHLwAIwIaT65WAvDgzqYY+Q6pVbACumw2cAnUKqZxadCNAGXAcOufii68AnYAAYF1LlLHbPAxlA6FsrQqqdbreQ2agAMkY60WGapEmv6Bhw2OV2jAJHgOfAkpFONJrsdlict/pS9BeIa+fMhgygG9gLpOzedyk54D6wCAxvMGe7kGrSFQAN4hzw1GKwnPIXuCikeuIpCgmpxoALehXCcP6SnfNFhVENojsEAFeEVJlS5YG6EADs8ZUHLNHmTQkPbLGyDrQIqd57BqDj/KJOTGHID6BWSLXudQu1h+g8wC6d3T2fgVSB+z+BZqAKaAFWAgSR8loLVQOrBUA2C6nemXRbgNcBhtOYkOq32y8Qt3k+axl/DfALbANOe9lCdqGzwWFcatlfME/ZvLTb5tmwkU70AF+Ag8CjgAEUDCQRE3tQU2G9zBqQjJrYg0qTGDBUrpZyAjiqw24VcAyYKoVhASR16xgLyPmbQqq7lntZIGukE7eAOx7trgJJuzwwC9T7XXkh1RmHcmUKOOlgZ1ZI1eA2jH4vwer3FaFzrwidZS95YKEEAIqxMe9Hxw7AC53GQ6N2TGX1tGsAuvb4HFQGdaHz0Y5DcgqjAz4B3CiBzoCfcnrc52E+pUNloQh0G2i1eX9J5xBfLWUj8NZnSzmto82cHtfrlW912PvNQqoZXwA0iH7y9GE5pU9I5bgFiy0lFkOodZZLxUqExc79J7YyfliJzUAt2oKI2jgf38B5A7gM9GPDGHvkgPq1bcPSTj7Wvrg+A4MbON8lpBoRUvUCTcXuUwdZApqEVL1CqhGgywJCkGeuXQPIWZzvFFKNmjL1DHmavQ34oFfRzdbIAmeBOiFV1mR3FOi0gPD0f+C47hNyQKoQP2/S367Zg33keU1rKf5Nr/Y8MCmk+uNgL65XPgdcdf2Lya8Y6UTOUlsFMtfWb9YtAJsYwJqlAa84AEkNYlVfByL/AK1bECEs4Y0BAAAAAElFTkSuQmCC",
		"3": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QgFARI7Rc5oogAAA+RJREFUaN7VmE9oVUcUxn95xAjW0IKC6CAR01Y31u5qcQqapIhQwRYKYnd9JnQxLtRCQ2M1oTWK+AfCrBKfhJaKXbS7QmmrtHWo7lTc2UKrMmlBFyIRaRa2m/PoeN+99+W+vHfz7tnM3LlzZ8535sz5zrmQQbyz497ZWe/sMdpEShnnHwKek7aQALqkXdouADojLrIBGAeuA+NKm6cZ3KsEfAJsBY4qba4uxgkcA94BPgWmRKlQ5qT9J0b5KWAUeFO+XxQXuhH03wcmI+9PAbPShjIp86vi8gLQkWDJUJntSpufUlxnO3A5GDoPDGZxv6adgGw6CFQCl5mps8ZM4FqVPJWvOYGIZbcBXmnzm3d2GTAM7AXWAveAL4ETSpsn3tmXgTVpJ5U7gADIMuASsCXm9VWgX2nzpJ15YDhBeYDXgY8WlQe8s+PCrF2B359S2ozI8946a7wn4ZN5rNWSE9gfbFhl2/3B89o6a4Tv663VEiaeAD6MWG0imHMP6E1Z427Qr7dWvfu2UgDvAl4SA/8OfAtMKG3+buQSjwFHUqaMKm3GFmpJ7+xuYBp4PmHKrIToi1kv8QmJNnHyK3CyScp/naI8wHLggnd2z7wAeGf7vLMbJET2A2NynHPSjgIDwgMbvbN9DSq/Uixf1cUDewRMN/A28GfgMVPe2VWJLiTpxCRQFmU3KW1upyiwEbgpfl8BhjJmsaGLzgCvKm3uR+a8IBnyumrSqbQ5XHMCQS5UDqLI6jo6rAkubTkhi02TXUH/QFR5SXEeRoqot5JcaCSSyFWUNj+nlZRKm8tB7lTNYj/OAODFoP9dyrwfg35vEoDNkaxyaJ4l5ZDMr8orGQB0B8Z4lDJvSXihvbMraioysdy/Uhccj/Hl2JJSafPUOzsI/CFGONxMsvLO9gJXIsO3vLO6M6LIbeDdRjYRsJ+1iHDPxtzF1cDprEV9bEmZg2xLGO/LCiCppGy1PEgYv9+Z0U1GJFI14sc9kprvBHoyfj4tRFozXsrDfN7ZAeAW8EEDygOcAf6KKWXPlnJQvgf4JgyXDQSIWeBgZPig0uZxHicwHCh/BxgAliptOpQ2HRlAXAS+kMfPlTZfxfFAK2Rn0C8rbS4tYC0DrJKWvACEFduVhSwkTL0jaz2wEP9fEdmju9l7lFqofK9Enij9ry8EgDT6LwqARPovCoBE+i8KgOmM420H4Ay1f7Zn5G60PwCh/0Nx9F+UE0ik/2ZKHkxcQ/+FAhBH/4VxoTykQ/L1CvAGz/4ab2eZA34Byp2ifH/BDN8ldcW5EvBagT1oSwm4VmAA10rAPuAH/v/nU5Q78D2w7z9GBT7e+rAvoAAAAABJRU5ErkJggg==",
		"5": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAwCAYAAABE1blzAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QYYBRcxwibsBgAAA0dJREFUaN7dmT1oFEEYhp/bJCpRQowo/qCghCQiGiFYiDJYKP6CksTG0co44B+iBCGiIv6C4kVRC6ezGLAQ7BS00QGJSgpNUCNoZacggRBBomhxExD17vbudvb27u32bmZnn3ln5/v2mxQxSFmzBLgArAemAgPAGS3kgO+xUzHAtQDPgZl//TUBbNdCPqxYQGVNCngGrM7S5DPQqoUc9fUMgWcDd+eAA5gDnKpIB5U19cA7YFGephPAci3k+0pz8EQIOIA6IF1RDiprFgIjQH0B3bb42HB8OZguEA4graypSzygsmYN0FVE1zbgYKKXqLImAF4CHUXeYhRo0UJ+SaqD+0qAA2gEzibSQWVNA/AemFvirX4CHVrI10lz8EwEcAA1wE2XBSUDUFnTDByIcLLWAp1JcvCa+0rIpcdAO9AM3A5xzyvKmmllB1TWbAK2htgdu7SQQ1rIj8B+YDBPn8XAsbICusDcH6LpWy3k2OSFFvIX8CJEvz5lzfxyOnjIBeh8+pElyc6nGcClsgAqa5qAkzEUBPYoa9aWw8GLQFMMgCngmsuS4gFU1iwD9hKfOgAZp4P9QC3x6rLLlvwCKmu6gQ3Er7nAca+Aypqppe5qJarXZU3eHOx1mUi5VPAEBwW4V9QS8aBuZc0GHw5eBhpIhvqVNbWRASprit6mPSl0mApCwKWA6/gvEhecaLhsqmQHJbCmxIdpCPlbIQqVKqbyuDfdlSEWlPgwP1wZYuiPPPZNBBWACWCFFnIkW4N8L2pfBHCT4zxR1twCxoGeiMobdcDVXN+jqRzuLSJztlBP8rVVC/mg0HcwXSFwANddlhUO0H1/dVI5ylr0Cv4DVwPcIPqDmQFgHbAKuOsB8rSyZnYYB/cCKyMefAzYpoV8qoUcJHMwOhTxGI3AuZyAyppG4LyH2f2ghfw6eaGF/En+qlox6lHWtOdy8DQw28PArcqaeX9M5JQIkof/qYZMjfbfMKGsaQWGXWzxoWEy5f1x4Ciw0eOms1MLee9vwAfAZqpDn4A2LeS3wMFtqSI4gIVulZBy1elhoJXq0jdgaeACZLXB4bKwcwFwmOrVrgCYVcWAtQFwv4oBXwXAEeCOi0/Vou/AI2DHb73c0yO4eOp/AAAAAElFTkSuQmCC",
		"6": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QYXAxMSWMM0lAAAA+1JREFUaN7NmsuPFFUUxn/d06ImPmKiMZA4PpAQGQEHYoxvxRkjxC/CgsBCEyUIaGIU1MSd/gFqFNQwEF24EnWjBzRjBhkWPBQTwFHQGJWXLty4AGVmZHpczOmkM+l69K3u6jpJpZPqe879vjqPe+6tKlEwMbN5wHrgIeA6oAv4DdgNvC/ph/rxpQIBvxh4HXgWKEcMmwC2ApskjReGgJnNAHYBfSlVvgaWShovF8QBbzQBHmAJ8GYhPGBmtwJHPNabkQlgYRE8sDYAPK6ztggEHsyg21/pYOiUgbuBORnMdFc6ALwHWAk8AdyU1V4lJ9C3Aav8urGFpk9W2gh6Xh3ouW2aZqjUYOJFXhmWALOBKvALMAwMSBqJAT3bAa8G5rfZsVWgp1Q3+SXAW8DTMUt5FXgPeEnSmOt1e0yvAm7PMZ02S3q+5CAuBQaBe1MqfwXsdNB3ZVgQq8A+YAewzK80MggslzRay4EtTYAHeNivEJkEvnXQn0g64w9xG3AAWJxAeDPwSi0CKmbWC6zJweVHHPQOSb83+P8CMCtC95h7fUDST9PL6Po29kTHHfRHkn5OGDsXmNng/n/AHZLORa0DfS0G/Wvdk/6+Cb0HIu5/FwW+RqC7BaBPAx876EMt7omGk1biyQzAzwP9wH5JwXbMrATcH0rgFHBzaLhI2tcCD94CXNvg/riX2Ugp+2Y5VEba3FIfkvRPEoEtXl9DZLWZvdYCAlEJvCdJsSzpR2B74MQl4FUzGzCzShvif28iAf/dmJQsCbIO+MzMLgvQ7QGuiYj//akISDoPLPUzl9BwWgbsNbOZLYr/byT9m9YDSBqV9AzQC7zjCfo3cBY46p3qcuBMjL1FwAHfdWWN/+G0MdxszM7yTrQ3ZthZYKWkwRTx/xdwdaOzH0l7UnsgrUj6E7gP+CJm2OXA52b2eIK5BRHgx4CDafAEHat4b/IYMBAzbAbwYUKZjYr/g56X7SHgJC5I2gC8ENOO1MrsB2Z2UavjPxOBOiJvA0962YuSp4BdZnbFtHOhe0IXsOAkjknIPuBT4MqYYYeBF4EVfmjQqFqNAldJGs3FA3WeGPJt6emYYb1MHY0/FwG+1ppXcwuhaSRGgDt9+xgqc4Cd/s4gXwJO4g8vs4MZzPQz9bYmvxxokBNdvqJvCDQxAcyXdDxXD9R5YsJbky8DTXR5k0hHCNRJd8ZQ6jiBGzLoXl8EAlnmmCwCgRMZdE8VgcBQBt3dRSCwPXCXN5nQ7eZDwFfnbQGq70o6VgQP4C33cJNh93JHWokIL4wBj6Q4NKj66v1o2m40908NzGwhU+8j+pg60hwHTrqHtk7/nCZJ/gd1ASoC0UvDHgAAAABJRU5ErkJggg=="
	};

	const queryStringValues = new URLSearchParams(location.search);

	if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

	const containerDiv = d3.select("#d3chartcontainer" + classPrefix);

	const showLink = containerDiv.node().getAttribute("data-showlink") === "true";

	const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

	const selectedResponsiveness = containerDiv.node().getAttribute("data-responsive") === "true";

	const lazyLoad = containerDiv.node().getAttribute("data-lazyload") === "true";

	const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-year");

	const selectedFundsString = queryStringValues.has("fund") ? queryStringValues.get("fund").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-fund");

	const selectedRegionsString = queryStringValues.has("region") ? queryStringValues.get("region").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-region");

	const selectedEmerencyGroupsString = queryStringValues.has("emergencygroup") ? queryStringValues.get("emergencygroup").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-emergencygroup");

	const selectedViewString = queryStringValues.has("view") ? queryStringValues.get("view") : containerDiv.node().getAttribute("data-view") === viewOptions[1] ? viewOptions[1] : viewOptions[0];

	if (selectedResponsiveness === false) {
		containerDiv.style("width", width + "px");
	};

	const topDiv = containerDiv.append("div")
		.attr("class", classPrefix + "TopDiv");

	const titleDiv = topDiv.append("div")
		.attr("class", classPrefix + "TitleDiv");

	const iconsDiv = topDiv.append("div")
		.attr("class", classPrefix + "IconsDiv d3chartIconsDiv");

	const yearButtonsDiv = containerDiv.append("div")
		.attr("class", classPrefix + "yearButtonsDiv");

	const bottomFiltersDiv = containerDiv.append("div")
		.attr("class", classPrefix + "bottomFiltersDiv");

	const dropdownDiv = bottomFiltersDiv.append("div")
		.attr("class", classPrefix + "dropdownDiv");

	const selectViewDiv = bottomFiltersDiv.append("div")
		.attr("class", classPrefix + "selectViewDiv");

	const svg = containerDiv.append("svg")
		.attr("viewBox", "0 0 " + width + " " + stackedHeightAggregate)
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

	const dataTooltip = containerDiv.append("div")
		.attr("id", classPrefix + "dataTooltipdiv")
		.style("display", "none");

	containerDiv.on("contextmenu", function() {
		d3.event.preventDefault();
		const thisMouse = d3.mouse(this);
		isSnapshotTooltipVisible = true;
		snapshotTooltip.style("display", "block")
			.style("top", thisMouse[1] - 4 + "px")
			.style("left", thisMouse[0] - 4 + "px");
	});

	const mainGroup = svg.append("g")
		.attr("class", classPrefix + "mainGroup")
		.attr("pointer-events", "all")
		.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")");

	const yScale = d3.scaleLinear();

	const groupScale = d3.scaleBand()
		.paddingOuter(0)
		.paddingInner(0);

	const xScale = d3.scalePoint()
		.padding(0.25);

	xScale.invert = function(x) {
		return d3.scaleQuantize().domain([this.range()[0] - this.step() / 2, this.range()[1] + this.step() / 2]).range(this.domain())(x);
	};

	const yAxis = d3.axisLeft(yScale)
		.tickFormat(d => "$" + d3.formatPrefix(".0", d)(d).replace("G", "B"))
		.tickSizeInner(-(chartWidth - stackedPadding[1] - stackedPadding[3]))
		.ticks(tickNumberAggregate);

	const yAxisByGroup = d3.axisLeft(yScale)
		.tickFormat(d => "$" + d3.formatPrefix(".0", d)(d).replace("G", "B"))
		.tickSizeInner(-(chartWidth - stackedPaddingByGroup[1] - stackedPaddingByGroup[3]))
		.ticks(tickNumberByGroup);

	const xAxis = d3.axisBottom(xScale)
		.tickSizeOuter(0)
		.tickSizeInner(4)
		.tickPadding(4);

	const stackGenerator = d3.stack();

	const stackGeneratorByGroup = d3.stack()
		.order(d3.stackOrderDescending);

	const areaGenerator = d3.area()
		.curve(curveBumpX);

	const areaGeneratorZero = d3.area()
		.y0(() => yScale(0))
		.y1(() => yScale(0))
		.curve(curveBumpX);

	const colorScale = d3.scaleOrdinal()
		.range(colorArray.map(e => e.main));

	const aggregatedClipPath = mainGroup.append("clipPath")
		.attr("id", classPrefix + "aggregatedClipPath")
		.append("rect")
		.attr("height", stackedHeightAggregate)
		.attr("width", chartWidth - stackedPadding[1] - stackedPadding[3]);

	const clipPathByGroup = mainGroup.append("clipPath")
		.attr("id", classPrefix + "clipPathByGroup")
		.append("rect")
		.attr("height", stackedHeight)
		.attr("width", chartWidth - stackedPaddingByGroup[1] - stackedPaddingByGroup[3]);

	const clipPathGroup = mainGroup.append("g")
		.attr("class", classPrefix + "clipPathGroup")
		.attr("transform", "translate(" + stackedPadding[3] + ",0)")
		.attr("clip-path", "url(#" + classPrefix + "aggregatedClipPath)");

	const aggregatedChartArea = clipPathGroup.append("g")
		.attr("class", classPrefix + "aggregatedChartArea")
		.attr("transform", "translate(0,0)");
	//.style("cursor", "ew-resize");

	Promise.all([
			fetchFile(classPrefix + "MasterFunds", masterFundsUrl, "master table for funds", "json"),
			fetchFile(classPrefix + "MasterEmergencyTypes", masterEmergencyTypeUrl, "master table for emergency types", "json"),
			fetchFile(classPrefix + "MasterEmergencyGroups", masterEmergencyGroupUrl, "master table for emergency groups", "json"),
			fetchFile(classPrefix + "MasterRegions", masterRegionsUrl, "master table for regions", "json"),
			fetchFile(classPrefix + "AllocationsData", allocationsDataUrl, "allocations data", "csv")
		])
		.then(allData => fetchCallback(allData));

	function fetchCallback([
		masterFunds,
		masterEmergencyTypes,
		masterEmergencyGroups,
		masterRegions,
		rawDataAllocations
	]) {

		//create lists
		createFundNamesList(masterFunds);
		createRegionNamesList(masterRegions);
		createEmergencyGroupsNames(masterEmergencyGroups);
		createEmergencyTypesNames(masterEmergencyTypes);

		preProcessData(rawDataAllocations);

		colorScale.domain(d3.keys(lists.emergencyGroupsInAllDataList).map(d => "eg" + d));

		d3.keys(lists.emergencyGroupsInAllDataList).forEach(group => clickedGroup[group] = null);

		validateYear(selectedYearString);

		chartState.selectedFund = validateSelectionString(selectedFundsString, lists.fundsInAllDataList);
		chartState.selectedRegion = validateSelectionString(selectedRegionsString, lists.regionsInAllDataList);
		chartState.selectedEmergencyGroup = validateSelectionString(selectedEmerencyGroupsString, lists.emergencyGroupsInAllDataList);
		chartState.selectedView = selectedViewString;

		if (!lazyLoad) {
			draw(rawDataAllocations);
		} else {
			d3.select(window).on("scroll." + classPrefix, checkPosition);
			d3.select("body").on("d3ChartsYear." + classPrefix, () => chartState.selectedYear = [validateCustomEventYear(+d3.event.detail)]);
			checkPosition();
		};

		function checkPosition() {
			const containerPosition = containerDiv.node().getBoundingClientRect();
			if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
				d3.select(window).on("scroll." + classPrefix, null);
				draw(rawDataAllocations);
			};
		};

		//end of fetchCallback
	};

	function draw(rawDataAllocations) {

		const data = processData(rawDataAllocations);

		previousDataLength = data.length;

		resizeSvg(true);

		createTitle(rawDataAllocations);

		createYearButtons(rawDataAllocations);

		createDropdowns(rawDataAllocations);

		createViewButtons(rawDataAllocations);

		setYearsDescriptionDiv();

		drawStackedAreaChart(data);

		//end of draw;
	};

	function createTitle(rawDataAllocations) {

		const title = titleDiv.append("p")
			.attr("id", classPrefix + "d3chartTitle")
			.html(chartTitle);

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
				chartState.selectedYear = yearsArray[(index + 1) % yearsArray.length];
				const yearButton = d3.selectAll("." + classPrefix + "yearButtons")
					.filter(d => d === chartState.selectedYear);
				yearButton.dispatch("click");
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

			const csv = createCsv(rawDataAllocations);

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

	function createYearButtons(rawDataAllocations) {

		const yearsData = yearsArray.concat([allYearsOption]);

		const yearButtons = yearButtonsDiv.selectAll(null)
			.data(yearsData)
			.enter()
			.append("button")
			.attr("class", classPrefix + "yearButtons")
			.classed("active", d => chartState.selectedYear.includes(d))
			.html(d => d === allYearsOption ? capitalize(allYearsOption) : d);

		yearButtons.on("mouseover", mouseoveryearButtons)
			.on("mouseout", mouseoutyearButtons)
			.on("click", (d, i, n) => {
				tooltip.style("display", "none");
				const self = n[i];
				if (d3.event.altKey) {
					clickyearButtons(d, false);
					return;
				};
				if (localVariable.get(self) !== "clicked") {
					localVariable.set(self, "clicked");
					setTimeout(() => {
						if (localVariable.get(self) === "clicked") {
							clickyearButtons(d, true);
						};
						localVariable.set(self, null);
					}, 250);
				} else {
					clickyearButtons(d, false);
					localVariable.set(self, null);
				};
			});

		function mouseoveryearButtons(_, d) {
			tooltip.style("display", "block")
				.html(null);

			const innerTooltip = tooltip.append("div")
				.style("max-width", "180px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltip.html(d === allYearsOption ? "Click to show all years" : "Click for selecting a single year, double-click or ALT + click for selecting multiple years.");

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = this.getBoundingClientRect();
			const tooltipSize = tooltip.node().getBoundingClientRect();

			tooltip.style("left", (thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
					"0px" : thisSize.left + thisSize.width / 2 - tooltipSize.width / 2 - containerSize.left + "px")
				.style("top", thisSize.top - containerSize.top + thisSize.height + 4 + "px");
		};

		function mouseoutyearButtons() {
			tooltip.html(null)
				.style("display", "none");
		};

		function clickyearButtons(d, singleSelection) {
			if (singleSelection || d === allYearsOption || chartState.selectedYear.includes(allYearsOption)) {
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

			yearButtons.classed("active", d => chartState.selectedYear.includes(d));

			if (!chartState.selectedYear.includes(allYearsOption)) {
				const yearValues = chartState.selectedYear.join("|");
				if (queryStringValues.has("year")) {
					queryStringValues.set("year", yearValues);
				} else {
					queryStringValues.append("year", yearValues);
				};
			} else {
				queryStringValues.delete("year");
			};

			const data = processData(rawDataAllocations);

			//FIX THE ISSUE WHEN CHANGING YEARS!!!!!!!!!!!!!!

			d3.selectAll("." + classPrefix + "regionCheckboxDiv")
				.filter(function(d) {
					return d !== allRegionsOption;
				})
				.select("input")
				.property("disabled", function(d) {
					return !inSelectionLists.regionsInData.includes(d);
				});
			d3.selectAll("." + classPrefix + "fundCheckboxDiv")
				.filter(function(d) {
					return d !== allFundsOption;
				})
				.select("input")
				.property("disabled", function(d) {
					return !inSelectionLists.fundsInData.includes(d);
				});
			d3.selectAll("." + classPrefix + "emergencyCheckboxDiv")
				.filter(function(d) {
					return d !== allEmergencyGroupsOption;
				})
				.select("input")
				.property("disabled", function(d) {
					return !inSelectionLists.emergencyGroupsInData.includes(d);
				});

			resizeSvg(false);

			drawStackedAreaChart(data);

		};

		//end of createYearButtons
	};

	function createDropdowns(rawDataAllocations) {

		//region checkboxes

		const regionContainer = dropdownDiv.append("div")
			.datum({
				clicked: false
			})
			.attr("class", classPrefix + "regionContainer");

		const regionTitleDiv = regionContainer.append("div")
			.attr("class", classPrefix + "regionTitleDiv");

		const regionTitle = regionTitleDiv.append("div")
			.attr("class", classPrefix + "regionTitle")
			.html("Select Region");

		const regionArrow = regionTitleDiv.append("div")
			.attr("class", classPrefix + "regionArrow");

		regionArrow.append("i")
			.attr("class", "fa fa-angle-down");

		const regionDropdown = regionContainer.append("div")
			.attr("class", classPrefix + "regionDropdown");

		regionTitleDiv.on("click", () => {
			regionContainer.classed("active", d => {
				return d.clicked = !d.clicked;
			});
			fundContainer.classed("active", d => {
				return d.clicked = false;
			});
			emergencyContainer.classed("active", d => {
				return d.clicked = false;
			});
		});

		const regionCheckboxData = d3.keys(lists.regionsInAllDataList).sort(function(a, b) {
			return (lists.regionNames[a]).localeCompare(lists.regionNames[b]);
		}).map(d => +d);

		regionCheckboxData.unshift(allRegionsOption);

		const regionCheckboxDiv = regionDropdown.selectAll(null)
			.data(regionCheckboxData)
			.enter()
			.append("div")
			.attr("class", classPrefix + "regionCheckboxDiv");

		regionCheckboxDiv.filter(function(d) {
				return d !== allRegionsOption;
			})
			.style("opacity", function(d) {
				return inDataLists.regionsInData.includes(d) ? 1 : disabledOpacity;
			});

		const regionLabel = regionCheckboxDiv.append("label");

		const regionInput = regionLabel.append("input")
			.attr("type", "checkbox")
			.property("checked", function(d) {
				return chartState.selectedRegion.length !== d3.keys(lists.regionsInAllDataList).length && chartState.selectedRegion.includes(d);
			})
			.attr("value", function(d) {
				return d;
			});

		const regionSpan = regionLabel.append("span")
			.attr("class", classPrefix + "checkboxText")
			.html(function(d) {
				return lists.regionNames[d] || d;
			});

		const allRegions = regionCheckboxDiv.filter(function(d) {
			return d === allRegionsOption;
		}).select("input");

		d3.select(allRegions.node().nextSibling)
			.attr("class", classPrefix + "checkboxTextAllRegions");

		const regionCheckbox = regionCheckboxDiv.filter(function(d) {
			return d !== allRegionsOption;
		}).select("input");

		regionCheckbox.property("disabled", function(d) {
			return !inDataLists.regionsInData.includes(d);
		});

		allRegions.property("checked", function() {
			return chartState.selectedRegion.length === d3.keys(lists.regionsInAllDataList).length;
		});

		//fund checkboxes

		const fundContainer = dropdownDiv.append("div")
			.datum({
				clicked: false
			})
			.attr("class", classPrefix + "fundContainer");

		const fundTitleDiv = fundContainer.append("div")
			.attr("class", classPrefix + "fundTitleDiv");

		const fundTitle = fundTitleDiv.append("div")
			.attr("class", classPrefix + "fundTitle")
			.html("Select Country");

		const fundArrow = fundTitleDiv.append("div")
			.attr("class", classPrefix + "fundArrow");

		fundArrow.append("i")
			.attr("class", "fa fa-angle-down");

		const fundDropdown = fundContainer.append("div")
			.attr("class", classPrefix + "fundDropdown");

		fundTitleDiv.on("click", () => {
			fundContainer.classed("active", d => {
				return d.clicked = !d.clicked;
			});
			regionContainer.classed("active", d => {
				return d.clicked = false;
			});
			emergencyContainer.classed("active", d => {
				return d.clicked = false;
			});
		});

		const fundCheckboxData = d3.keys(lists.fundsInAllDataList).sort(function(a, b) {
			return (lists.fundNames[a]).localeCompare(lists.fundNames[b]);
		}).map(d => +d);

		fundCheckboxData.unshift(allFundsOption);

		const fundCheckboxDiv = fundDropdown.selectAll(null)
			.data(fundCheckboxData)
			.enter()
			.append("div")
			.attr("class", classPrefix + "fundCheckboxDiv");

		fundCheckboxDiv.filter(function(d) {
				return d !== allFundsOption;
			})
			.style("opacity", function(d) {
				return inDataLists.fundsInData.includes(d) ? 1 : disabledOpacity;
			});

		const fundLabel = fundCheckboxDiv.append("label");

		const fundInput = fundLabel.append("input")
			.attr("type", "checkbox")
			.property("checked", function(d) {
				return chartState.selectedFund.length !== d3.keys(lists.fundsInAllDataList).length && chartState.selectedFund.includes(d);
			})
			.attr("value", function(d) {
				return d;
			});

		const fundSpan = fundLabel.append("span")
			.attr("class", classPrefix + "checkboxText")
			.html(function(d) {
				return lists.fundNames[d] || d;
			});

		const allFunds = fundCheckboxDiv.filter(function(d) {
			return d === allFundsOption;
		}).select("input");

		d3.select(allFunds.node().nextSibling)
			.attr("class", classPrefix + "checkboxTextAllFunds");

		const fundCheckbox = fundCheckboxDiv.filter(function(d) {
			return d !== allFundsOption;
		}).select("input");

		fundCheckbox.property("disabled", function(d) {
			return !inDataLists.fundsInData.includes(d);
		});

		allFunds.property("checked", function() {
			return chartState.selectedFund.length === d3.keys(lists.fundsInAllDataList).length;
		});

		//emergency group checkboxes

		const emergencyContainer = dropdownDiv.append("div")
			.datum({
				clicked: false
			})
			.attr("class", classPrefix + "emergencyContainer");

		const emergencyTitleDiv = emergencyContainer.append("div")
			.attr("class", classPrefix + "emergencyTitleDiv");

		const emergencyTitle = emergencyTitleDiv.append("div")
			.attr("class", classPrefix + "emergencyTitle")
			.html("Select Emergency Group");

		const emergencyArrow = emergencyTitleDiv.append("div")
			.attr("class", classPrefix + "emergencyArrow");

		emergencyArrow.append("i")
			.attr("class", "fa fa-angle-down");

		const emergencyDropdown = emergencyContainer.append("div")
			.attr("class", classPrefix + "emergencyDropdown");

		emergencyTitleDiv.on("click", () => {
			emergencyContainer.classed("active", d => {
				return d.clicked = !d.clicked;
			});
			fundContainer.classed("active", d => {
				return d.clicked = false;
			});
			regionContainer.classed("active", d => {
				return d.clicked = false;
			});
		});

		const emergencyCheckboxData = d3.keys(lists.emergencyGroupsInAllDataList).sort(function(a, b) {
			return (lists.emergencyGroupNames[a]).localeCompare(lists.emergencyGroupNames[b]);
		}).map(d => +d);

		emergencyCheckboxData.unshift(allEmergencyGroupsOption);

		const emergencyCheckboxDiv = emergencyDropdown.selectAll(null)
			.data(emergencyCheckboxData)
			.enter()
			.append("div")
			.attr("class", classPrefix + "emergencyCheckboxDiv");

		emergencyCheckboxDiv.filter(function(d) {
				return d !== allEmergencyGroupsOption;
			})
			.style("opacity", function(d) {
				return inDataLists.emergencyGroupsInData.includes(d) ? 1 : disabledOpacity;
			});

		const emergencyLabel = emergencyCheckboxDiv.append("label");

		const emergencyInput = emergencyLabel.append("input")
			.attr("type", "checkbox")
			.property("checked", function(d) {
				return chartState.selectedEmergencyGroup.length !== d3.keys(lists.emergencyGroupsInAllDataList).length && chartState.selectedEmergencyGroup.includes(d);
			})
			.attr("value", function(d) {
				return d;
			});

		const emergencySpan = emergencyLabel.append("span")
			.attr("class", classPrefix + "checkboxText")
			.html(function(d) {
				return lists.emergencyGroupNames[d] || d;
			});

		const allEmergencies = emergencyCheckboxDiv.filter(function(d) {
			return d === allEmergencyGroupsOption;
		}).select("input");

		d3.select(allEmergencies.node().nextSibling)
			.attr("class", classPrefix + "checkboxTextAllEmergencies");

		const emergencyCheckbox = emergencyCheckboxDiv.filter(function(d) {
			return d !== allEmergencyGroupsOption;
		}).select("input");

		emergencyCheckbox.property("disabled", function(d) {
			return !inDataLists.emergencyGroupsInData.includes(d);
		});

		allEmergencies.property("checked", function() {
			return chartState.selectedEmergencyGroup.length === d3.keys(lists.emergencyGroupsInAllDataList).length;
		});

		//filter

		const filterContainer = dropdownDiv.append("div")
			.attr("class", classPrefix + "filterContainer");

		filterContainer.append("i")
			.style("font-size", "28px")
			.attr("class", "fa fa-filter");

		filterContainer.append("i")
			.style("font-size", "12px")
			.style("margin-top", "3px")
			.style("margin-left", "-10px")
			.style("text-shadow", "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff")
			.attr("class", "fa fa-times-circle");

		filterContainer.on("mouseover", (_, i, n) => {
			tooltip.style("display", "block")
				.html(null);

			const innerTooltip = tooltip.append("div")
				.style("max-width", "120px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltip.html("Remove all filters.");

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = n[i].getBoundingClientRect();
			const tooltipSize = tooltip.node().getBoundingClientRect();

			tooltip.style("left", (thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
					"0px" : thisSize.left + thisSize.width / 2 - tooltipSize.width / 2 - containerSize.left + "px")
				.style("top", thisSize.top - containerSize.top + thisSize.height + 4 + "px");
		}).on("mouseout", () => {
			tooltip.html(null)
				.style("display", "none");
		});

		//listeners

		regionCheckboxDiv.select("input")
			.on("change", (d, i, n) => {
				if (d === allRegionsOption) {
					if (n[i].checked) {
						chartState.selectedRegion = d3.keys(lists.regionsInAllDataList).map(e => +e);
						regionCheckbox.property("checked", false)
							.property("disabled", false);
					} else {
						chartState.selectedRegion.length = 0;
					};
				} else {
					if (n[i].checked) {
						if (chartState.selectedRegion.length === d3.keys(lists.regionsInAllDataList).length) {
							chartState.selectedRegion = [d];
						} else {
							chartState.selectedRegion.push(d);
						};
					} else {
						const thisIndex = chartState.selectedRegion.indexOf(d);
						chartState.selectedRegion.splice(thisIndex, 1);
					};
					allRegions.property("checked", false);
				};

				if (chartState.selectedRegion.length !== d3.keys(lists.regionsInAllDataList).length) {
					const regionValues = chartState.selectedRegion.join("|");
					if (queryStringValues.has("region")) {
						queryStringValues.set("region", regionValues);
					} else {
						queryStringValues.append("region", regionValues);
					};
				} else {
					queryStringValues.delete("region");
				};

				regionTitle.html(chartState.selectedRegion.length === d3.keys(lists.regionsInAllDataList).length ? "All regions" :
					chartState.selectedRegion.length > 1 ? "Multiple regions" : (lists.regionNames[chartState.selectedRegion] || "No selection"));

				const data = processData(rawDataAllocations);

				if (chartState.selectedRegion.length === d3.keys(lists.regionsInAllDataList).length) {
					fundCheckbox.property("disabled", function(d) {
						return !inSelectionLists.fundsInData.includes(d);
					});
					emergencyCheckbox.property("disabled", function(d) {
						return !inSelectionLists.emergencyGroupsInData.includes(d);
					});
				} else {
					fundCheckbox.property("disabled", function(d) {
						return !inDataLists.fundsInData.includes(d);
					});
					emergencyCheckbox.property("disabled", function(d) {
						return !inDataLists.emergencyGroupsInData.includes(d);
					});
				};

				resizeSvg(false);

				drawStackedAreaChart(data);
			});

		fundCheckboxDiv.select("input")
			.on("change", (d, i, n) => {
				if (d === allFundsOption) {
					if (n[i].checked) {
						chartState.selectedFund = d3.keys(lists.fundsInAllDataList).map(e => +e);
						fundCheckbox.property("checked", false)
							.property("disabled", false);
					} else {
						chartState.selectedFund.length = 0;
					};
				} else {
					if (n[i].checked) {
						if (chartState.selectedFund.length === d3.keys(lists.fundsInAllDataList).length) {
							chartState.selectedFund = [d];
						} else {
							chartState.selectedFund.push(d);
						};
					} else {
						const thisIndex = chartState.selectedFund.indexOf(d);
						chartState.selectedFund.splice(thisIndex, 1);
					};
					allFunds.property("checked", false);
				};

				if (chartState.selectedFund.length !== d3.keys(lists.fundsInAllDataList).length) {
					const fundValues = chartState.selectedFund.join("|");
					if (queryStringValues.has("fund")) {
						queryStringValues.set("fund", fundValues);
					} else {
						queryStringValues.append("fund", fundValues);
					};
				} else {
					queryStringValues.delete("fund");
				};

				fundTitle.html(chartState.selectedFund.length === d3.keys(lists.fundsInAllDataList).length ? "All funds" :
					chartState.selectedFund.length > 1 ? "Multiple funds" : (lists.fundNames[chartState.selectedFund] || "No selection"));

				const data = processData(rawDataAllocations);

				if (chartState.selectedFund.length === d3.keys(lists.fundsInAllDataList).length) {
					emergencyCheckbox.property("disabled", function(d) {
						return !inSelectionLists.emergencyGroupsInData.includes(d);
					});
				} else {
					emergencyCheckbox.property("disabled", function(d) {
						return !inDataLists.emergencyGroupsInData.includes(d);
					});
				};

				resizeSvg(false);

				drawStackedAreaChart(data);
			});

		emergencyCheckboxDiv.select("input")
			.on("change", (d, i, n) => {
				if (d === allEmergencyGroupsOption) {
					if (n[i].checked) {
						chartState.selectedEmergencyGroup = d3.keys(lists.emergencyGroupsInAllDataList).map(e => +e);
						emergencyCheckbox.property("checked", false)
							.property("disabled", false);
					} else {
						chartState.selectedEmergencyGroup.length = 0;
					};
				} else {
					if (n[i].checked) {
						if (chartState.selectedEmergencyGroup.length === d3.keys(lists.emergencyGroupsInAllDataList).length) {
							chartState.selectedEmergencyGroup = [d];
						} else {
							chartState.selectedEmergencyGroup.push(d);
						};
					} else {
						const thisIndex = chartState.selectedEmergencyGroup.indexOf(d);
						chartState.selectedEmergencyGroup.splice(thisIndex, 1);
					};
					allEmergencies.property("checked", false);
				};

				if (chartState.selectedEmergencyGroup.length !== d3.keys(lists.emergencyGroupsInAllDataList).length) {
					const emergencyGroupValues = chartState.selectedEmergencyGroup.join("|");
					if (queryStringValues.has("emergencygroup")) {
						queryStringValues.set("emergencygroup", emergencyGroupValues);
					} else {
						queryStringValues.append("emergencygroup", emergencyGroupValues);
					};
				} else {
					queryStringValues.delete("emergencygroup");
				};

				emergencyTitle.html(chartState.selectedEmergencyGroup.length === d3.keys(lists.emergencyGroupsInAllDataList).length ? "All emergencies" :
					chartState.selectedEmergencyGroup.length > 1 ? "Multiple emergencies" : (lists.emergencyGroupNames[chartState.selectedEmergencyGroup] || "No selection"));

				const data = processData(rawDataAllocations);

				if (chartState.selectedEmergencyGroup.length === d3.keys(lists.emergencyGroupsInAllDataList).length) {
					regionCheckbox.property("disabled", function(d) {
						return !inSelectionLists.regionsInData.includes(d);
					});
					fundCheckbox.property("disabled", function(d) {
						return !inSelectionLists.fundsInData.includes(d);
					});
				} else {
					regionCheckbox.property("disabled", function(d) {
						return !inDataLists.regionsInData.includes(d);
					});
					fundCheckbox.property("disabled", function(d) {
						return !inDataLists.fundsInData.includes(d);
					});
				};

				resizeSvg(false);

				drawStackedAreaChart(data);
			});

		filterContainer.on("click", () => {

			chartState.selectedRegion = d3.keys(lists.regionsInAllDataList).map(e => +e);
			chartState.selectedFund = d3.keys(lists.fundsInAllDataList).map(e => +e);
			chartState.selectedEmergencyGroup = d3.keys(lists.emergencyGroupsInAllDataList).map(e => +e);

			regionTitle.html("Select Region");
			fundTitle.html("Select Country");
			emergencyTitle.html("Select Emergency Group");

			regionCheckbox.property("checked", false);
			fundCheckbox.property("checked", false);
			emergencyCheckbox.property("checked", false);

			allRegions.property("checked", true);
			allFunds.property("checked", true);
			allEmergencies.property("checked", true);

			regionContainer.classed("active", false);
			fundContainer.classed("active", false);
			emergencyContainer.classed("active", false);

			const data = processData(rawDataAllocations);

			regionCheckbox.property("disabled", function(d) {
				return !inDataLists.regionsInData.includes(d);
			});
			fundCheckbox.property("disabled", function(d) {
				return !inDataLists.fundsInData.includes(d);
			});
			emergencyCheckbox.property("disabled", function(d) {
				return !inDataLists.emergencyGroupsInData.includes(d);
			});

			resizeSvg(false);

			drawStackedAreaChart(data);
		});

		//end of createDropdowns
	};

	function createViewButtons(rawDataAllocations) {

		const viewButtons = selectViewDiv.selectAll(null)
			.data(viewOptions)
			.enter()
			.append("button")
			.attr("class", classPrefix + "viewButtons")
			.classed("active", d => chartState.selectedView.includes(d))
			.html(d => viewButtonsText[d]);

		viewButtons.on("click", d => {
			chartState.selectedView = d;
			chartState.baseline = null;
			d3.keys(lists.emergencyGroupsInAllDataList).forEach(group => clickedGroup[group] = null);
			viewButtons.classed("active", d => chartState.selectedView.includes(d));
			if (queryStringValues.has("view")) {
				queryStringValues.set("view", chartState.selectedView);
			} else {
				queryStringValues.append("view", chartState.selectedView);
			};
			const data = processData(rawDataAllocations);
			resizeSvg(false);
			drawStackedAreaChart(data);
		});

	};

	function drawStackedAreaChart(data) {

		const thisDataLength = chartState.selectedView === viewOptions[0] ? data.length : d3.max(data, d => d.emergencyData.length);
		const sameDataLength = previousDataLength === thisDataLength;
		previousDataLength = thisDataLength;

		stackGenerator.keys(inDataLists.emergencyGroupsInData.map(d => "eg" + d))
			.order(stackCustomOrder);

		const dataAggregated = chartState.selectedView === viewOptions[0] ? stackGenerator(data) : [];

		const dataByGroup = chartState.selectedView === viewOptions[1] ? data.reduce((acc, row) => {
			if (clickedGroup[row.emergencyGroup]) chartState.baseline = clickedGroup[row.emergencyGroup];
			stackGenerator.keys(lists.emergencyTypesInGroups[row.emergencyGroup].reduce((a, e) => {
					if (inDataLists.emergencyTypesInData.includes(e)) a.push("et" + e);
					return a;
				}, []))
				.order(clickedGroup[row.emergencyGroup] ? stackCustomOrder : d3.stackOrderDescending);
			acc.push({
				emergencyGroup: row.emergencyGroup,
				emergencyGroupData: stackGenerator(row.emergencyData),
				emergencyGroupTotal: row.total,
				groupRawData: row.emergencyData
			});
			return acc;
		}, []) : [];

		if (dataAggregated.length) dataAggregated.sort((a, b) => a.index - b.index);

		if (dataByGroup.length) {
			dataByGroup.sort((a, b) => b.emergencyGroupTotal - a.emergencyGroupTotal);
			dataByGroup.forEach(row => {
				row.emergencyGroupData.sort((a, b) => a.index - b.index);
			});
		};

		xScale.domain(chartState.selectedYear.includes(allYearsOption) ? yearsArray : monthsArray);

		if (chartState.selectedView === viewOptions[0]) {
			xScale.range([0, Math.max(maxTickNumber, data.length) * tickStep]);
		} else {
			const maxLength = d3.max(data, d => d.emergencyData.length);
			xScale.range([0, Math.max(maxTickNumber, maxLength) * tickStep]);
		};

		groupScale.range(chartState.selectedView === viewOptions[0] ?
				[(1 - closeFactor) * height - padding[2], padding[0] + height * closeFactor] :
				[padding[0], height - padding[2]])
			.domain(chartState.selectedView === viewOptions[0] ? dataAggregated.map(e => e.key) :
				dataByGroup.map(e => "eg" + e.emergencyGroup));

		if (chartState.selectedView === viewOptions[0]) {
			yScale.range([stackedHeightAggregate - stackedPadding[2], stackedPadding[0] + (dataAggregated.length - 1) * stackGap])
				.domain([0, d3.max(data, d => d.total)]);
		} else {
			yScale.range([stackedHeight - stackedPaddingByGroup[2], stackedPaddingByGroup[0]])
				.domain([0, d3.max(dataByGroup.map(e => d3.max(e.groupRawData, f => f.total)))]);
		};

		areaGenerator.x(d => xScale(chartState.selectedYear.includes(allYearsOption) ? d.data.year : d.data.month));
		areaGeneratorZero.x(d => xScale(chartState.selectedYear.includes(allYearsOption) ? d.data.year : d.data.month));

		const syncTransition = d3.transition()
			.delay(delay)
			.duration(duration)
			.on("start", () => {
				dropdownDiv.style("pointer-events", "none");
			})
			.on("end", () => {
				dropdownDiv.style("pointer-events", "all");
			});

		d3.entries(lists.emergencyTypesInGroups).forEach((entry, i) => {
			colorSubScale[entry.key] = d3.scaleOrdinal()
				.domain(entry.value.filter(e => inDataLists.emergencyTypesInData.includes(e)))
				.range(colorArray[i].sub);
		});

		const noData = !dataAggregated.length && !dataByGroup.length ? [true] : [];

		const noDataText = mainGroup.selectAll("." + classPrefix + "noDataText")
			.data(noData);

		const noDataTextExit = noDataText.exit().remove();

		const noDataTextEnter = noDataText.enter()
			.append("text")
			.attr("class", classPrefix + "noDataText")
			.attr("x", chartWidth / 2)
			.attr("y", noDataTextPadding)
			.text("No data for the selection")
			.style("opacity", 0)
			.transition(syncTransition)
			.style("opacity", 1);

		if (!chartState.selectedYear.includes(allYearsOption)) {
			aggregatedChartArea.transition(syncTransition)
				.attr("transform", "translate(0,0)");
		};

		//Aggregated view

		let leftArrowGroupAggregated = mainGroup.selectAll("." + classPrefix + "leftArrowGroupAggregated")
			.data(dataAggregated.length && chartState.selectedYear.includes(allYearsOption) ? [true] : []);

		const leftArrowGroupAggregatedExit = leftArrowGroupAggregated.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const leftArrowGroupAggregatedEnter = leftArrowGroupAggregated.enter()
			.append("g")
			.attr("class", classPrefix + "leftArrowGroupAggregated")
			.style("opacity", 0)
			.style("cursor", "pointer")
			.attr("transform", "translate(" + (stackedPadding[3] - arrowPaddingLeft) + "," + (stackedHeightAggregate - stackedPadding[2] - arrowCircleRadius / 2) + ")");

		const leftArrowCircle = leftArrowGroupAggregatedEnter.append("circle")
			.style("fill", unBlue)
			.attr("r", arrowCircleRadius);

		const leftArrowChevron = leftArrowGroupAggregatedEnter.append("text")
			.attr("class", classPrefix + "arrowChevron")
			.text("\u2039");

		leftArrowGroupAggregated = leftArrowGroupAggregatedEnter.merge(leftArrowGroupAggregated);

		leftArrowGroupAggregated.transition(syncTransition)
			.style("opacity", 1);

		let rightArrowGroupAggregated = mainGroup.selectAll("." + classPrefix + "rightArrowGroupAggregated")
			.data(dataAggregated.length && chartState.selectedYear.includes(allYearsOption) ? [true] : []);

		const rightArrowGroupAggregatedExit = rightArrowGroupAggregated.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const rightArrowGroupAggregatedEnter = rightArrowGroupAggregated.enter()
			.append("g")
			.attr("class", classPrefix + "rightArrowGroupAggregated")
			.style("opacity", 0)
			.style("cursor", "pointer")
			.attr("transform", "translate(" + (chartWidth - stackedPadding[1] + arrowPaddingRight) + "," + (stackedHeightAggregate - stackedPadding[2] - arrowCircleRadius / 2) + ")");

		const rightArrowCircle = rightArrowGroupAggregatedEnter.append("circle")
			.style("fill", unBlue)
			.attr("r", arrowCircleRadius);

		const rightArrowChevron = rightArrowGroupAggregatedEnter.append("text")
			.attr("class", classPrefix + "arrowChevron")
			.text("\u203a");

		rightArrowGroupAggregated = rightArrowGroupAggregatedEnter.merge(rightArrowGroupAggregated);

		rightArrowGroupAggregated.transition(syncTransition)
			.style("opacity", 1);

		if (chartState.selectedYear.includes(allYearsOption)) {
			aggregatedChartArea.transition(syncTransition)
				.attr("transform", "translate(" +
					(-(xScale.range()[1] - maxTickNumber * tickStep)) +
					",0)")
				.on("end", checkCurrentTranslate);
		};

		let xAxisGroupAggregated = aggregatedChartArea.selectAll("." + classPrefix + "xAxisGroupAggregated")
			.data(dataAggregated.length ? [true] : []);

		const xAxisGroupAggregatedExit = xAxisGroupAggregated.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		xAxisGroupAggregated = xAxisGroupAggregated.enter()
			.append("g")
			.attr("class", classPrefix + "xAxisGroupAggregated")
			.merge(xAxisGroupAggregated)
			.attr("transform", "translate(0," + yScale.range()[0] + ")");

		xAxisGroupAggregated.transition(syncTransition)
			.call(xAxis);

		let areaPaths = aggregatedChartArea.selectAll("." + classPrefix + "areaPaths")
			.data(dataAggregated, d => d.key);

		const areaPathsExit = areaPaths.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const areaPathsEnter = areaPaths.enter()
			.append("path")
			.attr("class", classPrefix + "areaPaths")
			.style("fill", d => colorScale(d.key))
			.attr("d", (d, i) => {
				return areaGeneratorZero(d);
			});

		areaPaths = areaPathsEnter.merge(areaPaths);

		areaPaths.order();

		if (sameDataLength) {
			areaPaths.transition(syncTransition)
				.attr("d", (d, i, n) => {
					let thisIndex = [];
					areaGenerator.y0((e, j) => {
							for (let index = 0; index < d.index; index++) {
								const foundData = dataAggregated.find(e => e.index === index);
								if ((foundData[j][0] !== foundData[j][1]) ||
									(foundData[j - 1] && (foundData[j - 1][0] !== foundData[j - 1][1])) ||
									(foundData[j + 1] && (foundData[j + 1][0] !== foundData[j + 1][1]))) thisIndex[j] = (thisIndex[j] || 0) + 1;
							};
							return yScale(e[0]) - (thisIndex[j] || 0) * stackGap
						})
						.y1((e, j) => yScale(e[1]) - (thisIndex[j] || 0) * stackGap);
					return areaGenerator(d);
				});
		} else {
			areaPaths.transition(syncTransition)
				.attrTween("d", (d, i, n) => {
					let thisIndex = [];
					areaGenerator.y0((e, j) => {
							for (let index = 0; index < d.index; index++) {
								const foundData = dataAggregated.find(e => e.index === index);
								if ((foundData[j][0] !== foundData[j][1]) ||
									(foundData[j - 1] && (foundData[j - 1][0] !== foundData[j - 1][1])) ||
									(foundData[j + 1] && (foundData[j + 1][0] !== foundData[j + 1][1]))) thisIndex[j] = (thisIndex[j] || 0) + 1;
							};
							return yScale(e[0]) - (thisIndex[j] || 0) * stackGap
						})
						.y1((e, j) => yScale(e[1]) - (thisIndex[j] || 0) * stackGap);
					return pathTween(areaGenerator(d), precision, n[i])();
				});
		};

		let yAxisGroupAggregated = mainGroup.selectAll("." + classPrefix + "yAxisGroupAggregated")
			.data(dataAggregated.length ? [true] : []);

		const yAxisGroupAggregatedExit = yAxisGroupAggregated.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		yAxisGroupAggregated = yAxisGroupAggregated.enter()
			.append("g")
			.attr("class", classPrefix + "yAxisGroupAggregated")
			.merge(yAxisGroupAggregated)
			.attr("transform", "translate(" + stackedPadding[3] + ",0)");

		yAxisGroupAggregated.transition(syncTransition)
			.call(yAxis);

		yAxisGroupAggregated.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		let totalLabel = aggregatedChartArea.selectAll("." + classPrefix + "totalLabel")
			.data(chartState.selectedView === viewOptions[0] ? data.filter((d, i) => d.total && !(i % totalLabelRemainder)) : [],
				d => chartState.selectedYear.includes(allYearsOption) ? d.year : d.month);

		const totalLabelExit = totalLabel.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const totalLabelEnter = totalLabel.enter()
			.append("text")
			.attr("class", classPrefix + "totalLabel")
			.attr("x", d => xScale(chartState.selectedYear.includes(allYearsOption) ? d.year : d.month))
			.attr("y", d => yScale(0) - totalLabelPadding - (inDataLists.emergencyGroupsInData.length * stackGap))
			.style("opacity", 0)
			.text(d => "$0");

		totalLabel = totalLabelEnter.merge(totalLabel);

		totalLabel.transition(syncTransition)
			.style("opacity", 1)
			.attr("x", d => xScale(chartState.selectedYear.includes(allYearsOption) ? d.year : d.month))
			.attr("y", d => yScale(d.total) - totalLabelPadding - (inDataLists.emergencyGroupsInData.length * stackGap))
			.tween("text", (d, i, n) => {
				const node = n[i];
				const interpolator = d3.interpolate(reverseFormat(node.textContent.substring(1)) || 0, d.total);
				return t => node.textContent = "$" + formatSIFloat(interpolator(t));
			});

		const legendTotalData = chartState.selectedView === viewOptions[0] ?
			data.reduce((acc, curr) => {
				for (let key in acc) {
					acc[key] += curr[key];
				};
				return acc;
			}, groupScale.domain().reduce((acc, curr) => {
				acc[curr] = 0;
				return acc;
			}, {})) : data.reduce((acc, curr) => {
				acc["eg" + curr.emergencyGroup] = curr.total;
				return acc;
			}, {});

		let legendGroup = mainGroup.selectAll("." + classPrefix + "legendGroup")
			.data(groupScale.domain(), d => d);

		const legendGroupExit = legendGroup.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const legendGroupEnter = legendGroup.enter()
			.append("g")
			.attr("class", classPrefix + "legendGroup")
			.attr("transform", d => "translate(0," + (groupScale(d) + (chartState.selectedView === viewOptions[0] ? groupScale.bandwidth() / 2 : stackedPaddingByGroup[0])) + ")");

		const legendTextValue = legendGroupEnter.append("text")
			.attr("class", classPrefix + "legendGroupValue")
			.attr("x", legendTextPadding + legendHorPadding)
			.attr("y", "-0.6em")
			.text(d => "$" + formatSIFloat(legendTotalData[d]));

		const legendTextName = legendGroupEnter.append("text")
			.attr("class", classPrefix + "legendGroupName")
			.attr("x", legendTextPadding + legendHorPadding)
			.attr("dy", "0.6em")
			.text(d => lists.emergencyGroupNames[extractNum(d)]);

		const legendIcon = legendGroupEnter.append("image")
			.attr("x", legendTextPadding - iconSize - legendHorPadding)
			.attr("y", -iconSize / 2)
			.attr("href", d => emergencyIconsData[extractNum(d)])
			.attr("width", iconSize)
			.attr("height", iconSize);

		legendGroup = legendGroupEnter.merge(legendGroup);

		legendGroup.style("cursor", chartState.selectedView === viewOptions[0] ? "pointer" : "default")
			.transition(syncTransition)
			.attr("transform", d => "translate(0," + (groupScale(d) + (chartState.selectedView === viewOptions[0] ? groupScale.bandwidth() / 2 : stackedPaddingByGroup[0] + legendGroupPaddingByGroup)) + ")")
			.select("." + classPrefix + "legendGroupValue")
			.tween("text", (d, i, n) => {
				const node = n[i];
				const interpolator = d3.interpolate(reverseFormat(node.textContent.substring(1)) || 0, legendTotalData[d]);
				return t => node.textContent = "$" + formatSIFloat(interpolator(t));
			});

		legendGroup.on("mouseover", (_, i, n) => {
			if (chartState.selectedView === viewOptions[1]) return;
			tooltip.style("display", "block")
				.html(null);

			const innerTooltip = tooltip.append("div")
				.style("max-width", "180px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltip.html("Click to send this emergency group to the baseline.");

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = n[i].getBoundingClientRect();
			const tooltipSize = tooltip.node().getBoundingClientRect();

			tooltip.style("left", (thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
					"0px" : thisSize.left + thisSize.width / 2 - tooltipSize.width / 2 - containerSize.left + "px")
				.style("top", thisSize.top - containerSize.top + thisSize.height + 4 + "px");
		}).on("mouseout", () => {
			tooltip.html(null)
				.style("display", "none");
		}).on("click", (d, i, n) => {
			if (chartState.selectedView === viewOptions[1]) return;
			const newBaseline = inDataLists.emergencyGroupsInData.map(e => "eg" + e).indexOf(d)
			if (chartState.baseline !== newBaseline) {
				chartState.baseline = newBaseline;
				drawStackedAreaChart(data);
			};
		});

		let numberOfFundsTitle = mainGroup.selectAll("." + classPrefix + "numberOfFundsTitle")
			.data(chartState.selectedView === viewOptions[0] ? [true] : []);

		const numberOfFundsTitleExit = numberOfFundsTitle.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const numberOfFundsTitleEnter = numberOfFundsTitle.enter()
			.append("text")
			.attr("class", classPrefix + "numberOfFundsTitle")
			.attr("x", stackedPadding[3] - numberTitlesPadding)
			.attr("y", yScale.range()[0] + fundsNumberPadding)
			.text("Number of countries");

		let numberOfFunds = aggregatedChartArea.selectAll("." + classPrefix + "numberOfFunds")
			.data(chartState.selectedView === viewOptions[0] ? data : [],
				d => chartState.selectedYear.includes(allYearsOption) ? d.year : d.month);

		const numberOfFundsExit = numberOfFunds.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const numberOfFundsEnter = numberOfFunds.enter()
			.append("text")
			.attr("class", classPrefix + "numberOfFunds")
			.attr("x", d => xScale(chartState.selectedYear.includes(allYearsOption) ? d.year : d.month))
			.attr("y", yScale.range()[0] + fundsNumberPadding)
			.style("opacity", 0)
			.text("0");

		numberOfFunds = numberOfFundsEnter.merge(numberOfFunds);

		numberOfFunds.transition(syncTransition)
			.style("opacity", 1)
			.attr("x", d => xScale(chartState.selectedYear.includes(allYearsOption) ? d.year : d.month))
			.textTween((d, i, n) => {
				const prop = chartState.selectedYear.includes(allYearsOption) ? "yearValues" : "monthValues";
				return d3.interpolateRound(+n[i].textContent || 0, [...new Set(d[prop].map(e => e.CountryID))].length);
			});

		let rectOverlay = aggregatedChartArea.selectAll("." + classPrefix + "rectOverlay")
			.data(dataAggregated.length ? [true] : [])

		const rectOverlayExit = rectOverlay.exit()
			.remove();

		const rectOverlayEnter = rectOverlay.enter()
			.append("rect")
			.attr("class", classPrefix + "rectOverlay")
			.style("fill", "none")
			.attr("x", xScale.range()[0])
			.attr("width", xScale.range()[1] - xScale.range()[0])
			.attr("y", stackedPadding[0])
			.attr("height", yScale.range()[0] - stackedPadding[0]);

		rectOverlay = rectOverlayEnter.merge(rectOverlay);

		rectOverlay.raise()
			.attr("width", xScale.range()[1] - xScale.range()[0]);

		//by group view

		let byGroupContainer = mainGroup.selectAll("." + classPrefix + "byGroupContainer")
			.data(dataByGroup, d => d.emergencyGroup);

		const byGroupContainerExit = byGroupContainer.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const byGroupContainerEnter = byGroupContainer.enter()
			.append("g")
			.attr("class", classPrefix + "byGroupContainer")
			.attr("pointer-events", "all")
			.attr("transform", d => "translate(0," + groupScale("eg" + d.emergencyGroup) + ")");

		byGroupContainer = byGroupContainerEnter.merge(byGroupContainer);

		byGroupContainer.transition(syncTransition)
			.attr("transform", d => "translate(0," + groupScale("eg" + d.emergencyGroup) + ")");

		byGroupContainer.each((d, i, n) => {
			localVariable.set(n[i], d.emergencyGroup);
		});

		let clipPathGroupByGroup = byGroupContainer.selectAll("." + classPrefix + "clipPathGroupByGroup")
			.data(d => [d]);

		clipPathGroupByGroup = clipPathGroupByGroup.enter()
			.append("g")
			.attr("class", classPrefix + "clipPathGroupByGroup")
			.attr("transform", "translate(" + stackedPaddingByGroup[3] + ",0)")
			.attr("clip-path", "url(#" + classPrefix + "clipPathByGroup)")
			.merge(clipPathGroupByGroup);

		let chartAreaByGroup = clipPathGroupByGroup.selectAll("." + classPrefix + "chartAreaByGroup")
			.data(d => [d]);

		chartAreaByGroup = chartAreaByGroup.enter()
			.append("g")
			.attr("class", classPrefix + "chartAreaByGroup")
			.attr("transform", "translate(0,0)")
			.merge(chartAreaByGroup);
		//.style("cursor", "ew-resize");

		if (!chartState.selectedYear.includes(allYearsOption)) {
			chartAreaByGroup.transition(syncTransition)
				.attr("transform", "translate(0,0)");
		};

		let leftArrowGroupByGroup = byGroupContainer.selectAll("." + classPrefix + "leftArrowGroupByGroup")
			.data(dataByGroup.length && chartState.selectedYear.includes(allYearsOption) ? [true] : []);

		const leftArrowGroupByGroupExit = leftArrowGroupByGroup.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const leftArrowGroupByGroupEnter = leftArrowGroupByGroup.enter()
			.append("g")
			.attr("class", classPrefix + "leftArrowGroupByGroup")
			.style("opacity", 0)
			.style("cursor", "pointer")
			.attr("transform", "translate(" + (stackedPaddingByGroup[3] - arrowPaddingLeft) + "," + (stackedHeight - stackedPaddingByGroup[2] - arrowCircleRadiusByGroup / 2) + ")");

		const leftArrowCircleByGroup = leftArrowGroupByGroupEnter.append("circle")
			.style("fill", unBlue)
			.attr("r", arrowCircleRadiusByGroup);

		const leftArrowChevronByGroup = leftArrowGroupByGroupEnter.append("text")
			.attr("class", classPrefix + "arrowChevronByGroup")
			.text("\u2039");

		leftArrowGroupByGroup = leftArrowGroupByGroupEnter.merge(leftArrowGroupByGroup);

		leftArrowGroupByGroup.transition(syncTransition)
			.style("opacity", 1);

		let rightArrowGroupByGroup = byGroupContainer.selectAll("." + classPrefix + "rightArrowGroupByGroup")
			.data(dataByGroup.length && chartState.selectedYear.includes(allYearsOption) ? [true] : []);

		const rightArrowGroupByGroupExit = rightArrowGroupByGroup.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const rightArrowGroupByGroupEnter = rightArrowGroupByGroup.enter()
			.append("g")
			.attr("class", classPrefix + "rightArrowGroupByGroup")
			.style("opacity", 0)
			.style("cursor", "pointer")
			.attr("transform", "translate(" + (chartWidth - stackedPaddingByGroup[1] + arrowPaddingRight) + "," + (stackedHeight - stackedPaddingByGroup[2] - arrowCircleRadiusByGroup / 2) + ")");

		const rightArrowCircleByGroup = rightArrowGroupByGroupEnter.append("circle")
			.style("fill", unBlue)
			.attr("r", arrowCircleRadiusByGroup);

		const rightArrowChevronByGroup = rightArrowGroupByGroupEnter.append("text")
			.attr("class", classPrefix + "arrowChevronByGroup")
			.text("\u203a");

		rightArrowGroupByGroup = rightArrowGroupByGroupEnter.merge(rightArrowGroupByGroup);

		rightArrowGroupByGroup.transition(syncTransition)
			.style("opacity", 1);

		if (chartState.selectedYear.includes(allYearsOption)) {
			chartAreaByGroup.transition(syncTransition)
				.attr("transform", "translate(" +
					(-(xScale.range()[1] - maxTickNumber * tickStep)) +
					",0)")
				.on("end", checkCurrentTranslateByGroup);
		};

		let xAxisGroupByGroup = chartAreaByGroup.selectAll("." + classPrefix + "xAxisGroupByGroup")
			.data(dataByGroup.length ? [true] : []);

		const xAxisGroupByGroupExit = xAxisGroupByGroup.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		xAxisGroupByGroup = xAxisGroupByGroup.enter()
			.append("g")
			.attr("class", classPrefix + "xAxisGroupByGroup")
			.merge(xAxisGroupByGroup)
			.attr("transform", (d, i, n) => "translate(0," + yScale.range()[0] + ")");

		xAxisGroupByGroup.transition(syncTransition)
			.call(xAxis);

		let areaPathsByGroup = chartAreaByGroup.selectAll("." + classPrefix + "areaPathsByGroup")
			.data(d => d.emergencyGroupData, e => e.key);

		const areaPathsByGroupExit = areaPathsByGroup.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const areaPathsByGroupEnter = areaPathsByGroup.enter()
			.append("path")
			.attr("class", classPrefix + "areaPathsByGroup")
			.style("fill", (d, i, n) => colorSubScale[localVariable.get(n[i])](+extractNum(d.key)))
			.attr("d", (d, i, n) => {
				return areaGeneratorZero(d);
			});

		areaPathsByGroup = areaPathsByGroupEnter.merge(areaPathsByGroup);

		areaPathsByGroup.order();

		if (sameDataLength) {
			areaPathsByGroup.transition(syncTransition)
				.attr("d", (d, i, n) => {
					let thisIndex = [];
					const thisGroup = dataByGroup.find(a => a.emergencyGroup === localVariable.get(n[i]));
					areaGenerator.y0((e, j) => {
							for (let index = 0; index < d.index; index++) {
								const foundData = thisGroup.emergencyGroupData.find(e => e.index === index);
								if ((foundData[j][0] !== foundData[j][1]) ||
									(foundData[j - 1] && (foundData[j - 1][0] !== foundData[j - 1][1])) ||
									(foundData[j + 1] && (foundData[j + 1][0] !== foundData[j + 1][1]))) thisIndex[j] = (thisIndex[j] || 0) + 1;
							};
							return yScale(e[0]) - (thisIndex[j] || 0) * stackGap
						})
						.y1((e, j) => yScale(e[1]) - (thisIndex[j] || 0) * stackGap);
					return areaGenerator(d);
				});
		} else {
			areaPathsByGroup.transition(syncTransition)
				.attrTween("d", (d, i, n) => {
					let thisIndex = [];
					const thisGroup = dataByGroup.find(a => a.emergencyGroup === localVariable.get(n[i]));
					areaGenerator.y0((e, j) => {
							for (let index = 0; index < d.index; index++) {
								const foundData = thisGroup.emergencyGroupData.find(e => e.index === index);
								if ((foundData[j][0] !== foundData[j][1]) ||
									(foundData[j - 1] && (foundData[j - 1][0] !== foundData[j - 1][1])) ||
									(foundData[j + 1] && (foundData[j + 1][0] !== foundData[j + 1][1]))) thisIndex[j] = (thisIndex[j] || 0) + 1;
							};
							return yScale(e[0]) - (thisIndex[j] || 0) * stackGap
						})
						.y1((e, j) => yScale(e[1]) - (thisIndex[j] || 0) * stackGap);
					return pathTween(areaGenerator(d), precision, n[i])();
				});
		};

		let yAxisGroupByGroup = byGroupContainer.selectAll("." + classPrefix + "yAxisGroupByGroup")
			.data(dataByGroup.length ? [true] : []);

		const yAxisGroupByGroupExit = yAxisGroupByGroup.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		yAxisGroupByGroup = yAxisGroupByGroup.enter()
			.append("g")
			.attr("class", classPrefix + "yAxisGroupByGroup")
			.merge(yAxisGroupByGroup)
			.attr("transform", "translate(" + stackedPadding[3] + ",0)");

		yAxisGroupByGroup.transition(syncTransition)
			.call(yAxisByGroup);

		yAxisGroupByGroup.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		let totalLabelByGroup = chartAreaByGroup.selectAll("." + classPrefix + "totalLabelByGroup")
			.data(d => chartState.selectedView === viewOptions[1] ? d.groupRawData.filter((d, i) => d.total && !(i % totalLabelRemainder)) : [],
				d => chartState.selectedYear.includes(allYearsOption) ? d.year : d.month);

		const totalLabelByGroupExit = totalLabelByGroup.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const totalLabelByGroupEnter = totalLabelByGroup.enter()
			.append("text")
			.attr("class", classPrefix + "totalLabelByGroup")
			.attr("x", d => xScale(chartState.selectedYear.includes(allYearsOption) ? d.year : d.month))
			.attr("y", d => {
				const types = d3.keys(d).filter(e => e.includes("et"));
				return yScale(0) - totalLabelPadding - ((types.length - 1) * stackGap);
			})
			.style("opacity", 0)
			.text(d => "$0");

		totalLabelByGroup = totalLabelByGroupEnter.merge(totalLabelByGroup);

		totalLabelByGroup.transition(syncTransition)
			.style("opacity", 1)
			.attr("x", d => xScale(chartState.selectedYear.includes(allYearsOption) ? d.year : d.month))
			.attr("y", d => {
				const types = d3.keys(d).filter(e => e.includes("et"));
				return yScale(d.total) - totalLabelPadding - ((types.length - 1) * stackGap);
			})
			.tween("text", (d, i, n) => {
				const node = n[i];
				const interpolator = d3.interpolate(reverseFormat(node.textContent.substring(1)) || 0, d.total);
				return t => node.textContent = "$" + formatSIFloat(interpolator(t));
			});

		let sublegendGroup = legendGroup.selectAll("." + classPrefix + "sublegendGroup")
			.data(chartState.selectedView === viewOptions[0] ? [] :
				d => dataByGroup.find(e => "eg" + e.emergencyGroup === d).emergencyGroupData.sort((a, b) => a.index - b.index).map(e => ({
					type: e.key,
					group: d
				})), d => d.type);

		const sublegendGroupExit = sublegendGroup.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const sublegendGroupEnter = sublegendGroup.enter()
			.append("g")
			.attr("class", classPrefix + "sublegendGroup")
			.attr("transform", (_, i, n) => "translate(0," + (sublegendGroupVertPadding + ((n.length - 1 - i) * sublegendGroupSize)) + ")");

		const sublegendGroupEnterText = sublegendGroupEnter.append("text")
			.attr("x", legendTextPadding + legendHorPadding + sublegendGroupPadding)
			.text(d => lists.emergencyTypeNames[extractNum(d.type)].includes(" - ") ?
				lists.emergencyTypeNames[extractNum(d.type)].split(" - ")[1] :
				lists.emergencyTypeNames[extractNum(d.type)]);

		const sublegendGroupEnterBullet = sublegendGroupEnter.append("circle")
			.attr("r", bulletSize)
			.attr("cx", 2 * legendHorPadding)
			.style("fill", d => colorSubScale[extractNum(d.group)](extractNum(d.type)));

		sublegendGroup = sublegendGroupEnter.merge(sublegendGroup);

		sublegendGroup.style("fill", d => colorSubScale[extractNum(d.group)](extractNum(d.type)))
			.transition(syncTransition)
			.attr("transform", (_, i, n) => "translate(0," + (sublegendGroupVertPadding + ((n.length - 1 - i) * sublegendGroupSize)) + ")");

		sublegendGroup.on("mouseover", (_, i, n) => {
			tooltip.style("display", "block")
				.html(null);

			const innerTooltip = tooltip.append("div")
				.style("max-width", "180px")
				.attr("id", classPrefix + "innerTooltipDiv");

			innerTooltip.html("Click to send this emergency type to the baseline.");

			const containerSize = containerDiv.node().getBoundingClientRect();
			const thisSize = n[i].getBoundingClientRect();
			const tooltipSize = tooltip.node().getBoundingClientRect();

			tooltip.style("left", (thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
					"0px" : thisSize.left + thisSize.width / 2 - tooltipSize.width / 2 - containerSize.left + "px")
				.style("top", thisSize.top - containerSize.top + thisSize.height + 4 + "px");
		}).on("mouseout", () => {
			tooltip.html(null)
				.style("display", "none");
		}).on("click", d => {
			const thisIndex = lists.emergencyTypesInGroups[extractNum(d.group)]
				.filter(e => inDataLists.emergencyTypesInData.includes(e)).indexOf(+extractNum(d.type));
			if (clickedGroup[extractNum(d.group)] !== thisIndex) {
				clickedGroup[extractNum(d.group)] = thisIndex;
				drawStackedAreaChart(data);
			};
		});

		let numberOfFundsTitleByGroup = byGroupContainer.selectAll("." + classPrefix + "numberOfFundsTitleByGroup")
			.data(chartState.selectedView === viewOptions[1] ? [true] : []);

		const numberOfFundsTitleByGroupExit = numberOfFundsTitleByGroup.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const numberOfFundsTitleByGroupEnter = numberOfFundsTitleByGroup.enter()
			.append("text")
			.attr("class", classPrefix + "numberOfFundsTitleByGroup")
			.attr("x", stackedPadding[3] - numberTitlesPadding)
			.attr("y", yScale.range()[0] + fundsNumberPaddingByGroup)
			.text("# of countries");

		let numberOfFundsByGroup = chartAreaByGroup.selectAll("." + classPrefix + "numberOfFundsByGroup")
			.data(d => chartState.selectedView === viewOptions[1] ? d.groupRawData : [],
				d => chartState.selectedYear.includes(allYearsOption) ? d.year : d.month);

		const numberOfFundsByGroupExit = numberOfFundsByGroup.exit()
			.transition(syncTransition)
			.style("opacity", 0)
			.remove();

		const numberOfFundsByGroupEnter = numberOfFundsByGroup.enter()
			.append("text")
			.attr("class", classPrefix + "numberOfFundsByGroup")
			.attr("x", d => xScale(chartState.selectedYear.includes(allYearsOption) ? d.year : d.month))
			.attr("y", yScale.range()[0] + fundsNumberPaddingByGroup)
			.style("opacity", 0)
			.text("0");

		numberOfFundsByGroup = numberOfFundsByGroupEnter.merge(numberOfFundsByGroup);

		numberOfFundsByGroup.transition(syncTransition)
			.style("opacity", 1)
			.attr("x", d => xScale(chartState.selectedYear.includes(allYearsOption) ? d.year : d.month))
			.textTween((d, i, n) => {
				const prop = chartState.selectedYear.includes(allYearsOption) ? "yearValues" : "monthValues";
				return d3.interpolateRound(+n[i].textContent || 0, [...new Set(d[prop].map(e => e.CountryID))].length);
			});

		let rectOverlayByGroup = chartAreaByGroup.selectAll("." + classPrefix + "rectOverlayByGroup")
			.data(d => [d.groupRawData])

		rectOverlayByGroup = rectOverlayByGroup.enter()
			.append("rect")
			.attr("class", classPrefix + "rectOverlayByGroup")
			.style("fill", "none")
			.attr("x", xScale.range()[0])
			.attr("y", stackedPaddingByGroup[0])
			.attr("height", yScale.range()[0] - stackedPaddingByGroup[0])
			.merge(rectOverlayByGroup)
			.attr("width", xScale.range()[1] - xScale.range()[0])
			.raise();

		//listeners

		leftArrowGroupAggregated.on("click", () => {
			const currentTranslate = parseTransform(aggregatedChartArea.attr("transform"))[0];
			aggregatedChartArea.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.min(0, (currentTranslate + tickMove * tickStep)) + ",0)")
				.on("end", checkArrows);
		});

		rightArrowGroupAggregated.on("click", () => {
			const currentTranslate = parseTransform(aggregatedChartArea.attr("transform"))[0];
			aggregatedChartArea.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.max(-(xScale.range()[1] - maxTickNumber * tickStep),
					(-(Math.abs(currentTranslate) + tickMove * tickStep))) + ",0)")
				.on("end", checkArrows);
		});

		function checkArrows() {
			const currentTranslate = parseTransform(aggregatedChartArea.attr("transform"))[0];

			if (currentTranslate === 0) {
				leftArrowGroupAggregated.select("circle").style("fill", arrowFadeColor);
				leftArrowGroupAggregated.attr("pointer-events", "none");
			} else {
				leftArrowGroupAggregated.select("circle").style("fill", unBlue);
				leftArrowGroupAggregated.attr("pointer-events", "all");
			};

			if (~~Math.abs(currentTranslate) >= ~~(xScale.range()[1] - maxTickNumber * tickStep)) {
				rightArrowGroupAggregated.select("circle").style("fill", arrowFadeColor);
				rightArrowGroupAggregated.attr("pointer-events", "none");
			} else {
				rightArrowGroupAggregated.select("circle").style("fill", unBlue);
				rightArrowGroupAggregated.attr("pointer-events", "all");
			};
		};

		function checkCurrentTranslate() {
			const currentTranslate = parseTransform(aggregatedChartArea.attr("transform"))[0];
			if (currentTranslate === 0) {
				leftArrowGroupAggregated.select("circle").style("fill", arrowFadeColor);
				leftArrowGroupAggregated.attr("pointer-events", "none");
			};
			if (~~Math.abs(currentTranslate) >= ~~(xScale.range()[1] - maxTickNumber * tickStep)) {
				rightArrowGroupAggregated.select("circle").style("fill", arrowFadeColor);
				rightArrowGroupAggregated.attr("pointer-events", "none");
			};
		};

		leftArrowGroupByGroup.on("click", (_, i, n) => {
			const thisChartAreaGroup = d3.select(n[i].parentNode).select("." + classPrefix + "chartAreaByGroup");
			const currentTranslate = parseTransform(thisChartAreaGroup.attr("transform"))[0];
			thisChartAreaGroup.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.min(0, (currentTranslate + tickMove * tickStep)) + ",0)")
				.on("end", () => checkArrowsByGroup(thisChartAreaGroup));
		});

		rightArrowGroupByGroup.on("click", (_, i, n) => {
			const thisChartAreaGroup = d3.select(n[i].parentNode).select("." + classPrefix + "chartAreaByGroup");
			const currentTranslate = parseTransform(thisChartAreaGroup.attr("transform"))[0];
			thisChartAreaGroup.transition()
				.duration(duration)
				.attr("transform", "translate(" + Math.max(-(xScale.range()[1] - maxTickNumber * tickStep),
					(-(Math.abs(currentTranslate) + tickMove * tickStep))) + ",0)")
				.on("end", () => checkArrowsByGroup(thisChartAreaGroup));
		});

		function checkArrowsByGroup(thisChartAreaGroup) {
			const currentTranslate = parseTransform(thisChartAreaGroup.attr("transform"))[0];
			const thisLeftArrow = d3.select(thisChartAreaGroup.node().parentNode.parentNode).select("." + classPrefix + "leftArrowGroupByGroup");
			const thisRightArrow = d3.select(thisChartAreaGroup.node().parentNode.parentNode).select("." + classPrefix + "rightArrowGroupByGroup");

			if (currentTranslate === 0) {
				thisLeftArrow.select("circle").style("fill", arrowFadeColor);
				thisLeftArrow.attr("pointer-events", "none");
			} else {
				thisLeftArrow.select("circle").style("fill", unBlue);
				thisLeftArrow.attr("pointer-events", "all");
			};

			if (~~Math.abs(currentTranslate) >= ~~(xScale.range()[1] - maxTickNumber * tickStep)) {
				thisRightArrow.select("circle").style("fill", arrowFadeColor);
				thisRightArrow.attr("pointer-events", "none");
			} else {
				thisRightArrow.select("circle").style("fill", unBlue);
				thisRightArrow.attr("pointer-events", "all");
			};
		};

		function checkCurrentTranslateByGroup() {
			const currentTranslate = parseTransform(chartAreaByGroup.attr("transform"))[0];
			if (currentTranslate === 0) {
				leftArrowGroupByGroup.select("circle").style("fill", arrowFadeColor);
				leftArrowGroupByGroup.attr("pointer-events", "none");
			};
			if (~~Math.abs(currentTranslate) >= ~~(xScale.range()[1] - maxTickNumber * tickStep)) {
				rightArrowGroupByGroup.select("circle").style("fill", arrowFadeColor);
				rightArrowGroupByGroup.attr("pointer-events", "none");
			};
		};

		rectOverlay.on("mousemove", (_, i, n) => {
			currentHoveredElement = n[i];

			let currentTranslate = 0;

			if (chartState.selectedYear.includes(allYearsOption)) currentTranslate = parseTransform(aggregatedChartArea.attr("transform"))[0];

			const mousePosition = d3.mouse(n[i]);

			const xValue = xScale.invert(mousePosition[0]);

			if (xValue === previousXValue && tooltip.style("display") === "block") return;

			previousXValue = xValue;

			const thisDatum = data.find(e => chartState.selectedYear.includes(allYearsOption) ? e.year === xValue : e.month === xValue);

			if (thisDatum.total) {
				generateTooltip(thisDatum);
			} else {
				dataTooltip.style("display", "none")
					.html(null);
				return;
			};

			const thisBox = n[i].getBoundingClientRect();
			const svgBox = svg.node().getBoundingClientRect();
			const containerBox = containerDiv.node().getBoundingClientRect();
			const tooltipBox = dataTooltip.node().getBoundingClientRect();
			const thisOffsetTop = svgBox.top - containerBox.top - tooltipBox.height - tooltipVerticalPadding + ((yScale(thisDatum.total) - totalLabelPadding - (inDataLists.emergencyGroupsInData.length * stackGap)) / (width / containerBox.width));
			const thisElementRealYPos = (stackedPadding[3] + xScale(xValue) - Math.abs(currentTranslate)) / (width / containerBox.width);
			const thisOffsetLeft = thisElementRealYPos - tooltipBox.width / 2;

			dataTooltip.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");

		}).on("mouseout", () => {
			if (isSnapshotTooltipVisible) return;
			currentHoveredElement = null;
			dataTooltip.style("display", "none")
				.html(null);
		});

		rectOverlayByGroup.on("mousemove", (d, i, n) => {
			currentHoveredElement = n[i];

			let currentTranslate = 0;

			if (chartState.selectedYear.includes(allYearsOption)) currentTranslate = parseTransform(d3.select(n[i].parentNode).attr("transform"))[0];

			const mousePosition = d3.mouse(n[i]);

			const xValue = xScale.invert(mousePosition[0]);

			if (xValue === previousXValue && tooltip.style("display") === "block") return;

			previousXValue = xValue;

			const thisDatum = d.find(e => chartState.selectedYear.includes(allYearsOption) ? e.year === xValue : e.month === xValue);

			if (thisDatum.total) {
				generateTooltip(thisDatum);
			} else {
				dataTooltip.style("display", "none")
					.html(null);
				return;
			};

			const thisBox = n[i].getBoundingClientRect();
			const containerBox = containerDiv.node().getBoundingClientRect();
			const tooltipBox = dataTooltip.node().getBoundingClientRect();
			const thisOffsetTop = thisBox.top - stackedPaddingByGroup[0] - containerBox.top - tooltipBox.height - tooltipVerticalPadding + ((yScale(thisDatum.total) - totalLabelPadding - (inDataLists.emergencyGroupsInData.length * stackGap)) / (width / containerBox.width));
			const thisElementRealYPos = (stackedPadding[3] + xScale(xValue) - Math.abs(currentTranslate)) / (width / containerBox.width);
			const thisOffsetLeft = thisElementRealYPos - tooltipBox.width / 2;

			dataTooltip.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");

		}).on("mouseout", () => {
			if (isSnapshotTooltipVisible) return;
			currentHoveredElement = null;
			dataTooltip.style("display", "none")
				.html(null);
		});

		function generateTooltip(thisDatum) {
			dataTooltip.style("display", "block")
				.html(null);

			const innerTooltip = dataTooltip.append("div")
				.style("min-width", innerTooltipWidth + "px")
				.attr("id", classPrefix + "innerTooltipDiv");

			const tooltipTopValue = innerTooltip.append("div")
				.attr("class", classPrefix + "tooltipTopValue")
				.html(formatSIFloat(thisDatum.total));

			const tooltipDate = innerTooltip.append("div")
				.attr("class", classPrefix + "tooltipDate")
				.html("Total allocations<br>in " + (chartState.selectedYear.includes(allYearsOption) ? thisDatum.year : monthFullNameFormat(monthShortNameParse(thisDatum.month))));

			if (chartState.selectedView === viewOptions[0]) {

				const tooltipData = d3.entries(thisDatum).filter(e => e.key.includes("eg") && e.value).sort((a, b) => b.value - a.value);

				const tooltipEmergencyGroups = innerTooltip.selectAll(null)
					.data(tooltipData)
					.enter()
					.append("div")
					.attr("class", classPrefix + "tooltipEmergencyGroups");

				tooltipEmergencyGroups.append("span")
					.attr("class", classPrefix + "tooltipCircle")
					.style("color", d => colorScale(d.key))
					.html("\u2b24");

				tooltipEmergencyGroups.append("span")
					.attr("class", classPrefix + "tooltipValue")
					.html(d => formatSIFloat(d.value));

				tooltipEmergencyGroups.append("span")
					.attr("class", classPrefix + "tooltipGroupName")
					.html(d => lists.emergencyGroupNames[extractNum(d.key)]);

			} else {

				const tooltipData = d3.entries(thisDatum).filter(e => e.key.includes("et") && e.value).sort((a, b) => b.value - a.value);

				const thisTypes = tooltipData.map(d => +extractNum(d.key));

				let thisGroup;

				for (const key in lists.emergencyTypesInGroups) {
					if (lists.emergencyTypesInGroups[key].some(e => thisTypes.includes(e))) thisGroup = key;
				};

				const tooltipEmergencyGroups = innerTooltip.selectAll(null)
					.data(tooltipData)
					.enter()
					.append("div")
					.attr("class", classPrefix + "tooltipEmergencyGroups");

				tooltipEmergencyGroups.append("span")
					.attr("class", classPrefix + "tooltipCircle")
					.style("color", d => colorSubScale[thisGroup](d.key))
					.html("\u2b24");

				tooltipEmergencyGroups.append("span")
					.attr("class", classPrefix + "tooltipValue")
					.html(d => formatSIFloat(d.value));

				tooltipEmergencyGroups.append("span")
					.attr("class", classPrefix + "tooltipGroupName")
					.html(d => lists.emergencyTypeNames[extractNum(d.key)].includes(" - ") ?
						lists.emergencyTypeNames[extractNum(d.key)].split(" - ")[1] :
						lists.emergencyTypeNames[extractNum(d.key)]);
			};

		};

		//end of drawStackedAreaChart
	};

	function resizeSvg(firstTime) {
		height = chartState.selectedView === viewOptions[0] ? stackedHeightAggregate + padding[0] + padding[2] :
			stackedHeight * (inDataLists.emergencyGroupsInData.length) + padding[0] + padding[2];
		if (firstTime) {
			svg.attr("viewBox", "0 0 " + width + " " + height);
		} else {
			svg.transition()
				.duration(shortDuration)
				.attr("viewBox", "0 0 " + width + " " + height);
		};
	};

	function preProcessData(rawDataAllocations) {
		rawDataAllocations.forEach(row => {
			if (!row.Budget) return;
			if (row.LastProjectApprovedDate) row.Year = row.LastProjectApprovedDate.getFullYear();
			if (!lists.fundsInAllDataList[row.CountryID] && lists.fundNames[row.CountryID]) lists.fundsInAllDataList[row.CountryID] = lists.fundNames[row.CountryID];
			if (!lists.regionsInAllDataList[lists.fundRegions[row.CountryID]] && lists.regionNames[lists.fundRegions[row.CountryID]]) lists.regionsInAllDataList[lists.fundRegions[row.CountryID]] = lists.regionNames[lists.fundRegions[row.CountryID]];
			if (!lists.emergencyGroupsInAllDataList[row.EmergencyGroupID] && lists.emergencyGroupNames[row.EmergencyGroupID]) lists.emergencyGroupsInAllDataList[row.EmergencyGroupID] = lists.emergencyGroupNames[row.EmergencyGroupID];
			if (!yearsArray.includes(row.Year)) yearsArray.push(row.Year);
		});
		yearsArray.sort((a, b) => a - b);
	};

	function processData(rawDataAllocations) {

		for (const arr in inDataLists) {
			inDataLists[arr].length = 0;
		};

		for (const arr in inSelectionLists) {
			inSelectionLists[arr].length = 0;
		};

		const data = [];

		rawDataAllocations.forEach(row => {

			//Filter for checking invalid data rows
			if (!lists.emergencyGroupsInAllDataList[row.EmergencyGroupID]) return;
			if (!row.LastProjectApprovedDate) return;
			if (!row.Budget) return;

			//populate inSelectionLists
			if (chartState.selectedYear.includes(row.Year) || chartState.selectedYear.includes(allYearsOption)) {
				if (chartState.selectedRegion.includes(lists.fundRegions[row.CountryID])) {
					if (!inSelectionLists.fundsInData.includes(row.CountryID)) inSelectionLists.fundsInData.push(row.CountryID);
					if (!inSelectionLists.emergencyGroupsInData.includes(row.EmergencyGroupID)) inSelectionLists.emergencyGroupsInData.push(row.EmergencyGroupID);
				};
				if (chartState.selectedFund.includes(row.CountryID)) {
					if (!inSelectionLists.emergencyGroupsInData.includes(row.EmergencyGroupID)) inSelectionLists.emergencyGroupsInData.push(row.EmergencyGroupID);
				};
				if (chartState.selectedEmergencyGroup.includes(row.EmergencyGroupID)) {
					if (!inSelectionLists.regionsInData.includes(lists.fundRegions[row.CountryID])) inSelectionLists.regionsInData.push(lists.fundRegions[row.CountryID]);
					if (!inSelectionLists.fundsInData.includes(row.CountryID)) inSelectionLists.fundsInData.push(row.CountryID);
				};
			};

			//Filter for selections
			if (!chartState.selectedEmergencyGroup.includes(row.EmergencyGroupID)) return;
			if (!chartState.selectedRegion.includes(lists.fundRegions[row.CountryID])) return;
			if (!chartState.selectedFund.includes(row.CountryID)) return;

			//populate inDataLists
			if (chartState.selectedYear.includes(row.Year) || chartState.selectedYear.includes(allYearsOption)) {
				if (!inDataLists.regionsInData.includes(lists.fundRegions[row.CountryID])) inDataLists.regionsInData.push(lists.fundRegions[row.CountryID]);
				if (!inDataLists.fundsInData.includes(row.CountryID)) inDataLists.fundsInData.push(row.CountryID);
				if (!inDataLists.emergencyGroupsInData.includes(row.EmergencyGroupID)) inDataLists.emergencyGroupsInData.push(row.EmergencyGroupID);
				if (!inDataLists.emergencyTypesInData.includes(row.EmergencyTypeID)) inDataLists.emergencyTypesInData.push(row.EmergencyTypeID);
			};

			if (chartState.selectedView === viewOptions[0]) {
				if (chartState.selectedYear.includes(allYearsOption)) {
					populateYears(data, row, "eg", "EmergencyGroupID");
				} else if (chartState.selectedYear.includes(row.Year)) {
					populateMonths(data, row, "eg", "EmergencyGroupID");
				};
			} else {

				const foundEmergencyGroup = data.find(e => e.emergencyGroup === row.EmergencyGroupID);

				if (foundEmergencyGroup) {
					if (chartState.selectedYear.includes(allYearsOption)) {
						foundEmergencyGroup.total += row.Budget;
						populateYears(foundEmergencyGroup.emergencyData, row, "et", "EmergencyTypeID");
					} else if (chartState.selectedYear.includes(row.Year)) {
						foundEmergencyGroup.total += row.Budget;
						populateMonths(foundEmergencyGroup.emergencyData, row, "et", "EmergencyTypeID");
					};
				} else {
					const emergencyObj = {
						emergencyGroup: row.EmergencyGroupID,
						total: 0,
						emergencyData: []
					};
					if (chartState.selectedYear.includes(allYearsOption)) {
						emergencyObj.total += row.Budget;
						populateYears(emergencyObj.emergencyData, row, "et", "EmergencyTypeID");
						data.push(emergencyObj);
					} else if (chartState.selectedYear.includes(row.Year)) {
						emergencyObj.total += row.Budget;
						populateMonths(emergencyObj.emergencyData, row, "et", "EmergencyTypeID");
						data.push(emergencyObj);
					};
				};
			};
		});

		if (chartState.selectedView === viewOptions[0]) {
			fillZeros(data);
		} else {
			d3.keys(lists.emergencyGroupsInAllDataList).forEach(eg => {
				const foundEmergencyGroup = data.find(e => e.emergencyGroup === +eg);
				const typesList = lists.emergencyTypesInGroups[eg].filter(e => inDataLists.emergencyTypesInData.includes(e));
				if (foundEmergencyGroup) fillZerosByGroup(foundEmergencyGroup.emergencyData, typesList);
			});
		};

		if (chartState.selectedView === viewOptions[0]) {
			data.sort((a, b) => chartState.selectedYear.includes(allYearsOption) ?
				a.year - b.year :
				monthsArray.indexOf(a.month) - monthsArray.indexOf(b.month));
		} else {
			data.forEach(row => {
				row.emergencyData.sort((a, b) => chartState.selectedYear.includes(allYearsOption) ?
					a.year - b.year :
					monthsArray.indexOf(a.month) - monthsArray.indexOf(b.month));
			});
		};

		return data;
	};

	function populateYears(target, row, emergencyString, emergencyProperty) {
		const foundYear = target.find(e => e.year === row.Year);

		if (foundYear) {
			foundYear[emergencyString + row[emergencyProperty]] = (foundYear[emergencyString + row[emergencyProperty]] || 0) + row.Budget;
			foundYear.total += row.Budget;
			foundYear.yearValues.push(row);
		} else {
			target.push({
				year: row.Year,
				total: row.Budget,
				[emergencyString + row[emergencyProperty]]: row.Budget,
				yearValues: [row]
			});
		};
	};

	function populateMonths(target, row, emergencyString, emergencyProperty) {
		const foundMonth = target.find(e => e.month === monthFormat(row.LastProjectApprovedDate));

		if (foundMonth) {
			foundMonth[emergencyString + row[emergencyProperty]] = (foundMonth[emergencyString + row[emergencyProperty]] || 0) + row.Budget;
			foundMonth.total += row.Budget;
			foundMonth.monthValues.push(row);
		} else {
			target.push({
				month: monthFormat(row.LastProjectApprovedDate),
				total: row.Budget,
				[emergencyString + row[emergencyProperty]]: row.Budget,
				monthValues: [row]
			});
		};
	};

	function fillZeros(target) {
		if (chartState.selectedYear.includes(allYearsOption)) {
			yearsToFill = yearsArray.slice();
			yearsToFill.forEach(yearRow => {
				const foundDataYear = target.find(e => e.year === yearRow);
				if (foundDataYear) {
					d3.keys(lists.emergencyGroupsInAllDataList).forEach(eg => {
						if (!foundDataYear["eg" + eg]) foundDataYear["eg" + eg] = 0;
					});
				} else {
					const zeroYear = {
						year: yearRow,
						total: 0,
						yearValues: []
					};
					d3.keys(lists.emergencyGroupsInAllDataList).forEach(eg => {
						zeroYear["eg" + eg] = 0;
					});
					target.push(zeroYear);
				};
			});
		} else {
			let monthsToFill;
			if (chartState.selectedYear.includes(currentYear) && chartState.selectedYear.length === 1) {
				const topIndex = target.reduce((a, c) => {
					return Math.max(monthsArray.indexOf(c.month), a)
				}, 0);
				monthsToFill = monthsArray.slice(0, topIndex + 1);
			} else {
				monthsToFill = monthsArray.slice();
			};
			monthsToFill.forEach(monthRow => {
				const foundDataMonth = target.find(e => e.month === monthRow);
				if (foundDataMonth) {
					d3.keys(lists.emergencyGroupsInAllDataList).forEach(eg => {
						if (!foundDataMonth["eg" + eg]) foundDataMonth["eg" + eg] = 0;
					});
				} else {
					const zeroMonth = {
						month: monthRow,
						total: 0,
						monthValues: []
					};
					d3.keys(lists.emergencyGroupsInAllDataList).forEach(eg => {
						zeroMonth["eg" + eg] = 0;
					});
					target.push(zeroMonth);
				};
			});
		};
	};

	function fillZerosByGroup(target, typesList) {
		if (chartState.selectedYear.includes(allYearsOption)) {
			yearsToFill = yearsArray.slice();
			yearsToFill.forEach(yearRow => {
				const foundDataYear = target.find(e => e.year === yearRow);
				if (foundDataYear) {
					typesList.forEach(et => {
						if (!foundDataYear["et" + et]) foundDataYear["et" + et] = 0;
					});
				} else {
					const zeroYear = {
						year: yearRow,
						total: 0,
						yearValues: []
					};
					typesList.forEach(et => {
						zeroYear["et" + et] = 0;
					});
					target.push(zeroYear);
				};
			});
		} else {
			let monthsToFill;
			if (chartState.selectedYear.includes(currentYear) && chartState.selectedYear.length === 1) {
				const topIndex = target.reduce((a, c) => {
					return Math.max(monthsArray.indexOf(c.month), a)
				}, 0);
				monthsToFill = monthsArray.slice(0, topIndex + 1);
			} else {
				monthsToFill = monthsArray.slice();
			};
			monthsToFill.forEach(monthRow => {
				const foundDataMonth = target.find(e => e.month === monthRow);
				if (foundDataMonth) {
					typesList.forEach(et => {
						if (!foundDataMonth["et" + et]) foundDataMonth["et" + et] = 0;
					});
				} else {
					const zeroMonth = {
						month: monthRow,
						total: 0,
						monthValues: []
					};
					typesList.forEach(et => {
						zeroMonth["et" + et] = 0;
					});
					target.push(zeroMonth);
				};
			});
		};
	};

	function createFundNamesList(fundsData) {
		fundsData.forEach(row => {
			lists.fundNames[row.id + ""] = row.PooledFundName;
			lists.fundAbbreviatedNames[row.id + ""] = row.PooledFundNameAbbrv;
			lists.fundRegions[row.id + ""] = row.RegionId;
			lists.fundIsoCodes[row.id + ""] = row.ISO2Code;
			lists.fundIsoCodes3[row.id + ""] = row.CountryCode;
		});
	};

	function createRegionNamesList(regionsData) {
		regionsData.forEach(row => {
			lists.regionNames[row.regionID + ""] = row.regionName;
		});
		//Global region, value "-1"
		lists.regionNames["-1"] = "Global";
	};

	function createEmergencyTypesNames(emergencyTypesData) {
		emergencyTypesData.forEach(row => {
			lists.emergencyTypeNames[row.emergencyTypeID + ""] = row.emergencyTypeName;
			if (!lists.emergencyTypesInGroups[row.emergencyGroupID + ""].includes(row.emergencyTypeID)) lists.emergencyTypesInGroups[row.emergencyGroupID + ""].push(row.emergencyTypeID)
		});
	};

	function createEmergencyGroupsNames(emergencyGroupsData) {
		emergencyGroupsData.forEach(row => {
			lists.emergencyGroupNames[row.emergencyGroupID + ""] = row.emergencyGroupName;
			lists.emergencyTypesInGroups[row.emergencyGroupID + ""] = [];
		});
	};

	function createCsv(rawDataAllocations) {

		const csvData = [];

		rawDataAllocations.forEach(function(row) {
			if ((chartState.selectedYear.includes(row.Year) || chartState.selectedYear.includes(allYearsOption)) &&
				chartState.selectedFund.includes(row.CountryID) &&
				chartState.selectedEmergencyGroup.includes(row.EmergencyGroupID)) {
				csvData.push({
					Year: row.Year,
					Fund: lists.fundNames[row.CountryID],
					["Application Code"]: row.ApplicationCode,
					["Emergency Group"]: lists.emergencyGroupNames[row.EmergencyGroupID],
					["Emergency Type"]: lists.emergencyTypeNames[row.EmergencyTypeID],
					Date: row.LastProjectApprovedDate,
					Budget: row.Budget
				});
			};
		});

		const csv = d3.csvFormat(csvData);

		return csv;
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

		createProgressWheel(downloadingDivSvg, 200, 175, downloadingDivText);

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
			"white-space",
			"dominant-baseline",
			"letter-spacing",
			"paint-order"
		];

		const imageDiv = containerDiv.node();

		setSvgStyles(svg.node());

		if (type === "png") {
			iconsDiv.style("opacity", 0);
		} else {
			topDiv.style("opacity", 0)
		};

		snapshotTooltip.style("display", "none");

		containerDiv.selectAll(".alloctimelineregionDropdown, .alloctimelinefundDropdown, .alloctimelineemergencyDropdown")
			.style("display", "none");

		html2canvas(imageDiv).then(function(canvas) {

			containerDiv.selectAll(".alloctimelineregionDropdown, .alloctimelinefundDropdown, .alloctimelineemergencyDropdown")
				.style("display", null);

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

			if (fromContextMenu && currentHoveredElement) d3.select(currentHoveredElement).dispatch("mouseout");

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

		const fileName = vizNameQueryString + "_" + csvDateFormat(currentDate) + ".png";

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

		removeProgressWheel();

		d3.select("#" + classPrefix + "DownloadingDiv").remove();

	};

	function downloadSnapshotPdf(source) {

		const pdfMargins = {
			top: 10,
			bottom: 30,
			left: 20,
			right: 30
		};

		d3.image("./assets/img/UNOCHA_logo_vertical_blue_RGB.png")
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

				pdf.setTextColor(80, 80, 90);
				pdf.setFont('helvetica');
				pdf.setFontType("bold");
				pdf.setFontSize(14);
				pdf.text("CERF Allocations Timeline", pdfMargins.left, 44);

				pdf.addImage(source, "PNG", pdfMargins.left, 48, widthInMilimeters, heightInMilimeters);

				const currentDate = new Date();

				//pdf.output("dataurlnewwindow");
				pdf.save(vizNameQueryString + "_" + csvDateFormat(currentDate) + ".pdf");

				removeProgressWheel();

				d3.select("#" + classPrefix + "DownloadingDiv").remove();

				function createLetterhead() {

					const footer = pdf.splitTextToSize("The mission of the United Nations Office for the Coordination of Humanitarian Affairs (OCHA) is to Coordinate the global emergency response to save lives and protect people in humanitarian crises. We advocate for effective and principled humanitarian action by all, for all.", (210 - pdfMargins.left - pdfMargins.right), {
						fontSize: 8
					});

					pdf.setFillColor(65, 143, 222);
					pdf.rect(pdfMargins.left, pdfMargins.top + 20, 210 - pdfMargins.right, 0.75, "F");
					pdf.rect(pdfMargins.left, pdfHeight - pdfMargins.bottom, 210 - pdfMargins.right, 0.75, "F");
					pdf.rect(pdfMargins.left + 22, pdfMargins.top + 2, 0.25, 15, "F");

					const fullDate = d3.timeFormat("%A, %d %B %Y")(new Date());

					pdf.setTextColor(35, 143, 222);
					pdf.setFontType("normal");
					pdf.setFontSize(14);
					pdf.text("CERF DATA HUB", pdfMargins.left + 26, 20);

					pdf.setTextColor(35, 143, 222);
					pdf.setFontType("normal");
					pdf.setFontSize(10);
					pdf.text(fullDate, pdfMargins.left + 26, 26.1);


					// pdf.setFillColor(236, 161, 84);
					// pdf.rect(0, pdfMargins.top + 15, 210, 2, "F");

					// pdf.setFillColor(255, 255, 255);
					// pdf.rect(pdfMargins.left, pdfMargins.top - 1, 94, 20, "F");

					// pdf.ellipse(pdfMargins.left, pdfMargins.top + 9, 5, 9, "F");
					// pdf.ellipse(pdfMargins.left + 94, pdfMargins.top + 9, 5, 9, "F");

					pdf.addImage(logo, "PNG", pdfMargins.left + 2, pdfMargins.top, 14, 18);

					// pdf.setFillColor(236, 161, 84);
					// pdf.rect(0, pdfHeight - pdfMargins.bottom, 210, 2, "F");

					pdf.setTextColor(35, 143, 222);
					pdf.setFont("helvetica");
					pdf.setFontType("normal");
					pdf.setFontSize(8);
					pdf.text(footer, 105, pdfHeight - pdfMargins.bottom + 6, {
						align: "center"
					});

					pdf.setTextColor(35, 143, 222);
					pdf.setFont("helvetica");
					pdf.setFontType("bold");
					pdf.setFontSize(8);
					pdf.text("www.unocha.org", 105, pdfHeight - pdfMargins.bottom + 16, {
						align: "center"
					});

				};

			});

		//end of downloadSnapshotPdf
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

	function validateSelectionString(selectionString, dataList) {
		const arr = [],
			dataArray = selectionString.split(",").map(d => +(d.trim())),
			someInvalidValue = dataArray.some(d => !(d3.keys(dataList).map(e => +e).includes(d)));

		if (someInvalidValue) return d3.keys(dataList).map(d => +d);

		dataArray.forEach(function(d) {
			for (var key in dataList) {
				if (+key === d) arr.push(+key)
			};
		});

		return arr;
	};

	function valuesInLowerCase(map) {
		const values = [];
		for (let key in map) values.push(map[key].toLowerCase());
		return values;
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

	function formatSIFloat(value) {
		const length = (~~Math.log10(value) + 1) % 3;
		const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
		return d3.formatPrefix("." + digits, value)(value).replace("G", "B");
	};

	function capitalize(str) {
		return str[0].toUpperCase() + str.substring(1)
	};

	function extractNum(str) {
		return str.replace(/^\D+/g, "");
	};

	function parseTransform(translate) {
		const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
		group.setAttributeNS(null, "transform", translate);
		const matrix = group.transform.baseVal.consolidate().matrix;
		return [matrix.e, matrix.f];
	};

	function pathTween(newPath, precision, self) {
		return function() {
			var path0 = self,
				path1 = path0.cloneNode(),
				n0 = path0.getTotalLength(),
				n1 = (path1.setAttribute("d", newPath), path1).getTotalLength();

			var distances = [0],
				i = 0,
				dt = precision / Math.max(n0, n1);
			while ((i += dt) < 1) distances.push(i);
			distances.push(1);

			var points = distances.map(function(t) {
				var p0 = path0.getPointAtLength(t * n0),
					p1 = path1.getPointAtLength(t * n1);
				return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
			});

			return function(t) {
				return t < 1 ? "M" + points.map(function(p) {
					return p(t);
				}).join("L") : newPath;
			};
		};
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

	class Bump {
		constructor(context, x) {
			this._context = context;
			this._x = x;
		}
		areaStart() {
			this._line = 0;
		}
		areaEnd() {
			this._line = NaN;
		}
		lineStart() {
			this._point = 0;
		}
		lineEnd() {
			if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
			this._line = 1 - this._line;
		}
		point(x, y) {
			x = +x, y = +y;
			switch (this._point) {
				case 0:
					{
						this._point = 1;
						if (this._line) this._context.lineTo(x, y);
						else this._context.moveTo(x, y);
						break;
					}
				case 1:
					this._point = 2; // falls through
				default:
					{
						if (this._x) this._context.bezierCurveTo(this._x0 = (this._x0 + x) / 2, this._y0, this._x0, y, x, y);
						else this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + y) / 2, x, this._y0, x, y);
						break;
					}
			}
			this._x0 = x, this._y0 = y;
		}
	}

	function curveBumpX(context) {
		return new Bump(context, true);
	};

	function stackCustomOrder(series) {
		function sum(series) {
			var s = 0,
				i = -1,
				n = series.length,
				v;
			while (++i < n) {
				if (v = +series[i][1]) s += v;
			};
			return s;
		};

		function none(series) {
			var n = series.length,
				o = new Array(n);
			while (--n >= 0) o[n] = n;
			return o;
		};
		var sums = series.map(sum);
		return none(series).sort(function(a, b) {
			return a === chartState.baseline ? 1 : b === chartState.baseline ? -1 : sums[a] - sums[b];
		}).reverse();
	};

	function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {
		const wheelGroup = thissvg.append("g")
			.attr("class", classPrefix + "d3chartwheelGroup")
			.attr("transform", "translate(" + thiswidth / 2 + "," + thisheight / 4 + ")");

		const loadingText = wheelGroup.append("text")
			.attr("text-anchor", "middle")
			.style("font-family", "Roboto")
			.style("font-weight", "bold")
			.style("font-size", "11px")
			.attr("y", 50)
			.attr("class", "contributionColorFill")
			.text(thistext);

		const arc = d3.arc()
			.outerRadius(25)
			.innerRadius(20);

		const wheel = wheelGroup.append("path")
			.datum({
				startAngle: 0,
				endAngle: 0
			})
			.classed("contributionColorFill", true)
			.attr("d", arc);

		transitionIn();

		function transitionIn() {
			wheel.transition()
				.duration(1000)
				.attrTween("d", function(d) {
					const interpolate = d3.interpolate(0, Math.PI * 2);
					return function(t) {
						d.endAngle = interpolate(t);
						return arc(d)
					}
				})
				.on("end", transitionOut)
		};

		function transitionOut() {
			wheel.transition()
				.duration(1000)
				.attrTween("d", function(d) {
					const interpolate = d3.interpolate(0, Math.PI * 2);
					return function(t) {
						d.startAngle = interpolate(t);
						return arc(d)
					}
				})
				.on("end", function(d) {
					d.startAngle = 0;
					transitionIn()
				})
		};

		//end of createProgressWheel
	};

	function removeProgressWheel() {
		const wheelGroup = d3.select("." + classPrefix + "d3chartwheelGroup");
		wheelGroup.select("path").interrupt();
		wheelGroup.remove();
	};

	//end of d3ChartIIFE
}());