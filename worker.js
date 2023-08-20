async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: "fetchData.html",

    /* valid reasons: 
    AUDIO_PLAYBACK, 
    BLOBS, 
    CLIPBOARD, 
    DISPLAY_MEDIA, 
    DOM_PARSER, 
    DOM_SCRAPING, 
    IFRAME_SCRIPTING,
    TESTING, 
    USER_MEDIA, 
    WEB_RTC.
    */
    reasons: ["DOM_PARSER"],
    justification: "to track price",
  });
}

chrome.tabs.onUpdated.addListener((tabId, tab, changeInfo) => {
  let itemId = "";
  let itemSite = "";
  let validProductSite = true;

  if (
    changeInfo.url.includes("amazon.in") &&
    changeInfo.url.match(/(?:[/dp/]|$)([A-Z0-9]{10})/)
  ) {
    itemSite = "amazon";
    itemId = changeInfo.url.match(/(?:[/dp/]|$)([A-Z0-9]{10})/)[1];
  } 
  else if (
    changeInfo.url.includes("flipkart.com") &&
    changeInfo.url.match(/(itm[a-zA-Z0-9]+)/)
  ) {
    itemSite = "flipkart";
    itemId = changeInfo.url.match(/(itm[a-zA-Z0-9]+)/)[0];
  } 
  else if (
    changeInfo.url.includes("myntra.com") &&
    changeInfo.url.match(/\/(\d+)\/[^/]*$/)
  ) {
    itemSite = "myntra";
    itemId = changeInfo.url.match(/\/(\d+)\/[^/]*$/)[1];
  } else validProductSite = false;

  if (
    changeInfo.url &&
    validProductSite &&
    changeInfo.status === "complete"
  ) {
    

    if (itemId) {
      
      chrome.tabs.sendMessage(
        tabId,
        {
          type: "NEW",
          id: itemId,
          site: itemSite,
          url: changeInfo.url,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
          }
        }
      );
    }
  }
});


chrome.runtime.onStartup.addListener(async function () {

  let itemData = await chrome.storage.sync.get();
  
  await createOffscreen();
  
  const data = await chrome.runtime.sendMessage({
    offscreen: true,
    data: itemData,
  });

  for (const item of data.priceData) {

    const newPrice = {
      price: item.price,
      date: new Date().toISOString(),
    };

    let itemInfo = JSON.parse(itemData[item.id]);

    if (
      itemInfo.latestFetchDate.split("T")[0] === newPrice.date.split("T")[0]
    ) {
      return;
    }

    itemInfo.prices.push(newPrice);

    itemInfo.prices.sort(
      (a, b) =>
        parseFloat(a.price.match(/\d+/)[0]) -
        parseFloat(b.price.match(/\d+/)[0])
    );

    itemInfo.currPrice = newPrice.price;
    itemInfo.lowestPrice = itemInfo.prices.slice(0)[0].price;
    itemInfo.highestPrice = itemInfo.prices.slice(-1)[0].price;

    itemInfo.latestFetchDate = newPrice.date;
        

    itemData[item.id] = itemInfo;

    chrome.storage.sync.set({
      [item.id] : JSON.stringify(itemData[item.id]),
    });
  }
});
