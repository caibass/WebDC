
'use strict';

///////////////////////////////////////////////////////////////////////////////////////////
// init
///////////////////////////////////////////////////////////////////////////////////////////

function checkMobileDevice() {
	const userAgent = navigator.userAgent || navigator.vendor || window.opera;

	// 檢測 iOS 和 Android
	if (/iPhone|iPad|iPod|Android/i.test(userAgent)) {
		return true;
	}

	// 兼容 Safari 瀏覽器可能省略的部分
	if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
		// iPad（桌面模式會被偵測為 Mac）
		return true;
	}

	return false;
}

let isMobileDevice = checkMobileDevice();

//alert(isMobileDevice);

// init IndexedDB
const dbName = 'ImageDatabase';
const storeName = 'Images';

// indexedDB.deleteDatabase('ImageDatabase').onsuccess = () => {
// 	console.log('資料庫已刪除');
// };

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function openDatabase() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName, 1);

		request.onupgradeneeded = event => {
			const db = event.target.result;
			db.createObjectStore(storeName, { keyPath: 'name' });
		};

		request.onsuccess = event => {
			const result = event.target.result;
			//console.log('成功取得資料:', result);
			resolve(result);
		};

		request.onerror = event => {
			console.error('openDatabase fail:', event.target.error);
			reject(event.target.error);
		};
	});
}

function detectBrowser() {
	const userAgent = navigator.userAgent;

	if (userAgent.match(/chrome|chromium|crios/i)) {
		return "Chrome";
	} else if (userAgent.match(/firefox|fxios/i)) {
		return "Firefox";
	} else if (userAgent.match(/safari/i)) {
		return "Safari";
	} else if (userAgent.match(/opr\//i)) {
		return "Opera";
	} else if (userAgent.match(/edg/i)) {
		return "Edge";
	} else if (userAgent.match(/msie|trident/i)) {
		return "Internet Explorer";
	} else {
		return "unknown";
	}
}

var Browser = detectBrowser();
console.log("Browser:", Browser, ", isMobileDevice:", isMobileDevice);


///////////////////////////////////////////////////////////////////////////////////////////
// create element  
///////////////////////////////////////////////////////////////////////////////////////////

function createDocumentElement(tagId, childId) {
	let parent = document.createElement(tagId);
	parent.id = childId;
	document.body.appendChild(parent);
}

function createElement(tagId, parentId, childId) {
	let parent = document.getElementById(parentId);
	let child = document.createElement(tagId);

	child.id = childId;

	parent.appendChild(child);
}

function createCanvasElement(parentId, childId) {
	createElement("canvas", parentId, childId)
}

function createDivElement(parentId, childId) {
	createElement("div", parentId, childId)
}

function createSpanElement(parentId, childId) {
	createElement("span", parentId, childId)
}

function createSelectElement(parentId, childId) {
	createElement("select", parentId, childId)
}

function createTextareaElement(parentId, childId) {
	createElement("textarea", parentId, childId)
}

function createImgElement(parentId, childId) {
	createElement("img", parentId, childId)
}

function createVideoElement(parentId, childId) {
	createElement("video", parentId, childId)
}

function createInputElement(parentId, childId) {
	createElement("input", parentId, childId)
}

function createLabelElement(parentId, childId) {
	createElement("label", parentId, childId)
}

///////////////////////////////////////////////////////////////////////////////////////////
// operation   
///////////////////////////////////////////////////////////////////////////////////////////

function showElement(id, mode) {
	var eleId;

	eleId = document.getElementById(id);
	eleId.hidden = !mode;
}


if (typeof MouseStatus == "undefined") {
	var MouseStatus = {};
	MouseStatus.over = 0;
	MouseStatus.normal = 1;
	MouseStatus.click = 2;
}

if (typeof MouseBtnId == "undefined") {
	var MouseBtnId = {};
	MouseBtnId.left = 1;
	MouseBtnId.right = 3;
}

if (typeof DrawState == "undefined") {
	var DrawState = {};
	DrawState.start = 0;
	DrawState.move = 1;
	DrawState.end = 2;
	DrawState.undo = 3;
	DrawState.redo = 4;
	DrawState.mirror = 5;
	DrawState.flip = 6;
	DrawState.brightness = 7;
	DrawState.zoom = 8;
	DrawState.pan = 9;
	DrawState.whiteBalance = 10;
}

if (typeof VrField == "undefined") {
	var VrField = {};
	VrField.w = 0;
	VrField.h = 1;
	VrField.data = 2;
}

if (typeof FontField == "undefined") {
	var FontField = {};
	FontField.value = 0;
	FontField.status = 1;
}

if (typeof BaseImgChg == "undefined") {
	var BaseImgChg = {};
	BaseImgChg.before = 0;
	BaseImgChg.after = 1;
}

if (typeof UiType == "undefined") {
	var UiType = {};
	UiType.toolBar = 0;
	UiType.scrollBar = 1;
	UiType.colorBar = 2;
	UiType.sysToolBar = 3;
	UiType.displayCanvas = 4;
}


///////////////////////////////////////////////////////////////////////////////////////////
//  constant 
///////////////////////////////////////////////////////////////////////////////////////////

if (typeof BtnData == "undefined") {
	var BtnData = {};
	BtnData.id = 0;
	BtnData.pic = 1;
	BtnData.state = 2;
	BtnData.groupId = 3;
}


///////////////////////////////////////////////////////////////////////////////////////////
//  create
///////////////////////////////////////////////////////////////////////////////////////////

function createToolBarBtns(btnData, parentId) {
	var strTotal = "";
	var strElement;

	var len = btnData.length;
	var i;

	// set style

	for (i = 0; i < len; i++) {
		strElement = '<span class="' + parentId + ' toolBar" id="' + btnData[i][BtnData.id] + '"></span>';
		strTotal += strElement;
	}

	$('#' + parentId).html(strTotal);
}

function createToolBar(btnData, cssCfg, parentId, id, position, funcClick) {
	// create div element
	createDivElement(parentId, id);

	// save button data

	$('#' + id).data('btnData', btnData);

	// create buttons

	createToolBarBtns(btnData, id);

	// set style

	var eleString = '.' + id;

	var toolBar = document.getElementById(id);
	toolBar.classList.add('scrollable');

	$(eleString).css(cssCfg);

	// set pos

	var isFullH = false;
	var isFullW = false;
	var isRight = false;
	var isBottom = false;
	var startY = 0;
	var offsetX = cssCfg.width;
	var offsetY = cssCfg.height;

	if ('right' === position) {
		isRight = true;
		offsetX = 0;
		isFullH = true;

	}

	if ('left' === position) {
		offsetX = 0;
		isFullH = true;
	}

	if ('top-right' === position) {
		isRight = true;
		offsetY = 0;
		offsetX = -cssCfg.width;
	}

	if ('top-left' === position) {
		offsetY = 0;
		//isFullW = false;
		isFullW = true;
	}

	if ('bottom' === position) {
		offsetX = 60;
		offsetY = 0;
		isBottom = true;
	}

	$(eleString).attr('style', function (index, previousValue) {
		var attrLeft;

		if (isRight) attrLeft = ' left: calc(100% - ' + (cssCfg.width - index * offsetX) + 'px);';
		else attrLeft = ' left: ' + index * offsetX + 'px;';

		var curY;
		var attrTop;

		curY = startY + index * offsetY;

		if (isBottom) attrTop = ' top: ' + (curY) + 'px;';
		else attrTop = ' top: ' + curY + 'px;';

		return previousValue + attrLeft + attrTop;
	});

	// set mouse event handler

	$(eleString).hover(toolBarOnMouseEnter, toolBarOnMouseLeave);

	if (funcClick == undefined) {
		$(eleString).on('click', toolBarOnMouseClick);
	}
	else {
		$(eleString).on('click', funcClick);
	}

	// set container element with full height

	if (isFullH) {
		(function () {
			var cssH =
			{
				top: titleH + 'px',
				height: 'calc(100% - ' + titleH + 'px)',
				width: cssCfg.width + 'px',
				background: appCfg.toolBarColorLeave,
				opacity: appCfg.toolBarOpacityLeave,
				position: 'absolute',
			};

			if (isRight) cssH.right = '0px';
			else cssH.left = '0px';

			$('#' + id).css(cssH);
		})();
	}

	if (isFullW) {
		(function () {
			var cssH =
			{
				top: 0 + 'px',
				height: cssCfg.height + 'px',
				width: 'calc(100% - 48px)',
				background: appCfg.toolBarColorLeave,
				opacity: appCfg.toolBarOpacityLeave,
				position: 'absolute',
			};

			if (isRight) cssH.right = '0px';
			else cssH.left = '0px';

			$('#' + id).css(cssH);
		})();
	}

	// set container element with full width
	if (isBottom) {
		(function () {
			var cssW =
			{
				top: 'calc(100% - ' + (appCfg.scrollIconH * 2) + 'px)',
				left: '48px', //'340px',//appCfg.toolBarIconW + 'px',
				height: '30px',//appCfg.scrollIconH + 'px',//appCfg.toolBarIconH + 'px',
				width: '60px',
				background: "#00000000",//appCfg.toolBarColorLeave,
				opacity: appCfg.toolBarOpacityLeave,
				position: 'absolute',
			};

			$('#' + id).css(cssW);
		})();
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  update 
///////////////////////////////////////////////////////////////////////////////////////////

function getToolBarBtnIdx(btnData, btnId) {
	var i;
	var len = btnData.length;

	for (i = 0; i < len; i++) {
		if (btnId === btnData[i][BtnData.id]) {
			return i;
		}
	}

	return -1;
}

function setToolBarBtnPic(btnData, idx, state) {
	var eleId;
	var bkg;
	var color;
	var opacity;

	eleId = "#" + btnData[idx][BtnData.id];

	bkg = fcGetDefIconPath(btnData[idx][BtnData.pic]);
	$(eleId).css('background', bkg);

	if (fullPhotoMode) {
		if (state === MouseStatus.over) {
			color = appCfg.toolBarColorEnter;
			opacity = appCfg.toolBarOpacityEnter;
		}
		else if (state === MouseStatus.normal) {
			color = appCfg.toolBarColorHide;
			opacity = appCfg.toolBarOpacityHide;
			// color = appCfg.toolBarColorLeave;
			// opacity = appCfg.toolBarOpacityLeave;
		}
		else {
			color = appCfg.toolBarColorClick;
			opacity = appCfg.toolBarOpacityClick;
		}
	}
	else {
		if (state === MouseStatus.over) {
			color = appCfg.toolBarColorEnter;
			opacity = appCfg.toolBarOpacityEnter;
		}
		else if (state === MouseStatus.normal) {
			color = appCfg.toolBarColorLeave;
			opacity = appCfg.toolBarOpacityLeave;
		}
		else {
			color = appCfg.toolBarColorClick;
			opacity = appCfg.toolBarOpacityClick;
		}
	}

	$(eleId).css('background-color', color);
	$(eleId).css('background-position', 'center center');
	$(eleId).css('background-repeat', 'no-repeat');
	$(eleId).css('opacity', opacity);
}

function updateToolBar(btnData) {
	var i;
	var len = btnData.length;

	for (i = 0; i < len; i++) {
		if (1 === btnData[i][BtnData.state]) {
			setToolBarBtnPic(btnData, i, MouseStatus.click);
		}
		else if (2 === btnData[i][BtnData.state]) {
			setToolBarBtnPic(btnData, i, MouseStatus.over);
		}
		else {
			setToolBarBtnPic(btnData, i, MouseStatus.normal);
		}
	}
}

function getToolBarSelectedBtnIdx(btnData, groupId) {
	let i;
	const len = btnData.length;

	for (i = 0; i < len; i++) {
		if (groupId === btnData[i][BtnData.groupId]) {
			if (btnData[i][BtnData.state] > 0) {
				return i;
			}
		}
	}

	return -1;
}

function getToolBarGroupIdBtnCnt(btnData, groupId) {
	var cnt = 0;
	var i;
	var len = btnData.length;

	for (i = 0; i < len; i++) {
		if (groupId === btnData[i][BtnData.groupId]) {
			cnt += 1;
		}
	}

	return cnt;
}

function selectToolBarBtn(btnData, idx) {
	// toggle selectd button state

	var state = 1;

	if (btnData[idx][BtnData.state]) {
		state = 0;
	}

	// get group id

	let groupId = btnData[idx][BtnData.groupId];

	if (getToolBarGroupIdBtnCnt(btnData, groupId) > 1) {
		state = 1;
	}

	// clear selected button state

	if (groupId > 0) {
		let preSelected = getToolBarSelectedBtnIdx(btnData, groupId);

		if (preSelected >= 0) {
			if (groupId === btnData[preSelected][BtnData.groupId]) {
				btnData[preSelected][BtnData.state] = 0;
				setToolBarBtnPic(btnData, preSelected, MouseStatus.normal);
			}
		}

		if (preSelected == idx) return;
	}

	// set and update selected button

	btnData[idx][BtnData.state] = state;
	if (state) {
		setToolBarBtnPic(btnData, idx, MouseStatus.click);

		if (0 === groupId) {
			setTimeout(function () {
				btnData[idx][BtnData.state] = 0;
				setToolBarBtnPic(btnData, idx, MouseStatus.normal);
			},
				100);
		}
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  mouse event 
///////////////////////////////////////////////////////////////////////////////////////////

function toolBarOnMouseHoverHandler(event, state) {
	var eleId = '#' + event.target.id;
	var btnData = $(eleId).parent().data('btnData');

	var idx = getToolBarBtnIdx(btnData, event.target.id);

	if (0 === btnData[idx][BtnData.state]) {
		setToolBarBtnPic(btnData, idx, state);
	}
}

function toolBarOnMouseEnter(event) {
	toolBarOnMouseHoverHandler(event, MouseStatus.over);
}

function toolBarOnMouseLeave(event) {
	toolBarOnMouseHoverHandler(event, MouseStatus.normal);
}

function toolBarOnMouseClick(event) {
	fcMouseEventNotify(UiType.toolBar, MouseStatus.click, event);

	var btnData = $('#' + event.target.id).parent().data('btnData');
	var idx = getToolBarBtnIdx(btnData, event.target.id);
	if (idx >= 0) {
		selectToolBarBtn(btnData, idx);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
//  control 
///////////////////////////////////////////////////////////////////////////////////////////

function toolBarGetElementState(id, member) {
	var btnData = $('#' + id).data('btnData');
	var i;

	for (i = 0; i < btnData.length; i++) {
		if (member == btnData[i][BtnData.id]) {
			return btnData[i][BtnData.state];
		}
	}
}

function toolBarSetElementState(id, member, state) {
	var btnData = $('#' + id).data('btnData');
	var i;

	for (i = 0; i < btnData.length; i++) {
		if (member == btnData[i][BtnData.id]) {
			btnData[i][BtnData.state] = state;
			updateToolBar(btnData);
			return;
		}
	}
}

function toolBarSetAllElementState(id, state) {
	var btnData = $('#' + id).data('btnData');
	var i;

	for (i = 0; i < btnData.length; i++) {
		btnData[i][BtnData.state] = state;
	}
	updateToolBar(btnData);
}


///////////////////////////////////////////////////////////////////////////////////////////
//  constant 
///////////////////////////////////////////////////////////////////////////////////////////

if (typeof ColorData == "undefined") {
	var ColorData = {};
	ColorData.color = 0;
	ColorData.state = 1;
}


///////////////////////////////////////////////////////////////////////////////////////////
//  create
///////////////////////////////////////////////////////////////////////////////////////////

function createColorBarBtns(colorData, parentId) {
	var strTotal = "";
	var strElement;

	var len = colorData.length;
	var i;
	var eleId;

	for (i = 0; i < len; i++) {
		//eleId = parentId + '-' + colorData[i][ColorData.color];
		eleId = colorData[i][ColorData.color];

		createDivElement(parentId, eleId);

		$('#' + eleId).addClass(parentId + ' colorBar');
	}
}

function createColorBar(colorData, cssCfg, parentId, id, funcNotify) {
	// create div element

	createDivElement(parentId, id);

	// set css

	(function () {
		var css =
		{
			position: 'absolute',
			'margin-left': '0px',
			background: appCfg.drawSetBackground,
			opacity: appCfg.drawSetOpacity,
		};

		var len = colorData.length;

		var w = appCfg.colorIconW;
		var h = appCfg.colorIconH;

		css.width = (w * len) + 'px';
		css.height = h + 'px';
		css.left = 'calc(100% - ' + (w * len) + 'px)';
		css.top = '0px';

		$('#' + id).css(css);

	})();

	// save color data

	colorData.fnNotify = funcNotify;

	$('#' + id).data('colorData', colorData);

	// create buttons

	createColorBarBtns(colorData, id);

	// set style

	var eleString = '.' + id;

	$(eleString).css(cssCfg);

	// set pos

	$(eleString).attr('style', function (index, previousValue) {
		var attrLeft;
		attrLeft = ' left: calc(100% - ' + (cssCfg.width * (index + 1)) + 'px);';

		var attrTop;
		attrTop = ' top: ' + 0 + 'px;';

		var color;
		color = ' background: #' + colorData[index][ColorData.color] + ';';

		var margin;
		margin = ' margin: ' + appCfg.colorIconMarginNormal + 'px;';

		var width;
		width = ' width: ' + (cssCfg.width - 2 * appCfg.colorIconMarginNormal) + 'px;';

		var height;
		height = ' height: ' + (cssCfg.height - 2 * appCfg.colorIconMarginNormal) + 'px;';

		return previousValue + attrLeft + attrTop + color + margin + width + height;
	});

	// set mouse event handler

	$(eleString).hover(colorBarOnMouseEnter, colorBarOnMouseLeave);

	$(eleString).on('click', colorBarOnMouseClick);

	// notify

	colorBarNotify($('#' + id));
}


///////////////////////////////////////////////////////////////////////////////////////////
//  mouse event 
///////////////////////////////////////////////////////////////////////////////////////////

function colorBarOnMouseClick(event) {
	var colorData = $('#' + event.target.id).parent().data('colorData');
	var i;

	for (i = 0; i < colorData.length; i++) {
		if (event.target.id === colorData[i][ColorData.color]) colorData[i][ColorData.state] = 1;
		else colorData[i][ColorData.state] = 0;
	}

	updateColorBar(colorData);

	colorBarNotify($('#' + event.target.id).parent());

	fcMouseEventNotify(UiType.colorBar, MouseStatus.click, event);
}

function colorBarOnMouseHoverHandler(event, state) {
	var eleId = '#' + event.target.id;
	var colorData = $(eleId).parent().data('colorData');
	var idx = getColorBarBtnIdx(colorData, event.target.id);

	if (0 === colorData[idx][ColorData.state]) {
		setColorBarBtn(colorData, idx, state);
	}
}

function colorBarOnMouseEnter(event) {
	colorBarOnMouseHoverHandler(event, MouseStatus.over);
}

function colorBarOnMouseLeave(event) {
	colorBarOnMouseHoverHandler(event, MouseStatus.normal);
}


///////////////////////////////////////////////////////////////////////////////////////////
//  update 
///////////////////////////////////////////////////////////////////////////////////////////

function getColorBarBtnIdx(colorData, btnId) {
	var i;
	var len = colorData.length;

	for (i = 0; i < len; i++) {
		if (btnId === colorData[i][ColorData.color]) {
			return i;
		}
	}

	return -1;
}

function setColorBarBtn(colorData, idx, state) {
	var eleId = "#" + colorData[idx][ColorData.color];
	var margin;
	var size;

	if (state === MouseStatus.over) {
		margin = appCfg.colorIconMarginOver;
		size = appCfg.colorIconW - appCfg.colorIconMarginNormal * 2;
	}
	else if (state === MouseStatus.normal) {
		margin = appCfg.colorIconMarginNormal;
		size = appCfg.colorIconW - appCfg.colorIconMarginNormal * 2;
	}
	else {
		margin = appCfg.colorIconMarginClick;
		size = appCfg.colorIconW - appCfg.colorIconMarginClick * 2;
	}

	$(eleId).css('margin', margin + 'px');
	$(eleId).css('width', size + 'px');
	$(eleId).css('height', size + 'px');
}

function updateColorBar(colorData) {
	var i;
	var len = colorData.length;

	for (i = 0; i < len; i++) {
		if (1 === colorData[i][ColorData.state]) {
			setColorBarBtn(colorData, i, MouseStatus.click);
		}
		else {
			setColorBarBtn(colorData, i, MouseStatus.normal);
		}
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  notify 
///////////////////////////////////////////////////////////////////////////////////////////

function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function colorBarNotify(id$) {
	var colorData = $(id$).data('colorData');
	var color;
	var i;
	var r, g, b;

	if (colorData.fnNotify) {
		for (i = 0; i < colorData.length; i++) {
			if (colorData[i][ColorData.state]) {
				color = colorData[i][ColorData.color];

				r = hexToRgb('#' + color).r;
				g = hexToRgb('#' + color).g;
				b = hexToRgb('#' + color).b;

				colorData.fnNotify(color, r, g, b);
			}
		}
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  constant 
///////////////////////////////////////////////////////////////////////////////////////////

if (typeof ColorData == "undefined") {
	var ColorData = {};
	ColorData.color = 0;
	ColorData.state = 1;
}


///////////////////////////////////////////////////////////////////////////////////////////
//  create
///////////////////////////////////////////////////////////////////////////////////////////

function createColorBarBtnsType2(colorData, parentId) {
	var len = colorData.length;
	var i;
	var spanId;
	var canvasId;
	var selector;
	var id;
	var ctx;
	var w, h;
	var r, g, b;
	var color;

	w = appCfg.cb2BlockW - 2 * appCfg.cb2FrameGap;
	h = appCfg.cb2BlockH - 2 * appCfg.cb2FrameGap;

	var cssCanvas =
	{
		position: 'absolute',
		left: appCfg.cb2FrameGap,
		top: appCfg.cb2FrameGap,
		width: w,
		height: h,
		opacity: 1,
	};

	var cssSpan =
	{
		position: 'absolute',
		left: 0,
		top: 0,
		width: appCfg.scrollIconW,
		height: appCfg.scrollIconH,
		opacity: 1,
	};


	for (i = 0; i < len; i++) {
		// get color

		color = colorData[i][ColorData.color];

		r = hexToRgbType2('#' + color).r;
		g = hexToRgbType2('#' + color).g;
		b = hexToRgbType2('#' + color).b;

		// create base span

		spanId = color;
		createSpanElement(parentId, spanId);

		// set span size

		selector = '#' + spanId;

		cssSpan.left = (len - 1 - i) * appCfg.scrollIconW;

		$(selector).css(cssSpan);

		// create canvas

		canvasId = spanId + '_' + 'canvas';
		createCanvasElement(spanId, canvasId);

		// set canvas mouse event handler

		selector = '#' + canvasId;

		$(selector).hover(colorBarOnMouseEnterType2, colorBarOnMouseLeaveType2);

		$(selector).on('click', colorBarOnMouseClickType2);

		// set canvas size

		$(selector).css(cssCanvas);

		$(selector).attr('width', w);
		$(selector).attr('height', h);

		// draw color block

		id = document.getElementById(canvasId);
		ctx = id.getContext('2d');

		fcClearCanvas(id);

		var fillStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + 1.0 + ')';

		ctx.fillStyle = fillStyle;
		ctx.fillRect(0, 0, w, h);
	}
}

function createColorBarType2(colorData, cssCfg, parentId, id, funcNotify) {
	// create div element

	createSpanElement(parentId, id);

	// set css

	(function () {
		var css =
		{
			position: 'absolute',
			'margin-left': '0px',
			background: appCfg.drawSetBackground,
			opacity: appCfg.drawSetOpacity,
		};

		var len = colorData.length;

		var w = appCfg.cb2BlockW;
		var h = appCfg.cb2BlockH;

		css.width = (w * len) + 'px';
		css.height = h + 'px';


		// old version, in the bottom bar
		//css.left = 'calc(100% - ' + (w * len) + 'px)';
		css.top = '40px'; //'calc(100% - ' + (h + 30) + 'px)';
		css.left = '0px';

		$('#' + id).css(css);

	})();

	// save color data

	colorData.fnNotify = funcNotify;

	$('#' + id).data('colorData', colorData);

	// create buttons

	createColorBarBtnsType2(colorData, id);

	// notify

	colorBarNotifyType2($('#' + id));
}


///////////////////////////////////////////////////////////////////////////////////////////
//  mouse event 
///////////////////////////////////////////////////////////////////////////////////////////

function colorBarOnMouseClickType2(event) {
	var canvasId = event.target.id;
	var spanId = $('#' + canvasId).parent().attr('id');
	var baseId = $('#' + spanId).parent().attr('id');
	var colorData = $('#' + baseId).data('colorData');
	var i;

	for (i = 0; i < colorData.length; i++) {
		if (spanId === colorData[i][ColorData.color]) colorData[i][ColorData.state] = 1;
		else colorData[i][ColorData.state] = 0;
	}

	updateColorBarType2(colorData);

	colorBarNotifyType2($('#' + baseId));

	fcMouseEventNotify(UiType.colorBar, MouseStatus.click, event);
}

function colorBarOnMouseHoverHandlerType2(event, state) {
	var canvasId = event.target.id;
	var spanId = $('#' + canvasId).parent().attr('id');
	var baseId = $('#' + spanId).parent().attr('id');
	var colorData = $('#' + baseId).data('colorData');
	var idx = getColorBarBtnIdxType2(colorData, spanId);

	if (0 === colorData[idx][ColorData.state]) {
		setColorBarBtnType2(colorData, idx, state);
	}
}

function colorBarOnMouseEnterType2(event) {
	colorBarOnMouseHoverHandlerType2(event, MouseStatus.over);
}

function colorBarOnMouseLeaveType2(event) {
	colorBarOnMouseHoverHandlerType2(event, MouseStatus.normal);
}


///////////////////////////////////////////////////////////////////////////////////////////
//  update 
///////////////////////////////////////////////////////////////////////////////////////////

function getColorBarBtnIdxType2(colorData, btnId) {
	var i;
	var len = colorData.length;

	for (i = 0; i < len; i++) {
		if (btnId === colorData[i][ColorData.color]) {
			return i;
		}
	}

	return -1;
}

function setColorBarBtnType2(colorData, idx, state) {
	var eleId = "#" + colorData[idx][ColorData.color];
	var bkColor;

	if (state === MouseStatus.over) {
		bkColor = appCfg.cb2MouseColorEnter;
	}
	else if (state === MouseStatus.normal) {
		bkColor = appCfg.cb2MouseColorLeave;
	}
	else {
		bkColor = appCfg.cb2MouseColorClick;
	}

	$(eleId).css('background', bkColor);
}

function updateColorBarType2(colorData) {
	var i;
	var len = colorData.length;

	for (i = 0; i < len; i++) {
		if (1 === colorData[i][ColorData.state]) {
			setColorBarBtnType2(colorData, i, MouseStatus.click);
		}
		else {
			setColorBarBtnType2(colorData, i, MouseStatus.normal);
		}
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  notify 
///////////////////////////////////////////////////////////////////////////////////////////

function hexToRgbType2(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function colorBarNotifyType2(id$) {
	var colorData = $(id$).data('colorData');
	var color;
	var i;
	var r, g, b;

	if (colorData.fnNotify) {
		for (i = 0; i < colorData.length; i++) {
			if (colorData[i][ColorData.state]) {
				color = colorData[i][ColorData.color];

				r = hexToRgbType2('#' + color).r;
				g = hexToRgbType2('#' + color).g;
				b = hexToRgbType2('#' + color).b;

				colorData.fnNotify(color, r, g, b);
			}
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
//  create
///////////////////////////////////////////////////////////////////////////////////////////

function createScrollBar(scrollData, cssCfg, parentId, id, funcNotify) {
	var iconId;
	var canvasId;
	var eleId;
	var bkg;
	var curX;
	var w, h;
	var totalW;

	// create div element

	createSpanElement(parentId, id);

	// set div css

	totalW = scrollData.iconSize + appCfg.scrollIconGap + scrollData.length + appCfg.scrollTickH;

	if (typeof scrollData.iconR != "undefined") totalW += appCfg.scrollIconGap + scrollData.iconSize;

	cssCfg.left = scrollData.startX + 'px';
	cssCfg.top = scrollData.startY + 'px';
	cssCfg.width = totalW + 'px';
	cssCfg.height = scrollData.iconSize + 'px';

	$('#' + id).css(cssCfg);

	// save scroll data

	scrollData.id = id;
	scrollData.mouseDown = false;
	scrollData.fnNotify = funcNotify;

	$('#' + id).data('scrollData', scrollData);

	// create child element

	iconId = id + '-iconL';
	createSpanElement(id, iconId);

	var canvasId = id + '-canvas';
	createCanvasElement(id, canvasId);

	// set left icon style

	curX = 0;

	eleId = '#' + iconId;

	bkg = fcGetDefIconPath(scrollData.iconL);
	$(eleId).css('background', bkg);

	$(eleId).css('top', 0 + 'px');
	$(eleId).css('left', curX + 'px');
	$(eleId).css('width', scrollData.iconSize + 'px');
	$(eleId).css('height', scrollData.iconSize + 'px');
	$(eleId).css('position', 'absolute');

	curX += scrollData.iconSize;

	// set canvas style

	curX += appCfg.scrollIconGap;

	eleId = '#' + canvasId;

	w = scrollData.length + appCfg.scrollTickH;
	h = scrollData.iconSize;

	$(eleId).css('top', 0 + 'px');
	$(eleId).css('left', curX + 'px');
	$(eleId).css('width', w + 'px');
	$(eleId).css('height', h + 'px');
	$(eleId).css('position', 'absolute');

	$(eleId).attr('width', w);
	$(eleId).attr('height', h);

	curX += w;

	// set right icon style

	if (typeof scrollData.iconR != "undefined") {
		iconId = id + '-iconR';
		createSpanElement(id, iconId);

		curX += appCfg.scrollIconGap;

		eleId = '#' + iconId;

		bkg = fcGetDefIconPath(scrollData.iconR);
		$(eleId).css('background', bkg);

		$(eleId).css('top', 0 + 'px');
		$(eleId).css('left', curX + 'px');
		$(eleId).css('width', scrollData.iconSize + 'px');
		$(eleId).css('height', scrollData.iconSize + 'px');
		$(eleId).css('position', 'absolute');
	}

	// notify host

	scrollBarNotify(id);

	// set canvas mouse event handler 

	eleId = '#' + canvasId;

	(function () {

		var sd = $('#' + id).data('scrollData');

		$(eleId)
			.on('mousedown', function (event) {
				if (MouseBtnId.left === event.which) {
					sd.mouseDown = true;

					updateScrollPos(event);

					fcMouseEventNotify(UiType.scrollBar, MouseStatus.click, event);
				}
			})
			.on('mousemove', function (event) {
				if (sd.mouseDown) {
					updateScrollPos(event);
				}
			})
			.on('mouseup', function () {
				if (MouseBtnId.left === event.which) {
					sd.mouseDown = false;
				}
			})
			.on('mouseout', function () {
				if (MouseBtnId.left === event.which) {
					sd.mouseDown = false;
				}
			})
			.on('touchstart', function (event) {
				fcTouchHandler(event);
			})
			.on('touchmove', function (event) {
				fcTouchHandler(event);
			})
			.on('touchend', function () {
				fcTouchHandler(event);
			})
			.on('touchcancel', function () {
				fcTouchHandler(event);
			});
	})();

	return totalW;
}


///////////////////////////////////////////////////////////////////////////////////////////
//  update
///////////////////////////////////////////////////////////////////////////////////////////

function updateScrollPos(event) {
	var eleId = '#' + event.target.id;
	var sd = $(eleId).parent().data('scrollData');

	var pos = event.offsetX;;
	var offset = appCfg.scrollTickH / 2;

	if (pos <= offset) pos = 0;
	if (pos > sd.length) pos = sd.length;
	sd.curPos = pos;

	updateScrollBar(sd.id);

	scrollBarNotify(sd.id);
}

function updateScrollBar(id) {
	var canvas;
	var eleId = '#' + id;
	var sd = $(eleId).data('scrollData');
	var context;
	var x, y, w, h, r;
	var offsetY;

	canvas = document.getElementById(id + '-canvas');
	context = canvas.getContext('2d');

	// clear background

	fcClearCanvas(canvas);

	// account offset Y

	offsetY = (sd.iconSize - appCfg.scrollTickH) / 2;

	// draw axis

	x = appCfg.scrollTickH / 2;
	y = offsetY + (appCfg.scrollTickH - appCfg.scrollLineH) / 2;
	w = sd.length;
	h = appCfg.scrollLineH;

	context.rect(x, y, w, h);
	context.fillStyle = sd.color;
	context.fill();

	// draw tick

	x = appCfg.scrollTickH / 2 + sd.curPos;
	y = offsetY + appCfg.scrollTickH / 2;
	r = appCfg.scrollTickH / 2;

	context.arc(x, y, r, 0, 2 * Math.PI, false);
	context.fillStyle = sd.color;
	context.fill();
}


///////////////////////////////////////////////////////////////////////////////////////////
//  notify
///////////////////////////////////////////////////////////////////////////////////////////

function scrollBarNotify(id) {
	var eleId = '#' + id;
	var sd = $(eleId).data('scrollData');

	if (sd.fnNotify) {
		sd.fnNotify(sd.length, sd.curPos);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
//  control
///////////////////////////////////////////////////////////////////////////////////////////

function scrollBarSetPos(id, pos) {
	var sd = $('#' + id).data('scrollData');

	if (pos <= sd.length) {
		sd.curPos = pos;
		updateScrollBar(id);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
//  create
///////////////////////////////////////////////////////////////////////////////////////////

function showConfigDlg(mode) {
	showElement('configDlg', mode);
}

function initConfigDlg() {
	var eleId;
	var sliderId;
	var configDlg = "configDlg";

	var x = 24;
	var y = 36;
	var gapV = 48;

	var w = 370; //420;
	var h = 200;

	createDivElement("uiArea", configDlg);
	eleId = "#" + configDlg;
	$(eleId).css('background', appBaseCfg.ColorLeave);
	$(eleId).css("top", "calc(50%)");
	$(eleId).css('left', appCfg.toolBarIconW + "px");
	$(eleId).css('width', w + 'px');
	$(eleId).css('height', h + 'px');
	$(eleId).css('position', 'absolute');
	$(eleId).hide()

	// close icon
	// eleId = configDlg + '-close';
	// createSpanElement(configDlg, eleId);

	// eleId = '#' + eleId;
	// var bkg = fcGetDefIconPath("close.png");

	// $(eleId).css('background', bkg);
	// $(eleId).css('top', 0 + 'px');
	// $(eleId).css('left', (w - appCfg.toolBarIconW) + 'px');
	// $(eleId).css('width', appCfg.toolBarIconW + 'px');
	// $(eleId).css('height', appCfg.toolBarIconH + 'px');
	// $(eleId).css('position', 'absolute');
	// $(eleId).on('click', function () {
	// 	$("#" + configDlg).hide()
	// });

	// brightness
	eleId = configDlg + '-brightness';
	sliderId = createScrollBarII(configDlg, eleId, "brightness.png", x, y);
	eleId = '#' + sliderId;
	$(eleId).attr({
		"type": "range",
		"max": 2, //90,
		"min": 0, //-90,
		"step": 0.01, //2,
		"value": 1 //0
	});
	$(eleId).on('input', function (m) {

		appFC.previewBrightnessAdj = Math.floor(m.currentTarget.value);

		if (appFC.curMode) {
			fcCanvasCtrl(DrawState.brightness);
		}
	});

	// rotate
	eleId = configDlg + '-rotate';
	sliderId = createScrollBarII(configDlg, eleId, "rotate.png", x, y + gapV);
	eleId = '#' + sliderId;
	$(eleId).attr({
		"type": "range",
		"max": 180,
		"min": -180,
		"step": 5,
		"value": 0
	});
	$(eleId).on('input', function (m) {
		appFC.previewRotate = Math.floor(m.currentTarget.value);
	});

	// white balence
	eleId = configDlg + '-whiteBalence';
	sliderId = createScrollBarII(configDlg, eleId, "wb.png", x, y + gapV * 2);
	eleId = '#' + sliderId;
	$(eleId).attr({
		"type": "range",
		"max": 1.5, //40,
		"min": 0.5, //-40,
		"step": 0.01, //1,
		"value": 1 //0
	});
	$(eleId).on('input', function (m) {
		appFC.previewWhiteBalanceAdj = Math.floor(m.currentTarget.value);

		if (appFC.curMode) {
			fcCanvasCtrl(DrawState.whiteBalance);
		}
	});
}

function initConfigDrawDlg() {
	var eleId;
	var sliderId;
	var configDlg = "configDrawDlg";

	var x = 24;
	var y = 36;
	var gapV = 48;

	var w = 300;
	var h = 70;

	createDivElement("uiArea", configDlg);
	eleId = "#" + configDlg;
	$(eleId).css('background', appBaseCfg.ColorLeave);
	$(eleId).css("top", "calc(100% - 100px)");
	$(eleId).css('left', (winW - w - appCfg.toolBarIconW) + "px");
	$(eleId).css('width', w + 'px');
	$(eleId).css('height', h + 'px');
	$(eleId).css('position', 'absolute');
	$(eleId).hide()

	// close icon
	// eleId = configDlg + '-close';
	// createSpanElement(configDlg, eleId);

	// eleId = '#' + eleId;
	// var bkg = fcGetDefIconPath("close.png");

	// $(eleId).css('background', bkg);
	// $(eleId).css('top', 0 + 'px');
	// $(eleId).css('left', (w - appCfg.toolBarIconW) + 'px');
	// $(eleId).css('width', appCfg.toolBarIconW + 'px');
	// $(eleId).css('height', appCfg.toolBarIconH + 'px');
	// $(eleId).css('position', 'absolute');
	// $(eleId).on('click', function () {
	// 	$("#" + configDlg).hide()
	// });

	//
	initScrollBar();
	initColorBar();
}

function createScrollBarII(parentId, id, icon, x, y) {
	var sliderW = 200;
	var gapH = 16;

	var eleId = id + "-icon";
	createSpanElement(parentId, eleId);
	eleId = '#' + eleId;
	$(eleId).css({
		"background": fcGetDefIconPath(icon),
		"top": y,
		"left": x,
		"width": appCfg.toolBarIconW + 'px',
		"height": appCfg.toolBarIconH + 'px',
		"position": "absolute"
	});

	var sliderId = id + '-slider';
	createInputElement(parentId, sliderId);

	eleId = "#" + sliderId;
	$(eleId).attr("class", "slider");
	$(eleId).css({
		"top": y,
		"left": x + appCfg.toolBarIconW + gapH,
		"width": sliderW + 'px',
		"height": appCfg.toolBarIconH + 'px',
		"position": "absolute"
	});

	eleId = id + '-reset';
	createSpanElement(parentId, eleId);

	eleId = '#' + eleId;
	$(eleId).css('background', fcGetDefIconPath("undo.png"));
	$(eleId).css('top', y + 'px');
	$(eleId).css('left', (x + appCfg.toolBarIconW + gapH + sliderW + gapH) + 'px');
	$(eleId).css('width', appCfg.toolBarIconW + 'px');
	$(eleId).css('height', appCfg.toolBarIconH + 'px');
	$(eleId).css('position', 'absolute');
	$(eleId).on('click', function () {
		if (sliderId == "configDlg-rotate-slider")
			$("#" + sliderId).val(0);
		else
			$("#" + sliderId).val(1);

		$("#" + sliderId).trigger("input");
	});

	return sliderId;
}

function createScrollBarIII(parentId, id, icon_L, icon_R, x, y) {
	var sliderW = 200;
	var gapH = 16;

	// Left Icon
	var eleId = id + "-icon-L";
	createSpanElement(parentId, eleId);
	eleId = '#' + eleId;
	$(eleId).css({
		"background": fcGetDefIconPath(icon_L),
		"top": y,
		"left": x,
		"width": appCfg.toolBarIconW + 'px',
		"height": appCfg.toolBarIconH + 'px',
		"position": "absolute"
	});

	// Right Icon
	var eleId = id + "-icon-R";
	createSpanElement(parentId, eleId);
	eleId = '#' + eleId;
	$(eleId).css({
		"background": fcGetDefIconPath(icon_R),
		"top": y,
		"left": x + appCfg.toolBarIconW + gapH + sliderW + gapH,
		"width": appCfg.toolBarIconW + 'px',
		"height": appCfg.toolBarIconH + 'px',
		"position": "absolute"
	});

	// slider bar
	var sliderId = id + '-slider';
	createInputElement(parentId, sliderId);
	eleId = "#" + sliderId;
	$(eleId).attr("class", "slider");
	$(eleId).css({
		"top": y,
		"left": x + appCfg.toolBarIconW + gapH,
		"width": sliderW + 'px',
		"height": appCfg.toolBarIconH + 'px',
		"position": "absolute"
	});

	// eleId = id + '-reset';
	// createSpanElement(parentId, eleId);

	// eleId = '#' + eleId;
	// $(eleId).css('background', fcGetDefIconPath("undo.png"));
	// $(eleId).css('top', y + 'px');
	// $(eleId).css('left', ( x + appCfg.toolBarIconW + gapH + sliderW + gapH )  + 'px');
	// $(eleId).css('width', appCfg.toolBarIconW + 'px');
	// $(eleId).css('height', appCfg.toolBarIconH + 'px');
	// $(eleId).css('position', 'absolute');
	// $(eleId).on('click', function(){
	// 	$("#"+sliderId).val(0);
	// 	$("#"+sliderId).trigger("input");
	// });

	return sliderId;
}

function createScrollBarDlg(scrollData, cssCfg, parentId, id, funcNotify, withReset = false) {
	var eleId;
	var w, h;
	var bkg;
	var dlgCss =
	{
		position: 'absolute',
		'margin-left': '0px',
		background: appCfg.scrollDlgBkg,
		opacity: appCfg.scrollDlgOpacity,
	};

	// create div element

	createSpanElement(parentId, id);

	// set div css

	w = scrollData.iconSize + appCfg.scrollIconGap + scrollData.length + appCfg.scrollTickH;
	if (typeof scrollData.iconR != "undefined") w += appCfg.scrollIconGap + scrollData.iconSize;

	h = scrollData.iconSize + appCfg.toolBarIconH;

	dlgCss.left = 'calc(50% - ' + (w / 2) + 'px)';
	dlgCss.top = 'calc(50% - ' + ((h - appCfg.titleIconH) / 2) + 'px)';
	dlgCss.width = w + 'px';
	dlgCss.height = h + 'px';

	$('#' + id).css(dlgCss);

	// create close icon element

	eleId = id + '-close';
	createSpanElement(id, eleId);

	eleId = '#' + eleId;
	bkg = fcGetDefIconPath("close.png");

	$(eleId).css('background', bkg);
	$(eleId).css('top', 0 + 'px');
	$(eleId).css('left', (w - appCfg.toolBarIconW) + 'px');
	$(eleId).css('width', appCfg.toolBarIconW + 'px');
	$(eleId).css('height', appCfg.toolBarIconH + 'px');
	$(eleId).css('position', 'absolute');
	$(eleId).on('click', ScrollBarDlgClose);

	// creat reset icon elment
	if (withReset) {
		eleId = id + '-reset';
		createSpanElement(id, eleId);

		eleId = '#' + eleId;
		bkg = fcGetDefIconPath("undo.png");

		$(eleId).css('background', bkg);
		$(eleId).css('top', 0 + 'px');
		$(eleId).css('left', (w / 2 - appCfg.toolBarIconW / 2) + 'px');
		$(eleId).css('width', appCfg.toolBarIconW + 'px');
		$(eleId).css('height', appCfg.toolBarIconH + 'px');
		$(eleId).css('position', 'absolute');
		$(eleId).on('click', function () {
			scrollBarSetPos(id + '-scrollbar', scrollData.length / 2);
			updateScrollBar(id + '-scrollbar');
			scrollBarNotify(id + '-scrollbar');
		});
	}


	// create scroll bar

	eleId = id + '-scrollbar';

	scrollData.startY = appCfg.toolBarIconH;

	createScrollBar(scrollData, cssCfg, id, eleId, funcNotify);
	updateScrollBar(eleId);
}

///////////////////////////////////////////////////////////////////////////////////////////
//  event handler
///////////////////////////////////////////////////////////////////////////////////////////

function ScrollBarDlgClose(event) {
	fcCloseActiveDlg();
}

function ScrollBarDlgSetPos(id, pos) {
	var eleId = id + '-scrollbar';

	scrollBarSetPos(eleId, pos);
}

///////////////////////////////////////////////////////////////////////////////////////////
//  constant 
///////////////////////////////////////////////////////////////////////////////////////////

if (typeof PictureWinAction == "undefined") {
	var PictureWinAction = {};
	PictureWinAction.move = 0;
	PictureWinAction.trAnchor = 1;
	PictureWinAction.tlAnchor = 2;
	PictureWinAction.brAnchor = 3;
	PictureWinAction.blAnchor = 4;
	PictureWinAction.down = 5;
}


///////////////////////////////////////////////////////////////////////////////////////////
//  function 
///////////////////////////////////////////////////////////////////////////////////////////

function initPictureWin() {
	// set default data

	var picData =
	{
		dispX: 0,
		dispY: 0,
		dispW: 0,
		dispH: 0,
		imgSrc: 0,
		isActive: false,
		x: 0,
		y: 0,
		w: 0,
		h: 0,
		mouseDown: false,
		type: PictureWinAction.down,
		startX: 0,
		startY: 0,
	};

	var eleId = '#importPictureWin';

	$(eleId).data('picData', picData);

	// create image display area

	displayPictureCreateImgDsiplayArea();

	displayPictureMouseEvent('importPicture', PictureWinAction.move);

	// $('#importPictureWin').on('click', function(event) {
	// 	displayPictureWinClose(true);
	// });

	$('#importPictureWin').on('dblclick', function (event) {
		displayPictureWinClose(true);
	});

	// verify expand ratio

	var expandRatio;

	expandRatio = appCfg.ipwRadiusExpandRatio;
	expandRatio = Math.floor(expandRatio);
	if (expandRatio < 1) expandRatio = 1;

	appFC.ipwRadiusExpandRatio = expandRatio;

	// create anchor

	displayPictureCreateAnchor('tlAnchor', PictureWinAction.tlAnchor);
	displayPictureCreateAnchor('trAnchor', PictureWinAction.trAnchor);
	displayPictureCreateAnchor('blAnchor', PictureWinAction.blAnchor);
	displayPictureCreateAnchor('brAnchor', PictureWinAction.brAnchor);

	// hide

	activePictureWin(false);
}

function displayPictureCreateImgDsiplayArea() {
	var r = appCfg.ipwRadius;

	var css =
	{
		position: 'absolute',
		left: r + 'px',
		top: r + 'px',
		width: 'calc(100% - ' + 2 * r + 'px)',
		height: 'calc(100% - ' + 2 * r + 'px)',
		opacity: appCfg.ipwOpacity,
	};

	createCanvasElement('importPictureWin', 'importPicture');

	$('#importPicture').css(css);
}

function displayPictureCreateAnchor(id, type) {
	var eleId = "#" + id;
	var x, y;
	var r = appCfg.ipwRadius;
	var expandRatio;
	var size;
	var extraSpace;

	// caculate extra space

	size = r * 2;
	expandRatio = appFC.ipwRadiusExpandRatio;
	extraSpace = size * (expandRatio - 1) / 2;
	appFC.ipwExtraSpace = extraSpace;

	// create

	createCanvasElement('importPictureWin', id);

	// set size

	switch (type) {
		case PictureWinAction.trAnchor:
			x = 'calc(100% - ' + (size + extraSpace) + 'px)';
			y = -extraSpace + 'px';
			break;

		case PictureWinAction.tlAnchor:
			x = -extraSpace + 'px';
			y = -extraSpace + 'px';
			break;

		case PictureWinAction.brAnchor:
			x = 'calc(100% - ' + (size + extraSpace) + 'px)';
			y = 'calc(100% - ' + (size + extraSpace) + 'px)';
			break;

		case PictureWinAction.blAnchor:
			x = -extraSpace + 'px';
			y = 'calc(100% - ' + (size + extraSpace) + 'px)';
			break;
	}

	size = size * expandRatio;

	var css =
	{
		position: 'absolute',
		left: x,
		top: y,
		width: size + 'px',
		height: size + 'px',
		opacity: appCfg.ipwOpacity,
	};

	$(eleId).css(css);

	$(eleId).attr('width', size);
	$(eleId).attr('height', size);

	// draw circle

	var angle = Math.PI * 2;

	var ctx = document.getElementById(id).getContext('2d');

	ctx.fillStyle = appCfg.ipwColor;
	ctx.strokeStyle = appCfg.ipwColor;
	ctx.lineWidth = appCfg.ipwLineWidth;

	ctx.beginPath();
	ctx.arc((r + extraSpace), (r + extraSpace), r, 0, angle, false);
	ctx.closePath();
	ctx.fill();

	// set mouse event handler

	displayPictureMouseEvent(id, type);
}

var fnDisplayPicture = false;

function updateImgSizeEx() {
	var mc = appFC.curMode;
	var ratio = mc.imgW / dispW;
	var eleId = '#importPictureWin';
	var pd = $(eleId).data('picData');

	pd.x = ($(eleId).offset().left - dispX) * ratio;
	pd.y = ($(eleId).offset().top - dispY) * ratio;
	pd.w = ($(eleId).width()) * ratio;
	pd.h = ($(eleId).height()) * ratio;

	pd.dispX = $(eleId).offset().left - dispX;
	pd.dispY = $(eleId).offset().top - dispY;
	pd.dispW = $(eleId).width();
	pd.dispH = $(eleId).height();
}

function updateSizeEx(type, event) {
	var eleId = '#importPictureWin';
	var pd = $(eleId).data('picData');

	var dx = event.clientX - pd.startX;
	var dy = event.clientY - pd.startY;

	var x = pd.dispX;
	var y = pd.dispY;
	var w = pd.dispW;
	var h = pd.dispH;

	switch (type) {
		case PictureWinAction.trAnchor:
			w += dx;
			y += dy;
			h -= dy;
			break;

		case PictureWinAction.tlAnchor:
			x += dx;
			w -= dx;
			y += dy;
			h -= dy;
			break;

		case PictureWinAction.brAnchor:
			w += dx;
			h += dy;
			break;

		case PictureWinAction.blAnchor:
			x += dx;
			w -= dx;
			h += dy;
			break;
	}

	var css =
	{
		left: dispX + x,
		top: dispY + y,
		width: w,
		height: h,
	};

	$('#importPictureWin').css(css);
}

function moveEx(event) {
	var eleId = '#importPictureWin';
	var pd = $(eleId).data('picData');
	var dx = event.clientX - pd.startX;
	var dy = event.clientY - pd.startY;
	var css =
	{
		left: dispX + pd.dispX + dx,
		top: dispY + pd.dispY + dy,
	};
	$('#importPictureWin').css(css);
}

function displayPictureMouseEvent(id, type) {
	var eleId = '#importPictureWin';
	var pd = $(eleId).data('picData');
	var mc = appFC.curMode;

	var r = appCfg.ipwRadius;
	var r2 = r * r;

	eleId = '#' + id;

	$(eleId)
		.on('mousedown', function (event) {
			if (MouseBtnId.left === event.which) {
				if (checkInside(event, type)) {
					pd.mouseDown = true;

					// pd.startX = event.offsetX;
					// pd.startY = event.offsetY;

					pd.startX = event.clientX;
					pd.startY = event.clientY;

					pd.type = type;

					fnDisplayPicture = true;
				}
			}
		})
		.on('dblclick', function (event) {
			displayPictureWinClose(true);
		})
		.on('mousemove', function (event) {
			if (pd.mouseDown) {
				switch (pd.type) {
					case PictureWinAction.move:
						//console.log(event.clientX);
						moveEx(event);
						break;

					case PictureWinAction.trAnchor:
					case PictureWinAction.tlAnchor:
					case PictureWinAction.brAnchor:
					case PictureWinAction.blAnchor:
						updateSizeEx(pd.type, event);
						break;
				}
			}
		})
		.on('mouseup', function (event) {
			if (MouseBtnId.left === event.which) {
				pd.mouseDown = false;
				updateImgSizeEx();

				fnDisplayPicture = false;
			}
		})
		.on('mouseout', function (event) {
			if (MouseBtnId.left === event.which) {
				//pd.mouseDown = false;
				//updateImgSize();
			}
		})
		.on('touchstart', function (event) {
			fcTouchHandler(event);
		})
		.on('touchmove', function (event) {
			fcTouchHandler(event);
		})
		.on('touchend', function (event) {
			fcTouchHandler(event);
		})
		.on('touchcancel', function (event) {
			fcTouchHandler(event);
		});

	function updateImgSize() {
		var mc = appFC.curMode;
		var ratio = mc.imgW / dispW;

		pd.x = pd.dispX * ratio;
		pd.y = pd.dispY * ratio;
		pd.w = pd.dispW * ratio;
		pd.h = pd.dispH * ratio;
	}

	function updateSize(type, event) {
		var dx = event.offsetX - pd.startX;
		var dy = event.offsetY - pd.startY;

		var x = pd.dispX;
		var y = pd.dispY;
		var w = pd.dispW;
		var h = pd.dispH;

		switch (type) {
			case PictureWinAction.trAnchor:
				w += dx;
				y += dy;
				h -= dy;
				break;

			case PictureWinAction.tlAnchor:
				x += dx;
				w -= dx;
				y += dy;
				h -= dy;
				break;

			case PictureWinAction.brAnchor:
				w += dx;
				h += dy;
				break;

			case PictureWinAction.blAnchor:
				x += dx;
				w -= dx;
				h += dy;
				break;
		}

		pd.dispX = x;
		pd.dispY = y;
		pd.dispW = w;
		pd.dispH = h;

		var css =
		{
			left: dispX + x,
			top: dispY + y,
			width: w,
			height: h,
		};

		$('#' + event.target.id).parent().css(css);
		//$('#importPictureWin').css(css);	
	}

	function move(event) {
		var dx = event.offsetX - pd.startX;
		var dy = event.offsetY - pd.startY;

		pd.dispX += dx;
		pd.dispY += dy;

		var css =
		{
			left: dispX + pd.dispX,
			top: dispY + pd.dispY,
		};

		$('#' + event.target.id).parent().css(css);
	}

	function checkInside(event, type) {
		var size = appCfg.ipwRadius * 2;
		var extraSpace = appFC.ipwExtraSpace;
		var x, y;

		if (PictureWinAction.move == type) return true;

		x = event.offsetX;
		y = event.offsetY;

		if ((x >= extraSpace) && (x < (extraSpace + size)) && (y >= extraSpace) && (y < (extraSpace + size))) return true;

		return false;
	}
}

function displayPictureWin(image) {
	var imgDrawW, imgDrawH;
	var mc = appFC.curMode;
	var id = 'importPictureWin';
	var selector = '#' + id;
	var r = appCfg.ipwRadius;

	// ajust display size
	imgDrawW = image.width;
	imgDrawH = image.height;

	// limit min size
	var minSize = 200;//r*2;

	if (imgDrawW < minSize) {
		imgDrawH = imgDrawH * minSize / imgDrawW;
		imgDrawW = minSize;
	}

	if (imgDrawH < minSize) {
		imgDrawW = imgDrawW * minSize / imgDrawH;
		imgDrawH = minSize;
	}

	// limit max size

	var maxW = mc.imgW - r * 2;
	var maxH = mc.imgH - r * 2;

	if (imgDrawW > maxW) {
		imgDrawH = imgDrawH * maxW / imgDrawW;
		imgDrawW = maxW;
	}

	if (imgDrawH > maxH) {
		imgDrawW = imgDrawW * maxH / imgDrawH;
		imgDrawH = maxH;
	}

	// location in base image

	var canvasImgW, canvasImgH;
	var x, y;
	var w, h;
	var ratio;

	canvasImgW = image.width + r * 2;
	canvasImgH = image.height + r * 2;

	w = imgDrawW + r * 2;
	h = imgDrawH + r * 2;

	x = (mc.imgW - w) / 2;
	y = (mc.imgH - h) / 2;

	// update store data

	var pd = $(selector).data('picData');

	pd.imgSrc = image;
	pd.dispW = dispW;
	pd.dispH = dispH;
	pd.x = x;
	pd.y = y;
	pd.w = w;
	pd.h = h;

	// location in display area

	pd.isActive = true;

	resizePictureWin();

	// ���J�v��

	selector = '#importPicture'
	$(selector).attr('width', image.width);
	$(selector).attr('height', image.height);

	var ctx = document.getElementById('importPicture').getContext('2d');

	ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);

	// ��� 

	activePictureWin(true);
}

function activePictureWin(mode) {
	var pd = $('#' + 'importPictureWin').data('picData');

	showElement('importPictureWin', mode);

	pd.isActive = mode;
}

function resizePictureWin() {
	var pd = $('#' + 'importPictureWin').data('picData');
	var mc = appFC.curMode;
	var x, y;
	var w, h;
	var ratio;

	if (typeof pd == "undefined") return;

	if (false == pd.isActive) return;

	ratio = dispW / mc.imgW;

	x = pd.x * ratio;
	y = pd.y * ratio;
	w = pd.w * ratio;
	h = pd.h * ratio;

	var css =
	{
		position: 'absolute',
		left: dispX + x,
		top: dispY + y,
		width: w,
		height: h,
		opacity: appCfg.ipwOpacity,
	};

	$('#' + 'importPictureWin').css(css);

	pd.dispX = x;
	pd.dispY = y;
	pd.dispW = w;
	pd.dispH = h;
}

function displayPictureWinClose(draw) {
	if (!draw) {
		activePictureWin(false);
		return;
	}



	var eleId = '#importPictureWin';
	var pd = $(eleId).data('picData');

	// var mc = appFC.curMode;
	// var ratio = mc.imgW / dispW;
	// pd.dispX = ($(eleId).offset().left - dispX) * ratio;
	// pd.dispY = ($(eleId).offset().top - dispY) * ratio;
	// pd.dispW = ($(eleId).width()) * ratio;
	// pd.dispH = ($(eleId).height()) * ratio;

	var mc = appFC.curMode;
	var ctx = appFC.drawContext;
	var r = appCfg.ipwRadius * mc.imgW / dispW;

	if (false == pd.isActive)
		return;

	fcClearDrawingCanvas();

	//console.log(pd);
	//console.log(r);
	ctx.drawImage(pd.imgSrc, 0, 0, pd.imgSrc.width, pd.imgSrc.height, pd.x + r, pd.y + r, pd.w - 2 * r, pd.h - 2 * r);

	fcCanvasCtrl(DrawState.end);
	if (mc.imageProcess) mc.imageProcess();

	activePictureWin(false);

	if (IsScanMode) {
		//console.log("close active Picture Win");
		attachCropBox(dispW, dispH);
	}
}


const appName = "Documate";


var appBaseCfg =
{
	// windows resize delay

	resizeDelayMs: 100,

	// mode / title / system / toolbar icon size

	iconW: 48,
	iconH: 48,

	// drawing cfg area size 

	drawSetH: 30,

	// mouse event

	ColorEnter: '#2874A6',
	ColorLeave: '#154360',
	ColorClick: '#1F618D',
	ColorHide: '#000',

	OpacityEnter: '1.0',
	OpacityLeave: '1.0',
	OpacityClick: '1.0',
	OpacityHide: '0',

	resolutionIdx: -1
};

var appCfg =
{
	// version

	cfgVersion: '1.5.0',

	// background color

	bgColor: '#808080',//'#FAFAFA',

	// used icon size

	titleIconH: appBaseCfg.iconH,

	toolBarIconW: appBaseCfg.iconW,
	toolBarIconH: appBaseCfg.iconH,

	modeIconW: 100,
	modeIconH: appBaseCfg.iconH,

	// common mouse event config

	mouseColorEnter: appBaseCfg.ColorEnter,
	mouseColorLeave: appBaseCfg.ColorLeave,
	mouseColorClick: appBaseCfg.ColorClick,

	mouseOpacityEnter: appBaseCfg.OpacityEnter,
	mouseOpacityLeave: appBaseCfg.OpacityLeave,
	mouseOpacityClick: appBaseCfg.OpacityClick,

	// drawing config

	drawSetH: appBaseCfg.drawSetH,

	drawSetBackground: appBaseCfg.ColorLeave,
	drawSetOpacity: appBaseCfg.OpacityLeave,

	// drawing config color select bar type 1

	colorIconW: 30,
	colorIconH: appBaseCfg.drawSetH,
	colorIconMarginClick: 3,
	colorIconMarginNormal: 6,
	colorIconMarginOver: 4,
	colorIconOpacity: '1.0',

	// drawing config color select bar type 2

	cb2Apply: 1,

	cb2BlockW: 30,
	cb2BlockH: appBaseCfg.drawSetH,
	cb2FrameGap: 6,
	cb2MouseColorEnter: appBaseCfg.ColorEnter,
	cb2MouseColorLeave: appBaseCfg.ColorLeave,
	cb2MouseColorClick: appBaseCfg.ColorClick,

	// scroll bar common set

	scrollIconW: 30,
	scrollIconH: appBaseCfg.drawSetH,
	scrollIconGap: 0,
	scrollTickH: 12,
	scrollLineH: 2,
	scrollColor: "#F8F9F9",
	scrollGroupGap: 8,

	// drawing config opacity scroll bar

	scrollOpacityW: 90,
	scrollOpacityDefPos: 80,

	// drawing config line width scroll bar

	scrollLineWidthW: 90,
	scrollLineWidthDefPos: 30,

	lineWidthMin: 4,
	lineWidthMax: 40,

	// scroll bar dialog

	scrollDlgBkg: appBaseCfg.ColorLeave,
	scrollDlgOpacity: appBaseCfg.OpacityLeave,

	// brightness scroll bar

	scrollBrighnessW: 180,
	scrollBrighnessDefPos: 90,

	brightnewwMin: -128,
	brightnewwMax: 128,

	whiteBalanceMin: -25,
	whiteBalanceMax: 25,

	// zoom scroll bar

	scrollZoomW: 180,
	scrollZoomDefPos: 0,

	zoomMaxRatio: 8,

	// pan window

	panWinGapX: 4,
	panWinGapY: 4,
	panWinColor: appBaseCfg.ColorLeave,
	panCropColor: '#555',
	panOpacity: appBaseCfg.OpacityLeave,

	// setting dialog

	sdBkg: appBaseCfg.ColorLeave,
	sdOpacity: appBaseCfg.OpacityLeave,

	sdIconW: appBaseCfg.iconW,
	sdIconH: appBaseCfg.iconH,

	sdExtraW: 14,

	sdIconScrollGap: 4,
	sdGroupGap: 0,
	sdScrollGap: 8,
	sdFrameGapX: 4,
	sdFrameGapY: 4,
	sdScrollH: 30,

	sdVideoRsoW: 120,
	sdFontFamilyW: 100,
	sdFontStyleW: 100,
	sdFontSizeW: 48,

	// text input dialog

	tidBkg: appBaseCfg.ColorLeave,
	tidOpacity: appBaseCfg.OpacityLeave,

	tidIconW: appBaseCfg.iconW,
	tidIconH: appBaseCfg.iconH,
	tidTextFrmW: 300,
	tidTextFrmH: 200,
	tidFrameGap: 8,
	tidIconFrmGap: 4,

	tidTextSize: 20,

	// drawing tool

	eraserOpacity: 0.8,

	minArrowSize: 10,

	// tool bar 

	toolBarColorEnter: appBaseCfg.ColorEnter,
	toolBarColorLeave: appBaseCfg.ColorLeave,
	toolBarColorClick: appBaseCfg.ColorClick,
	toolBarColorHide: appBaseCfg.ColorHide,

	toolBarOpacityEnter: appBaseCfg.OpacityEnter,
	toolBarOpacityLeave: appBaseCfg.OpacityLeave,
	toolBarOpacityClick: appBaseCfg.OpacityClick,
	toolBarOpacityHide: appBaseCfg.OpacityHide,

	// import picture window

	ipwColor: '#AAA',
	ipwOpacity: 1,
	ipwLineWidth: 6,
	ipwRadius: 16,

	ipwRadiusExpandRatio: 1,

	// video stream

	defPreviewRsoX: 1920,
	defPreviewRsoY: 1080,

	// drawing board 

	defDrawingBoardW: 1920,
	defDrawingBoardH: 1080,

	drawingBoardBgColor: '#FFF',

	// playback

	defPictureW: 1920,
	defPictureH: 1080,

	thumbW: 160,
	thumbH: 120,
	thumbPadding: 10,
	thumbFrmSize: 4,
	thumbFrmColorNormal: '#000',
	thumbFrmColorChecked: '#FF0',

	pbInfoW: 240,
	pbInfoH: 24,
	pbInfoColor: '#FF0',
	pbInfoColor_Page: '#FF0',
	pbInfoColor_Item: '#3F3',
	pbInfoFontSize: '150%',
	pbInfoFontWWeight: 'normal',

	// about

	aboutWinW: 400,
	aboutWinH: 340,
	aboutBkg: '#154360',
	aboutOpacity: 1,
	aboutIconW: appBaseCfg.iconW,
	aboutIconH: appBaseCfg.iconH,
	aboutGapX: 30,

	// periodic capture dialog

	pcdBkg: appBaseCfg.ColorLeave,
	pcdOpacity: appBaseCfg.OpacityLeave,

	pcdIconOverlayY: 20,
	pcdIconW: appBaseCfg.iconW,
	pcdIconH: appBaseCfg.iconH,
	pcdTextW: 80,
	pcdTextH: 20,
	pcdUnitW: 60,
	pcdUnitH: 16,
	pcdUnitOffsetY: 4,
	pcdExtraW: 12,

	pcdCapturePeriodSec: 1,
	pcdCaptureIntervalHour: 1,

	// periodic capture info bar

	pcibBkg: appBaseCfg.ColorLeave,
	pcibOpacity: appBaseCfg.OpacityLeave,

	pcibIconW: appBaseCfg.iconW,
	pcibIconH: appBaseCfg.iconH,

	pcibTextH: 24,
	pcibTextW: 120,
	pcibTextColor: '#2F2',
	pcibTextFontSize: '150%',

	pcidGapY: 4,

	// confirm dialog

	cdIconW: appBaseCfg.iconW,
	cdIconH: appBaseCfg.iconH,

	cdFrameGap: 26,
	cdIconGap: 10,

	cdBkg: appBaseCfg.ColorLeave,
	cdOpacity: appBaseCfg.OpacityLeave,

	cdMouseColorEnter: appBaseCfg.ColorEnter,
	cdMouseColorLeave: appBaseCfg.ColorLeave,
	cdMouseColorClick: appBaseCfg.ColorClick,

	// sys info window

	sysInfoWinW: 88,
	sysInfoWinH: 82,
	sysInfoH: 16,
	sysInfoGap: 4,

	// drawing canvas overlay

	disableDrawingCanvasOverlay: 0,

	// disable UI component

	disableDrawingToolBar: 0,
	disableColorBar: 0,
	disableDrawingOpacityScrollBar: 0,
	disableDrawingLineWidthScrollBar: 0,

	disableDrawTextSetting: 0,
};

var drawingToolBarData =
	[
		// element id          pic filename             selected	group id
		//["sys_fullPhoto", "fullPhoto.png", 0, 1],
		["btn_freehand", "freeHand.png", 0, 1],
		["btn_arrow", "arrow.png", 0, 1],
		["btn_eraser", "ereser.png", 0, 1],
		["btn_line", "line.png", 0, 1],
		["btn_rectangleLine", "rectangleLine.png", 0, 1],
		["btn_rectangle", "rectangle.png", 0, 1],
		["btn_circleLine", "circleLine.png", 0, 1],
		["btn_circle", "circle.png", 0, 1],
		["btn_erase_all", "clearAll.png", 0, 0],
		["btn_text", "text.png", 0, 1],
		["btn_configDraw", "config2.png", 0, 0],
	];

var drawingToolBarDataEmpty =
	[
	];

var bottomToolBarData =
	[
		// element id          pic filename             selected	group id
		//["btn_record", "record.png", 0, 0],
		//[ "btn_pause",		  "pause.png",				0,			0 ]
	]

var previewToolBarData =
	[
		// element id          pic filename             selected	group id
		["btn_setting", "setting.png", 0, 0],
		["btn_capture", "capture.png", 0, 0],
		["btn_record", "record2.png", 0, 0],
		["btn_freeze", "Freeze.png", 0, 3],
		// ["btn_timesave", "timesave.png", 0, 0],
		["btn_mirrow", "mirrow.png", 0, 5],
		["btn_flip", "flip.png", 0, 6],
		["btn_config", "config.png", 0, 0],
		//[ "btn_brightness",    "brightness.png",	    0,			0 ],
		//[ "btn_whitebalance",  "wb.png",        	    0,			0 ],
		["btn_zoom", "zoom.png", 0, 0],
		["btn_importPic", "inportPic.png", 0, 0],
		["btn_redo", "redo.png", 0, 0],
		["btn_undo", "undo.png", 0, 0],
		//[ "btn_test",          "setting.png",	        0,			0 ],
	];

var scanToolBarData_S1 =
	[
		// element id          pic filename             selected	group id
		//[ "scbtn_setting",     "setting.png",	        0,			0 ],
		["scbtn_transform", "perspectiveImage.png", 0, 0],
		["scbtn_importPic", "inportPic.png", 0, 0],
		["Dummy", "dummy.png", 0, 0],
		["scbtn_fullcrop", "fullPhoto.png", 0, 6],
		["scbtn_redo", "redo.png", 0, 0],
		["scbtn_undo", "undo.png", 0, 0],
	];

var scanToolBarData_S2 =
	[
		// element id          pic filename             selected	group id
		//[ "scbtn_setting",     "setting.png",	        0,			0 ],
		["scbtn_preview", "backScanMode.png", 0, 0],
		["scbtn_saveDisk", "savePlayback.png", 0, 0],
		["scbtn_ocr", "ocr.png", 0, 0],
		["Dummy", "dummy.png", 0, 0],
		["scbtn_mirrow", "mirrow.png", 0, 5],
		["scbtn_flip", "flip.png", 0, 6],
		//[ "scbtn_config",  	   "config.png",		    0,			0 ],
		["scbtn_redo2", "redo.png", 0, 0],
		["scbtn_undo2", "undo.png", 0, 0],
	];

var multiscanToolBarData =
	[
		// element id          	pic filename            selected	group id
		["mscbtn_capture", "perspectiveImage.png", 0, 0],
		["mscbtn_merge", "Merge_multiscan.png", 0, 0],
		["mscbtn_cancel", "close.png", 0, 0],
		["Dummy", "dummy.png", 0, 0],
		["mscbtn_fullcrop", "fullPhoto.png", 0, 6],
	]

var modeToolBarData =
	[
		// element id          pic filename             selected	group id
		["mode_about", "about.png", 0, 0],
		["mode_preview", "preview.png", 1, 1],
		//["mode_playback", "playback.png", 0, 1],
		["mode_drawingBoard", "drawingboard.png", 0, 1],
		//[ "mode_scan",         "scanMode.png",	        0,			1 ],
		//[ "mode_multiscan",    "MultiscanMode.png",     0,			1 ],
	];

var sysToolBarData =
	[
		// element id          pic filename             selected	group id
		//[ "sys_close",         "close.png",			    0,			1 ],
		//[ "sys_fullScreen",    "fullScreen.png",		0,			1 ],
		//[ "sys_fullPhoto",     "fullPhoto.png",		    0,			1 ],
		//[ "sys_smallScreen",   "screenSmall.png",		0,			1 ],

		["sys_fullPhoto", "fullPhoto.png", 0, 1],
	];

var thumbnailToolBarData =
	[
		// element id          pic filename             selected	group id
		["btn_saveDisk", "saveDisk.png", 0, 0],
		//[ "btn_uploadCloud",   "uploadCloud.png",		0,			0 ],
		["btn_delete", "delete.png", 0, 0],
		//[ "btn_toggleAll",     "select_all_check.png",  0,			0 ],
		["Dummy", "dummy.png", 0, 0],
		["btn_Next", "next_page.png", 0, 0],
		["btn_Previous", "previous_page.png", 0, 0],
	];

var picPlaybackToolBarData =
	[
		// element id                   pic filename                selected	group id
		["ppbtn_savePlayback", "savePlayback.png", 0, 0],
		["ppbtn_closeAndBackPlayback", "closeAndBackPlayback.png", 0, 0],
		["ppbtn_zoom", "zoom.png", 0, 0],
		["ppbtn_importPic", "inportPic.png", 0, 0],
		["ppbtn_redo", "redo.png", 0, 0],
		["ppbtn_undo", "undo.png", 0, 0],

		//["ppbtn_transform", "perspectiveImage.png", 0, 0],
		//["ppbtn_ocr", "ocr.png", 0, 0],
	];

var drawingBoardToolBarData =
	[
		// element id                   pic filename                selected	group id
		["dbbtn_savePlayback", "capture.png", 0, 0],
		//["dbbtn_savePlayback", "savePlayback.png", 0, 0],
		["dbbtn_redo", "redo.png", 0, 0],
		["dbbtn_undo", "undo.png", 0, 0],
		["dbbtn_importPic", "inportPic.png", 0, 0],
	];

var colorBarData =
	[
		// color    	selected
		['782D91', 0],
		['1B1464', 0],
		['0000FF', 1],
		['00FF00', 0],
		['FFFF00', 0],
		['F15A24', 0],
		['FF0000', 0],
		['FFFFFF', 0],
		['999999', 0],
		['000000', 0],
	];

var colorBarDataEmpty =
	[
	];

var fontFamilyData =
	[
		["Arial", 1],
		["Serif", 0],
		["Verdana", 0],
		["Courier New", 0],
	];

var fontStyleData =
	[
		["lbNormal", 1],
		["lbBold", 0],
		["lbItalic", 0],
		["lbBoldItalic", 0],
	];

var LanguageData =
	[
		["English", 1, "./locales/en/messages.json"],
		["Deutsch", 0, "./locales/de/messages.json"],
		["Française", 0, "./locales/fr/messages.json"],
		["Español", 0, "./locales/es/messages.json"],
		["日本語", 0, "./locales/jp/messages.json"],
		["繁體中文", 0, "./locales/zh_TW/messages.json"],
		["Русский", 0, "./locales/ru/messages.json"],
		["한국어", 0, "./locales/ko/messages.json"],
		["Italiano", 0, "./locales/it/messages.json"],
		["简体中文", 0, "./locales/sc/messages.json"],
	];

var fontSizeData =
	[
		[8, 0],
		[12, 0],
		[16, 0],
		[20, 0],
		[24, 0],
		[28, 1],
		[36, 0],
		[48, 0],
		[72, 0],
	];

var aboutCompanyLink = 'https://www.inswan.com/';
var aboutManualLink = 'mailto:service@inswan.com';

// var aboutContent = '																									\
// 		<center><img src="css/images/icon/logo 60.png"></img></center>													\
// 		<label><font size="5" color="#FAFAFA"><center>Documate</center></font></label>									\
// 		<BR>																											\
// 		<label><font size="2" color="#FAFAFA"><center>Ver : 1.22.0928</center></font></label>							\
// 		<BR>																											\
// 		<div id="companyLink" align="center"><font size="2" color="#88F">Official site : www.inswan.com</font></div>	\
// 		<div id="manualLink" align="center"><font size="2" color="#88F">Email : service@inswan.com</font></div>			\
// 		<BR>																											\
// 		<font size="2" color="#FAFAFA"><center>Inswan Copyright  ©  2022. All rights reserved.</center></font>			\
// 	';

var aboutContent =
	'<center><img src="css/images/icon/logo 60.png"></img></center>' +
	'<label><font size="5" color="#FAFAFA"><center>Documate</center></font></label>' +
	'<BR>' +
	'<label><font size="2" color="#FAFAFA"><center>Ver : 1.25.0211.1</center></font></label>' +
	'<BR>' +
	'<div id="companyLink" align="center"><font size="2" color="#88F">Official site : www.inswan.com</font></div>' +
	'<div id="manualLink" align="center"><font size="2" color="#88F">Email : service@inswan.com</font></div>' +
	'<BR>' +
	'<font size="2" color="#FAFAFA"><center>Inswan Copyright  ©  2025. All rights reserved.</center></font>';

function preInitAboutDlg() {
	appCfg.aboutWinW = 400;
	appCfg.aboutWinH = 380;
}

function afterInitAboutDlg() {
	//fcUpdateElementHtml("manualLink", "textWidth");
}

///////////////////////////////////////////////////////////////////////////////////////////
// device list 
///////////////////////////////////////////////////////////////////////////////////////////

var vrl5330 =
	[
		// width  height   def 
		[1280, 720, 1],
		[1024, 768, 0],
	];

var vrl6330 =
	[
		// width  height   def 
		[1920, 1080, 0],
		[1280, 720, 1],
		[1024, 768, 0],
	];

var vrl6350 =
	[
		// width  height   def 
		[1920, 1080, 0],
		[1280, 720, 1],
		[1024, 768, 0],
	];

var vrl6500 =
	[
		// width  height   def 
		[1920, 1080, 0],
		[1280, 720, 1],
		[1024, 768, 0],
	];

var vrl8589 =
	[
		// width  height   def 
		[4160, 3120, 0],
		[3840, 2160, 0],
		[2048, 1536, 0],
		[1920, 1080, 0],
		[1280, 1024, 0],
		[1280, 960, 0],
		[1280, 720, 1],
		[1024, 768, 0],
		[640, 480, 0],
	];

var vrl2089 =
	[
		// width  height   def 
		[2592, 1944, 0],
		[2048, 1536, 0],
		[1920, 1080, 0],
		[1600, 1200, 0],
		[1280, 960, 0],
		[1280, 720, 1],
		[1024, 768, 0],
	];

var vrl2620 =
	[
		// width  height   def 
		[3264, 2448, 0],
		[2592, 1944, 0],
		[2048, 1536, 0],
		[1920, 1080, 0],
		[1600, 1200, 0],
		[1280, 960, 0],
		[1280, 720, 1],
		[1024, 768, 0],
	];

var vrl2688 =
	[
		// width  height   def 
		[3840, 3104, 0],
		[3840, 2160, 0],
		[3264, 2448, 0],
		[2592, 1944, 0],
		[2048, 1536, 0],
		[1920, 1080, 0],
		[1600, 1200, 0],
		[1280, 720, 1],
		[1024, 768, 0],
	];

var u4 =
	[
		// width  height   def 
		[2560, 1920, 0],
		[2560, 1440, 0],
		[2048, 1536, 0],
		[1920, 1080, 0],
		[1600, 1200, 0],
		[1280, 960, 0],
		[1280, 720, 1],
		[1024, 768, 0],
	]

var VideoResolutionList =
	[
		// width  height   def 
		[1920, 1080, 0],
		[1280, 720, 1],
		[1280, 1024, 0],
	];

var DevList =
	[
		// VID     PID 
		[0x0000, 0x0000, VideoResolutionList],
		[0x04FC, 0x5310, vrl5330],
		[0x04FC, 0x5330, vrl5330],
		[0x04FC, 0x5339, vrl5330],

		[0x04FC, 0x6330, vrl6330],
		[0x04FC, 0x6339, vrl6330],

		[0x04FC, 0x6350, vrl6350],
		[0x04FC, 0x6359, vrl6350],

		[0x04FC, 0x6500, vrl6500],
		[0x04FC, 0x6509, vrl6500],

		[0x04FC, 0x8589, vrl8589],
		[0x114D, 0x8589, vrl8589],

		[0x04FC, 0x2620, vrl2620],
		[0x04FC, 0x2680, vrl2620],

		[0x04FC, 0x2089, vrl2089],

		[0x04FC, 0x2688, vrl2688],

		[0x04FC, 0x2650, u4],

		// 2020-12-07
		//[ 0x045E, 0x0811, vrl6350 ], //--- Microsoft PC Cam
		//[ 0x046D, 0x0821, vrl6350 ], //  Logitech C910
	];

///////////////////////////////////////////////////////////////////////////////////////////
// variable
///////////////////////////////////////////////////////////////////////////////////////////

var imageDisplayCanvas;
var imageDisplayContext;

var dispW;
var dispH;

var dispX;
var dispY;


///////////////////////////////////////////////////////////////////////////////////////////
// create element
///////////////////////////////////////////////////////////////////////////////////////////

function updateCanvasSize(id, w, h) {
	var css =
	{
		position: 'absolute',
		left: 0,
		top: 0,
		width: w,
		height: h,
		display: false,
	};

	var selector = '#' + id;

	$(selector).css(css);

	$(selector).attr('width', w);
	$(selector).attr('height', h);
}

function createImageCanvas(parentId, childId, w, h) {
	createCanvasElement(parentId, childId);

	updateCanvasSize(childId, w, h)
}

function hideCanvasGroup(parentId) {
	var canvasTbl = [
		'videoOrg',
		'WebGL',
		'baseImageCanvas',
		'imageProcessCanvas',
		'drawingCanvas',
		'tempDrawingCanvas',
		'combineCanvas',
	];

	var i;
	var seperator = '-';
	var childId;
	var eleId;

	for (i = 0; i < canvasTbl.length; i++) {
		childId = parentId + seperator + canvasTbl[i];

		eleId = document.getElementById(childId);
		eleId.hidden = true;
	}
}

function createCanvasGroup(parentId, w, h) {
	var seperator = '-';
	var childId;

	var canvasTbl = [
		'videoOrg',
		'WebGL',
		'baseImageCanvas',
		'imageProcessCanvas',
		//'drawingCanvas',
		'tempDrawingCanvas',
		'combineCanvas',
	];

	var i;

	for (i = 0; i < canvasTbl.length; i++) {
		childId = parentId + seperator + canvasTbl[i];
		createImageCanvas(parentId, childId, w, h);
	}

	childId = parentId + seperator + 'drawingCanvas';
	let maxLength = Math.max(window.screen.width, window.screen.height) * 1.5;
	createImageCanvas(parentId, childId, maxLength, maxLength);
}

function resetCanvasGroupSize(modeCfg, w, h) {
	let seperator = '-';
	let childId;
	let i;

	const canvasTbl = [
		'WebGL',
		'baseImageCanvas',
		'imageProcessCanvas',
		//'drawingCanvas',
		'tempDrawingCanvas',
		'combineCanvas',
	];

	for (i = 0; i < canvasTbl.length; i++) {
		childId = modeCfg.baseId + seperator + canvasTbl[i];
		updateCanvasSize(childId, w, h);
	}

	childId = modeCfg.baseId + seperator + 'videoOrg';
	updateCanvasSize(childId, videoW, videoH);
}

function getCanvasGroupContext(modeCfg) {
	var seperator = '-';
	var childId;
	var eleId;

	var canvasTbl = [
		'baseImageCanvas',
		'imageProcessCanvas',
		'drawingCanvas',
		'tempDrawingCanvas',
		'combineCanvas',
	];

	var contextTbl = [
		'baseImageContext',
		'imageProcessContext',
		'drawingContext',
		'tempDrawingContext',
		'combineContext',
	];

	var i;

	for (i = 0; i < canvasTbl.length; i++) {
		childId = modeCfg.baseId + seperator + canvasTbl[i];
		modeCfg[canvasTbl[i]] = document.getElementById(childId);
		modeCfg[contextTbl[i]] = modeCfg[canvasTbl[i]].getContext('2d');
	}
}

(function () {
	// create base area 

	createDocumentElement('div', 'baseArea');

	// create title bar 

	createDivElement('baseArea', 'appTitle');

	// create preview area

	createDivElement('baseArea', 'previewArea');

	createElement('video', 'previewArea', 'videoSrc');

	createCanvasGroup('previewArea', appCfg.defPreviewRsoX, appCfg.defPreviewRsoY);

	// create playback area

	createDivElement('baseArea', 'playbackArea');

	createCanvasGroup('playbackArea', appCfg.defPictureW, appCfg.defPictureH);

	// create drawing area

	createDivElement('baseArea', 'drawingArea');

	createCanvasGroup('drawingArea', appCfg.defDrawingBoardW, appCfg.defDrawingBoardH);

	// final image display area

	createDivElement('baseArea', 'imageDisplayArea');

	createCanvasElement('imageDisplayArea', 'displayCanvas');
	//createElement("svg", 'imageDisplayArea', "svgTest");
	//createElement("canvas", "svgTest", 'displayCanvas');

	createCanvasElement('imageDisplayArea', 'saveFileCanvas');

	// UI display area

	createDivElement('baseArea', 'uiArea');

	createSpanElement('uiArea', 'importPictureWin');

	createDivElement('uiArea', 'drawingCfgArea');
	setDrawingCfgArea();

	createSpanElement('uiArea', 'panWin');
	createCanvasElement('panWin', 'cropWin');

	createSpanElement('uiArea', 'settingDlg');

	createSpanElement('uiArea', 'textInputDlg');

	// asign common use variable

	imageDisplayCanvas = document.getElementById('displayCanvas');
	imageDisplayContext = imageDisplayCanvas.getContext('2d');
	// const existingStyle = imageDisplayCanvas.getAttribute('style') || '';
	// const newStyle = `${existingStyle}; filter: url(#filter)`;
	// imageDisplayCanvas.setAttribute('style', newStyle);

	// hide canvas group

	hideCanvasGroup('previewArea');
	hideCanvasGroup('playbackArea');
	hideCanvasGroup('drawingArea');

	// hide save file canvas

	showElement('saveFileCanvas', false);

})();


///////////////////////////////////////////////////////////////////////////////////////////
// body
///////////////////////////////////////////////////////////////////////////////////////////

function cfgBody() {
	$('body').css('background-color', appCfg.bgColor);
}


///////////////////////////////////////////////////////////////////////////////////////////
// title bar
///////////////////////////////////////////////////////////////////////////////////////////

function updateTitleBarSize() {
	titleW = winW;
	titleH = appCfg.titleIconH;
}

function cfgTitleBar() {
	var cssCfg =
	{
		position: 'absolute',
		background: appCfg.mouseColorLeave,
		padding: '0 0 0 0px',
		top: '0px',
		height: appCfg.titleIconH + 'px',
		opacity: appCfg.mouseOpacityLeave,
	}

	var x;
	var w;

	var modeBarW;
	var sysBarW;

	modeBarW = appCfg.modeIconW * modeToolBarData.length;
	sysBarW = appCfg.toolBarIconW * sysToolBarData.length;

	cssCfg.left = modeBarW + 'px';
	cssCfg.width = 'calc(100% - ' + (modeBarW + sysBarW) + 'px)';

	// $('#appTitle').css(cssCfg);
	// $('#appTitle').css('-webkit-app-region', 'drag');
}


///////////////////////////////////////////////////////////////////////////////////////////
// adjust size
///////////////////////////////////////////////////////////////////////////////////////////

var cssCommonSizeObj =
{
	position: 'absolute',
	left: 0,
	top: 0,
	width: 800,
	height: 260,
	style: 'border:1px dashed black',
	background: appCfg.bgColor,
}

function adjImageDisplayArea() {
	let id$;
	let totalW, totalH;
	let x, y, w, h;

	if (fullPhotoMode) {
		w = totalW = winW;
		h = totalH = winH;
		x = 0;
		y = 0;
	}
	else {
		w = totalW = winW - appBaseCfg.iconW * 2;
		h = totalH = winH - titleH - appBaseCfg.drawSetH;
		x = appBaseCfg.iconW;
		y = titleH;
	}

	cssCommonSizeObj.left = x;
	cssCommonSizeObj.top = y;
	cssCommonSizeObj.width = w;
	cssCommonSizeObj.height = h;

	id$ = $('#displayCanvas');
	id$.css(cssCommonSizeObj);
	id$.attr('width', w);
	id$.attr('height', h);

	dispX = x;
	dispY = y;
	dispW = w;
	dispH = h;

	calculateCropVertices(videoW, videoH, w, h);
	//console.log("adjImageDisplayArea Disp", dispX, dispY, dispW, dispH);
}


///////////////////////////////////////////////////////////////////////////////////////////
// tool bar
///////////////////////////////////////////////////////////////////////////////////////////

var nullToolBarData = [];

function initToolBar() {
	var cssToolBar =
	{
		position: 'absolute',
		width: appCfg.toolBarIconW,
		height: appCfg.toolBarIconH,
		'margin-left': '0px',
	};

	cssToolBar.width = appCfg.toolBarIconW;
	cssToolBar.height = appCfg.toolBarIconH;

	createToolBar(nullToolBarData, cssToolBar, 'uiArea', 'playbackRToolBar', 'right');

	if (1 === appCfg.disableDrawingToolBar) {
		createToolBar(drawingToolBarDataEmpty, cssToolBar, 'uiArea', 'drawingToolBar', 'right', drawingToolBarOnClick);
		updateToolBar(drawingToolBarDataEmpty);
	}
	else {
		createToolBar(drawingToolBarData, cssToolBar, 'uiArea', 'drawingToolBar', 'right', drawingToolBarOnClick);
		updateToolBar(drawingToolBarData);
	}

	createToolBar(thumbnailToolBarData, cssToolBar, 'uiArea', 'thumbnailToolBar', 'left', thumbnailToolBarOnClick);
	updateToolBar(thumbnailToolBarData);

	createToolBar(picPlaybackToolBarData, cssToolBar, 'uiArea', 'picPlaybackToolBar', 'left', picturePlaybackToolBarOnClick);
	updateToolBar(picPlaybackToolBarData);

	createToolBar(drawingBoardToolBarData, cssToolBar, 'uiArea', 'drawingBoardToolBar', 'left', drawingBoardToolBarOnClick);
	updateToolBar(drawingBoardToolBarData);

	createToolBar(previewToolBarData, cssToolBar, 'uiArea', 'previewToolBar', 'left', previewToolBarOnClick);
	updateToolBar(previewToolBarData);

	createToolBar(scanToolBarData_S1, cssToolBar, 'uiArea', 'scanToolBarS1', 'left', scanToolBarOnClick);
	updateToolBar(scanToolBarData_S1);

	createToolBar(scanToolBarData_S2, cssToolBar, 'uiArea', 'scanToolBarS2', 'left', scanToolBarOnClick);
	updateToolBar(scanToolBarData_S2);

	createToolBar(multiscanToolBarData, cssToolBar, 'uiArea', 'multiscanToolBar', 'left', multiscanToolBarOnClick);
	updateToolBar(multiscanToolBarData);

	createToolBar(sysToolBarData, cssToolBar, 'uiArea', 'sysToolBar', 'top-right', sysToolBarOnClick);
	updateToolBar(sysToolBarData);

	cssToolBar.width = appCfg.modeIconW / 2;
	cssToolBar.height = appBaseCfg.drawSetH;

	createToolBar(bottomToolBarData, cssToolBar, 'uiArea', 'bottomToolBarData', 'bottom', previewToolBarOnClick);
	updateToolBar(bottomToolBarData);
	$("#btn_pause").hide();

	cssToolBar.width = appCfg.modeIconW;
	cssToolBar.height = appCfg.modeIconH;

	createToolBar(modeToolBarData, cssToolBar, 'uiArea', 'modeToolBar', 'top-left', modeToolBarOnClick);
	updateToolBar(modeToolBarData);

	$("#Dummy").unbind('mouseenter mouseleave click');

	// custom config
	// const button = document.getElementById('btn_record');
	// button.addEventListener('mouseenter', eventInterceptor, true);
}

function eventInterceptor(event) {
	if (!IsDeviceConnected) {
		event.stopImmediatePropagation(); // 阻止其他處理器的執行
		console.log('MouseOver event is temporarily disabled');
	}
}

function hideAllToolBars() {
	var idTbl = [
		'playbackRToolBar',
		'previewToolBar',
		'drawingToolBar',
		'thumbnailToolBar',
		'picPlaybackToolBar',
		'drawingBoardToolBar',
		'scanToolBarS1',
		'scanToolBarS2',
	];

	var i;

	for (i = 0; i < idTbl.length; i++) {
		showToolBar(idTbl[i], false);
	}
}

function showToolBar(id, mode) {
	showElement(id, mode);
}


///////////////////////////////////////////////////////////////////////////////////////////
// drawing config area
///////////////////////////////////////////////////////////////////////////////////////////

function setDrawingCfgArea() {
	var css =
	{
		position: 'absolute',
		'margin-left': '0px',
		background: appCfg.drawSetBackground,
		opacity: appCfg.drawSetOpacity,
	};

	var w = appCfg.toolBarIconW;
	var h = appCfg.drawSetH;

	css.width = 'calc(100% - ' + (w * 2) + 'px)';
	css.height = h + 'px';
	css.left = w + 'px';
	css.top = 'calc(100% - ' + h + 'px)';

	$('#drawingCfgArea').css(css);
}


///////////////////////////////////////////////////////////////////////////////////////////
// color bar
///////////////////////////////////////////////////////////////////////////////////////////

function initColorBar() {
	var cssColorBar =
	{
		position: 'absolute',
		width: appCfg.colorIconW,
		height: appCfg.colorIconH,
		'margin-left': '0px',
		opacity: appCfg.colorIconOpacity,
	};

	if (1 === appCfg.disableColorBar) {
		createColorBar(colorBarDataEmpty, cssColorBar, 'configDrawDlg', 'drawingCfgColorBar', fcColorBarNotify);
		//createColorBar(colorBarDataEmpty, cssColorBar, 'drawingCfgArea', 'drawingCfgColorBar', fcColorBarNotify);
		updateColorBar(colorBarDataEmpty);
	}
	else {
		if (appCfg.cb2Apply) {
			createColorBarType2(colorBarData, cssColorBar, 'configDrawDlg', 'drawingCfgColorBar', fcColorBarNotify);
			//createColorBarType2(colorBarData, cssColorBar, 'drawingCfgArea', 'drawingCfgColorBar', fcColorBarNotify);
			updateColorBarType2(colorBarData);
		}
		else {
			createColorBar(colorBarData, cssColorBar, 'configDrawDlg', 'drawingCfgColorBar', fcColorBarNotify);
			//createColorBar(colorBarData, cssColorBar, 'drawingCfgArea', 'drawingCfgColorBar', fcColorBarNotify);
			updateColorBar(colorBarData);
		}
	}
}

function fcColorBarNotify(color, r, g, b) {
	appFC.colorHex = color;
	appFC.colorR = r;
	appFC.colorG = g;
	appFC.colorB = b;

	fcUpdateDrawStyle();
}


///////////////////////////////////////////////////////////////////////////////////////////
// scroll bar
///////////////////////////////////////////////////////////////////////////////////////////

function initScrollBar() {

	var w = 0;

	var cssScrollBar =
	{
		position: 'absolute',
		'margin-left': '0px',
	};

	// for opacity
	var scrollBarOpacity =
	{
		iconL: '30x_30alpha.png',
		iconSize: appCfg.scrollIconH,
		length: appCfg.scrollOpacityW,
		curPos: appCfg.scrollOpacityDefPos,
		startX: 0,
		startY: 0,
		color: appCfg.scrollColor,
	};

	if (0 === appCfg.disableDrawingOpacityScrollBar) {
		//createScrollBar(scrollBarOpacity, cssScrollBar, 'drawingCfgArea', 'drawingOpacity', opacityScrollBarNotify);
		// updateScrollBar('drawingOpacity');

		createScrollBarMin(scrollBarOpacity, 'configDrawDlg', 'drawingOpacity', scrollOpacity, 100);
		//createScrollBarMin(scrollBarOpacity, 'drawingCfgArea', 'drawingOpacity', scrollOpacity, 100);

		function scrollOpacity(m) {
			var value;
			if (m.currentTarget)
				value = m.currentTarget.value;
			else
				value = m;

			appFC.opacity = 0.1 + (value / 100) * 0.9;
			appFC.opacity = appFC.opacity.toFixed(1);
			fcUpdateDrawStyle();
		}
	}

	// for line width
	var scrollBarLineWidth =
	{
		iconL: '30x30lineWidth.png',
		iconSize: appCfg.scrollIconH,
		length: appCfg.scrollLineWidthW,
		curPos: appCfg.scrollLineWidthDefPos,
		startX: 160,
		startY: 0,
		color: appCfg.scrollColor,
	};

	//scrollBarLineWidth.startX = w + appCfg.scrollGroupGap;

	if (0 === appCfg.disableDrawingLineWidthScrollBar) {
		//createScrollBar(scrollBarLineWidth, cssScrollBar, 'drawingCfgArea', 'drawingLineWidth', lineWidthScrollBarNotify);
		//updateScrollBar('drawingLineWidth');

		createScrollBarMin(scrollBarLineWidth, 'configDrawDlg', 'drawingLineWidth', scrollLineWidth, 10);
		//createScrollBarMin(scrollBarLineWidth, 'drawingCfgArea', 'drawingLineWidth', scrollLineWidth, 10);

		function scrollLineWidth(m) {
			var value;
			if (m.currentTarget)
				value = m.currentTarget.value;
			else
				value = m;

			appFC.lineWidth = (appCfg.lineWidthMin + (appCfg.lineWidthMax - appCfg.lineWidthMin) * (value / 100));
			appFC.lineWidth = Math.floor(appFC.lineWidth);
		}
	}
}

function createScrollBarMin(scrollData, parentId, id, fun, initValue) {
	createSpanElement(parentId, id);

	// Icon
	var iconId = id + '-iconL';
	createSpanElement(id, iconId);

	// set left icon style
	var curX = scrollData.startX;

	eleId = '#' + iconId;

	var bkg = fcGetDefIconPath(scrollData.iconL);
	$(eleId).css('background', bkg);

	$(eleId).css('top', 0 + 'px');
	$(eleId).css('left', curX + 'px');
	$(eleId).css('width', scrollData.iconSize + 'px');
	$(eleId).css('height', scrollData.iconSize + 'px');
	$(eleId).css('position', 'absolute');

	curX += scrollData.iconSize;

	// slider bar
	parentId = id;
	var sliderId = id + '-slider';
	createInputElement(parentId, sliderId);

	var eleId = "#" + sliderId;
	$(eleId).attr("class", "slider_min");
	$(eleId).css({
		"top": 0,
		"left": curX,
		"width": 100 + 'px',
		"height": 30 + 'px',
		"position": "absolute",
	});
	$(eleId).attr({
		"type": "range",
		"max": 100,
		"min": 0,
		"step": 2,
		"value": initValue
	});

	var eleId = "#" + sliderId;
	$(eleId).on('input', fun);

	fun(initValue);
}

function opacityScrollBarNotify(length, pos) {
	appFC.opacity = 0.1 + (pos / length) * 0.9;

	appFC.opacity = appFC.opacity.toFixed(1);

	fcUpdateDrawStyle();
}

function lineWidthScrollBarNotify(length, pos) {
	appFC.lineWidth = (appCfg.lineWidthMin + (appCfg.lineWidthMax - appCfg.lineWidthMin) * (pos / length));

	appFC.lineWidth = Math.floor(appFC.lineWidth);

	//console.log("line width: " + appFC.lineWidth);
}

///////////////////////////////////////////////////////////////////////////////////////////
// scroll bar dialog
///////////////////////////////////////////////////////////////////////////////////////////

function initScrollBarDlg() {

	var w;

	var cssScrollBar =
	{
		position: 'absolute',
		'margin-left': '0px',
	};

	// for brightness

	var scrollBarBrightness =
	{
		iconL: 'brightness_down.png',
		iconR: 'brightness_up.png',
		iconSize: appCfg.toolBarIconW,
		length: appCfg.scrollBrighnessW,
		curPos: appCfg.scrollBrighnessDefPos,
		startX: 0,
		startY: 0,
		color: appCfg.scrollColor,
	};

	createScrollBarDlg(scrollBarBrightness, cssScrollBar, 'uiArea', 'brightnessDlg', brightnessScrollBarNotify, true);
	showBrightnessDlg(false);

	// for white balance

	var scrollWhiteBalance =
	{
		iconL: 'wb_b.png',
		iconR: 'wb_r.png',
		iconAuto: 'undo.png',
		iconSize: appCfg.toolBarIconW,
		length: appCfg.scrollBrighnessW,
		curPos: appCfg.scrollBrighnessDefPos,
		startX: 0,
		startY: 0,
		color: appCfg.scrollColor,
	};

	createScrollBarDlg(scrollWhiteBalance, cssScrollBar, 'uiArea', 'whiteBalanceDlg', whiteBalanceScrollBarNotify, true);
	showWhiteBalanceDlg(false);

	// for zoom

	// var scrollBarZoom =
	// {
	// 	iconL: 'zoom_in.png',
	// 	iconR: 'zoom_out.png',
	// 	iconSize: appCfg.toolBarIconW,
	// 	length: appCfg.scrollZoomW,
	// 	curPos: appCfg.scrollZoomDefPos,
	// 	startX: 0,
	// 	startY: 0,
	// 	color: appCfg.scrollColor,
	// };

	// createScrollBarDlg(scrollBarZoom, cssScrollBar, 'uiArea', 'zoomDlg', zoomScrollBarNotify);
	// showZoomDlg(false);

	creatZoomDlg();
}

function creatZoomDlg() {
	var eleId;
	var sliderId;
	var zoomDlg = "zoomDlg";

	var x = 24;
	var y = 36;
	var gapV = 48;

	var w = 380;
	var h = 120;

	createDivElement("uiArea", zoomDlg);
	eleId = "#" + zoomDlg;
	$(eleId).css('background', appBaseCfg.ColorLeave);
	$(eleId).css("top", "calc(50%)");
	$(eleId).css('left', appCfg.toolBarIconW + "px");
	$(eleId).css('width', w + 'px');
	$(eleId).css('height', h + 'px');
	$(eleId).css('position', 'absolute');
	$(eleId).hide()

	// close icon
	eleId = zoomDlg + '-close';
	createSpanElement(zoomDlg, eleId);

	eleId = '#' + eleId;
	var bkg = fcGetDefIconPath("close.png");

	$(eleId).css('background', bkg);
	$(eleId).css('top', 0 + 'px');
	$(eleId).css('left', (w - appCfg.toolBarIconW) + 'px');
	$(eleId).css('width', appCfg.toolBarIconW + 'px');
	$(eleId).css('height', appCfg.toolBarIconH + 'px');
	$(eleId).css('position', 'absolute');
	$(eleId).on('click', function () {
		$("#" + zoomDlg).hide()
	});

	// zoom
	eleId = zoomDlg + '-zoom';
	sliderId = createScrollBarIII(zoomDlg, eleId, "zoom_in.png", "zoom_out.png", x, y);
	eleId = '#' + sliderId;
	$(eleId).attr({
		"type": "range",
		"max": 100,
		"min": 0,
		"step": 2,
		"value": 0
	});
	$(eleId).on('input', function (m) {

		//appFC.previewBrightnessAdj = Math.floor(m.currentTarget.value);

		var zoom = 1 + (appCfg.zoomMaxRatio - 1) * m.currentTarget.value / 100;

		//zoom = 1 + (appCfg.zoomMaxRatio - 1)*pos/length;	

		zoom = zoom.toFixed(1);

		if (appFC.curMode) {
			fcUpdateZoomRatio(zoom, m.currentTarget.value);
		}
	});
}

function showBrightnessDlg(mode) {
	showElement('brightnessDlg', mode);
}

function showWhiteBalanceDlg(mode) {
	showElement('whiteBalanceDlg', mode);
}

function showZoomDlg(mode) {
	showElement('zoomDlg', mode);
}

function brightnessScrollBarNotify(length, pos) {
	// var brightness;

	// brightness = appCfg.brightnewwMin + (appCfg.brightnewwMax - appCfg.brightnewwMin) * pos / length;

	// brightness = Math.floor(brightness);

	// appFC.previewBrightnessAdj = brightness;

	// if (appFC.curMode) {
	// 	fcCanvasCtrl(DrawState.brightness);
	// }
}

function whiteBalanceScrollBarNotify(length, pos) {
	// var wb;
	// wb = appCfg.whiteBalanceMin + (appCfg.whiteBalanceMax - appCfg.whiteBalanceMin) * pos / length;
	// wb = Math.floor(wb);

	// appFC.previewWhiteBalanceAdj = wb;

	// if (appFC.curMode) {
	// 	fcCanvasCtrl(DrawState.whiteBalance);
	// }
}

function zoomScrollBarNotify(length, pos) {
	var zoom;

	zoom = 1 + (appCfg.zoomMaxRatio - 1) * pos / length;

	zoom = zoom.toFixed(1);

	if (appFC.curMode) {
		fcUpdateZoomRatio(zoom, pos);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// setting dialog
///////////////////////////////////////////////////////////////////////////////////////////

function initSettingDlg() {
	var dlgCss =
	{
		position: 'absolute',
		'margin-left': '0px',
		background: appCfg.sdBkg,
		opacity: appCfg.sdOpacity,
	};

	var totalW, totalH;
	var curX, curY;

	var noSettingLine = 3; //5; disable resolution

	if (1 === appCfg.disableDrawTextSetting) {
		noSettingLine = 1;
	}

	// set window size

	totalW = appCfg.sdFrameGapX * 2 + appCfg.sdIconW + appCfg.sdIconScrollGap + appCfg.sdFontFamilyW + appCfg.sdFontStyleW + appCfg.sdFontSizeW + appCfg.sdScrollGap * 2;
	totalW += appCfg.sdExtraW;
	totalH = appCfg.sdFrameGapY * noSettingLine + appCfg.sdIconH * (noSettingLine + 1) + appCfg.sdGroupGap;

	dlgCss.left = 'calc(50% - ' + (totalW / 2) + 'px)';
	dlgCss.top = 'calc(50% - ' + ((totalH - appCfg.titleIconH) / 2) + 'px)';
	dlgCss.width = totalW + 'px';
	dlgCss.height = totalH + 'px';

	$('#settingDlg').css(dlgCss);

	// set close icon
	curX = totalW - appCfg.sdFrameGapX - appCfg.sdIconW;
	curY = appCfg.sdFrameGapY;
	// createSettingDlgIcon('settingDlg', 'sdClsoeIcon', 'close.png', curX, curY);
	// $('#sdClsoeIcon').on('click', previewSetttingDlgCloseClick);

	// video resolution icon
	// curY = + appCfg.sdIconH;
	// curX = appCfg.sdFrameGapX;
	// createSettingDlgIcon('settingDlg', 'sdVideoRsoIcon', 'setting_reslution.png', curX, curY);

	// video resolution scroll bar
	// curX += (appCfg.sdIconW + appCfg.sdIconScrollGap);
	// createVideoResolutionScrollBar('settingDlg', 'sdVideoRsoScrollbar', appFC.curVideoResolutionList, curX, curY, appCfg.sdVideoRsoW);

	// video selector icon
	// curY += (appCfg.sdIconH + appCfg.sdGroupGap);
	curX = appCfg.sdFrameGapX;
	createSettingDlgIcon('settingDlg', 'sdVideoinputIcon', 'setting_videoinput.png', curX, curY);

	// video selector
	curX += (appCfg.sdIconW + appCfg.sdIconScrollGap);
	createVideoinputScrollBar('settingDlg', 'sdVideoinputScrollbar', appFC.curVideopinputList, curX, curY, appCfg.sdVideoRsoW);

	// audio selector icon
	curY += (appCfg.sdIconH + appCfg.sdGroupGap);
	curX = appCfg.sdFrameGapX;
	createSettingDlgIcon('settingDlg', 'sdAudioinputIcon', 'setting_audioinput.png', curX, curY);

	// audio selector
	curX += (appCfg.sdIconW + appCfg.sdIconScrollGap);
	createAudioinputScrollBar('settingDlg', 'sdAudioinputScrollbar', appFC.curAudioinputList, curX, curY, appCfg.sdVideoRsoW);

	// text settings
	curY += (appCfg.sdIconH + appCfg.sdGroupGap);

	if (0 === appCfg.disableDrawTextSetting) {
		// text icon

		curX = appCfg.sdFrameGapX;

		createSettingDlgIcon('settingDlg', 'sdFontIcon', 'setting_textEdit.png', curX, curY);

		curX += (appCfg.sdIconW + appCfg.sdIconScrollGap);

		// text family scroll bar

		createFontScrollBar('settingDlg', 'sdfontFamily', fontFamilyData, curX, curY, appCfg.sdFontFamilyW);

		curX += (appCfg.sdFontFamilyW + appCfg.sdScrollGap);

		createFontScrollBar_ML('settingDlg', 'fontStyle', fontStyleData, curX, curY, appCfg.sdFontStyleW);

		curX += (appCfg.sdFontStyleW + appCfg.sdScrollGap);

		createFontScrollBar('settingDlg', 'fontSize', fontSizeData, curX, curY, appCfg.sdFontSizeW);

		curY += (appCfg.sdIconH + appCfg.sdGroupGap);

	}

	//================================
	// Language icon
	curX = appCfg.sdFrameGapX;
	//curY += (appCfg.sdIconH + appCfg.sdGroupGap);

	createSettingDlgIcon('settingDlg', 'sdLanguageIcon', 'setting_language.png', curX, curY);

	curX += (appCfg.sdIconW + appCfg.sdIconScrollGap);

	// Language scroll bar

	createLanguageScrollBar('settingDlg', 'sdLanguageFamily', LanguageData, curX, curY, appCfg.sdFontFamilyW);

	//================================

	// hide dialog

	showSettingDlg(false);

	// update font config

	fcUpdateFontCfg();
}

function createSettingDlgIcon(parentId, id, pic, startX, startY) {
	var eleId;
	var bkg;

	createSpanElement(parentId, id);

	eleId = '#' + id;

	bkg = fcGetDefIconPath(pic);

	$(eleId).css('background', bkg);
	$(eleId).css('top', startY + 'px');
	$(eleId).css('left', startX + 'px');
	$(eleId).css('width', appCfg.sdIconW + 'px');
	$(eleId).css('height', appCfg.sdIconH + 'px');
	$(eleId).css('position', 'absolute');
}

function updateVideoResolutionElement(data) {
	cleanVideoResolutionElement();
	createVideoResolutionElement(data);
}

function cleanVideoResolutionElement() {
	var eleId = "#" + appFC.idVideoResolutionList;

	$(eleId + " > option").remove();
}

function createVideoResolutionElement(data) {
	var strTotal = "";
	var i;
	var eleId;
	var dispStr;
	var selStr;
	var strElement;
	var id;

	id = appFC.idVideoResolutionList;

	strTotal = '';

	for (i = 0; i < data.length; i++) {
		eleId = id + '-' + data[i][VrField.w] + 'x' + data[i][VrField.h];
		dispStr = data[i][VrField.w] + ' x ' + data[i][VrField.h];

		if (appBaseCfg.resolutionIdx == -1 || appBaseCfg.resolutionIdx >= data.length) {
			if (data[i][VrField.data] === 1) {
				selStr = ' selected="true"';

				appFC.reqImgW = data[i][VrField.w];
				appFC.reqImgH = data[i][VrField.h];
			}
			else {
				selStr = ''
			}
		}
		else {
			if (i == appBaseCfg.resolutionIdx) {
				selStr = ' selected="true"';

				appFC.reqImgW = data[i][VrField.w];
				appFC.reqImgH = data[i][VrField.h];
			}
			else {
				selStr = ''
			}
		}

		strElement = '<option' + selStr + ' id="' + eleId + '">' + dispStr + '</option>';
		strTotal += strElement;
	}

	$('#' + id).html(strTotal);
}

function createVideoResolutionScrollBar(parendId, id, data, startX, startY, width) {
	var eleId;

	appFC.idVideoResolutionList = id;

	createSelectElement(parendId, id);

	createVideoResolutionElement(data);

	eleId = '#' + id;

	$(eleId).css('top', (startY + (appCfg.sdIconH - appCfg.sdScrollH) / 2) + 'px');
	$(eleId).css('left', startX + 'px');
	$(eleId).css('width', width + 'px');
	$(eleId).css('height', appCfg.sdScrollH + 'px');
	$(eleId).css('position', 'absolute');
}

function updateAudioinputElement() {
	cleanAudioinputElement();
}

function cleanAudioinputElement() {
	var eleId = "#" + appFC.idAudioinputSelect;
	$(eleId + " > option").remove();
}

function createAudioinputScrollBar(parendId, id, data, startX, startY, width) {
	var eleId;

	appFC.idAudioinputSelect = id;

	createSelectElement(parendId, id);
	//createAudioinputElement(data);

	eleId = '#' + id;

	$(eleId).css('top', (startY + (appCfg.sdIconH - appCfg.sdScrollH) / 2) + 'px');
	$(eleId).css('left', startX + 'px');
	$(eleId).css('width', (width * 2 + appCfg.sdIconScrollGap * 6) + 'px');
	$(eleId).css('height', appCfg.sdScrollH + 'px');
	$(eleId).css('position', 'absolute');
}

function createVideoinputScrollBar(parendId, id, data, startX, startY, width) {
	var eleId;

	appFC.idVideoinputSelect = id;

	createSelectElement(parendId, id);
	//createAudioinputElement(data);

	eleId = '#' + id;

	$(eleId).css('top', (startY + (appCfg.sdIconH - appCfg.sdScrollH) / 2) + 'px');
	$(eleId).css('left', startX + 'px');
	$(eleId).css('width', (width * 2 + appCfg.sdIconScrollGap * 6) + 'px');
	$(eleId).css('height', appCfg.sdScrollH + 'px');
	$(eleId).css('position', 'absolute');
}

function createLanguageScrollBar(parendId, id, data, startX, startY, width) {
	var strTotal = "";
	var strElement;
	var i;
	var eleId;
	var dispStr;
	var selStr;

	createSelectElement(parendId, id);

	strTotal = '';

	for (i = 0; i < data.length; i++) {
		eleId = id + '-' + data[i][FontField.value];
		dispStr = data[i][FontField.value];

		if (data[i][FontField.status] === 1) selStr = ' selected="true"';
		else selStr = ''

		strElement = '<option' + selStr + ' id="' + eleId + '">' + dispStr + '</option>';
		strTotal += strElement;
	}

	$('#' + id).html(strTotal);

	eleId = '#' + id;

	$(eleId).css('top', (startY + (appCfg.sdIconH - appCfg.sdScrollH) / 2) + 'px');
	$(eleId).css('left', startX + 'px');
	$(eleId).css('width', width + 'px');
	$(eleId).css('height', appCfg.sdScrollH + 'px');
	$(eleId).css('position', 'absolute');
}

function createFontScrollBar(parendId, id, data, startX, startY, width) {
	var strTotal = "";
	var strElement;
	var i;
	var eleId;
	var dispStr;
	var selStr;

	createSelectElement(parendId, id);

	strTotal = '';

	for (i = 0; i < data.length; i++) {
		eleId = id + '-' + data[i][FontField.value];
		dispStr = data[i][FontField.value];

		if (data[i][FontField.status] === 1) selStr = ' selected="true"';
		else selStr = ''

		strElement = '<option' + selStr + ' id="' + eleId + '">' + dispStr + '</option>';
		strTotal += strElement;
	}

	$('#' + id).html(strTotal);

	eleId = '#' + id;

	$(eleId).css('top', (startY + (appCfg.sdIconH - appCfg.sdScrollH) / 2) + 'px');
	$(eleId).css('left', startX + 'px');
	$(eleId).css('width', width + 'px');
	$(eleId).css('height', appCfg.sdScrollH + 'px');
	$(eleId).css('position', 'absolute');
}

function createFontScrollBar_ML(parendId, id, data, startX, startY, width) {
	var strTotal = "";
	var strElement;
	var i;
	var eleId;
	var dispStr;
	var selStr;

	createSelectElement(parendId, id);

	strTotal = '';

	for (i = 0; i < data.length; i++) {
		eleId = id + '-' + data[i][FontField.value];

		// webmod
		dispStr = "WebMod";
		//dispStr = chrome.i18n.getMessage(data[i][FontField.value]);

		//dispStr = get_i18n_Message(data[i][FontField.value]);
		//console.log(data[i][FontField.value],dispStr);

		if (data[i][FontField.status] === 1) selStr = ' selected="true"';
		else selStr = ''

		strElement = '<option' + selStr + ' id="' + eleId + '">' + dispStr + '</option>';
		strTotal += strElement;
	}

	$('#' + id).html(strTotal);

	eleId = '#' + id;

	$(eleId).css('top', (startY + (appCfg.sdIconH - appCfg.sdScrollH) / 2) + 'px');
	$(eleId).css('left', startX + 'px');
	$(eleId).css('width', width + 'px');
	$(eleId).css('height', appCfg.sdScrollH + 'px');
	$(eleId).css('position', 'absolute');

}
function showSettingDlg(mode) {
	showElement('settingDlg', mode);
}

///////////////////////////////////////////////////////////////////////////////////////////
// text input dialog
///////////////////////////////////////////////////////////////////////////////////////////

function initTextInputDlg() {
	var totalW;
	var totalH;
	var eleId;
	var x, y;
	var bkg;

	totalW = appCfg.tidFrameGap + appCfg.tidTextFrmW + appCfg.tidFrameGap;
	totalH = appCfg.tidFrameGap + appCfg.tidIconH + appCfg.tidIconFrmGap + appCfg.tidTextFrmH + appCfg.tidFrameGap;

	// set dialog size

	eleId = '#textInputDlg';

	$(eleId).css('top', 'calc(50% - ' + ((totalH - appCfg.titleIconH) / 2) + 'px)');
	$(eleId).css('left', 'calc(50% - ' + (totalW / 2) + 'px)');
	$(eleId).css('width', totalW + 'px');
	$(eleId).css('height', totalH + 'px');

	$(eleId).css('position', 'absolute');
	$(eleId).css('background', appCfg.tidBkg);
	$(eleId).css('opacity', appCfg.tidOpacity);

	// close icon

	createSpanElement('textInputDlg', 'textInputClose');

	eleId = '#textInputClose';

	bkg = fcGetDefIconPath('yes.png');

	x = totalW - appCfg.tidFrameGap - appCfg.tidIconW;
	y = appCfg.tidFrameGap;

	$(eleId).css('background', bkg);
	$(eleId).css('top', y + 'px');
	$(eleId).css('left', x + 'px');
	$(eleId).css('width', appCfg.tidIconW + 'px');
	$(eleId).css('height', appCfg.tidIconH + 'px');
	$(eleId).css('position', 'absolute');

	// $(eleId).attr({
	// 	contenteditable: "true",
	// 	inputmode: "none"
	// });

	$(eleId).on('click', textInputDlgCloseClick);

	// text input area

	createTextareaElement('textInputDlg', 'textInputArea');

	eleId = '#textInputArea';

	x = appCfg.tidFrameGap;
	y = appCfg.tidFrameGap + appCfg.tidIconH + appCfg.tidIconFrmGap;

	$(eleId).css('position', 'absolute');
	$(eleId).css('resize', 'none');

	$(eleId).css('top', y + 'px');
	$(eleId).css('left', x + 'px');
	$(eleId).css('width', appCfg.tidTextFrmW + 'px');
	$(eleId).css('height', appCfg.tidTextFrmH + 'px');

	$(eleId).css('padding', 0 + 'px');

	$(eleId).attr('cols', appCfg.tidTextFrmW);
	$(eleId).attr('rows', appCfg.tidTextFrmH);

	// hide dialog

	showTextInputDlg(false);
}

function showTextInputDlg(mode) {
	showElement('textInputDlg', mode);

	if (mode) {
		setTimeout(function () {
			$('#textInputArea').focus();
		}, 300);
	}
}

function updateTextInputCfg() {
	var eleId;
	var color;

	color = 'rgb(' + appFC.colorR + ',' + appFC.colorG + ',' + appFC.colorB + ')';

	eleId = '#textInputArea';

	$(eleId).css('font', appCfg.tidTextSize + 'px' + ' ' + appFC.fontFamily);
	$(eleId).css('color', color);

	if (-1 != appFC.fontStyle.indexOf("Bold")) {
		$(eleId).css('font-weight', 'bold');

		appFC.fontBold = true;
	}
	else {
		$(eleId).css('font-weight', 'normal');

		appFC.fontBold = false;
	}

	if (-1 != appFC.fontStyle.indexOf("Italic")) {
		$(eleId).css('font-style', 'italic');

		appFC.fontItalic = true;
	}
	else {
		$(eleId).css('font-style', 'normal');

		appFC.fontItalic = false;
	}
}

function resetTextInputContent() {
	var eleId;

	eleId = document.getElementById('textInputArea');

	eleId.value = '';
}

function getTextInputContent() {
	var eleId;

	eleId = document.getElementById('textInputArea');

	return eleId.value;
}

function getTextInputLength() {
	var eleId;

	eleId = document.getElementById('textInputArea');

	return eleId.value.length;
}

///////////////////////////////////////////////////////////////////////////////////////////
// about dialog   
///////////////////////////////////////////////////////////////////////////////////////////

function initAboutDlg() {
	var baseId = 'aboutDlg';
	var closeId = baseId + '-' + 'close';
	var contentId = baseId + '-' + 'content';
	var eleId;
	var bkg;

	// create element

	createDivElement('uiArea', baseId);
	createDivElement(baseId, closeId);
	createDivElement(baseId, contentId);

	// set window

	eleId = '#' + baseId;

	$(eleId).css('top', 'calc(50% - ' + ((appCfg.aboutWinH - appCfg.titleIconH) / 2) + 'px)');
	$(eleId).css('left', 'calc(50% - ' + (appCfg.aboutWinW / 2) + 'px)');
	$(eleId).css('width', appCfg.aboutWinW + 'px');
	$(eleId).css('height', appCfg.aboutWinH + 'px');

	$(eleId).css('position', 'absolute');
	$(eleId).css('background', appCfg.aboutBkg);
	$(eleId).css('opacity', appCfg.aboutOpacity);

	// set close icon

	eleId = '#' + closeId;

	bkg = fcGetDefIconPath('close.png');

	$(eleId).css('background', bkg);
	$(eleId).css('top', '0' + 'px');
	$(eleId).css('left', 'calc(100% - ' + appCfg.aboutIconW + 'px)');
	$(eleId).css('width', appCfg.aboutIconW + 'px');
	$(eleId).css('height', appCfg.aboutIconH + 'px');
	$(eleId).css('position', 'absolute');

	$(eleId).click(function () {
		showElement('aboutDlg', false);
		//fcCloseActiveDlg();
	});

	// set content area

	eleId = '#' + contentId;

	$(eleId).css('top', appCfg.aboutIconH + 'px');
	$(eleId).css('left', appCfg.aboutGapX + 'px');
	$(eleId).css('width', (appCfg.aboutWinW - 2 * appCfg.aboutGapX) + 'px');
	$(eleId).css('height', (appCfg.aboutWinH - appCfg.aboutIconH) + 'px');
	$(eleId).css('position', 'absolute');

	$(eleId).html(aboutContent);

	// set company link

	eleId = '#companyLink';

	$(eleId).click(function () {
		window.open(aboutCompanyLink);
	});

	// set manual link

	eleId = '#manualLink';

	$(eleId).click(function () {
		window.open(aboutManualLink);
	});

	// hide dialog

	showElement(baseId, false);
}

function aboutDlgOpen() {
	showElement('aboutDlg', true);
}

function aboutDlgClose() {
	showElement('aboutDlg', false);
}

///////////////////////////////////////////////////////////////////////////////////////////
// periodic capture dialog
///////////////////////////////////////////////////////////////////////////////////////////

function setPeriodicCaptureDlgElement(id, pic, startX, startY, width, height, hasPic) {
	var eleId;
	var bkg;

	eleId = '#' + id;

	if (hasPic) {
		bkg = fcGetDefIconPath(pic);
		$(eleId).css('background', bkg);
	}

	$(eleId).css('top', startY + 'px');
	$(eleId).css('left', startX + 'px');
	$(eleId).css('width', width + 'px');
	$(eleId).css('height', height + 'px');
	$(eleId).css('position', 'absolute');
}

function createPeriodicCaptureDlgIcon(parentId, id, pic, startX, startY) {
	createSpanElement(parentId, id);

	setPeriodicCaptureDlgElement(id, pic, startX, startY, appCfg.pcdIconW, appCfg.pcdIconH, true);
}

function createPeriodicCaptureDlgUnit(parentId, id, startX, startY, text) {
	createLabelElement(parentId, id);

	setPeriodicCaptureDlgElement(id, false, startX, startY + appCfg.pcdUnitOffsetY, appCfg.pcdUnitW, appCfg.pcdUnitH, false);

	$('#' + id).css('text-align', 'right');

	periodicCaptureDlgUpdateText(id, text);
}

function createPeriodicCaptureDlgText(parentId, id, startX, startY, text) {
	var eleId = '#' + id;

	createInputElement(parentId, id);

	setPeriodicCaptureDlgElement(id, false, startX, startY, appCfg.pcdTextW, appCfg.pcdTextH, false);

	$(eleId).keydown(function (e) {
		// Allow: backspace, delete
		if ($.inArray(e.keyCode, [46, 8]) !== -1 ||
			// Allow: home, end, left, right, down, up
			(e.keyCode >= 35 && e.keyCode <= 40)) {
			// let it happen, don't do anything
			return;
		}

		// Ensure that it is a number and stop the keypress
		if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault();
		}
	});

	$(eleId).attr('value', text);

	$(eleId).css('text-align', 'center');
}

function periodicCaptureDlgPeriod() {
	var baseId = 'periodicCaptureDlg';
	var periodText = baseId + '_' + 'periodText';

	return document.getElementById(periodText).value;
}

function periodicCaptureDlgInterval() {
	var baseId = 'periodicCaptureDlg';
	var intervalText = baseId + '_' + 'intervalText';

	return document.getElementById(intervalText).value;
}

function periodicCaptureDlgUpdateText(id, text) {
	var id;

	id = document.getElementById(id);

	fcUpdateElementText(id, text);
}

function initPeriodicCaptureDlg() {
	var baseId = 'periodicCaptureDlg';

	var periodIcon = baseId + '_' + 'periodIcon';
	var periodText = baseId + '_' + 'periodText';
	var periodUnit = baseId + '_' + 'periodUnit';

	var intervalIcon = baseId + '_' + 'intervalIcon';
	var intervalText = baseId + '_' + 'intervalText';
	var intervalUnit = baseId + '_' + 'intervalUnit';

	var closeIcon = baseId + '_' + 'close';
	var startIcon = baseId + '_' + 'startIcon';

	var eleId;
	var x, y;
	var textOffsetY = (appCfg.pcdIconH - appCfg.pcdTextH) / 2;
	var unitOffsetY = (appCfg.pcdIconH - appCfg.pcdUnitH) / 2;

	// set dialog size

	createDivElement('uiArea', baseId);

	var totalW;
	var totalH;

	totalW = appCfg.pcdIconW + appCfg.pcdTextW + appCfg.pcdUnitW + appCfg.pcdExtraW;
	totalH = appCfg.pcdIconH * 4 - appCfg.pcdIconOverlayY * 3;

	eleId = '#' + baseId;

	$(eleId).css('position', 'absolute');
	$(eleId).css('background', appCfg.pcdBkg);
	$(eleId).css('opacity', appCfg.pcdOpacity);

	$(eleId).css('left', 'calc(50% - ' + (totalW / 2) + 'px)');
	$(eleId).css('top', 'calc(50% - ' + ((totalH - appCfg.titleIconH) / 2) + 'px)');
	$(eleId).css('width', totalW + 'px');
	$(eleId).css('height', totalH + 'px');

	// set close icon

	x = totalW - appCfg.pcdIconW;
	y = 0;

	createPeriodicCaptureDlgIcon(baseId, closeIcon, 'close.png', x, y);

	$('#' + closeIcon).on('click', previewPeriodicCaptureDlgClickClose);

	y += appCfg.pcdIconH - appCfg.pcdIconOverlayY;

	// set periodic element

	x = 0;
	createPeriodicCaptureDlgIcon(baseId, periodIcon, 'timesave_time.png', x, y);

	x += appCfg.pcdIconW;
	createPeriodicCaptureDlgText(baseId, periodText, x, y + textOffsetY, appFC.capturePeriodSec);

	x += appCfg.pcdTextW;
	//createPeriodicCaptureDlgUnit(baseId, periodUnit, x, y + unitOffsetY, chrome.i18n.getMessage("lbSeconds"));
	createPeriodicCaptureDlgUnit(baseId, periodUnit, x, y + unitOffsetY, "");
	//createPeriodicCaptureDlgUnit(baseId, periodUnit, x, y + unitOffsetY, get_i18n_Message("lbSeconds"));


	y += appCfg.pcdIconH - appCfg.pcdIconOverlayY;

	// set interval element

	x = 0;
	createPeriodicCaptureDlgIcon(baseId, intervalIcon, 'timesave_keep.png', x, y);

	x += appCfg.pcdIconW;
	createPeriodicCaptureDlgText(baseId, intervalText, x, y + textOffsetY, appFC.captureIntervalHour);

	x += appCfg.pcdTextW;
	//createPeriodicCaptureDlgUnit(baseId, intervalUnit, x, y + unitOffsetY, chrome.i18n.getMessage("lbMinutes"));
	createPeriodicCaptureDlgUnit(baseId, intervalUnit, x, y + unitOffsetY, "");
	//createPeriodicCaptureDlgUnit(baseId, intervalUnit, x, y + unitOffsetY, get_i18n_Message("lbMinutes"));

	y += appCfg.pcdIconH - appCfg.pcdIconOverlayY;

	// set start icon

	x = (totalW - appCfg.pcdIconW) / 2;

	createPeriodicCaptureDlgIcon(baseId, startIcon, 'timesave_star.png', x, y);

	$('#' + startIcon).on('click', previewPeriodicCaptureRun);

	// hide dialog

	showPeriodicCaptureDlg(false);
}

function showPeriodicCaptureDlg(mode) {
	showElement('periodicCaptureDlg', mode);
}

///////////////////////////////////////////////////////////////////////////////////////////
// periodic capture info bar
///////////////////////////////////////////////////////////////////////////////////////////

function resizePeriodicCaptureInfoBar() {
	var baseId = 'periodicCaptureInfoBar';
	var totalW, totalH;
	var eleId;
	var y;

	y = Math.min((dispY + dispH), (winH - appCfg.drawSetH));

	totalW = appCfg.pcibTextW + appCfg.pcibIconW;
	totalH = appCfg.pcibIconH;

	eleId = '#' + baseId;

	$(eleId).css('position', 'absolute');
	$(eleId).css('background', appCfg.pcibBkg);
	$(eleId).css('opacity', appCfg.pcibOpacity);

	$(eleId).css('left', 'calc(50% - ' + (totalW / 2) + 'px)');
	$(eleId).css('top', (y - totalH - appCfg.pcidGapY) + 'px');
	$(eleId).css('width', totalW + 'px');
	$(eleId).css('height', totalH + 'px');
}

function initPeriodicCaptureInfoBar() {
	var baseId = 'periodicCaptureInfoBar';
	var textId = baseId + '_' + 'text';
	var iconId = baseId + '_' + 'icon';

	var eleId;

	// set base element

	createSpanElement('uiArea', baseId);

	resizePeriodicCaptureInfoBar();

	// set text element

	createLabelElement(baseId, textId);

	eleId = '#' + textId;

	$(eleId).css('position', 'absolute');
	$(eleId).css('left', 0);
	$(eleId).css('top', ((appCfg.pcibIconH - appCfg.pcibTextH) / 2) + 'px');
	$(eleId).css('width', appCfg.pcibTextW + 'px');
	$(eleId).css('height', appCfg.pcibTextH + 'px');

	$(eleId).css('text-align', 'center');
	$(eleId).css('line-height', appCfg.pcibTextH + 'px');
	$(eleId).css('font-size', appCfg.pcibTextFontSize);
	$(eleId).css('color', appCfg.pcibTextColor);

	// set stop icon

	createSpanElement(baseId, iconId);

	eleId = '#' + iconId;

	$(eleId).css('position', 'absolute');
	$(eleId).css('left', appCfg.pcibTextW + 'px');
	$(eleId).css('top', 0);
	$(eleId).css('width', appCfg.pcibIconW + 'px');
	$(eleId).css('height', appCfg.pcibIconH + 'px');

	$(eleId).css('background', fcGetDefIconPath('timesave_star.png'));

	$(eleId).on('click', stopPeriodicCapture);

	// hide info bar

	showPeriodicCaptureInfoBar(false);
}

function stopPeriodicCapture() {
	appFC.capturePeriodRun = false;

	showPeriodicCaptureInfoBar(false);
}

function showPeriodicCaptureInfoBar(mode) {
	showElement('periodicCaptureInfoBar', mode);
}

function updatePeriodicCaptureInfoBar() {
	var baseId = 'periodicCaptureInfoBar';
	var textId = baseId + '_' + 'text';

	var id;
	var text;

	text = appFC.capturePeriodCurCnt + ' / ' + appFC.capturePeriodTotalCnt;

	id = document.getElementById(textId);

	fcUpdateElementText(id, text);
}

///////////////////////////////////////////////////////////////////////////////////////////
// confirm dialog
///////////////////////////////////////////////////////////////////////////////////////////

function resizeConfirmDlg() {
	var baseId = 'confirmDlg';
	var totalW, totalH;
	var eleId;

	totalW = appCfg.cdFrameGap * 2 + appCfg.cdIconW * 2 + appCfg.cdIconGap;
	totalH = appCfg.cdFrameGap * 2 + appCfg.cdIconH;

	eleId = '#' + baseId;

	$(eleId).css('position', 'absolute');
	$(eleId).css('background', appCfg.cdBkg);
	$(eleId).css('opacity', appCfg.cdOpacity);

	$(eleId).css('left', 'calc(50% - ' + (totalW / 2) + 'px)');
	$(eleId).css('top', 'calc(50% - ' + (totalH / 2) + 'px)');
	$(eleId).css('width', totalW + 'px');
	$(eleId).css('height', totalH + 'px');
}

function initConfirmDlg() {
	var baseId = 'confirmDlg';
	var yesId = baseId + '_' + 'yes';
	var noId = baseId + '_' + 'no';
	var startX, startY;

	// create base element

	createSpanElement('uiArea', baseId);

	resizeConfirmDlg();

	// create icon

	startX = appCfg.cdFrameGap;
	startY = appCfg.cdFrameGap;

	createConfirmDlgIcon(noId, 'no.png', startX, startY);

	startX += appCfg.cdIconW + appCfg.cdIconGap;

	createConfirmDlgIcon(yesId, 'yes.png', startX, startY);

	function createConfirmDlgIcon(id, picture, x, y) {
		var eleId;
		var bkg;

		createSpanElement(baseId, id);

		eleId = '#' + id;

		bkg = fcGetDefIconPath(picture);
		$(eleId).css('background', bkg);

		$(eleId).css('left', x + 'px');
		$(eleId).css('top', y + 'px');
		$(eleId).css('width', appCfg.cdIconW + 'px');
		$(eleId).css('height', appCfg.cdIconH + 'px');
		$(eleId).css('position', 'absolute');

		$(eleId)
			.on('mousedown', function (event) {
				if (MouseBtnId.left === event.which) {
					$(eleId).css('background-color', appCfg.cdMouseColorClick);

					handleCinfirmDlgClick(event.target.id);
				}
			})
			.on('mousemove', function (event) {
				$(eleId).css('background-color', appCfg.cdMouseColorEnter);
			})
			.on('mouseout', function () {
				$(eleId).css('background-color', appCfg.cdMouseColorLeave);
			});
	}

	// handle click

	function handleCinfirmDlgClick(id) {
		//console.log(id + " clicked");

		var baseId = 'confirmDlg';
		var yesId = baseId + '_' + 'yes';
		var noId = baseId + '_' + 'no';

		var eleId;
		var result;

		eleId = document.getElementById(baseId);

		if (eleId.clickHandler) {
			eleId.clickHandler(id == yesId);
		}
	}

	// hide dialog

	showConfirmDlg(false);
}

function showConfirmDlg(mode) {
	var baseId = 'confirmDlg';

	showElement(baseId, mode);
}

function setConfirmDlgClickHandler(fn) {
	var baseId = 'confirmDlg';
	var eleId;

	eleId = document.getElementById(baseId);

	eleId.clickHandler = fn;
}

function setConfirmDlgTip(tipYes, tipNo) {
	var baseId = 'confirmDlg';
	var yesId = baseId + '_' + 'yes';
	var noId = baseId + '_' + 'no';

	fcUpdateElementTitle(yesId, tipYes);
	fcUpdateElementTitle(noId, tipNo);
}


///////////////////////////////////////////////////////////////////////////////////////////
//  get local storage image file 
///////////////////////////////////////////////////////////////////////////////////////////

var inputFiles;

function lsInitSelectFilesDlg() {
	createInputElement('uiArea', 'imgInput');

	inputFiles = document.getElementById('imgInput');
	inputFiles.hidden = true;
	inputFiles.type = 'file';
	inputFiles.accept = ".jpg, .png, .jpeg, .bmp, .tif, .tiff|image/*";
	inputFiles.onchange = lsGetSelectFilesList;
}

function lsGetSelectFilesList() {
	var files = inputFiles.files;
	//console.log(inputFiles.files[0].webkitRelativePath);

	if (files.length) {
		if (-1 != files[0].type.indexOf("image")) {
			fcLoadImage(files[0]);
		}
	}
}

function lsSelectFilesDlg() {

	$('#imgInput').val('');
	inputFiles.click();

	document.body.onfocus = function () {
		if (IsScanMode) {
			setTimeout(function () {
				var ele = document.getElementById("importPictureWin");
				//console.log(ele.hidden);
				if (ele.hidden) {
					attachCropBox(dispW, dispH);
				}
			}, 200);
		}
		document.body.onfocus = null;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
//  image file 
///////////////////////////////////////////////////////////////////////////////////////////

function fcLoadTiff(file) {
	var image = new Image();

	var reader = new FileReader();
	reader.onload = (function (theFile) {
		return function (e) {
			var buffer = e.target.result;
			var tiff = new Tiff({ buffer: buffer });
			var canvas = tiff.toCanvas();
			var width = tiff.width();
			var height = tiff.height();
			if (canvas) {
				image.src = canvas.toDataURL();
			}
		};
	})(file);
	reader.readAsArrayBuffer(file);

	image.addEventListener("load", function () {
		var imageInfo = file.name + ' ' +
			image.width + 'x' +
			image.height + ' ' +
			file.type + ' ' +
			Math.round(file.size / 1024) + 'KB';
		//console.log(imageInfo);

		displayPictureWin(image);
	});
}

function fcLoadImage(file) {
	var image = new Image();

	image.addEventListener("load",
		function () {
			var imageInfo = file.name + ' ' +
				image.width + 'x' +
				image.height + ' ' +
				file.type + ' ' +
				Math.round(file.size / 1024) + 'KB';
			//console.log(imageInfo);

			displayPictureWin(image);
		}
	);

	if (-1 != file.type.indexOf("tif")) {
		var reader = new FileReader();
		reader.onload = (function (theFile) {
			return function (e) {
				var buffer = e.target.result;
				var tiff = new Tiff({ buffer: buffer });
				var canvas = tiff.toCanvas();
				//var width = tiff.width();
				//var height = tiff.height();
				if (canvas) {
					image.src = canvas.toDataURL();
				}
			};
		})(file);
		reader.readAsArrayBuffer(file);
	}
	else {
		image.src = window.URL.createObjectURL(file);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
//  init 
///////////////////////////////////////////////////////////////////////////////////////////

function galleryInit() {
	lsInitSelectFilesDlg();

	refleshGallery();
	//galleryFillThumbnailDiv_Page();
}

// function refleshGallery() {
// 	//console.log("refleshGallery");

// 	if (!appFs) {
// 		setTimeout(function () {
// 			refleshGallery();
// 		},
// 			50);

// 		return;
// 	}

// 	appFC.thumbnailReflesh = false;
// 	appFC.thumbnailEntries = null;

// 	var dirReader = appFs.root.createReader();

// 	dirReader.readEntries(
// 		enumFiles,
// 		errorHandler
// 	);

// 	function enumFiles(entries) {
// 		if (appFC.thumbnailEntries == null) {
// 			appFC.thumbnailEntries = entries;
// 			//console.log("init entries", appFC.thumbnailEntries.length);
// 		}
// 		else {
// 			appFC.thumbnailEntries = appFC.thumbnailEntries.concat(entries);
// 			//console.log("concat entries", appFC.thumbnailEntries.length);
// 		}

// 		if (entries.length == 100) {
// 			dirReader.readEntries(
// 				enumFiles,
// 				errorHandler
// 			);
// 		}
// 		else {
// 			//console.log("appFC.thumbnailEntries.length", appFC.thumbnailEntries.length);
// 			//appFC.thumbnailTotalPage = parseInt(appFC.thumbnailEntries.length / 100) + 1;

// 			galleryFillThumbnailDiv_Page();
// 		}
// 	}

// 	function errorHandler(fe) {
// 		console.log(fe.code);
// 	}
// }

// function galleryFillThumbnailDiv_Page() {
// 	if (!appFs) {
// 		setTimeout(function () {
// 			galleryFillThumbnailDiv_Page();
// 		},
// 			50);

// 		return;
// 	}

// 	//console.log("galleryFillThumbnailDiv_Page");
// 	appFC.thumbSelectedFileCnt = 0;
// 	appFC.thumbnailCnt = 0;
// 	appFC.thumbFileCnt = 0;
// 	$('#thumbDiv').empty();

// 	var ValidEntry = 0;

// 	for (var i = 0; i < appFC.thumbnailEntries.length; i++) {
// 		//console.log(i, appFC.thumbnailEntries[i].name);

// 		if (appFC.thumbnailEntries[i].name.indexOf(".sub") == -1)
// 			ValidEntry += 1;
// 	}

// 	appFC.thumbnailTotalPage = parseInt((ValidEntry - 1) / 100) + 1;

// 	// set limit for CurrPage, Index is ZERO-Base
// 	appFC.thumbnailCurrPage = Math.min(appFC.thumbnailCurrPage, appFC.thumbnailTotalPage - 1);

// 	//console.log(appFC.thumbnailCurrPage, appFC.thumbnailTotalPage);

// 	var startIndex = 100 * appFC.thumbnailCurrPage;
// 	var endIndex = Math.min(startIndex + 100, ValidEntry);

// 	ValidEntry = 0;

// 	for (var i = 0; i < appFC.thumbnailEntries.length; i++) {
// 		if (appFC.thumbnailEntries[i].name.indexOf(".sub") == -1)
// 			ValidEntry += 1;

// 		if (startIndex <= ValidEntry - 1 && ValidEntry - 1 < endIndex) {
// 			if (-1 != appFC.thumbnailEntries[i].name.indexOf(".jpg")) {
// 				var filename = appFC.thumbnailEntries[i].name;

// 				if (filename.replace(".jpg", ".sub") == appFC.thumbnailEntries[i - 1].name) {
// 					appFC.thumbnailCnt += 1;

// 					galleryCreateThumbnailDivEx(
// 						appFC.thumbnailEntries[i - 1],
// 						appFC.thumbnailEntries[i],
// 						appFC.thumbnailCnt);
// 				}
// 				else {
// 					//galleryCreateThumbnailDiv(appFC.thumbnailEntries[i], appFC.thumbnailCnt);
// 				}


// 			}

// 			if (-1 != appFC.thumbnailEntries[i].name.indexOf(".webm")) {
// 				appFC.thumbnailCnt += 1;

// 				galleryCreateVideoDiv(appFC.thumbnailEntries[i], appFC.thumbnailCnt);
// 			}
// 		}

// 		if (ValidEntry - 1 >= endIndex)
// 			break;
// 	}

// 	galleryUpdateFileInfo();
// }

// function galleryFillThumbnailDiv() {
// 	//console.log("galleryFillThumbnailDiv");

// 	if (!appFs) {
// 		setTimeout(function () {
// 			galleryFillThumbnailDiv();
// 		},
// 			50);

// 		return;
// 	}

// 	var dirReader = appFs.root.createReader();

// 	dirReader.readEntries(
// 		enumFiles,
// 		errorHandler
// 	);

// 	function enumFiles(entries) {
// 		//console.log(entries);

// 		if (entries.length == 100) {
// 			dirReader.readEntries(
// 				enumFiles,
// 				errorHandler
// 			);
// 		}

// 		for (var i = 0; i < entries.length; i++) {
// 			if (entries[i].isFile) {
// 				if (-1 != entries[i].name.indexOf(".jpg")) {
// 					appFC.thumbnailCnt += 1;

// 					//console.log(entries[i].name);

// 					galleryCreateThumbnailDiv(entries[i], appFC.thumbnailCnt);
// 				}

// 				if (-1 != entries[i].name.indexOf(".webm")) {
// 					appFC.thumbnailCnt += 1;

// 					galleryCreateVideoDiv(entries[i], appFC.thumbnailCnt);
// 				}
// 			}
// 		}
// 	}

// 	function errorHandler(fe) {
// 		console.log(fe.code);
// 	}
// }

///////////////////////////////////////////////////////////////////////////////////////////
// thumbnail   
///////////////////////////////////////////////////////////////////////////////////////////

function galleryGetFitSize(dstW, dstH, srcW, srcH) {
	var size = {
		x: 0,
		y: 0,
		w: 0,
		h: 0
	};

	if (dstW * srcH < srcW * dstH) {
		// use full display width

		size.w = dstW;
		size.x = 0;

		size.h = Math.floor(size.w * srcH / srcW);
		size.y = Math.floor((dstH - size.h) / 2);
	}
	else {
		// use full display height

		size.h = dstH;
		size.y = 0;

		size.w = Math.floor(size.h * srcW / srcH);
		size.x = Math.floor((dstW - size.w) / 2);
	}

	return size;
}

var requestFullScreenEle;
$(document).on("webkitfullscreenchange", function () {
	if (document.fullscreenElement) {
		//console.log(`Element: ${document.fullscreenElement.id} entered full-screen mode.`);
		//console.log(document.fullscreenElement);
		requestFullScreenEle = document.fullscreenElement;
		requestFullScreenEle.style.border = 'none';
	}
	else {
		//console.log('Leaving full-screen mode.');
		var borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + appCfg.thumbFrmColorChecked;
		requestFullScreenEle.style.border = borderCfg;
	}
});

///////////////////////////////////////////////////////////////////////////////////////////
// delete file 
///////////////////////////////////////////////////////////////////////////////////////////

function galleryDeleteFiles(eleId) {
	var i;

	for (i = 0; i < eleId.length; i++) {
		if (eleId[i].fileEntrySub) {
			eleId[i].fileEntrySub.remove(function () {
			},
				function () {
					console.log(fe.code);
				}
			);
		}

		eleId[i].fileEntryOrg.remove(function () {
		},
			function () {
				console.log(fe.code);
			}
		);

		($('#' + eleId[i].id).parent()).remove();

		//galleryDeleteSelectedFileFinish();
	}

	refleshGallery();
}

///////////////////////////////////////////////////////////////////////////////////////////
// save canvas to local storage 
///////////////////////////////////////////////////////////////////////////////////////////

function lsSaveCanvasById(id, filename) {
	var canvasElement = document.getElementById(id);

	lsSaveCanvas(canvasElement, filename);
}

function lsSaveCanvas(canvasElement, filename) {
	var MIME_TYPE = "image/jpeg";
	var imgURL = canvasElement.toDataURL(MIME_TYPE);

	lsSaveUrl(imgURL, filename);
}

function lsSaveImage(image, filename) {
	var canvas = document.getElementById('saveFileCanvas');
	var ctx = canvas.getContext('2d');

	$('#saveFileCanvas').attr('width', image.width);
	$('#saveFileCanvas').attr('height', image.height);

	ctx.drawImage(image, 0, 0, image.width, image.height);

	lsSaveCanvas(canvas, filename);
}

function lsSaveUrl(url, filename) {
	var MIME_TYPE = "image/jpeg";
	var dlLink = document.createElement('a');

	dlLink.download = filename;
	dlLink.href = url;
	dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

	document.body.appendChild(dlLink);
	dlLink.click();
	document.body.removeChild(dlLink);
}

///////////////////////////////////////////////////////////////////////////////////////////
// save files to local storage default folder (file by file)
///////////////////////////////////////////////////////////////////////////////////////////

function lsSaveFilesToDefaultFoloer(eleId) {
	var i;

	for (i = 0; i < eleId.length; i++) {
		lsSaveImage(eleId[i].imgSrc, eleId[i].fileName);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// save files to local storage selected folder 
///////////////////////////////////////////////////////////////////////////////////////////

async function lsSaveFilesToSelectedFolder(eleId, format) {
	if (0 == eleId.length) return;

	if (galleryData.length <= 0) return;

	for (var i = 0; i < galleryData.length; i++) {
		if (galleryData[i].name == eleId[0].fileName) {
			var imageUrl;

			// video
			if (galleryData[i].name.indexOf("mp4") != -1 ||
				galleryData[i].name.indexOf("webm") != -1) {
				// const videoBlob = new Blob([galleryData[i].video], { type: 'application/octet-stream' });
				// imageUrl = URL.createObjectURL(videoBlob);
				imageUrl = URL.createObjectURL(galleryData[i].video);
			}
			// image
			else {
				// const imageBlob = new Blob([galleryData[i].normalImage], { type: 'application/octet-stream' });
				// imageUrl = URL.createObjectURL(imageBlob);
				imageUrl = galleryData[i].normalImage;
			}
			const a = document.createElement('a');
			a.href = imageUrl;
			a.download = galleryData[i].name; // 設定下載檔名
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(imageUrl); // 釋放 URL
			break;
		}
	}
	return;


	function addImageProcess(url) {
		return new Promise((resolve, reject) => {
			let img = new Image()
			img.onload = () => resolve(imageToCanvas(img))
			img.onerror = () => reject("Load Error")
			img.src = url;
		})
	}

	if (format == "PDF") {
		//if(chrome.runtime.lastError) return;

		var totalImageQty = 0;
		var firstImageIndex = -1;

		for (i = 0; i < eleId.length; i++) {
			if (eleId[i].tagName == "IMG") {
				totalImageQty += 1;

				if (firstImageIndex == -1)
					firstImageIndex = i;
			}
		}

		var pdf;
		var imageCount = 0;
		var filename = eleId[firstImageIndex].fileName.split(".")[0];

		for (let i = 0; i < eleId.length; i++) {
			if (eleId[i].tagName == "IMG") {
				eleId[i].fileEntryOrg.file(async function (file) {
					await addImageProcess(window.URL.createObjectURL(file)).then(async function (canvas) {

						imageCount += 1;

						if (imageCount == 1) {
							pdf = await new jsPDF({
								orientation: 'l', // landscape
								unit: 'pt', // points, pixels won't work properly
								format: [canvas.width, canvas.height] // set needed dimensions for any element
							});
						}

						var imgData = await canvas.toDataURL("image/jpeg", 1.0);
						await pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);

						if (imageCount < totalImageQty)
							pdf.addPage();

						if (imageCount == totalImageQty) {
							pdf.save(filename + ".pdf");
						}
					}).catch((err) => {
						console.log(err);
					})
				});
			}
		}
		return;
	}

	//var dirHanle = await window.showDirectoryPicker();

	for (var i = 0; i < eleId.length; i++) {
		if (eleId[i].tagName == "IMG") {
			eleId[i].fileEntryOrg.file(async function (file) {

				await addImageProcess(window.URL.createObjectURL(file)).then((canvas) => {

					var filename = file.name.split(".")[0];

					switch (format) {
						case "JPG":
							filename += ".jpg";
							canvas.toBlob(function (blob) {
								//CustomSave(filename, dirHanle, blob);
								saveBlobToJpg(filename, blob);
							},
								"image/jpeg", 1.0
							);
							break;

						case "PNG":
							filename += ".png";
							canvas.toBlob(function (blob) {
								//CustomSave(filename, dirHanle, blob);
								saveBlobToPng(filename, blob);
							},
								"image/png", 1.0
							);
							break;

						case "TIFF":
							filename += ".tiff";
							CanvasToTIFF.toBlob(canvas, function (blob) {
								//CustomSave(filename, dirHanle, blob);
								saveBlobToTiff(filename, blob);
							});
							break;
					}
				}).catch((err) => {
					console.log(err);
				})
			});
		}
		else if (eleId[i].tagName == "VIDEO") {
			eleId[i].fileEntryOrg.file(async function (blob) {
				var filename = blob.name.split(".")[0] + ".webm";
				saveBlobToWebm(filename, blob);
				//CustomSave(filename, dirHanle, blob);
				// fileEntry.File(function(blob){
				// 	CustomSave(filename, dirHanle, blob);
				// });
			});
		}
	}

	async function CustomSave(filename, dirHandle, blob) {
		var draftHandle = await dirHandle.getFileHandle(filename, { create: true });
		var writableStream = await draftHandle.createWritable();
		await writableStream.write(blob);
		await writableStream.close();
	}
	return;

	// chrome.fileSystem.chooseEntry(
	// 	{ type: 'openDirectory' }, 
	// 	async function(dirEntry) {
	// 		if(chrome.runtime.lastError) return;
	// 		if ( !dirEntry || !dirEntry.isDirectory ) return;			

	// 		for ( i = 0; i < eleId.length; i++ )
	// 		{
	// 			if ( eleId[i].tagName == "IMG" )
	// 			{					
	// 				switch ( format )
	// 				{
	// 					case "JPG":	
	// 						eleId[i].fileEntryOrg.file( async function(file)
	// 						{
	// 							await addImageProcess(window.URL.createObjectURL(file)).then((canvas) => {
	// 								//console.log(file.name, "Save as ", format);
	// 								var filename = file.name.split(".")[0] + ".jpg";
	// 								writeCanvasToJpg(dirEntry, canvas, filename);
	// 							}).catch((err)=>{
	// 								console.log(err);
	// 							})								
	// 						});
	// 						break;

	// 					case "PNG":
	// 						eleId[i].fileEntryOrg.file( async function(file)
	// 						{
	// 							await addImageProcess(window.URL.createObjectURL(file)).then((canvas) => {
	// 								//console.log(file.name, "Save as ", format);
	// 								var filename = file.name.split(".")[0] + ".png";
	// 								writeCanvasToPng(dirEntry, canvas, filename);
	// 							}).catch((err)=>{
	// 								console.log(err);
	// 							})								
	// 						});
	// 						break;

	// 					case "TIFF":
	// 						eleId[i].fileEntryOrg.file( async function(file)
	// 						{
	// 							await addImageProcess(window.URL.createObjectURL(file)).then((canvas) => {
	// 								//console.log(file.name, "Save as ", format);
	// 								var filename = file.name.split(".")[0] + ".tif";
	// 								writeCanvasToTiff(dirEntry, canvas, filename);
	// 							}).catch((err)=>{
	// 								console.log(err);
	// 							})								
	// 						});
	// 						break;
	// 				}		
	// 			}

	// 			if ( eleId[i].tagName == "VIDEO" )
	// 			{
	// 				appFs.root.getFile(eleId[i].fileEntryOrg.name, {}, function(fileEntry)
	// 				{
	// 					fileEntry.copyTo(dirEntry);
	// 				});
	// 			}
	// 		}
	// 	}
	// );

	function imageToCanvas(image) {
		var canvas = document.getElementById('saveFileCanvas');
		var ctx = canvas.getContext('2d');

		$('#saveFileCanvas').attr('width', image.width);
		$('#saveFileCanvas').attr('height', image.height);

		ctx.drawImage(image, 0, 0, image.width, image.height);

		return canvas;
	}

	function writeCanvasToPng(dirEntry, canvas, filename) {
		canvas.toBlob(function (blob) {
			dirEntry.getFile(filename, { create: true }, function (entry) {
				entry.createWriter(function (writer) {
					writer.write(blob);
				});
			});
		},
			"image/png", 1.0
		);
	}

	function writeCanvasToJpg(dirEntry, canvas, filename) {
		canvas.toBlob(function (blob) {
			dirEntry.getFile(filename, { create: true }, function (entry) {
				entry.createWriter(function (writer) {
					writer.write(blob);
				});
			});
		},
			"image/jpeg", 1.0
		);
	}

	function writeCanvasToTiff(dirEntry, canvas, filename) {
		CanvasToTIFF.toBlob(canvas, function (blob) {
			dirEntry.getFile(filename, { create: true }, function (entry) {
				entry.createWriter(function (writer) {
					writer.write(blob);
				});
			});
		});
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// active check 
///////////////////////////////////////////////////////////////////////////////////////////

function intVideoStreamActiveCheck() {
	videoLastUpdateTime = new Date();

	setInterval(async function () {
		var curTime = new Date();
		var diff = curTime - videoLastUpdateTime;

		//console.log(window.stream);

		if (typeof window.stream == 'undefined' ||
			(diff > 1000 &&
				window.stream.active == false &&
				chrome.WindowState == 'minimized')) {
			//connectVideoSrc();
			//await startVideo();
		}
	}, 3000);
}

///////////////////////////////////////////////////////////////////////////////////////////
// mouse event
///////////////////////////////////////////////////////////////////////////////////////////
var fullPhotoMode = false;
var fullScreenMode = false;
var oldScreenWidth = 0;
var oldScreenHeight = 0;

function switchFullPhotoMode(enable) {
	fullPhotoMode = enable;
	window.onresize();
	fcToogleToolBar();
	sysUpdateToolBarTip();
	//toolBarSetAllElementState('previewToolBar', 0);

	setHideIconCountdown();
}

function sysToolBarOnClick(event) {
	switch (event.target.id) {
		case "sys_close":

			if (IsRecording) {
				StopRecord();
				setTimeout(function () {
					sysToolBarOnClick(event);
				}, 1000);
				return;
			}

			if (true == chrome.app.window.current().isFullscreen()) {
				document.webkitCancelFullScreen();
			}

			window.close();

			break;

		case "sys_fullScreen":
			if (document.body.clientWidth >= window.screen.width &&
				document.body.clientHeight >= window.screen.height - 50 &&
				!fullScreenMode) {
				if ($('#dialogSave').hasClass('ui-dialog-content') &&
					$('#dialogSave').dialog('isOpen') === true) {
					$("#dialogSave").dialog("close");
				}

				document.webkitCancelFullScreen();
				window.resizeTo(840, 660);
				return;
			}

			if (fullScreenMode) {
				if ($('#dialogSave').hasClass('ui-dialog-content') &&
					$('#dialogSave').dialog('isOpen') === true) {
					$("#dialogSave").dialog("close");
				}

				window.resizeTo(oldScreenWidth, oldScreenHeight);
			}
			else {
				oldScreenWidth = document.body.clientWidth;
				oldScreenHeight = document.body.clientHeight
				window.resizeTo(window.screen.width, window.screen.height);
			}
			fullScreenMode = !fullScreenMode;
			return;

		// appFC.resizeDelayMs = 0;

		// if ( true == chrome.app.window.current().isFullscreen() )
		// {
		// 	document.webkitCancelFullScreen();
		// }
		// else
		// {
		// 	document.documentElement.webkitRequestFullScreen();
		// }

		// break;

		case "sys_fullPhoto":
			switchFullPhotoMode(!fullPhotoMode);
			// fullPhotoMode = !fullPhotoMode;
			// window.onresize();
			// fcToogleToolBar();
			// sysUpdateToolBarTip();			
			break;

		case "sys_smallScreen":
			if (IsRecording || appFC.capturePeriodRun) {
				if ($('#dialogSave').hasClass('ui-dialog-content') &&
					$('#dialogSave').dialog('isOpen') === true) {
					$("#dialogSave").dialog("close");
				}

				$("#dialogSave").dialog({
					title: "!",
					dialogClass: "no-close",
					autoOpen: false,
					width: 250,
					height: 100,
					show: {
						effect: "fade",
						duration: 500
					},
					buttons: {
						"No": function () {
							$(this).dialog("close");
						},
						"Yes": function () {
							if (IsRecording) StopRecord();
							if (appFC.capturePeriodRun) stopPeriodicCapture();
							//chrome.app.window.current().minimize();
							chrome.windows.update(appID, { state: "minimized" });
							$(this).dialog("close");
						}
					},
					close: function (event, ui) {
						$(this).dialog("destroy");
					}
				});
				$("#dialogSave").html("<br/>Minimizing the window will stop taking pictures or videos. Continue?<br/> ");
				$("#dialogSave").dialog("open");
				return;
			}
			chrome.app.window.current().minimize();

			break;
	}

	//fcMouseEventNotify(UiType.sysToolBar, MouseStatus.click, event);
}

///////////////////////////////////////////////////////////////////////////////////////////
// tool tip
///////////////////////////////////////////////////////////////////////////////////////////

function sysUpdateToolBarTip() {
	var strId;

	if (appFC.showToolBar) strId = "btnHideFunctionIcon";
	else strId = "btnShowFunctionIcon";

	fcUpdateElementTitle("sys_fullPhoto", strId);
}

///////////////////////////////////////////////////////////////////////////////////////////
// mouse event
///////////////////////////////////////////////////////////////////////////////////////////

var IsScanMode = false;
var IsMultiscanMode = false;

var previewStatus =
{
	freeze: false,
	flip: false,
	mirror: false,
	zoomRatio: 1,
	zoomX: 0,
	zoomY: 0,
	zoomW: 0,
	zoomH: 0,
	panWinW: 0,
	panWinH: 0,
	zoomScrollBarPos: 0,
	previewRotate: 0,
	canvas: null
}

function resetPreviewStatus(modecfg) {
	modecfg.freeze = false;
	modecfg.flip = false;
	modecfg.mirror = false;
	modecfg.zoomRatio = 1;
	modecfg.zoomX = 0;
	modecfg.zoomY = 0;
	modecfg.zoomW = 0;
	modecfg.zoomH = 0;
	modecfg.panWinW = 0;
	modecfg.panWinH = 0;
	modecfg.zoomScrollBarPos = 0;
	appFC.previewRotate = 0;
}

function backupPreviewStatus(modecfg) {
	previewStatus.freeze = modecfg.freeze;
	previewStatus.flip = modecfg.flip;
	previewStatus.mirror = modecfg.mirror;
	previewStatus.zoomRatio = modecfg.zoomRatio;
	previewStatus.zoomX = modecfg.zoomX;
	previewStatus.zoomY = modecfg.zoomY;
	previewStatus.zoomW = modecfg.zoomW;
	previewStatus.zoomH = modecfg.zoomH;
	previewStatus.panWinW = modecfg.panWinW;
	previewStatus.panWinH = modecfg.panWinH;
	previewStatus.zoomScrollBarPos = modecfg.zoomScrollBarPos;
	previewStatus.previewRotate = appFC.previewRotate;

	if (previewStatus.canvas == null) {
		previewStatus.canvas = document.createElement('canvas');
	}

	previewStatus.canvas.width = modecfg.baseImageCanvas.width;
	previewStatus.canvas.height = modecfg.baseImageCanvas.height;
	var ctx = previewStatus.canvas.getContext('2d');
	ctx.drawImage(modecfg.baseImageCanvas, 0, 0);
}

function recoverPreviewStatus(modecfg) {
	modecfg.freeze = previewStatus.freeze;
	modecfg.flip = previewStatus.flip;
	modecfg.mirror = previewStatus.mirror;
	modecfg.zoomRatio = previewStatus.zoomRatio;
	modecfg.zoomX = previewStatus.zoomX;
	modecfg.zoomY = previewStatus.zoomY;
	modecfg.zoomW = previewStatus.zoomW;
	modecfg.zoomH = previewStatus.zoomH;
	modecfg.panWinW = previewStatus.panWinW;
	modecfg.panWinH = previewStatus.panWinH;
	modecfg.zoomScrollBarPos = previewStatus.zoomScrollBarPos;
	appFC.previewRotate = previewStatus.previewRotate;
}

function recoverPreviewCanvas(modecfg) {
	if (previewStatus.canvas != null) {
		modecfg.baseImageContext.drawImage(previewStatus.canvas, 0, 0);
		modecfg.imageProcess();
	}
}

function modeToolBarOnClick(event) {
	if (event.target.id == "mode_about") {
		fcToogleDlg("mode_about", aboutDlgOpen, aboutDlgClose);
		return;
	}

	if ($('#dialogSave').is(":visible")) {
		//console.log("dialogSave is visible => return")
		return;
	}

	if (IsRecording) {
		$("#dialogSave").dialog({
			title: "!",
			dialogClass: "no-close",
			autoOpen: false,
			width: 250,
			height: 100,
			show: {
				effect: "fade",
				duration: 500
			},
			buttons: {
				"No": function () {
					$(this).dialog("close");
				},
				"Yes": function () {
					$(this).dialog("close");
					StopRecord();
					setTimeout(function () {
						modeToolBarOnClick(event);
					}, 1000);

				}
			},
			close: function (event, ui) {
				$(this).dialog("destroy");
			}
		});
		$("#dialogSave").html("<br/>Will you stop recording?<br/> ");
		$("#dialogSave").dialog("open");

		// StopRecord();
		// setTimeout(function () {
		// 	modeToolBarOnClick(event)
		// }, 1000);
		return;
	}

	// Leaving Mode
	switch (appFC.curMode.baseId) {
		case 'playbackArea':
			if (event.target.id != "mode_about" &&
				event.target.id != "mode_playback")
				closeAndBackPlayback(appFC.curMode);
			break;

		case 'previewArea':
			var mc = appFC.curMode;

			if (true == appFC.capturePeriodRun) {
				$("#dialogSave").dialog({
					title: "!",
					dialogClass: "no-close",
					autoOpen: false,
					width: 250,
					height: 100,
					show: {
						effect: "fade",
						duration: 500
					},
					buttons: {
						"No": function () {
							$(this).dialog("close");
						},
						"Yes": function () {
							$(this).dialog("close");
							stopPeriodicCapture();
							setTimeout(function () {
								modeToolBarOnClick(event);
							}, 500);

						}
					},
					close: function (event, ui) {
						$(this).dialog("destroy");
					}
				});
				$("#dialogSave").html("<br/>Discard Interval Timer Shooting?<br/> ");
				$("#dialogSave").dialog("open");
				return;
			}

			// ScanMode or MultiScanMode
			if (event.target.id != "mode_preview") {
				stopPeriodicCapture();
			}

			// Preview
			if (!IsScanMode && !IsMultiscanMode) {
				if (event.target.id == "mode_preview")
					return;
				backupPreviewStatus(mc);
				hideCaptureHit();
			}

			// ScanMode
			if (IsScanMode) {
				IsTransform = false;
				fcResetCanvasArray(mc);
				$("#displayCanvas").css("transform", "scale(1,1)");
				toolBarSetAllElementState("scanToolBarS2", 0);
				resetPreviewStatus(previewModeCfg);
			}

			// MultiScanMode
			if (IsMultiscanMode && arrMultiscanData.length) {
				if ($('#dialogSave').hasClass('ui-dialog-content') &&
					$('#dialogSave').dialog('isOpen') === true) {
					$("#dialogSave").dialog("close");
				}

				$("#dialogSave").dialog({
					title: "!",
					dialogClass: "no-close",
					autoOpen: false,
					width: 250,
					height: 100,
					show: {
						effect: "fade",
						duration: 500
					},
					buttons: {
						"No": function () {
							$(this).dialog("close");
						},
						"Yes": function () {
							arrMultiscanData = [];
							HideMultiScanCnt();
							$(this).dialog("close");

							setTimeout(function () {
								modeToolBarOnClick(event);
							}, 300);

						}
					},
					close: function (event, ui) {
						$(this).dialog("destroy");
					}
				});
				$("#dialogSave").html("<br/>Discard captured images?<br/> ");
				//$("#dialogSave").dialog({ my: "center", at: "center", of: window });
				$("#dialogSave").dialog("open");
				return;
			}

			//$('#lbMsCnt').hide();
			// 20241028 取消離開preview時清除畫布
			// fcClearCanvas(mc.drawingCanvas);
			// fcPushDrawingCanvas(mc);

			if (mc.imageProcess)
				mc.imageProcess();

			removeCropBox();
			IsScanMode = false;
			IsMultiscanMode = false;
			break;

		case 'drawingArea':
			toolBarSetAllElementState("drawingToolBar", 0);
			appFC.fnDraw = null;
			break;
	}

	switch (event.target.id) {
		case "mode_preview":
			showRecordBtn(true);
			recoverPreviewStatus(previewModeCfg);
			fcSwitchMode(previewModeCfg);
			if (previewStatus.freeze) {
				//console.log("freeze");
				recoverPreviewCanvas(previewModeCfg);
				previewModeCfg.imageProcess();
			}
			break;

		case "mode_playback":
			if (playbackModeCfg.curMode != PlbToolBarType.image)
				refleshGallery();
			fcSwitchMode(playbackModeCfg);
			showRecordBtn(false);

			//if (appFC.thumbnailReflesh)
			//refleshGallery();
			break;

		case "mode_drawingBoard":
			fcSwitchMode(drawingBoardModeCfg);
			showRecordBtn(false);
			break;

		case "mode_about":
			fcToogleDlg("mode_about", aboutDlgOpen, aboutDlgClose);
			break;

		case "mode_scan":

			//$("#videoSrc").hide();
			// navigator.mediaDevices.enumerateDevices().then(function(info){
			// 	console.log(info);
			// });

			IsScanMode = true;
			fcResetCanvasArray(previewModeCfg);
			resetPreviewStatus(previewModeCfg);
			previewModeCfg.imageProcess();

			fcSwitchMode(previewModeCfg);

			resetDrawingStatus();

			showToolBar(appFC.curMode.lToolBar, false);
			showToolBar(appFC.curMode.rToolBar, false);
			showToolBar(appFC.curMode.bToolBar, false);
			showRecordBtn(false);
			showToolBar(appFC.curMode.lS1ToolBar, true);
			showToolBar(appFC.curMode.lS2ToolBar, false);
			showToolBar(appFC.curMode.lMsToolBar, false);

			isFullcrop = false;
			attachCropBox(dispW, dispH, true);
			toolBarSetAllElementState("scanToolBarS1", 0);
			break;

		case "mode_multiscan":
			IsMultiscanMode = true;
			resetPreviewStatus(previewModeCfg);

			fcSwitchMode(previewModeCfg);

			resetDrawingStatus();

			showToolBar(appFC.curMode.lToolBar, false);
			showToolBar(appFC.curMode.rToolBar, false);
			showToolBar(appFC.curMode.bToolBar, false);
			showRecordBtn(false);
			showToolBar(appFC.curMode.lMsToolBar, true);
			showToolBar(appFC.curMode.lS1ToolBar, false);
			showToolBar(appFC.curMode.lS2ToolBar, false);

			isFullcrop = false;
			attachCropBox(dispW, dispH, true);
			toolBarSetAllElementState("multiscanToolBar", 0);

			if (arrMultiscanData.length)
				ShowMultiScanCnt();
			else
				HideMultiScanCnt();
			break;
	}

	toolBarOnMouseClick(event);
}


///////////////////////////////////////////////////////////////////////////////////////////
//  constant 
///////////////////////////////////////////////////////////////////////////////////////////

if (typeof DrawData == "undefined") {
	var DrawData = {};
	DrawData.id = 0;
	DrawData.fn = 1;
}


///////////////////////////////////////////////////////////////////////////////////////////
//  apply draw type
///////////////////////////////////////////////////////////////////////////////////////////
function resetDrawingStatus() {
	toolBarSetAllElementState("drawingToolBar", 0);
	appFC.fnDraw = null;
}

function drawingToolBarOnClick(event) {
	//console.log(event);

	var fnTbl =
		[
			['btn_freehand', drawFreeHand],
			['btn_arrow', drawArrow],
			['btn_eraser', drawEraser],
			['btn_line', drawLine],
			['btn_rectangleLine', drawRectangleLine],
			['btn_rectangle', drawRectangle],
			['btn_circleLine', drawCircleLine],
			['btn_circle', drawCircle],
			['btn_text', drawText],
		];

	var i;
	var mc = appFC.curMode;

	if (event.target.id == "btn_erase_all") {
		//console.log(mc);
		fcClearCanvas(mc.drawingCanvas);
		fcPushDrawingCanvas(mc);
		if (mc.imageProcess) mc.imageProcess();

		//if ( IsTransform && IsScanMode ) back2ScanModePreview();
		fcCloseActiveDlg();

	} else if (event.target.id == "btn_configDraw") {
		$("#configDrawDlg").toggle(500);
	} else if (event.target.id == "sys_fullPhoto") {
		switchFullPhotoMode(!fullPhotoMode);

		// fullPhotoMode = !fullPhotoMode;
		// window.onresize();
		// fcToogleToolBar();
		// sysUpdateToolBarTip();			
	} else {
		for (i = 0; i < fnTbl.length; i++) {
			if (event.target.id == fnTbl[i][DrawData.id]) {
				if (appFC.fnDraw == fnTbl[i][DrawData.fn]) {
					appFC.fnDraw = undefined;
				} else {
					appFC.fnDraw = fnTbl[i][DrawData.fn];
				}
			}
		}
		fcCloseActiveDlg();
	}

	toolBarOnMouseClick(event);
}


///////////////////////////////////////////////////////////////////////////////////////////
//  common tool
///////////////////////////////////////////////////////////////////////////////////////////

function baseDrawGetSize(startX, startY, endX, endY) {
	var size =
	{
		x: 0,
		y: 0,
		w: 0,
		h: 0,

		centerX: 0,
		centerY: 0,
		endX: 0,
		endY: 0,

		regularX: 0,
		regularY: 0,
		regularSide: 0,
	};

	// caculate normal size

	size.x = Math.min(startX, endX);
	size.y = Math.min(startY, endY);

	size.w = Math.abs(endX - startX);
	size.h = Math.abs(endY - startY);

	size.centerX = size.x + size.w / 2;
	size.centerY = size.y + size.h / 2;

	size.endX = size.x + size.w;
	size.endY = size.y + size.h;

	// caculate regular size

	size.regularX = size.x;
	size.regularY = size.y;

	if (size.w > size.h) {
		size.regularSide = size.h;

		if (size.regularX !== startX) {
			size.regularX = startX - size.regularSide;
		}
	}
	else {
		size.regularSide = size.w;

		if (size.regularY !== startY) {
			size.regularY = startY - size.regularSide;
		}
	}

	return size;
}

function baseDrawEllipse(context, startX, startY, endX, endY) {
	var size;
	var startX, startY;
	var centerX, centerY;
	var endX, endY;

	size = baseDrawGetSize(startX, startY, endX, endY);

	startX = size.x;
	startY = size.y;
	centerX = size.centerX;
	centerY = size.centerY;
	endX = size.endX;
	endY = size.endY;

	context.moveTo(centerX, startY);

	context.bezierCurveTo(endX, startY, endX, endY, centerX, endY);
	context.bezierCurveTo(startX, endY, startX, startY, centerX, startY);
}


///////////////////////////////////////////////////////////////////////////////////////////
//  freehand
///////////////////////////////////////////////////////////////////////////////////////////
var lastTimeMill = 0;
var ptlist = new Array();
function drawFreeHand(state) {
	//console.log("free hand " + state);
	var ctx = appFC.drawContext;

	switch (state) {
		case DrawState.start:

			fcClearDrawingCanvas();

			ctx.strokeStyle = appFC.drawStyle;
			ctx.lineWidth = appFC.lineWidth;

			ptlist.push({ x: appFC.drawStartX, y: appFC.drawStartY });
			ptlist.push({ x: appFC.drawStartX, y: appFC.drawStartY });
			ptlist.push({ x: appFC.drawStartX, y: appFC.drawStartY });
			break;

		case DrawState.move:
			if (ptlist.length == 0)
				return;
			var d = new Date();

			if (d.getTime() - lastTimeMill < 10)
				break;

			lastTimeMill = d.getTime();

			ptlist.push({ x: appFC.drawCurX, y: appFC.drawCurY });
			ctx.clearRect(0, 0, appFC.drawCanvas.width, appFC.drawCanvas.height);
			ctx.moveTo(ptlist[0].x, ptlist[0].y);
			ctx.beginPath();

			for (var i = 1; i < ptlist.length - 2; i++) {
				var c = (ptlist[i].x + ptlist[i + 1].x) / 2;
				var d = (ptlist[i].y + ptlist[i + 1].y) / 2;
				ctx.quadraticCurveTo(ptlist[i].x, ptlist[i].y, c, d);
			}

			ctx.quadraticCurveTo(
				ptlist[i].x,
				ptlist[i].y,
				ptlist[i + 1].x,
				ptlist[i + 1].y
			);

			//ctx.lineTo(appFC.drawCurX, appFC.drawCurY);
			ctx.stroke();

			break;

		case DrawState.end:
			ptlist = [];
			break;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  arrow
///////////////////////////////////////////////////////////////////////////////////////////

function getArrowEnds(startPos, endPos, size) {
	var ends =
	{
		end1:
		{
			x: 0,
			y: 0,
		},
		end2:
		{
			x: 0,
			y: 0,
		}
	};

	var dx = endPos.x - startPos.x;
	var dy = endPos.y - startPos.y;
	var length = Math.sqrt(dx * dx + dy * dy);
	var unitDx = dx / length;
	var unitDy = dy / length;

	ends.end1.x = endPos.x - unitDx * size - unitDy * size;
	ends.end1.y = endPos.y - unitDy * size + unitDx * size;

	ends.end2.x = endPos.x - unitDx * size + unitDy * size;
	ends.end2.y = endPos.y - unitDy * size - unitDx * size;

	return ends;
}

function drawArrow(state) {
	switch (state) {
		case DrawState.start:
			break;

		case DrawState.move:

			fcClearDrawingCanvas();

			var startPos = { x: appFC.drawStartX, y: appFC.drawStartY };
			var endPos = { x: appFC.drawCurX, y: appFC.drawCurY };

			var size = Math.max(appFC.lineWidth * 2, appCfg.minArrowSize);

			var ends = getArrowEnds(startPos, endPos, size);

			var ctx = appFC.drawContext;


			ctx.fillStyle = appFC.drawStyle;
			ctx.strokeStyle = appFC.drawStyle;
			ctx.lineWidth = appFC.lineWidth;

			ctx.beginPath();
			ctx.moveTo(startPos.x, startPos.y);
			ctx.lineTo((ends.end1.x + ends.end2.x) / 2, (ends.end1.y + ends.end2.y) / 2);
			ctx.closePath();
			ctx.stroke();

			ctx.moveTo(endPos.x, endPos.y);
			ctx.lineTo(ends.end1.x, ends.end1.y);
			ctx.lineTo(ends.end2.x, ends.end2.y);
			ctx.closePath();
			ctx.fill();

			break;

		case DrawState.end:
			break;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  eraser
///////////////////////////////////////////////////////////////////////////////////////////

function drawEraserRect(context, centerX, centerY, size, style) {
	var x, y;
	var offset = 1;

	x = centerX - size / 2;
	y = centerY - size / 2;

	if (typeof style == "undefined") {
		x -= offset;
		y -= offset;
		size += offset * 2;

		context.clearRect(x - 1, y - 1, size + 2, size + 2);
	}
	else {
		context.beginPath();

		context.strokeStyle = style;
		context.fillStyle = style;
		context.lineWidth = 0;

		context.rect(x, y, size, size);
		//context.rect(x + 1, y + 1, size - 2, size - 2);
		context.fill();

		context.stroke();
	}
}

function drawEraser(state) {
	var ctx = appFC.baseContext;
	var size = appFC.lineWidth * 2;

	if (size < 10) size = 10;

	switch (state) {
		case DrawState.start:

			fcClearDrawingCanvas();

			// Draw Rect
			drawEraserRect(ctx, appFC.drawCurX, appFC.drawCurY, size, appFC.eraserStyle);
			break;

		case DrawState.move:
			// Eraser Rect
			drawEraserRect(ctx, appFC.drawLastX, appFC.drawLastY, size);
			// Draw Rect
			drawEraserRect(ctx, appFC.drawCurX, appFC.drawCurY, size, appFC.eraserStyle);
			break;

		case DrawState.end:
			// Eraser Rect
			drawEraserRect(ctx, appFC.drawCurX, appFC.drawCurY, size);
			break;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  line
///////////////////////////////////////////////////////////////////////////////////////////

function drawLine(state) {
	switch (state) {
		case DrawState.start:
			break;

		case DrawState.move:

			fcClearDrawingCanvas();

			var ctx = appFC.drawContext;

			ctx.strokeStyle = appFC.drawStyle;
			ctx.lineWidth = appFC.lineWidth;

			ctx.beginPath();
			ctx.moveTo(appFC.drawStartX, appFC.drawStartY);
			ctx.lineTo(appFC.drawCurX, appFC.drawCurY);
			ctx.stroke();

			break;

		case DrawState.end:
			break;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  rectangle line
///////////////////////////////////////////////////////////////////////////////////////////

function drawRectangleLine(state) {
	switch (state) {
		case DrawState.start:
			break;

		case DrawState.move:

			fcClearDrawingCanvas();

			var ctx = appFC.drawContext;
			var size;

			ctx.strokeStyle = appFC.drawStyle;
			ctx.lineWidth = appFC.lineWidth;

			size = baseDrawGetSize(appFC.drawStartX, appFC.drawStartY, appFC.drawCurX, appFC.drawCurY);

			ctx.beginPath();

			//ctx.rect(size.x, size.y, size.w, size.h);
			if (appFC.drawRegularShape) {
				ctx.rect(size.regularX, size.regularY, size.regularSide, size.regularSide);
			}
			else {
				ctx.rect(size.x, size.y, size.w, size.h);
			}

			ctx.stroke();

			break;

		case DrawState.end:
			break;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  rectangle
///////////////////////////////////////////////////////////////////////////////////////////

function drawRectangle(state) {
	switch (state) {
		case DrawState.start:
			break;

		case DrawState.move:

			fcClearDrawingCanvas();

			var ctx = appFC.drawContext;
			var size;

			ctx.fillStyle = appFC.drawStyle;
			ctx.strokeStyle = appFC.clearStyle;
			ctx.lineWidth = 0;

			size = baseDrawGetSize(appFC.drawStartX, appFC.drawStartY, appFC.drawCurX, appFC.drawCurY);

			if (appFC.drawRegularShape) {
				ctx.rect(size.regularX, size.regularY, size.regularSide, size.regularSide);
			}
			else {
				ctx.rect(size.x, size.y, size.w, size.h);
			}

			ctx.fill();

			break;

		case DrawState.end:
			break;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  circle line
///////////////////////////////////////////////////////////////////////////////////////////

function drawCircleLine(state) {
	switch (state) {
		case DrawState.start:
			break;

		case DrawState.move:

			var ctx = appFC.drawContext;
			var size;

			fcClearDrawingCanvas();

			ctx.strokeStyle = appFC.drawStyle;
			ctx.lineWidth = appFC.lineWidth;

			ctx.beginPath();

			if (appFC.drawRegularShape) {
				size = baseDrawGetSize(appFC.drawStartX, appFC.drawStartY, appFC.drawCurX, appFC.drawCurY);
				baseDrawEllipse(ctx, size.regularX, size.regularY, size.regularX + size.regularSide / 3 * 4, size.regularY + size.regularSide);
			}
			else {
				baseDrawEllipse(ctx, appFC.drawStartX, appFC.drawStartY, appFC.drawCurX, appFC.drawCurY);
			}

			ctx.closePath();

			ctx.stroke();

			break;

		case DrawState.end:
			break;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  circle
///////////////////////////////////////////////////////////////////////////////////////////

function drawCircle(state) {
	switch (state) {
		case DrawState.start:
			break;

		case DrawState.move:

			var ctx = appFC.drawContext;
			var size;

			fcClearDrawingCanvas();

			ctx.fillStyle = appFC.drawStyle;

			if (appFC.drawRegularShape) {
				size = baseDrawGetSize(appFC.drawStartX, appFC.drawStartY, appFC.drawCurX, appFC.drawCurY);
				baseDrawEllipse(ctx, size.regularX, size.regularY, size.regularX + size.regularSide / 3 * 4, size.regularY + size.regularSide);
			}
			else {
				baseDrawEllipse(ctx, appFC.drawStartX, appFC.drawStartY, appFC.drawCurX, appFC.drawCurY);
			}

			ctx.fill();

			break;

		case DrawState.end:
			break;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
//  text
///////////////////////////////////////////////////////////////////////////////////////////

function drawText(state) {
	switch (state) {
		case DrawState.start:
			if (false == appFC.drawText) {
				fcToogleDlg("textInputDlg", textInputDlgOpen, null);
				//fcToogleDlg("textInputDlg", textInputDlgOpen, textInputDlgClose);
			}
			break;

		case DrawState.move:
			break;

		case DrawState.end:
			if (false == appFC.drawText) {
				if (getTextInputLength()) {
					fcCanvasCtrl(DrawState.end);
				}
			}
			break;
	}
}

function textInputDlgOpen() {
	updateTextInputCfg();
	resetTextInputContent();

	appFC.drawFontStyle = appFC.drawStyle;

	appFC.drawing = false;

	appFC.drawText = true;

	showTextInputDlg(true);
}

function textInputDlgClose() {
	showTextInputDlg(false);

	fcClearDrawingCanvas();

	//baseDrawText();

	appFC.drawText = false;

	if (appFC.fnDraw)
		appFC.fnDraw(DrawState.end);
}

function textInputDlgCloseClick() {
	//fcCloseActiveDlg();
	showTextInputDlg(false);

	fcClearDrawingCanvas();

	baseDrawText();

	appFC.drawText = false;

	if (appFC.fnDraw)
		appFC.fnDraw(DrawState.end);
}

function baseDrawText() {
	if (0 == getTextInputLength()) return;

	const startX = appFC.drawStartX;
	const startY = appFC.drawStartY;
	const textH = appFC.fontSize;
	const ctx = appFC.drawContext;
	const content = getTextInputContent();
	let fontStyle = '';

	if (appFC.fontBold) fontStyle += 'Bold ';
	if (appFC.fontItalic) fontStyle += 'Italic ';

	ctx.fillStyle = appFC.drawFontStyle;
	ctx.strokeStyle = appFC.drawStyle;
	ctx.font = fontStyle + textH + 'pt' + ' ' + appFC.fontFamily;

	const lines = content.split('\n');
	const lineHeight = textH * 1.5;

	lines.forEach((line, index) => {
		ctx.fillText(line, startX, startY + index * lineHeight);
	});
}

///////////////////////////////////////////////////////////////////////////////////////////
// Scan mode config
///////////////////////////////////////////////////////////////////////////////////////////
var IsTransform = false;
var isFullcrop = false;

var testCnt = 0;

async function scanToolBarOnClick(event) {
	var mc = previewModeCfg;

	switch (event.target.id) {
		case "scbtn_importPic":
			displayPictureWinClose(false);
			removeCropBox();
			lsSelectFilesDlg();
			break;

		case "scbtn_fullcrop":

			if (isFullcrop)
				attachCropBox(dispW, dispH, true);
			else
				attachCropBoxFull(dispW, dispH);

			isFullcrop = !isFullcrop;
			break;

		case 'scbtn_transform':
			//if( $("#cropBox").length == 0 || IsDeviceConnected == false)
			if ($("#cropBox").length == 0)
				return;

			// if(IsDeviceConnected == false)
			// {
			// 	console.log("IsDeviceConnected");
			// 	if ( mc.imageProcess ) 
			// 	{
			// 		fcCanvasCtrl(DrawState.end);
			// 		mc.imageProcess();
			// 	}
			// }

			Perspective_ScanMode();

			removeCropBox();

			fcResetCanvasArray(mc);

			showToolBar(appFC.curMode.lS1ToolBar, false);
			showToolBar(appFC.curMode.rToolBar, true);
			showToolBar(appFC.curMode.bToolBar, true);
			showToolBar(appFC.curMode.lS2ToolBar, true);

			IsTransform = true;


			// fcClearCanvas(mc.drawingCanvas);
			// fcPushDrawingCanvas(mc);
			// if ( mc.imageProcess )
			// 	mc.imageProcess();

			break;

		case "scbtn_preview":
			back2ScanModePreview();
			break;

		case "scbtn_mirrow":
			mc.mirror = !mc.mirror;
			fcCanvasCtrl(DrawState.mirror);
			break;

		case "scbtn_flip":
			mc.flip = !mc.flip;
			fcCanvasCtrl(DrawState.flip);
			break;

		case "scbtn_config":
			fcCloseActiveDlg();
			//fcToogleDlg("btn_config", configDlgOpen, configDlgClose);
			$("#configDlg").toggle(500);
			break;

		case "scbtn_setting":
			fcToogleDlg("btn_setting", previewSettingDlgOpen, previewSettingDlgClose);
			break;

		case "scbtn_ocr":
			OCR_scan();
			break;

		case "scbtn_saveDisk":
			showSaveHit();
			fcSaveCanvasToFile(mc['combineCanvas']);
			break;

		case "scbtn_redo":
		case "scbtn_redo2":
			fcCanvasCtrl(DrawState.redo);
			break;

		case "scbtn_undo":
			//console.log(mc.canvasStep + "/" + mc.canvasArray.length);		
			fcCanvasCtrl(DrawState.undo);
			break;
		case "scbtn_undo2":
			//console.log(mc.canvasStep + "/" + mc.canvasArray.length);

			if (mc.canvasStep == 1)
				return;
			fcCanvasCtrl(DrawState.undo);
			break;
	}

	// if (mc.mirror && mc.flip)
	// 	$("#displayCanvas").css("transform", "scale(-1,-1)");
	// else if (!mc.mirror && mc.flip)
	// 	$("#displayCanvas").css("transform", "scale(1,-1)");
	// else if (mc.mirror && !mc.flip)
	// 	$("#displayCanvas").css("transform", "scale(-1,1)");
	// else if (!mc.mirror && !mc.flip)
	// 	$("#displayCanvas").css("transform", "scale(1,1)");

	toolBarOnMouseClick(event);
}

function back2ScanModePreview() {
	var mc = previewModeCfg;
	mc.freeze = false;

	removeCropBox();
	fcResetCanvasArray(mc);

	fcClearCanvas(document.getElementById("previewArea-combineCanvas"));
	fcClearDrawingCanvas();
	fcClearDispCanvas();
	//fcPushDrawingCanvas(mc);
	if (mc.imageProcess) mc.imageProcess();

	if (isFullcrop)
		attachCropBoxFull(dispW, dispH);
	else
		attachCropBox(dispW, dispH);

	showToolBar(appFC.curMode.lS2ToolBar, false);
	showToolBar(appFC.curMode.rToolBar, false);
	showToolBar(appFC.curMode.bToolBar, false);
	showToolBar(appFC.curMode.lS1ToolBar, true);

	toolBarSetAllElementState("scanToolBarS2", 0);

	mc.mirror = false;
	mc.flip = false;
	IsTransform = false;
}

var arrMultiscanData = [];

function cloneCanvas(oldCanvas) {

	//create a new canvas
	var newCanvas = document.createElement('canvas');
	var context = newCanvas.getContext('2d');

	//set dimensions
	newCanvas.width = oldCanvas.width;
	newCanvas.height = oldCanvas.height;

	//apply the old canvas to the new one
	context.drawImage(oldCanvas, 0, 0);

	//return the new canvas
	return newCanvas;
}

function showMergeDailog(event = null) {
	$("#dialogSave").dialog({
		dialogClass: "no-close",
		autoOpen: false,
		width: 250,
		height: 80,
		show: {
			effect: "fade",
			duration: 500
		},
		hide: {
			effect: "fade",
			duration: 500
		},
		buttons: {
			"JPG": function () {
				$(this).dialog("close");
				fcSaveCanvasToFileExt(arrMultiscanData);
				arrMultiscanData = [];
				if (event) modeToolBarOnClick(event);
				HideMultiScanCnt();
			},
			"PDF": function () {
				$(this).dialog("close");
				fcSaveCanvasToPdfExt(arrMultiscanData);
				arrMultiscanData = [];
				if (event) modeToolBarOnClick(event);
				HideMultiScanCnt();
			},
			"X": function () { $(this).dialog("close"); }
		},
		close: function (event, ui) {
			$(this).dialog("destroy");
		}
	});
	$("#dialogSave").html("");
	$("#dialogSave").dialog("open");
}

function showMergeHitDialog() {
	$("#dialogSave").dialog({
		dialogClass: "no-close",
		title: "!",
		autoOpen: false,
		width: 250,
		height: 100,
		show: {
			effect: "fade",
			duration: 500
		},
		hide: {
			effect: "fade",
			duration: 500
		},
		buttons: {
			"OK": function () {
				$(this).dialog("close");
			}
		},
		close: function (event, ui) {
			$(this).dialog("destroy");
		}
	});
	$("#dialogSave").html("<br>Please take pictures first.");
	$("#dialogSave").dialog("open");
}

function CreateMultiScanCnt() {
	createLabelElement("uiArea", "lbMsCnt");

	$('#lbMsCnt').addClass('MultiScanCnt');
	$("#lbMsCnt").css({ top: winH - 80, left: (winW / 2), position: 'absolute' });
}

function ShowMultiScanCnt(text = "") {
	$('#lbMsCnt').text(text);
	$('#lbMsCnt').show();
	$('#mscbtn_cancel').show();
}
function HideMultiScanCnt() {
	$('#lbMsCnt').hide();
	$('#mscbtn_cancel').hide();
}

function multiscanToolBarOnClick(event) {
	var mc = previewModeCfg;

	switch (event.target.id) {
		case "mscbtn_capture":

			if ($("#cropBox").length == 0 || IsDeviceConnected == false)
				return;

			if ($('#dialogSave').is(":visible")) {
				$("#dialogSave").dialog("close");
			}

			var canvas = Perspective_MultiScanMode();
			arrMultiscanData.push(cloneCanvas(canvas));

			if ($('#lbMsCnt').length == 0) {
				CreateMultiScanCnt();
			}

			ShowMultiScanCnt(arrMultiscanData.length);

			if (mc.imageProcess) mc.imageProcess();
			break;

		case "mscbtn_merge":
			if (arrMultiscanData.length == 0) {
				showMergeHitDialog();
				return;
			}
			showMergeDailog();
			break;

		case "mscbtn_cancel":
			if (arrMultiscanData.length) {
				$("#dialogSave").dialog({
					title: "!",
					dialogClass: "no-close",
					autoOpen: false,
					width: 250,
					height: 100,
					show: {
						effect: "fade",
						duration: 500
					},
					buttons: {
						"No": function () {
							$(this).dialog("close");
						},
						"Yes": function () {
							arrMultiscanData = [];
							HideMultiScanCnt();
							$(this).dialog("close");
						}
					},
					close: function (event, ui) {
						$(this).dialog("destroy");
					}
				});
				$("#dialogSave").html("<br/>Discard captured images?<br/> ");
				$("#dialogSave").dialog("open");
				return;
			}
			break;

		case "mscbtn_fullcrop":

			if (isFullcrop)
				attachCropBox(dispW, dispH, true);
			else
				attachCropBoxFull(dispW, dispH);

			isFullcrop = !isFullcrop;
			break;
	}

	if (mc.mirror && mc.flip)
		$("#displayCanvas").css("transform", "scale(-1,-1)");
	else if (!mc.mirror && mc.flip)
		$("#displayCanvas").css("transform", "scale(1,-1)");
	else if (mc.mirror && !mc.flip)
		$("#displayCanvas").css("transform", "scale(-1,1)");
	else if (!mc.mirror && !mc.flip)
		$("#displayCanvas").css("transform", "scale(1,1)");

	toolBarOnMouseClick(event);
}


///////////////////////////////////////////////////////////////////////////////////////////
// mode config
///////////////////////////////////////////////////////////////////////////////////////////

var previewModeCfg =
{
	baseId: 'previewArea',

	lToolBar: 'previewToolBar',
	lS1ToolBar: 'scanToolBarS1',
	lS2ToolBar: 'scanToolBarS2',
	lMsToolBar: 'multiscanToolBar',
	rToolBar: 'drawingToolBar',
	bToolBar: 'drawingCfgArea',

	taskCtrl: previewModeTaskCtrl,
	start: previewModeStart,
	init: previewModeInit,
	onResize: previewModeOnResize,
	canvasCtrl: previewCanvasControl,
	imageProcess: previewImageProcess,
	chgBaseImgCtrl: previewChangeBaseImageCtrl,

	imgW: appCfg.defPreviewRsoX,
	imgH: appCfg.defPreviewRsoY,

	freeze: false,

	hasTempDraw: false,
	mergeTempDraw: false,

	reqUndo: false,
	reqRedo: false,

	flip: false,
	mirror: false,

	zoomRatio: 1,
	zoomX: 0,
	zoomY: 0,
	zoomW: appCfg.defPreviewRsoX,
	zoomH: appCfg.defPreviewRsoY,

	panWinW: 0,
	panWinH: 0,

	zoomScrollBarPos: 0,
};


///////////////////////////////////////////////////////////////////////////////////////////
// flow control
///////////////////////////////////////////////////////////////////////////////////////////

function previewModeTaskCtrl(isEnter) {
	var mc = previewModeCfg;

	if (isEnter) {
		mc.panMove = false;

		if (appFC.capturePeriodRun) showPeriodicCaptureInfoBar(true);

		//ScrollBarDlgSetPos('zoomDlg', mc.zoomScrollBarPos);

		if (mc.zoomRatio > 1) fcShowPanWin(true);
	}
	else {
		displayPictureWinClose(false);
		showPeriodicCaptureInfoBar(false);
		fcShowPanWin(false);
	}
}

function previewModeStart() {
	//previewCheckReqVideoResolution();

	previewModeOnResize();
}

function previewModeInit() {
	var mc = previewModeCfg;

	videoW = mc.imgW = appFC.reqImgW;
	videoH = mc.imgH = appFC.reqImgH;
	resetCanvasGroupSize(mc, videoW, videoH);

	getCanvasGroupContext(mc);

	fcInitCanvasArray(mc);

	fcInitCropWinEvent();

	fcShowPanWin(false);

	fcShowMode(mc, false);
}

function previewModeOnResize() {
	if (previewModeCfg.freeze) fcUpdateImage();

	if ((IsScanMode || IsMultiscanMode) && !IsTransform) {
		removeCropBox();
		attachCropBox(dispW, dispH);
	}

	fcUpdatePanWin();
	fcUpdateCropWin();

	resizePeriodicCaptureInfoBar();
}


///////////////////////////////////////////////////////////////////////////////////////////
// tool bar
///////////////////////////////////////////////////////////////////////////////////////////

var recordStatus = 0;

async function listFiles(directoryHandle) {
	const files = [];
	for await (const entry of directoryHandle.values()) {
		if (entry.kind === "file") {
			files.push(entry);
		} else if (entry.kind === "directory") {
			const subDirectoryHandle = await directoryHandle.getDirectory(entry.name);
			const subFiles = await listFiles(subDirectoryHandle);
			files.push(...subFiles);
		}
	}
	return files;
}

async function previewToolBarOnClick(event) {
	var mc = previewModeCfg;

	switch (event.target.id) {
		case 'btn_freeze':
			mc.freeze = !mc.freeze;
			break;

		case "btn_undo":
			fcCanvasCtrl(DrawState.undo);
			break;

		case "btn_redo":
			fcCanvasCtrl(DrawState.redo);
			break;

		case "btn_mirrow":
			mc.mirror = !mc.mirror;
			mc.zoomX = mc.imgW - mc.zoomX - mc.zoomW;
			fcUpdateCropWin();
			fcCanvasCtrl(DrawState.mirror);
			break;

		case "btn_flip":
			mc.flip = !mc.flip;
			mc.zoomY = mc.imgH - mc.zoomY - mc.zoomH;
			fcUpdateCropWin();
			fcCanvasCtrl(DrawState.flip);
			break;

		case "btn_config":
			//fcCloseActiveDlg();
			//fcToogleDlg("btn_config", configDlgOpen, configDlgClose);
			$("#configDlg").toggle(500);
			break;

		case "btn_brightness":
			fcToogleDlg("btn_brightness", previewBrightnessDlgOpen, previewBrightnessDlgClose);
			break;

		case "btn_whitebalance":
			fcToogleDlg("btn_whitebalance", previewWhiteBalanceDlgOpen, previewWhiteBalanceDlgClose);
			break;

		case "btn_zoom":
			$("#configDlg").hide();
			$("#zoomDlg").toggle(500);
			//fcToogleDlg("btn_zoom", fcZoomDlgOpen, fcZoomDlgClose);
			break;

		case "btn_setting":
			//testDeviceAvailability(CurrentVideoDevice); break;
			fcToogleDlg("btn_setting", previewSettingDlgOpen, previewSettingDlgClose);
			break;

		case "btn_capture":
			//LogDeviceList(); break;
			if (typeof window.stream == "undefined" ||
				!window.stream.active ||
				!IsDeviceConnected)
				break;
			fcSaveCanvasToFile(mc['combineCanvas']);

			showCaptureHit();

			// if ( $('#captureHit').css("display") == "none")
			// {
			// 	$("#captureHit").css({
			// 		position: "absolute",
			// 		top: '60px',
			// 		left:((winW/2)-20)+'px'});  
			// 	$("#captureHit").show(100).delay(1500).hide(300);
			// }			
			break;

		case "btn_timesave":
			if (typeof window.stream == "undefined" ||
				!window.stream.active ||
				!IsDeviceConnected)
				break;
			if (false == appFC.capturePeriodRun) {
				fcToogleDlg("btn_timesave", previewPeriodicCaptureDlgOpen, previewPeriodicCaptureDlgClose);
			}
			break;

		case "btn_importPic":
			lsSelectFilesDlg();
			break;

		case "btn_record":
			if (typeof window.stream == "undefined" ||
				!window.stream.active ||
				!IsDeviceConnected) {
				console.log("window.stream", window.stream);
				console.log("IsDeviceConnected", IsDeviceConnected);
				break;
			}

			if ($('#dialogSave').hasClass('ui-dialog-content') &&
				$('#dialogSave').dialog('isOpen') === true)
				$("#dialogSave").dialog("close");

			if (appFC.capturePeriodRun) {
				stopPeriodicCapture();
			}

			fcResetCanvasArray(mc);

			if (mc.flip || mc.mirror) {
				mc.flip = false;
				mc.mirror = false;

				fcUpdateCropWin();
				fcCanvasCtrl(DrawState.flip);
				fcCanvasCtrl(DrawState.mirror);

				toolBarSetElementState('previewToolBar', "btn_flip", 0);
				toolBarSetElementState('previewToolBar', "btn_mirrow", 0);
			}

			if (mc.zoomRatio > 1) {
				fcResetZoomRatio();
			}

			if (mc.freeze) {
				mc.freeze = false;
				toolBarSetElementState('previewToolBar', "btn_freeze", 0);
			}

			if (IsRecording) {
				StopRecord();
			}
			else {
				StartRecord();
			}
			break;

		case "btn_pause":
			if (IsRecording) {
				if (IsPause) {
					recordingTimeBlinkStop();
					ResumeRecord();
				}
				else {
					recordingTimeBlinkStart();
					PauseRecord();
				}
			}
			break;

		case 'btn_test':
			chrome.windows.getCurrent(function (data) {
				console.log(data);
				chrome.windows.update(data.id, { state: "minimized" });
			});
			break;

	}

	toolBarOnMouseClick(event);
}

var timerID = null;
var totalSec = 0;

function showCaptureHit() {
	$("#captureHit").css({
		position: "absolute",
		top: '60px',
		left: ((winW / 2) - 20) + 'px'
	});
	$("#captureHit").show(100);

	totalSec = 1500;

	if (timerID == null)
		timerID = setInterval(captureHitInterval, 500);
}

function hideCaptureHit() {
	$("#captureHit").hide();
}

function captureHitInterval() {
	totalSec -= 500;
	if (totalSec <= 0) {
		$("#captureHit").hide(150);
		clearInterval(timerID);
		timerID = null;
	}
}


function showSaveHit() {
	$("#SaveHit").css({
		position: "absolute",
		top: '60px',
		left: ((winW / 2) - 20) + 'px'
	});
	$("#SaveHit").show(100);

	totalSec = 1500;

	if (timerID == null)
		timerID = setInterval(saveHitInterval, 500);
}

function hideSaveHit() {
	$("#SaveHit").hide();
}

function saveHitInterval() {
	totalSec -= 500;
	if (totalSec <= 0) {
		$("#SaveHit").hide(150);
		clearInterval(timerID);
		timerID = null;
	}
}

var blinkId;
function blink_text() {
	$('#recordtime').fadeOut(500);
	$('#recordtime').fadeIn(500);
}

function recordingTimeBlinkStart() {
	blinkId = setInterval(blink_text, 2000);
}

function recordingTimeBlinkStop() {
	clearInterval(blinkId);
}

///////////////////////////////////////////////////////////////////////////////////////////
// canvas
///////////////////////////////////////////////////////////////////////////////////////////

function previewOverlayCanvas(dstContext, srcCanvas) {
	var mc = previewModeCfg;

	dstContext.drawImage(srcCanvas, 0, 0, mc.imgW, mc.imgH);
}

function previewUpdateFrameRate() {
	var i;
	var sum;

	if (false == appFC.frameRateInit) {
		appFC.frameRateInit = true;

		appFC.frameLastTime = new Date();

		appFC.frameSlotIdx = appFC.frameCnt;

		for (i = 0; i < appFC.frameCnt; i++) {
			appFC.frameInterval[i] = 0;
		}

		return;
	}

	var curTime = new Date();
	var msDiff = curTime - appFC.frameLastTime;
	var idx = appFC.frameSlotIdx % appFC.frameCnt;

	appFC.frameLastTime = curTime;
	appFC.frameInterval[idx] = msDiff;

	sum = 0;
	for (i = 0; i < appFC.frameCnt; i++) {
		sum = sum + appFC.frameInterval[i];
	}

	appFC.frameRate = appFC.frameCnt * 1000 / sum;

	appFC.frameRate = appFC.frameRate.toFixed(2);

	if (0 == idx) fcUpdateSysInfoData();

	appFC.frameSlotIdx = idx + 1;
}

var colorMatrix =
	['1', '0', '0', '0', '0'
		, '0', '1', '0', '0', '0'
		, '0', '0', '1', '0', '0'
		, '0', '0', '0', '1', '0'];


var backupFrame = document.createElement("canvas");
var lastFreezeStatus = false;

function previewVideoStreamUpdate(videoCanvas) {
	var mc = previewModeCfg;

	if (mc.freeze && !lastFreezeStatus) {
		backupFrame.width = previewModeCfg.imgW;
		backupFrame.height = previewModeCfg.imgH;

		var ctx = backupFrame.getContext('2d');
		ctx.drawImage(videoCanvas, 0, 0);
	}

	lastFreezeStatus = mc.freeze;

	previewUpdateFrameRate();

	if (mc.freeze && IsScanMode) return;

	// r = [0], g = [6], b = [12], a = [18]
	colorMatrix[0] = 1 + appFC.previewBrightnessAdj / 100 + appFC.previewWhiteBalanceAdj / 100;
	colorMatrix[6] = 1 + appFC.previewBrightnessAdj / 100;
	colorMatrix[12] = 1 + appFC.previewBrightnessAdj / 100 - appFC.previewWhiteBalanceAdj / 100;

	var filterStr = '';
	var filter = document.querySelector('#filter feColorMatrix');
	if (filter != null) {
		colorMatrix.forEach(item => filterStr += item + ' ');
		//var redToBlue = '0 0 1 0 0  0 0.55 0 0 0  1 0 0 0 0  0 0 0 1 0 ';		
		filter.setAttribute('values', filterStr);
		mc.baseImageContext.filter = 'url(#filter)';
	}

	//console.log("Window W,H", winW, winH);
	if (mc.freeze) {
		previewOverlayCanvas(mc.baseImageContext, backupFrame);
	}
	else {
		previewOverlayCanvas(mc.baseImageContext, videoCanvas);

		//let mc = previewModeCfg;
		// let srcX, srcY, srcW, srcH;
		// const dispWHR = dispW / dispH;
		// const srcWHR = mc.imgW / mc.imgH

		// if (dispWHR > srcWHR) {
		// 	// crop top and bottom
		// 	srcX = 0;
		// 	srcW = mc.imgW;
		// 	srcH = mc.imgW / dispWHR;
		// 	srcY = (mc.imgH - srcH) / 2;
		// } else {
		// 	// crop left and right
		// 	srcY = 0;
		// 	srcH = mc.imgH;
		// 	srcW = mc.imgH * dispWHR;
		// 	srcX = (mc.imgW - srcW) / 2;
		// }

		// mc.baseImageContext.drawImage(videoCanvas, srcX, srcY, srcW, srcH, 0, 0, dispX, dispY);

		//console.log(mc.imgW, mc.imgH);
		//mc.baseImageContext.drawImage(videoCanvas, 0, 0, mc.imgW, mc.imgH);
	}

	previewImageProcess();
}

var lastPreviewRotate = 0;

function previewImageProcess() {
	var mc = previewModeCfg;
	var ctx = mc.imageProcessContext;

	// brightness caibass
	// if ( appFC.previewBrightnessAdj != 0 || appFC.previewWhiteBalanceAdj != 0 )
	// {
	// 	var vv = document.getElementById('videoSrc');
	// 	vv.style.setProperty('filter', "brightness(" + appFC.previewBrightnessAdj + "%)");
	// 	vv.style.setProperty('filter', "hue-rotate(" + appFC.previewWhiteBalanceAdj + "deg)");
	// }

	// if ( appFC.previewBrightnessAdj != 0 || appFC.previewWhiteBalanceAdj != 0 )
	// {
	// 	var pixels = mc.baseImageContext.getImageData(0, 0, mc.imgW, mc.imgH);
	// 	var d = pixels.data;
	// 	var adj = appFC.previewBrightnessAdj;
	// 	var adjWb = appFC.previewWhiteBalanceAdj;

	// 	for ( var i=0; i<d.length; i+=4 )
	// 	{
	// 		d[i] += adj + adjWb;
	// 		d[i+1] += adj;
	// 		d[i+2] += adj - adjWb;
	// 	}

	// 	mc.baseImageContext.putImageData(pixels, 0, 0);
	// }

	// flip & mirror
	var scaleX = 1;
	var scaleY = 1;
	var offsetX = 0;
	var offsetY = 0;

	// scan mode use 
	// DisplayCanvas => transform: scale(1, 1)
	//if (!IsScanMode)
	if (true) {
		if (mc.mirror) {
			scaleX = -1;
			offsetX = mc.imgW;
		}

		if (mc.flip) {
			scaleY = -1;
			offsetY = mc.imgH;
		}
	}

	// rotate
	if (appFC.previewRotate == 0) {
		ctx.save();
		ctx.translate(offsetX, offsetY);
		ctx.scale(scaleX, scaleY);
		previewOverlayCanvas(mc.imageProcessContext, mc.baseImageCanvas);
		ctx.restore();
		lastPreviewRotate = 0;
	}
	else {
		if (appFC.previewRotate != lastPreviewRotate) {
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, mc.imgW, mc.imgH);
			//ctx.clearRect(0, 0, mc.imgW, mc.imgH);
		}

		ctx.save();
		ctx.translate(mc.imgW / 2, mc.imgH / 2);
		ctx.rotate((Math.PI / 180) * appFC.previewRotate);
		ctx.scale(scaleX, scaleY)
		ctx.drawImage(mc.baseImageCanvas, -mc.imgW / 2, -mc.imgH / 2, mc.imgW, mc.imgH);
		ctx.restore();

		lastPreviewRotate = appFC.previewRotate;
	}

	// next step
	previewRedoUndo();
}

function previewRedoUndo() {
	var mc = previewModeCfg;

	if (mc.reqUndo) {
		mc.reqUndo = false;
		fcDrawingUndo(mc);
	} else if (mc.reqRedo) {
		mc.reqRedo = false;
		fcDrawingRedo(mc);
	} else {
		previewMergeDrawing();
	}
}

function previewMergeDrawing() {
	var mc = previewModeCfg;

	if (mc.zoomRatio == 1) {
		previewOverlayCanvas(mc.combineContext, mc.imageProcessCanvas);
	}
	else {
		mc.combineContext.drawImage(mc.imageProcessCanvas, mc.zoomX, mc.zoomY, mc.zoomW, mc.zoomH, 0, 0, mc.imgW, mc.imgH);
	}

	if (1 === appCfg.disableDrawingCanvasOverlay) {
		previewDisplay();

		return;
	}

	if (mc.mergeTempDraw) {
		mc.mergeTempDraw = false;

		//previewOverlayCanvas(mc.drawingContext, mc.tempDrawingCanvas);

		// ******
		// const windowX = window.screenX || window.screenLeft;
		// const windowY = window.screenY || window.screenTop;
		// const windowWidth = window.innerWidth;
		// const windowHeight = window.innerHeight;
		mc.drawingContext.drawImage(
			mc.tempDrawingCanvas,
			0, 0, mc.imgW, mc.imgH,
			0, 0, mc.imgW, mc.imgH
		);

		fcPushDrawingCanvas(mc);
	}

	//previewOverlayCanvas(mc.combineContext, mc.drawingCanvas);

	mc.combineContext.drawImage(
		mc.drawingCanvas,
		0, 0, mc.imgW, mc.imgH,
		0, 0, mc.imgW, mc.imgH
	);

	previewMergeTempDrawing();
}

function previewMergeTempDrawing() {
	var mc = previewModeCfg;

	if (mc.hasTempDraw) {
		//previewOverlayCanvas(mc.combineContext, mc.tempDrawingCanvas);

		mc.combineContext.drawImage(
			mc.tempDrawingCanvas,
			0, 0, mc.imgW, mc.imgH,
			0, 0, mc.imgW, mc.imgH
		);
	}

	previewDisplay();
}

function previewDisplay() {
	var mc = previewModeCfg;

	if (fcIsModeActive(mc)) {
		fcUpdateImage();
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// canvas control
///////////////////////////////////////////////////////////////////////////////////////////

function previewCanvasControl(state) {
	var mc = previewModeCfg;

	switch (state) {
		case DrawState.start:
			return false;
			break;

		case DrawState.move:
			mc.hasTempDraw = true;
			break;

		case DrawState.end:
			if (false == appFC.drawText) {
				mc.hasTempDraw = false;
				mc.mergeTempDraw = true;
			}
			break;

		case DrawState.undo:
			if (mc.canvasStep > 0) {
				mc.reqUndo = true;
			}
			break;

		case DrawState.redo:
			if (mc.canvasStep < (mc.canvasArray.length - 1)) {
				mc.reqRedo = true;
			}
			break;
	}

	if (mc.freeze) return false;

	return true;
}

///////////////////////////////////////////////////////////////////////////////////////////
// configDlg
///////////////////////////////////////////////////////////////////////////////////////////

function configDlgOpen() {
	showConfigDlg(true);
}

function configDlgClose() {
	showConfigDlg(false);
}

///////////////////////////////////////////////////////////////////////////////////////////
// brightness
///////////////////////////////////////////////////////////////////////////////////////////

function previewBrightnessDlgOpen() {
	showBrightnessDlg(true);
}

function previewBrightnessDlgClose() {
	showBrightnessDlg(false);
}

///////////////////////////////////////////////////////////////////////////////////////////
// white balance
///////////////////////////////////////////////////////////////////////////////////////////

function previewWhiteBalanceDlgOpen() {
	showWhiteBalanceDlg(true);
}

function previewWhiteBalanceDlgClose() {
	showWhiteBalanceDlg(false);
}

///////////////////////////////////////////////////////////////////////////////////////////
// setting dialog
///////////////////////////////////////////////////////////////////////////////////////////

function previewSettingDlgOpen() {
	showSettingDlg(true);
}

function previewSettingDlgClose() {
	showSettingDlg(false);

	fcUpdateFontCfg();

	checkVideoSource();

	//previewCheckReqVideoResolution();

	updateTranslatedString();
}

function previewSetttingDlgCloseClick() {
	fcCloseActiveDlg();
}

function previewCheckReqVideoResolution() {
	const eleId = document.getElementById('sdVideoRsoScrollbar');
	const idx = eleId.selectedIndex;

	appFC.reqImgW = appFC.curVideoResolutionList[idx][VrField.w];
	appFC.reqImgH = appFC.curVideoResolutionList[idx][VrField.h];

	// if ((appFC.reqImgW != appFC.imgW) || (appFC.reqImgH != appFC.imgH)) {
	// 	//alert("ChangeImageSize " + appFC.reqImgW + ", " + appFC.reqImgH);

	// 	fcChangeBaseImageSize(appFC.reqImgW, appFC.reqImgH);
	// 	fcUpdateSelVideoResolutionIdx(idx);
	// }
}

///////////////////////////////////////////////////////////////////////////////////////////
// video resolution change control
///////////////////////////////////////////////////////////////////////////////////////////

async function previewChangeBaseImageCtrl(state, w, h) {
	var mc = previewModeCfg;

	switch (state) {
		case BaseImgChg.before:

			mc.zoomRatio = 1;
			fcShowPanWin(false);
			//ScrollBarDlgSetPos('zoomDlg', 0);

			mc.freeze = false;
			toolBarSetElementState('previewToolBar', "btn_freeze", 0);

			//disconnectVideoSrc();
			await stopVideo();

			videoW = mc.imgW = w;
			videoH = mc.imgH = h;

			break;

		case BaseImgChg.after:

			//connectVideoSrc();
			await startVideo();
			break;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// periodic capture
///////////////////////////////////////////////////////////////////////////////////////////

function previewPeriodicCaptureDlgClickClose() {
	fcCloseActiveDlg();
}

function previewPeriodicCaptureDlgClose() {
	showPeriodicCaptureDlg(false);
}

function previewPeriodicCaptureDlgOpen() {
	showPeriodicCaptureDlg(true);
}

var frameLimit = false;

function previewPeriodicCaptureRun() {
	var totalFrame;

	fcCloseActiveDlg();

	appFC.capturePeriodSec = periodicCaptureDlgPeriod();
	appFC.captureIntervalHour = periodicCaptureDlgInterval();

	if (appFC.capturePeriodSec < 1) return;

	totalFrame = appFC.captureIntervalHour * 60 / appFC.capturePeriodSec;
	totalFrame = Math.floor(totalFrame);

	// total frame limit
	// if ( totalFrame > 500)
	// {
	// 	if ( frameLimit == false )
	// 	{
	// 		$("#dialogSave").dialog({
	// 			title: "!",
	// 			dialogClass: "no-close",
	// 			autoOpen: false,
	// 			width: 250,
	// 			height: 100,
	// 			show: {
	// 				effect: "fade",
	// 				duration: 500
	// 			},
	// 			buttons: { 
	// 				"No": function(){
	// 					$(this).dialog("close");
	// 				},
	// 				"Yes": function(){
	// 					$(this).dialog("close");

	// 					frameLimit = true;

	// 					setTimeout(function() {
	// 						previewPeriodicCaptureRun();
	// 					}, 500);

	// 				}						
	// 			}
	// 		});
	// 		$("#dialogSave").html("<br/>Up to 500 shots<br/> Do you want to continue?" );
	// 		$("#dialogSave").dialog( "open" );
	// 		return;
	// 	}
	// 	else
	// 	{
	// 		frameLimit = false;
	// 		totalFrame = 500;
	// 	}		
	// }

	appFC.capturePeriodTotalCnt = totalFrame;

	if (appFC.capturePeriodTotalCnt) {
		appFC.capturePeriodRun = true;

		appFC.capturePeriodCurCnt = 0;

		appFC.capturePeriodMs = appFC.capturePeriodSec * 1000;

		previewPeriodicCaptureSnap();

		showPeriodicCaptureInfoBar(true);
	}
}

var PCCanvas = null;

function previewPeriodicCaptureSnap() {
	var mc = previewModeCfg;

	if (PCCanvas == null) {
		PCCanvas = document.createElement('canvas');
	}

	if (appFC.capturePeriodCurCnt >= appFC.capturePeriodTotalCnt) {
		appFC.capturePeriodRun = false;

		showPeriodicCaptureInfoBar(false);

		return;
	}

	if (false == appFC.capturePeriodRun) return;

	var result = false;

	// Down Scale
	// up to 2592*1944 or 2560*1920	
	// if (appFC.imgW > 2600)
	// {
	// 	PCCanvas.width = mc['combineCanvas'].width / 2;
	// 	PCCanvas.height = mc['combineCanvas'].height / 2;
	// 	var ctx = PCCanvas.getContext('2d');
	// 	ctx.drawImage(mc['combineCanvas'], 0,0, PCCanvas.width, PCCanvas.height);
	// 	result = fcSaveCanvasToFile(PCCanvas);
	// }
	// else
	// {
	// 	result = fcSaveCanvasToFile(mc['combineCanvas']);
	// }

	result = fcSaveCanvasToFile(mc['combineCanvas']);

	//if ( fcSaveCanvasToFile(PCCanvas) )
	//if ( fcSaveCanvasToFile(mc['combineCanvas']) )
	if (result) {
		appFC.capturePeriodCurCnt += 1;

		updatePeriodicCaptureInfoBar();

		if (appFC.capturePeriodCurCnt >= appFC.capturePeriodTotalCnt) {
			appFC.capturePeriodMs = 1000;
		}
	}

	setTimeout(function () {
		previewPeriodicCaptureSnap();
	},
		appFC.capturePeriodMs);
}

///////////////////////////////////////////////////////////////////////////////////////////
// constant
///////////////////////////////////////////////////////////////////////////////////////////

if (typeof PlbToolBarType == "undefined") {
	var PlbToolBarType = {};
	PlbToolBarType.thumbnail = 0;
	PlbToolBarType.image = 1;
}


///////////////////////////////////////////////////////////////////////////////////////////
// mode config
///////////////////////////////////////////////////////////////////////////////////////////

var playbackModeCfg =
{
	baseId: 'playbackArea',

	lToolBar: 'thumbnailToolBar',
	rToolBar: 'playbackRToolBar',
	bToolBar: 'playbackInfoBar',

	taskCtrl: playbackModeTaskCtrl,
	start: playbackModeStart,
	init: playbackModeInit,
	onResize: playbackModeOnResize,
	canvasCtrl: playbackCanvasControl,
	imageProcess: playbackImageProcess,
	chgBaseImgCtrl: playbackChangeBaseImageCtrl,

	imgW: appCfg.defPictureW,
	imgH: appCfg.defPictureH,

	curImage: 0,

	curMode: PlbToolBarType.thumbnail,

	zoomRatio: 1,
	zoomX: 0,
	zoomY: 0,
	zoomW: appCfg.defPreviewRsoX,
	zoomH: appCfg.defPreviewRsoY,

	panWinW: 0,
	panWinH: 0,

	zoomScrollBarPos: 0,
};


///////////////////////////////////////////////////////////////////////////////////////////
// flow control
///////////////////////////////////////////////////////////////////////////////////////////

function playbackModeTaskCtrl(isEnter) {
	if (isEnter) {
		fcShowDisplayCanvas(false);
	}
	else {
		displayPictureWinClose(false);

		fcShowDisplayCanvas(true);

		fcShowPanWin(false);
	}
}

function playbackModeInit() {
	var mc = playbackModeCfg;

	getCanvasGroupContext(mc);

	fcInitCanvasArray(mc);

	playbackCreateThumbnailDiv();

	playbackCreateInfoBar();

	fcShowMode(mc, false);
}

function playbackModeOnResize() {
	fcUpdateImage();

	fcUpdatePanWin();
	fcUpdateCropWin();
}

function playbackModeStart() {
	var mc = playbackModeCfg;

	if (mc.curMode == PlbToolBarType.image) {
		playbackImageProcess();

		fcShowDisplayCanvas(true);

		if (mc.zoomRatio > 1) {
			fcUpdatePanWin();
			fcUpdateCropWin();
			fcShowPanWin(true);
		}
	}
	else {
		mc.zoomScrollBarPos = 0;
		mc.zoomRatio = 1;
	}

	//ScrollBarDlgSetPos('zoomDlg', mc.zoomScrollBarPos);	
}


///////////////////////////////////////////////////////////////////////////////////////////
// thumbnail
///////////////////////////////////////////////////////////////////////////////////////////

function playbackCreateThumbnailDiv() {
	createDivElement('playbackArea', 'thumbDiv');

	var iconW = appCfg.toolBarIconW;
	var iconH = appCfg.toolBarIconH;
	var titleH = appCfg.titleIconH;

	var css =
	{
		position: 'absolute',
		left: iconW + 'px',
		top: titleH + 'px',
		width: 'calc(100% - ' + (iconW * 2) + 'px)',
		height: 'calc(100% - ' + (titleH + iconH) + 'px)',
		'text-align': 'center',
		overflow: 'auto',
		'user-select': 'none'
	};

	$('#thumbDiv').css(css);
}

function playbackShowThumbnail(mode) {
	showElement('thumbDiv', mode);
}

///////////////////////////////////////////////////////////////////////////////////////////
// tool bar
///////////////////////////////////////////////////////////////////////////////////////////

function thumbnailToolBarOnClick(event) {
	var eleId;
	var i;

	switch (event.target.id) {
		case "btn_delete":
			eleId = $('img.selected,Video.selected');

			if (eleId.length) {
				fcToogleDlg("btn_delete", playbackDeleteConfirmDlgOpen, playbackDeleteConfirmDlgClose);
			}

			break;

		case "btn_saveDisk":
			var hasImg = false;

			eleId = $('img.selected,Video.selected');

			for (i = 0; i < eleId.length; i++) {
				if (eleId[i].tagName == "IMG") {
					hasImg = true;
					break;
				}
			}

			if (false) {
				$("#dialogSave").dialog({
					dialogClass: "no-close",
					autoOpen: false,
					width: 250,
					height: 80,
					show: {
						effect: "fade",
						duration: 500
					},
					hide: {
						effect: "fade",
						duration: 500
					},
					buttons: {
						"JPG": function () {
							$(this).dialog("close");
							lsSaveFilesToSelectedFolder(eleId, "JPG");
						},
						"PNG": function () {
							$(this).dialog("close");
							lsSaveFilesToSelectedFolder(eleId, "PNG");
						},
						"PDF": function () {
							$(this).dialog("close");
							lsSaveFilesToSelectedFolder(eleId, "PDF");
						},
						"TIFF": function () {
							$(this).dialog("close");
							lsSaveFilesToSelectedFolder(eleId, "TIFF");
						},
						"X": function () { $(this).dialog("close"); }
					},
					close: function (event, ui) {
						$(this).dialog("destroy");
					}
				});
				$("#dialogSave").html("");
				$("#dialogSave").dialog("open");
			}
			else {
				lsSaveFilesToSelectedFolder(eleId, "");
			}
			break;

		case "btn_toggleAll":
			if (appFC.thumbFileCnt != appFC.thumbSelectedFileCnt) {
				gallerySelectAll(true);

				appFC.thumbSelectedFileCnt = appFC.thumbFileCnt;
			}
			else {
				gallerySelectAll(false);

				appFC.thumbSelectedFileCnt = 0;
			}

			galleryUpdateFileInfo();

			break;

		case "btn_Next":
			galleryNextPage();
			break;

		case "btn_Previous":
			galleryPreviousPage();
			break;
	}

	toolBarOnMouseClick(event);
}

function closeAndBackPlayback(mc) {
	playbackShowToolBar(false);
	playbackSetToolBarType(PlbToolBarType.thumbnail);
	playbackShowToolBar(true);

	fcShowDisplayCanvas(false);
	playbackShowThumbnail(true);

	mc.curMode = PlbToolBarType.thumbnail;
	mc.zoomRatio = 1;
	mc.zoomScrollBarPos = 0;
	//ScrollBarDlgSetPos('zoomDlg', mc.zoomScrollBarPos);	
	fcShowPanWin(false);
	fcCloseActiveDlg();
}

function picturePlaybackToolBarOnClick(event) {
	var mc = playbackModeCfg;

	if (event.target.id == 'ppbtn_transform') {
		if ($("#cropBox").length == 0) {
			attachCropBox(dispW, dispH);
			fcToogleDlg("btn_delete", perspectiveImageConfirmDlgOpen, perspectiveImageConfirmDlgClose);
		}
		else {
			fcToogleDlg("btn_delete", perspectiveImageConfirmDlgOpen, perspectiveImageConfirmDlgClose);
			removeCropBox();
		}
	}

	switch (event.target.id) {
		case "ppbtn_closeAndBackPlayback":

			closeAndBackPlayback(mc);

			break;

		case "ppbtn_redo":

			fcCanvasCtrl(DrawState.redo);

			break;

		case "ppbtn_undo":

			fcCanvasCtrl(DrawState.undo);

			break;

		case "ppbtn_importPic":

			lsSelectFilesDlg();

			break;

		case "ppbtn_savePlayback":

			fcSaveCanvasToFile_withrefleshGallery(mc['combineCanvas']);
			//refleshGallery();
			//playbackModeCfg;
			//closeAndBackPlayback(mc);
			break;

		case "ppbtn_zoom":
			$("#configDlg").hide();
			$("#zoomDlg").toggle(500);

			//fcToogleDlg("ppbtn_zoom", fcZoomDlgOpen, fcZoomDlgClose);

			break;

		case "ppbtn_transform":

			// if ($("svg").length)
			// {
			// 	perspectiveImageConfirmDlgClose();			
			// 	$("svg").remove();
			// }
			// else
			// {
			// 	attachCropBox(dispW, dispH);
			// 	fcToogleDlg("btn_delete", perspectiveImageConfirmDlgOpen, perspectiveImageConfirmDlgClose);
			// }			
			break;

		case "ppbtn_ocr":
			OCR();
			break;
	}

	toolBarOnMouseClick(event);
}

function playbackShowToolBar(mode) {
	var mc = playbackModeCfg;

	showElement(mc.lToolBar, mode);
	showElement(mc.rToolBar, mode);
	showElement(mc.bToolBar, mode);
}

function playbackSetToolBarType(type) {
	var mc = playbackModeCfg;

	switch (type) {
		case PlbToolBarType.thumbnail:
			mc.lToolBar = 'thumbnailToolBar';
			mc.rToolBar = 'playbackRToolBar';
			mc.bToolBar = 'playbackInfoBar';
			break;

		case PlbToolBarType.image:
			mc.lToolBar = 'picPlaybackToolBar';
			mc.rToolBar = 'drawingToolBar';
			mc.bToolBar = 'drawingCfgArea';
			break;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// display single image
///////////////////////////////////////////////////////////////////////////////////////////

function playbackDisplayVideoMode(image) {
	var mc = playbackModeCfg;

	mc.curImage = image;

	mc.curMode = PlbToolBarType.image;

	fcChangeBaseImageSize(image.width, image.height);

	fcCloseActiveDlg();

	fcUpdatePanWin();
	fcUpdateCropWin();
}

///////////////////////////////////////////////////////////////////////////////////////////
// Perspective Image
///////////////////////////////////////////////////////////////////////////////////////////

function perspectiveImageConfirmDlgClickHandler(isYes) {
	if (isYes) {
		//Perspective_ScanImage()
		Perspective_Image();

		//var mc = previewModeCfg;
		//mc.freeze = false;
		//updateVideoStreamFrame();
	}

	fcCloseActiveDlg();
}

function perspectiveImageConfirmDlgOpen() {
	setConfirmDlgClickHandler(perspectiveImageConfirmDlgClickHandler);

	//setConfirmDlgTip("btnStart", "btnCancel");

	showConfirmDlg(true);
}

function perspectiveImageConfirmDlgClose() {
	showConfirmDlg(false);
	var mc = previewModeCfg;
	mc.freeze = false;
}

function Perspective_MultiScanMode() {
	return Perspective();
}

function Perspective_ScanMode() {
	var canvas = Perspective();
	var width = canvas.width;
	var height = canvas.height;
	var img = new Image;

	appFC.curMode.freeze = true;

	img.width = width;
	img.height = height;
	img.src = canvas.toDataURL();
	img.onload = function () {
		var mc = appFC.curMode;
		var ctx = mc.baseImageContext;//appFC.drawContext;
		//var ctx = mc.imageProcessContext;
		var rW = mc.imgW / width;
		var rH = mc.imgH / height;

		//console.log("disp: " + width + " / " + height);
		//console.log("mc.img: " + mc.imgW + " / " + mc.imgH);

		fcClearDrawingCanvas();
		ctx.beginPath();
		ctx.rect(0, 0, mc.imgW, mc.imgH);
		ctx.fillStyle = "black";
		ctx.fill();

		//ctx.drawImage(img, 0, 0, width, height);
		//ctx.drawImage(img, 0, (mc.imgH - (height*rW))/2, mc.imgW, height * rW);

		if (width / height >= mc.imgW / mc.imgH)
			ctx.drawImage(img, 0, (mc.imgH - (height * rW)) / 2, mc.imgW, height * rW);
		else
			ctx.drawImage(img, (mc.imgW - (width * rH)) / 2, 0, width * rH, mc.imgH);

		fcCanvasCtrl(DrawState.end);
		if (mc.imageProcess) mc.imageProcess();
	}
}

function Perspective() {
	// Make transform martix
	var path = document.getElementById("croppath").getAttribute("d");
	var commands = path.split(/(?=[LMC])/);
	var rectSrc = [];
	var rectTgt = [];
	var rectTmp = [];
	var rectTmp1 = [];
	var rectTmp2 = [];

	rectTmp[0] = parseInt(commands[0].replace("M", "").replace("L", "").replace("Z", "").split(",")[0]);
	rectTmp[1] = parseInt(commands[0].replace("M", "").replace("L", "").replace("Z", "").split(",")[1]);
	rectTmp[2] = parseInt(commands[1].replace("M", "").replace("L", "").replace("Z", "").split(",")[0]);
	rectTmp[3] = parseInt(commands[1].replace("M", "").replace("L", "").replace("Z", "").split(",")[1]);
	rectTmp[4] = parseInt(commands[2].replace("M", "").replace("L", "").replace("Z", "").split(",")[0]);
	rectTmp[5] = parseInt(commands[2].replace("M", "").replace("L", "").replace("Z", "").split(",")[1]);
	rectTmp[6] = parseInt(commands[3].replace("M", "").replace("L", "").replace("Z", "").split(",")[0]);
	rectTmp[7] = parseInt(commands[3].replace("M", "").replace("L", "").replace("Z", "").split(",")[1]);

	//var centX = (rectTmp[0] + rectTmp[2] + rectTmp[4] + rectTmp[6]) / 4;
	var centY = (rectTmp[1] + rectTmp[3] + rectTmp[5] + rectTmp[7]) / 4;

	// 計算重心 確保四點座標順序
	for (i = 0; i < 4; i++) {
		//var subX = rectTmp[i*2] - centX;
		var subY = rectTmp[i * 2 + 1] - centY;

		if (subY < 0) {
			rectTmp1.push(rectTmp[i * 2]);
			rectTmp1.push(rectTmp[i * 2 + 1]);
		}
		else {
			rectTmp2.push(rectTmp[i * 2]);
			rectTmp2.push(rectTmp[i * 2 + 1]);
		}
	}

	while (rectTmp1.length > 0) {
		var MinIndex = 0;
		var MinVal = 9999;
		for (i = 0; i < rectTmp1.length; i++) {
			if (rectTmp1[i * 2] < MinVal) {
				MinVal = rectTmp1[i * 2];
				MinIndex = i;
			}
		}
		rectSrc.push(rectTmp1[MinIndex * 2]);
		rectSrc.push(rectTmp1[MinIndex * 2 + 1]);
		rectTmp1.splice(MinIndex * 2, 2);
	}

	while (rectTmp2.length > 0) {
		var MaxIndex = 0;
		var MaxVal = -9999;
		for (i = 0; i < rectTmp2.length; i++) {
			if (rectTmp1[i * 2] > MaxVal) {
				MaxVal = rectTmp1[i * 2];
				MaxIndex = i;
			}
		}
		rectSrc.push(rectTmp2[MaxIndex * 2]);
		rectSrc.push(rectTmp2[MaxIndex * 2 + 1]);
		rectTmp2.splice(MaxIndex * 2, 2);
	}

	var mc = previewModeCfg;
	var dispW = document.getElementById("displayCanvas").width
	var dispH = document.getElementById("displayCanvas").height

	// scale rectSrc to image size
	rectSrc[0] = rectSrc[0] / dispW * mc.imgW;
	rectSrc[1] = rectSrc[1] / dispH * mc.imgH;
	rectSrc[2] = rectSrc[2] / dispW * mc.imgW;
	rectSrc[3] = rectSrc[3] / dispH * mc.imgH;
	rectSrc[4] = rectSrc[4] / dispW * mc.imgW;
	rectSrc[5] = rectSrc[5] / dispH * mc.imgH;
	rectSrc[6] = rectSrc[6] / dispW * mc.imgW;
	rectSrc[7] = rectSrc[7] / dispH * mc.imgH;

	// calc rectTgt
	var startX = (rectSrc[0] + rectSrc[6]) / 2;
	var startY = (rectSrc[1] + rectSrc[3]) / 2;
	var width = Math.abs(Math.floor(((rectSrc[2] + rectSrc[4]) / 2 - startX)));
	var height = Math.abs(Math.floor(((rectSrc[7] + rectSrc[5]) / 2 - startY)));

	// var width = Math.sqrt(((rectSrc[2] - rectSrc[0]) ^ 2) + ((rectSrc[3] - rectSrc[1]) ^ 2));
	// var height = Math.sqrt(((rectSrc[4] - rectSrc[2]) ^ 2) + ((rectSrc[5] - rectSrc[3]) ^ 2));s

	rectTgt[0] = startX; rectTgt[1] = startY;
	rectTgt[2] = startX + width; rectTgt[3] = startY;
	rectTgt[4] = startX + width; rectTgt[5] = startY + height;
	rectTgt[6] = startX; rectTgt[7] = startY + height;

	// calc matrix
	perspectiveTran = PerspT(rectSrc, rectTgt);

	////////////////////////////////////////
	var srcCanvas = document.getElementById("previewArea-combineCanvas");
	var tempCanvas = document.getElementById("tempCanvas");

	tempCanvas.width = srcCanvas.width;
	tempCanvas.height = srcCanvas.height;

	var tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

	tempCtx.drawImage(srcCanvas, 0, 0);
	var pixels = new ImageData(width, height);
	//var pixels = tempCtx.getImageData(0, 0, width, height);
	var srcCopy = tempCtx.getImageData(0, 0, mc.imgW, mc.imgH).data.slice(0);

	///////////////////////////////////////////
	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			var res = perspectiveTran.transformInverse(x + startX, y + startY);
			var index = (y * width + x) * 4;
			var SourceIndex = (Math.round(res[1]) * mc.imgW + Math.round(res[0])) * 4;

			pixels.data[index] = srcCopy[SourceIndex];
			pixels.data[index + 1] = srcCopy[SourceIndex + 1];
			pixels.data[index + 2] = srcCopy[SourceIndex + 2];
			pixels.data[index + 3] = 255;
		}
	}

	var resultCanvas = document.getElementById('saveFileCanvas');
	resultCanvas.width = width;
	resultCanvas.height = height;
	var ctxTgt = resultCanvas.getContext('2d', { willReadFrequently: true });
	ctxTgt.putImageData(pixels, 0, 0);

	return resultCanvas;
}

function Perspective_Image() {
	var path = document.getElementById("croppath").getAttribute("d");
	var commands = path.split(/(?=[LMC])/);
	var rectSrc = [];
	var rectTgt = [];

	rectSrc[0] = parseInt(commands[0].replace("M", "").replace("L", "").replace("Z", "").split(",")[0]);
	rectSrc[1] = parseInt(commands[0].replace("M", "").replace("L", "").replace("Z", "").split(",")[1]);
	rectSrc[2] = parseInt(commands[1].replace("M", "").replace("L", "").replace("Z", "").split(",")[0]);
	rectSrc[3] = parseInt(commands[1].replace("M", "").replace("L", "").replace("Z", "").split(",")[1]);
	rectSrc[4] = parseInt(commands[2].replace("M", "").replace("L", "").replace("Z", "").split(",")[0]);
	rectSrc[5] = parseInt(commands[2].replace("M", "").replace("L", "").replace("Z", "").split(",")[1]);
	rectSrc[6] = parseInt(commands[3].replace("M", "").replace("L", "").replace("Z", "").split(",")[0]);
	rectSrc[7] = parseInt(commands[3].replace("M", "").replace("L", "").replace("Z", "").split(",")[1]);

	var mc = playbackModeCfg;
	var image = mc.curImage;
	var dispW = document.getElementById("displayCanvas").width
	var dispH = document.getElementById("displayCanvas").height

	// scale rectSrc to image size
	if (mc.zoomRatio > 1) {
		rectSrc[0] = parseInt(mc.zoomX + rectSrc[0] / dispW * image.width / mc.zoomRatio);
		rectSrc[1] = parseInt(mc.zoomY + rectSrc[1] / dispH * image.height / mc.zoomRatio);
		rectSrc[2] = parseInt(mc.zoomX + rectSrc[2] / dispW * image.width / mc.zoomRatio);
		rectSrc[3] = parseInt(mc.zoomY + rectSrc[3] / dispH * image.height / mc.zoomRatio);
		rectSrc[4] = parseInt(mc.zoomX + rectSrc[4] / dispW * image.width / mc.zoomRatio);
		rectSrc[5] = parseInt(mc.zoomY + rectSrc[5] / dispH * image.height / mc.zoomRatio);
		rectSrc[6] = parseInt(mc.zoomX + rectSrc[6] / dispW * image.width / mc.zoomRatio);
		rectSrc[7] = parseInt(mc.zoomY + rectSrc[7] / dispH * image.height / mc.zoomRatio);
	}
	else {
		rectSrc[0] = rectSrc[0] / dispW * image.width;
		rectSrc[1] = rectSrc[1] / dispH * image.height;
		rectSrc[2] = rectSrc[2] / dispW * image.width;
		rectSrc[3] = rectSrc[3] / dispH * image.height;
		rectSrc[4] = rectSrc[4] / dispW * image.width;
		rectSrc[5] = rectSrc[5] / dispH * image.height;
		rectSrc[6] = rectSrc[6] / dispW * image.width;
		rectSrc[7] = rectSrc[7] / dispH * image.height;
	}

	// calc rectTgt
	var startX = (rectSrc[0] + rectSrc[6]) / 2;
	var startY = (rectSrc[1] + rectSrc[3]) / 2;
	var width = Math.floor(((rectSrc[2] + rectSrc[4]) / 2 - startX));
	var height = Math.floor(((rectSrc[7] + rectSrc[5]) / 2 - startY));

	rectTgt[0] = startX; rectTgt[1] = startY;
	rectTgt[2] = startX + width; rectTgt[3] = startY;
	rectTgt[4] = startX + width; rectTgt[5] = startY + height;
	rectTgt[6] = startX; rectTgt[7] = startY + height;

	// calc matrix
	perspectiveTran = PerspT(rectSrc, rectTgt);

	////////////////////////////////////////

	var canvas = imageToCanvas(image);
	var ctxSrc = canvas.getContext('2d', { willReadFrequently: true });
	var pixels = ctxSrc.getImageData(0, 0, width, height);
	var srcCopy = ctxSrc.getImageData(0, 0, image.width, image.height).data.slice(0);

	///////////////////////////////////////////
	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			var res = perspectiveTran.transformInverse(x + startX, y + startY);
			var index = (y * width + x) * 4;
			var SourceIndex = (Math.round(res[1]) * image.width + Math.round(res[0])) * 4;
			//var SourceIndex = (Math.floor(res[1]) * image.width + Math.floor(res[0])) * 4;

			pixels.data[index] = srcCopy[SourceIndex];
			pixels.data[index + 1] = srcCopy[SourceIndex + 1];
			pixels.data[index + 2] = srcCopy[SourceIndex + 2];
		}
	}

	canvas = document.getElementById('saveFileCanvas');
	canvas.width = width;
	canvas.height = height;

	var ctxTgt = canvas.getContext('2d', { willReadFrequently: true });
	ctxTgt.putImageData(pixels, 0, 0);

	var img = new Image;
	img.onload = function () {
		playbackDisplayImgMode(this);
	};

	img.width = width;
	img.height = height;
	img.src = canvas.toDataURL();

	// reset zoom
	fcResetZoomRatio();

	//delete srcCopy;
	//srcCopy = null;

	function imageToCanvas(image) {
		var canvas = document.getElementById('saveFileCanvas');
		var ctx = canvas.getContext('2d', { willReadFrequently: true });

		$('#saveFileCanvas').attr('width', image.width);
		$('#saveFileCanvas').attr('height', image.height);
		ctx.drawImage(image, 0, 0, image.width, image.height);
		return canvas;
	}
}

function dataURItoBlob(dataURI) {
	// convert base64/URLEncoded data component to raw binary data held in a string
	var byteString;
	if (dataURI.split(',')[0].indexOf('base64') != -1)
		byteString = atob(dataURI.split(',')[1]);
	else
		byteString = unescape(dataURI.split(',')[1]);

	// separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	// write the bytes of the string to a typed array
	var ia = new Uint8Array(byteString.length);
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}

	return new Blob([ia], { type: mimeString });
}


function LoadPng2Blob(blob) {
	var CHUNK_SIZE = 256 * 1024;
	var start = 0;
	var stop = CHUNK_SIZE;

	var remainder = blob.size % CHUNK_SIZE;
	var chunks = Math.floor(blob.size / CHUNK_SIZE);

	var chunkIndex = 0;

	if (remainder != 0) chunks = chunks + 1;

	var fr = new FileReader();
	var canvas = document.getElementById('displayCanvas');

	fr.onload = function () {
		var message = {
			blobAsText: fr.result,
			mimeString: "mimeString",
			chunks: chunks,
		};
		// APP_ID was obtained elsewhere
		chrome.runtime.sendMessage(OcrAppID, message, function (result) {
			if (chrome.runtime.lastError) {
				console.log("could not send message to app");
			}
		});
		processChunk();
	};

	fr.onerror = function () { appendLog("An error ocurred while reading file"); };
	processChunk();

	function processChunk() {
		chunkIndex++;

		// exit if there are no more chunks
		if (chunkIndex > chunks) {
			return;
		}

		if (chunkIndex == chunks && remainder != 0) {
			stop = start + remainder;
		}

		var blobChunk = blob.slice(start, stop);

		// prepare for next chunk
		start = stop;
		stop = stop + CHUNK_SIZE;

		// convert chunk as binary string
		fr.readAsBinaryString(blobChunk);
	}
}

function OCR_scan() {
	var message = {
		launch: true,
		senderName: appName
	};

	chrome.runtime.sendMessage(OcrAppID, message, function (e) {
		//console.log(e);		
		if (chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError);

			console.log("could not send message to app");
			$("#dialogOcr").dialog({
				dialogClass: "no-close",
				autoOpen: false,
				width: 250,
				height: 140,
				show: {
					effect: "fade",
					duration: 500
				},
				hide: {
					effect: "fade",
					duration: 500
				},
				buttons: {
					"Add it now": function () {
						var newURL = OcrAppLink;//"https://chrome.google.com/webstore/detail/smart-dc-ocr/kbepikplfggknbcgfedhldpdmncjegih?hl=en-GB&authuser=1";
						//chrome.tabs.create({ url: newURL });
						window.open(newURL);
						$(this).dialog("close");
					},
					"Later": function () { $(this).dialog("close"); }
				}
			});
			$("#dlgOcrTxt").text("This feature requires installing a free OCR extension from the Chrome Web Store.");
			//$("#dlgTxt").text("This function depends on Smart DC OCR App. Please download the App from Chrome Web Store or Offical Website.");
			$("#dialogOcr").dialog("open");
			return;
		}

		//if (e != "Success")	{}

		var canvas = document.getElementById('previewArea-combineCanvas');
		//var canvas = document.getElementById('saveFileCanvas');

		canvas.toBlob(function (blob) {
			setTimeout(function () {
				LoadPng2Blob(blob);
			}, 200);
		});
	});
}

function OCR() {
	var message = {
		launch: true,
		senderName: appName
	};

	chrome.runtime.sendMessage(OcrAppID, message, function (e) {
		//console.log(e);		
		if (chrome.runtime.lastError) {
			console.log("could not send message to app");
			$("#dialogOcr").dialog({
				dialogClass: "no-close",
				autoOpen: false,
				width: 250,
				height: 140,
				show: {
					effect: "fade",
					duration: 500
				},
				hide: {
					effect: "fade",
					duration: 500
				},
				buttons: {
					"Add it now": function () {
						var newURL = OcrAppLink;//"https://chrome.google.com/webstore/detail/smart-dc-ocr/kbepikplfggknbcgfedhldpdmncjegih?hl=en-GB&authuser=1";
						//chrome.tabs.create({ url: newURL });
						window.open(newURL);
						$(this).dialog("close");
					},
					"Later": function () { $(this).dialog("close"); }
				}
			});
			$("#dlgOcrTxt").text("This feature requires installing a free OCR extension from the Chrome Web Store.");
			//$("#dlgTxt").text("This function depends on Smart DC OCR App. Please download the App from Chrome Web Store or Offical Website.");
			$("#dialogOcr").dialog("open");
			return;
		}

		//if (e != "Success")	{}

		var canvas = document.getElementById('displayCanvas');
		canvas.toBlob(function (blob) {
			setTimeout(function () {
				LoadPng2Blob(blob);
			}, 200);
		});
	});
}

function playbackDisplayImgMode(image) {
	var mc = playbackModeCfg;

	mc.curImage = image;

	mc.curMode = PlbToolBarType.image;

	fcChangeBaseImageSize(image.width, image.height);

	fcCloseActiveDlg();

	fcUpdatePanWin();
	fcUpdateCropWin();
}

function playbackChangeBaseImageCtrl(state, w, h) {
	var mc = playbackModeCfg;

	switch (state) {
		case BaseImgChg.before:
			break;

		case BaseImgChg.after:
			if (mc.curImage == 0)
				return;

			playbackShowToolBar(false);
			playbackSetToolBarType(PlbToolBarType.image);
			playbackShowToolBar(!fullPhotoMode);

			mc.imgW = mc.curImage.width;
			mc.imgH = mc.curImage.height;

			mc.baseImageContext.drawImage(mc.curImage, 0, 0, mc.curImage.width, mc.curImage.height);

			playbackImageProcess();
			playbackShowThumbnail(false);
			fcShowDisplayCanvas(true);
			break;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
// canvas
///////////////////////////////////////////////////////////////////////////////////////////

function playbackOverlayCanvas(dstContext, srcCanvas) {
	var mc = playbackModeCfg;

	dstContext.drawImage(srcCanvas, 0, 0, mc.imgW, mc.imgH, 0, 0, mc.imgW, mc.imgH);
}

function playbackImageProcess() {
	var mc = playbackModeCfg;

	playbackOverlayCanvas(mc.imageProcessContext, mc.baseImageCanvas);

	playbackRedoUndo();
}

function playbackRedoUndo() {
	var mc = playbackModeCfg;

	if (mc.reqUndo) {
		mc.reqUndo = false;

		fcDrawingUndo(mc);
	}
	else if (mc.reqRedo) {
		mc.reqRedo = false;

		fcDrawingRedo(mc);
	}
	else {
		playbackMergeDrawing();
	}
}

function playbackMergeDrawing() {
	var mc = playbackModeCfg;

	if (mc.zoomRatio == 1) {
		playbackOverlayCanvas(mc.combineContext, mc.imageProcessCanvas);
	}
	else {
		mc.combineContext.drawImage(mc.imageProcessCanvas, mc.zoomX, mc.zoomY, mc.zoomW, mc.zoomH, 0, 0, mc.imgW, mc.imgH);
	}

	if (mc.mergeTempDraw) {
		mc.mergeTempDraw = false;

		playbackOverlayCanvas(mc.drawingContext, mc.tempDrawingCanvas);

		fcPushDrawingCanvas(mc);
	}

	playbackOverlayCanvas(mc.combineContext, mc.drawingCanvas);

	playbackMergeTempDrawing();
}

function playbackMergeTempDrawing() {
	var mc = playbackModeCfg;

	if (mc.hasTempDraw) {
		playbackOverlayCanvas(mc.combineContext, mc.tempDrawingCanvas);
	}

	playbackDisplay();
}

function playbackDisplay() {
	var mc = playbackModeCfg;

	if (fcIsModeActive(mc)) {
		fcUpdateImage();
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
// canvas control
///////////////////////////////////////////////////////////////////////////////////////////

function playbackCanvasControl(state) {
	var mc = playbackModeCfg;

	switch (state) {
		case DrawState.start:
			return false;
			break;

		case DrawState.move:
			mc.hasTempDraw = true;
			break;

		case DrawState.end:
			if (false == appFC.drawText) {
				mc.hasTempDraw = false;
				mc.mergeTempDraw = true;
			}
			break;

		case DrawState.undo:
			if (mc.canvasStep > 0) {
				mc.reqUndo = true;
			}
			break;

		case DrawState.redo:
			if (mc.canvasStep < (mc.canvasArray.length - 1)) {
				mc.reqRedo = true;
			}
			break;
	}

	return false;
}


///////////////////////////////////////////////////////////////////////////////////////////
// information bar
///////////////////////////////////////////////////////////////////////////////////////////

function playbackCreateInfoBar() {
	var id = 'playbackInfoBar';
	var eleId = '#' + id;

	// create base element

	createSpanElement('uiArea', id);

	var css =
	{
		top: 'calc(100% - ' + appCfg.toolBarIconH + 'px)',
		left: appCfg.toolBarIconW + 'px',
		height: appBaseCfg.iconH + 'px',
		width: 'calc(100% - ' + (2 * appCfg.toolBarIconW) + 'px)',
		background: appCfg.toolBarColorLeave,
		opacity: appCfg.toolBarOpacityLeave,
		position: 'absolute',
	};

	$(eleId).css(css);

	showElement(id, false);

	// create Page display element
	//createLabelElement(id, 'pbFileInfo_Text');
	createLabelElement(id, 'pbFileInfo_Page');
	createLabelElement(id, 'pbFileInfo_Item');

	id = 'pbFileInfo_Text';
	eleId = '#' + id;

	css.top = (appBaseCfg.iconH - appCfg.pbInfoH) / 2 + 'px';
	css.left = 'calc(40% - ' + (appCfg.pbInfoW / 2) + 'px)';
	css.height = appCfg.pbInfoH;
	css.width = (appCfg.pbInfoW / 2);//appCfg.pbInfoW;

	$(eleId).css(css);

	$(eleId).css('line-height', appCfg.pbInfoH + 'px');
	$(eleId).css('font-size', appCfg.pbInfoFontSize);
	$(eleId).css('font-weight', appCfg.pbInfoFontWWeight);
	$(eleId).css('color', appCfg.pbInfoColor_Page);
	$(eleId).css('text-align', 'left');



	id = 'pbFileInfo_Page';
	eleId = '#' + id;

	css.top = (appBaseCfg.iconH - appCfg.pbInfoH) / 2 + 'px';
	css.left = 'calc(40% - ' + (appCfg.pbInfoW / 2) + 'px)';
	//css.left = 'calc(40% - ' + ((appCfg.pbInfoW / 2) - (appCfg.pbInfoW / 2)) + 'px)';
	css.height = appCfg.pbInfoH;
	css.width = appCfg.pbInfoW - (appCfg.pbInfoW / 2);

	$(eleId).css(css);

	$(eleId).css('line-height', appCfg.pbInfoH + 'px');
	$(eleId).css('font-size', appCfg.pbInfoFontSize);
	$(eleId).css('font-weight', appCfg.pbInfoFontWWeight);
	$(eleId).css('color', appCfg.pbInfoColor_Page);
	$(eleId).css('text-align', 'left');

	// create Item display element
	id = 'pbFileInfo_Item';
	eleId = '#' + id;

	css.top = (appBaseCfg.iconH - appCfg.pbInfoH) / 2 + 'px';
	css.left = 'calc(80% - ' + (appCfg.pbInfoW / 2) + 'px)';
	css.height = appCfg.pbInfoH;
	css.width = appCfg.pbInfoW;

	$(eleId).css(css);

	$(eleId).css('line-height', appCfg.pbInfoH + 'px');
	$(eleId).css('font-size', appCfg.pbInfoFontSize);
	$(eleId).css('font-weight', appCfg.pbInfoFontWWeight);
	$(eleId).css('color', appCfg.pbInfoColor_Item);
	$(eleId).css('text-align', 'left');
}

function playbackUpdateFileInfoElement(Page, Item) {
	var id;

	id = document.getElementById('pbFileInfo_Page');
	fcUpdateElementText(id, Page);

	id = document.getElementById('pbFileInfo_Item');
	fcUpdateElementText(id, Item);
}

///////////////////////////////////////////////////////////////////////////////////////////
// delete thumbnail file
///////////////////////////////////////////////////////////////////////////////////////////

function playbackDeletConfirmDlgClickHandler(isYes) {
	var eleId;

	fcCloseActiveDlg();

	if (isYes) {
		eleId = $('img.selected, video.selected');

		galleryDeleteFiles(eleId);
	}
}

function playbackDeleteConfirmDlgOpen() {
	setConfirmDlgClickHandler(playbackDeletConfirmDlgClickHandler);

	setConfirmDlgTip("btnDelete", "btnCancel");

	showConfirmDlg(true);
}

function playbackDeleteConfirmDlgClose() {
	showConfirmDlg(false);
}


///////////////////////////////////////////////////////////////////////////////////////////
// mode config
///////////////////////////////////////////////////////////////////////////////////////////

var drawingBoardModeCfg =
{
	baseId: 'drawingArea',

	lToolBar: 'drawingBoardToolBar',
	rToolBar: 'drawingToolBar',
	bToolBar: 'drawingCfgArea',

	taskCtrl: drawingBoardModeTaskCtrl,
	start: drawingBoardModeStart,
	init: drawingBoardModeInit,
	onResize: drawingBoardModeOnResize,
	canvasCtrl: drawingBoardCanvasControl,
	imageProcess: drawingBoardImageProcess,

	imgW: appCfg.defDrawingBoardW,
	imgH: appCfg.defDrawingBoardH,

	hasTempDraw: false,
	mergeTempDraw: false,

	reqUndo: false,
	reqRedo: false,
};


///////////////////////////////////////////////////////////////////////////////////////////
// flow control
///////////////////////////////////////////////////////////////////////////////////////////

function drawingBoardModeTaskCtrl(isEnter) {
	if (isEnter) {
		//console.log("drawingBoard load, nothing to do");
	}
	else {
		displayPictureWinClose(false);
	}
}

function drawingBoardModeInit() {
	var mc = drawingBoardModeCfg;

	getCanvasGroupContext(mc);

	fcInitCanvasArray(mc);

	mc.baseImageContext.rect(0, 0, mc.imgW, mc.imgH);
	mc.baseImageContext.fillStyle = appCfg.drawingBoardBgColor;
	mc.baseImageContext.fill();

	mc.combineContext.drawImage(mc.baseImageCanvas, 0, 0, mc.imgW, mc.imgH, 0, 0, mc.imgW, mc.imgH);

	fcShowMode(mc, false);
}

function drawingBoardModeStart() {
	drawingBoardModeOnResize();
}

function drawingBoardModeOnResize() {
	fcUpdateImage();
}

///////////////////////////////////////////////////////////////////////////////////////////
// tool bar
///////////////////////////////////////////////////////////////////////////////////////////

function drawingBoardToolBarOnClick(event) {
	var mc = drawingBoardModeCfg;

	switch (event.target.id) {
		case "dbbtn_undo":

			fcCanvasCtrl(DrawState.undo);

			break;

		case "dbbtn_redo":

			fcCanvasCtrl(DrawState.redo);

			break;

		case "dbbtn_importPic":

			lsSelectFilesDlg();

			break;

		case "dbbtn_savePlayback":
			showSaveHit();
			fcSaveCanvasToFile(mc['combineCanvas']);

			break;
	}

	toolBarOnMouseClick(event);
}


///////////////////////////////////////////////////////////////////////////////////////////
// canvas
///////////////////////////////////////////////////////////////////////////////////////////

function drawingBoardOverlayCanvas(dstContext, srcCanvas) {
	var mc = drawingBoardModeCfg;

	dstContext.drawImage(srcCanvas, 0, 0, mc.imgW, mc.imgH, 0, 0, mc.imgW, mc.imgH);
}

function drawingBoardImageProcess() {
	var mc = drawingBoardModeCfg;

	drawingBoardOverlayCanvas(mc.imageProcessContext, mc.baseImageCanvas);

	drawingBoardRedoUndo();
}

function drawingBoardRedoUndo() {
	var mc = drawingBoardModeCfg;

	if (mc.reqUndo) {
		mc.reqUndo = false;

		fcDrawingUndo(mc);
	}
	else if (mc.reqRedo) {
		mc.reqRedo = false;

		fcDrawingRedo(mc);
	}
	else {
		drawingBoardMergeDrawing();
	}
}

function drawingBoardMergeDrawing() {
	var mc = drawingBoardModeCfg;

	drawingBoardOverlayCanvas(mc.combineContext, mc.imageProcessCanvas);

	if (mc.mergeTempDraw) {
		mc.mergeTempDraw = false;

		drawingBoardOverlayCanvas(mc.drawingContext, mc.tempDrawingCanvas);

		fcPushDrawingCanvas(mc);
	}

	drawingBoardOverlayCanvas(mc.combineContext, mc.drawingCanvas);

	drawingBoardMergeTempDrawing();
}

function drawingBoardMergeTempDrawing() {
	var mc = drawingBoardModeCfg;

	if (mc.hasTempDraw) {
		drawingBoardOverlayCanvas(mc.combineContext, mc.tempDrawingCanvas);
	}

	drawingBoardDisplay();
}

function drawingBoardDisplay() {
	var mc = drawingBoardModeCfg;

	if (fcIsModeActive(mc)) {
		fcUpdateImage();
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// canvas control
///////////////////////////////////////////////////////////////////////////////////////////

function drawingBoardCanvasControl(state) {
	var mc = drawingBoardModeCfg;

	switch (state) {
		case DrawState.start:
			return false;
			break;

		case DrawState.move:
			mc.hasTempDraw = true;
			break;

		case DrawState.end:
			if (false == appFC.drawText) {
				mc.hasTempDraw = false;
				mc.mergeTempDraw = true;
			}
			break;

		case DrawState.undo:
			if (mc.canvasStep > 0) {
				mc.reqUndo = true;
			}
			break;

		case DrawState.redo:
			if (mc.canvasStep < (mc.canvasArray.length - 1)) {
				mc.reqRedo = true;
			}
			break;
	}

	return false;
}

///////////////////////////////////////////////////////////////////////////////////////////
// control data
///////////////////////////////////////////////////////////////////////////////////////////

var appFC =
{
	appVersion: '20180904-1',

	curMode: undefined,

	showToolBar: true,

	imgW: undefined,
	imgH: undefined,

	reqImgW: undefined,
	reqImgH: undefined,

	baseCanvas: undefined,
	baseContext: undefined,

	drawCanvas: undefined,
	drawContext: undefined,

	drawStyle: undefined,
	eraserStyle: undefined,
	clearStyle: 'rgba(0,0,0,0)',

	opacity: undefined,
	lineWidth: undefined,

	colorHex: undefined,
	colorR: undefined,
	colorG: undefined,
	colorB: undefined,

	drawStartX: undefined,
	drawStartY: undefined,
	drawCurX: undefined,
	drawCurY: undefined,
	drawLastX: undefined,
	drawLastY: undefined,
	drawing: undefined,
	drawingMove: false,
	fnDraw: undefined,

	activeDlg: false,
	activeDlgCloseFn: false,

	previewBrightnessAdj: 0,
	previewWhiteBalanceAdj: 0,
	previewRotate: 0,

	fontFamily: "Arial",
	fontStyle: "Normal",
	fontSize: 12,

	fontBold: false,
	fontItalic: false,

	drawText: false,

	drawFontStyle: undefined,

	thumbnailCnt: 0,
	thumbnailBuild: false,
	thumbnailCurrPage: 0,
	thumbnailTotalPage: 1,
	thumbnailEntries: null,
	thumbnailReflesh: false,

	capturing: false,
	lastSaveFilename: "",

	ctrlPress: false,

	showSysInfo: false,

	frameRateInit: false,
	frameCnt: 16,
	frameSlotIdx: 0,
	frameInterval: [],
	frameLastTime: 0,
	frameRate: 0,

	thumbFileCnt: 0,
	thumbSelectedFileCnt: 0,

	capturePeriodRun: false,
	capturePeriodSec: appCfg.pcdCapturePeriodSec,
	captureIntervalHour: appCfg.pcdCaptureIntervalHour,
	capturePeriodTotalCnt: 0,
	capturePeriodCurCnt: 0,
	capturePeriodMs: 0,

	resizeDelayMs: appBaseCfg.resizeDelayMs,

	ipwRadiusExpandRatio: 1,
	ipwExtraSpace: 0,

	panMove: false,
	panMoveX: 0,
	panMoveY: 0,

	drawRegularShape: false,

	curVideoResolutionList: VideoResolutionList,
	reqVideoResolutionList: false,

	idVideoResolutionList: 0,

	curAudioinputList: 0,
	idAudioinputSelect: 0,
	idVideoinputSelect: 0,

	checkVideoResolution: false,
};


///////////////////////////////////////////////////////////////////////////////////////////
// tool bar
///////////////////////////////////////////////////////////////////////////////////////////

function fcShowToolBar(mode) {
	//var sysToolBar = document.getElementById("sysToolBar");
	var titleBar = document.getElementById("appTitle");
	if (titleBar) showToolBar("appTitle", mode);

	//showToolBar("sys_close", mode);
	// showToolBar("sys_fullScreen", mode);
	// showToolBar("sys_smallScreen", mode);
	//showToolBar("sysToolBar", !mode);
	showToolBar("modeToolBar", mode);
	showToolBar("bottomToolBarData",
		(appFC.curMode.baseId == "previewArea") &&
		!IsScanMode && !IsMultiscanMode && mode);

	if (typeof appFC.curMode.lToolBar != "undefined") showToolBar(appFC.curMode.lToolBar, !IsScanMode && !IsMultiscanMode && mode);
	if (typeof appFC.curMode.lS1ToolBar != "undefined") showToolBar(appFC.curMode.lS1ToolBar, IsScanMode && mode && !IsTransform);
	if (typeof appFC.curMode.lS2ToolBar != "undefined") showToolBar(appFC.curMode.lS2ToolBar, IsScanMode && mode && IsTransform);

	if (typeof appFC.curMode.lMsToolBar != "undefined") showToolBar(appFC.curMode.lMsToolBar, IsMultiscanMode && mode);
	if (typeof appFC.curMode.rToolBar != "undefined") showToolBar(appFC.curMode.rToolBar, ((IsScanMode && IsTransform) || !IsScanMode) && !IsMultiscanMode && mode);
	if (typeof appFC.curMode.bToolBar != "undefined") showToolBar(appFC.curMode.bToolBar, ((IsScanMode && IsTransform) || !IsScanMode) && !IsMultiscanMode && mode);
}

function fcToogleToolBar() {
	appFC.showToolBar = !appFC.showToolBar;

	fcShowToolBar(appFC.showToolBar);
}


///////////////////////////////////////////////////////////////////////////////////////////
// mode
///////////////////////////////////////////////////////////////////////////////////////////

function fcSwitchMode(modeCfg) {
	if (appFC.curMode) {
		fcShowToolBar(false);

		if (appFC.activeDlgCloseFn) appFC.activeDlgCloseFn();
		fcResetActiveDlg();

		if (appFC.curMode.taskCtrl) appFC.curMode.taskCtrl(false);

		fcShowMode(appFC.curMode, false);
	}

	appFC.curMode = modeCfg;

	if (appFC.curMode.taskCtrl) appFC.curMode.taskCtrl(true);

	fcUpdateImgSize(appFC.curMode.imgW, appFC.curMode.imgH);

	adjImageDisplayArea();
	fcUpdateSysInfoWin();
	fcUpdateSysInfoData();

	if (appFC.curMode.start) appFC.curMode.start();

	appFC.baseCanvas = appFC.curMode.drawingCanvas;
	appFC.baseContext = appFC.curMode.drawingContext;
	appFC.drawCanvas = appFC.curMode.tempDrawingCanvas;
	appFC.drawContext = appFC.curMode.tempDrawingContext;
	appFC.imgW = appFC.curMode.imgW;
	appFC.imgH = appFC.curMode.imgH;

	fcShowToolBar(appFC.showToolBar);

	fcShowMode(appFC.curMode, true);
}

function fcIsModeActive(modeCfg) {
	return modeCfg === appFC.curMode;
}

function fcShowMode(modeCfg, mode) {
	showElement(modeCfg.baseId, mode);
}

///////////////////////////////////////////////////////////////////////////////////////////
// image
///////////////////////////////////////////////////////////////////////////////////////////

function fcUpdateImgSize(w, h) {
	appFC.imgW = w;
	appFC.imgH = h;
}

function fcUpdateImage() {
	var cm = appFC.curMode;

	//imageDisplayContext.drawImage(cm.combineCanvas, 0, 0, cm.imgW, cm.imgH, 0, 0, 1920, 1080);
	imageDisplayContext.drawImage(cm.combineCanvas, 0, 0, cm.imgW, cm.imgH, 0, 0, dispW, dispH);
}


///////////////////////////////////////////////////////////////////////////////////////////
// flow
///////////////////////////////////////////////////////////////////////////////////////////

function fcOnResize() {
	if (appFC.curMode) {
		if (appFC.curMode.onResize) appFC.curMode.onResize();
	}

	fcUpdateSysInfoWin();
}

function fcInit() {
	$('#displayCanvas')
		.on('mousedown', fcOnMouseDown)
		.on('mousemove', fcOnMouseMove)
		.on('mouseup', fcOnMouseUp)
		.on('mouseout', fcOnMouseOut)
		.on('touchstart', fcOnTouchStart)
		.on('touchend', fcOnTouchEnd)
		.on('touchmove', fcOnTouchMove)
		.on('touchcancel', fcOnTouchCancel);

	fcInitSysInfoWin();
}


///////////////////////////////////////////////////////////////////////////////////////////
// touch event
///////////////////////////////////////////////////////////////////////////////////////////

function fcOnTouchStart(event) {
	fcTouchHandler(event);
}

function fcOnTouchEnd(event) {
	fcTouchHandler(event);
}

function fcOnTouchMove(event) {
	fcTouchHandler(event);
}

function fcOnTouchCancel(event) {
	//console.log('fcOnTouchCancel');
}

function fcTouchHandler(event) {
	if (!event.originalEvent) {
		return;
	}

	setHideIconCountdown();

	var touches = event.originalEvent.changedTouches;
	var first = touches[0];
	var type = "";

	//console.log(event);

	switch (event.type) {
		case "touchstart": type = "mousedown"; break;
		case "touchmove": type = "mousemove"; break;
		case "touchend": type = "mouseup"; break;
		default: return;
	}

	// var simulatedEvent = document.createEvent("MouseEvent");
	// simulatedEvent.initMouseEvent(type, true, true, window, 1,
	// 	first.screenX, first.screenY,
	// 	first.clientX, first.clientY, false,
	// 	false, false, false, 0, null);

	var press = (type == "mousemove") ? 1 : 0;

	var simulatedEvent = new MouseEvent(type, {
		bubbles: true,
		cancelable: true,
		view: window,
		detail: 1,
		screenX: first.screenX,
		screenY: first.screenY,
		clientX: first.clientX,
		clientY: first.clientY,
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		metaKey: false,
		button: 0,
		buttons: press,
		relatedTarget: null
	});

	first.target.dispatchEvent(simulatedEvent);

	if (event.pointerType === "pen") {
		// 不阻止 Apple Pencil 預設行為
		return;
	}
	event.preventDefault();
}


///////////////////////////////////////////////////////////////////////////////////////////
// mouse event
///////////////////////////////////////////////////////////////////////////////////////////

var hideIconInterval = null;
var hideIconCountdown = 0;

function setHideIconCountdown() {
	if (fullPhotoMode) {
		var btn = document.getElementById('sys_fullPhoto');
		btn.style.backgroundColor = appCfg.toolBarColorLeave;
		btn.style.opacity = appCfg.toolBarOpacityLeave;

		hideIconCountdown = 3;

		if (!hideIconInterval) {
			hideIconInterval = setInterval(function () {

				hideIconCountdown -= 1;

				//console.log("hideIcondown = " + hideIconCountdown);

				if (hideIconCountdown == 0) {
					if (fullPhotoMode) {
						var btn = document.getElementById('sys_fullPhoto');
						btn.style.backgroundColor = appCfg.toolBarColorHide;
						btn.style.opacity = appCfg.toolBarOpacityHide;
					}

					clearInterval(hideIconInterval);
					hideIconInterval = null;
				}
			}, 1000);
		}
	}
}

var lastMouseEvent;

function fcOnMouseMove(event) {
	if (appFC.fnDraw) {
		if (appFC.drawing) {
			if (event.buttons == 0) {
				if (typeof lastMouseEvent === 'undefined')
					lastMouseEvent = event;

				// Fix
				// move outside drawing area and release left button
				// then move back will cause error
				//fcSetDrawCurPos(event);
				fcSetDrawCurPos(lastMouseEvent);

				appFC.fnDraw(DrawState.end);

				appFC.drawing = false;

				if (appFC.drawingMove) {
					fcCanvasCtrl(DrawState.end);
				}
			}
			else {
				fcSetDrawCurPos(event);
				lastMouseEvent = event;

				appFC.drawingMove = true;

				appFC.fnDraw(DrawState.move);

				fcCanvasCtrl(DrawState.move);
			}
		}
	}

	if (fnDisplayPicture) {
		var eleId = '#importPictureWin';
		var pd = $(eleId).data('picData');

		if (pd.mouseDown) {
			if (pd.type == 0) {
				moveEx(event);
			}
			else {
				updateSizeEx(pd.type, event);
			}
		}
	}

	setHideIconCountdown();
}

function fcOnMouseDown(event) {
	fcMouseEventNotify(UiType.displayCanvas, MouseStatus.click, event);

	if (appFC.fnDraw && !(IsRecording && !IsPause)) {
		fcClearDrawingCanvas();

		appFC.drawing = true;
		appFC.drawingMove = false;

		fcSetDrawStartPos(event);

		appFC.fnDraw(DrawState.start);

		fcCanvasCtrl(DrawState.start);
	}
}

function fcOnMouseUp(event) {
	if (appFC.fnDraw) {
		if (appFC.drawing) {
			fcSetDrawCurPos(event);

			appFC.fnDraw(DrawState.end);

			appFC.drawing = false;

			// 20220612
			// if ( appFC.drawingMove )
			// {
			// 	fcCanvasCtrl(DrawState.end);
			// }

			fcCanvasCtrl(DrawState.end);
		}
	}

	if (fnDisplayPicture) {
		var eleId = '#importPictureWin';
		var pd = $(eleId).data('picData');
		pd.mouseDown = false;

		updateImgSizeEx();
		fnDisplayPicture = false;
	}
}

function fcOnMouseOut(event) {
	//console.log('fcOnMouseOut');
	if (appFC.fnDraw) {
		// btn_eraser = 2
		if (appFC.drawing && getToolBarSelectedBtnIdx(drawingToolBarData, 1) == 2) {
			appFC.fnDraw(DrawState.end);
			fcCanvasCtrl(DrawState.end); // add 20220612
		}
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
// canvas
///////////////////////////////////////////////////////////////////////////////////////////

function fcClearCanvas(canvas) {
	//context.clearRect(0, 0, canvas.width, canvas.height);
	if (canvas)
		canvas.width += 0;
}

function fcClearDispCanvas() {
	var canvas = document.getElementById("displayCanvas");
	canvas.width += 0;
}

function fcClearDrawingCanvas() {
	fcClearCanvas(appFC.drawCanvas);
}

function fcPushDrawingCanvas(modeCfg) {
	if (modeCfg.canvasArray.length) {
		if (modeCfg.canvasStep != (modeCfg.canvasArray.length - 1)) {
			modeCfg.canvasArray.length = modeCfg.canvasStep + 1;
		}
	}

	modeCfg.canvasStep += 1;

	modeCfg.canvasArray.push(modeCfg.drawingCanvas.toDataURL());
}

function fcResetCanvasArray(modeCfg) {
	// clear backup canvas

	modeCfg.canvasArray.length = 0;

	modeCfg.canvasStep = -1;

	// clear drawing canvas

	fcClearCanvas(modeCfg.drawingCanvas);

	// save clean canvas

	fcPushDrawingCanvas(modeCfg);
}

function fcInitCanvasArray(modeCfg) {
	modeCfg.canvasArray = new Array();

	fcResetCanvasArray(modeCfg);
}

function fcShowDisplayCanvas(mode) {
	showElement('displayCanvas', mode);
}

///////////////////////////////////////////////////////////////////////////////////////////
// drawing
///////////////////////////////////////////////////////////////////////////////////////////

function fcUpdateDrawStyle() {
	appFC.drawStyle = 'rgba(' + appFC.colorR + ', ' + appFC.colorG + ', ' + appFC.colorB + ', ' + appFC.opacity + ')';

	appFC.eraserStyle = 'rgba(' + appFC.colorR + ', ' + appFC.colorG + ', ' + appFC.colorB + ', ' + appCfg.eraserOpacity + ')';

	//console.log(appFC.drawStyle);
}

function fcDrawConvertRatio() {
	return 1;
	//return appFC.imgW / dispW;
}

function fcSetDrawStartPos(event) {
	// console.log(event);
	// var id$ = $('#displayCanvas');
	// var pos = id$.position();
	// console.log(pos.left, pos.top);

	// appFC.drawStartX = event.offsetX - pos.left;
	// appFC.drawStartY = event.offsetY - pos.top;
	// appFC.drawCurX = appFC.drawLastX = appFC.drawStartX;
	// appFC.drawCurY = appFC.drawLastY = appFC.drawStartY;
	// return;


	var ratio = fcDrawConvertRatio();

	appFC.drawStartX = event.offsetX * ratio;
	appFC.drawStartY = event.offsetY * ratio;

	appFC.drawStartX = Math.floor(appFC.drawStartX * 10) / 10;
	appFC.drawStartY = Math.floor(appFC.drawStartY * 10) / 10;

	appFC.drawCurX = appFC.drawLastX = appFC.drawStartX;
	appFC.drawCurY = appFC.drawLastY = appFC.drawStartY;
}

function fcSetDrawCurPos(event) {
	// var id$ = $('#displayCanvas');
	// var pos = id$.position();
	// console.log(pos.left, pos.top);

	// appFC.drawLastX = appFC.drawCurX;
	// appFC.drawLastY = appFC.drawCurY;
	// appFC.drawCurX = event.offsetX - pos.left;
	// appFC.drawCurY = event.offsetY - pos.top;
	// return;

	var ratio = fcDrawConvertRatio();

	appFC.drawLastX = appFC.drawCurX;
	appFC.drawLastY = appFC.drawCurY;

	appFC.drawCurX = event.offsetX * ratio;
	appFC.drawCurY = event.offsetY * ratio;

	appFC.drawCurX = Math.floor(appFC.drawCurX * 10) / 10;
	appFC.drawCurY = Math.floor(appFC.drawCurY * 10) / 10;
}

function fcDumpDrawPos() {
	console.log("start : " + appFC.drawStartX + ", " + appFC.drawStartY);
	console.log("cur : " + appFC.drawCurX + ", " + appFC.drawCurY);
	console.log("last : " + appFC.drawLastX + ", " + appFC.drawLastY);
}

///////////////////////////////////////////////////////////////////////////////////////////
// drawing canvas control 
///////////////////////////////////////////////////////////////////////////////////////////

function fcCanvasCtrl(state) {
	var mc = appFC.curMode;

	if (mc.canvasCtrl) {
		if (true == mc.canvasCtrl(state)) {
			fcUpdateSysInfoData();
			return;
		}
	}

	switch (state) {
		case DrawState.start:
			if (mc.imageProcess) mc.imageProcess();// test
			break;

		case DrawState.move:
			if (mc.imageProcess) mc.imageProcess();
			break;

		case DrawState.end:
			if (mc.imageProcess) mc.imageProcess();
			break;

		case DrawState.undo:
			if (mc.imageProcess) mc.imageProcess();
			break;

		case DrawState.redo:
			if (mc.imageProcess) mc.imageProcess();
			break;

		case DrawState.mirror:
			if (mc.imageProcess) mc.imageProcess();
			break;

		case DrawState.flip:
			if (mc.imageProcess) mc.imageProcess();
			break;

		case DrawState.brightness:
			if (mc.imageProcess) mc.imageProcess();
			break;

		case DrawState.whiteBalance:
			if (mc.imageProcess) mc.imageProcess();
			break;

		case DrawState.zoom:
			if (mc.imageProcess) mc.imageProcess();
			break;

		case DrawState.pan:
			if (mc.imageProcess) mc.imageProcess();
			break;
	}

	fcUpdateSysInfoData();
}

function fcLoadCanvasFromArray(mc) {
	var storeCanvas = new Image();

	storeCanvas.src = mc.canvasArray[mc.canvasStep];
	storeCanvas.onload = function () {
		fcClearCanvas(mc.drawingCanvas);
		//mc.drawingContext.drawImage(storeCanvas, 0, 0, mc.imgW, mc.imgH);
		mc.drawingContext.drawImage(
			storeCanvas,
			0, 0, mc.imgW, mc.imgH,
			0, 0, mc.imgW, mc.imgH
		);
		if (mc.imageProcess) mc.imageProcess();
	}
}

function fcDrawingUndo(mc) {
	if (mc.canvasStep > 0) {
		mc.canvasStep -= 1;

		fcLoadCanvasFromArray(mc);
	}
}

function fcDrawingRedo(mc) {
	if (mc.canvasStep < (mc.canvasArray.length - 1)) {
		mc.canvasStep += 1;

		fcLoadCanvasFromArray(mc);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// dialog control 
///////////////////////////////////////////////////////////////////////////////////////////

function fcCloseActiveDlg() {
	if (appFC.activeDlgCloseFn) appFC.activeDlgCloseFn();

	fcResetActiveDlg();
}

function fcResetActiveDlg() {
	appFC.activeDlgCloseFn = false;

	appFC.activeDlg = false;

	$("#configDlg").hide();
	$("#zoomDlg").hide();
	$("#configDrawDlg").hide();
	removeCropBox();
	//$("svg").remove();
}

function fcToogleDlg(eleId, openFn, closeFn) {
	if (appFC.activeDlgCloseFn) {
		appFC.activeDlgCloseFn();

		appFC.activeDlgCloseFn = false;
	}

	if (appFC.activeDlg != eleId) {
		appFC.activeDlg = eleId

		if (closeFn) appFC.activeDlgCloseFn = closeFn;

		if (openFn) openFn();
	}
	else {
		appFC.activeDlg = false;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// font 
///////////////////////////////////////////////////////////////////////////////////////////

function fcUpdateFontCfg() {
	var eleId;
	var idx;

	if (1 === appCfg.disableDrawTextSetting) {
		return;
	}

	eleId = document.getElementById('sdfontFamily');
	idx = eleId.selectedIndex;
	appFC.fontFamily = fontFamilyData[idx][FontField.value];

	eleId = document.getElementById('fontStyle');
	idx = eleId.selectedIndex;
	appFC.fontStyle = fontStyleData[idx][FontField.value];

	eleId = document.getElementById('fontSize');
	idx = eleId.selectedIndex;
	appFC.fontSize = fontSizeData[idx][FontField.value];
}

///////////////////////////////////////////////////////////////////////////////////////////
// base image resolution change 
///////////////////////////////////////////////////////////////////////////////////////////
async function fcChangeBaseImageSize(w, h) {
	var mc = appFC.curMode;

	console.log("Change BaseImageSize", w, h);

	// if (mc.baseId == "previewArea") {
	// 	console.log("mc == previewModeCfg");
	// 	return;
	// }

	if (mc.chgBaseImgCtrl) await mc.chgBaseImgCtrl(BaseImgChg.before, w, h);

	previewModeCfg.imgW = w;
	previewModeCfg.imgH = h;
	drawingBoardModeCfg.imgW = w;
	drawingBoardModeCfg.imgH = h;

	resetCanvasGroupSize(previewModeCfg, w, h);
	resetCanvasGroupSize(drawingBoardModeCfg, w, h);
	fcClearDrawingCanvas();
	fcResetCanvasArray(mc);

	// appFC.imgW = w;
	// appFC.imgH = h;
	adjImageDisplayArea();
	fcUpdateSysInfoWin();
	fcUpdateSysInfoData();

	if (mc.chgBaseImgCtrl) await mc.chgBaseImgCtrl(BaseImgChg.after, w, h);

	fcResetZoomRatio(); // 20230429
	fcUpdatePanWin();
	fcUpdateCropWin();
}

///////////////////////////////////////////////////////////////////////////////////////////
// UI mouse event notify 
///////////////////////////////////////////////////////////////////////////////////////////

function fcMouseEventNotify(uiType, mouseEventType, mouseEvent) {
	switch (mouseEventType) {
		case MouseStatus.click:

			//console.log("UI type " + uiType + " click, id = " + mouseEvent.target.id);
			displayPictureWinClose(true);
			break;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// save canvas to internal storage   
///////////////////////////////////////////////////////////////////////////////////////////

function fcGetFilenameByDateTime(extension) {
	var dt = new Date();

	var year = dt.getFullYear();
	var month = dt.getMonth() + 1;
	var date = dt.getDate();
	var hour = dt.getHours();
	var min = dt.getMinutes();
	var sec = dt.getSeconds();
	var ms = dt.getMilliseconds();

	if (month < 10) month = "0" + month;
	if (date < 10) date = "0" + date;
	if (hour < 10) hour = "0" + hour;
	if (min < 10) min = "0" + min;
	if (sec < 10) sec = "0" + sec;

	if (ms < 10) ms = "00" + ms;
	else if (ms < 99) ms = "0" + ms;

	var filename = year + month + date + '-' + hour + min + sec + '-' + ms;

	if (extension != "") {
		filename += '.' + extension;
	}

	return filename;
}

function fcSaveCanvasToFile_withrefleshGallery(canvas) {
	fcSaveCanvasToFile(canvas, "", true);
}

async function saveBlobToMp4(suggName, blob) {
	const options = {
		suggestedName: suggName,
		types: [
			{
				description: 'Mp4 Files',
				accept: {
					'mp4/plain': ['.mp4'],
				},
			},
		],
	};
	saveBlobToFile(blob, options);
}

async function saveBlobToWebm(suggName, blob) {
	const options = {
		suggestedName: suggName,
		types: [
			{
				description: 'Webm Files',
				accept: {
					'Webm/plain': ['.webm'],
				},
			},
		],
	};
	saveBlobToFile(blob, options);
}

async function saveBlobToJpg(suggName, blob) {
	const options = {
		suggestedName: suggName,
		types: [
			{
				description: 'Jpeg Files',
				accept: {
					'Jpeg/plain': ['.jpg'],
				},
			},
		],
	};

	downloadBlob(blob, suggName);

	//saveBlobToFile(blob, options);
}

async function saveBlobToTiff(suggName, blob) {
	const options = {
		suggestedName: suggName,
		types: [
			{
				description: 'Tiff Files',
				accept: {
					'Tiff/plain': ['.tif'],
				},
			},
		],
	};

	saveBlobToFile(blob, options);
}

async function saveBlobToPng(suggName, blob) {
	const options = {
		suggestedName: suggName,
		types: [
			{
				description: 'PNG Files',
				accept: {
					'PNG/plain': ['.png'],
				},
			},
		],
	};

	saveBlobToFile(blob, options);
}

async function saveBlobToFile(blob, options) {
	try {
		const fileHandle = await window.showSaveFilePicker(options);
		const writableStream = await fileHandle.createWritable();

		await writableStream.write(blob);
		await writableStream.close();
	}
	catch (err) {
		console.log(err);
	}
}

async function fcSaveCanvasToFile(canvas, DateStr = "", RefleshGallery = false) {
	if (DateStr == "")
		DateStr = fcGetFilenameByDateTime('');

	console.log(DateStr);

	var filenameSub = DateStr + '.sub';
	var filename = DateStr + '.jpg';

	//if ( appFC.capturing ) return false;
	if (appFC.lastSaveFilename == filename) return false;

	appFC.capturing = true;
	appFC.lastSaveFilename = filename;

	// thumbnail
	var thumbW = appCfg.thumbW;
	var thumbH = appCfg.thumbH;
	var paddingS = appCfg.thumbPadding;
	var w, h;
	w = (thumbW - (paddingS * 2));
	h = (thumbH - (paddingS * 2));

	var subW, subH;

	if (canvas.width / canvas.height > w / h) {
		subW = w;
		subH = canvas.height * w / canvas.width;
	}
	else {
		subW = canvas.width * h / canvas.height;
		subH = h;
	}

	var canvasT = document.getElementById("tempCanvas");
	canvasT.width = subW;
	canvasT.height = subH;

	var ctxT = canvasT.getContext('2d');

	ctxT.drawImage(canvas, 0, 0, subW, subH);


	canvas.toBlob(
		function (blob) {
			saveBlobToJpg(DateStr, blob);
		},
		'image/jpeg',
		1.0
	);
	return;

	const db = await openDatabase();
	const transaction = db.transaction(storeName, 'readwrite');
	const store = transaction.objectStore(storeName);

	//const imageData = canvas.toDataURL(); // 將 Canvas 轉為 Base64

	const data = { name: filename, normalImage: canvas.toDataURL(), thumbnailImage: canvasT.toDataURL() };
	store.add(data);

	if (RefleshGallery) {
		refleshGallery();
	}


	// canvasT.toBlob(
	// 	function (blob) {
	// 		appFs.root.getFile(
	// 			filenameSub,
	// 			{ create: true },
	// 			function (fileEntry) {
	// 				fileEntry.createWriter(
	// 					function (fileWriter) {
	// 						fileWriter.onwriteend = function () {
	// 							//console.log(fileEntry);
	// 							//reflesh all for seq

	// 							//refleshGalleryFillThumbnailDiv();
	// 							//galleryAddThumbnailDiv(fileEntry);
	// 							//appFC.thumbnailCnt += 1;
	// 							//galleryCreateThumbnailDiv(fileEntry, appFC.thumbnailCnt, true);

	// 							//appFC.capturing = false;

	// 							//if ( RefleshGallery )
	// 							if (appFC.curMode.baseId == 'playbackArea') {
	// 								//console.log("reflesah GGG");
	// 								setTimeout(function () {
	// 									refleshGallery();
	// 									closeAndBackPlayback(playbackModeCfg);
	// 								},
	// 									1000);
	// 							}

	// 						};

	// 						fileWriter.write(blob);
	// 					}
	// 				);
	// 			}
	// 		);
	// 	},
	// 	'image/jpeg',
	// 	1.0
	// );

	// canvas.toBlob(
	// 	function (blob) {
	// 		appFs.root.getFile(
	// 			filename,
	// 			{ create: true },
	// 			function (fileEntry) {
	// 				fileEntry.createWriter(
	// 					function (fileWriter) {
	// 						fileWriter.onwriteend = function () {
	// 							//console.log(fileEntry);
	// 							//reflesh all for seq

	// 							//refleshGalleryFillThumbnailDiv();

	// 							// 20220109
	// 							appFC.thumbnailReflesh = true;
	// 							//galleryAddThumbnailDiv(fileEntry);

	// 							//appFC.thumbnailCnt += 1;
	// 							//galleryCreateThumbnailDiv(fileEntry, appFC.thumbnailCnt, true);

	// 							appFC.capturing = false;
	// 						};

	// 						fileWriter.write(blob);
	// 					}
	// 				);
	// 			}
	// 		);
	// 	},
	// 	'image/jpeg',
	// 	1.0
	// );

	return true;
}

async function fcSaveCanvasToPdfExt(arrCanvas) {
	var filename = fcGetFilenameByDateTime('');
	var width = -1; //arrCanvas[0].width;
	var height = -1; //arrCanvas[0].height;

	for (var j = 0; j < arrCanvas.length; j++) {
		if (arrCanvas[j].width > width) width = arrCanvas[j].width;
		if (arrCanvas[j].height > height) height = arrCanvas[j].height;
	}

	//Orientation of the first page. Possible values are "portrait" or "landscape" (or shortcuts "p" or "l").
	var ort = (width > height) ? 'l' : 'p';
	var pdf = new jsPDF({
		orientation: ort, // landscape
		unit: 'pt', // points, pixels won't work properly
		format: [width, height] // set needed dimensions for any element
	});

	for (var i = 0; i < arrCanvas.length; i++) {
		var startX = (width - arrCanvas[i].width) / 2;
		var startY = (height - arrCanvas[i].height) / 2;

		if (i > 0)
			pdf.addPage();

		var imgData = await arrCanvas[i].toDataURL("image/jpeg", 1.0);
		await pdf.addImage(imgData, 'JPEG', startX, startY, arrCanvas[i].width, arrCanvas[i].height);

		//await pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
	}

	pdf.save(filename + ".pdf");
}

async function fcSaveCanvasToFileExt(arrCanvas) {
	var filename = fcGetFilenameByDateTime('');

	if (appFC.lastSaveFilename == filename) return;

	for (var i = 0; i < arrCanvas.length; i++) {
		fcSaveCanvasToFile(arrCanvas[i], filename + "-" + i);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// key down handler    
///////////////////////////////////////////////////////////////////////////////////////////

function fcOnKeyDown(event) {
	if ("Control" == event.key) {
		appFC.ctrlPress = true;

		return;
	}

	switch (event.key) {
		case "I":
		case "i":
			if (appFC.ctrlPress) {
				fcToggleSysInfo();
			}
			break;
	}

	//appFC.ctrlPress = false;
}

function fcOnKeyUp(event) {
	if ("Control" == event.key) {
		appFC.ctrlPress = false;

		return;
	}
}

function fcOnWheel(event) {
	if (appFC.ctrlPress) {
		//event.preventDefault();
		//console.log(event);

		var mc = appFC.curMode;
		var pos = mc.zoomScrollBarPos

		pos -= event.deltaY / 10;
		pos = Math.min(Math.max(pos, 0), appCfg.scrollZoomW);
		zoomScrollBarNotify(appCfg.scrollZoomW, pos);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// system info    
///////////////////////////////////////////////////////////////////////////////////////////

function fcUpdateSysInfoWin() {
	//console.log("UpdateSysInfoWin");
	var css =
	{
		position: 'absolute',
		'margin-left': '0px',
		background: appBaseCfg.ColorLeave,
		opacity: appBaseCfg.OpacityLeave,
	};

	var x, y;
	var w, h;

	w = appCfg.sysInfoWinW;
	h = appCfg.sysInfoWinH;

	x = Math.min((winW - appCfg.toolBarIconW), (dispX + dispW));
	x = x - w;
	y = Math.min((dispY + dispH), (winH - appCfg.drawSetH));

	css.width = w + 'px';
	css.height = h + 'px';
	css.left = (x - appCfg.sysInfoGap) + 'px';
	css.top = (y - appCfg.sysInfoGap - h) + 'px';

	$('#sysInfoWin').css(css);

	$('#configDrawDlg').css("top", "calc(100% - 100px)");
	$('#configDrawDlg').css('left', (winW - 300 - appCfg.toolBarIconW) + "px");

	const offsetLimitX = 0; //320

	var obj = document.getElementById("bottomToolBarData");
	if (obj) {
		var pos = (winW / 2 - 30);
		if (pos < offsetLimitX)
			pos = offsetLimitX;
		obj.style.left = pos + 'px';
		//obj.style.width = '60px';
	}

	// obj = document.getElementById("recordtime");
	// if (obj) {
	// 	var pos = (winW / 2 - 32);
	// 	if (pos < offsetLimitX)
	// 		pos = offsetLimitX;
	// 	obj.style.left = pos + 'px';
	// 	//obj.style.width = '60px';
	// }

	// obj = document.getElementById("recordtime");
	// if (obj && IsRecording) {
	// 	obj.style.right = (document.documentElement.clientWidth / 2 - 30) + "px";
	// }
}

function fcInitSysInfoWin() {
	var idx = 0;

	createSpanElement('uiArea', 'sysInfoWin');

	fcCreateSysInfoElement('appVersion', idx++);
	fcCreateSysInfoElement('cfgVersion', idx++);
	fcCreateSysInfoElement('imgSize', idx++);
	fcCreateSysInfoElement('frmRate', idx++);
	fcCreateSysInfoElement('redoundo', idx++);

	fcShowSysInfo(false);
}

function fcCreateSysInfoElement(subId, idx) {
	var id = 'sysInfoWin' + '-' + subId;

	createLabelElement('sysInfoWin', id);

	var css =
	{
		position: 'absolute',
		'margin-left': '0px',
	};

	css.left = appCfg.sysInfoGap + 'px';
	css.top = (appCfg.sysInfoGap + idx * appCfg.sysInfoH) + 'px';
	css.height = appCfg.sysInfoH + 'px';
	css.width = (appCfg.sysInfoWinW - 2 * appCfg.sysInfoGap) + 'px';

	$('#' + id).css(css);
}

function fcUpdateSysInfoElement(subId, text) {
	var id;

	id = document.getElementById('sysInfoWin' + '-' + subId);

	fcUpdateElementText(id, text);
}

function fcUpdateSysInfoImgSize() {
	var text = appFC.imgW + 'x' + appFC.imgH;

	fcUpdateSysInfoElement('imgSize', text);
}

function fcUpdateSysInfoFrameRate() {
	fcUpdateSysInfoElement('frmRate', appFC.frameRate);
}

function fcUpdateSysInfoCanvasArray() {
	var cm = appFC.curMode;

	var text = (cm.canvasStep + 1) + ' / ' + cm.canvasArray.length;

	fcUpdateSysInfoElement('redoundo', text);
}

function fcUpdateSysInfoAppVersion() {
	fcUpdateSysInfoElement('appVersion', appFC.appVersion);
}

function fcUpdateSysInfoCfgVersion() {
	fcUpdateSysInfoElement('cfgVersion', appCfg.cfgVersion);
}

function fcUpdateSysInfoData() {
	fcUpdateSysInfoAppVersion();

	fcUpdateSysInfoCfgVersion();

	fcUpdateSysInfoImgSize();

	fcUpdateSysInfoFrameRate();

	fcUpdateSysInfoCanvasArray();
}

function fcToggleSysInfo() {
	appFC.showSysInfo = !appFC.showSysInfo;

	fcShowSysInfo(appFC.showSysInfo);
}

function fcShowSysInfo(mode) {
	if (mode) {
		fcUpdateSysInfoWin();
		fcUpdateSysInfoData();
	}

	showElement('sysInfoWin', mode);
}

///////////////////////////////////////////////////////////////////////////////////////////
// icon    
///////////////////////////////////////////////////////////////////////////////////////////

function fcGetDefIconPath(pic) {
	return "url('css/images/" + "icon" + "/" + pic + "')";
}

///////////////////////////////////////////////////////////////////////////////////////////
// element text    
///////////////////////////////////////////////////////////////////////////////////////////

function fcUpdateElementText(id, text) {
	var txt;

	txt = document.createTextNode(text);

	id.innerText = txt.textContent;
}

///////////////////////////////////////////////////////////////////////////////////////////
// zoom
///////////////////////////////////////////////////////////////////////////////////////////

function fcZoomDlgOpen() {
	showZoomDlg(true);
}

function fcZoomDlgClose() {
	showZoomDlg(false);
}

function fcResetZoomRatio() {
	fcUpdateZoomRatio(1, 0);

	$('#zoomDlg-zoom-slider').val(0);
}

function fcUpdateZoomRatio(ratio, pos) {
	var startX, startY;
	var centerX, centerY;
	var w, h;
	var mc = appFC.curMode;

	centerX = mc.zoomX + mc.zoomW / 2;
	centerY = mc.zoomY + mc.zoomH / 2;

	w = mc.imgW / ratio;
	h = mc.imgH / ratio;

	startX = centerX - w / 2;
	startY = centerY - h / 2;

	startX = Math.max(startX, 0);
	startY = Math.max(startY, 0);

	startX = Math.min(startX, (mc.imgW - w));
	startY = Math.min(startY, (mc.imgH - h));

	mc.zoomRatio = ratio;
	mc.zoomX = startX;
	mc.zoomY = startY;
	mc.zoomW = w;
	mc.zoomH = h;

	fcCanvasCtrl(DrawState.zoom);

	if (ratio <= 1) fcShowPanWin(false);
	else fcShowPanWin(true);

	fcUpdateCropWin();

	mc.zoomScrollBarPos = pos;
}

///////////////////////////////////////////////////////////////////////////////////////////
// pan window 
///////////////////////////////////////////////////////////////////////////////////////////

function fcUpdatePanWin() {
	var mc = appFC.curMode;

	var css =
	{
		position: 'absolute',
		'margin-left': '0px',
		background: appCfg.panWinColor,
		opacity: appCfg.panOpacity,
	};

	var x, y;

	var w = dispW / 8;
	var h = dispH / 8;

	x = Math.max(appCfg.toolBarIconW, dispX);
	y = Math.min((dispY + dispH), (winH - appCfg.drawSetH));

	css.width = w + 'px';
	css.height = h + 'px';
	css.left = (x + appCfg.panWinGapX) + 'px';
	css.top = (y - appCfg.panWinGapY - h) + 'px';

	$('#panWin').css(css);

	css.left = 0;
	css.top = 0;
	css.background = 'undefined';
	css.opacity = 1;
	$('#cropWin').css(css);
	updateCanvasSize('cropWin', w, h)

	mc.panWinW = w;
	mc.panWinH = h;
}

function fcUpdateCropWin() {
	var mc = appFC.curMode;
	var x, y, w, h;
	var ratio = mc.panWinW / mc.imgW;
	var canvas;
	var ctx;

	x = mc.zoomX * ratio;
	y = mc.zoomY * ratio;
	w = mc.zoomW * ratio;
	h = mc.zoomH * ratio;

	canvas = document.getElementById('cropWin');
	ctx = canvas.getContext('2d');

	fcClearCanvas(canvas);

	ctx.fillStyle = appCfg.panCropColor;
	ctx.fillRect(x, y, w, h);
}

function fcShowPanWin(mode) {
	showElement('panWin', mode);
	showElement('cropWin', mode);
}

function fcAdjCropWin(offsetX, offsetY) {
	var mc = appFC.curMode;

	var ratio = mc.imgW / mc.panWinW;

	mc.zoomX += (offsetX - appFC.panMoveX) * ratio;
	mc.zoomY += (offsetY - appFC.panMoveY) * ratio;

	mc.zoomX = Math.max(mc.zoomX, 0);
	mc.zoomY = Math.max(mc.zoomY, 0);

	if ((mc.zoomX + mc.zoomW) > mc.imgW) mc.zoomX = mc.imgW - mc.zoomW;
	if ((mc.zoomY + mc.zoomH) > mc.imgH) mc.zoomY = mc.imgH - mc.zoomH;

	fcUpdateCropWin();

	fcCanvasCtrl(DrawState.pan);

	appFC.panMoveX = offsetX;
	appFC.panMoveY = offsetY;
}

function fcInitCropWinEvent() {
	$('#cropWin')
		.on('mousedown', function (event) {
			if (fcCropAreaDetect(event.offsetX, event.offsetY)) {
				appFC.panMove = true;
				appFC.panMoveX = event.offsetX;
				appFC.panMoveY = event.offsetY;
			}
		})
		.on('mousemove', function (event) {
			if (appFC.panMove) {
				fcAdjCropWin(event.offsetX, event.offsetY);
			}
		})
		.on('mouseup', function (event) {
			appFC.panMove = false;
		})
		.on('mouseout', function (event) {
			appFC.panMove = false;
		})
		.on('touchstart', function (event) {
			fcTouchHandler(event);
		})
		.on('touchmove', function (event) {
			fcTouchHandler(event);
		})
		.on('touchend', function () {
			fcTouchHandler(event);
		})
		.on('touchcancel', function () {
			fcTouchHandler(event);
		});

	function fcCropAreaDetect(curX, curY) {
		var mc = appFC.curMode;
		var x, y, w, h;
		var ratio = mc.panWinW / mc.imgW;

		x = mc.zoomX * ratio;
		y = mc.zoomY * ratio;
		w = mc.zoomW * ratio;
		h = mc.zoomH * ratio;

		if (((curX >= x) && (curX <= (x + w))) && ((curY >= y) && (curY <= (y + h)))) return true;

		return false;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// update video resolution 
///////////////////////////////////////////////////////////////////////////////////////////

function fcUpdateVideoResolution() {

	return;

	let eleId;
	let idx;

	if (appFC.reqVideoResolutionList !== appFC.curVideoResolutionList) {
		appFC.curVideoResolutionList = appFC.reqVideoResolutionList;

		appFC.reqVideoResolutionList = false;

		updateVideoResolutionElement(appFC.curVideoResolutionList);
		//updateAudioinputElement();
		eleId = document.getElementById('sdVideoRsoScrollbar');
		idx = eleId.selectedIndex;

		videoW = appFC.curVideoResolutionList[idx][VrField.w];
		videoH = appFC.curVideoResolutionList[idx][VrField.h];

		// if (screen.width < screen.height) {
		// 	if (window.matchMedia("(orientation: portrait)").matches) {
		// 		// 直的
		// 		videoW = appFC.curVideoResolutionList[idx][VrField.h];
		// 		videoH = appFC.curVideoResolutionList[idx][VrField.w];
		// 		// if (appFC.reqImgH < appFC.reqImgW) {
		// 		// 	alert("SWAP I " + appFC.reqImgW + "," + appFC.reqImgH);
		// 		// 	let imgW = appFC.reqImgW;
		// 		// 	appFC.reqImgW = appFC.reqImgH;
		// 		// 	appFC.reqImgH = imgW;
		// 		// }
		// 	}
		// 	else {
		// 		// 橫的
		// 		if (appFC.reqImgH > appFC.reqImgW) {
		// 			alert("SWAP II " + appFC.reqImgW + "," + appFC.reqImgH);
		// 			let imgW = appFC.reqImgW;
		// 			appFC.reqImgW = appFC.reqImgH;
		// 			appFC.reqImgH = imgW; //reqImgW;
		// 		}
		// 	}
		// }


		// if (fcIsModeActive(previewModeCfg)) {
		// 	appFC.checkVideoResolution = true;
		// }
	}
}

function fcUpdateSelVideoResolutionIdx(idx) {
	var i;

	if (idx <= (appFC.curVideoResolutionList.length - 1)) {
		for (i = 0; i < appFC.curVideoResolutionList.length; i++) {
			appFC.curVideoResolutionList[i][VrField.data] = 0;
		}

		appFC.curVideoResolutionList[idx][VrField.data] = 1;

		// 0516
		//chrome.storage.local.set({'resolutionIdx':idx});
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// multi-language 
///////////////////////////////////////////////////////////////////////////////////////////

function fcUpdateElementTitle(eleId, strId) {
	var ele;

	ele = document.getElementById(eleId);

	if (ele) {
		//ele.title = chrome.i18n.getMessage(strId);

		ele.title = get_i18n_Message(strId);

		//ele.title = LanguageJson[eleId].message;
	}
}

function setElementText(eleId, strId) {
	var ele;

	ele = document.getElementById(eleId);

	if (ele) {
		//ele.title = chrome.i18n.getMessage(strId);
		//ele.text = get_i18n_Message(strId);

		ele.innerHTML = get_i18n_Message(strId);
	}
}

function get_i18n_Message(strId) {
	// Only English is complete
	if (LanguageJson[strId] == null ||
		LanguageJson[strId] === undefined) {
		return LanguageJsonDefault[strId]['message'];
	}
	else {
		return LanguageJson[strId]['message'];
	}
}

function fcUpdateElementHtml(eleId, strId) {
	var ele;

	ele = document.getElementById(eleId);

	if (ele) {
		$('#' + eleId).html(chrome.i18n.getMessage(strId));
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// size change
///////////////////////////////////////////////////////////////////////////////////////////

var winW;
var winH;

var titleW;
var titleH;

var resizeInterval = null;

window.onresize = function (event) {
	if (appBaseCfg.resizeDelayMs) {
		//console.log(appFC.resizeDelayMs);
		appFC.resizeDelayMs = appBaseCfg.resizeDelayMs;

		if (resizeInterval)
			return;

		resizeInterval = setInterval(function () {
			appFC.resizeDelayMs -= appBaseCfg.resizeDelayMs / 2;
			if (appFC.resizeDelayMs <= 0) {
				clearInterval(resizeInterval);
				resizeInterval = null;
				updateSize();
			}
		}, appBaseCfg.resizeDelayMs / 2);

		// setTimeout(function() {
		// 	updateSize();
		// 	appFC.resizeDelayMs = appBaseCfg.resizeDelayMs;
		// }, appFC.resizeDelayMs);
	}
	else {
		updateSize();
	}
};

function updateWinSize() {
	winW = window.innerWidth;
	winH = window.innerHeight;
	//console.log('win size = ' + winW + 'x' + winH);
}

function updateSize() {
	updateWinSize();

	updateTitleBarSize();

	adjImageDisplayAreaEx();

	fcOnResize();

	resizePictureWin();

	resizeConfirmDlg();

	if ($('#lbMsCnt').length > 0) {
		$('#lbMsCnt').css({
			top: winH - 80,
			left: (winW / 2)
		});
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
// init
///////////////////////////////////////////////////////////////////////////////////////////

window.onmousemove = function () {
	setHideIconCountdown();
}

// window.ontouchstart = function()
// {
// 	setHideIconCountdown();
// }

// window.ontouchmove = function()
// {
// 	setHideIconCountdown();
// }

async function loadConfig() {
	// chrome.storage.local.get(['resolutionIdx'], async function(item){
	// 	if ( item !== undefined && item.resolutionIdx !== undefined)
	// 		appBaseCfg.resolutionIdx = item.resolutionIdx;
	// });

	// const response = await chrome.storage.local.get(['languageIdx'], async function(item){

	// 	if ( item !== undefined && item.languageIdx !== undefined)
	// 	{
	// 		appBaseCfg.languageIdx = item.languageIdx;
	// 		document.getElementById('sdLanguageFamily').selectedIndex = item.languageIdx;
	// 	}

	// 	loadTranslatedString();
	// });
}

window.onload = async function () {
	//await loadConfig();	

	updateSize();

	cfgBody();

	initToolBar();
	hideAllToolBars();

	//initColorBar();
	//initScrollBar();
	initScrollBarDlg();
	initSettingDlg();
	initTextInputDlg();
	initPictureWin();
	initConfigDlg();
	initConfigDrawDlg();

	preInitAboutDlg();
	initAboutDlg();
	afterInitAboutDlg();

	initPeriodicCaptureDlg();
	initPeriodicCaptureInfoBar();
	initConfirmDlg();

	cfgTitleBar();

	fcInit();

	// try {
	// 	initializeDevices();
	// 	//await tryConnectDevice();
	// 	//connectVideoSrc();
	// }
	// catch (e) {

	// }

	previewModeCfg.init();
	playbackModeCfg.init();
	drawingBoardModeCfg.init();

	galleryInit();

	fcSwitchMode(previewModeCfg);

	try {
		await initializeDevices();
		//await tryConnectDevice();
		//connectVideoSrc();
	}
	catch (e) {

	}

	updateVideoStreamFrame();
	//intVideoStreamActiveCheck();

	updateTranslatedString();
};

var LanguageJson;
var LanguageJsonDefault;

async function loadTranslatedString() {
	var jsonPath = LanguageData[appBaseCfg.languageIdx][2];

	const response = await $.getJSON("./locales/en/messages.json", async function (dataDef) {
		LanguageJsonDefault = dataDef;

		const response2 = await $.getJSON(jsonPath, function (data) {

			LanguageJson = data;
		});
	});
}

function updateTranslatedString() {
	var tbl = [

		["btn_freehand", "btnFreehand"],
		["btn_arrow", "btnArrow"],
		["btn_eraser", "btnEraser"],
		["btn_line", "btnLine"],
		["btn_rectangleLine", "btnRectangle"],
		["btn_rectangle", "btnFilledRectangle"],
		["btn_circleLine", "btnEllipse"],
		["btn_circle", "btnFilledEllipse"],
		["btn_erase_all", "btnEraseAll"],
		["btn_text", "btnText"],
		["btn_configDraw", "btnConfigDraw"],

		["btn_setting", "btnSetting"],
		["btn_capture", "btnCapture"],
		["btn_freeze", "btnFreezeLiveView"],
		["btn_timesave", "btnIntervalShooting"],
		["btn_mirrow", "btnFlipVertical"],
		["btn_flip", "btnFlipHorizontal"],
		["btn_zoom", "btnZoom"],
		["btn_importPic", "btnImportImageFile"],
		["btn_redo", "btnRedo"],
		["btn_undo", "btnUndo"],
		["btn_record", "btnRecord"],
		["btn_whitebalance", "btnWhiteBalance"],
		["btn_brightness", "btnBrightness"],
		["btn_config", "btnConfig"],

		["mode_about", "btnAbout"],
		["mode_preview", "btnLiveView"],
		["mode_playback", "btnGallery"],
		["mode_drawingBoard", "btnDrawingBoard"],
		["mode_scan", "btnScanMode"],
		["mode_multiscan", "btnMultiScanMode"],

		["sys_close", "btnCloseWindow"],
		["sys_fullScreen", "btnMaxWindow"],
		["sys_fullPhoto", "btnHideFunctionIcon"],
		["sys_smallScreen", "btnMinWindow"],

		["btn_saveDisk", "btnSaveToDisk"],
		["btn_delete", "btnDelete"],
		["btn_toggleAll", "btnToogleSelectAll"],
		["btn_Next", "btn_Next"],
		["btn_Previous", "btn_Previous"],

		["ppbtn_savePlayback", "btnSaveToGallery"],
		["ppbtn_closeAndBackPlayback", "btnBackToGallery"],
		["ppbtn_zoom", "btnZoom"],
		["ppbtn_importPic", "btnImportImageFile"],
		["ppbtn_redo", "btnRedo"],
		["ppbtn_undo", "btnUndo"],
		["ppbtn_transform", "ppbtn_transform"],
		["ppbtn_ocr", "ppbtn_ocr"],

		["dbbtn_savePlayback", "btnSaveToGallery"],
		["dbbtn_redo", "btnRedo"],
		["dbbtn_undo", "btnUndo"],
		["dbbtn_importPic", "btnImportImageFile"],

		["sdVideoRsoIcon", "textVideoResolution"],
		["sdFontIcon", "textFont"],

		["periodicCaptureDlg_periodIcon", "textInterval"],
		["periodicCaptureDlg_intervalIcon", "textDuration"],
		["periodicCaptureDlg_startIcon", "btnStart"],

		["periodicCaptureInfoBar", "btnCancel"],

		["drawingOpacity", "textTransparency"],
		["drawingLineWidth", "textWidth"],


		["scbtn_transform", "scbtn_transform"],
		["scbtn_importPic", "scbtn_importPic"],
		["scbtn_fullcrop", "scbtn_fullcrop"],
		["scbtn_redo", "scbtn_redo"],
		["scbtn_redo2", "scbtn_redo"],
		["scbtn_undo", "scbtn_undo"],
		["scbtn_undo2", "scbtn_undo"],
		["scbtn_preview", "scbtn_preview"],
		["scbtn_saveDisk", "scbtn_saveDisk"],
		["scbtn_ocr", "scbtn_ocr"],
		["scbtn_flip", "scbtn_flip"],
		["scbtn_mirrow", "scbtn_mirrow"],
		["scbtn_fullcrop", "scbtn_fullcrop"],

		["mscbtn_capture", "mscbtn_capture"],
		["mscbtn_merge", "mscbtn_merge"],
		["mscbtn_fullcrop", "mscbtn_fullcrop"],

		["configDlg-brightness-icon", "config_brightness"],
		["configDlg-brightness-slider", "config_brightness"],
		["configDlg-brightness-reset", "config_reset"],
		["configDlg-rotate-icon", "config_rotate"],
		["configDlg-rotate-slider", "config_rotate"],
		["configDlg-rotate-reset", "config_reset"],
		["configDlg-whiteBalence-icon", "config_wb"],
		["configDlg-whiteBalence-slider", "config_wb"],
		["configDlg-whiteBalence-reset", "config_reset"],

		["dialogSave", "dlgSave"]
	];

	var tbl2 = [
		["pbFileInfo_Text", "lbPage"],
		["fontStyle-lbNormal", "lbNormal"],
		["fontStyle-lbBold", "lbBold"],
		["fontStyle-lbItalic", "lbItalic"],
		["fontStyle-lbBoldItalic", "lbBoldItalic"],
		["periodicCaptureDlg_periodUnit", "lbSeconds"],
		["periodicCaptureDlg_intervalUnit", "lbMinutes"]
	];

	var i;
	var eleId = document.getElementById('sdLanguageFamily');
	var idx = eleId.selectedIndex;
	var jsonPath = LanguageData[idx][2];

	appBaseCfg.languageIdx = idx;

	//chrome.storage.local.set({'languageIdx':idx});

	$.getJSON(jsonPath, function (data) {

		LanguageJson = data;

		//console.log(LanguageJson, tbl[0][0], tbl[0][1]);

		for (i = 0; i < tbl.length; i++) {
			fcUpdateElementTitle(tbl[i][0], tbl[i][1]);
		}

		for (i = 0; i < tbl2.length; i++) {
			setElementText(tbl2[i][0], tbl2[i][1]);
		}
	});
}


///////////////////////////////////////////////////////////////////////////////////////////
// key down handler
///////////////////////////////////////////////////////////////////////////////////////////

document.body.addEventListener('keydown', function (event) {
	fcOnKeyDown(event);
});

document.body.addEventListener('keyup', function (event) {
	fcOnKeyUp(event);
});

document.body.addEventListener('wheel', function (event) {
	fcOnWheel(event);
});

///////////////////////////////////////////////////////////////////////////////////////////
// block context menu
///////////////////////////////////////////////////////////////////////////////////////////

(function () {
	function stop() {
		return false;
	}

	document.oncontextmenu = stop;
})();



var galleryData;
const ItemsPerPage = 30;

async function getGalleryCount(db) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, "readonly");
		const store = transaction.objectStore(storeName);
		const countRequest = store.count();

		countRequest.onsuccess = () => {
			resolve(countRequest.result);
		};

		countRequest.onerror = () => {
			reject(countRequest.error);
		};
	});
}

var GalleryUpdating = false;

async function refleshGallery() {
	if (GalleryUpdating) {
		return;
	}
	GalleryUpdating = true;

	galleryData = [];

	const db = await openDatabase();
	const transaction = db.transaction(storeName, 'readonly');
	const store = transaction.objectStore(storeName);
	// appFC.thumbnailReflesh = false;
	// appFC.thumbnailEntries = null;

	// const request = store.getAll();
	// request.onsuccess = event => {
	// 	const images = event.target.result;
	// 	if (images.length >= 0) {
	// 		console.log(images);
	// 		galleryData = images;
	// 		galleryFillThumbnailDiv_Page();
	// 	} else {
	// 		//alert('無圖片可讀取');
	// 	}
	// };

	const countRequest = store.count();

	countRequest.onsuccess = () => {
		var ValidEntry = countRequest.result;

		appFC.thumbnailTotalPage = parseInt((ValidEntry - 1) / ItemsPerPage) + 1;
		appFC.thumbnailCurrPage = Math.min(appFC.thumbnailCurrPage, appFC.thumbnailTotalPage - 1);

		let index = 0; // 用於追踪當前游標位置
		var startIndex = ItemsPerPage * appFC.thumbnailCurrPage;
		var endIndex = Math.min(startIndex + ItemsPerPage, ValidEntry);

		//console.log("Gallery RNG", startIndex, endIndex, ValidEntry);

		const transaction = db.transaction(storeName, 'readonly');
		const store = transaction.objectStore(storeName);
		const request = store.openCursor(null, 'prev');

		request.onsuccess = (event) => {
			const cursor = event.target.result;

			if (cursor) {
				if (index >= startIndex && index < endIndex) {
					// 只加入範圍內的資料
					galleryData.push(cursor.value);
				}

				index++; // 移到下一筆

				if (index < endIndex) {
					cursor.continue(); // 繼續讀取下一筆
				} else {
					// 當達到目標範圍時結束
					galleryFillThumbnailDiv_Page();
					GalleryUpdating = false;
					return;
				}
			}
			else {
				// 如果游標已經到達結束
				galleryFillThumbnailDiv_Page();
				GalleryUpdating = false;
				return;
			}
		};
	};
}

function galleryFillThumbnailDiv_Page() {
	appFC.thumbSelectedFileCnt = 0;
	appFC.thumbnailCnt = 0;
	appFC.thumbFileCnt = 0;

	playbackShowThumbnail(false);
	$('#thumbDiv').empty();

	//console.log(galleryData);

	// var ValidEntry = galleryData.length;

	// appFC.thumbnailTotalPage = parseInt((ValidEntry - 1) / ItemsPerPage) + 1;
	// appFC.thumbnailCurrPage = Math.min(appFC.thumbnailCurrPage, appFC.thumbnailTotalPage - 1);

	// var startIndex = ItemsPerPage * appFC.thumbnailCurrPage;
	// var endIndex = Math.min(startIndex + ItemsPerPage, ValidEntry);

	for (var i = 0; i < galleryData.length; i++) {
		//for (var i = startIndex; i < endIndex; i++) {
		if (galleryData[i].name.indexOf(".jpg") > 0) {
			appFC.thumbnailCnt += 1;
			galleryCreateThumbnailDivEx(galleryData[i], i);
		}

		if (galleryData[i].name.indexOf(".mp4") > 0 ||
			galleryData[i].name.indexOf(".webm") > 0) {
			galleryCreateVideoDiv(galleryData[i], i);
		}
	}

	galleryUpdateFileInfo();

	//playbackShowThumbnail(true);

	setTimeout(function () {
		playbackShowThumbnail(true);
	}, 100);
}

function galleryCreateThumbnailDivEx(data, no, insertFirst = false) {
	var divId = 'thumb' + '_' + no;
	var imgId = 'img' + '_' + no;
	var eleId;
	var thumbW = appCfg.thumbW;
	var thumbH = appCfg.thumbH;
	var paddingS = appCfg.thumbPadding;
	var w, h;

	// div
	if (insertFirst) {
		var temp = document.createElement("div");
		temp.id = divId;
		document.getElementById('thumbDiv').prepend(temp);
	}
	else {
		createDivElement('thumbDiv', divId);
	}

	w = (thumbW - (paddingS * 2));
	h = (thumbH - (paddingS * 2));

	eleId = '#' + divId;

	$(eleId).css('width', w + 'px');
	$(eleId).css('height', h + 'px');
	$(eleId).css('padding', paddingS + 'px');
	//$(eleId).css('display', 'block');
	$(eleId).css('position', 'relative');
	$(eleId).css('display', 'inline-block');
	//$(eleId).css('transform', 'translateZ(0)');
	//transform: translateZ(0);

	// img
	createImgElement(divId, imgId);

	var imageSub = new Image();

	imageSub.addEventListener("load",
		function () {
			var size = galleryGetFitSize(w, h, imageSub.width, imageSub.height);
			var border = appCfg.thumbFrmSize + 'px' + ' solid ' + appCfg.thumbFrmColorNormal;

			eleId = '#' + imgId;

			var css =
			{
				left: size.x + paddingS,
				top: size.y + paddingS,
				width: size.w,
				height: size.h,
				position: 'absolute',
				border: border,
			};

			$(eleId).css(css);

			$(eleId).addClass('thumbImg');

			eleId = document.getElementById(imgId);
			eleId.src = data.thumbnailImage;
			eleId.fileName = data.name;
			eleId.checked = false;

			$(eleId).on('click', function (event) {
				var ele = document.getElementById(event.target.id);
				var bkColor;
				var borderCfg;

				if (ele.checked) {
					ele.checked = false;
					bkColor = appCfg.thumbFrmColorNormal;
					galleryReductSelectedFile();
				}
				else {
					gallerySelectAll(false);

					ele.checked = true;
					bkColor = appCfg.thumbFrmColorChecked;
					galleryAddSelectedFile();
				}

				borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
				$(this).css('border', borderCfg);
				$(this).toggleClass('selected');
			});

			$(eleId).dblclick(function () {
				var eleId = document.getElementById(this.id);

				eleId.checked = true;
				var bkColor = appCfg.thumbFrmColorChecked;
				galleryAddSelectedFile();
				var borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
				$(this).css('border', borderCfg);
				$(this).toggleClass('selected');


				var imageOrg = new Image();
				imageOrg.src = data.normalImage;
				imageOrg.addEventListener("load", function () {
					playbackDisplayImgMode(imageOrg);
				});
			});

			galleryAddFileFinish();
		}
	);

	imageSub.src = data.thumbnailImage;
}

function galleryCreateVideoDiv(data, no, insertFirst = false) {
	var divId = 'thumb' + '_' + no;
	var imgId = 'img' + '_' + no;
	var iconId = "vIcon_" + no;
	var eleId;
	var thumbW = appCfg.thumbW;
	var thumbH = appCfg.thumbH;
	var paddingS = appCfg.thumbPadding;
	var w, h;

	// div
	if (insertFirst) {
		var temp = document.createElement("div");
		temp.id = divId;
		document.getElementById('thumbDiv').prepend(temp);
	}
	else {
		createDivElement('thumbDiv', divId);
	}

	//createDivElement('thumbDiv', divId);

	w = (thumbW - (paddingS * 2));
	h = (thumbH - (paddingS * 2));

	eleId = '#' + divId;

	$(eleId).css('width', w + 'px');
	$(eleId).css('height', h + 'px');
	$(eleId).css('padding', paddingS + 'px');
	//$(eleId).css('display', 'block');
	$(eleId).css('position', 'relative');
	$(eleId).css('display', 'inline-block');
	//$(eleId).css('transform', 'translateZ(0)');

	// Video

	//createVideoElement(divId, imgId);
	let parent = document.getElementById(divId);
	let child = document.createElement("video");
	child.id = imgId;
	parent.appendChild(child);
	// child.setAttribute('playsinline', '');
	// child.setAttribute('webkit-playsinline', '');

	createDivElement(divId, iconId);

	var size = galleryGetFitSize(w, h, 1280, 720);
	//console.log(size);
	//var size = galleryGetFitSize(w, h, image.width, image.height);
	var border = appCfg.thumbFrmSize + 'px' + ' solid ' + appCfg.thumbFrmColorNormal;

	eleId = '#' + imgId;

	var css =
	{
		left: size.x + paddingS,
		top: size.y + paddingS,
		width: size.w,
		height: size.h,
		position: 'absolute',
		border: border,
	};

	$(eleId).css(css);
	$(eleId).addClass('thumbImg');

	eleId = document.getElementById(imgId);

	if (data.name.indexOf(".mp4") > 0) {
		eleId.src = URL.createObjectURL(data.video);
	}
	else { // webm
		//eleId.src = data.video;
		eleId.src = URL.createObjectURL(data.video);
	}

	eleId.autoplay = false;
	eleId.controls = false;
	eleId.loop = false;

	eleId.fileName = data.name;
	eleId.checked = false;

	css =
	{
		right: 6,
		bottom: 17,
		width: 36,
		height: 12,
		position: "absolute",
		backgroundColor: "#000",
		color: "#EEE",
		textAlign: "center",
		fontSize: 12,
		opacity: .75
	};

	$('#' + iconId).css(css);

	eleId.addEventListener("loadedmetadata", function () {
		var a = Math.round(eleId.duration);
		document.getElementById(iconId).innerText = Math.floor(a / 60) + ":" + padLeft(a % 60, 2)
	});

	$(eleId).on('click', function (event) {
		var ele = document.getElementById(event.target.id);
		var bkColor;
		var borderCfg;

		// new for extension
		// if (chrome.WindowState == "fullscreen") {
		// 	return;
		// }

		// if (chrome.app.window.current().isFullscreen() )
		// {
		// 	return;
		// }

		//console.log(ele.checked);

		if (ele.checked) {
			ele.checked = false;
			bkColor = appCfg.thumbFrmColorNormal;
			galleryReductSelectedFile();
		}
		else {
			gallerySelectAll(false);

			ele.checked = true;
			bkColor = appCfg.thumbFrmColorChecked;
			galleryAddSelectedFile();
		}
		borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
		$(this).css('border', borderCfg);
		$(this).toggleClass('selected');
	});

	$(eleId).dblclick(function () {
		var eleId = document.getElementById(this.id);

		eleId.checked = true;
		var bkColor = appCfg.thumbFrmColorChecked;
		galleryAddSelectedFile();
		var borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
		$(this).css('border', borderCfg);
		$(this).toggleClass('selected');

		//console.log(eleId);
		eleId.muted = false;
		eleId.currentTime = 0;
		//eleId.style.border = 'none';	

		//eleId.webkitRequestFullScreen();
		enterFullscreen(eleId);
	});

	eleId.addEventListener('ended', function (e) {
		if (document.fullscreenElement != null) {
			document.exitFullscreen();
		}
	}, false);

	eleId.addEventListener('mouseover', function (e) {
		var playPromise = eleId.play();
		if (playPromise !== undefined) {
			playPromise.then(_ => {

				eleId.muted = true;
				eleId.play();
			})
				.catch(error => {
					// Auto-play was prevented
					// Show paused UI.
				});
		}
	});

	eleId.addEventListener('mouseleave', function (e) {
		var playPromise = eleId.play();
		if (playPromise !== undefined) {
			playPromise.then(_ => {

				//eleId.stop();
				eleId.pause();
				eleId.currentTime = 0;
			})
				.catch(error => {
					// Auto-play was prevented
					// Show paused UI.
				});
		}
	});
	galleryAddFileFinish();
}

function enterFullscreen(element) {
	if (element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen(); // Chrome, Safari
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen(); // Firefox
	} else if (element.requestFullscreen) {
		element.requestFullscreen(); // 標準 API
	} else if (element.msRequestFullscreen) {
		element.msRequestFullscreen(); // IE/Edge
	} else {
		console.error('不支援全螢幕 API');
	}
}

// function galleryFillThumbnailDiv() {
// 	//console.log("galleryFillThumbnailDiv");

// 	if (!appFs) {
// 		setTimeout(function () {
// 			galleryFillThumbnailDiv();
// 		},
// 			50);

// 		return;
// 	}

// 	var dirReader = appFs.root.createReader();

// 	dirReader.readEntries(
// 		enumFiles,
// 		errorHandler
// 	);

// 	function enumFiles(entries) {
// 		//console.log(entries);

// 		if (entries.length == 100) {
// 			dirReader.readEntries(
// 				enumFiles,
// 				errorHandler
// 			);
// 		}

// 		for (var i = 0; i < entries.length; i++) {
// 			if (entries[i].isFile) {
// 				if (-1 != entries[i].name.indexOf(".jpg")) {
// 					appFC.thumbnailCnt += 1;

// 					//console.log(entries[i].name);

// 					galleryCreateThumbnailDiv(entries[i], appFC.thumbnailCnt);
// 				}

// 				if (-1 != entries[i].name.indexOf(".mp4")) {
// 					appFC.thumbnailCnt += 1;

// 					galleryCreateVideoDiv(entries[i], appFC.thumbnailCnt);
// 				}
// 			}
// 		}
// 	}

// 	function errorHandler(fe) {
// 		console.log(fe.code);
// 	}
// }

///////////////////////////////////////////////////////////////////////////////////////////
// delete file 
///////////////////////////////////////////////////////////////////////////////////////////

function galleryDeleteFiles(eleId) {
	var i;
	const dbRequest = indexedDB.open(dbName);

	dbRequest.onsuccess = event => {
		const db = event.target.result;
		const transaction = db.transaction(storeName, 'readwrite');
		const store = transaction.objectStore(storeName);

		// 建立游標 (cursor) 來搜尋符合的資料
		const cursorRequest = store.openCursor();

		cursorRequest.onsuccess = event => {
			const cursor = event.target.result;
			if (cursor) {
				for (i = 0; i < eleId.length; i++) {
					if (cursor.value.name === eleId[i].fileName) {
						cursor.delete(); // 刪除符合的資料
						console.log(`已刪除檔案：${eleId[i].fileName}`);
					} else {
						cursor.continue(); // 繼續搜尋
					}
				}

			}
		};

		cursorRequest.onerror = event => {
			console.error('搜尋過程中發生錯誤:', event.target.error);
		};
	};

	dbRequest.onerror = event => {
		console.error('資料庫開啟失敗:', event.target.error);
	};

	// for (i = 0; i < eleId.length; i++) {
	// 	if (eleId[i].fileEntrySub) {
	// 		eleId[i].fileEntrySub.remove(function () {
	// 		},
	// 			function () {
	// 				console.log(fe.code);
	// 			}
	// 		);
	// 	}

	// 	eleId[i].fileEntryOrg.remove(function () {
	// 	},
	// 		function () {
	// 			console.log(fe.code);
	// 		}
	// 	);

	// 	($('#' + eleId[i].id).parent()).remove();

	// 	//galleryDeleteSelectedFileFinish();
	// }

	refleshGallery();
}

var galleryDebounce = false;

async function galleryNextPage() {
	// if (galleryDebounce)
	// 	return;

	galleryDebounce = true;
	// setTimeout(() => { galleryDebounce = false }, 300);

	appFC.thumbnailCurrPage += 1;
	appFC.thumbnailCurrPage = appFC.thumbnailCurrPage % appFC.thumbnailTotalPage;

	await refleshGallery();
	galleryDebounce = false;
	//galleryFillThumbnailDiv_Page();
}

async function galleryPreviousPage() {
	// if (galleryDebounce)
	// 	return;

	galleryDebounce = true;
	// setTimeout(() => { galleryDebounce = false }, 300);

	appFC.thumbnailCurrPage += appFC.thumbnailTotalPage - 1;
	appFC.thumbnailCurrPage = appFC.thumbnailCurrPage % appFC.thumbnailTotalPage;

	await refleshGallery();
	galleryDebounce = false
	//galleryFillThumbnailDiv_Page();
}

// Video
function galleryAddVideoDiv(fileEntry) {
	appFC.thumbnailCnt += 1;
	galleryCreateVideoDiv(fileEntry, appFC.thumbnailCnt, true);
}

// function galleryCreateVideoDiv(entry, no, insertFirst = false) {
// 	var divId = 'thumb' + '_' + no;
// 	var imgId = 'img' + '_' + no;
// 	var iconId = "vIcon_" + no;
// 	var eleId;
// 	var thumbW = appCfg.thumbW;
// 	var thumbH = appCfg.thumbH;
// 	var paddingS = appCfg.thumbPadding;
// 	var w, h;

// 	// div
// 	if (insertFirst) {
// 		var temp = document.createElement("div");
// 		temp.id = divId;
// 		document.getElementById('thumbDiv').prepend(temp);
// 	}
// 	else {
// 		createDivElement('thumbDiv', divId);
// 	}

// 	//createDivElement('thumbDiv', divId);

// 	w = (thumbW - (paddingS * 2));
// 	h = (thumbH - (paddingS * 2));

// 	eleId = '#' + divId;

// 	$(eleId).css('width', w + 'px');
// 	$(eleId).css('height', h + 'px');
// 	$(eleId).css('padding', paddingS + 'px');
// 	$(eleId).css('display', 'inline-block');
// 	$(eleId).css('position', 'relative');

// 	// Video

// 	createVideoElement(divId, imgId);
// 	createDivElement(divId, iconId);

// 	entry.file(
// 		function (file) {
// 			var reader = new FileReader();

// 			reader.onloadstart = function (e) {
// 				var size = galleryGetFitSize(w, h, 1280, 720);
// 				//console.log(size);
// 				//var size = galleryGetFitSize(w, h, image.width, image.height);
// 				var border = appCfg.thumbFrmSize + 'px' + ' solid ' + appCfg.thumbFrmColorNormal;

// 				eleId = '#' + imgId;

// 				var css =
// 				{
// 					left: size.x + paddingS,
// 					top: size.y + paddingS,
// 					width: size.w,
// 					height: size.h,
// 					position: 'absolute',
// 					border: border,
// 				};

// 				$(eleId).css(css);
// 				$(eleId).addClass('thumbImg');

// 				eleId = document.getElementById(imgId);
// 				eleId.src = entry.toURL();

// 				eleId.autoplay = false;
// 				eleId.controls = false;
// 				eleId.loop = false;

// 				eleId.fileName = e.name;
// 				eleId.fileEntryOrg = entry;
// 				eleId.checked = false;

// 				css =
// 				{
// 					right: 6,
// 					bottom: 17,
// 					width: 36,
// 					height: 12,
// 					position: "absolute",
// 					backgroundColor: "#000",
// 					color: "#EEE",
// 					textAlign: "center",
// 					fontSize: 12,
// 					opacity: .75
// 				};

// 				$('#' + iconId).css(css);

// 				eleId.addEventListener("loadedmetadata", function () {
// 					var a = Math.round(eleId.duration);
// 					document.getElementById(iconId).innerText = Math.floor(a / 60) + ":" + padLeft(a % 60, 2)
// 				});

// 				$(eleId).on('click', function (event) {
// 					var ele = document.getElementById(event.target.id);
// 					var bkColor;
// 					var borderCfg;

// 					// new for extension
// 					if (chrome.WindowState == "fullscreen") {
// 						return;
// 					}

// 					// if (chrome.app.window.current().isFullscreen() )
// 					// {
// 					// 	return;
// 					// }

// 					//console.log(ele.checked);

// 					if (ele.checked) {
// 						ele.checked = false;
// 						bkColor = appCfg.thumbFrmColorNormal;
// 						galleryReductSelectedFile();
// 					}
// 					else {
// 						gallerySelectAll(false);

// 						ele.checked = true;
// 						bkColor = appCfg.thumbFrmColorChecked;
// 						galleryAddSelectedFile();
// 					}
// 					borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
// 					$(this).css('border', borderCfg);
// 					$(this).toggleClass('selected');
// 				});

// 				$(eleId).dblclick(function () {
// 					var eleId = document.getElementById(this.id);

// 					eleId.checked = true;
// 					var bkColor = appCfg.thumbFrmColorChecked;
// 					galleryAddSelectedFile();
// 					var borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
// 					$(this).css('border', borderCfg);
// 					$(this).toggleClass('selected');

// 					//console.log(eleId);
// 					eleId.muted = false;
// 					eleId.currentTime = 0;
// 					//eleId.style.border = 'none';	

// 					eleId.webkitRequestFullScreen();
// 				});

// 				eleId.addEventListener('ended', function (e) {
// 					if (document.fullscreenElement != null) {
// 						document.exitFullscreen();
// 					}
// 				}, false);

// 				eleId.addEventListener('mouseover', function (e) {
// 					var playPromise = eleId.play();
// 					if (playPromise !== undefined) {
// 						playPromise.then(_ => {

// 							eleId.muted = true;
// 							eleId.play();
// 						})
// 							.catch(error => {
// 								// Auto-play was prevented
// 								// Show paused UI.
// 							});
// 					}
// 				});

// 				eleId.addEventListener('mouseleave', function (e) {
// 					var playPromise = eleId.play();
// 					if (playPromise !== undefined) {
// 						playPromise.then(_ => {

// 							//eleId.stop();
// 							eleId.pause();
// 							eleId.currentTime = 0;
// 						})
// 							.catch(error => {
// 								// Auto-play was prevented
// 								// Show paused UI.
// 							});
// 					}
// 				});
// 				galleryAddFileFinish();
// 			}
// 			reader.readAsText(file);
// 		},
// 		function (fe) {
// 			console.log(fe.code);
// 		}
// 	);
// }

// Picture
function galleryAddThumbnailDiv(fileEntry) {
	appFC.thumbnailCnt += 1;
	galleryCreateThumbnailDiv(fileEntry, appFC.thumbnailCnt, true);
}

function galleryCreateThumbnailDiv(entry, no, insertFirst = false) {
	var divId = 'thumb' + '_' + no;
	var imgId = 'img' + '_' + no;
	var eleId;
	var thumbW = appCfg.thumbW;
	var thumbH = appCfg.thumbH;
	var paddingS = appCfg.thumbPadding;
	var w, h;

	// div
	if (insertFirst) {
		var temp = document.createElement("div");
		temp.id = divId;
		document.getElementById('thumbDiv').prepend(temp);
	}
	else {
		createDivElement('thumbDiv', divId);
	}

	w = (thumbW - (paddingS * 2));
	h = (thumbH - (paddingS * 2));

	eleId = '#' + divId;

	$(eleId).css('width', w + 'px');
	$(eleId).css('height', h + 'px');
	$(eleId).css('padding', paddingS + 'px');
	$(eleId).css('display', 'inline-block');
	$(eleId).css('position', 'relative');

	// img
	createImgElement(divId, imgId);

	entry.file(
		function (file) {
			var image = new Image();

			image.addEventListener("load",
				function () {
					var size = galleryGetFitSize(w, h, image.width, image.height);
					var border = appCfg.thumbFrmSize + 'px' + ' solid ' + appCfg.thumbFrmColorNormal;

					eleId = '#' + imgId;

					var css =
					{
						left: size.x + paddingS,
						top: size.y + paddingS,
						width: size.w,
						height: size.h,
						position: 'absolute',
						border: border,
					};

					$(eleId).css(css);

					$(eleId).addClass('thumbImg');

					eleId = document.getElementById(imgId);
					eleId.src = image.src;

					eleId.fileName = file.name;
					eleId.imgSrc = image;
					eleId.fileEntry = entry;
					eleId.checked = false;

					//console.log(eleId.fileName);

					$(eleId)
						.on('click', function (event) {
							var ele = document.getElementById(event.target.id);
							var bkColor;
							var borderCfg;

							if (ele.checked) {
								ele.checked = false;
								bkColor = appCfg.thumbFrmColorNormal;
								galleryReductSelectedFile();
							}
							else {
								gallerySelectAll(false);

								ele.checked = true;
								bkColor = appCfg.thumbFrmColorChecked;
								galleryAddSelectedFile();
							}

							borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
							$(this).css('border', borderCfg);
							$(this).toggleClass('selected');
						});

					$(eleId).dblclick(function () {
						var eleId = document.getElementById(this.id);

						eleId.checked = true;
						var bkColor = appCfg.thumbFrmColorChecked;
						galleryAddSelectedFile();
						var borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
						$(this).css('border', borderCfg);
						$(this).toggleClass('selected');

						//console.log(this.id + " double clicked, szie = " + eleId.imgSrc.width + 'x' + eleId.imgSrc.height);
						playbackDisplayImgMode(eleId.imgSrc);
					});

					galleryAddFileFinish();
				}
			);

			image.src = window.URL.createObjectURL(file);
		},
		function (fe) {
			console.log(fe.code);
		}
	);
}

// function galleryCreateThumbnailDivEx(entrySub, entryOrg, no, insertFirst = false) {
// 	var divId = 'thumb' + '_' + no;
// 	var imgId = 'img' + '_' + no;
// 	var eleId;
// 	var thumbW = appCfg.thumbW;
// 	var thumbH = appCfg.thumbH;
// 	var paddingS = appCfg.thumbPadding;
// 	var w, h;

// 	// div
// 	if (insertFirst) {
// 		var temp = document.createElement("div");
// 		temp.id = divId;
// 		document.getElementById('thumbDiv').prepend(temp);
// 	}
// 	else {
// 		createDivElement('thumbDiv', divId);
// 	}

// 	w = (thumbW - (paddingS * 2));
// 	h = (thumbH - (paddingS * 2));

// 	eleId = '#' + divId;

// 	$(eleId).css('width', w + 'px');
// 	$(eleId).css('height', h + 'px');
// 	$(eleId).css('padding', paddingS + 'px');
// 	$(eleId).css('display', 'inline-block');
// 	$(eleId).css('position', 'relative');

// 	// img
// 	createImgElement(divId, imgId);

// 	entrySub.file(
// 		function (file) {
// 			var imageSub = new Image();

// 			imageSub.addEventListener("load",
// 				function () {
// 					var size = galleryGetFitSize(w, h, imageSub.width, imageSub.height);
// 					var border = appCfg.thumbFrmSize + 'px' + ' solid ' + appCfg.thumbFrmColorNormal;

// 					eleId = '#' + imgId;

// 					var css =
// 					{
// 						left: size.x + paddingS,
// 						top: size.y + paddingS,
// 						width: size.w,
// 						height: size.h,
// 						position: 'absolute',
// 						border: border,
// 					};

// 					$(eleId).css(css);

// 					$(eleId).addClass('thumbImg');

// 					eleId = document.getElementById(imgId);
// 					eleId.src = imageSub.src;

// 					eleId.fileName = file.name;

// 					eleId.fileEntrySub = entrySub;
// 					eleId.fileEntryOrg = entryOrg;
// 					eleId.checked = false;

// 					// var imageOrg = new Image();
// 					// eleId.fileEntryOrg.file( function(file)
// 					// {
// 					// 	imageOrg.src = window.URL.createObjectURL(file);
// 					// 	imageOrg.addEventListener("load", function ()
// 					// 	{
// 					// 		eleId.imgSrc = imageOrg;					
// 					// 	});	
// 					// });

// 					//console.log(eleId.fileName);

// 					$(eleId).on('click', function (event) {
// 						var ele = document.getElementById(event.target.id);
// 						var bkColor;
// 						var borderCfg;

// 						if (ele.checked) {
// 							ele.checked = false;
// 							bkColor = appCfg.thumbFrmColorNormal;
// 							galleryReductSelectedFile();
// 						}
// 						else {
// 							gallerySelectAll(false);

// 							ele.checked = true;
// 							bkColor = appCfg.thumbFrmColorChecked;
// 							galleryAddSelectedFile();
// 						}

// 						borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
// 						$(this).css('border', borderCfg);
// 						$(this).toggleClass('selected');
// 					});

// 					$(eleId).dblclick(function () {
// 						var eleId = document.getElementById(this.id);

// 						eleId.checked = true;
// 						var bkColor = appCfg.thumbFrmColorChecked;
// 						galleryAddSelectedFile();
// 						var borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
// 						$(this).css('border', borderCfg);
// 						$(this).toggleClass('selected');

// 						var imageOrg = new Image();

// 						eleId.fileEntryOrg.file(function (file) {
// 							imageOrg.src = window.URL.createObjectURL(file);
// 							imageOrg.addEventListener("load", function () {
// 								playbackDisplayImgMode(imageOrg);

// 							});
// 						});

// 						//console.log(this.id + " double clicked, szie = " + eleId.imgSrc.width + 'x' + eleId.imgSrc.height);
// 						//playbackDisplayImgMode(eleId.imgSrc);
// 					});

// 					galleryAddFileFinish();
// 				}
// 			);

// 			imageSub.src = window.URL.createObjectURL(file);
// 		},
// 		function (fe) {
// 			console.log(fe.code);
// 		}
// 	);
// }

function gallerySelectAll(mode) {
	var ids = $('.thumbImg');
	var className = 'selected';
	var eleId;
	var $id;
	var i;
	var checked;
	var bkColor;
	var borderCfg;

	if (mode) {
		checked = true;
		bkColor = appCfg.thumbFrmColorChecked;
	}
	else {
		checked = false;
		bkColor = appCfg.thumbFrmColorNormal;
	}

	borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;

	for (i = 0; i < ids.length; i++) {
		eleId = document.getElementById(ids[i].id);
		eleId.checked = checked;

		$id = $('#' + ids[i].id);

		$id.css('border', borderCfg);

		if (mode) $id.addClass(className);
		else $id.removeClass(className);
	}
}

function galleryDeleteSelectedFileFinish() {
	appFC.thumbFileCnt -= 1,
		appFC.thumbSelectedFileCnt -= 1,

		galleryUpdateFileInfo();
}

function galleryAddFileFinish() {
	appFC.thumbFileCnt += 1;

	galleryUpdateFileInfo();
}

function galleryAddSelectedFile() {
	galleryUpdateSelectedFileDelay();
	//appFC.thumbSelectedFileCnt += 1,
	//galleryUpdateFileInfo();
}

function galleryReductSelectedFile() {
	galleryUpdateSelectedFileDelay();
	//appFC.thumbSelectedFileCnt -= 1,
	//galleryUpdateFileInfo();
}

var selectedFileDelay = -1;
function galleryUpdateSelectedFileDelay() {
	if (selectedFileDelay == -1) {
		selectedFileDelay = 2;
		setTimeout(galleryUpdateSelectedFileDelay, 100);
	}
	else if (selectedFileDelay > 0) {
		selectedFileDelay -= 1;
		setTimeout(galleryUpdateSelectedFileDelay, 100);
	}
	else // selectedFileDalay == 0
	{
		selectedFileDelay = -1;
		galleryUpdateSelectedFile();
	}
}

function galleryUpdateSelectedFile() {
	var ids = $('.thumbImg');
	var className = 'selected';

	appFC.thumbSelectedFileCnt = 0;

	for (var i = 0; i < ids.length; i++) {
		var eleId = document.getElementById(ids[i].id);
		var $id = $('#' + ids[i].id);

		if (eleId.checked) {
			appFC.thumbSelectedFileCnt += 1;
			$id.addClass(className);
		}
		else {
			$id.removeClass(className);
		}
		// if ( eleId.checked )
		// {
		// 	var bkColor = appCfg.thumbFrmColorChecked;
		// 	var borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
		// 	$id.css('border', borderCfg);
		// 	$id.addClass(className);
		// 	appFC.thumbSelectedFileCnt += 1;
		// }			
		// else
		// {
		// 	var bkColor = appCfg.thumbFrmColorNormal;
		// 	var borderCfg = appCfg.thumbFrmSize + 'px' + ' solid ' + bkColor;
		// 	$id.css('border', borderCfg);
		// 	$id.removeClass(className);
		// }
	}

	galleryUpdateFileInfo();
}

function galleryUpdateFileInfo() {
	// var page = 
	// 	chrome.i18n.getMessage("lbPage") + " " +
	// 	Math.min(appFC.thumbnailCurrPage + 1, appFC.thumbnailTotalPage) + 
	// 	"/" + appFC.thumbnailTotalPage;

	var page =
		"PAGE: " +
		//get_i18n_Message("lbPage") + " " +
		Math.min(appFC.thumbnailCurrPage + 1, appFC.thumbnailTotalPage) +
		"/" + appFC.thumbnailTotalPage;

	// var item =
	// 	"[ " + Math.min(appFC.thumbSelectedFileCnt, appFC.thumbFileCnt)
	// 	+ '/' + Math.min(appFC.thumbFileCnt, 100) + " ]";

	var item =
		"IMAGE： " + Math.min(appFC.thumbFileCnt, ItemsPerPage);

	// text = "PAGE " + (appFC.thumbnailCurrPage + 1) + "/" + appFC.thumbnailTotalPage + "   " 
	// 	+ "[" + appFC.thumbSelectedFileCnt + '/' + appFC.thumbFileCnt + "]";
	//text = appFC.thumbSelectedFileCnt + ' / ' + appFC.thumbFileCnt;

	playbackUpdateFileInfoElement(page, item);

	galleryUpdateSelectAllToolTip();
}

function galleryUpdateSelectAllToolTip() {
	var strId;

	if (appFC.thumbFileCnt && (appFC.thumbFileCnt === appFC.thumbSelectedFileCnt)) strId = "btnUnselectAll";
	else strId = "btnSelectAll";

	fcUpdateElementTitle("btn_toggleAll", strId);
}///////////////////////////////////////////////////////////////////////////////////////////
// record
///////////////////////////////////////////////////////////////////////////////////////////

var mediaRecorder;
var recordedChunks = [];
var IsRecording = false;
var IsPause = false;
var recordingStartTime;
var recordingTotal;
var recordingPauseTime;
var OldImgW = 1280;
var OldImgH = 720;
var RECORD_LIMIT_SEC = 900;//600;

function showRecordBtn(visible) {
    return;
    showElement('bottomToolBarData', visible);
    if (visible)
        $("#btn_pause").hide();
}

function showAllToolBars(visible) {
    var idTbl = [
        "btn_setting",
        "btn_capture",
        "btn_freeze",
        //"btn_timesave",
        "btn_mirrow",
        "btn_flip",
        //'btn_brightness',
        //'btn_whitebalance',
        "btn_config",
        "btn_zoom",
        "btn_importPic",
        "btn_redo",
        "btn_undo",

        // "mode_about",       
        // "mode_preview",     
        // "mode_playback",    
        // "mode_drawingBoard",

        'btn_freehand',
        'btn_arrow',
        'btn_eraser',
        'btn_line',
        'btn_rectangleLine',
        'btn_rectangle',
        'btn_circleLine',
        'btn_circle',
        'btn_erase_all',
        'btn_text',
        'btn_configDraw',
        // 'previewToolBar',
        // 'drawingToolBar',
        // 'modeToolBar',
        'drawingCfgColorBar',
        'drawingOpacity',
        'drawingLineWidth'
    ];

    var i;

    for (i = 0; i < idTbl.length; i++) {
        showToolBar(idTbl[i], visible);
    }

    if (visible) {
        //document.getElementById("sysToolBar").style.opacity = appCfg.toolBarOpacityLeave;
        document.getElementById("sysToolBar").style.background = appCfg.toolBarColorLeave;
    }
    else {
        //document.getElementById("sysToolBar").style.opacity = '0';
        document.getElementById("sysToolBar").style.backgroundColor = '#000';
    }

    //opacity: appCfg.toolBarOpacityLeave,
}

var recordStream;
var recordingFormat;
var previewStream;

let initialOrientation;  // 紀錄錄影開始時的方向
let initialVideoW;

async function StartRecord() {
    console.log("Start Recording");

    initialOrientation = getCurrentRotation();
    initialVideoW = videoW;

    if (!IsRecording)//(appFC.imgW != 1280 || appFC.imgH != 720)
    {
        IsRecording = true;

        // OldImgW = appFC.imgW;
        // OldImgH = appFC.imgH;

        showRecordBtn(false);

        //showAllToolBars(false);
        fcCloseActiveDlg();
        $("#btn_pause").show();

        // fcChangeBaseImageSize(1280, 720);
        // setTimeout(StartRecord, 2500);
        //setTimeout(StartRecord, 500);
        //return;
    }

    IsPause = false;
    showAllToolBars(false);
    // fcCloseActiveDlg();
    // $("#btn_pause").show();	

    // -- recording time stamp
    document.getElementById("recordtime").style.fontSize = "18px";
    document.getElementById("recordtime").style.fontWeight = "bold";
    document.getElementById("recordtime").style.color = "red";
    document.getElementById("recordtime").style.position = "absolute";

    document.getElementById("recordtime").style.top = (48 * 3.5 - 9) + "px"; //"35px";
    document.getElementById("recordtime").style.left = 48 * 1.5 + "px";

    //document.getElementById("recordtime").style.bottom = "60px"; //"35px";
    //document.getElementById("recordtime").style.left = (document.documentElement.clientWidth / 2 - 32) + "px";
    document.getElementById("recordtime").style.visibility = "visible";
    //recordingsec = 0;

    let getd = new Date();
    recordingStartTime = getd.getTime();
    recordingPauseTime = 0;
    RecordingTimer();


    // record all canvas
    // var mc = previewModeCfg;
    // var canvas = mc['combineCanvas'];
    let canvas = document.getElementById("previewArea-videoOrg");
    console.log(canvas);

    const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: CurrentAudioDevice.deviceId } }
    });

    //const audioStream = null;


    //window.stream.getAudioTracks()[0].enabled = true;

    let canvasStream;

    if (isMobileDevice) {
        canvasStream = canvas.captureStream(30);
    } else {
        if (Browser == "Firefox") {
            canvasStream = videoElement.mozCaptureStream();
        } else if (Browser == "Safari") {
            canvasStream = canvas.captureStream(30);
        } else {
            canvasStream = videoElement.captureStream();
        }
        //canvasStream = videoElement.captureStream();
    }

    console.log(canvasStream);

    if (audioStream && audioStream.getTracks()) {
        console.log("Audio Enable");
        recordStream = new MediaStream([
            ...canvasStream.getTracks(),
            ...audioStream.getTracks()
        ]);
    } else {
        console.log("Audio Disable");
        recordStream = new MediaStream(canvasStream.getTracks());
    }


    // 使用合併的流進行錄影
    // const mediaRecorder = new MediaRecorder(combinedStream);
    // mediaRecorder.ondataavailable = (event) => {
    //     const blob = new Blob([event.data], { type: 'video/webm' });
    //     const videoURL = URL.createObjectURL(blob);
    //     console.log("Recording completed. Video URL:", videoURL);
    // };
    // mediaRecorder.start();

    recordedChunks = [];

    let mimeType;

    if (MediaRecorder.isTypeSupported('video/webm; codecs="vp9, opus"')) {
        console.log("using webm vp9 opus");
        mimeType = 'video/webm; codecs="vp9, opus"';
        recordingFormat = 'webm';
    } else if (MediaRecorder.isTypeSupported('video/webm; codecs="vp8, vorbis"')) {
        console.log("using webm vp8 vorbis");
        mimeType = 'video/webm; codecs="vp8, vorbis"';
        recordingFormat = 'webm';
        // } else if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) {
        //     console.log("using video/mp4; codecs=avc1.42E01E, mp4a.40.2");
        //     mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
        //     recordingFormat = 'mp4';
    } else
        if (MediaRecorder.isTypeSupported('video/webm')) {
            console.log("using webm");
            mimeType = 'video/webm';
            recordingFormat = 'webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            console.log("using mp4");
            mimeType = 'video/mp4';
            recordingFormat = 'mp4';
        }

    var options = {
        audioBitsPerSecond: 96000,//128000,
        videoBitsPerSecond: 5000000,
        mimeType: mimeType //'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
    };

    // var options = {  audioBitsPerSecond : 96000,
    // 	videoBitsPerSecond : 256 * 8 * 1000,
    // 	mimeType: 'video/webm;codecs=vp9; '};

    // var options = {  audioBitsPerSecond : 96000,
    // 	videoBitsPerSecond : 256 * 8 * 1000,
    // 	mimeType: 'video/webm;codecs=vp8; '};

    mediaRecorder = new MediaRecorder(recordStream, options);
    //mediaRecorder.ondataavailable = handleDataAvailable;

    //mediaRecorder = new MediaRecorder(recordStream);
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            //console.log("data available");
            recordedChunks.push(event.data);
        } else {
            console.log("no data");
        }
    };
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: mimeType });
        const filename = fcGetFilenameByDateTime(recordingFormat);
        downloadBlob(blob, filename);
    };
    mediaRecorder.start(1000);

    //showRecordBtn(true);

    // function handleDataAvailable(event) {
    //     if (event.data && event.data.size > 0) {
    //         recordedChunks.push(event.data);
    //         //DownloadRecord();
    //         SaveRecord();
    //     } else {
    //         console.log("no data");
    //     }
    // }
};

async function StopRecord() {
    IsRecording = false;
    document.getElementById("recordtime").style.visibility = "hidden";
    showAllToolBars(true);
    $("#btn_pause").hide();
    mediaRecorder.stop();

    // recordStream.getTracks().forEach(function (track) {
    //     track.stop();
    //     recordStream.removeTrack(track);
    // });

    // if (window.stream != undefined)
    // 	window.stream.getAudioTracks()[0].enabled = false;

    //window.stream = previewStream;

    var getd = new Date();
    var recordingNow = getd.getTime();
    if (IsPause) {
        IsPause = false;
        recordingTotal = recordingPauseTime;
    }
    else {
        recordingTotal = recordingPauseTime + recordingNow - recordingStartTime;
    }
};

function PauseRecord() {
    IsPause = true;
    //showAllToolBars(true);
    mediaRecorder.pause();

    var getd = new Date();
    var recordingNow = getd.getTime();
    recordingPauseTime += recordingNow - recordingStartTime;
}

function ResumeRecord() {
    IsPause = false;
    //showAllToolBars(false);
    mediaRecorder.resume();

    // set recording time
    var getd = new Date();
    recordingStartTime = getd.getTime();
    RecordingTimer();
}

async function SaveRecord() {
    var filename = fcGetFilenameByDateTime(recordingFormat);
    console.log("recordingFormat: " + recordingFormat);
    console.log("filename: " + filename);

    if (recordingFormat == 'mp4') {
        // const db = await openDatabase();
        // const transaction = db.transaction(storeName, 'readwrite');
        // const store = transaction.objectStore(storeName);
        let blob = new Blob(recordedChunks, { type: 'video/mp4' });

        //await saveBlobToMp4(filename, blob);
        downloadBlob(blob, filename);

        // const data = { name: filename, video: blob };
        // store.add(data);

        recordedChunks = [];
        blob = null;
    }
    else if (recordingFormat == 'webm') {

        let blob = new Blob(recordedChunks, { type: 'video/webm' });

        setTimeout(function () {
            ysFixWebmDuration(blob, recordingTotal, async function (fixedBlob) {
                // const db = await openDatabase();
                // const transaction = db.transaction(storeName, 'readwrite');
                // const store = transaction.objectStore(storeName);
                // const data = { name: filename, video: fixedBlob };

                //const data = { name: filename, video: URL.createObjectURL(fixedBlob) };

                //await saveBlobToMp4(filename, fixedBlob);
                downloadBlob(fixedBlob, filename);

                //store.add(data);
                recordedChunks = [];
                blob = null;
            });
        }, 100);
    }

    // if (OldImgW != 1280 || OldImgH != 720) {
    //     fcChangeBaseImageSize(OldImgW, OldImgH);
    // }
}

function DownloadRecord() {
    //console.log("Download Record");

    let blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });

    //console.log(recordingTotal);

    // var url = URL.createObjectURL(blob);
    // var a = document.createElement('a');
    // document.body.appendChild(a);

    // var filename = new Date().toISOString().slice(0,19);
    // a.style = 'display: none';
    // a.href = url;
    // a.download = filename + '.webm';
    // a.click();
    // window.URL.revokeObjectURL(url);
    // recordedChunks = [];
    // if (OldImgW != 1280 || OldImgH != 720)
    // {
    // 	fcChangeBaseImageSize(OldImgW, OldImgH);
    // }

    setTimeout(function () {
        ysFixWebmDuration(blob, recordingTotal, function (fixedBlob) {
            var url = URL.createObjectURL(fixedBlob);
            var a = document.createElement('a');
            document.body.appendChild(a);

            var filename = new Date().toISOString().slice(0, 19);

            a.style = 'display: none';
            a.href = url;
            a.download = filename + '.webm';
            a.click();
            window.URL.revokeObjectURL(url);

            recordedChunks = [];

            // if (OldImgW != 1280 || OldImgH != 720) {
            //     fcChangeBaseImageSize(OldImgW, OldImgH);
            // }
        });
    }, 100);
};

function padLeft(str, len) {
    str = '' + str;
    if (str.length >= len) {
        return str;
    } else {
        return padLeft("0" + str, len);
    }
};

function RecordingTimer() {
    if (IsRecording && !IsPause) {
        var getd = new Date();
        var recordingNow = getd.getTime();
        recordingTotal = recordingPauseTime + recordingNow - recordingStartTime;
        var recordingsec = Math.floor((recordingTotal) / 1000);

        if (recordingsec >= RECORD_LIMIT_SEC) {
            StopRecord();
            return;
        }

        document.getElementById("recordtime").innerText =
            padLeft(Math.floor(recordingsec / 60), 2) + " : " + padLeft(recordingsec % 60, 2);

        setTimeout(() => {
            RecordingTimer()
        }, 1000);
    }
};///////////////////////////////////////////////////////////////////////////////////////////
// constant 
///////////////////////////////////////////////////////////////////////////////////////////

let videoW = appCfg.defPreviewRsoX;
let videoH = appCfg.defPreviewRsoY;
//let currStream = null;

const videoElement = document.getElementById('videoSrc');
let videoLastUpdateTime;

///////////////////////////////////////////////////////////////////////////////////////////
// check device 
///////////////////////////////////////////////////////////////////////////////////////////

function isSupportedDevice(vid, pid) {
    for (let i = 0; i < DevList.length; i++) {
        if (vid === DevList[i][0] && pid === DevList[i][1]) {
            appFC.reqVideoResolutionList = DevList[i][2];
            return true;
        }
    }
    return false;
}

///////////////////////////////////////////////////////////////////////////////////////////
// connect stream 
///////////////////////////////////////////////////////////////////////////////////////////
let IsDeviceConnected = false;
let PreviousDevices = [];
// let CurrentDevices = [];
let CurrentVideoDevice = null;
let CurrentAudioDevice = null;

async function makeDeviceList() {
    try {
        const videoSelect = document.getElementById(appFC.idVideoinputSelect);
        const audioSelect = document.getElementById(appFC.idAudioinputSelect);

        videoSelect.innerHTML = ''; //'<option value="">請選擇一個影片裝置</option>'; // 清空選單
        audioSelect.innerHTML = ''; //'<option value="">請選擇一個影片裝置</option>'; // 清空選單

        //console.log("make Device List Step 1");

        let devices = await navigator.mediaDevices.enumerateDevices();
        devices = devices.filter(
            device => device.deviceId.length > 20
        );

        //console.log("make Device List Step 2");

        devices
            .filter(device =>
                device.kind === "videoinput" &&
                !device.label.includes("Virtual") &&
                !device.label.includes("Basler") &&
                !device.deviceId.includes("communications"))
            .forEach(device => {
                // Build video drop-down list
                //if (testDeviceAvailability(device.deviceId)) {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `未命名裝置 (${device.deviceId})`;
                option.device = device;
                videoSelect.appendChild(option);
                //}
            });

        //console.log("make Device List Step 3");

        devices
            .filter(device =>
                device.kind === "audioinput" &&
                !device.label.includes("Virtual") &&
                !device.deviceId.includes("default") &&
                !device.deviceId.includes("communications"))
            .forEach(device => {
                // Build audio drop-down list
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `未命名裝置 (${device.deviceId})`;
                option.device = device;
                audioSelect.appendChild(option);
            });

        //console.log("make Device List Step 4");

        if (CurrentVideoDevice)
            videoSelect.value = CurrentVideoDevice.deviceId;
        if (CurrentAudioDevice)
            audioSelect.value = CurrentAudioDevice.deviceId;

        return devices
            .map(device => ({ deviceId: device.deviceId, label: device.label, kind: device.kind }));
    } catch (error) {
        console.error("無法列出影片裝置:", error);
        connectError();
        return false;
    }
}

async function selectVideoDefaultDevice(devices) {

    const videoDevices = devices
        .filter(device =>
            device.kind === "videoinput" &&
            !device.label.includes('visual') &&
            !device.label.includes('Basler') &&
            !device.deviceId.includes("communications")
        );

    for (let i = 0; i < videoDevices.length; i++) {
        if (checkDC(videoDevices[i])) {
            if (await testDeviceAvailability(videoDevices[i].deviceId)) {
                return videoDevices[i];
            }
        }
    }

    for (let i = 0; i < videoDevices.length; i++) {
        if (await testDeviceAvailability(videoDevices[i].deviceId)) {
            return videoDevices[i];
        } else {
            console.log("XXX");
            if (PreviousDevices)
                PreviousDevices = PreviousDevices.filter(device => device.deviceId != videoDevices[0].deviceId);

            const videoSelect = document.getElementById(appFC.idVideoinputSelect);
            const optionToRemove = Array.from(videoSelect.options).find(opt => opt.value === videoDevices[0].deviceId);
            if (optionToRemove) {
                optionToRemove.remove();
            }
        }
    }

    //console.log("Select Video Device", device);

    return null;
}

async function selectAudioDefaultDevice(devices) {
    let device = null;

    const audioDevices = devices
        .filter(device =>
            device.kind === "audioinput" &&
            !device.deviceId.includes('default') &&
            !device.deviceId.includes("communications")
        );

    for (let i = 0; i < audioDevices.length; i++) {
        if (i == 0) {
            device = audioDevices[0];
        }

        if (checkDC(audioDevices[i])) {
            device = audioDevices[i];
            break;
        }
    }

    return device;
}

// 請求權限並顯示裝置選項
async function initializeDevices() {
    try {
        const hasPermissions = await checkCameraPermission();
        await checkAudioPermission();

        if (hasPermissions) {
            PreviousDevices = await makeDeviceList();

            console.log(PreviousDevices);

            CurrentVideoDevice = await selectVideoDefaultDevice(PreviousDevices);
            CurrentAudioDevice = await selectAudioDefaultDevice(PreviousDevices);

            const videoSelect = document.getElementById(appFC.idVideoinputSelect);
            const audioSelect = document.getElementById(appFC.idAudioinputSelect);

            if (CurrentVideoDevice)
                videoSelect.value = CurrentVideoDevice.deviceId;
            if (CurrentAudioDevice)
                audioSelect.value = CurrentAudioDevice.deviceId;

            if (CurrentVideoDevice) {
                await startVideo();
                return;
            } else {
                setRecordBottonEnable(false);
            }
        }
        else {
            setRecordBottonEnable(false);
        }

    } catch (error) {
        console.log(error);
        alert("Please connect the camera.");
        connectError();
    }
}

async function checkCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("Camera permission granted.");
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        if (error.name === "NotAllowedError") {
            console.warn("Camera permission denied.");
        } else if (error.name === "NotFoundError") {
            console.warn("No camera found on the device.");
        } else {
            console.error("An error occurred:", error);
        }

        return false;
    }
}

async function checkAudioPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Audio permission granted.");
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        if (error.name === "NotAllowedError") {
            console.warn("Audio permission denied.");
        } else if (error.name === "NotFoundError") {
            console.warn("No Audio found on the device.");
        } else {
            console.error("An error occurred:", error);
        }

        return false;
    }
}

async function checkMediaPermissions() {
    try {
        // 檢查攝影機權限
        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        console.log('Camera Permission:', cameraPermission.state);

        // 檢查麥克風權限
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' });
        console.log('Microphone Permission:', microphonePermission.state);

        // 判斷是否有權限
        if (cameraPermission.state === 'granted' && microphonePermission.state === 'granted') {
            console.log('已取得攝影機和麥克風的權限');
            return true;
        } else {
            //console.log('尚未取得完整權限');
            let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        }
    } catch (error) {
        console.log('無法檢查權限:', error);
        connectError();
        return false;
    }
}

async function checkCameraPermissionEx() {
    try {
        if (navigator.permissions && navigator.permissions.query) {
            // 檢查攝影機權限
            const cameraPermission = await navigator.permissions.query({ name: 'camera' });
            console.log('Camera Permission:', cameraPermission.state);

            // 檢查麥克風權限
            const microphonePermission = await navigator.permissions.query({ name: 'microphone' });
            console.log('Microphone Permission:', microphonePermission.state);

            // 判斷是否有權限
            if (cameraPermission.state === 'granted' && microphonePermission.state === 'granted') {
                console.log('已取得攝影機和麥克風的權限');
                return true;
            } else {
                //console.log('尚未取得完整權限');
                let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                stream.getTracks().forEach(track => track.stop());
                return true;
            }
        } else {
            // 嘗試請求攝影機權限
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            console.log("Camera / Audio permission granted.");

            // 停止攝影機流
            stream.getTracks().forEach(track => track.stop());

            return true;
        }
    } catch (error) {
        if (error.name === "NotAllowedError") {
            console.warn("Camera permission denied.");
        } else if (error.name === "NotFoundError") {
            console.warn("No camera found on the device.");
        } else {
            console.error("An error occurred:", error);
        }

        return false;
    }
}

let supportedDevice = false;
let connectedDevices = [];

async function checkVideoSource() {
    const videoSelect = document.getElementById(appFC.idVideoinputSelect);

    if (!CurrentVideoDevice)
        return;

    if (CurrentVideoDevice.deviceId != videoSelect.value) {

        await stopVideo();

        const videoOption = videoSelect.options[videoSelect.selectedIndex];
        CurrentVideoDevice = videoOption.device;

        await startVideo();
    }
}

function setRecordBottonEnable(enable) {
    if (enable) {
        $('#btn_record').hover(toolBarOnMouseEnter, toolBarOnMouseLeave).prop('disabled', false);
        $('#btn_record').css('background-image', "url('css/images/icon/record2.png')");
    } else {
        $('#btn_record').off('mouseenter mouseleave').prop('disabled', true);
        $('#btn_record').css('background-image', "url('css/images/icon/record3.png')");
    }
}

let isMouseOverDisabled = false;

async function getConstraints() {

    let constraints = null;

    if (!CurrentVideoDevice) return null;

    if (checkDC(CurrentVideoDevice)) {
        videoW = 1920;
        videoH = 1080;

        constraints = {
            //audio: { deviceId: { exact: CurrentAudioDevice.deviceId } },
            video: {
                deviceId: { exact: CurrentVideoDevice.deviceId },
                width: { exact: videoW },
                height: { exact: videoH }
            }
        };

        appFC.reqVideoResolutionList = [
            // width  height   def 
            [videoW, videoH, 1]
        ];
        await fcUpdateVideoResolution();
    }
    else {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: CurrentVideoDevice.deviceId } },
        });

        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();

        stream.getTracks().forEach(track => track.stop()); // 停止媒體流

        videoW = settings.width;;
        videoH = settings.height;

        appFC.reqVideoResolutionList = [
            // width  height   def 
            [videoW, videoH, 1]
        ];
        await fcUpdateVideoResolution();

        if (false) { //(CurrentAudioDevice) {
            constraints = {
                audio: {
                    deviceId: { exact: CurrentAudioDevice.deviceId }
                },
                video: {
                    deviceId: { exact: CurrentVideoDevice.deviceId },
                }
            }
        } else {
            constraints = {
                video: {
                    deviceId: { exact: CurrentVideoDevice.deviceId },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            }
        }
    };

    return constraints;
}

let flReqTrackEnded = false;

function handleTrackEnded() {
    stopVideo();
    cleanDisplayCanvas();
    flReqTrackEnded = true;
}

let debounceTimer = null;
let isEnumerating = false;
let reqEnumerating = false;

//navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
// const debouncedDeviceChangeHandler = debounce(handleDeviceChange, 1000);
// navigator.mediaDevices.addEventListener('devicechange', debouncedDeviceChangeHandler);

navigator.mediaDevices.addEventListener('devicechange', () => {
    console.log(`[${getCurrentTimeWithMs()}] devicechange 事件觸發 (debounce)`);
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
        reqEnumerating = true;
        debounceTimer = null;
        handleDeviceChange();
    }, 500);
});

async function handleDeviceChange() {
    console.log(`[${getCurrentTimeWithMs()}] handleDeviceChange`);

    if (isEnumerating) {
        console.log(`[${getCurrentTimeWithMs()}] 目前已有 enumerateDevices 執行中，跳過此次處理`);
        return;
    }

    isEnumerating = true;
    reqEnumerating = false;


    // if (window.stream && window.stream.getVideoTracks()[0]) { //(IsDeviceConnected) {
    //     console.log("window.stream.getVideoTracks()[0].readyState", window.stream.getVideoTracks()[0].readyState);

    //     if (window.stream.getVideoTracks()[0].readyState === 'ended') {

    //         setRecordBottonImg(false);

    //         if (IsRecording) {
    //             await StopRecord();
    //         }

    //         await stopVideo();
    //         cleanDisplayCanvas();

    //         //PreviousDevices = PreviousDevices.filter(item => item.deviceId !== CurrentVideoDevice.deviceId);
    //         //await delay(500);
    //     }
    // }

    let CurrentDevices = await makeDeviceList();

    const missing = PreviousDevices.filter(item =>
        !CurrentDevices.some(current => current.deviceId === item.deviceId)
    );
    const extra = CurrentDevices.filter(item =>
        !PreviousDevices.some(current => current.deviceId === item.deviceId)
    );

    if (missing.length > 0) console.log("miss", missing);
    if (extra.length > 0) console.log("extra", extra);

    const videoSelect = document.getElementById(appFC.idVideoinputSelect);
    const audioSelect = document.getElementById(appFC.idAudioinputSelect);

    // Video
    let reqChangeVideoDevice = false;
    const plugVideo = extra.filter(dev => dev.kind == 'videoinput');
    const unplugVideo = missing.filter(dev => dev.kind == 'videoinput');

    if (plugVideo.length > 0) console.log("plugVideo", plugVideo);
    if (unplugVideo.length > 0) console.log("unplugVideo", unplugVideo);

    if (plugVideo.length > 0) {

        if (CurrentVideoDevice == null) {
            // 原本無 video device
            CurrentVideoDevice = await selectVideoDefaultDevice(CurrentDevices);
            //CurrentVideoDevice = plugVideo[0];
            reqChangeVideoDevice = true;

            // } else if (checkDC(plugVideo[0])) {
            //     // 原本存在 video device，插入 DC
            //     console.log("Plug DC");
            //     videoSelect.value = plugVideo[0].deviceId;
            //     CurrentVideoDevice = plugVideo[0];
            //     reqChangeVideoDevice = true;
        } else {
            // 原本存在 video device，插入非 DC
            // do nothing
        }
    }

    // 合併於 flReqTrackEnded
    // if (unplugVideo.length > 0) {
    //     // unplug current video device
    //     if (unplugVideo.some(dev => dev.deviceId == CurrentVideoDevice.deviceId)) {

    //         console.log("unplug current video device");

    //         CurrentVideoDevice = await selectVideoDefaultDevice(CurrentDevices);

    //         if (CurrentVideoDevice) {
    //             videoSelect.value = CurrentVideoDevice.deviceId;
    //             reqChangeVideoDevice = true;
    //         } else {
    //             videoSelect.value = null;
    //         }
    //     } else {
    //         // un-plug others
    //     }
    // }

    if (flReqTrackEnded) {
        console.log("flReqTrackEnded");
        flReqTrackEnded = false;

        setRecordBottonEnable(false);

        if (IsRecording) {
            await StopRecord();
        }

        await stopVideo();
        cleanDisplayCanvas();

        // remove current device from list
        if (CurrentVideoDevice)
            CurrentDevices = CurrentDevices.filter(device => device.deviceId != CurrentVideoDevice.deviceId);

        CurrentVideoDevice = await selectVideoDefaultDevice(CurrentDevices);
        if (CurrentVideoDevice) {
            videoSelect.value = CurrentVideoDevice.deviceId;
            reqChangeVideoDevice = true;
        } else {
            videoSelect.value = null;
        }
    }

    // Audio
    const plugAudio = extra.filter(dev => dev.kind == 'audioinput');
    const unplugAudio = missing.filter(dev => dev.kind == 'audioinput');
    if (plugAudio.length > 0) console.log("plugAudio", plugAudio);
    if (unplugAudio.length > 0) console.log("unplugAudio", unplugAudio);

    if (plugAudio.length > 0) {
        if (CurrentAudioDevice == null) {
            audioSelect.value = plugAudio[0].deviceId;
            CurrentAudioDevice = plugAudio[0];
        } else if (checkDC(plugAudio[0])) {
            audioSelect.value = plugAudio[0].deviceId;
            CurrentAudioDevice = plugAudio[0];
        }
    }

    if (unplugAudio.length > 0) {
        CurrentAudioDevice = await selectAudioDefaultDevice(CurrentDevices);

        if (CurrentAudioDevice) {
            audioSelect.value = CurrentAudioDevice.deviceId;
        } else {
            audioSelect.value = null;
        }
    }

    // Change Video Device (source)
    if (reqChangeVideoDevice && CurrentVideoDevice) {
        IsDeviceConnected = false;
        //await stopVideo();
        await startVideo();
    }

    PreviousDevices = CurrentDevices;

    isEnumerating = false;

    if (reqEnumerating) {
        await handleDeviceChange();
    }
}

function checkDC(device) {
    if (!device || !device.label) {
        console.warn("Invalid device object or label is missing");
        return false;
    }
    return device.label.includes("Document Camera");
}

async function fcChangeBaseImageSizeEx(vW, vH) {

    if (fullPhotoMode) {
        dispW = winW;
        dispH = winH;
        dispX = 0;
        dispY = 0;
    }
    else {
        dispW = winW - appBaseCfg.iconW * 2;
        dispH = winH - titleH - appBaseCfg.drawSetH;
        dispX = appBaseCfg.iconW;
        dispY = titleH;
    }

    console.log("fcChangeBaseImageSizeEx Disp", dispX, dispY, dispW, dispH);

    cssCommonSizeObj.left = dispX;
    cssCommonSizeObj.top = dispY;
    cssCommonSizeObj.width = dispW;
    cssCommonSizeObj.height = dispH;

    const id$ = $('#displayCanvas');
    id$.css(cssCommonSizeObj);
    id$.attr('width', dispW);
    id$.attr('height', dispH);

    videoW = vW;
    videoH = vH;
    previewModeCfg.imgW = dispW;
    previewModeCfg.imgH = dispH;
    appFC.imgW = dispW;
    appFC.imgH = dispH;

    calculateCropVertices(videoW, videoH, dispW, dispH);
    if (gl) gl.viewport(0, 0, dispW, dispH);

    const mc = appFC.curMode;
    // resetCanvasGroupSize(mc, dispW, dispH);
    previewModeCfg.imgW = dispW;
    previewModeCfg.imgH = dispH;
    drawingBoardModeCfg.imgW = dispW;
    drawingBoardModeCfg.imgH = dispH;

    resetCanvasGroupSize(previewModeCfg, dispW, dispH);
    resetCanvasGroupSize(drawingBoardModeCfg, dispW, dispH);

    const canvas = document.getElementById("drawingArea-baseImageCanvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawingBoardModeCfg.imageProcess();

    //fcClearDrawingCanvas();

    //fcClearCanvas(previewModeCfg.drawCanvas);
    //fcClearCanvas(drawingBoardModeCfg.drawCanvas);

    //fcResetCanvasArray(previewModeCfg);
    //fcResetCanvasArray(drawingBoardModeCfg);

    fcUpdateSysInfoWin();
    fcUpdateSysInfoData();
    fcResetZoomRatio();
    fcUpdatePanWin();
    fcUpdateCropWin();
}

let facingMode = "unknow";

async function startVideo() {
    const constraints = await getConstraints();

    if (!constraints) {
        return;
    } else {
        console.log("Start Video constraints", constraints);
    }


    try {
        window.stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("start Video stream", window.stream);
        if (!window.stream)
            return;

        const videoTrack = window.stream.getVideoTracks()[0];
        videoTrack.onended = () => {
            console.log("Video track has ended.", new Date());
            handleTrackEnded(); // 你的處理邏輯
        };

        const settings = videoTrack.getSettings();
        facingMode = settings.facingMode;

        videoElement.srcObject = window.stream;

        //makeDeviceList();

        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('webkit-playsinline', '');
        videoElement.onloadeddata = () => {
            initWebGL(); // Start WebGL once video is loaded
            fcChangeBaseImageSizeEx(videoElement.videoWidth, videoElement.videoHeight);
            //gl.viewport(0, 0, dispW, dispH);
        };

        await videoElement.load();

        const playPromise = videoElement.play();

        if (playPromise !== undefined) {
            await playPromise.then(_ => {
                videoElement.muted = true;
                videoElement.hidden = true;
                IsDeviceConnected = true;
                setRecordBottonEnable(true);
            })
        }
    } catch (error) {
        console.log("無法顯示影像流:", error);
        connectError();
    }
}

async function stopVideo() {
    //console.log("stopVideo");
    if (window.stream) {

        window.stream.getTracks().forEach(function (track) {
            track.stop();
            window.stream.removeTrack(track);
        });

        console.log("stopVideo", window.stream);
        setTimeout(() => {
            console.log("Stream active after stopping all tracks:", window.stream.active);
            if (window.stream.active == false)
                window.stream = null;
        }, 100); // 短延遲檢查
        videoElement.srcObject = null;

    }
    IsDeviceConnected = false;
    setRecordBottonEnable(false);
}

///////////////////////////////////////////////////////////////////////////////////////////
// update stream frame 
///////////////////////////////////////////////////////////////////////////////////////////

let lastTime = -1;
let canvasGL;
let canvasVideoOrg = null;
let contextVideoOrg;

let ModCnt = 30;
let frameCnt = 0;

async function updateVideoStreamFrame() {
    if (!videoElement) {
        videoElement = document.getElementById('videoSrc');
    }

    if (!canvasGL) {
        canvasGL = document.getElementById('previewArea-WebGL');
    }

    if (!contextVideoOrg) {
        canvasVideoOrg = document.getElementById('previewArea-videoOrg');
        contextVideoOrg = canvasVideoOrg.getContext('2d');
    }

    if (IsDeviceConnected) {
        // frameCnt += 1;
        // if (frameCnt % ModCnt == 0)
        //     console.log(videoW, videoH, videoElement.videoWidth, videoElement.videoHeight);

        if (IsRecording) {
            if (isMobileDevice) {
                if (initialOrientation !== getCurrentRotation() && initialVideoW !== videoW) {
                    const currentRotation = getCurrentRotation();
                    let rotationDifference = 0;

                    if (facingMode == "user") {
                        rotationDifference = initialOrientation - currentRotation;
                    } else {
                        //environment
                        rotationDifference = currentRotation - initialOrientation;
                    }



                    // 根據旋轉方向調整 canvas 的寬高
                    if (Math.abs(rotationDifference) === 90 || Math.abs(rotationDifference) === 270) {
                        // canvasVideoOrg.width = videoH;
                        // canvasVideoOrg.height = videoW;
                        canvasVideoOrg.width = videoElement.videoHeight;
                        canvasVideoOrg.height = videoElement.videoWidth;
                    } else {
                        // canvasVideoOrg.width = videoW;
                        // canvasVideoOrg.height = videoH;
                        canvasVideoOrg.width = videoElement.videoWidth;
                        canvasVideoOrg.height = videoElement.videoHeight;
                    }

                    // 清除畫布
                    //contextVideoOrg.clearRect(0, 0, canvasVideoOrg.width, canvasVideoOrg.height);

                    // 平移到中心點，進行反向旋轉修正
                    contextVideoOrg.translate(canvasVideoOrg.width / 2, canvasVideoOrg.height / 2);
                    contextVideoOrg.rotate((-rotationDifference * Math.PI) / 180);

                    // 計算正確的縮放比例，讓畫面保持原比例
                    // const scaleX = canvasVideoOrg.width / videoElement.videoWidth;
                    // const scaleY = canvasVideoOrg.height / videoElement.videoHeight;
                    // const scale = Math.max(scaleX, scaleY);  // 確保畫面不會有空白區域

                    // 進行縮放並繪製影像
                    //contextVideoOrg.scale(scale, scale);

                    // if (Math.abs(rotationDifference) === 90 || Math.abs(rotationDifference) === 270) {
                    //     contextVideoOrg.drawImage(
                    //         videoElement,
                    //         -canvasVideoOrg.height / 2,
                    //         -canvasVideoOrg.width / 2,
                    //         canvasVideoOrg.height,
                    //         canvasVideoOrg.width
                    //     );
                    // } else {
                    //     contextVideoOrg.drawImage(
                    //         videoElement,
                    //         -canvasVideoOrg.width / 2,
                    //         -canvasVideoOrg.height / 2,
                    //         canvasVideoOrg.width,
                    //         canvasVideoOrg.height
                    //     );
                    // }
                    contextVideoOrg.drawImage(
                        videoElement,
                        //0, 0, videoW, videoH,
                        // -canvasVideoOrg.width / 2,
                        // -canvasVideoOrg.height / 2,
                        // canvasVideoOrg.width,
                        // canvasVideoOrg.height
                        - videoElement.videoWidth / 2,
                        -videoElement.videoHeight / 2,
                        videoElement.videoWidth,
                        videoElement.videoHeight
                    );

                    // 重置變換矩陣
                    contextVideoOrg.setTransform(1, 0, 0, 1, 0, 0);
                } else {
                    contextVideoOrg.drawImage(videoElement, 0, 0, videoW, videoH);
                }
            } else {
                contextVideoOrg.drawImage(videoElement, 0, 0, videoW, videoH);
            }
        }

        // WebGL Render
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoElement);
        gl.useProgram(program);

        // Set attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordVertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texCoordLocation);

        // Set brightness uniform
        const brightnessValue = parseFloat(document.getElementById('configDlg-brightness-slider').value);
        gl.uniform1f(brightnessLocation, brightnessValue);
        const whiteBalanceValue = parseFloat(document.getElementById('configDlg-whiteBalence-slider').value);
        gl.uniform3f(whiteBalanceLocation, whiteBalanceValue, 1.0, 2.0 - whiteBalanceValue);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        var time = videoElement.currentTime;

        if (time && (time !== lastTime)) {
            //console.log('time: ' + time);
            lastTime = time;
            videoLastUpdateTime = new Date();
            previewVideoStreamUpdate(canvasGL);
            //previewVideoStreamUpdate(videoElement);
        }

        const track = window.stream.getVideoTracks()[0];
        const settings = track.getSettings();
        //console.log(settings.width, settings.height);

        if (videoW != settings.width) {
            console.log("updateVideoStreamFrame => fcChangeBaseImageSizeEx", videoW, settings.width);
            fcChangeBaseImageSizeEx(settings.width, settings.height);
        }
    }

    requestAnimationFrame(updateVideoStreamFrame);
}

function connectError() {
    setRecordBottonEnable(false);
    cleanDisplayCanvas();
}

function cleanDisplayCanvas() {
    const canvas = document.getElementById('displayCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(128, 128, 128, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

$(document.body).on('mouseup', (event) => {
    //console.log('Body click');

    // 判斷點擊的是否是未被處理的元素
    // if (!event.isDefaultPrevented()) {
    //     console.log('未被其他處理器攔截的點擊', event.target);
    //     // 執行統一處理
    // }

    if (event.target === document.body) {
        fcCloseActiveDlg();
    } else {
        switch (event.target.id) {
            case "displayCanvas":
                fcCloseActiveDlg();
                break;
        }
    }
});
//const video = document.getElementById('webcam');
var gl;
var texture;
var vertexShader;
var fragmentShader;
var program;
var positionLocation;
var texCoordLocation;
var brightnessLocation;
var whiteBalanceLocation;
var cropLocation;
var positionBuffer;
var texCoordBuffer;

// Initialize WebGL
function initWebGL() {
	let canvas = document.getElementById('previewArea-WebGL');
	//var canvas = document.getElementById('displayCanvas');
	gl = canvas.getContext('webgl');

	//console.log("initWebGL", canvas, gl);

	if (!gl) {
		//alert('WebGL not supported');
		throw new Error('WebGL not supported');
	}

	const vertexShaderSource = `
      attribute vec4 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = a_position;
        v_texCoord = a_texCoord;
      }
    `;

	const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D u_image;
      uniform float u_brightness;
      uniform vec3 u_whiteBalance;
      varying vec2 v_texCoord;
      
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);

        color.rgb *= u_brightness; // Apply brightness adjustment
        color.r *= u_whiteBalance.r;
        color.g *= u_whiteBalance.g;
        color.b *= u_whiteBalance.b;
        gl_FragColor = color;
      }
    `;

	vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	program = createProgram(gl, vertexShader, fragmentShader);

	// Get locations
	positionLocation = gl.getAttribLocation(program, 'a_position');
	texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
	brightnessLocation = gl.getUniformLocation(program, 'u_brightness');
	whiteBalanceLocation = gl.getUniformLocation(program, 'u_whiteBalance');

	// Set up position buffer
	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	// 	-1, -1, 1, -1, -1, 1,
	// 	-1, 1, 1, -1, 1, 1,
	// ]), gl.STATIC_DRAW);

	// Set up texture coordinate buffer
	texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	// 	// 0, 1,  // 左下角 -> 原本是 (0, 0)
	// 	// 1, 1,  // 右下角 -> 原本是 (1, 0)
	// 	// 0, 0,  // 左上角 -> 原本是 (0, 1)
	// 	// 0, 0,  // 左上角 -> 原本是 (0, 1)
	// 	// 1, 1,  // 右下角 -> 原本是 (1, 0)
	// 	// 1, 0   // 右上角 -> 原本是 (1, 1)
	// 	0, 0,
	// 	1, 0,
	// 	0, 1,
	// 	0, 1,
	// 	1, 0,
	// 	1, 1,
	// ]), gl.STATIC_DRAW);

	// Create texture
	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	//requestAnimationFrame(render);
}

// Helper functions
function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

let positionVertices = [];
let texCoordVertices = [];

function calculateCropVertices(inputWidth, inputHeight, outputWidth, outputHeight) {
	//console.log("calculateCropVertices");
	const inputAspectRatio = inputWidth / inputHeight;
	const outputAspectRatio = outputWidth / outputHeight;

	if (outputAspectRatio > inputAspectRatio) {
		// 裁切上下
		const heightRatio = inputAspectRatio / outputAspectRatio;
		const cropTop = (1 - heightRatio) / 2;
		const cropBottom = 1 - cropTop;

		positionVertices = [
			-1, -1, // 左下角
			1, -1, // 右下角
			-1, 1, // 左上角
			-1, 1, // 左上角
			1, -1, // 右下角
			1, 1, // 右上角
		];

		texCoordVertices = [
			0, cropBottom, // 左下角
			1, cropBottom, // 右下角
			0, cropTop,    // 左上角
			0, cropTop,    // 左上角
			1, cropBottom, // 右下角
			1, cropTop,    // 右上角
		];
	} else {
		// 裁切左右
		const widthRatio = outputAspectRatio / inputAspectRatio;
		const cropLeft = (1 - widthRatio) / 2;
		const cropRight = 1 - cropLeft;

		positionVertices = [
			-1, -1, // 左下角
			1, -1, // 右下角
			-1, 1, // 左上角
			-1, 1, // 左上角
			1, -1, // 右下角
			1, 1, // 右上角
		];

		texCoordVertices = [
			cropLeft, 1, // 左下角
			cropRight, 1, // 右下角
			cropLeft, 0,  // 左上角
			cropLeft, 0,  // 左上角
			cropRight, 1, // 右下角
			cropRight, 0, // 右上角
		];
	}
}async function showVideoSource() {
    $('#displayCanvas').hide();
    $('#previewArea-WebGL').hide();
    $('#videoSrc').show();
}

async function showWebGL() {
    $('#displayCanvas').hide();
    $('#videoSrc').hide();
    $('#previewArea-WebGL').show();
}

function getCurrentRotation() {
    return screen.orientation.angle || 0;  // 默認為 0 度
}

function getOrientation() {
    // if (window.orientation !== undefined) {
    //     switch (window.orientation) {
    //         case 0:
    //             return 'portrait';  // 直向正向
    //         case 90:
    //         case -90:
    //             return 'landscape';  // 橫向
    //         case 180:
    //             return 'portrait';  // 直向反向
    //     }
    // } else {
    //     // 若不支援 window.orientation，用媒體查詢方式
    //     return window.matchMedia("(orientation: landscape)").matches ? 'landscape' : 'portrait';
    // }
    return window.matchMedia("(orientation: landscape)").matches ? 'landscape' : 'portrait';
}

function downloadBlob_back(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 延遲釋放 Object URL，確保下載完成
    setTimeout(() => {
        URL.revokeObjectURL(url);
        console.log('資源已釋放');
    }, 1000);  // 延遲 1 秒
    //URL.revokeObjectURL(link.href);
}

function downloadBlob(blob, filename) {
    // 將 MIME 類型設定為 application/octet-stream
    const octetBlob = new Blob([blob], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(octetBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 延遲釋放 Object URL
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}

// function downloadBlob(blob, filename) {

// const reader = new FileReader();
// reader.onloadend = function () {
//     const link = document.createElement('a');
//     link.href = reader.result;  // 使用 Data URI
//     link.download = filename;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// };
// reader.readAsDataURL(blob);  // 將 blob 轉為 base64 格式
//     const url = URL.createObjectURL(blob);
//     const form = document.createElement('form');
//     form.method = 'POST';
//     form.action = url;
//     form.enctype = 'multipart/form-data';

//     const input = document.createElement('input');
//     input.type = 'hidden';
//     input.name = 'file';
//     input.value = filename;
//     form.appendChild(input);

//     document.body.appendChild(form);
//     form.submit();
//     document.body.removeChild(form);
//     URL.revokeObjectURL(url);
// }



function adjImageDisplayAreaEx() {
    let id$;
    let totalW, totalH;
    let x, y, w, h;

    if (fullPhotoMode) {
        w = totalW = winW;
        h = totalH = winH;
        x = 0;
        y = 0;
    }
    else {
        w = totalW = winW - appBaseCfg.iconW * 2;
        h = totalH = winH - titleH - appBaseCfg.drawSetH;
        x = appBaseCfg.iconW;
        y = titleH;
    }

    cssCommonSizeObj.left = x;
    cssCommonSizeObj.top = y;
    cssCommonSizeObj.width = w;
    cssCommonSizeObj.height = h;

    id$ = $('#displayCanvas');
    id$.css(cssCommonSizeObj);
    id$.attr('width', w);
    id$.attr('height', h);

    dispX = x;
    dispY = y;
    dispW = w;
    dispH = h;

    calculateCropVertices(videoW, videoH, w, h);
    if (gl) gl.viewport(0, 0, dispW, dispH);
    //console.log("adjImageDisplayArea Disp", dispX, dispY, dispW, dispH);

    previewModeCfg.imgW = dispW;
    previewModeCfg.imgH = dispH;
    drawingBoardModeCfg.imgW = dispW;
    drawingBoardModeCfg.imgH = dispH;

    resetCanvasGroupSize(previewModeCfg, dispW, dispH);
    resetCanvasGroupSize(drawingBoardModeCfg, dispW, dispH);
    const canvas = document.getElementById("drawingArea-baseImageCanvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (drawingBoardModeCfg.imageProcessContext)
        drawingBoardModeCfg.imageProcess();
}

async function LogDeviceList() {
    const CurrentDevices = await makeDeviceList();
    console.log(CurrentDevices);
}

async function checkMediaDevice() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
    });
};

async function testDeviceAvailability(deviceId) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } }
        });

        console.log('設備可用:', deviceId);
        stream.getTracks().forEach(track => track.stop()); // 停止媒體流

        return true;
    } catch (error) {
        console.error('設備不可用:', deviceId, error.message);
        return false;
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getCurrentTimeWithMs() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}



// window.addEventListener("orientationchange", async () => {
//     // alert("orientationchange");
//     // await updateVideoDevices();
//     // await stopVideo();
//     // await startVideo();

//     //appFC.checkVideoResolution = true;
//     //previewCheckReqVideoResolution();
// });


// if (screen.width < screen.height) {
// 	if (window.matchMedia("(orientation: portrait)").matches) {
// 		// 直的
// 		if (h < w) {
// 			alert("SWAP I " + appFC.reqImgW + "," + appFC.reqImgH);
// 			let tmp = w;
// 			w = h;
// 			h = tmp;
// 		}
// 	}
// 	else {
// 		// 橫的
// 		if (h > w) {
// 			alert("SWAP II " + appFC.reqImgW + "," + appFC.reqImgH);
// 			let tmp = w;
// 			w = h;
// 			h = tmp;
// 		}
// 	}
// }

async function testVideoResolution() {
    const w = 1920;
    const h = 1080;
    fcChangeBaseImageSize(w, h);
    return;

    const mc = previewModeCfg;


    // //if (mc.chgBaseImgCtrl) await mc.chgBaseImgCtrl(BaseImgChg.before, w, h);
    await stopVideo();

    videoW = mc.imgW = w;
    videoH = mc.imgH = h;

    resetCanvasGroupSize(mc, w, h);
    fcClearDrawingCanvas();
    fcResetCanvasArray(mc);

    appFC.imgW = w;
    appFC.imgH = h;
    adjImageDisplayArea();
    fcUpdateSysInfoWin();
    fcUpdateSysInfoData();

    await startVideo();

    // //if (mc.chgBaseImgCtrl) await mc.chgBaseImgCtrl(BaseImgChg.after, w, h);

    fcResetZoomRatio(); // 20230429
    fcUpdatePanWin();
    fcUpdateCropWin();

}