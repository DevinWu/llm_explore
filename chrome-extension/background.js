console.log('易上架 background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('易上架 extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.action.openPopup();
});
