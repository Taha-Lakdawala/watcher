
const viewItems = async() => {

	const itemData = await chrome.storage.sync.get();

	const itemsElement = document.getElementById("items");
  	itemsElement.innerHTML = "";

	if (Object.keys(itemData).length === 0) {
    	itemsElement.innerHTML = '<i class="row">No items are being tracked</i>';
    	return;
  	}

	const itemTable = document.createElement("table");
	itemTable.classList.add("table", "table-bordered", "table-responsive-lg");
	const itemTableH = document.createElement("tr");
	const itemH = document.createElement("th");
	itemH.innerHTML = "Item";
	const priceH = document.createElement("th");
	priceH.innerHTML = "Current";
	const priceLowestH = document.createElement("th");
    priceLowestH.innerHTML = "Lowest";
	const priceHighestH = document.createElement("th");
	priceHighestH.innerHTML = "Highest";

	
	itemTableH.appendChild(itemH);
	itemTableH.appendChild(priceH);
	itemTableH.appendChild(priceLowestH);
	itemTableH.appendChild(priceHighestH);

	itemTable.appendChild(itemTableH);

	for (let itemId in itemData) {
		addNewItem(itemsElement, itemTable, itemData[itemId]);
  	}

};

const addNewItem = (itemsElement, table, data) => {
	data = JSON.parse(data);

	const row = document.createElement("tr");
	
	const itemTitleR = document.createElement("td");
	const titleDiv = document.createElement("div");
	const titleAnchor = document.createElement("a");
	titleAnchor.href = data.url;
	titleAnchor.innerHTML = data.title;
	titleAnchor.target = "_blank";
	titleDiv.classList.add("itemdiv");
	titleDiv.append(titleAnchor);
	itemTitleR.appendChild(titleDiv);
	row.appendChild(itemTitleR);
	
	const itemCurrPriceR = document.createElement("td");
	const currPriceDiv = document.createElement("div");
	currPriceDiv.innerHTML = data.currPrice;
	itemCurrPriceR.appendChild(currPriceDiv);
	row.appendChild(itemCurrPriceR);
	
	const itemLowPriceR = document.createElement("td");
	const lowPriceDiv = document.createElement("div");
	lowPriceDiv.innerHTML = data.lowestPrice;
	itemLowPriceR.appendChild(lowPriceDiv);
	row.appendChild(itemLowPriceR);
	
	const itemHighPriceR = document.createElement("td");
	const highPriceDiv = document.createElement("div");
	highPriceDiv.innerHTML = data.highestPrice;
	itemHighPriceR.appendChild(highPriceDiv)
	row.appendChild(itemHighPriceR);

	table.appendChild(row);
	itemsElement.appendChild(table);

};

document.addEventListener("DOMContentLoaded", async () => {
    viewItems();
});