(function d3ChartIIFE() {

	const isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches);

	const width = 1100,
		padding = [4, 4, 4, 4],
		topPanelHeight = 60,
		buttonPanelHeight = 30,
		panelHorizontalPadding = 4,
		height = topPanelHeight + buttonPanelHeight + panelHorizontalPadding + padding[0] + padding[2],
		windowHeight = window.innerHeight,
		currentDate = new Date(),
		currentYear = currentDate.getFullYear(),
		localStorageTime = 3600000,
		csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
		fadeOpacity = 0.3,
		contributionType = ["pledge", "paid", "total"],
		formatMoney0Decimals = d3.format(",.0f"),
		formatPercent = d3.format(".0%"),
		formatNumberSI = d3.format(".3s"),
		flagWidth = 100,
		flagHeight = 60,
		flagDivHeight = 80,
		donorDivWidth = 110,
		donorDivNameHeight = 30,
		donorDivValueHeigh = 16,
		tooltipMargin = 2,
		donorDivHeight = donorDivNameHeight + flagDivHeight + donorDivValueHeigh,
		localVariable = d3.local(),
		othersId = "others",
		paidColor = "#9063CD",
		pledgedColor = "#E56A54",
		unBlue = "#1F69B3",
		highlightColor = "#F79A3B",
		buttonsNumber = 14,
		chartTitleDefault = "CERF Contributions",
		maxDonorString = 30,
		contributionsTotals = {},
		countryNames = {},
		yearsArray = [],
		memberStateType = "Member State",
		privateDonorsName = "Private Contributions",
		privateDonorsIsoCode = "xprv",
		vizNameQueryString = "contributions",
		allYearsOption = "all",
		isBookmarkPage = window.location.hostname + window.location.pathname === "cbpfgms.github.io/cerf-bi-stag/bookmark.html",
		bookmarkSite = "https://cbpfgms.github.io/cerf-bi-stag/bookmark.html?",
		helpPortalUrl = "https://gms.unocha.org/content/business-intelligence#CBPF_Contributions",
		dataUrl = "https://cbpfgms.github.io/pfbi-data/cerf_sample_data/CERF_ContributionTotal.csv",
		flagsUrl = "./assets/img/flags.json",
		moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
			"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
			"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
			"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
		],
		flagdAttribute = ["M42.49976,1.85205C31.6665-1.19629,20.8335,5.34863,10,2V22c10.8335,3.34863,21.6665-3.06836,32.49976-.02A.36246.36246,0,0,0,43,21.62793V2.5A.71722.71722,0,0,0,42.49976,1.85205Z",
			"M10,45H8V2A2,2,0,0,0,4,2V45H2a2.0001,2.0001,0,0,0-2,2v1H12V47A2.0001,2.0001,0,0,0,10,45Z"
		],
		flagViewBox = "0 0 43 48",
		blankFlag = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
		duration = 1000,
		shortDuration = 500,
		titlePadding = 24,
		classPrefix = "contribover",
		chartState = {
			selectedYear: [],
			selectedContribution: null,
			selectedDonors: []
		};

	let isSnapshotTooltipVisible = false,
		currentHoveredElement,
		timer,
		allTimeContributions = 0;

	const queryStringValues = new URLSearchParams(location.search);

	if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

	const containerDiv = d3.select("#d3chartcontainer" + classPrefix);

	const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

	const showLink = (containerDiv.node().getAttribute("data-showlink") === "true");

	const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

	const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

	const selectedCountriesString = queryStringValues.has("country") ? queryStringValues.get("country").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-selectedcountry");

	const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-year");

	const selectedContribution = queryStringValues.has("contribution") && contributionType.indexOf(queryStringValues.get("contribution")) > -1 ? queryStringValues.get("contribution") :
		contributionType.indexOf(containerDiv.node().getAttribute("data-contribution")) > -1 ?
		containerDiv.node().getAttribute("data-contribution") : "total";

	const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

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

	const donorsOuterDivMembers = containerDiv.append("div")
		.attr("class", classPrefix + "donorsOuterDivMembers");

	const donorsTopDivMembers = containerDiv.append("div")
		.attr("class", classPrefix + "donorsTopDivMembers");

	const donorsContainerMembers = containerDiv.append("div")
		.attr("class", classPrefix + "donorsContainerMembers");

	const donorsOuterDivNonMembers = containerDiv.append("div")
		.attr("class", classPrefix + "donorsOuterDivNonMembers");

	const donorsTopDivNonMembers = containerDiv.append("div")
		.attr("class", classPrefix + "donorsTopDivNonMembers");

	const donorsContainerNonMembers = containerDiv.append("div")
		.attr("class", classPrefix + "donorsContainerNonMembers");

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
			.attr("class", classPrefix + "TopPanel")
			.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
		width: width - padding[1] - padding[3],
		height: topPanelHeight,
		moneyBagPadding: 0,
		leftPadding: [176, 580, 900],
		mainValueVerPadding: 12,
		mainValueHorPadding: 4
	};

	const buttonPanel = {
		main: svg.append("g")
			.attr("class", classPrefix + "ButtonPanel")
			.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
		width: width - padding[1] - padding[3],
		height: buttonPanelHeight,
		padding: [0, 0, 0, 0],
		buttonWidth: 54,
		buttonPadding: 4,
		buttonVerticalPadding: 4,
		arrowPadding: 18,
		buttonContributionsWidth: 70,
		buttonContributionsPadding: 860
	};

	Promise.all([fetchFile("contributionsdata", dataUrl, "data", "csv"),
			fetchFile("contributionsflags", flagsUrl, "flags images", "json")
		])
		.then(allData => csvCallback(allData));

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

	function csvCallback([rawData, flagsData]) {

		rawData.forEach(function(d) {
			allTimeContributions += (+d.PaidAmt);
			if (d.GMSDonorISO2Code) countryNames[d.GMSDonorISO2Code.toLowerCase()] = d.GMSDonorName;
			if (d.PooledFundISO2Code) countryNames[d.PooledFundISO2Code.toLowerCase()] = d.PooledFundName;
			if (!yearsArray.includes(+d.FiscalYear)) yearsArray.push(+d.FiscalYear);
		});

		yearsArray.sort();

		validateYear(selectedYearString);

		chartState.selectedContribution = selectedContribution;

		if (!lazyLoad) {
			draw(rawData, flagsData);
		} else {
			d3.select(window).on("scroll." + classPrefix, checkPosition);
			d3.select("body").on("d3ChartsYear." + classPrefix, function() {
				chartState.selectedYear = [validateCustomEventYear(+d3.event.detail)]
			});
			checkPosition();
		};

		function checkPosition() {
			const containerPosition = containerDiv.node().getBoundingClientRect();
			if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
				d3.select(window).on("scroll." + classPrefix, null);
				draw(rawData, flagsData);
			};
		};

		//end of csvCallback
	};

	function draw(rawData, flagsData) {

		let data = processData(rawData);

		createTitle(rawData);

		createFooterDiv();

		createTopPanel();

		createButtonPanel();

		createDonorsDivs();

		setYearsDescriptionDiv(data);

		function clickButtonsRects(d, singleSelection) {

			if (singleSelection || d === allYearsOption || chartState.selectedYear[0] === allYearsOption) {
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

			const allYears = chartState.selectedYear[0] === allYearsOption ?
				allYearsOption.toLowerCase() :
				chartState.selectedYear.map(function(d) {
					return d;
				}).join("|");

			if (queryStringValues.has("year")) {
				queryStringValues.set("year", allYears);
			} else {
				queryStringValues.append("year", allYears);
			};

			d3.selectAll("." + classPrefix + "buttonsRects")
				.style("fill", function(e) {
					return chartState.selectedYear.indexOf(e) > -1 ? unBlue : "#eaeaea";
				});

			d3.selectAll("." + classPrefix + "buttonsText")
				.style("fill", function(e) {
					return chartState.selectedYear.indexOf(e) > -1 ? "white" : "#444";
				});

			data = processData(rawData);

			setYearsDescriptionDiv(data);

			createTopPanel();

			createDonorsDivs();

			//end of clickButtonsRects
		};

		function clickButtonsContributionsRects(d) {

			chartState.selectedContribution = d;

			if (queryStringValues.has("contribution")) {
				queryStringValues.set("contribution", d);
			} else {
				queryStringValues.append("contribution", d);
			};

			d3.selectAll("." + classPrefix + "buttonsContributionsRects")
				.style("fill", function(e) {
					return e === chartState.selectedContribution ? unBlue : "#eaeaea";
				});

			d3.selectAll("." + classPrefix + "buttonsContributionsText")
				.style("fill", function(e) {
					return e === chartState.selectedContribution ? "white" : "#444";
				});

			d3.select("." + classPrefix + "SvgLegend")
				.style("opacity", chartState.selectedContribution === "total" ? 1 : 0);

			data = processData(rawData);

			createTopPanel();

			createDonorsDivs();

			//end of clickButtonsContributionsRects
		};

		function createTitle(rawData) {

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

					chartState.selectedYear[0] = yearsArray[(index + 1) % yearsArray.length];

					const yearButton = d3.selectAll("." + classPrefix + "buttonsRects")
						.filter(function(d) {
							return d === chartState.selectedYear[0]
						});

					yearButton.dispatch("click");

					if (yearsArray.length > buttonsNumber) {

						const firstYearIndex = chartState.selectedYear[0] < yearsArray[buttonsNumber / 2] ?
							0 :
							chartState.selectedYear[0] > yearsArray[yearsArray.length - (buttonsNumber / 2)] || chartState.selectedYear[0] === allYearsOption ?
							yearsArray.length - buttonsNumber :
							yearsArray.indexOf(chartState.selectedYear[0]) - (buttonsNumber / 2);

						const currentTranslate = -(buttonPanel.buttonWidth * firstYearIndex);

						if (currentTranslate === 0) {
							svg.select("." + classPrefix + "LeftArrowGroup").select("text").style("fill", "#ccc")
							svg.select("." + classPrefix + "LeftArrowGroup").attr("pointer-events", "none");
						} else {
							svg.select("." + classPrefix + "LeftArrowGroup").select("text").style("fill", "#666")
							svg.select("." + classPrefix + "LeftArrowGroup").attr("pointer-events", "all");
						};

						if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth)) {
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

				const csv = createCsv(rawData);

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

		function createTopPanel() {

			let infoIconDiv, infoIcon;

			contributionType.forEach(function(d) {
				contributionsTotals[d] = d3.sum(data, function(e) {
					return e[d]
				});
			});

			const mainValue = d3.sum(data, function(d) {
				return d[chartState.selectedContribution]
			});

			const donorsNumber = data.filter(e => e[chartState.selectedContribution]).length;

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

			const previousValue = d3.select("." + classPrefix + "topPanelMainValue").size() !== 0 ? d3.select("." + classPrefix + "topPanelMainValue").datum() : 0;

			const previousDonors = d3.select("." + classPrefix + "topPanelDonorsNumber").size() !== 0 ? d3.select("." + classPrefix + "topPanelDonorsNumber").datum() : 0;

			const previousCbpfs = d3.select("." + classPrefix + "topPanelCbpfsNumber").size() !== 0 ? d3.select("." + classPrefix + "topPanelCbpfsNumber").datum() : 0;

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
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] - topPanel.mainValueHorPadding);

			topPanelMainValue.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousValue, d);
					return function(t) {
						const siString = formatSIFloat(i(t))
						node.textContent = "$" + siString.substring(0, siString.length - 1);
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
					return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
						" contributions";
				})
				.on("end", function() {
					const thisBox = this.getBBox();
					infoIcon.style("opacity", chartState.selectedYear[0] === allYearsOption ? 1 : 0);
					infoIconDiv.attr("transform", "translate(" + (thisBox.x + thisBox.width + 4) + "," + (thisBox.y + 18) + ")");
				})

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
				.text("for " + (chartState.selectedYear.length === 1 ? (chartState.selectedYear[0] === allYearsOption ? "all years" : chartState.selectedYear[0]) : "selected years\u002A"));

			let topPanelDonorsNumber = mainValueGroup.selectAll("." + classPrefix + "topPanelDonorsNumber")
				.data([donorsNumber]);

			topPanelDonorsNumber = topPanelDonorsNumber.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelDonorsNumber contributionColorFill")
				.attr("text-anchor", "end")
				.merge(topPanelDonorsNumber)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] - topPanel.mainValueHorPadding);

			topPanelDonorsNumber.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousDonors, d);
					return function(t) {
						node.textContent = ~~(i(t));
					};
				});

			let topPanelDonorsText = mainValueGroup.selectAll("." + classPrefix + "topPanelDonorsText")
				.data([true]);

			topPanelDonorsText = topPanelDonorsText.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelDonorsText")
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.merge(topPanelDonorsText)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * (chartState.selectedDonors.length ? 2.5 : 1.9))
				.text(data.length > 1 ? "Donors" : "Donor");

			let topPanelDonorsTextSubText = mainValueGroup.selectAll("." + classPrefix + "topPanelDonorsTextSubText")
				.data([true]);

			topPanelDonorsTextSubText = topPanelDonorsTextSubText.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelDonorsTextSubText")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.merge(topPanelDonorsTextSubText)
				.text(chartState.selectedDonors.length ? "(selected)" : "");

			const overRectangle = topPanel.main.selectAll("." + classPrefix + "topPanelOverRectangle")
				.data([true])
				.enter()
				.append("rect")
				.attr("class", classPrefix + "topPanelOverRectangle")
				.attr("width", topPanel.width)
				.attr("height", topPanel.height)
				.style("opacity", 0);

			overRectangle.on("mouseover", mouseOverTopPanel)
				.on("mousemove", mouseMoveTopPanel)
				.on("mouseout", mouseOutTopPanel);

			const allTimeValue = mainValueGroup.selectAll("." + classPrefix + "topPanelAllTimeValue")
				.data([allTimeContributions])
				.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelAllTimeValue contributionColorFill")
				.attr("text-anchor", "end")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] - topPanel.mainValueHorPadding)
				.text(d => "$" + formatSIFloat(d).substring(0, formatSIFloat(d).length - 1));

			const allTimeText = mainValueGroup.selectAll("." + classPrefix + "topPanelAllTimeText")
				.data([allTimeContributions])
				.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelAllTimeText")
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.7)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
				.text(function(d) {
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
						" received";
				});

			const allTimeSubText = mainValueGroup.selectAll("." + classPrefix + "topPanelAllTimeSubText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelAllTimeSubText")
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
				.text("since inception in 2006");

			infoIconDiv = topPanel.main.selectAll("." + classPrefix + "infoIconDiv")
				.data([true]);

			infoIconDiv = infoIconDiv.enter()
				.append("g")
				.attr("class", classPrefix + "infoIconDiv")
				.merge(infoIconDiv);

			infoIcon = infoIconDiv.selectAll("." + classPrefix + "infoIcon")
				.data(chartState.selectedYear[0] === allYearsOption && chartState.selectedContribution === "total" ? [true] : []);

			const infoIconExit = infoIcon.exit().remove();

			infoIcon = infoIcon.enter()
				.append("text")
				.attr("class", classPrefix + "infoIcon")
				.classed("contributionColorFill", true)
				.style("font-family", "FontAwesome")
				.style("font-size", "20px")
				.style("cursor", "default")
				.style("opacity", 0)
				.text("\uf05a");

			infoIcon.on("mouseover", function() {
				const thisBox = this.getBoundingClientRect();
				const containerBox = containerDiv.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top;

				const thisOffsetLeft = thisBox.left - containerBox.left + thisBox.width + 14;

				tooltip.style("display", "block")
					.html("Includes paid and pledged contributions.");

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", thisOffsetLeft + "px");
			}).on("mouseout", function() {
				if (isSnapshotTooltipVisible) return;
				tooltip.style("display", "none");
			});


			//end of createTopPanel
		};

		function createButtonPanel() {

			yearsArray.push(allYearsOption);

			const clipPath = buttonPanel.main.append("clipPath")
				.attr("id", classPrefix + "clip")
				.append("rect")
				.attr("width", buttonsNumber * buttonPanel.buttonWidth)
				.attr("height", buttonPanel.height);

			const clipPathGroup = buttonPanel.main.append("g")
				.attr("class", classPrefix + "ClipPathGroup")
				.attr("transform", "translate(" + (buttonPanel.padding[3] + buttonPanel.arrowPadding) + ",0)")
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
				.attr("width", buttonPanel.buttonWidth - buttonPanel.buttonPadding)
				.attr("height", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2)
				.attr("y", buttonPanel.buttonVerticalPadding)
				.attr("x", function(_, i) {
					return i * buttonPanel.buttonWidth + buttonPanel.buttonPadding / 2;
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
				.attr("y", buttonPanel.height / 1.6)
				.attr("x", function(_, i) {
					return i * buttonPanel.buttonWidth + buttonPanel.buttonWidth / 2;
				})
				.style("fill", function(d) {
					return chartState.selectedYear.indexOf(d) > -1 ? "white" : "#444";
				})
				.text(function(d) {
					return d === allYearsOption ? capitalize(allYearsOption) : d;
				});

			const buttonsContributionsGroup = buttonPanel.main.append("g")
				.attr("class", classPrefix + "buttonsContributionsGroup")
				.attr("transform", "translate(" + (buttonPanel.buttonContributionsPadding) + ",0)")
				.style("cursor", "pointer");

			const buttonsContributionsRects = buttonsContributionsGroup.selectAll(null)
				.data(contributionType)
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", classPrefix + "buttonsContributionsRects")
				.attr("width", buttonPanel.buttonContributionsWidth - buttonPanel.buttonPadding)
				.attr("height", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2)
				.attr("y", buttonPanel.buttonVerticalPadding)
				.attr("x", function(_, i) {
					return i * buttonPanel.buttonContributionsWidth + buttonPanel.buttonPadding / 2;
				})
				.style("fill", function(d) {
					return d === chartState.selectedContribution ? unBlue : "#eaeaea";
				});

			const buttonsContributionsText = buttonsContributionsGroup.selectAll(null)
				.data(contributionType)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", classPrefix + "buttonsContributionsText")
				.attr("y", buttonPanel.height / 1.6)
				.attr("x", function(_, i) {
					return i * buttonPanel.buttonContributionsWidth + buttonPanel.buttonContributionsWidth / 2;
				})
				.style("fill", function(d) {
					return d === chartState.selectedContribution ? "white" : "#444";
				})
				.text(function(d) {
					return d === "pledge" ? "Pledged" : capitalize(d);
				});

			const leftArrow = buttonPanel.main.append("g")
				.attr("class", classPrefix + "LeftArrowGroup")
				.style("cursor", "pointer")
				.attr("transform", "translate(" + buttonPanel.padding[3] + ",0)");

			const leftArrowRect = leftArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonPanel.arrowPadding)
				.attr("height", buttonPanel.height);

			const leftArrowText = leftArrow.append("text")
				.attr("class", classPrefix + "leftArrowText")
				.attr("x", 0)
				.attr("y", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2.1)
				.style("fill", "#666")
				.text("\u25c4");

			const rightArrow = buttonPanel.main.append("g")
				.attr("class", classPrefix + "RightArrowGroup")
				.style("cursor", "pointer")
				.attr("transform", "translate(" + (buttonPanel.padding[3] + buttonPanel.arrowPadding +
					(buttonsNumber * buttonPanel.buttonWidth)) + ",0)");

			const rightArrowRect = rightArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonPanel.arrowPadding)
				.attr("height", buttonPanel.height);

			const rightArrowText = rightArrow.append("text")
				.attr("class", classPrefix + "rightArrowText")
				.attr("x", -1)
				.attr("y", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2.1)
				.style("fill", "#666")
				.text("\u25ba");

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
				repositionButtonsGroup();
				checkArrows();
			});

			buttonsContributionsRects.on("mouseover", mouseOverButtonsContributionsRects)
				.on("mouseout", mouseOutButtonsContributionsRects)
				.on("click", clickButtonsContributionsRects);

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
						Math.min(0, (currentTranslate + buttonsNumber * buttonPanel.buttonWidth)) + ",0)")
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
						Math.max(-((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth),
							(-(Math.abs(currentTranslate) + buttonsNumber * buttonPanel.buttonWidth))) +
						",0)")
					.on("end", checkArrows);
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

				if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth)) {
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

				if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth)) {
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
					(-(buttonPanel.buttonWidth * firstYearIndex)) +
					",0)");

			};

			//end of createButtonPanel
		};

		function createDonorsDivs() {

			const donorsDataMembers = data.filter(e => e[chartState.selectedContribution] && e.donorType === memberStateType);

			const donorsDataNonMembers = data.filter(e => e[chartState.selectedContribution] && e.donorType !== memberStateType);

			if (donorsDataMembers.length && donorsDataNonMembers.length) {
				donorsContainerMembers.style("border-bottom", "2px dotted #ddd");
			} else {
				donorsContainerMembers.style("border-bottom", null);
			};

			createDonors(donorsDataMembers, "Members");
			createDonors(donorsDataNonMembers, "NonMembers");

			function createDonors(dataArray, type) {

				const container = type === "Members" ? donorsContainerMembers : donorsContainerNonMembers;

				const topDiv = type === "Members" ? donorsTopDivMembers : donorsTopDivNonMembers;

				let topFigureDiv = topDiv.selectAll("." + classPrefix + "topFigureDiv" + type)
					.data(dataArray.length ? [dataArray.length] : []);

				const topFigureDivExit = topFigureDiv.exit()
					.remove();

				const topFigureDivEnter = topFigureDiv.enter()
					.append("div")
					.attr("class", classPrefix + "topFigureDiv" + type);

				if (type === "Members") {
					const topFlag = topFigureDivEnter.append("div")
						.attr("class", classPrefix + "topFlag" + type);

					const flagSvg = topFlag.append("svg")
						.attr("viewBox", flagViewBox)
						.classed("contributionColorFill", true);

					flagSvg.append("path")
						.attr("d", flagdAttribute[0]);

					flagSvg.append("path")
						.attr("d", flagdAttribute[1]);
				};

				const topFigureRightDiv = topFigureDivEnter.append("div")
					.attr("class", classPrefix + "topFigureRightDiv" + type);

				const topFigureValue = topFigureRightDiv.append("div")
					.attr("class", classPrefix + "topFigureValue" + type)
					.html("0");

				const topFigureText = topFigureRightDiv.append("div")
					.attr("class", classPrefix + "topFigureText" + type)
					.html(type === "Members" ? "MEMBER STATES" : "OTHER DONORS");

				topFigureDiv = topFigureDivEnter.merge(topFigureDiv);

				topFigureDiv.select("." + classPrefix + "topFigureValue" + type)
					.transition()
					.duration(duration)
					.tween("html", (d, i, n) => {
						const interpolator = d3.interpolateRound(+(n[i].textContent), d);
						return t => n[i].textContent = interpolator(t);
					});

				let donorDiv = container.selectAll("." + classPrefix + "donorDiv" + type)
					.data(dataArray, d => d.isoCode);

				const donorDivExit = donorDiv.exit()
					.remove();

				const donorDivEnter = donorDiv.enter()
					.append("div")
					.attr("class", classPrefix + "donorDiv" + type);

				const flags = donorDivEnter.append("div")
					.attr("class", classPrefix + "flags" + type)
					.style("height", flagDivHeight + "px")
					.append("img")
					.style("max-width", flagWidth + "px")
					.attr("height", flagHeight + "px")
					.attr("src", d => {
						if (!flagsData[d.isoCode]) console.warn("Missing flag: " + d.donor, d);
						return flagsData[d.isoCode] || blankFlag;
					})
					.attr("alt", d => d.donor);

				const donorName = donorDivEnter.append("div")
					.attr("class", classPrefix + "donorName" + type)
					.style("height", donorDivNameHeight + "px");

				const donorNameText = donorName.append("span")
					.attr("class", classPrefix + "donorNameText" + type)
					.html(d => d.isoCode === privateDonorsIsoCode ? privateDonorsName : (d.donor.length > maxDonorString ? d.donor.substring(0, maxDonorString) + "..." : d.donor));

				const donorValue = donorDivEnter.append("div")
					.attr("class", classPrefix + "donorValue" + type)
					.style("height", donorDivValueHeigh + "px");

				const donorValueText = donorValue.append("span")
					.attr("class", classPrefix + "donorValueText" + type)
					.html("0");

				donorDiv = donorDivEnter.merge(donorDiv);

				donorDiv.order();

				donorDiv.select("." + classPrefix + "donorValueText" + type)
					.transition()
					.duration(duration)
					.tween("html", (d, i, n) => {
						const interpolator = d3.interpolate(n[i].textContent !== "0" ? reverseFormat(n[i].textContent) : 0, d[chartState.selectedContribution]);
						return t => n[i].textContent = formatSIFloat(interpolator(t)).replace("G", "B");
					})
					.on("end", (_, i, n) => n[i].textContent = trimZeros(n[i].textContent));

				donorDiv.on("mouseover", (d, i, n) => {

					currentHoveredElement = this;

					const thisBox = n[i].getBoundingClientRect();

					const containerBox = containerDiv.node().getBoundingClientRect();

					tooltip.style("display", "block")
						.html(null);

					const innerTooltipDiv = tooltip.append("div")
						.attr("class", classPrefix + "innerTooltipDiv");

					const topDiv = innerTooltipDiv.append("div")
						.attr("class", classPrefix + "topDiv")
						.html(d.isoCode === privateDonorsIsoCode ? privateDonorsName : d.donor);

					const valuesContainerDiv = innerTooltipDiv.append("div")
						.attr("class", classPrefix + "valuesContainerDiv");

					contributionType.forEach(function(type) {
						const textDiv = valuesContainerDiv.append("div")
							.attr("class", classPrefix + "textDiv")
							.html("Total " + (type === "total" ? "contributions " : type === "pledge" ? "pledged " : "paid ") + "<span class=" + classPrefix + "textDivPercentage></span>:");

						textDiv.select("span")
							.html(type === "total" ? "" : "(" + formatPercentCustom(d[type], d.total) + ")");

						const valueDiv = valuesContainerDiv.append("div")
							.attr("class", classPrefix + "valueDiv")
							.html(formatMoney0Decimals(d[type]));
					});

					const tooltipBox = tooltip.node().getBoundingClientRect();

					const thisOffset = thisBox.top - containerBox.top + (thisBox.height - tooltipBox.height) / 2;

					const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + tooltipMargin ?
						thisBox.left - containerBox.left + thisBox.width + tooltipMargin :
						thisBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

					tooltip.style("top", thisOffset + "px")
						.style("left", thisOffsetLeft + "px");
				}).on("mouseout", () => {
					if (isSnapshotTooltipVisible) return;
					currentHoveredElement = null;
					tooltip.style("display", "none");
				});

				//end of createDonors
			};

			//end of createDonorsDivs
		};

		function mouseOverTopPanel() {

			currentHoveredElement = this;

			const thisOffset = this.getBoundingClientRect().top - containerDiv.node().getBoundingClientRect().top;

			const mouseContainer = d3.mouse(containerDiv.node());

			const mouse = d3.mouse(this);

			tooltip.style("display", "block")
				.html("<div style='margin:0px;display:flex;flex-wrap:wrap;width:256px;'><div style='display:flex;flex:0 54%;'>Total contributions:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.total) +
					"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total pledged <span style='color: #888;'>(" + (formatPercentCustom(contributionsTotals.pledge, contributionsTotals.total)) +
					")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.pledge) + "</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercentCustom(contributionsTotals.paid, contributionsTotals.total)) +
					")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.paid) +
					"</span></div></div>");

			const tooltipSize = tooltip.node().getBoundingClientRect();

			localVariable.set(this, tooltipSize);

			tooltip.style("top", thisOffset + "px")
				.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
					mouseContainer[0] + 14 + "px" :
					mouseContainer[0] - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");

		};

		function mouseMoveTopPanel() {

			const thisOffset = this.getBoundingClientRect().top - containerDiv.node().getBoundingClientRect().top;

			const mouseContainer = d3.mouse(containerDiv.node());

			const mouse = d3.mouse(this);

			const tooltipSize = localVariable.get(this);

			tooltip.style("top", thisOffset + "px")
				.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
					mouseContainer[0] + 14 + "px" :
					mouseContainer[0] - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");

		};

		function mouseOutTopPanel() {
			if (isSnapshotTooltipVisible) return;
			currentHoveredElement = null;
			tooltip.style("display", "none");
		};

		function mouseOverButtonsRects(d) {
			tooltip.style("display", "block")
				.style("width", "200px")
				.html(d === allYearsOption ? "Click to show all years" : "Click for selecting a single year. Double-click or ALT + click for selecting multiple years.");

			const containerSize = containerDiv.node().getBoundingClientRect();

			const thisSize = this.getBoundingClientRect();

			tooltipSize = tooltip.node().getBoundingClientRect();

			tooltip.style("left", (thisSize.left + thisSize.width / 2 - containerSize.left) > containerSize.width - (tooltipSize.width / 2) - padding[1] ?
					containerSize.width - tooltipSize.width - padding[1] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) < tooltipSize.width / 2 + buttonPanel.padding[3] + padding[0] ?
					buttonPanel.padding[3] + padding[0] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) - (tooltipSize.width / 2) + "px")
				.style("top", (thisSize.top + thisSize.height / 2 - containerSize.top) < tooltipSize.height ? thisSize.top - containerSize.top + thisSize.height + 2 + "px" :
					thisSize.top - containerSize.top - tooltipSize.height - 4 + "px");

			d3.select(this).style("fill", unBlue);
			d3.select(this.parentNode).selectAll("text")
				.filter(function(e) {
					return e === d
				})
				.style("fill", "white");
		};

		function mouseOutButtonsRects(d) {
			tooltip.style("display", "none")
				.style("width", null);
			if (chartState.selectedYear.indexOf(d) > -1) return;
			d3.select(this).style("fill", "#eaeaea");
			d3.selectAll("." + classPrefix + "buttonsText")
				.filter(function(e) {
					return e === d
				})
				.style("fill", "#444");
		};

		function mouseOverButtonsContributionsRects(d) {
			d3.select(this).style("fill", unBlue);
			d3.select(this.parentNode).selectAll("text")
				.filter(function(e) {
					return e === d
				})
				.style("fill", "white");
		};

		function mouseOutButtonsContributionsRects(d) {
			if (d === chartState.selectedContribution) return;
			d3.select(this).style("fill", "#eaeaea");
			d3.selectAll("." + classPrefix + "buttonsContributionsText")
				.filter(function(e) {
					return e === d
				})
				.style("fill", "#444");
		};

		//end of draw
	};

	function processData(rawData) {

		const aggregatedDonors = rawData.reduce((acc, curr) => {

			if (chartState.selectedYear[0] === allYearsOption || chartState.selectedYear.indexOf(+curr.FiscalYear) > -1) {

				if (!curr.GMSDonorISO2Code) console.warn("Donor " + curr.GMSDonorName + " has no ISO code");

				const foundDonor = acc.find(e => e.isoCode === (curr.GMSDonorISO2Code ? curr.GMSDonorISO2Code.toLowerCase() : curr.GMSDonorISO2Code));

				if (foundDonor) {

					foundDonor.paid += +curr.PaidAmt;
					foundDonor.pledge += +curr.PledgeAmt;
					foundDonor.total += (+curr.PaidAmt) + (+curr.PledgeAmt);

				} else {

					acc.push({
						donor: curr.GMSDonorName,
						donorType: curr.PooledFundName,
						isoCode: (curr.GMSDonorISO2Code ? curr.GMSDonorISO2Code.toLowerCase() : curr.GMSDonorISO2Code),
						paid: +curr.PaidAmt,
						pledge: +curr.PledgeAmt,
						total: (+curr.PaidAmt) + (+curr.PledgeAmt)
					});

				};

			};

			return acc;

		}, []);

		aggregatedDonors.sort((a, b) => b[chartState.selectedContribution] - a[chartState.selectedContribution] ||
			(a.donor.toLowerCase() < b.donor.toLowerCase() ? -1 :
				a.donor.toLowerCase() > b.donor.toLowerCase() ? 1 : 0));

		return aggregatedDonors;

		//end of processData
	};

	function createCsv(rawData) {

		const csvData = [];

		rawData.forEach(function(row) {
			if (chartState.selectedYear.indexOf(+row.FiscalYear) > -1) {
				csvData.push({
					Year: row.FiscalYear,
					Donor: row.GMSDonorName,
					"Donor type": row.PooledFundName,
					Paid: row.PaidAmt,
					Pledged: row.PledgeAmt,
					Total: (+row.PaidAmt) + (+row.PledgeAmt)
				});
			};
		});

		const csv = d3.csvFormat(csvData);

		return csv;

		//end of createCsv
	};

	function parseTransform(translate) {

		const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

		group.setAttributeNS(null, "transform", translate);

		const matrix = group.transform.baseVal.consolidate().matrix;

		return [matrix.e, matrix.f];

	};

	function setYearsDescriptionDiv(data) {
		yearsDescriptionDiv.html(function() {
			if (chartState.selectedYear.length === 1) return null;
			const total = d3.sum(data, d => d[chartState.selectedContribution]);
			const valueSI = formatSIFloat(total);
			const unit = valueSI[valueSI.length - 1];
			const unitText = unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "";
			const totalNumber = +valueSI === +valueSI ? valueSI : valueSI.substring(0, valueSI.length - 1);
			const yearsList = chartState.selectedYear.sort(function(a, b) {
				return a - b;
			}).reduce(function(acc, curr, index) {
				return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
			}, "");
			return `\u002A$${totalNumber} ${unitText} received in ${yearsList}`;
		});
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

		createProgressWheel(downloadingDivSvg, 200, 175, downloadingDivText);

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

		containerDiv.selectAll("svg")
			.each(function() {
				const svgRealSize = this.getBoundingClientRect();
				d3.select(this).attr("width", svgRealSize.width)
					.attr("height", svgRealSize.height);
				setSvgStyles(this);
			});

		const imageDiv = containerDiv.node();

		if (type === "png") {
			iconsDiv.style("opacity", 0);
		} else {
			topDiv.style("opacity", 0)
		};

		snapshotTooltip.style("display", "none");

		svg.selectAll("image")
			.attr("xlink:href", function(d) {
				return localStorage.getItem("storedFlag" + d.isoCode);
			});

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
			bottom: 16,
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
				pdf.text("Contributions", pdfMargins.left, 44);

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

	function validateYear(yearString) {
		if (yearString.toLowerCase() === allYearsOption) {
			chartState.selectedYear.push(allYearsOption);
			return;
		};
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

	function validateCustomEventYear(yearNumber) {
		if (yearsArray.indexOf(yearNumber) > -1) {
			return yearNumber;
		};
		while (yearsArray.indexOf(yearNumber) === -1) {
			yearNumber = yearNumber >= currentYear ? yearNumber - 1 : yearNumber + 1;
		};
		return yearNumber;
	};

	function capitalize(str) {
		return str[0].toUpperCase() + str.substring(1)
	};

	function formatSIFloat(value) {
		const length = (~~Math.log10(value) + 1) % 3;
		const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
		return d3.formatPrefix("." + digits, value)(value);
	};

	function formatPercentCustom(dividend, divisor) {
		const percentage = formatPercent(dividend / divisor);
		return +(percentage.split("%")[0]) === 0 && (dividend / divisor) !== 0 ? "<1%" : percentage;
	};

	function trimZeros(numberString) {
		while ((numberString[numberString.length - 2] === "0" && numberString.indexOf(".") > -1) || numberString[numberString.length - 2] === ".") {
			numberString = numberString.slice(0, -2) + numberString.slice(-1);
		};
		return numberString;
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