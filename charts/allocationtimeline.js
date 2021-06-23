(function d3ChartIIFE() {

	//Important: D3 version is 5.x
	//All listeners using the arguments in the sequence: datum, index, node group

	const width = 1100,
		padding = [4, 4, 4, 4],
		chartWidth = width - padding[1] - padding[3],
		stackedHeight = 150,
		stackedHeightAggregate = 450,
		stackedPadding = [8, 16, 20, 190],
		maxYearsListNumber = 1,
		legendTextPadding = 40,
		legendHorPadding = 4,
		iconSize = 28,
		unBlue = "#1F69B3",
		classPrefix = "alloctimeline",
		tooltipWidth = 270,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isBookmarkPage = window.location.hostname + window.location.pathname === "cbpfgms.github.io/cerf-bi-stag/bookmark.html",
		bookmarkSite = "https://cbpfgms.github.io/cerf-bi-stag/bookmark.html?",
		fadeOpacity = 0.2,
		tooltipMargin = 8,
		stackGap = 3,
		precision = 18,
		closeFactor = 0.2,
		windowHeight = window.innerHeight,
		currentDate = new Date(),
		currentYear = currentDate.getFullYear(),
		localVariable = d3.local(),
		localStorageTime = 3600000,
		duration = 1000,
		shortDuration = 250,
		tooltipPadding = 12,
		disabledOpacity = 0.4,
		tickNumberAggregate = 4,
		tickNumberByGroup = 2,
		colorArray = ["#66c2a5", "#fc8d62", "#e5c494", "#8da0cb", "#b3b3b3"],
		monthFormat = d3.timeFormat("%b"),
		monthParse = d3.timeParse("%m"),
		monthsArray = d3.range(1, 13, 1).map(d => monthFormat(monthParse(d))),
		approvedDateParse = d3.timeParse("%d/%m/%Y"),
		allYearsOption = "all",
		allRegionsOption = "Select all regions",
		allFundsOption = "Select all countries",
		allEmergencyGroupsOption = "Select all emergency groups",
		chartTitleDefault = "Allocation Timeline",
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
		currentHoveredElement;

	//emergency groups:
	// 1: "Conflict-related"
	// 2: "Disease Outbreak"
	// 3: "Natural Disaster"
	// 5: "Unspecified Emergency"
	// 6: "Multiple Emergencies"

	const emergencyIconsData = { //just an example:
		"1": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QYXAxUtuP++LwAAA+5JREFUaN7Vmslr1HAUxz9NxwWXk+K+FLx4t54KQY8VxaNLXGjREe02dalL26nL1AWxaEctRkVoHas3wap4Ega8qP+AIAhiR0Xw4lYFHQ++wRB+yWQdpg+GJr9ffi/fb977vSVpTTKfmwKkgSYgAYwC3aZufCegJPO5qcApYDtQBEaAtKkbv4hYNAHfAywG5gMp4HEyn5sZQu9JoAtYCCwCDssYcRBoVozrwJNkPjc7oN4dirGdcRGodZhrAMYCWmKhYmxBXARGXeZ14FFId4pVNKAbyE9WEppEm0bgaRkSYfZErBZASKwvQ6JBotPsqiMwmUlo1pPJSKLGIZPOAMaAtS5rnwGNpm58UawvqhaYulGjuLYGaAU6gGnAHcnaP31boNKWEPCXgEFgBbBEMviJQC5USRIC/iLQppjeGpqAhcSGMnmilLFnWMYKiusKCvDtDjp/REJASHwD1nlIdv2W8xHFNcOW4zYX8IhLRUPAB4ktluM0cE6eekGO+yzzB1z0DABXQ0UhF791i07vTN1Y6lHPJ2CuYuqsqRtHA+cBD5Zw2xO3fKi6pxg74Re8bwIWd2qU8PcRGAcy0oF5lS5gCPgMvAaaTN04HlkiCyvJfG4j0AnUy9ALYMDUjQcVycQhwZ+VFlIlp03d6I6VQDKfmyYhcatDZwXwHrgN9FpTvjz5+2XuucHUjTHLmoT0JM3AMo+43wI3gdMJxWSmTJgrtYyH5I2D9Wl3erj5folkJemxhVgvskzKjaJqE28L0byv8rCm3nbeHMKDdqsIFH0oKAa4aTECHSX5oyJw24eCYdv5Sw9r7NdcD0HAVO2BXosrOW3igtQ7aUUZsKbMTQds52eA38AuoM5DbvoDvAFuAOfjCKP9wDGH6YypG71VnQeExHqJNqtl6LkksodVkciknm8TkLOAu0CX1xfC8vI3DRjABJAFhkzd8L2htYDgL8lvOTAHaAHO+1CTluRVB6wErgAXRXd8BCzgVW3gJh+qDMVYexASiYh6WICvtnIkI0CLEm77LN8HJhx0tMv6lFd30nyCd2sDL9jKkYP8/z5wxFYuZF30+LKEFhH4a8BllxID/n2tKcmQuKIbiSEvJLQIwA8Ce0smT+ZztcA8xXWLLE1RUQo/t+Z9D7AvMAEfTz4VJPzJmlQZS7QGIhDkyQcqZMpbYrpvAj7Ap8KAV1hiMEhhqbJAW6XAK0i0AK+kWMvg4ctmwqFjqhh4G4mrfl5qOVnA6VtYNi7wYUTz+NIpC3RUG3gnF+qSv5ulPBgAstUIXklASuJWLzG4Wl0o7Gb8DXxQTI1PCgIu8XukUnsgCumRMnqbNOHDxPTfKn8B+K9mJccE+EkAAAAASUVORK5CYII=",
		"2": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAAwCAYAAAC13uL+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QYXAxIV37yQdgAABjhJREFUaN7VmmmMVEUQx38zNHhxeawYECOuQESNIgSjRMUVI6IILn7AGBVbISbeNogJQTnUeNDeeBBtOTxY8QwaDUYFQUWJIiAqISjKsSDKsUiA2Oz6YWqT8fF6Zt7MMEol86W6X3X/+6j6V/WkKFG81a2AScBwYA9glXFPJLTRErhfbOwGLPCkMq6plLmlSwSWAqYDdwFHA52Bx73VtQlNjZZfVbMNYHypC58u8fuxwLAY/dCEduL6j/NWD/1PwHmrewETAs0NCc3tiNGlgBe91R0qCk6O4xOB7/cATyc0ORmIu1/t5C5WdOfOA/oG2q5Xxq1IYkwZ916OUzDcW31sJcHpgP4ZZdwrRdqcBHwUo28BXFMRcN7qNHBZTNPOUjycMq4RGBM4nkMqtXPd5C5E5V1l3OZSvJsybgnwTUzTad7qgyoB7pSA/jPKIwtidK2A7okXq4jB2wX0m2KOcDfgXOBU4CigDbAN2Ax8C8xTxq2PfLYx4bhlBXdIQN8kgNoC1wI3FbLa3uqvJHTMVsbtARoDXQ+uxLH8PaDv4q0eBPwAPJngGJ0JzARWeKv7A10SjlvWnVsb0E8A2pZw16qBuQG2ArChEjv3nTD3qOQDth34RUJGSFIBO6uL8cSJwSnjdgELC+jaCMwWUtxeGddeGXeCMq41cIwE5o8LHHZuUaGlyCM0A+ifo30RoJVxPwYWaJPcs5ne6r7AS0DXHPZeriT9mgWsC7TVA/1DwGKAfi4LtTvQ5Utl3BfFTDKVgHYdCpwvDKUauBzomCOg1yrj/izA7gnAHKBHoMtK4ANgtXjiz5RxvizgvNX9gBHCJ1snWLh64ZrTJX5F7bYGbgHuTuhl/wDeAJ5Vxi0rCpy3ulryrCGUJg3C9leKxzwKOBmoKSYwZ8le4AVgXMiTpgLArhCncQj/f/kdGKyMW5TXoXirDVB3gABDClOfxNVbUhFgV8uOHYjixUvP32fnvNW9gal5zvjbwKsxbY8Jyy9VmoBPARfTNgX4JE/MrvNWd/oXOG91C2Bajgu+EDhNGVcLzI9pd8q4XsJG1hcJ7HvgXGVcjYSGqLypjLtAUqiVARsdgKeiO3eVeLA4cUBNVtFnS0yfKgnIbwF9gGUJgX0InKWMW5g1ybgQgDJugYwRom5DvNV9ANJSprsn0PE9YKQy7u8sXdzOnJHFODYAA3IknXFEvFYZ91eWrmfMcd2QNUaDhKilgQhwb/PO9RTGEZWtwAhl3N6IfgmZ2mS2DIhQqnpgZIGx6ioh49kFqIsi/VZF2Y4sxnCxEZULvdXt08CgwMBTlHEbY7jgbiHG2VLjre4a6TcHWJwH3KvKuB9iFur4iG5egJd+B7wV09QSGJCWCxon03JManpMvHwkbvL5wEVCkQIeLGC8QuZ5TjpAftcp41bnMPg6ECXFg73VN0R0n+Zx+1HP+4AUk7JlaZ6sYAHxtc5OaUkc9wGXJ00JFWCnRJjC2lwEOHLXRpF5xorK6Dxz2RHw4B1VgJFvLcAZPCcXulekvljnrb6PzAPG3jzOBG91G+BR4IaYPrOVcR8VMJctwJHRskc6EBDzJpqSU10RczxbiCteDtyWw0SVt3o08FMAWEhPoO8+ujSZB8Ts5G+jrGQhWfQa8bbbYpq7E365aV6EhwN3fg1wqcSzQmRipPC0E5iYkqPRU4JiAzAjaaXJW326BPxOZeCXy4GByrh1CedQTeaVtwmYpYz7OUWZxFt9hJDbYUWaaCTzFj5WYmnJUjZwWSD7yp27MMFnrwH3xQT0kiRN+WWR1E+SyNpyAyv7zkkuNRUYWMTnLwCjlHHb/1fgvNU9gCuBW3NUsnYAdwLP5zgx9ZL41injfqs4OG91Z+AO4CTgCOC4AMuJUq2rlXGveKvHN6ckefqvB36Vitk3wKPKuG37DZy3+hhJRKsSrsloZdxksZESdjMyoY0VQO8knjSpQ7kuITAP3NwMTAJ/E3AjmWJskv92nQxcvD+95WEJ+i4DzlbGTYlhNk3KuIeE3axNYLPt/gT3Th4yDLCKTPm9tzJucR769j6ZN4IxBYSP7SR8yirGoQwl84eY7sAuYeQ/AV9L1errYv5KKBW4fsAlkmmcCBwuWfUS4Pakrz3/ANNs9bpV4R+uAAAAAElFTkSuQmCC",
		"3": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QYXAxQhqFLDRQAABAxJREFUaN7tmV2IVVUUx3/3zmRiRvmRTW0iC7HEJHuQtDYxhKKlSYQI2jiiBGntaOhlXnpIekgp0mgXfSioldqHURiMU8oEswiRqB6CUIsK3EaZoiFTOTNOD3cNHK7nzv063XMG5v9y1l1n3XvX/5y19lpr7xxVIohfBGwE7gEmAyeBo8BOY91BGoxcFY5fAbwNrB3BrBtoN9b90SgC+SpsyzkPsBjoDeKvzxSBIH5hkfP7gDuBq4A5wCvAgN6bCezKVAgF8fuBR/TjXmPd6hibZcAnQJOqFhnrDmUlhOZH5BfiDIx1nwGvRlTrspQDU/U6BJwYwe6tiHxvIwg0V2h3CpiuIdcKlFoujynJXIR0qbCcD7QDCzRvBvR/vgBeM9YdSzIHtgFP68fTwDNAl7HuTIxtvz6YQWNdc8z9mzXUHhrhLy8BLwLPGusGkgihLcCfKl8HvAP8HsS3VVkE7wKOlHF+2K9OYHcQn6+bgLHuN2ApEC1QTaqr1PkbNfRaVDUI7ADuA67RJfl+LYbDWAW4JHIAY93RIH6W/uBi4Erg5SpewA5gmspngOXGuq+KbHqC+C+1rjyluk1B/HZjXV9drUQVT/qyHAjiFwDDzvYDrTHOF7ct32tyA6wy1u2rt5WoB2si8q6RnNe33Q+8G1HNqzuE6kRrlIA+5XZgJbDVWHc45ju/RuSWtAmYiPxtED9ec6IZmA3cEvOdmRH5bBLdaD191sRIJe8DLmouAEwP4u8oyoFpwIaIStJ+A/lIfA8BQ0F8N/Cwqj8I4p8AftQWZAswRe+d1CYxVQJx2AQ8CIwDZgE9MTaDwGPGun/TCKFydeU7oA34u4TJeWClsa47qYks8fnDWPchMFe72BNa4L4GngduN9Z9nFQ3WguGKtEZ644DjzdiJs4kxgjE4GLRtZQuswReAs7pQBLVXdDrGMaQJSQ20ATxFtgJXA28CWwz1p3Ve5OBDl3v/wLWGeskMwSC+AeAj4AJEXU/8LPKtxYVzT5ghbGuK3UCQfxy4H1gfA3LbZu2E+kso0H8o8D+GpxHu9C9Qfz6VAgE8RuB3XX2U03A9iC+o6EEgvhO4PWECmEO2BrEb24IgSD+OWAzyaOzFhLVHDHlKGxkdfD/4g3gSWPdpcQIBPFNFI6YGrLnD+wB1pbb2K2IQBA/DngPWNHgIntAR8p/aiYQxE/QZXJJSp1CD4U91AtVEwjiJwKfUtgxThMCLDPWna+YQBA/CegC7s5Iz/YNsMRYd7osgSC+BficwvFplvADhZPPUJKAHv8cAmZktHv+BVhorPvpskIWxN8G9GbYeSgcNPZG91Lz6vxszfibRsEMcwNwOIifC5AL4udpwk4ZZcPYOWBpXgeR0eY8wLXAnv8AFxA8dm7qq4oAAAAASUVORK5CYII=",
		"5": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAwCAYAAABE1blzAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QYXAwsi/AGcYQAAA0dJREFUaN7dmU9IVEEcxz/71AoLMaOwQqEQLaI/IHMIO3QoKg0Kq0sWDFSH/hE1ERgl0l8oRovq0G26dQi6GdSlDmE1HkqpFOrUrSACSQiTOjhCmO6+3X3z9u1+b2935s37zHfe/H7vNylikDZ2JXAV2ALMBfqBbiVFv++xUzHANQKvgIXT/hoHdikpnhQtoDY2BbwENs7S5CvQpKT44esZAs8GHkgDB7AEuFiUDmpjK4GPQH2GpuPAWiXFSLE5eD4EHEAF0FNUDmpj64BhoDKLbq0+NhxfDvZkCQfQo42tSDygNrYF2JND11XA8UQvUW1sALwBmnO8xQ+gUUnxLakOHskDDqAauJRIB7WxVcAIUJvnrSaAZiXFu6Q52B0BHEAZcNdlQckA1MY2AMcinKxNQHuSHLzlvhLS6RmwHmgA7oe4501t7LyCA2pjtwNtIXbHPUqKQSXFZ+AoMJChzwrgTEEBXWDuDdH0g5JidOpCSfEHeB2iX6c2dlkhHTzhAnQm/Z4lyc6kBcD1ggBqY2uACzEUBA5qYzcVwsFrQE0MgCnglsuS4gHUxq4BDhGfmoGOOB3sBcqJVzdctuQXUBu7F9hK/KoFznkF1MbOzXdXy1NnXdbkzcGzLhMplLKe4CAL93JaIh60Vxu71YeDN4AqkqFebWx5ZIDa2Jy3aU8KHaaCEHAp4Db+i8RZJxoum8rbwQ6gJc+HqQr5WzYKlSqmMrg335Uhluf5ML9dGWLwnzz2fQQVgHFgnZJieLYGmV7UzgjgpsZ5ro29B/wEDkdU3qgAdLrv0VQa9+qZPFuoJPlqU1L0ZfsO9hQJHMBtl2WFA3TfX+0Uj2YtegUzwJUBd4j+YKYf2AwI4KEHyC5t7OIwDh4CNkQ8+CiwU0nxQkkxwOTB6GDEY1QDl9MCamOrgSseZveTkuL71IWSYoLMVbVcdFgbuz6dg13AYg8DN2ljl/4zkXMiSB5mUhmTNdr/w4Q2tgkYcrHFh4aYLO//BE4D2zxuOvuUFI+mA/YBOygNfQFWKSnGAgfXWkJwAHVulZBy1ekhoInS0hiwOnABstTgcFnY5QA4SelqfwAsKmHA8gB4XMKAbwPgFPDAxadS0S/gKbD7L9yn11ZmdimEAAAAAElFTkSuQmCC",
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
		.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")");

	const yScale = d3.scaleLinear();

	const yScaleByGroup = d3.scaleBand()
		.paddingOuter(0);

	const xScale = d3.scalePoint()
		.range([stackedPadding[3], chartWidth - stackedPadding[1]]);

	const yAxis = d3.axisLeft(yScale)
		.tickFormat(d => "$" + d3.formatPrefix(".0", d)(d));

	const yAxisByGroup = d3.axisLeft(yScaleByGroup);

	const xAxis = d3.axisBottom(xScale)
		.tickSizeOuter(0)
		.tickSizeInner(0)
		.tickPadding(6);

	const stackGenerator = d3.stack()
		.order(stackCustomOrder);

	const stackGeneratorByGroup = d3.stack()
		.order(d3.stackOrderDescending);

	const areaGenerator = d3.area()
		.curve(curveBumpX);

	const colorScale = d3.scaleOrdinal()
		.range(colorArray);

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

		const data = processData(rawDataAllocations); //create inData lists

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

			//IMPORTANT: refactor loop function
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

			tooltip.style("left", (tooltipPadding + thisSize.left + thisSize.width / 2 - tooltipSize.width / 2) < containerSize.left ?
					tooltipPadding :
					thisSize.left + thisSize.width / 2 - tooltipSize.width / 2 - containerSize.left + "px")
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
				if (queryStringValues.has("contributionYear")) {
					queryStringValues.set("contributionYear", yearValues);
				} else {
					queryStringValues.append("contributionYear", yearValues);
				};
			} else {
				queryStringValues.delete("contributionYear");
			};

			const data = processData(rawDataAllocations);

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

		//listeners



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
			viewButtons.classed("active", d => chartState.selectedView.includes(d));
			resizeSvg(false);
			const data = processData(rawDataAllocations)
			drawStackedAreaChart(data);
		});

	};

	function drawStackedAreaChart(data) {

		stackGenerator.keys(inDataLists.emergencyGroupsInData.map(d => "eg" + d));

		const dataAggregated = chartState.selectedView === viewOptions[0] ? stackGenerator(data) : [];

		if (dataAggregated.length) dataAggregated.sort((a, b) => a.index - b.index);

		//const dataByGroup here

		xScale.domain(chartState.selectedYear.includes(allYearsOption) ? yearsArray : monthsArray);

		yScaleByGroup.range([(1 - closeFactor) * height - padding[2], padding[0] + height * closeFactor])
			.domain(chartState.selectedView === viewOptions[0] ? dataAggregated.map(e => e.key) :
				[]); //<-----------domain for by groups view here

		console.log(inDataLists.emergencyGroupsInData.map(d => "eg" + d))

		if (chartState.selectedView === viewOptions[0]) {
			yScale.range([stackedHeightAggregate - stackedPadding[2], stackedPadding[0] + (data.length - 1) * stackGap])
				.domain([0, d3.max(data, d => d.total)]);
		} else {
			yScale.range([stackedHeight - stackedPadding[2], stackedPadding[0]]);
		};

		areaGenerator.x(d => xScale(chartState.selectedYear.includes(allYearsOption) ? d.data.year : d.data.month));

		console.log(data);

		console.log(dataAggregated);

		yAxis.tickSizeInner(-(xScale.range()[1] - xScale.range()[0]))
			.ticks(chartState.selectedView === viewOptions[0] ? tickNumberAggregate : tickNumberByGroup);

		const stackTransition = d3.transition()
			.duration(duration);

		//Aggregated view

		let xAxisGroupAggregated = mainGroup.selectAll("." + classPrefix + "xAxisGroupAggregated")
			.data(dataAggregated.length ? [true] : []);

		const xAxisGroupAggregatedExit = xAxisGroupAggregated.exit()
			.transition(stackTransition)
			.style("opacity", 0)
			.remove();

		xAxisGroupAggregated = xAxisGroupAggregated.enter()
			.append("g")
			.attr("class", classPrefix + "xAxisGroupAggregated")
			.merge(xAxisGroupAggregated)
			.attr("transform", "translate(0," + yScale.range()[0] + ")");

		xAxisGroupAggregated.transition(stackTransition)
			.call(xAxis);

		let areaPaths = mainGroup.selectAll("." + classPrefix + "areaPath")
			.data(dataAggregated, d => d.key);

		const areaPathsExit = areaPaths.exit()
			.transition()
			.duration(shortDuration)
			.style("opacity", 0)
			.remove();

		const areaPathsEnter = areaPaths.enter()
			.append("path")
			.attr("class", classPrefix + "areaPath")
			.style("cursor", "pointer")
			.style("fill", d => colorScale(d.key))
			.attr("d", (d, i) => {
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

		areaPaths = areaPathsEnter.merge(areaPaths);

		areaPaths.order();

		areaPaths.transition(stackTransition)
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

		let yAxisGroupAggregated = mainGroup.selectAll("." + classPrefix + "yAxisGroupAggregated")
			.data(dataAggregated.length ? [true] : []);

		const yAxisGroupAggregatedExit = yAxisGroupAggregated.exit()
			.transition(stackTransition)
			.style("opacity", 0)
			.remove();

		yAxisGroupAggregated = yAxisGroupAggregated.enter()
			.append("g")
			.attr("class", classPrefix + "yAxisGroupAggregated")
			.merge(yAxisGroupAggregated)
			.attr("transform", "translate(" + stackedPadding[3] + ",0)");

		yAxisGroupAggregated.transition(stackTransition)
			.call(yAxis);

		yAxisGroupAggregated.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		areaPaths.on("click", (d, i, n) => {
			let newBaseline;
			areaPaths.each((e, j, m) => {
				if (n[i] === m[j]) newBaseline = inDataLists.emergencyGroupsInData.map(d => "eg" + d).indexOf(e.key);
			});
			if (chartState.baseline !== newBaseline) {
				chartState.baseline = newBaseline;
				drawStackedAreaChart(data);
			};
		});

		let legendGroup = mainGroup.selectAll("." + classPrefix + "legendGroup")
			.data(yScaleByGroup.domain(), d => d);

		const legendGroupExit = legendGroup.exit()
			.transition(stackTransition)
			.style("opacity", 0)
			.remove();

		const legendGroupEnter = legendGroup.enter()
			.append("g")
			.attr("class", classPrefix + "legendGroup")
			.attr("transform", d => "translate(0," + (yScaleByGroup(d) + yScaleByGroup.bandwidth() / 2) + ")");

		const legendText = legendGroupEnter.append("text")
			.attr("x", legendTextPadding + legendHorPadding)
			.attr("y", d => lists.emergencyGroupNames[d.replace(/^\D+/g, "")].split(" ").length > 1 ? "-0.6em" : 0)
			.text(d => lists.emergencyGroupNames[d.replace(/^\D+/g, "")].split(" ")[0])
			.append("tspan")
			.attr("x", legendTextPadding + legendHorPadding)
			.attr("dy", "1.2em")
			.text(d => lists.emergencyGroupNames[d.replace(/^\D+/g, "")].split(" ")[1]);

		const legendIcon = legendGroupEnter.append("image")
			.attr("x", legendTextPadding - iconSize - legendHorPadding)
			.attr("y", -iconSize / 2)
			.attr("href", d => emergencyIconsData[d.replace(/^\D+/g, "")])
			.attr("width", iconSize)
			.attr("height", iconSize);

		legendGroup = legendGroupEnter.merge(legendGroup);

		legendGroup.transition(stackTransition)
			.attr("transform", d => "translate(0," + (yScaleByGroup(d) + yScaleByGroup.bandwidth() / 2) + ")");

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
			if (row.LastProjectApprovedDate) row.Year = row.LastProjectApprovedDate.getFullYear();
			if (!lists.fundsInAllDataList[row.CountryID] && lists.fundNames[row.CountryID]) lists.fundsInAllDataList[row.CountryID] = lists.fundNames[row.CountryID];
			if (!lists.regionsInAllDataList[lists.fundRegions[row.CountryID]] && lists.regionNames[lists.fundRegions[row.CountryID]]) lists.regionsInAllDataList[lists.fundRegions[row.CountryID]] = lists.regionNames[lists.fundRegions[row.CountryID]];
			if (!lists.emergencyGroupsInAllDataList[row.EmergencyGroupID] && lists.emergencyGroupNames[row.EmergencyGroupID]) lists.emergencyGroupsInAllDataList[row.EmergencyGroupID] = lists.emergencyGroupNames[row.EmergencyGroupID];
			if (!yearsArray.includes(row.Year)) yearsArray.push(row.Year);
		});
		yearsArray.sort((a, b) => a - b);
	};

	function processData(rawDataAllocations) {

		const data = [];

		rawDataAllocations.forEach(row => {

			//TEMPORARY FILTER: REMOVE!!!
			if (!lists.emergencyGroupsInAllDataList[row.EmergencyGroupID]) return;
			if (!row.LastProjectApprovedDate) return;

			if (chartState.selectedYear.includes(row.Year) || chartState.selectedYear.includes(allYearsOption)) {
				if (!inDataLists.regionsInData.includes(lists.fundRegions[row.CountryID])) inDataLists.regionsInData.push(lists.fundRegions[row.CountryID]);
				if (!inDataLists.fundsInData.includes(row.CountryID)) inDataLists.fundsInData.push(row.CountryID);
				if (!inDataLists.emergencyGroupsInData.includes(row.EmergencyGroupID)) inDataLists.emergencyGroupsInData.push(row.EmergencyGroupID);
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
						populateYears(foundEmergencyGroup.emergencyData, row, "et", "EmergencyTypeID");
					} else if (chartState.selectedYear.includes(row.Year)) {
						populateMonths(foundEmergencyGroup.emergencyData, row, "et", "EmergencyTypeID");
					};
				} else {
					const emergencyObj = {
						emergencyGroup: row.EmergencyGroupID,
						emergencyData: []
					};
					if (chartState.selectedYear.includes(allYearsOption)) {
						populateYears(emergencyObj.emergencyData, row, "et", "EmergencyTypeID");
					} else if (chartState.selectedYear.includes(row.Year)) {
						populateMonths(emergencyObj.emergencyData, row, "et", "EmergencyTypeID");
					};
					data.push(emergencyObj);
				};
			};
		});

		if (chartState.selectedView === viewOptions[0]) {
			fillZeros(data);
		} else {
			d3.keys(lists.emergencyGroupsInAllDataList).forEach(eg => {
				const foundEmergencyGroup = data.find(e => e.emergencyGroup === +eg);
				const typesList = lists.emergencyTypesInGroups[eg];
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
			target.forEach(row => {
				d3.keys(lists.emergencyGroupsInAllDataList).forEach(eg => {
					if (!row["eg" + eg]) row["eg" + eg] = 0;
				});
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
			target.forEach(row => {
				typesList.forEach(et => {
					if (!row["et" + et]) row["et" + et] = 0;
				});
			});
		} else {
			let monthsToFill;
			if (chartState.selectedYear.includes(currentYear) && chartState.selectedYear.length === 1) {
				const topIndex = target.reduce((a, c) => {
					return Math.max(monthsArray.indexOf(c.month), a)
				}, 0);
				monthsToFill = monthsArray.slice(0, topIndex);
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
			if (chartState.selectedYear.includes(row.Year) && chartState.selectedFund.includes(row.CountryID)) {
				csvData.push({
					Year: row.Year,
					// Cluster: lists.clusterNames[row.ClusterCBPFCERFId],
					// Agency: lists.unAgencyShortNames[row.partnerCode],
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
				pdf.text("CERF by year", pdfMargins.left, 44);

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
			dataArray = selectionString.split(",").map(function(d) {
				return d.trim().toLowerCase();
			}),
			someInvalidValue = dataArray.some(function(d) {
				return !valuesInLowerCase(d3.values(dataList)).includes(d);
			});

		if (someInvalidValue) return d3.keys(dataList).map(d => +d);

		dataArray.forEach(function(d) {
			for (var key in dataList) {
				if (dataList[key].toLowerCase() === d) arr.push(key)
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