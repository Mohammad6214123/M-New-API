let allPokemon = [];
let currentPokemonIndex = 0;  // Track the current Pokémon index


async function fetchPokemon(offset = 0) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
    const data = await res.json();
    return data.results;
}

function init() {
    loadMorePokemon();
}

function renderPokemon() {
    const container = document.getElementById('pokemon-container');
    let pokemonHTML = '';
    for (let i = 0; i < allPokemon.length; i++) {
        pokemonHTML += `
      <div class="pokemon-card" onclick="showPokemonDetails(${i})">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 1}.png">
        <p>${allPokemon[i].name}</p>
      </div>
    `;
    }
    container.innerHTML = pokemonHTML;
}

async function loadMorePokemon() {
    const newPokemons = await fetchPokemon(currentPokemonIndex * 20); // Load in multiples of 20
    allPokemon = allPokemon.concat(newPokemons);
    renderPokemon();
}

async function showPokemonDetails(i) {
    const res = await fetch(allPokemon[i].url);
    const pokemon = await res.json();
    const detailsHTML = `
      <img src="${pokemon.sprites.front_default}">
      <h2>${pokemon.name.toUpperCase()}</h2>
      <p>ID: ${pokemon.id}</p>
      <p>Height: ${pokemon.height}</p>
      <p>Weight: ${pokemon.weight}</p>
    `;
    const dialog = document.getElementById('pokemon-dialog');
    const detailsDiv = document.getElementById('pokemon-details');
    detailsDiv.innerHTML = detailsHTML;
    dialog.showModal();
}

function closePokemondialog() {
    const dialog = document.getElementById('pokemon-dialog');
    dialog.close();
}

async function searchPokemon() {
    const query = document.getElementById('search').value.trim().toLowerCase();
    const url = `https://pokeapi.co/api/v2/pokemon/${query}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Pokemon not found");
        const pokemon = await res.json();
        allPokemon = [pokemon];                   // Store the found Pokémon in the array
        currentPokemonIndex = 0;                  // Reset to the first Pokémon
        renderPokemonSearch(pokemon);
    } catch (error) {
        alert(error.message);
    }
}

function renderPokemonSearch(pokemon) {
    const container = document.getElementById('pokemon-container');
    container.innerHTML = `
        <div class="pokemon-card">
            <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        </div>
    `;
}

function nextPokemon() {
    if (currentPokemonIndex < allPokemon.length - 1) {
        currentPokemonIndex++;
        showPokemonDetails(currentPokemonIndex); // Show next Pokémon details
    }
}

function previousPokemon() {
    if (currentPokemonIndex > 0) {
        currentPokemonIndex--;
        showPokemonDetails(currentPokemonIndex); // Show previous Pokémon details
    }
}
document.getElementById('next-button').addEventListener('click', nextPokemon); // Add event listeners to the Previous and Next buttons
document.getElementById('previous-button').addEventListener('click', previousPokemon);
