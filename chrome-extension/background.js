console.log('易上架 background script loaded');

try {
  importScripts('js/tesseract.min.js');
  console.log('Tesseract.js loaded successfully');
} catch (error) {
  console.error('Failed to load Tesseract.js:', error);
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('易上架 extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.action.openPopup();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'performOCR') {
    performOCR(request.imageData)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('OCR error:', error);
        sendResponse({ text: '', error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});

async function performOCR(imageDataUrl) {
  try {
    const worker = await Tesseract.createWorker({
      workerPath: chrome.runtime.getURL('js/worker.min.js'),
      langPath: chrome.runtime.getURL('traineddata'),
      corePath: chrome.runtime.getURL('js/tesseract-core.wasm.js'),
    });
    
    await worker.loadLanguage('chi_sim+eng');
    await worker.initialize('chi_sim+eng');
    
    const { data: { text } } = await worker.recognize(imageDataUrl);
    
    await worker.terminate();
    
    return { text: text.trim() };
  } catch (error) {
    console.error('OCR processing error:', error);
    return { text: '', error: error.message };
  }
}
