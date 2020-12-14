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
		maxPieSize = 20,
		minPieSize = 1,
		buttonsNumber = 8,
		groupNamePadding = 2,
		topPanelHeight = 60,
		cerfCircleRadius = 20,
		zoomBoundingMarginHor = 26,
		zoomBoundingMarginVert = 6,
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
		dataUrl = "http://cbpfgms.github.io/pf-onebi-data/cerf/cerf_allocationSummary_byorg.csv",
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

		createTitle(rawData);

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
			.attr("y", topPanel.height * 0.3)
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
			.attr("y", topPanel.height * 0.3)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
			.text("Rapid Response");

		let topPanelUnderfundedValue = mainValueGroup.selectAll("." + classPrefix + "topPanelUnderfundedValue")
			.data([underfundedValue]);

		topPanelUnderfundedValue = topPanelUnderfundedValue.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelUnderfundedValue contributionColorFill")
			.attr("text-anchor", "end")
			.merge(topPanelUnderfundedValue)
			.attr("y", topPanel.height * 0.7)
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
			.attr("y", topPanel.height * 0.7)
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
			.attr("y", topPanel.height * 0.3)
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
			.attr("y", topPanel.height * 0.3)
			.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[4] + topPanel.mainValueHorPadding)
			.text(d => d > 1 ? "Countries" : "Country");

		let topPanelRegionalsValue = mainValueGroup.selectAll("." + classPrefix + "topPanelRegionalsValue")
			.data([numberofRegionals]);

		topPanelRegionalsValue = topPanelRegionalsValue.enter()
			.append("text")
			.attr("class", classPrefix + "topPanelRegionalsValue contributionColorFill")
			.attr("text-anchor", "end")
			.merge(topPanelRegionalsValue)
			.attr("y", topPanel.height * 0.7)
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
			.attr("y", topPanel.height * 0.7)
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

			tooltip.append("div")
				.style("margin-bottom", "10px")
				.style("font-size", "16px")
				.style("color", d3.color(cerfColor).darker(0.8))
				.style("width", "260px")
				.append("strong")
				.html(d.country);

			const tooltipContainer = tooltip.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("width", "260px");

			const tooltipData = [{
				title: "Total:",
				property: "cerftotal",
				color: d3.color(cerfColor).darker(0.4)
			}, {
				title: "Underfunded:",
				property: "cerfunderfunded",
				color: d3.color(cerfColor).darker(0.4)
			}, {
				title: "Rapid Response:",
				property: "cerfrapidresponse",
				color: d3.color(cerfColor).darker(0.4)
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
					.style("color", e.color)
					.html("$" + formatMoney0Decimals(d[e.property]).replace("G", "B"));
			});

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
						console.log(this)
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