let db;
const request = indexedDB.open('BuildsDB', 1);

request.onupgradeneeded = function (event) {
	const db = event.target.result;
	const buildsStore = db.createObjectStore('builds', { keyPath: 'id', autoIncrement: true });
	buildsStore.createIndex('name', 'name');
};

request.onsuccess = function (event) {
	db = event.target.result;
	showBuilds(); // Mostrar las imágenes al cargar la página
};

function showBuilds() {
	const transaction = db.transaction(['builds'], 'readonly');
	const buildsStore = transaction.objectStore('builds');
	const buildsRequest = buildsStore.getAll();
	buildsRequest.onsuccess = function () {
		const builds = buildsRequest.result;
		displayBuildsImages(builds);
	};
}

function displayBuildsImages(builds) {
	const championsContainer = document.getElementById('champions-container');
	builds.forEach(build => {
		const champDiv = document.createElement('div');
		champDiv.classList.add('col-4', 'col-md-3', 'col-lg-2', 'm-2');
		const champImage = generateChampImageFromDB(build.name);
		const itemImages = generateItemImagesFromDB(build.items);
		champDiv.appendChild(champImage);
		champDiv.appendChild(itemImages);
		championsContainer.appendChild(champDiv);
	});
}

function generateItemImagesFromDB(itemValues) {
	const itemImagesContainer = document.createElement('div');

	itemValues.forEach(itemValue => {
		const img = document.createElement('img');
		img.classList.add('item-image');
		img.src = `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/${itemValue}`; // Reemplaza con la lógica para obtener la imagen del ítem
		img.alt = itemValue;

		itemImagesContainer.appendChild(img);
	});

	return itemImagesContainer;
}

function generateChampImageFromDB(champName, items) {
	const cardDiv = document.createElement('div');
	cardDiv.classList.add('col-4', 'col-md-3', 'col-lg-2', 'm-2');
	const champDiv = document.createElement('div');
	champDiv.classList.add('champion');
	const img = document.createElement('img');
	img.classList.add('card-img-tops');
	img.src = `https://ddragon.leagueoflegends.com/cdn/13.23.1/img/champion/${champName}.png`; // Reemplaza con tu lógica para obtener la imagen del campeón
	img.alt = champName;
	const deleteButton = document.createElement('button');
	deleteButton.textContent = 'Eliminar';
	deleteButton.classList.add('btn', 'btn-danger', 'mt-2');
	deleteButton.onclick = function () {
		deleteChampionFromDB(champName);
		cardDiv.remove(); // Eliminar el div del campeón al hacer clic en el botón
		window.location.reload();
	};
	champDiv.appendChild(img);
	champDiv.appendChild(deleteButton);
	// Si el array de items se pasa, también se muestra la lista de items
	if (items && items.length > 0) {
		const itemImages = generateItemImagesFromDB(items);
		champDiv.appendChild(itemImages);
	}
	cardDiv.appendChild(champDiv);
	return cardDiv;
}

function deleteChampionFromDB(champName) {
	const transaction = db.transaction(['builds'], 'readwrite');
	const buildsStore = transaction.objectStore('builds');
	const request = buildsStore.index('name').openCursor(champName);
	request.onsuccess = function (event) {
		const cursor = event.target.result;
		if (cursor) {
			cursor.delete();
		}
	};

}
