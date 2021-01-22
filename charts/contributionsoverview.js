(function d3ChartIIFE() {

	return;//REMOVE THIS

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
		contributionType = ["paid", "pledge", "total"],
		formatMoney0Decimals = d3.format(",.0f"),
		formatPercent = d3.format(".0%"),
		formatNumberSI = d3.format(".3s"),
		flagSize = 100,
		maxTextSize = 160,
		maxTextLength = 26,
		localVariable = d3.local(),
		othersId = "others",
		paidColor = "#9063CD",
		pledgedColor = "#E56A54",
		unBlue = "#1F69B3",
		highlightColor = "#F79A3B",
		buttonsNumber = 12,
		verticalLabelPadding = 0,
		barLabelPadding = 6,
		chartTitleDefault = "CERF Contributions",
		contributionsTotals = {},
		countryNames = {},
		vizNameQueryString = "contributions",
		bookmarkSite = "https://bi-home.gitlab.io/CBPF-BI-Homepage/bookmark.html?",
		helpPortalUrl = "https://gms.unocha.org/content/business-intelligence#CBPF_Contributions",
		dataUrl = "https://cbpfgms.github.io/pfbi-data/cerf_sample_data/CERF_ContributionTotal.csv",
		flagsUrl = "./assets/img/flags.json",
		moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
			"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
			"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
			"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
		],
		duration = 1000,
		shortDuration = 500,
		titlePadding = 24,
		classPrefix = "contribover",
		chartState = {
			selectedYear: [],
			selectedContribution: null,
			selectedDonors: []
		};

	let yearsArray,
		isSnapshotTooltipVisible = false,
		currentHoveredRect,
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

	const yearsDescriptionDiv = containerDiv.append("div")
		.attr("class", classPrefix + "YearsDescriptionDiv");

	const selectionDescriptionDiv = containerDiv.append("div")
		.attr("class", classPrefix + "SelectionDescriptionDiv");

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

	const xScaleDonors = d3.scaleLinear();

	const yScaleDonors = d3.scalePoint()
		.padding(1);

	const xAxisDonors = d3.axisTop(xScaleDonors)
		.tickSizeOuter(0)
		.ticks(5)
		.tickFormat(function(d) {
			return "$" + formatSIaxes(d).replace("G", "B");
		});

	const yAxisDonors = d3.axisLeft(yScaleDonors)
		.tickSizeInner(2)
		.tickSizeOuter(0)
		.tickPadding(flagPadding)
		.tickFormat(function(d) {
			return d.length > maxTextLength ? d.substring(0, maxTextLength) + "..." : d;
		});

	const groupXAxisDonors = donorsPanel.main.append("g")
		.attr("class", classPrefix + "groupXAxisDonors")
		.attr("transform", "translate(0," + donorsPanel.padding[0] + ")");

	const groupYAxisDonors = donorsPanel.main.append("g")
		.attr("class", classPrefix + "groupYAxisDonors");

	const paidSymbol = d3.symbol()
		.type(d3.symbolTriangle)
		.size(paidSymbolSize);

	const xScaleBar = d3.scaleBand()
		.paddingInner(0.6)
		.paddingOuter(0.5);

	const yScaleBar = d3.scaleLinear()
		.range([barchartPanel.height - barchartPanel.padding[2], barchartPanel.padding[0]]);

	const xAxisBar = d3.axisBottom(xScaleBar)
		.tickSizeInner(0)
		.tickPadding(6);

	const xAxisBarGroup = barchartPanel.main.append("g")
		.attr("class", classPrefix + "aAxisBarsGroup")
		.attr("transform", "translate(0," + (barchartPanel.height - barchartPanel.padding[2]) + ")");

	if (localStorage.getItem(classPrefix + "data") &&
		JSON.parse(localStorage.getItem(classPrefix + "data")).timestamp > (currentDate.getTime() - localStorageTime)) {
		const rawData = d3.csvParse(JSON.parse(localStorage.getItem(classPrefix + "data")).data);
		console.info(classPrefix + ": data from local storage");
		csvCallback(rawData);
	} else {
		d3.csv(dataUrl).then(function(rawData) {
			try {
				localStorage.setItem(classPrefix + "data", JSON.stringify({
					data: d3.csvFormat(rawData),
					timestamp: currentDate.getTime()
				}));
			} catch (error) {
				console.info("D3 chart Contribution Overview, " + error);
			};
			console.info(classPrefix + ": data from API");
			csvCallback(rawData);
		});
	};

	function csvCallback(rawData) {

		yearsArray = rawData.map(function(d) {
			allTimeContributions += (+d.PaidAmt);
			if (!countryNames[d.GMSDonorISO2Code.toLowerCase()]) countryNames[d.GMSDonorISO2Code.toLowerCase()] = d.GMSDonorName;
			if (!countryNames[d.PooledFundISO2Code.toLowerCase()]) countryNames[d.PooledFundISO2Code.toLowerCase()] = d.PooledFundName;
			return +d.FiscalYear
		}).filter(function(value, index, self) {
			return self.indexOf(value) === index;
		}).sort();

		validateYear(selectedYearString);

		chartState.selectedContribution = selectedContribution;

		const allDonors = rawData.map(function(d) {
			if (d.GMSDonorISO2Code === "") d.GMSDonorISO2Code = "UN";
			return d.GMSDonorISO2Code.toLowerCase();
		}).filter(function(value, index, self) {
			return self.indexOf(value) === index;
		});

		saveFlags(allDonors);

		if (!lazyLoad) {
			draw(rawData);
		} else {
			d3.select(window).on("scroll." + classPrefix, checkPosition);
			checkPosition();
		};

		function checkPosition() {
			const containerPosition = containerDiv.node().getBoundingClientRect();
			if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
				d3.select(window).on("scroll." + classPrefix, null);
				draw(rawData);
			};
		};

		//end of csvCallback
	};

	function draw(rawData) {

		const dataArray = processData(rawData);

		const data = {
			dataDonors: dataArray[0],
			donorTypes: dataArray[1]
		};

		// const allDonors = data.dataDonors.map(function(d) {
		// 	return d.isoCode;
		// });

		//validateCountries(selectedCountriesString, allDonors, allCbpfs);

		//createTitle();

		createFooterDiv();

		recalculateAndResize();

		translateAxes();

		createSVGLegend();

		createTopPanel();

		createButtonPanel();

		createDonorsPanel();

		createBarChartPanel();

		setYearsDescriptionDiv(data.dataDonors);

		if (showHelp) createAnnotationsDiv();

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

			d3.selectAll("." + classPrefix + "buttonsRects")
				.style("fill", function(e) {
					return chartState.selectedYear.indexOf(e) > -1 ? unBlue : "#eaeaea";
				});

			d3.selectAll("." + classPrefix + "buttonsText")
				.style("fill", function(e) {
					return chartState.selectedYear.indexOf(e) > -1 ? "white" : "#444";
				});

			const dataArray = processData(rawData);

			data.dataDonors = dataArray[0];
			data.donorTypes = dataArray[1];

			setYearsDescriptionDiv(data.dataDonors);

			const allDonors = data.dataDonors.map(function(d) {
				return d.isoCode;
			});

			chartState.selectedDonors = chartState.selectedDonors.filter(function(d) {
				return allDonors.indexOf(d) > -1;
			});

			recalculateAndResize();

			createSVGLegend();

			createTopPanel();

			createDonorsPanel();

			createBarChartPanel();

			populateSelectedDescriptionDiv();

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

			const dataArray = processData(rawData);

			data.dataDonors = dataArray[0];
			data.donorTypes = dataArray[1];

			recalculateAndResize();

			createTopPanel();

			createDonorsPanel();

			createBarChartPanel();

			//end of clickButtonsContributionsRects
		};

		function createSVGLegend() {

			const legend = svg.selectAll("." + classPrefix + "SvgLegend")
				.data([true]);

			const legendEnter = legend.enter()
				.append("text")
				.attr("class", classPrefix + "SvgLegend")
				.attr("y", height - legendPadding)
				.attr("x", padding[3] + 2)
				.text("Figures represent: ")
				.append("tspan")
				.style("font-weight", "bold")
				.style("fill", "#666")
				.text("Total ")
				.append("tspan")
				.style("font-weight", "normal")
				.text("(")
				.append("tspan")
				.style("font-weight", "bold")
				.style("fill", paidColor)
				.text("Paid")
				.append("tspan")
				.style("fill", "#666")
				.style("font-weight", "normal")
				.text("/")
				.append("tspan")
				.style("font-weight", "bold")
				.style("fill", pledgedColor)
				.text("Pledged")
				.append("tspan")
				.style("font-weight", "normal")
				.style("fill", "#666")
				.text(")")
				.append("tspan")
				.style("font-weight", "normal")
				.style("fill", "#666")
				.text(". The arrow (")
				.append("tspan")
				.style("fill", paidColor)
				.text("\u25B2")
				.append("tspan")
				.style("fill", "#666")
				.text(") indicates the paid amount.")

			legend.transition()
				.duration(duration)
				.attr("y", height - legendPadding);

			//end of createSVGLegend
		};

		function createTitle() {

			const title = titleDiv.append("p")
				.attr("id", classPrefix + "d3chartTitle")
				.html(chartTitle);

			const helpIcon = iconsDiv.append("button")
				.attr("id", classPrefix + "HelpButton");

			helpIcon.html("HELP  ")
				.append("span")
				.attr("class", "fa fa-info");

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

					const firstYearIndex = chartState.selectedYear[0] < yearsArray[buttonsNumber / 2] ?
						0 :
						chartState.selectedYear[0] > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
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

				const csv = createCsv(rawData);

				const currentDate = new Date();

				const fileName = "CBPFcontributions_" + csvDateFormat(currentDate) + ".csv";

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

			const dataDonors = data.dataDonors;
			const donorTypes = data.donorTypes;

			contributionType.forEach(function(d) {
				contributionsTotals[d] = d3.sum(dataDonors, function(e) {
					return e[d]
				});
			});

			const mainValue = d3.sum(dataDonors, function(d) {
				return d[chartState.selectedContribution]
			});

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

			const receivedOrDonated = chartState.selectedDonors.length ? " donated in " : " received in ";

			topPanelMainText.transition()
				.duration(duration)
				.style("opacity", 1)
				.text(function(d) {
					const yearsText = chartState.selectedYear.length === 1 ? chartState.selectedYear[0] : "selected years\u002A";
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
						receivedOrDonated + yearsText;
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
					return "(Total " +
						(chartState.selectedContribution === "total" ? "Contributions" :
							chartState.selectedContribution === "pledge" ? "Pledged" : "Paid") +
						")"
				});

			let topPanelDonorsNumber = mainValueGroup.selectAll("." + classPrefix + "topPanelDonorsNumber")
				.data([donorTypes.length]);

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
				.text(dataDonors.length > 1 ? "Donors" : "Donor");

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


			//end of createTopPanel
		};

		function createButtonPanel() {

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
					return d;
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
					if (d === "pledge") {
						return "Pledged"
					} else {
						return capitalize(d);
					};
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

		function createDonorsPanel() {

			let donorsArray = data.dataDonors;

			donorsArray.sort(function(a, b) {
				return a.isoCode === othersId ? 1 : b.isoCode === othersId ? -1 : (b[chartState.selectedContribution] - a[chartState.selectedContribution] ||
					(a.donor.toLowerCase() < b.donor.toLowerCase() ? -1 :
						a.donor.toLowerCase() > b.donor.toLowerCase() ? 1 : 0));
			});

			yScaleDonors.domain(donorsArray.map(function(d) {
				return d.donor;
			})).range([donorsPanel.padding[0], Math.min(donorsPanel.height - donorsPanel.padding[2], donorsPanel.padding[0] + lollipopGroupHeight * (donorsArray.length + 1))])

			let donorsPanelTitle = donorsPanel.main.selectAll("." + classPrefix + "DonorsPanelTitle")
				.data([true]);

			donorsPanelTitle = donorsPanelTitle.enter()
				.append("text")
				.attr("class", classPrefix + "DonorsPanelTitle")
				.attr("y", donorsPanel.padding[0] - titlePadding)
				.attr("x", donorsPanel.padding[3])
				.merge(donorsPanelTitle)
				.text(donorsArray.length === 21 ? "Top 20 Donors" : donorsArray.length > 1 ? "Donors" : "Donor");

			donorsPanelTitle.transition()
				.duration(duration)
				.attr("x", donorsPanel.padding[3]);

			let donorGroup = donorsPanel.main.selectAll("." + classPrefix + "DonorGroup")
				.data(donorsArray, function(d) {
					return d.isoCode;
				});

			const donorGroupExit = donorGroup.exit()
				.remove();

			const donorGroupEnter = donorGroup.enter()
				.append("g")
				.attr("class", classPrefix + "DonorGroup")
				.attr("transform", function(d) {
					return "translate(0," + yScaleDonors(d.donor) + ")";
				});

			const donorStickEnter = donorGroupEnter.append("rect")
				.attr("class", classPrefix + "DonorStick")
				.attr("x", donorsPanel.padding[3])
				.attr("y", -(stickHeight / 2 - (stickHeight / 4)))
				.attr("height", stickHeight)
				.attr("width", 0)
				.classed("contributionColorFill", true);

			const donorLollipopEnter = donorGroupEnter.append("circle")
				.attr("class", classPrefix + "DonorLollipop")
				.attr("cx", donorsPanel.padding[3])
				.attr("cy", (stickHeight / 4))
				.attr("r", lollipopRadius)
				.classed("contributionColorFill", true);

			const donorFlagEnter = donorGroupEnter.append("image")
				.attr("class", classPrefix + "DonorFlag")
				.attr("width", flagSize)
				.attr("height", flagSize)
				.attr("x", donorsPanel.padding[3] - flagPadding)
				.attr("y", -flagSize / 2 + 1)
				.attr("xlink:href", function(d) {
					return localStorage.getItem("storedFlag" + d.isoCode) ? localStorage.getItem("storedFlag" + d.isoCode) :
						flagsDirectory + d.isoCode + ".png";
				})
				.on("error", function(d) {
					d3.select(this).attr("xlink:href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAGklEQVR42mP8/5+BJMA4qmFUw6iGUQ201QAAYiIv6RZuPWMAAAAASUVORK5CYII=");
				})

			const donorPaidIndicatorEnter = donorGroupEnter.append("path")
				.attr("class", classPrefix + "DonorPaidIndicator")
				.attr("d", paidSymbol)
				.style("fill", paidColor)
				.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
				.attr("transform", "translate(" + donorsPanel.padding[3] + "," +
					((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight) + ")");

			const donorLabelEnter = donorGroupEnter.append("text")
				.attr("class", classPrefix + "DonorLabel")
				.attr("x", donorsPanel.padding[3] + donorsPanel.labelPadding)
				.attr("y", verticalLabelPadding)
				.text(formatNumberSI(0));

			const donorTooltipRectangleEnter = donorGroupEnter.append("rect")
				.attr("class", classPrefix + "DonorTooltipRectangle")
				.attr("y", -lollipopGroupHeight / 2)
				.attr("height", lollipopGroupHeight)
				.attr("width", donorsPanel.width)
				.style("fill", "none")
				.attr("pointer-events", "all");

			donorGroup = donorGroupEnter.merge(donorGroup);

			donorGroup.transition()
				.duration(duration)
				.attr("transform", function(d) {
					return "translate(0," + yScaleDonors(d.donor) + ")";
				});

			donorGroup.select("." + classPrefix + "DonorStick")
				.transition()
				.duration(duration)
				.attr("x", donorsPanel.padding[3])
				.attr("width", function(d) {
					return xScaleDonors(d[chartState.selectedContribution]) - donorsPanel.padding[3];
				});

			donorGroup.select("." + classPrefix + "DonorLollipop")
				.transition()
				.duration(duration)
				.attr("cx", function(d) {
					return xScaleDonors(d[chartState.selectedContribution]);
				});

			donorGroup.select("." + classPrefix + "DonorFlag")
				.transition()
				.duration(duration)
				.attr("x", donorsPanel.padding[3] - flagPadding);

			donorGroup.select("." + classPrefix + "DonorPaidIndicator")
				.transition()
				.duration(duration)
				.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
				.attr("transform", function(d) {
					const thisPadding = xScaleDonors(d.total) - xScaleDonors(d.paid) < lollipopRadius ?
						lollipopRadius - (stickHeight / 2) : 0;
					return "translate(" + xScaleDonors(d.paid) + "," +
						((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight + thisPadding) + ")";
				});

			donorGroup.select("." + classPrefix + "DonorLabel")
				.transition()
				.duration(duration)
				.attr("x", function(d) {
					return xScaleDonors(d[chartState.selectedContribution]) + donorsPanel.labelPadding;
				})
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent) || 0, d[chartState.selectedContribution]);

					function populateLabel(selection) {
						selection.append("tspan")
							.attr("class", classPrefix + "DonorLabelPercentage")
							.attr("dy", "-0.5px")
							.text(" (")
							.append("tspan")
							.style("fill", paidColor)
							.text(d3.formatPrefix(".0", d.paid)(d.paid).replace("G", "B"))
							.append("tspan")
							.style("fill", "#aaa")
							.text("/")
							.append("tspan")
							.style("fill", pledgedColor)
							.text(d3.formatPrefix(".0", d.pledge)(d.pledge).replace("G", "B"))
							.append("tspan")
							.style("fill", "#aaa")
							.text(")");
					};

					return function(t) {
						const thisLabel = d3.select(node).text(d3.formatPrefix(".0", d[chartState.selectedContribution])(i(t)).replace("G", "B"));
						if (chartState.selectedContribution === "total") {
							thisLabel.call(populateLabel);
						} else {
							thisLabel.append("tspan")
								.text(null);
						};
					};
				});

			const donorTooltipRectangle = donorGroup.select("." + classPrefix + "DonorTooltipRectangle");

			donorTooltipRectangle.on("mouseover", mouseoverTooltipRectangle)
				.on("mouseout", mouseoutTooltipRectangle);

			xAxisDonors.tickSizeInner(-(yScaleDonors.range()[1] - yScaleDonors.range()[0]));

			groupYAxisDonors.selectAll(".tick")
				.filter(function(d) {
					return yScaleDonors.domain().indexOf(d) === -1
				})
				.remove();

			groupYAxisDonors.transition()
				.duration(duration)
				.attr("transform", "translate(" + donorsPanel.padding[3] + ",0)")
				.call(yAxisDonors);

			groupXAxisDonors.transition()
				.duration(duration)
				.call(xAxisDonors);

			groupXAxisDonors.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			setGroupOpacity();

			function mouseoverTooltipRectangle(datum) {

				currentHoveredRect = this;

				chartState.selectedDonors.push(datum.isoCode);

				donorGroup.style("opacity", function(d) {
					return chartState.selectedDonors.indexOf(d.isoCode) > -1 ? 1 : fadeOpacity;
				});

				groupYAxisDonors.selectAll(".tick")
					.style("opacity", function(d) {
						const isoCode = Object.keys(countryNames).find(function(e) {
							return countryNames[e] === d;
						});
						return chartState.selectedDonors.indexOf(isoCode) > -1 ? 1 : fadeOpacity;
					});

				tooltip.style("display", "block");

				if (datum.isoCode === othersId) {
					const othersData = datum.donorsList.reduce((acc, curr) => {
						if (curr[chartState.selectedContribution]) {
							const found = acc.find(e => e.donorType === curr.donorType);
							if (found) {
								++found.number;
								found.total += curr.total;
								found.paid += curr.paid;
								found.pledge += curr.pledge;
							} else {
								acc.push({
									donorType: curr.donorType,
									number: 1,
									total: curr.total,
									paid: curr.paid,
									pledge: curr.pledge
								})
							};
						};
						return acc;
					}, []);
					othersData.forEach(row => {
						tooltip.append("div")
							.html("<div class='" + classPrefix + "tooltipTitle'>Type: <strong>" + row.donorType + "</strong> (" + row.number + ")</div><br><div style='margin-bottom:14px;margin-top:6px;display:flex;flex-wrap:wrap;width:262px;'><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 54%;'>Total contributions:</div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.total) +
								"</span></div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercentCustom(row.paid, row.total)) +
								")</span>:</div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(row.paid) +
								"</span></div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 54%;white-space:pre;'>Total pledged <span style='color: #888;'>(" + (formatPercentCustom(row.pledge, row.total)) +
								")</span>:</div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(row.pledge) + "</span></div></div>")
					});
				} else {
					tooltip.html("<div class='" + classPrefix + "tooltipTitle'>Donor: <strong>" + datum.donor + "</strong></div><br><div class='" + classPrefix + "tooltipRow' style='margin-bottom:8px;margin-top:8px;'>Type: " + (datum.donorType || "n/a") + "</div><div style='margin:0px;display:flex;flex-wrap:wrap;width:262px;'><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 54%;'>Total contributions:</div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.total) +
						"</span></div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercentCustom(datum.paid, datum.total)) +
						")</span>:</div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.paid) +
						"</span></div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 54%;white-space:pre;'>Total pledged <span style='color: #888;'>(" + (formatPercentCustom(datum.pledge, datum.total)) +
						")</span>:</div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.pledge) + "</span></div></div>");
				};

				const thisBox = this.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = datum.isoCode === othersId ? thisBox.top - containerBox.top - tooltipBox.height - lollipopGroupHeight : thisBox.top - containerBox.top;

				const thisOffsetLeft = thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2;

				tooltip.style("top", thisOffsetTop + 22 + "px")
					.style("left", thisOffsetLeft + "px");

			};

			function mouseoutTooltipRectangle(datum) {

				if (isSnapshotTooltipVisible) return;

				currentHoveredRect = null;

				const index = chartState.selectedDonors.indexOf(datum.isoCode);
				if (index > -1) {
					chartState.selectedDonors.splice(index, 1);
				};

				setGroupOpacity();

				tooltip.style("display", "none")
					.html(null);

			};

			function setGroupOpacity() {
				if (!chartState.selectedDonors.length) {
					donorGroup.style("opacity", 1);
					groupYAxisDonors.selectAll(".tick").style("opacity", 1);
				} else {
					donorGroup.style("opacity", function(d) {
						return chartState.selectedDonors.indexOf(d.isoCode) > -1 ? 1 : fadeOpacity;
					});
					groupYAxisDonors.selectAll(".tick")
						.style("opacity", function(d) {
							const isoCode = Object.keys(countryNames).find(function(e) {
								return countryNames[e] === d;
							});
							return chartState.selectedDonors.indexOf(isoCode) > -1 ? 1 : fadeOpacity;
						});
				};
			};

			//end of createDonorsPanel
		};

		function createBarChartPanel() {

			const donorTypes = data.donorTypes;

			const barChartPanelTitle = barchartPanel.main.selectAll("." + classPrefix + "BarChartPanelTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", classPrefix + "BarChartPanelTitle")
				.attr("y", barchartPanel.padding[0] - titlePadding)
				.attr("x", barchartPanel.padding[3])
				.text("Number of donors");

			const dataBar = donorTypes.reduce((acc, curr) => {
				if (curr[chartState.selectedContribution]) {
					const found = acc.find(e => e.type === curr.donorType);
					if (found) {
						++found.number;
						found.total += curr.total;
						found.paid += curr.paid;
						found.pledge += curr.pledge;
					} else {
						acc.push({
							type: curr.donorType,
							number: 1,
							total: curr.total,
							paid: curr.paid,
							pledge: curr.pledge
						})
					};
				};
				return acc;
			}, []);

			dataBar.sort((a, b) => b.number - a.number);

			xScaleBar.domain(dataBar.map(d => d.type))
				.range([barchartPanel.padding[3], Math.min(barchartPanel.width - barchartPanel.padding[1],
					barchartPanel.padding[3] + maxBarWidth * (dataBar.length + 1))]);

			yScaleBar.domain([0, d3.max(dataBar, d => d.number) * 1.1]);

			let bars = barchartPanel.main.selectAll("." + classPrefix + "bars")
				.data(dataBar, d => d.type);

			const barsExit = bars.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.attr("height", 0)
				.attr("y", barchartPanel.height - barchartPanel.padding[2])
				.remove();

			const barsEnter = bars.enter()
				.append("rect")
				.attr("class", classPrefix + "bars contributionColorFill")
				.attr("x", d => xScaleBar(d.type))
				.attr("width", xScaleBar.bandwidth())
				.attr("height", 0)
				.attr("y", barchartPanel.height - barchartPanel.padding[2]);

			bars = barsEnter.merge(bars);

			bars.transition()
				.duration(duration)
				.attr("x", d => xScaleBar(d.type))
				.attr("width", xScaleBar.bandwidth())
				.attr("height", d => barchartPanel.height - barchartPanel.padding[2] - yScaleBar(d.number))
				.attr("y", d => yScaleBar(d.number));

			let barsLabels = barchartPanel.main.selectAll("." + classPrefix + "barsLabels")
				.data(dataBar, d => d.type);

			const barsLabelsExit = barsLabels.exit()
				.remove();

			const barsLabelsEnter = barsLabels.enter()
				.append("text")
				.attr("class", classPrefix + "barsLabels")
				.attr("x", d => xScaleBar(d.type) + xScaleBar.bandwidth() / 2)
				.attr("y", d => yScaleBar(0));

			barsLabels = barsLabelsEnter.merge(barsLabels);

			barsLabels.transition()
				.duration(duration)
				.attr("x", d => xScaleBar(d.type) + xScaleBar.bandwidth() / 2)
				.attr("y", d => yScaleBar(d.number) - 3.5 * barLabelPadding)
				.text(d => d.number + (d.number > 1 ? " donors" : " donor"));

			let barsLabelsSpan = barchartPanel.main.selectAll("." + classPrefix + "barsLabelsSpan")
				.data(dataBar, d => d.type);

			const barsLabelsSpanExit = barsLabelsSpan.exit()
				.remove();

			const barsLabelsSpanEnter = barsLabelsSpan.enter()
				.append("text")
				.attr("class", classPrefix + "barsLabelsSpan")
				.attr("x", d => xScaleBar(d.type) + xScaleBar.bandwidth() / 2)
				.attr("y", d => yScaleBar(0));

			barsLabelsSpan = barsLabelsSpanEnter.merge(barsLabelsSpan);

			barsLabelsSpan.transition()
				.duration(duration)
				.attr("x", d => xScaleBar(d.type) + xScaleBar.bandwidth() / 2)
				.attr("y", d => yScaleBar(d.number) - barLabelPadding)
				.text(d => "($" + formatSIFloat(d.total).replace("G", "B") + ")");

			xAxisBarGroup.transition()
				.duration(duration)
				.call(customAxisBarChart);

			function customAxisBarChart(group) {
				const sel = group.selection ? group.selection() : group;
				group.call(xAxisBar);
				sel.selectAll(".tick text")
					.text(d => d === "Member State" ? "Member States" : d)
					.call(wrapText, xScaleBar.step() - 4)
				if (sel !== group) group.selectAll(".tick text")
					.attrTween("x", null)
					.tween("text", null);
			};

			let barsTooltip = barchartPanel.main.selectAll("." + classPrefix + "barsTooltip")
				.data(dataBar, d => d.type);

			const barsTooltipExit = barsTooltip.exit()
				.remove();

			const barsTooltipEnter = barsTooltip.enter()
				.append("rect")
				.attr("class", classPrefix + "barsTooltip")
				.attr("x", d => xScaleBar(d.type))
				.attr("width", xScaleBar.bandwidth())
				.style("opacity", 0)
				.style("pointer-events", "all")
				.attr("height", barchartPanel.height - barchartPanel.padding[0] - barchartPanel.padding[2])
				.attr("y", barchartPanel.padding[0]);

			barsTooltip = barsTooltipEnter.merge(barsTooltip);

			barsTooltip.transition()
				.duration(duration)
				.attr("x", d => xScaleBar(d.type))
				.attr("width", xScaleBar.bandwidth());

			barsTooltip.on("mouseover", mouseoverBarTooltip)
				.on("mouseout", mouseoutBarTooltip)

			///


			function mouseoverBarTooltip(datum) {

				currentHoveredRect = this;

				tooltip.style("display", "block");

				tooltip.html("<div class='" + classPrefix + "tooltipTitle'>Type: <strong>" + datum.type + "</strong> (" + datum.number + ")</div><br><div style='margin-bottom:14px;margin-top:6px;display:flex;flex-wrap:wrap;width:262px;'><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 54%;'>Total contributions:</div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.total) +
					"</span></div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercentCustom(datum.paid, datum.total)) +
					")</span>:</div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.paid) +
					"</span></div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 54%;white-space:pre;'>Total pledged <span style='color: #888;'>(" + (formatPercentCustom(datum.pledge, datum.total)) +
					")</span>:</div><div class='" + classPrefix + "tooltipRow' style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.pledge) + "</span></div></div>")

				const thisBox = this.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top + thisBox.height / 2 - tooltipBox.height / 2;

				const thisOffsetLeft = thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2;

				tooltip.style("top", thisOffsetTop + 22 + "px")
					.style("left", thisOffsetLeft + "px");

			};

			function mouseoutBarTooltip(datum) {

				if (isSnapshotTooltipVisible) return;

				tooltip.style("display", "none")
					.html(null);

			};

			//end of createBarChartPanel
		};

		function mouseOverTopPanel() {

			const thisOffset = this.getBoundingClientRect().top - containerDiv.node().getBoundingClientRect().top;

			const mouseContainer = d3.mouse(containerDiv.node());

			const mouse = d3.mouse(this);

			tooltip.style("display", "block")
				.html("<div style='margin:0px;display:flex;flex-wrap:wrap;width:256px;'><div style='display:flex;flex:0 54%;'>Total contributions:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.total) +
					"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercentCustom(contributionsTotals.paid, contributionsTotals.total)) +
					")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.paid) +
					"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total pledge <span style='color: #888;'>(" + (formatPercentCustom(contributionsTotals.pledge, contributionsTotals.total)) +
					")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.pledge) + "</span></div></div>");

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
			tooltip.style("display", "none");
		};

		function mouseOverButtonsRects(d) {
			tooltip.style("display", "block")
				.style("width", "200px")
				.html("Click for selecting a year. Double-click or ALT + click for selecting a single month.");

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

		function recalculateAndResize() {

			const biggestLabelLengthDonors = calculateBiggestLabel(data.dataDonors, "donor");

			setRanges(biggestLabelLengthDonors);

			setDomains(data.dataDonors);

			//end of recalculateAndResize
		};

		//end of draw
	};

	function processData(rawData) {

		const aggregatedDonors = [];

		let tempSetDonors = [];

		rawData.forEach(function(d) {

			if (chartState.selectedYear.indexOf(+d.FiscalYear) > -1) {

				if (tempSetDonors.indexOf(d.GMSDonorName) > -1) {

					const tempObject = aggregatedDonors.filter(function(e) {
						return e.donor === d.GMSDonorName
					})[0];

					tempObject.paid += +d.PaidAmt;
					tempObject.pledge += +d.PledgeAmt;
					tempObject.total += (+d.PaidAmt) + (+d.PledgeAmt);

				} else {

					aggregatedDonors.push({
						donor: d.GMSDonorName,
						donorType: d.PooledFundName,
						isoCode: d.GMSDonorISO2Code.toLowerCase(),
						paid: +d.PaidAmt,
						pledge: +d.PledgeAmt,
						total: (+d.PaidAmt) + (+d.PledgeAmt)
					});

					tempSetDonors.push(d.GMSDonorName);

				};

			};

		});

		const macedoniaObject = aggregatedDonors.find(function(d) {
			return d.donor.indexOf("Macedonia") > -1;
		});

		if (macedoniaObject) macedoniaObject.donor = "Macedonia";

		aggregatedDonors.sort((a, b) => b[chartState.selectedContribution] - a[chartState.selectedContribution]);

		const topData = aggregatedDonors.reduce((acc, curr, index) => {
			if (index < maxDonorNumber) {
				acc.push({
					donor: curr.donor,
					isoCode: curr.isoCode,
					donorType: curr.donorType,
					paid: curr.paid,
					pledge: curr.pledge,
					total: curr.total
				});
			} else if (index === maxDonorNumber) {
				acc.push({
					donor: "Others",
					isoCode: othersId,
					paid: curr.paid,
					pledge: curr.pledge,
					total: curr.total,
					donorsList: [curr]
				});
			} else {
				acc[maxDonorNumber].paid += curr.paid;
				acc[maxDonorNumber].pledge += curr.pledge;
				acc[maxDonorNumber].total += curr.total;
				acc[maxDonorNumber].donorsList.push(curr);
			};
			return acc;
		}, []);

		tempSetDonors = [];

		return [topData, aggregatedDonors];

		//end of processData
	};

	function createCsv(rawData) {

		const filteredDataRaw = rawData.filter(function(d) {
			if (!chartState.selectedDonors.length && !chartState.selectedCbpfs.length) {
				return chartState.selectedYear.indexOf(+d.FiscalYear) > -1;
			} else if (chartState.selectedDonors.length) {
				return chartState.selectedYear.indexOf(+d.FiscalYear) > -1 && chartState.selectedDonors.indexOf(d.GMSDonorISO2Code.toLowerCase()) > -1;
			} else {
				return chartState.selectedYear.indexOf(+d.FiscalYear) > -1 && chartState.selectedCbpfs.indexOf(d.PooledFundISO2Code.toLowerCase()) > -1;
			};
		}).sort(function(a, b) {
			return (+b.FiscalYear) - (+a.FiscalYear) || (a.GMSDonorName.toLowerCase() < b.GMSDonorName.toLowerCase() ? -1 :
				a.GMSDonorName.toLowerCase() > b.GMSDonorName.toLowerCase() ? 1 : 0) || (a.PooledFundName.toLowerCase() < b.PooledFundName.toLowerCase() ? -1 :
				a.PooledFundName.toLowerCase() > b.PooledFundName.toLowerCase() ? 1 : 0);
		});

		const filteredData = JSON.parse(JSON.stringify(filteredDataRaw));

		filteredData.forEach(function(d) {
			d.Year = +d.FiscalYear;
			d["Donor Name"] = d.GMSDonorName;
			d["CBPF Name"] = d.PooledFundName;
			d["Paid Amount"] = +d.PaidAmt;
			d["Pledged Amount"] = +d.PledgeAmt;
			d["Total Contributions"] = (+d.PaidAmt) + (+d.PledgeAmt);
			d["Local Curency"] = d.PaidAmtLocalCurrency;
			d["Exchange Rate"] = d.PaidAmtCurrencyExchangeRate;
			d["Paid Amount (Local Currency)"] = +d.PaidAmtLocal;
			d["Pledged Amount (Local Currency)"] = +d.PledgeAmtLocal;
			d["Total Contributions (Local Currency)"] = (+d.PaidAmtLocal) + (+d.PledgeAmtLocal);

			delete d.FiscalYear;
			delete d.GMSDonorName;
			delete d.PooledFundName;
			delete d.PaidAmt;
			delete d.PledgeAmt;
			delete d.PaidAmtLocal;
			delete d.PledgeAmtLocal;
			delete d.GMSDonorISO2Code;
			delete d.PooledFundISO2Code;
			delete d.PledgeAmtLocalCurrency;
			delete d.PledgeAmtCurrencyExchangeRate;
			delete d.PaidAmtLocalCurrency;
			delete d.PaidAmtCurrencyExchangeRate;
		});

		const header = d3.keys(filteredData[0]);

		const replacer = function(key, value) {
			return value === null ? '' : value
		};

		let rows = filteredData.map(function(row) {
			return header.map(function(fieldName) {
				return JSON.stringify(row[fieldName], replacer)
			}).join(',')
		});

		rows.unshift(header.join(','));

		return rows.join('\r\n');

		//end of createCsv
	};

	function calculateBiggestLabel(dataArray, property) {

		const allTexts = dataArray.map(function(d) {
			return d[property]
		}).sort(function(a, b) {
			return b.length - a.length;
		}).slice(0, 5);

		const textSizeArray = [];

		allTexts.forEach(function(d) {

			const fakeText = svg.append("text")
				.attr("class", classPrefix + "groupYAxisDonorsFake")
				.style("opacity", 0)
				.text(d);

			const fakeTextLength = Math.ceil(fakeText.node().getComputedTextLength());

			textSizeArray.push(fakeTextLength);

			fakeText.remove();

		});

		return Math.min(d3.max(textSizeArray), maxTextSize);

		//end of calculateBiggestLabel
	};

	function setDomains(donors) {

		const maxXValue = d3.max(donors, function(d) {
			return d[chartState.selectedContribution];
		}) || d3.max(donors, function(d) {
			return d.total;
		});

		xScaleDonors.domain([0, Math.floor(maxXValue * 1.1)]);

	};

	function setRanges(labelSizeDonors) {

		const labelSize = labelSizeDonors + yAxisDonors.tickPadding() + yAxisDonors.tickSizeInner()

		donorsPanel.padding[3] = labelSize;

		xScaleDonors.range([donorsPanel.padding[3], donorsPanel.width - donorsPanel.padding[1]]);

	};

	function translateAxes() {

		groupYAxisDonors.attr("transform", "translate(" + donorsPanel.padding[3] + ",0)");

	};

	function parseTransform(translate) {

		const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

		group.setAttributeNS(null, "transform", translate);

		const matrix = group.transform.baseVal.consolidate().matrix;

		return [matrix.e, matrix.f];

	};

	function populateSelectedDescriptionDiv() {

		if (!chartState.selectedDonors.length) {
			selectionDescriptionDiv.html(null);
			return;
		};

		const selection = chartState.selectedDonors.length ? "selectedDonors" : "selectedCbpfs";

		const type = chartState.selectedDonors.length ? "donor" : "CBPF";

		selectionDescriptionDiv.html(function() {
			if (chartState[selection].length === 0) return null;
			const plural = chartState[selection].length === 1 ? "" : "s";
			const countryList = chartState[selection].map(function(d) {
					return countryNames[d];
				})
				.sort(function(a, b) {
					return a.toLowerCase() < b.toLowerCase() ? -1 :
						a.toLowerCase() > b.toLowerCase() ? 1 : 0;
				})
				.reduce(function(acc, curr, index) {
					return acc + (index >= chartState[selection].length - 2 ? index > chartState[selection].length - 2 ? curr : curr + " and " : curr + ", ");
				}, "");
			return "\u207ASelected " + type + plural + ": " + countryList;
		});

		//end of populateSelectedDescriptionDiv
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

	function saveFlags(donorsList) {

		const blankFlag = "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAGklEQVR42mP8/5+BJMA4qmFUw6iGUQ201QAAYiIv6RZuPWMAAAAASUVORK5CYII="

		donorsList.forEach(function(d) {
			if (!localStorage.getItem("storedFlag" + d)) {
				getBase64FromImage("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/flags/" + d + ".png", setLocal, null, d);
			};
		});

		function getBase64FromImage(url, onSuccess, onError, isoCode) {
			const xhr = new XMLHttpRequest();

			xhr.responseType = "arraybuffer";
			xhr.open("GET", url);

			xhr.onload = function() {
				let base64, base64Blank, binary, bytes, mediaType;

				bytes = new Uint8Array(xhr.response);

				binary = [].map.call(bytes, function(byte) {
					return String.fromCharCode(byte);
				}).join('');

				mediaType = xhr.getResponseHeader('content-type');

				base64 = [
					'data:',
					mediaType ? mediaType + ';' : '',
					'base64,',
					btoa(binary)
				].join('');

				base64Blank = [
					'data:',
					mediaType ? mediaType + ';' : '',
					'base64,',
					blankFlag
				].join('');

				if (xhr.status === 200) {
					onSuccess(isoCode, base64)
				} else {
					onSuccess(isoCode, base64Blank)
				};
			};

			xhr.onerror = onError;

			xhr.send();
		};

		function setLocal(isoCode, base64) {
			localStorage.setItem("storedFlag" + isoCode, base64);
		};

		//end of saveFlags
	};

	function createAnnotationsDiv() {

		iconsDiv.style("opacity", 0)
			.style("pointer-events", "none");

		const overDiv = containerDiv.append("div")
			.attr("class", classPrefix + "OverDivHelp");

		const topDivSize = topDiv.node().getBoundingClientRect();

		const iconsDivSize = iconsDiv.node().getBoundingClientRect();

		const topDivHeight = topDivSize.height * (width / topDivSize.width);

		const helpSVG = overDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + (height + topDivHeight));

		const helpButtons = [{
			text: "CLOSE",
			width: 90
		}, {
			text: "GO TO HELP PORTAL",
			width: 180
		}];

		const closeRects = helpSVG.selectAll(null)
			.data(helpButtons)
			.enter()
			.append("g");

		closeRects.append("rect")
			.attr("rx", 4)
			.attr("ry", 4)
			.style("stroke", "rgba(0, 0, 0, 0.3)")
			.style("stroke-width", "1px")
			.style("fill", highlightColor)
			.style("cursor", "pointer")
			.attr("y", 6)
			.attr("height", 22)
			.attr("width", function(d) {
				return d.width;
			})
			.attr("x", function(d, i) {
				return width - padding[1] - d.width - (i ? helpButtons[0].width + 8 : 0);
			})
			.on("click", function(_, i) {
				iconsDiv.style("opacity", 1)
					.style("pointer-events", "all");
				overDiv.remove();
				if (i) window.open(helpPortalUrl, "help_portal");
			});

		closeRects.append("text")
			.attr("class", classPrefix + "AnnotationMainText")
			.attr("text-anchor", "middle")
			.attr("x", function(d, i) {
				return width - padding[1] - (d.width / 2) - (i ? (helpButtons[0].width) + 8 : 0);
			})
			.attr("y", 22)
			.text(function(d) {
				return d.text
			});

		const helpData = [{
			x: 96,
			y: 72 + topDivHeight,
			width: 480,
			height: 30,
			xTooltip: 180 * (topDivSize.width / width),
			yTooltip: (topDivHeight + 112) * (topDivSize.width / width),
			text: "Use these buttons to select the year. You can select more than one year. Double click or press ALT when clicking to select just a single year. Click the arrows to reveal more years."
		}, {
			x: 592,
			y: 72 + topDivHeight,
			width: 224,
			height: 30,
			xTooltip: 550 * (topDivSize.width / width),
			yTooltip: (topDivHeight + 112) * (topDivSize.width / width),
			text: "Use these buttons to select the type of contribution: paid, pledged or total (paid plus pledged)."
		}, {
			x: 96,
			y: 10 + topDivHeight,
			width: 720,
			height: 57,
			xTooltip: 300 * (topDivSize.width / width),
			yTooltip: (topDivHeight + 76) * (topDivSize.width / width),
			text: "This banner shows the total amount of contributions received for the selected year (or years). It also shows the number of donors and CBPFs in that period."
		}, {
			x: 6,
			y: 108 + topDivHeight,
			width: 440,
			height: 660,
			xTooltip: 452 * (topDivSize.width / width),
			yTooltip: (topDivHeight + 164) * (topDivSize.width / width),
			text: "Hover over the donors to get additional information. Hovering over a donor filters the CBPFs accordingly, so only CBPFs that received from that donor are displayed. When “Total” is selected, the purple triangle indicates the paid amount, and the values between parentheses correspond to paid and pledged values, respectively."
		}, {
			x: 466,
			y: 108 + topDivHeight,
			width: 398,
			height: 380,
			xTooltip: 136 * (topDivSize.width / width),
			yTooltip: (topDivHeight + 164) * (topDivSize.width / width),
			text: "Hover over the CBPFs to get additional information. Hovering over a CBPF filters the donors accordingly, so only donors that donated to that CBPF are displayed. When “Total” is selected, the purple triangle indicates the paid amount, and the values between parentheses correspond to paid and pledged values, respectively."
		}];

		helpData.forEach(function(d) {
			helpSVG.append("rect")
				.attr("rx", 4)
				.attr("ry", 4)
				.attr("x", d.x)
				.attr("y", d.y)
				.attr("width", d.width)
				.attr("height", d.height)
				.style("stroke", unBlue)
				.style("stroke-width", "3px")
				.style("fill", "none")
				.style("opacity", 0.5)
				.attr("class", classPrefix + "HelpRectangle")
				.attr("pointer-events", "all")
				.on("mouseover", function() {
					const self = this;
					createTooltip(d.xTooltip, d.yTooltip, d.text, self);
				})
				.on("mouseout", removeTooltip);
		});

		const explanationTextRect = helpSVG.append("rect")
			.attr("x", (width / 2) - 180)
			.attr("y", 244)
			.attr("width", 360)
			.attr("height", 50)
			.attr("pointer-events", "none")
			.style("fill", "white")
			.style("stroke", "#888");

		const explanationText = helpSVG.append("text")
			.attr("class", classPrefix + "AnnotationExplanationText")
			.attr("font-family", "Roboto")
			.attr("font-size", "18px")
			.style("fill", "#222")
			.attr("text-anchor", "middle")
			.attr("x", width / 2)
			.attr("y", 264)
			.attr("pointer-events", "none")
			.text("Hover over the elements surrounded by a blue rectangle to get additional information")
			.call(wrapText2, 350);

		function createTooltip(xPos, yPos, text, self) {
			explanationText.style("opacity", 0);
			explanationTextRect.style("opacity", 0);
			helpSVG.selectAll("." + classPrefix + "HelpRectangle").style("opacity", 0.1);
			d3.select(self).style("opacity", 1);
			const containerBox = containerDiv.node().getBoundingClientRect();
			tooltip.style("top", yPos + "px")
				.style("left", xPos + "px")
				.style("display", "block")
				.html(text);
		};

		function removeTooltip() {
			tooltip.style("display", "none");
			explanationText.style("opacity", 1);
			explanationTextRect.style("opacity", 1);
			helpSVG.selectAll("." + classPrefix + "HelpRectangle").style("opacity", 0.5);
		};

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

	function wrapText(text, width) {
		text.each(function() {
			var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1, // ems
				y = text.attr("y"),
				dy = parseFloat(text.attr("dy")),
				tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
				}
			}
		});
	}

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

			if (fromContextMenu && currentHoveredRect) d3.select(currentHoveredRect).dispatch("mouseout");

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

		const fileName = "CBPFcontributions_" + csvDateFormat(currentDate) + ".png";

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

				const intro = pdf.splitTextToSize("Since the first CBPF was opened in Angola in 1997, donors have contributed more than $5 billion to 27 funds operating in the most severe and complex emergencies around the world.", (210 - pdfMargins.left - pdfMargins.right), {
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

				const yearsList = chartState.selectedYear.sort(function(a, b) {
					return a - b;
				}).reduce(function(acc, curr, index) {
					return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
				}, "");

				const yearsText = chartState.selectedYear.length > 1 ? "Selected years: " : "Selected year: ";

				const contributions = chartState.selectedContribution === "total" ? "Total (Paid + Pledged)" : chartState.selectedContribution === "paid" ? "Paid" : "Pledged";

				const selectedCountry = !chartState.selectedDonors.length && !chartState.selectedCbpfs.length ?
					"Selected countries-all" : countriesList();

				pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
					fullDate + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + yearsText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
					yearsList + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Contributions: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
					contributions + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + selectedCountry.split("-")[0] + ": <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
					selectedCountry.split("-")[1] + "</span></div>", pdfMargins.left, 70, {
						width: 210 - pdfMargins.left - pdfMargins.right
					},
					function(position) {
						pdfTextPosition = position;
					});

				pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, heightInMilimeters);

				const currentDate = new Date();

				pdf.save("CBPFcontributions_" + csvDateFormat(currentDate) + ".pdf");

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

				function countriesList() {
					const selection = chartState.selectedDonors.length ? "selectedDonors" : "selectedCbpfs";
					const type = chartState.selectedDonors.length ? "donor" : "CBPF";
					const plural = chartState[selection].length === 1 ? "" : "s";
					const countryList = chartState[selection].map(function(d) {
							return countryNames[d];
						})
						.sort(function(a, b) {
							return a.toLowerCase() < b.toLowerCase() ? -1 :
								a.toLowerCase() > b.toLowerCase() ? 1 : 0;
						})
						.reduce(function(acc, curr, index) {
							return acc + (index >= chartState[selection].length - 2 ? index > chartState[selection].length - 2 ? curr : curr + " and " : curr + ", ");
						}, "");
					return "Selected " + type + plural + "-" + countryList;

				};
			});

		//end of downloadSnapshotPdf
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

	function validateCustomEventYear(yearNumber) {
		if (yearsArray.indexOf(yearNumber) > -1) {
			return yearNumber;
		};
		while (yearsArray.indexOf(yearNumber) === -1) {
			yearNumber = yearNumber >= currentYear ? yearNumber - 1 : yearNumber + 1;
		};
		return yearNumber;
	};

	function validateCountries(countriesString, allDonors, allCbpfs) {
		if (!countriesString || countriesString.toLowerCase() === "none") return;
		const namesArray = countriesString.split(",").map(function(d) {
			return d.trim().toLowerCase();
		});
		const countryCodes = Object.keys(countryNames);
		namesArray.forEach(function(d) {
			const nameSplit = d.split("@");
			if (nameSplit.length === 1) {
				const foundDonor = countryCodes.find(function(e) {
					return countryNames[e].toLowerCase() === nameSplit[0] && allDonors.indexOf(e) > -1;
				});
				const foundCbpf = countryCodes.find(function(e) {
					return countryNames[e].toLowerCase() === nameSplit[0] && allCbpfs.indexOf(e) > -1;
				});
				if (foundDonor) chartState.selectedDonors.push(foundDonor);
				if (foundCbpf) chartState.selectedCbpfs.push(foundCbpf);
			} else {
				if (nameSplit[1] === "donor") {
					const foundDonor = countryCodes.find(function(e) {
						return countryNames[e].toLowerCase() === nameSplit[0] && allDonors.indexOf(e) > -1;
					});
					if (foundDonor) chartState.selectedDonors.push(foundDonor);
				} else if (nameSplit[1] === "fund") {
					const foundCbpf = countryCodes.find(function(e) {
						return countryNames[e].toLowerCase() === nameSplit[0] && allCbpfs.indexOf(e) > -1;
					});
					if (foundCbpf) chartState.selectedCbpfs.push(foundCbpf);
				};
			};
		});
		if (chartState.selectedDonors.length && chartState.selectedCbpfs.length) {
			chartState.selectedDonors.length = 0;
			chartState.selectedCbpfs.length = 0;
		};
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