console.log('易上架 content script loaded');

async function extractTextFromImages() {
  console.log('Starting image text extraction...');
  const images = document.querySelectorAll('img');
  console.log('Found', images.length, 'images on page');
  
  let ocrText = '';
  let processedImages = 0;
  
  for (const img of images) {
    try {
      console.log('Processing image:', img.src, 'Size:', img.width, 'x', img.height);
      
      if (img.width < 50 || img.height < 50) {
        console.log('Skipping small image');
        continue;
      }
      
      if (!img.complete) {
        await new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      console.log('Created blob for OCR processing');
      
      const result = await chrome.runtime.sendMessage({
        action: 'performOCR',
        imageData: await blobToBase64(blob)
      });
      
      console.log('OCR result for image:', result);
      
      if (result && result.text) {
        ocrText += ' ' + result.text;
        processedImages++;
      }
      
      if (processedImages >= 3) break;
      
    } catch (error) {
      console.log('OCR error for image:', error);
    }
  }
  
  console.log('Finished processing images. OCR text:', ocrText.trim());
  return ocrText.trim();
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

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
    
    extractTextFromImages().then(ocrText => {
      console.log('OCR text extracted:', ocrText);
      
      const ocrChineseMatches = ocrText.match(chineseRegex);
      if (ocrChineseMatches && ocrChineseMatches.length > 0) {
        ocrText = ocrChineseMatches.join(' ').substring(0, 300);
      } else {
        ocrText = ocrText.substring(0, 100);
      }
      
      let combinedText = regularText;
      if (ocrText) {
        combinedText += (regularText ? ' ' : '') + ocrText;
      }
      
      console.log('Sending response:', { content: combinedText, regularText, ocrText });
      
      sendResponse({ 
        content: combinedText,
        regularText: regularText,
        ocrText: ocrText
      });
    }).catch(error => {
      console.log('OCR extraction failed:', error);
      
      sendResponse({ 
        content: regularText,
        regularText: regularText,
        ocrText: ''
      });
    });
    
    return true; // Keep message channel open for async response
  }
});
