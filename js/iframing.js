function resizeIframe(iframe) {
  // Store offset on first calculation
  if(typeof iframe._calculatedOffset === 'undefined') {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // Get the content height
      const contentHeight = Math.max(
        iframeDoc.documentElement.scrollHeight,
        iframeDoc.body.scrollHeight
      );

      // Check how much content is actually visible in current iframe
      const visibleHeight = iframe.clientHeight;
      const hiddenContent = contentHeight - visibleHeight;

      // The offset should account for browser chrome/spacing
      // Use a calculation based on the content-to-container relationship
      const windowHeight = iframe.contentWindow.innerHeight;
      iframe._calculatedOffset = contentHeight - windowHeight;

      //console.log(`Content: ${contentHeight}, Visible: ${visibleHeight}, Window: ${windowHeight}`);
      //console.log(`Calculated offset: ${iframe._calculatedOffset}px`);

      // Claude never figured out where the '60' figure came from.
      // If it is too much, we have more of the contents scrolled out of
      // sight.
      // If it is too little our iframe grows without bounds..
      // For now it is a magic constant, found on Chrome browser.
      // for other browser, who knows... but works on Safari too.
      // If we don't subtract it, our iframe just keeps on growing with 
      // each resize.

      // Fallback to 60 if calculation seems wrong
      if(iframe._calculatedOffset < 0 || iframe._calculatedOffset > 200) {
        console.log('Offset seems wrong, using fallback');
        iframe._calculatedOffset = 60;
      }

    } catch (e) {
      console.log('Could not calculate offset, using fallback');
      iframe._calculatedOffset = 60;
    }
  }

  // Apply the resize with calculated offset
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const contentHeight = Math.max(
      iframeDoc.documentElement.scrollHeight,
      iframeDoc.body.scrollHeight
    );

    const targetHeight = contentHeight - iframe._calculatedOffset;
    //console.log(`Setting height to: ${targetHeight}px (content: ${contentHeight} - offset: ${iframe._calculatedOffset})`);
    iframe.style.height = targetHeight + 'px';

  } catch (e) {
    console.log('Cannot resize iframe: Cross-origin content detected');
    iframe.style.height = '600px';
  }
}

// Safari-specific: Multiple resize attempts
function resizeWithRetry(iframe, attempts = 0) {
  if(attempts > 5) return; // Stop after 5 attempts

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const height = Math.max(
      iframeDoc.documentElement.scrollHeight,
      iframeDoc.body.scrollHeight,
      iframeDoc.documentElement.offsetHeight,
      iframeDoc.body.offsetHeight
    );

    if(height != 600) {
      iframe.style.height = (height + 20) + 'px';
    } else {
      // Retry after a delay
      setTimeout(() => resizeWithRetry(iframe, attempts + 1), 200);
    }
  } catch (e) {
    console.log('Cannot resize iframe:', e);
  }
}

/*
// Enhanced load handler for Safari
document.getElementById('footerFrame').addEventListener('load', function() {
    const iframe = this;
    
    // Immediate resize attempt
    resizeIframe(iframe);
    
    // Safari backup: Multiple delayed attempts
    setTimeout(() => resizeWithRetry(iframe), 100);
    setTimeout(() => resizeWithRetry(iframe), 500);
    setTimeout(() => resizeWithRetry(iframe), 1000);
});

// PostMessage method for cross-origin
window.addEventListener('message', function(event) {
    if (event.data.type === 'resize') {
        const iframe = document.getElementById('footerFrame');
        iframe.style.height = event.data.height + 'px';
    }
});
*/
// Resize on window resize
window.addEventListener('resize', function() {
  const iframe = document.getElementById('footerFrame');
  setTimeout(() => resizeIframe(iframe), 100);
});
