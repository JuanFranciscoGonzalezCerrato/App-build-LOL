const URL = "https://ddragon.leagueoflegends.com/cdn/13.23.1/data/en_US/champion.json";
let imagenActual = null;
const URL_ITEMS = "https://ddragon.leagueoflegends.com/cdn/13.24.1/data/en_US/item.json";
let itemsData;
async function fetchChampionData() {
	const response = await fetch(URL);
	const data = await response.json();
	const champions = Object.values(data.data).slice(0, 10);
	displayChampionImages(champions);
}
// Abre o crea la base de datos.
let db;
const request = indexedDB.open('BuildsDB', 1);

request.onupgradeneeded = function (event) {
	const db = event.target.result;
	const buildsStore = db.createObjectStore('builds', { keyPath: 'id', autoIncrement: true });
	buildsStore.createIndex('name', 'name');
};

request.onsuccess = function (event) {
	db = event.target.result;
};



document.getElementById('guardarBuildButton').addEventListener('click', function () {
	if (imagenActual !== null) {
		const champName = imagenActual.alt; // Obtiene el nombre del campeón de la imagen actual.
		const itemNames = getItemNames(); // Obtiene los nombres de los ítems del contenedor.

		addToBuildsDB(champName, itemNames); // Agrega el nombre del campeón y los nombres de los ítems a la base de datos.
	}
});
function reroll(e) {
	const clickedItem = e.target;
	const randomItem = getRandomItem();
	clickedItem.src = `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/${randomItem.image.full}`;
	// Actualizar el nombre del ítem rerolleado.
	clickedItem.alt = randomItem.image.full;
}

function addToBuildsDB(champName, itemValues) {
	const transaction = db.transaction(['builds'], 'readwrite');
	const buildsStore = transaction.objectStore('builds');
	const newBuild = {
		name: champName,
		items: itemValues
	};
	const request = buildsStore.add(newBuild);

	request.onerror = function (event) {
		console.error('Error al guardar la build:', event.target.error);
	};
}

function getItemNames() {
	const itemNames = [];
	const itemImages = document.querySelectorAll('#item-container img');
	itemImages.forEach(item => {
		itemNames.push(item.alt);
	});
	return itemNames;
}

function displayChampionImages(champions) {
	const championsContainer = document.getElementById('champions-container');
	champions.forEach(champ => {
		const champImage = generateChampImage(champ);
		championsContainer.appendChild(champImage);
	});
}

function generateChampImage(champ) {
	let cardDiv = document.createElement("div");
	cardDiv.classList.add("col-4", "col-md-3", "col-lg-2", "m-2");
	let img = document.createElement("img");
	img.classList.add("card-img-top");
	img.src = `https://ddragon.leagueoflegends.com/cdn/13.23.1/img/champion/${champ.image.full}`;
	img.alt = champ.name;
	img.onclick = function () {
		if (imagenActual !== null) {
			imagenActual.style.filter = "grayscale(100%)";
		}
		img.style.filter = "grayscale(0%)";
		imagenActual = img;
	};
	cardDiv.appendChild(img);

	return cardDiv;
}

async function fetchItemData() {
	const response = await fetch(URL_ITEMS);
	const data = await response.json();
	itemsData = Object.values(data.data);
	displayRandomItemImages();//Muestra las imagenes
}

function generateItem(item) {
	let itemDiv = document.createElement("div");
	itemDiv.classList.add("col-4", "col-md-3", "col-lg-2", "m-2");
	const imgElement = document.createElement("img");
	imgElement.classList.add("img-item");
	imgElement.src = `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/${item.image.full}`;
	imgElement.alt = item.image.full;
	imgElement.addEventListener('click', reroll);
	itemDiv.appendChild(imgElement);
	return itemDiv;
}
function getRandomItem() {//Genera un numero aleatorio de los que haya en data
	return itemsData[Math.floor(Math.random() * itemsData.length)];
}
function displayRandomItemImages() {//Genera 6 items
	const itemContainer = document.getElementById('item-container');
	const max_items = 6;
	for (let i = 0; i < max_items; i++) {
		const randomItem = getRandomItem();
		const itemImage = generateItem(randomItem);
		itemContainer.appendChild(itemImage);
	}
}

fetchItemData();
fetchChampionData();