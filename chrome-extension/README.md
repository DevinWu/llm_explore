# TranslateHub Chrome Extension

A Chrome extension for capturing page content and translating Chinese text to English using the TranslateHub API.

## Features

- User authentication (login/register)
- Capture page content from any website
- Platform selection (Amazon, eBay)
- Chinese to English translation
- Balance tracking and billing integration
- Free translations (first 10) and paid translations (¥1.00 each)

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `chrome-extension` directory
4. The TranslateHub extension should now appear in your extensions list

## Usage

1. Click the TranslateHub extension icon in your browser toolbar
2. Login with your TranslateHub account credentials
3. Select your target platform (Amazon or eBay)
4. Click "Capture Page Content" to extract text from the current page
5. Review the captured Chinese text and click "Translate"
6. View the English translation result

## API Integration

The extension connects to the TranslateHub backend API running on `http://localhost:8000`. Make sure the backend server is running before using the extension.

## Permissions

- `activeTab`: Access to the current active tab for content capture
- `storage`: Store user authentication tokens locally
- `scripting`: Execute content scripts for page content extraction

## Development

The extension consists of:
- `manifest.json`: Extension configuration
- `popup.html/js`: Main extension interface
- `content.js`: Content script for page interaction
- `background.js`: Background service worker
