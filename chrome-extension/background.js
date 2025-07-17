chrome.runtime.onInstalled.addListener(() => {
  console.log('TranslateHub extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.action.openPopup();
});
