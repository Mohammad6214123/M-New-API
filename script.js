let allPokemon = [];
let currentPokemonIndex = 0;
let isLoading = false;
let totalPokemonCount = 0;

async function fetchPokemon(offset = 0) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
    const data = await res.json();
    totalPokemonCount = data.count;
    return data.results;
}

function init() {
    loadMorePokemon();
}

function renderPokemon() {
    const container = document.getElementById('pokemon-container');
    container.innerHTML = allPokemon.map(pokemon => `
        <div class="pokemon-card" onclick="showPokemonDetails(${allPokemon.indexOf(pokemon)})">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png">
            <p>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
        </div>
    `).join('');
}

async function loadMorePokemon() {
    if (isLoading) return;
    isLoading = true;
    const newPokemons = await fetchPokemon(currentPokemonIndex * 20);
    const pokemonDetails = await Promise.all(newPokemons.map(pokemon => fetch(pokemon.url).then(res => res.json())));
    const detailedPokemons = pokemonDetails.map(pokemon => ({ id: pokemon.id, name: pokemon.name, sprite: pokemon.sprites.front_default }));
    detailedPokemons.forEach(pokemon => {
        if (!allPokemon.some(existingPokemon => existingPokemon.id === pokemon.id)) {
            allPokemon.push(pokemon);
        }
    });

    currentPokemonIndex++;
    renderPokemon();
    updateShowMoreButton();
    isLoading = false;
}

function updateShowMoreButton() {
    const showMoreButton = document.getElementById('show-more-button');
    showMoreButton.disabled = currentPokemonIndex * 20 >= totalPokemonCount;
}

async function showPokemonDetails(i) {
    const pokemon = allPokemon[i];
    const detailsHTML = `
        <img src="${pokemon.sprite}">
        <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
        <p>ID: ${pokemon.id}</p>
    `;
    const dialog = document.getElementById('pokemon-dialog');
    document.getElementById('pokemon-details').innerHTML = detailsHTML;
    dialog.showModal();
}

function closePokemondialog() {
    document.getElementById('pokemon-dialog').close();
}

async function searchPokemon() {
    const query = document.getElementById('search').value.trim().toLowerCase();
    const errorMessage = document.getElementById('error-message');
    
    if (query.length < 3) {
        errorMessage.innerText = "Please enter at least 3 characters for the Pokémon name.";
        return;
    } else {
        errorMessage.innerText = "";
    }
    document.getElementById('pokemon-container').innerHTML = '';

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=500`);
        const data = await res.json();
        const allPokemons = data.results;
        const matchedPokemons = allPokemons.filter(pokemon => pokemon.name.toLowerCase().includes(query));
        if (matchedPokemons.length === 0) {
            document.getElementById('pokemon-container').innerHTML = `<p>No Pokémon found with that name.</p>`;
            return;
        }

        const pokemonDetails = await Promise.all(matchedPokemons.map(pokemon => fetch(pokemon.url).then(res => res.json())));
        const detailedPokemons = pokemonDetails.map(pokemon => ({
            id: pokemon.id,
            name: pokemon.name,
            sprite: pokemon.sprites.front_default
        }));

        // Set the global array of Pokémon and render
        allPokemon = detailedPokemons;
        currentPokemonIndex = 0;
        renderPokemon();
        updateShowMoreButton();
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        document.getElementById('pokemon-container').innerHTML = `<p>There was an error fetching Pokémon data.</p>`;
    }
}


function renderPokemonSearch(pokemon) {
    document.getElementById('pokemon-container').innerHTML = `
        <div class="pokemon-card">
            <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        </div>
    `;
}

function nextPokemon() {
    if (currentPokemonIndex < allPokemon.length - 1) {
        currentPokemonIndex++;
        showPokemonDetails(currentPokemonIndex);
    }
}

function previousPokemon() {
    if (currentPokemonIndex > 0) {
        currentPokemonIndex--;
        showPokemonDetails(currentPokemonIndex);
    }
}

document.getElementById('next-button').addEventListener('click', nextPokemon);
document.getElementById('previous-button').addEventListener('click', previousPokemon);
document.getElementById('show-more-button').addEventListener('click', loadMorePokemon);
