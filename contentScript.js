(() => {
    let currentItem = "";
    let currentSite = "";
    let currentItemPrice = "";
    let currentItemTitle = "";
    let currentUrl = "";
    let itemData;
    let itemPriceLabel;

    const fetchItems = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentItem], (obj) => {
                resolve(
                  obj[currentItem] ? JSON.parse(obj[currentItem]): null);
            });
        });
    };

    const addNewItemToTrackEventHandler = async () => {
        const priceData = {
          price: currentItemPrice,
          date: new Date().toISOString(),
        };
        
        if (!itemData) {
            itemData = {
                title: currentItemTitle,
                site: currentSite,
                prices: [],
                url: currentUrl,
            }
        }
        
        itemData.prices.push(priceData);

        if (itemData.prices.length !== 1) {
            itemData.prices.sort(
                (a, b) => 
                    parseFloat(a.price.match(/\d+/)[0]) - parseFloat(b.price.match(/\d+/)[0])
            );
        }
        
        itemData.currPrice = currentItemPrice;
        itemData.lowestPrice = itemData.prices.slice(0)[0].price;
        itemData.highestPrice = itemData.prices.slice(-1)[0].price;

        itemData.latestFetchDate = new Date().toISOString();
        
        chrome.storage.sync.set({
            [currentItem]: JSON.stringify(itemData),
        });
        
        // change add button to already being tracked
        const itemBtn = document.getElementsByClassName("item-btn")[0];
        itemBtn.src = chrome.runtime.getURL("assets/accept.png");
        itemBtn.title = "Item is already being tracked";

        itemBtn.removeEventListener("click", addNewItemToTrackEventHandler);
    };

    const createAddItemButton = () => {
        const itemBtn = document.createElement("img");
        itemBtn.src = chrome.runtime.getURL("assets/plus.png");
        itemBtn.style.height = "25px";
        itemBtn.style.width = "25px";
        itemBtn.style.marginLeft = "5px";
        // itemBtn.style.marginTop = "px";
        itemBtn.className = "price-track " + "item-btn";
        itemBtn.title = "Click to track the price of the item";
        return itemBtn;
    }

    const createTrackItemButton = () => {
        const itemBtn = document.createElement("img");
        itemBtn.src = chrome.runtime.getURL("assets/accept.png");
        itemBtn.style.height = "25px";
        itemBtn.style.width = "25px";
        itemBtn.style.marginLeft = "5px";
        // itemBtn.style.marginTop = "5px";
        itemBtn.className = "price-track " + "item-btn";
        itemBtn.title = "Item is already being tracked";
        return itemBtn;
    };

    const getItemAndPrice = (priceClass, titleClass) => {
        currentItemPrice = document
          .getElementsByClassName(priceClass)[0]
          .textContent.replace(/^\s\s*/, "")
          .replace(/\s\s*$/, "");

        if (currentSite == "myntra"){
            const titleClassArr = titleClass.split(" ");
            currentItemTitle = (
              document.getElementsByClassName(titleClassArr[0])[0].textContent + " " +
              document.getElementsByClassName(titleClassArr[1])[0].textContent
              )
              .replace(/^\s\s*/, "")
              .replace(/\s\s*$/, "");
        }
        else {
            currentItemTitle = document
              .getElementsByClassName(titleClass)[0]
              .textContent.replace(/^\s\s*/, "")
              .replace(/\s\s*$/, "");
        }
    }

    const newItemLoaded = async () => {

        itemData = await fetchItems();

        if (currentSite == "amazon") {
          const itemBtnExists = document.getElementsByClassName("item-btn")[0];
          if (itemBtnExists) {
            return;
          }

          getItemAndPrice("a-offscreen", "product-title-word-break");

          if (!itemData) {
            // Creating plus button
            const itemBtn = createAddItemButton();
            // Injecting plus button
            const comboPrice = document.getElementById("basisPriceLegalMessage_feature_div");

            if (comboPrice) {
                itemPriceLabel = document
                  .getElementById("apex_desktop")
                  .getElementsByClassName("a-offscreen")[1].parentElement;
            }
            else {
                itemPriceLabel = document
                  .getElementById("apex_desktop")
                  .getElementsByClassName("a-offscreen")[0].parentElement;
            }
            itemPriceLabel.appendChild(itemBtn);
            // Add event listenter on click
            itemBtn.addEventListener("click", addNewItemToTrackEventHandler);
          } else if (itemData) {
            // Creating track button
                const itemBtn = createTrackItemButton();
                // Injecting plus button
                const comboPrice = document.getElementById(
                  "basisPriceLegalMessage_feature_div"
                );
                if (comboPrice) {
                  itemPriceLabel = document
                    .getElementById("apex_desktop")
                    .getElementsByClassName("a-offscreen")[1].parentElement;
                } else {
                  itemPriceLabel = document
                    .getElementById("apex_desktop")
                    .getElementsByClassName("a-offscreen")[0].parentElement;
                }
                itemPriceLabel.appendChild(itemBtn);
          }

        } else if (currentSite == "flipkart") {
            const itemBtnExists = document.getElementsByClassName("item-btn")[0];
            if (itemBtnExists) {
                return;
            }
 
            getItemAndPrice("_30jeq3 _16Jk6d", "B_NuCI");

            if (!itemData) {
                // Creating plus button
                const itemBtn = createAddItemButton();
                // Injecting plus button
                itemPriceLabel = document.getElementsByClassName("dyC4hf")[0];
                itemPriceLabel.appendChild(itemBtn);

                itemBtn.addEventListener("click", addNewItemToTrackEventHandler);
            } else if (!itemBtnExists && itemData) {
              // Creating track button
                const itemBtn = createTrackItemButton();
                // Injecting track button
                itemPriceLabel = document.getElementsByClassName("dyC4hf")[0];
                itemPriceLabel.appendChild(itemBtn);
            }

        } else if (currentSite == "myntra") {
            const itemBtnExists = document.getElementsByClassName("item-btn")[0];
            if (itemBtnExists) {
                return;
            }

            getItemAndPrice("pdp-price", "pdp-title pdp-name");

            if (!itemData) {
              // Creating plus button
              const itemBtn = createAddItemButton();
              // Injecting plus button
              itemPriceLabel = document.getElementsByClassName("pdp-discount-container")[0];
              itemPriceLabel.appendChild(itemBtn);

              itemBtn.addEventListener("click", addNewItemToTrackEventHandler);
            } else if (itemData) {
                // Creating track button
                const itemBtn = createTrackItemButton();
                // Injecting track button
                itemPriceLabel = document.getElementsByClassName("pdp-discount-container")[0];
                itemPriceLabel.appendChild(itemBtn);
            }
        }
    };

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, id, site, url } = obj;

        if (type === "NEW") {
            currentItem = id;
            currentSite = site;
            currentUrl = url;
            newItemLoaded();
        }

        response(itemData);
    });

})();
