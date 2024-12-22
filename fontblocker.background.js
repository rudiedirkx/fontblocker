importScripts('fontblocker.logic.js');

function setPageActionIcon(tabId, disabled) {
	var icon = disabled ? '128x128-disabled' : '128x128';
	chrome.action.setIcon({
		tabId: tabId,
		path: chrome.runtime.getURL('images/' + icon + '.png'),
	});
}

// Context menu: BLOCK ALWAYS
chrome.runtime.onInstalled.addListener(function(info) {
	chrome.contextMenus.create({
		"title": 'Block custom font',
		"id": 'fontblockerblockfont',
		"contexts": ["page", "frame", "selection", "link", "editable"],
	});
});

chrome.contextMenus.onClicked.addListener(async function(info, tab) {
	chrome.tabs.sendMessage(tab.id, {getLastElementFont: true}, function(data) {
		// Not as response, bc async, so instead as new message
		// blockFont(data);
	});
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if ( msg && msg.blockFont ) {
		blockFont(msg.blockFont);
		sendResponse({});
	}
});

function blockFont(data) {
	if ( !data || !data.name || !data.host ) return;
	console.debug('Saving font', data);

	fb.exists(data, function(exists) {
		if (!exists) {
			fb.add(data);
		}
	});
}

// Show page action
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if ( msg && msg.fontsBlocked ) {
		setPageActionIcon(sender.tab.id);
		chrome.action.enable(sender.tab.id);
		sendResponse({});
	}
});

// Click on page action
chrome.action.onClicked.addListener(function(tab) {
	chrome.tabs.sendMessage(tab.id, {glimpseFonts: true}, function(data) {
		setPageActionIcon(tab.id, data.disabled);
	});
});
