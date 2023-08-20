chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (!msg.offscreen) {
    return;
  }

  (async () => {
    const data = await checkPrices(msg.data);
    sendResponse({ priceData: data });
  })();

  return true;
});

const getPrice = (site, doc, priceClass) => {
  if (site == "myntra") {
    return (
      "\u20B9" +
      JSON.parse(doc.querySelectorAll(priceClass)[1].textContent).offers.price
    );
  }
  return doc
    .getElementsByClassName(priceClass)[0]
    .textContent.replace(/^\s\s*/, "")
    .replace(/\s\s*$/, "");
}

async function checkPrices(allItems) {
  if (!allItems) {
    return [];
  }

  const fetchPromises = Object.keys(allItems).map((itemId) =>
    fetch(JSON.parse(allItems[itemId]).url)
  );

  try {
    const responses = await Promise.all(fetchPromises);
    const textArray = await Promise.all(responses.map((res) => res.text()));

    const data = [];
    let itemPrice = "";

    for (let i = 0; i < textArray.length; i++) {
      const parser = new DOMParser();
      const htmlDocument = parser.parseFromString(textArray[i], "text/html");
      
      if (JSON.parse(allItems[Object.keys(allItems)[i]]).site == "amazon") {
          itemPrice = getPrice("amazon", htmlDocument, "a-offscreen");
      } 
      else if (JSON.parse(allItems[Object.keys(allItems)[i]]).site == "flipkart") {
          itemPrice = getPrice("flipkart", htmlDocument, "_30jeq3 _16Jk6d");
      } 
      else if (JSON.parse(allItems[Object.keys(allItems)[i]]).site == "myntra") {
          itemPrice = getPrice("myntra", htmlDocument, '[type="application/ld+json"]');
      }

      const itemId = Object.keys(allItems)[i];

      const priceData = {
        id: itemId,
        price: itemPrice,
      };

      data.push(priceData);
    }

    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

