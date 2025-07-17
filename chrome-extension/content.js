console.log('TranslateHub content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    const chineseRegex = /[\u4e00-\u9fff]+/g;
    const textContent = document.body.innerText || document.body.textContent || '';
    
    const chineseMatches = textContent.match(chineseRegex);
    
    let result;
    if (chineseMatches && chineseMatches.length > 0) {
      result = chineseMatches.join(' ').substring(0, 500);
    } else {
      const allText = textContent.replace(/\s+/g, ' ').trim();
      result = allText.substring(0, 200);
    }
    
    sendResponse({ content: result });
  }
});
