console.log('易上架 content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    console.log('Content script received extractContent message');
    
    const chineseRegex = /[\u4e00-\u9fff]+/g;
    
    const textContent = document.body.innerText || document.body.textContent || '';
    const chineseMatches = textContent.match(chineseRegex);
    
    let regularText = '';
    if (chineseMatches && chineseMatches.length > 0) {
      regularText = chineseMatches.join(' ').substring(0, 500);
    } else {
      const allText = textContent.replace(/\s+/g, ' ').trim();
      regularText = allText.substring(0, 200);
    }
    
    console.log('Regular text extracted:', regularText);
    
    console.log('Sending response:', { content: regularText });
    sendResponse({ 
      content: regularText
    });
    
    return true;
  }
});
