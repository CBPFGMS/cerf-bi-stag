(function d3ChartIIFE() {

	const isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches);

	const svgWidth = 140,
		svgHeight = 68,
		svgRatio = 2.6,
		topSvgWidth = 420,
		topSvgHeight = topSvgWidth / svgRatio,
		topSvgPadding = [22, 56, 18, 26],
		svgPadding = [10, 36, 14, 26],
		yScaleRange = [svgHeight - svgPadding[2], svgPadding[0]],
		donorNameDivHeight = 24,
		flagSize = 22,
		flagSizeTooltip = 30,
		fadeOpacity = 0.2,
		lastYearCircleRadius = 3,
		lastYearCircleTopRadius = lastYearCircleRadius * 1.5,
		barLabelPadding = 18,
		barLabelTopPadding = 58,
		labelMinPadding = 5,
		windowHeight = window.innerHeight,
		headerDivHeightPercentage = 0.14,
		tooltipSvgPadding = [30, 12, 24, 36],
		tooltipBarsColor = "#CBCBCB",
		tooltipBarLabelPadding = 12,
		tooltipCircleRadius = 5,
		tooltipWidth = 640,
		tooltipSvgHeight = 280,
		tooltipDonorNameHeight = 30,
		tooltipLabelCerfPadding = 10,
		currentYearOpacity = 0.6,
		currentDate = new Date(),
		currentYear = currentDate.getFullYear(),
		localStorageTime = 3600000,
		csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
		formatMoney0Decimals = d3.format(",.0f"),
		formatPercent = d3.format(".0%"),
		formatNumberSI = d3.format(".3s"),
		formatSIaxes = d3.format("~s"),
		localVariable = d3.local(),
		localyScale = d3.local(),
		localLine = d3.local(),
		cerfColor = "#FBD45C",
		unBlue = "#1F69B3",
		chartTitleDefault = " ",
		yearsArray = [],
		memberStateType = "Member State",
		privateDonorsName = "Private Contributions",
		privateDonorsIsoCode = "xprv",
		vizNameQueryString = "contributionschart",
		isBookmarkPage = window.location.hostname + window.location.pathname === "cbpfgms.github.io/cerf-bi-stag/bookmark.html",
		bookmarkSite = "https://cbpfgms.github.io/cerf-bi-stag/bookmark.html?",
		helpPortalUrl = "https://gms.unocha.org/content/business-intelligence#CBPF_Contributions",
		dataUrl = "https://cbpfgms.github.io/pfbi-data/cerf_sample_data/CERF_ContributionTotal.csv",
		flagsUrl = "./assets/img/flags24.json",
		blankFlag = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
		duration = 1000,
		shortDuration = 500,
		titlePadding = 24,
		zeroObject = { amount: 0 },
		classPrefix = "contributionschart",
		orders = ["contributions", "alphabetical"],
		donors = ["top", "all"],
		topDonorsNumber = 20,
		highlightSelection = {},
		topDonorsIsoCodes = [],
		chartState = {
			selectedDonors: null,
			selectedOrder: null
		};

	let isSnapshotTooltipVisible = false,
		currentHoveredElement,
		timer,
		alreadyHovered = false,
		yearsArrayWithNull,
		allTimeContributions = 0;

	const queryStringValues = new URLSearchParams(location.search);

	if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

	const containerDiv = d3.select("#d3chartcontainer" + classPrefix);

	const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

	const showLink = (containerDiv.node().getAttribute("data-showlink") === "true");

	const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

	const selectedCountriesString = queryStringValues.has("country") ? queryStringValues.get("country").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-selectedcountry");

	const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-year");

	chartState.selectedOrder = queryStringValues.has("order") && orders.includes(queryStringValues.get("order")) ? queryStringValues.get("order") :
		orders.includes(containerDiv.node().getAttribute("data-order")) ?
		containerDiv.node().getAttribute("data-order") : orders[0];

	chartState.selectedDonors = queryStringValues.has("donors") && donors.includes(queryStringValues.get("donors")) ? queryStringValues.get("donors") :
		donors.includes(containerDiv.node().getAttribute("data-donors")) ?
		containerDiv.node().getAttribute("data-donors") : donors[0];

	const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

	const topDiv = containerDiv.append("div")
		.attr("class", classPrefix + "TopDiv");

	const titleDiv = topDiv.append("div")
		.attr("class", classPrefix + "TitleDiv");

	const iconsDiv = topDiv.append("div")
		.attr("class", classPrefix + "IconsDiv d3chartIconsDiv");

	const headerDiv = containerDiv.append("div")
		.attr("class", classPrefix + "headerDiv")
		.style("height", containerDiv.node().offsetWidth * headerDivHeightPercentage + "px");

	const topFiguresDiv = headerDiv.append("div")
		.attr("class", classPrefix + "topFiguresDiv");

	const topFiguresHeaderDiv = topFiguresDiv.append("div")
		.attr("class", classPrefix + "topFiguresHeaderDiv");

	const topFiguresDonorsDiv = topFiguresDiv.append("div")
		.attr("class", classPrefix + "topFiguresDonorsDiv");

	const topFiguresDonorsNumberDiv = topFiguresDonorsDiv.append("div")
		.attr("class", classPrefix + "topFiguresDonorsNumberDiv");

	const topFiguresDonorsTextDiv = topFiguresDonorsDiv.append("div")
		.attr("class", classPrefix + "topFiguresDonorsTextDiv");

	const topFiguresContributionsDiv = topFiguresDiv.append("div")
		.attr("class", classPrefix + "topFiguresContributionsDiv");

	const topFiguresContributionsNumberDiv = topFiguresContributionsDiv.append("div")
		.attr("class", classPrefix + "topFiguresContributionsNumberDiv");

	const topFiguresContributionsTextDiv = topFiguresContributionsDiv.append("div")
		.attr("class", classPrefix + "topFiguresContributionsTextDiv");

	const topChartDiv = headerDiv.append("div")
		.attr("class", classPrefix + "topChartDiv");

	const topChartHeaderDiv = topChartDiv.append("div")
		.attr("class", classPrefix + "topChartHeaderDiv");

	const topChartSvgDiv = topChartDiv.append("div")
		.attr("class", classPrefix + "topChartSvgDiv");

	const topChartSvg = topChartSvgDiv.append("svg")
		.attr("viewBox", "0 0 " + topSvgWidth + " " + ~~topSvgHeight)
		.attr("preserveAspectRatio", "xMidYMid meet")
		.style("height", "100%");

	const topRadioButtonsDiv = headerDiv.append("div")
		.attr("class", classPrefix + "topRadioButtonsDiv");

	const topRadioButtonsDonorsDiv = topRadioButtonsDiv.append("div")
		.attr("class", classPrefix + "topRadioButtonsDonorsDiv");

	const topRadioButtonsOrderDiv = topRadioButtonsDiv.append("div")
		.attr("class", classPrefix + "topRadioButtonsOrderDiv");

	const chartsDiv = containerDiv.append("div")
		.attr("class", classPrefix + "chartsDiv");

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

	const xScale = d3.scaleBand()
		.range([svgPadding[3], svgWidth - svgPadding[1]])
		.paddingInner(0.4)
		.paddingOuter(0);

	const xScaleTopChart = d3.scaleBand()
		.range([topSvgPadding[3], topSvgWidth - topSvgPadding[1]])
		.paddingInner(0.6)
		.paddingOuter(0);

	const yScaleTopChart = d3.scaleLinear()
		.range([topSvgHeight - topSvgPadding[2], topSvgPadding[0]]);

	const xScaleTooltip = d3.scaleBand()
		.range([tooltipSvgPadding[3], tooltipWidth - tooltipSvgPadding[1]])
		.paddingInner(0.4)
		.paddingOuter(0.2);

	const yScaleTooltip = d3.scaleLinear()
		.range([tooltipSvgHeight - tooltipSvgPadding[2], tooltipSvgPadding[0]]);

	const topLineGenerator = d3.line()
		.x(d => xScaleTopChart(d.year) + xScaleTopChart.bandwidth() / 2)
		.y(d => yScaleTopChart(d.amount))
		.curve(d3.curveMonotoneX);

	const topLineGeneratorBase = d3.line()
		.x(d => xScaleTopChart(d.year) + xScaleTopChart.bandwidth() / 2)
		.y(d => yScaleTopChart(0))
		.curve(d3.curveMonotoneX);

	const xAxis = d3.axisBottom(xScale)
		.tickSizeOuter(0)
		.tickSizeInner(3)
		.tickPadding(2);

	const xAxisTopChart = d3.axisBottom(xScaleTopChart)
		.tickSizeOuter(0)
		.tickSizeInner(3)
		.tickPadding(2);

	const xAxisGroupTopChart = topChartSvg.append("g")
		.attr("class", classPrefix + "xAxisGroupTopChart")
		.attr("transform", "translate(0," + (topSvgHeight - topSvgPadding[2]) + ")");

	const xAxisTooltip = d3.axisBottom(xScaleTooltip)
		.tickFormat((d, i) => xScaleTooltip.domain()[0] % 2 ? (i % 2 ? d : null) : (i % 2 ? null : d))
		.tickSizeOuter(4)
		.tickSizeInner(4)
		.tickPadding(3);

	const yAxisTooltip = d3.axisLeft(yScaleTooltip)
		.tickSizeOuter(0)
		.tickSizeInner(-(tooltipWidth - tooltipSvgPadding[1] - tooltipSvgPadding[3]))
		.ticks(3)
		.tickFormat(d => "$" + formatSIaxes(d).replace("G", "B"));

	Promise.all([fetchFile("contributionsdata", dataUrl, "data", "csv"),
			fetchFile(classPrefix + "flags", flagsUrl, "flags images", "json")
		])
		.then(allData => csvCallback(allData));

	function csvCallback([rawData, flagsData]) {

		if (!lazyLoad) {
			draw(rawData, flagsData);
		} else {
			d3.select(window).on("scroll." + classPrefix, checkPosition);
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

		const data = processData(rawData);

		yearsArrayWithNull = yearsArray.slice();
		yearsArrayWithNull.splice(-1, 0, null);

		xScale.domain(yearsArrayWithNull);

		xScaleTopChart.domain(yearsArrayWithNull);

		xScaleTooltip.domain(yearsArrayWithNull);

		xAxis.tickValues([yearsArray[0], currentYear - 1]);

		xAxisTopChart.tickValues(yearsArrayWithNull.filter((e, i) => e && (!(i % 2) || e === currentYear)));

		createTitle(rawData);

		createTopFigures(data);

		createTopChart(data);

		createTopRadioButtons(data);

		createChartDivs(data.byDonor, flagsData);

		//end of draw
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

	function createTopFigures(data) {

		let headerText = topFiguresHeaderDiv.selectAll("." + classPrefix + "headerText")
			.data([true]);

		headerText = headerText.enter()
			.append("span")
			.attr("class", classPrefix + "headerText")
			.merge(headerText)
			.html("Since " + yearsArray[0] + "," + (chartState.selectedDonors === donors[0] ? " the" : ""));

		let donorsNumber = topFiguresDonorsNumberDiv.selectAll("." + classPrefix + "donorsNumber")
			.data([true]);

		donorsNumber = donorsNumber.enter()
			.append("span")
			.attr("class", classPrefix + "donorsNumber contributionColorHTMLcolor")
			.merge(donorsNumber)
			.html(chartState.selectedDonors === donors[0] ? "Top " + topDonorsNumber : data.byDonor.length);

		let donorsText = topFiguresDonorsTextDiv.selectAll("." + classPrefix + "donorsText")
			.data([true]);

		donorsText = donorsText.enter()
			.append("span")
			.attr("class", classPrefix + "donorsText")
			.merge(donorsText)
			.html((data.byDonor.length > 1 ? "Donors" : "Donor") + "<br>Contributed");

		const previousValue = d3.select("." + classPrefix + "contributionsNumber").size() !== 0 ? d3.select("." + classPrefix + "contributionsNumber").datum() : 0;

		let contributionsNumber = topFiguresContributionsNumberDiv.selectAll("." + classPrefix + "contributionsNumber")
			.data([d3.sum(chartState.selectedDonors === donors[0] ? data.topDonors : data.allDonors, d => d.amount)]);

		contributionsNumber = contributionsNumber.enter()
			.append("span")
			.attr("class", classPrefix + "contributionsNumber contributionColorHTMLcolor")
			.merge(contributionsNumber);

		contributionsNumber.transition()
			.duration(duration)
			.tween("text", function(d) {
				const node = this;
				const i = d3.interpolate(previousValue, d);
				return function(t) {
					const siString = formatSIFloat(i(t))
					node.textContent = "$" + siString.substring(0, siString.length - 1);
				};
			});

		let contributionsText = topFiguresContributionsTextDiv.selectAll("." + classPrefix + "contributionsText")
			.data([d3.sum(chartState.selectedDonors === donors[0] ? data.topDonors : data.allDonors, d => d.amount)]);

		contributionsText = contributionsText.enter()
			.append("span")
			.attr("class", classPrefix + "contributionsText")
			.merge(contributionsText)
			.html(function(d) {
				const valueSI = formatSIFloat(d);
				const unit = valueSI[valueSI.length - 1];
				return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
					" dollars<br>to CERF";
			})

		//end of createTopFigures
	};

	function createTopChart(data) {

		const topChartHeaderText = `donors contributions to CERF, ${yearsArray[0]} to ${yearsArray[yearsArray.length - 1]} (hatched), in US$`;

		let topChartHeader = topChartHeaderDiv.selectAll("." + classPrefix + "topChartHeader")
			.data([true]);

		topChartHeader = topChartHeader.enter()
			.append("span")
			.attr("class", classPrefix + "topChartHeader")
			.merge(topChartHeader)
			.html((chartState.selectedDonors === donors[0] ? `Top ${topDonorsNumber} ` : "All ") + topChartHeaderText + (alreadyHovered ? "" : "<br>(hover over the bars for highlighting a year)"));

		const topChartData = chartState.selectedDonors === donors[0] ? data.topDonors : data.allDonors;

		const bandwidth = xScaleTopChart.bandwidth();

		yScaleTopChart.domain([0, d3.max(topChartData, d => d.amount)]);

		const defs = topChartSvg.append("defs")

		const pattern = defs.append("pattern")
			.attr("id", classPrefix + "patterncerf")
			.attr("width", 10)
			.attr("height", 4)
			.attr("patternUnits", "userSpaceOnUse")
			.attr("patternTransform", "rotate(-45 0 0)")
			.append("line")
			.attr("x1", 0)
			.attr("y1", 2)
			.attr("x2", 10)
			.attr("y2", 2)
			.attr("stroke-width", 2)
			.attr("stroke", cerfColor);

		const syncedTransition = d3.transition()
			.duration(duration);

		xAxisGroupTopChart.transition(syncedTransition)
			.call(xAxisTopChart);

		let barsTop = topChartSvg.selectAll("." + classPrefix + "barsTop")
			.data(topChartData, d => d.year);

		barsTop = barsTop.enter()
			.append("rect")
			.attr("class", classPrefix + "barsTop")
			.style("fill", d => d.year === currentYear ? `url(#${classPrefix}patterncerf)` : cerfColor)
			.style("stroke", d => d.year === currentYear ? "#ccc" : null)
			.attr("x", d => xScaleTopChart(d.year))
			.attr("width", bandwidth)
			.attr("y", yScaleTopChart(0))
			.attr("height", 0)
			.merge(barsTop);

		barsTop.transition(syncedTransition)
			.attr("y", d => yScaleTopChart(d.amount))
			.attr("height", d => yScaleTopChart(0) - yScaleTopChart(d.amount));

		let barLineTop = topChartSvg.selectAll("." + classPrefix + "barLineTop")
			.data(fillWithZeros(topChartData.filter(e => e.year < currentYear)));

		barLineTop = barLineTop.enter()
			.append("path")
			.attr("class", classPrefix + "barLineTop")
			.style("stroke", "#888")
			.style("stroke-width", "2px")
			.style("fill", "none")
			.attr("d", topLineGeneratorBase)
			.merge(barLineTop);

		barLineTop.transition(syncedTransition)
			.attr("d", topLineGenerator);

		let lastYearCircleTop = topChartSvg.selectAll("." + classPrefix + "lastYearCircleTop")
			.data([topChartData.find(e => e.year === currentYear - 1) || zeroObject]);

		lastYearCircleTop = lastYearCircleTop.enter()
			.append("circle")
			.attr("class", classPrefix + "lastYearCircleTop")
			.attr("cx", xScaleTopChart(currentYear - 1) + bandwidth / 2)
			.attr("cy", yScaleTopChart(0))
			.attr("r", lastYearCircleTopRadius)
			.style("fill", "#888")
			.merge(lastYearCircleTop);

		lastYearCircleTop.transition(syncedTransition)
			.attr("cy", d => yScaleTopChart(d.amount));

		let lastYearLineTop = topChartSvg.selectAll("." + classPrefix + "lastYearLineTop")
			.data([topChartData.find(e => e.year === currentYear - 1) || zeroObject]);

		lastYearLineTop = lastYearLineTop.enter()
			.append("polyline")
			.attr("class", classPrefix + "lastYearLineTop")
			.attr("points", (d, i, n) => {
				return `${xScaleTopChart(currentYear - 1) + lastYearCircleTopRadius + bandwidth/2},${yScaleTopChart(0)} 
				${xScaleTopChart(currentYear - 1) + lastYearCircleTopRadius + bandwidth/2 + (barLabelTopPadding - lastYearCircleTopRadius - bandwidth/2)/2},${yScaleTopChart(0)} 
				${xScaleTopChart(currentYear - 1) + barLabelTopPadding},${yScaleTopChart(0)}`
			})
			.style("stroke", "#bbb")
			.style("stroke-width", "1px")
			.style("fill", "none")
			.merge(lastYearLineTop);

		lastYearLineTop.transition(syncedTransition)
			.attr("points", (d, i, n) => {
				return `${xScaleTopChart(currentYear - 1) + lastYearCircleTopRadius + bandwidth/2},${yScaleTopChart(d.amount)} 
				${xScaleTopChart(currentYear - 1) + lastYearCircleTopRadius + bandwidth/2 + (barLabelTopPadding - lastYearCircleTopRadius - bandwidth/2)/2},${Math.min(topSvgHeight - topSvgPadding[2] - labelMinPadding, yScaleTopChart(d.amount))} 
				${xScaleTopChart(currentYear - 1) + barLabelTopPadding},${Math.min(topSvgHeight - topSvgPadding[2] - labelMinPadding, yScaleTopChart(d.amount))}`
			});

		let barLabelTop = topChartSvg.selectAll("." + classPrefix + "barLabelTop")
			.data([topChartData.find(e => e.year === currentYear - 1) || zeroObject]);

		barLabelTop = barLabelTop.enter()
			.append("text")
			.attr("class", classPrefix + "barLabelTop")
			.attr("x", xScaleTopChart(currentYear - 1) + barLabelTopPadding)
			.attr("y", yScaleTopChart(0))
			.text("0")
			.merge(barLabelTop);

		barLabelTop.transition(syncedTransition)
			.attr("y", d => Math.min(topSvgHeight - topSvgPadding[2] - labelMinPadding, yScaleTopChart(d.amount)))
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(reverseFormat(n[i].textContent) || 0, d.amount);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		let allLabelsTop = topChartSvg.selectAll("." + classPrefix + "allLabelsTop")
			.data(topChartData);

		allLabelsTop = allLabelsTop.enter()
			.append("text")
			.attr("class", classPrefix + "allLabelsTop")
			.style("opacity", 0)
			.attr("x", d => xScaleTopChart(d.year) + bandwidth / 2)
			.merge(allLabelsTop)
			.attr("y", d => yScaleTopChart(d.amount))
			.text(d => d3.formatPrefix(".0", d.amount)(d.amount).replace("G", "B"));

		const barsTopOver = topChartSvg.selectAll("." + classPrefix + "barsTopOver")
			.data(yearsArray)
			.enter()
			.append("rect")
			.attr("class", classPrefix + "barsTopOver")
			.style("opacity", 0)
			.style("pointer-events", "all")
			.attr("x", d => xScaleTopChart(d) - (xScaleTopChart.step() - xScaleTopChart.bandwidth()) / 2)
			.attr("width", xScaleTopChart.step())
			.attr("y", yScaleTopChart.range()[1])
			.attr("height", yScaleTopChart.range()[0] - yScaleTopChart.range()[1]);

		barsTopOver.on("mouseover", year => {
				if (!alreadyHovered) {
					alreadyHovered = true;
					topChartHeaderDiv.select("." + classPrefix + "topChartHeader").html((chartState.selectedDonors === donors[0] ? `Top ${topDonorsNumber} ` : "All ") + topChartHeaderText + (alreadyHovered ? "<br>&nbsp;" : "<br>(hover over the bars for highlighting a year)"));
				};

				xAxis.tickValues([year]);
				xAxisGroupTopChart.call(xAxisTopChart);
				xAxis.tickValues([year]);
				barLineTop.style("opacity", 0);
				lastYearCircleTop.style("opacity", 0);
				lastYearLineTop.style("opacity", 0);
				barLabelTop.style("opacity", 0);
				allLabelsTop.style("opacity", d => d.year === year ? 1 : 0);
				barsTop.style("opacity", d => d.year === year ? 1 : fadeOpacity);
				highlightSelection.donorSvg.select("." + classPrefix + "xAxisGroup").call(xAxis);
				highlightSelection.donorSvg.select("." + classPrefix + "barLine").style("opacity", 0);
				highlightSelection.donorSvg.select("." + classPrefix + "lastYearCircle").style("opacity", 0);
				highlightSelection.donorSvg.select("." + classPrefix + "lastYearLine").style("opacity", 0);
				highlightSelection.donorSvg.select("." + classPrefix + "barLabel").style("opacity", 0);
				highlightSelection.donorSvg.selectAll("." + classPrefix + "allLabels").style("opacity", d => d.year === year ? 1 : 0);
				highlightSelection.donorSvg.selectAll("." + classPrefix + "bars").style("opacity", d => d.year === year ? 1 : fadeOpacity);
			})
			.on("mouseout", () => {
				xAxisTopChart.tickValues(yearsArrayWithNull.filter((e, i) => e && (!(i % 2) || e === currentYear)));
				xAxisGroupTopChart.call(xAxisTopChart);
				barLineTop.style("opacity", 1);
				lastYearCircleTop.style("opacity", 1);
				lastYearLineTop.style("opacity", 1);
				barLabelTop.style("opacity", 1);
				allLabelsTop.style("opacity", 0);
				barsTop.style("opacity", 1);
				xAxis.tickValues([yearsArray[0], currentYear - 1]);
				highlightSelection.donorSvg.select("." + classPrefix + "xAxisGroup").call(xAxis);
				highlightSelection.donorSvg.select("." + classPrefix + "barLine").style("opacity", 1);
				highlightSelection.donorSvg.select("." + classPrefix + "lastYearCircle").style("opacity", 1);
				highlightSelection.donorSvg.select("." + classPrefix + "lastYearLine").style("opacity", 1);
				highlightSelection.donorSvg.select("." + classPrefix + "barLabel").style("opacity", 1);
				highlightSelection.donorSvg.selectAll("." + classPrefix + "allLabels").style("opacity", 0);
				highlightSelection.donorSvg.selectAll("." + classPrefix + "bars").style("opacity", 1);
			});

		//end of createTopChart
	};

	function createTopRadioButtons(data) {

		const donorLabels = topRadioButtonsDonorsDiv.selectAll(null)
			.data(donors)
			.enter()
			.append("label")
			.attr("class", classPrefix + "donorLabels");

		const donorInputOuterSpan = donorLabels.append("span")
			.attr("class", classPrefix + "radioInput");

		const donorInput = donorInputOuterSpan.append("input")
			.attr("type", "radio")
			.attr("name", classPrefix + "donorInput")
			.attr("value", d => d)
			.property("checked", d => chartState.selectedDonors === d);

		const donorInputInnerSpan = donorInputOuterSpan.append("span")
			.attr("class", classPrefix + "radioControl");

		const donorsText = donorLabels.append("span")
			.attr("class", classPrefix + "radioLabel")
			.html(d => d === donors[0] ? `Top ${topDonorsNumber} Donors` : "All donors");

		const orderLabels = topRadioButtonsOrderDiv.selectAll(null)
			.data(orders)
			.enter()
			.append("label")
			.attr("class", classPrefix + "orderLabels");

		const orderInputOuterSpan = orderLabels.append("span")
			.attr("class", classPrefix + "radioInput");

		const orderInput = orderInputOuterSpan.append("input")
			.attr("type", "radio")
			.attr("name", classPrefix + "orderInput")
			.attr("value", d => d)
			.property("checked", d => chartState.selectedOrder === d);

		const orderInputInnerSpan = orderInputOuterSpan.append("span")
			.attr("class", classPrefix + "radioControl");

		const ordersText = orderLabels.append("span")
			.attr("class", classPrefix + "radioLabel")
			.html(d => d === orders[0] ? "By contributions" : "By alphabetical order");

		donorInput.on("change", (d, i, n) => {
			chartState.selectedDonors = n[i].value;
			createTopFigures(data);
			createTopChart(data);
			hideDonors();
		});

		orderInput.on("change", (d, i, n) => {
			chartState.selectedOrder = n[i].value;
			sortDonors(data.byDonor);
		});

		//end of createTopRadioButtons
	};

	function createChartDivs(dataByDonor, flagsData) {

		dataByDonor.sort((a, b) => chartState.selectedOrder === orders[0] ? b.total - a.total : a.donor.localeCompare(b.donor));

		const bandwidth = xScale.bandwidth();

		const syncedTransition = d3.transition()
			.duration(duration);

		const donorDiv = chartsDiv.selectAll(null)
			.data(dataByDonor, d => d.donorId)
			.enter()
			.append("div")
			.style("display", d => chartState.selectedDonors === donors[0] && !topDonorsIsoCodes.includes(d.isoCode) ? "none" : null)
			.attr("class", classPrefix + "donorDiv")
			.style("width", svgWidth + "px")
			.style("min-height", svgHeight + donorNameDivHeight + "px");

		const donorSvg = donorDiv.append("svg")
			.attr("width", svgWidth)
			.attr("height", svgHeight)
			.style("overflow", "visible");

		highlightSelection.donorDiv = donorDiv;
		highlightSelection.donorSvg = donorSvg;

		const xAxisGroup = donorSvg.append("g")
			.attr("class", classPrefix + "xAxisGroup")
			.attr("transform", "translate(0," + (svgHeight - svgPadding[2]) + ")")
			.call(xAxis);

		const donorNameDiv = donorDiv.append("div")
			.attr("class", classPrefix + "donorNameDiv")
			.style("min-height", donorNameDivHeight + "px");

		const donorFlag = donorNameDiv.append("img")
			.attr("width", flagSize)
			.attr("height", flagSize)
			.attr("src", d => flagsData[d.isoCode.toLowerCase()]);

		const donorName = donorNameDiv.append("span")
			.html(d => d.donor);

		donorSvg.each((d, i, n) => {
			const yScale = localyScale.set(n[i], d3.scaleLinear()
				.range(yScaleRange)
				.domain([0, d3.max(d.contributions, e => d3.max(d.contributions, e => e.amount))]));

			localLine.set(n[i], d3.line()
				.x(d => xScale(d.year) + bandwidth / 2)
				.y(d => yScale(d.amount))
				.curve(d3.curveMonotoneX));
		});

		const bars = donorSvg.selectAll(null)
			.data(d => d.contributions)
			.enter()
			.append("rect")
			.attr("class", classPrefix + "bars")
			.style("fill", d => d.year === currentYear ? `url(#${classPrefix}patterncerf)` : cerfColor)
			.style("stroke", d => d.year === currentYear ? "#ccc" : null)
			.attr("x", d => xScale(d.year))
			.attr("width", bandwidth)
			.attr("y", (d, i, n) => localyScale.get(n[i])(d.amount))
			.attr("height", (d, i, n) => localyScale.get(n[i])(0) - localyScale.get(n[i])(d.amount));

		const barLine = donorSvg.selectAll(null)
			.data(d => fillWithZeros(d.contributions.filter(e => e.year < currentYear && e.year >= xScale.domain()[0])))
			.enter()
			.append("path")
			.attr("class", classPrefix + "barLine")
			.style("stroke", "#888")
			.style("stroke-width", "1.5px")
			.style("fill", "none")
			.attr("d", (d, i, n) => localLine.get(n[i])(d));

		const lastYearLine = donorSvg.selectAll(null)
			.data(d => [d.contributions.find(e => e.year === currentYear - 1) || zeroObject])
			.enter()
			.append("polyline")
			.attr("class", classPrefix + "lastYearLine")
			.attr("points", (d, i, n) => {
				const thisLocalScale = localyScale.get(n[i]);
				return `${xScale(currentYear - 1) + bandwidth/2},${thisLocalScale(d.amount)} 
				${xScale(currentYear - 1) + bandwidth/2},${Math.min(svgHeight - svgPadding[2] - labelMinPadding, thisLocalScale(d.amount))} 
				${xScale(currentYear - 1) + barLabelPadding},${Math.min(svgHeight - svgPadding[2] - labelMinPadding, thisLocalScale(d.amount))}`
			})
			.style("stroke", "#bbb")
			.style("stroke-width", "1px")
			.style("fill", "none");

		const lastYearCircle = donorSvg.selectAll(null)
			.data(d => [d.contributions.find(e => e.year === currentYear - 1) || zeroObject])
			.enter()
			.append("circle")
			.attr("class", classPrefix + "lastYearCircle")
			.attr("cx", xScale(currentYear - 1) + bandwidth / 2)
			.attr("cy", (d, i, n) => localyScale.get(n[i])(d.amount))
			.attr("r", lastYearCircleRadius)
			.style("fill", "#888");

		const barLabel = donorSvg.selectAll(null)
			.data(d => [d.contributions.find(e => e.year === currentYear - 1) || zeroObject])
			.enter()
			.append("text")
			.attr("class", classPrefix + "barLabel")
			.attr("x", xScale(currentYear - 1) + barLabelPadding)
			.attr("y", (d, i, n) => Math.min(svgHeight - svgPadding[2] - labelMinPadding, localyScale.get(n[i])(d.amount)))
			.text(d => d3.formatPrefix(".0", d.amount)(d.amount).replace("G", "B"));

		const allLabels = donorSvg.selectAll(null)
			.data(d => d.contributions)
			.enter()
			.append("text")
			.attr("class", classPrefix + "allLabels")
			.style("opacity", 0)
			.attr("x", d => xScale(d.year) + bandwidth / 2)
			.attr("y", (d, i, n) => localyScale.get(n[i])(d.amount))
			.text(d => d3.formatPrefix(".0", d.amount)(d.amount).replace("G", "B"));

		donorDiv.on("mouseover", donorDivMouseOver)
			.on("mouseout", donorDivMouseOut)
			.on("click", (d, i, n) => donorDivClick(d, n[i], flagsData));

		//end of createChartDivs
	};

	function donorDivMouseOver() {
		d3.select(this).classed(classPrefix + "donorDivActive", true);
		d3.select(this).append("div")
			.attr("class", classPrefix + "donorExpandDiv")
			.append("i")
			.attr("class", "fa fa-arrows-alt")
	};

	function donorDivMouseOut() {
		d3.select(this).classed(classPrefix + "donorDivActive", false);
		d3.select(this)
			.select("." + classPrefix + "donorExpandDiv")
			.remove();
	};

	function donorDivClick(datum, thisElement, flagsData) {

		d3.select(thisElement).classed(classPrefix + "donorDivActive", false);
		d3.select(thisElement)
			.select("." + classPrefix + "donorExpandDiv")
			.remove();

		yScaleTooltip.domain([0, d3.max(datum.contributions, e => e.amount)]);

		const tooltipDiv = chartsDiv.append("div")
			.style("position", "fixed")
			.attr("id", classPrefix + "tooltipDiv")
			.style("left", "50%")
			.style("top", "50%")
			.style("transform", "translate(-50%,-50%)");

		const innerTooltipDiv = tooltipDiv.append("div")
			.style("width", tooltipWidth + "px")
			.style("height", tooltipDonorNameHeight + tooltipSvgHeight + "px")
			.style("cursor", "default")
			.style("pointer-events", "all");

		const tooltipTopDiv = innerTooltipDiv.append("div")
			.attr("class", classPrefix + "tooltipTopDiv")
			.style("width", "100%")
			.style("height", tooltipDonorNameHeight + "px");

		const tooltipTopDivMain = tooltipTopDiv.append("div")
			.attr("class", classPrefix + "tooltipTopDivMain");

		const tooltipTopDivClose = tooltipTopDiv.append("div")
			.attr("class", classPrefix + "tooltipTopDivClose")
			.on("click", () => tooltipDiv.remove());

		tooltipTopDivClose.append("i")
			.attr("class", "fa fa-window-close-o")
			.style("cursor", "pointer");

		const tooltipChartDiv = innerTooltipDiv.append("div")
			.style("width", "100%")
			.style("height", "100%");

		const tooltipSvg = tooltipChartDiv.append("svg")
			.attr("width", tooltipWidth)
			.attr("height", tooltipSvgHeight)
			.attr("class", classPrefix + "tooltipSvg");

		const tooltipNameDiv = tooltipTopDivMain.append("div")
			.attr("class", classPrefix + "tooltipNameDiv");

		const donorFlag = tooltipNameDiv.append("img")
			.attr("width", flagSizeTooltip)
			.attr("height", flagSizeTooltip)
			.attr("src", flagsData[datum.isoCode.toLowerCase()]);

		const donorName = tooltipNameDiv.append("span")
			.html(datum.donor);

		tooltipSvg.append("g")
			.attr("class", classPrefix + "xAxisGroupTooltip")
			.attr("transform", "translate(0," + (tooltipSvgHeight - tooltipSvgPadding[2]) + ")")
			.call(xAxisTooltip)
			.selectAll(".tick")
			.filter(d => d === null)
			.remove();

		tooltipSvg.append("g")
			.attr("class", classPrefix + "yAxisGroupTooltip")
			.attr("transform", "translate(" + tooltipSvgPadding[3] + ",0)")
			.call(yAxisTooltip)
			.selectAll(".tick")
			.filter(d => d === 0)
			.remove();

		const tooltipTransition = d3.transition()
			.duration(duration);

		const tooltipBars = tooltipSvg.selectAll(null)
			.data(datum.contributions)
			.enter()
			.append("rect")
			.style("fill", d => d.year === currentYear ? `url(#${classPrefix}patterncerf)` : cerfColor)
			.style("stroke", d => d.year === currentYear ? "#ccc" : null)
			.attr("class", classPrefix + "tooltipBars")
			.attr("width", xScaleTooltip.bandwidth())
			.attr("height", 0)
			.attr("y", tooltipSvgHeight - tooltipSvgPadding[2])
			.attr("x", d => xScaleTooltip(d.year))
			.attr("data-toggle", "tooltip")
			.attr("data-placement", "right")
			.attr("data-container", "." + classPrefix + "tooltipTopDiv")
			.attr("title", d => "$" + formatMoney0Decimals(d.amount))
			.transition(tooltipTransition)
			.attr("y", d => yScaleTooltip(d.amount))
			.attr("height", d => yScaleTooltip(0) - yScaleTooltip(d.amount));

		$('[data-toggle="tooltip"]').tooltip()

		const tooltipLabel = tooltipSvg.selectAll(null)
			.data(datum.contributions.filter(d => d.amount))
			.enter()
			.append("text")
			.attr("class", classPrefix + "tooltipBarLabel")
			.style("opacity", 0)
			.style("fill", "#444")
			.attr("x", d => xScaleTooltip(d.year) + xScaleTooltip.bandwidth() / 2)
			.attr("y", tooltipSvgHeight - tooltipSvgPadding[2])
			.transition(tooltipTransition)
			.style("opacity", 1)
			.attr("y", d => yScaleTooltip(d.amount) - tooltipBarLabelPadding)
			.textTween((d, i, n) => {
				const interpolator = d3.interpolate(0, d.amount);
				return t => d3.formatPrefix(".0", interpolator(t))(interpolator(t)).replace("G", "B");
			});

		//end of donorDivClick
	};

	function hideDonors() {
		highlightSelection.donorDiv.style("display", d => chartState.selectedDonors === donors[0] && !topDonorsIsoCodes.includes(d.isoCode) ? "none" : null)
	};

	function sortDonors(dataByDonor) {
		highlightSelection.donorDiv.sort((a, b) => chartState.selectedOrder === orders[0] ? b.total - a.total : a.donor.localeCompare(b.donor));
	};

	function processData(rawData) {

		const data = {
			byDonor: [],
			topDonors: [],
			allDonors: []
		};

		const yearsSet = new Set();

		rawData.forEach(row => {
			if (row.FiscalYear <= currentYear) {

				yearsSet.add(+row.FiscalYear);

				const foundDonor = data.byDonor.find(e => e.isoCode === (row.GMSDonorISO2Code ? row.GMSDonorISO2Code.toLowerCase() : row.GMSDonorISO2Code));

				if (foundDonor) {
					foundDonor.total += row.PaidAmt + row.PledgeAmt;;
					const foundYear = foundDonor.contributions.find(e => e.year === row.FiscalYear);
					if (foundYear) {
						foundYear.amount += row.PaidAmt + row.PledgeAmt;
					} else {
						foundDonor.contributions.push({
							year: row.FiscalYear,
							amount: row.PaidAmt + row.PledgeAmt
						});
					};
				} else {
					const donorObject = {
						donor: row.GMSDonorName,
						donorType: row.PooledFundName,
						isoCode: (row.GMSDonorISO2Code ? row.GMSDonorISO2Code.toLowerCase() : row.GMSDonorISO2Code),
						contributions: [{
							year: row.FiscalYear,
							amount: row.PaidAmt + row.PledgeAmt
						}],
						total: row.PaidAmt + row.PledgeAmt
					};
					data.byDonor.push(donorObject);
				};

				const foundAllDonorsYears = data.allDonors.find(e => e.year === row.FiscalYear);

				if (foundAllDonorsYears) {
					foundAllDonorsYears.amount += row.PaidAmt + row.PledgeAmt;
				} else {
					data.allDonors.push({
						year: row.FiscalYear,
						amount: row.PaidAmt + row.PledgeAmt
					});
				};

			};
		});

		data.byDonor.sort((a, b) => b.total - a.total);

		yearsArray.push(...yearsSet);
		yearsArray.sort((a, b) => a - b);

		yearsArray.forEach(year => data.topDonors.push({ year: year, amount: 0 }));

		data.byDonor.reduce((acc, curr, index) => {
			if (index < topDonorsNumber) {
				topDonorsIsoCodes.push(curr.isoCode);
				curr.contributions.forEach(contrib => acc.find(e => e.year === contrib.year).amount += contrib.amount);
			};
			return acc;
		}, data.topDonors);

		return data;

	};

	function createCsv(rawData) {

		const csvData = [];

		rawData.forEach(function(row) {
			csvData.push({
				Year: row.FiscalYear,
				Donor: row.GMSDonorName,
				"Donor type": row.PooledFundName,
				Paid: row.PaidAmt,
				Pledged: row.PledgeAmt,
				Total: (+row.PaidAmt) + (+row.PledgeAmt)
			});
		});

		const csv = d3.csvFormat(csvData);

		return csv;

		//end of createCsv
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
				setSvgStyles(this);
			});

		const topSvgRealSize = topChartSvg.node().getBoundingClientRect();
		topChartSvg.attr("width", topSvgRealSize.width)
			.attr("height", topSvgRealSize.height);

		topRadioButtonsDiv.selectAll("input")
			.style("opacity", 1)
			.style("width", "1.1em")
			.style("height", "1.1em");
		topRadioButtonsDiv.selectAll("." + classPrefix + "radioControl")
			.style("display", "none");

		const imageDiv = containerDiv.node();

		if (type === "png") {
			iconsDiv.style("opacity", 0);
		} else {
			topDiv.style("opacity", 0)
		};

		snapshotTooltip.style("display", "none");

		html2canvas(imageDiv).then(function(canvas) {

			topChartSvg.attr("width", null)
				.attr("height", null);

			topRadioButtonsDiv.selectAll("input")
				.style("opacity", 0)
				.style("width", 0)
				.style("height", 0);
			topRadioButtonsDiv.selectAll("." + classPrefix + "radioControl")
				.style("display", null);

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
			bottom: 19,
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

	function fillWithZeros(contributionsArray) {
		const copiedArray = JSON.parse(JSON.stringify(contributionsArray));
		const years = yearsArray.slice(0, -1);
		years.forEach(year => {
			if (!copiedArray.find(e => e.year === year)) {
				copiedArray.push({
					year: year,
					amount: 0
				})
			};
		});
		copiedArray.sort((a, b) => a.year - b.year);
		return [copiedArray];
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