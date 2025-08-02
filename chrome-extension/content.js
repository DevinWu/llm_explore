console.log('易上架 content script loaded');

async function extractTextFromImages() {
  const images = document.querySelectorAll('img');
  let ocrText = '';
  
  for (const img of images) {
    try {
      if (img.width < 50 || img.height < 50) continue;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      
      const result = await chrome.runtime.sendMessage({
        action: 'performOCR',
        imageData: await blobToBase64(blob)
      });
      
      if (result && result.text) {
        ocrText += ' ' + result.text;
      }
    } catch (error) {
      console.log('OCR error for image:', error);
    }
  }
  
  return ocrText.trim();
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
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
    
    let ocrText = '';
    try {
      ocrText = await extractTextFromImages();
      const ocrChineseMatches = ocrText.match(chineseRegex);
      if (ocrChineseMatches && ocrChineseMatches.length > 0) {
        ocrText = ocrChineseMatches.join(' ').substring(0, 300);
      } else {
        ocrText = ocrText.substring(0, 100);
      }
    } catch (error) {
      console.log('OCR extraction failed:', error);
      ocrText = '';
    }
    
    let combinedText = regularText;
    if (ocrText) {
      combinedText += (regularText ? ' ' : '') + ocrText;
    }
    
    sendResponse({ 
      content: combinedText,
      regularText: regularText,
      ocrText: ocrText
    });
  }
  
  return true; // Keep message channel open for async response
});
