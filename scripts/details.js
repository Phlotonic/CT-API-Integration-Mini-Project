// Call getPokemonFromUrl when the page loads
if (window.location.pathname.endsWith('details.html')) {
  getPokemonFromUrl();
}

async function fetchPokemonData(pokemonName) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const data = await response.json();
    displayPokemonDetails(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle the error appropriately (e.g., display an error message)
  }
}

function displayPokemonDetails(pokemon) {
  const pokemonDetailsDiv = document.getElementById('pokemon-details');
  pokemonDetailsDiv.innerHTML = ''; // Clear previous details

  const name = document.createElement('h2');
  name.textContent = pokemon.name;
  pokemonDetailsDiv.appendChild(name);

  const image = document.createElement('img');
  image.src = pokemon.sprites.front_default;
  image.alt = pokemon.name;
  pokemonDetailsDiv.appendChild(image);

  const types = document.createElement('p');
  types.textContent = `Type: ${pokemon.types.map(type => type.type.name).join(', ')}`;
  pokemonDetailsDiv.appendChild(types);

  const abilities = document.createElement('div');
  abilities.innerHTML = '<h3>Abilities:</h3>';
  const abilitiesList = document.createElement('ul');
  pokemon.abilities.forEach(ability => {
    const abilityItem = document.createElement('li');
    abilityItem.textContent = ability.ability.name;
    abilitiesList.appendChild(abilityItem);
  });
  abilities.appendChild(abilitiesList);
  pokemonDetailsDiv.appendChild(abilities);

  const stats = document.createElement('div');
  stats.innerHTML = '<h3>Stats:</h3>';
  const statsList = document.createElement('ul');
  pokemon.stats.forEach(stat => {
    const statItem = document.createElement('li');
    statItem.textContent = `${stat.stat.name}: ${stat.base_stat}`;
    statsList.appendChild(statItem);
  });
  stats.appendChild(statsList);
  pokemonDetailsDiv.appendChild(stats);

  const moves = document.createElement('div');
  moves.innerHTML = '<h3>Moves:</h3>';
  const movesList = document.createElement('ul');
  pokemon.moves.slice(0, 10).forEach(move => {
    const moveItem = document.createElement('li');
    moveItem.textContent = move.move.name;
    movesList.appendChild(moveItem);
  });
  moves.appendChild(movesList);
  pokemonDetailsDiv.appendChild(moves);

  const evolutionChainUrl = pokemon.species.url; 
  fetchEvolutionChain(evolutionChainUrl);

  // Fetch and display species details (including description and category/genus)
  fetchSpeciesDetails(pokemon.species.url); 
}

async function fetchEvolutionChain(evolutionChainUrl) {
  try {
    const response = await fetch(evolutionChainUrl);
    const data = await response.json();
    const evolutionChainResponse = await fetch(data.evolution_chain.url);
    const evolutionChainData = await evolutionChainResponse.json();

    const evolutionChainDiv = document.createElement('div');
    evolutionChainDiv.innerHTML = '<h3>Evolution Chain:</h3>';
    displayEvolutionChain(evolutionChainData.chain, evolutionChainDiv);

    const pokemonDetailsDiv = document.getElementById('pokemon-details');
    pokemonDetailsDiv.appendChild(evolutionChainDiv);
  } catch (error) {
    console.error('Error fetching or displaying evolution chain:', error);
  }
}

function displayEvolutionChain(chain, evolutionChainDiv) {
  const pokemonLink = document.createElement('a');
  pokemonLink.href = `details.html?name=${chain.species.name}`;
  pokemonLink.textContent = chain.species.name;
  evolutionChainDiv.appendChild(pokemonLink);

  if (chain.evolves_to.length > 0) {
    evolutionChainDiv.appendChild(document.createTextNode(' -> '));
    chain.evolves_to.forEach(evolution => {
      displayEvolutionChain(evolution, evolutionChainDiv);
    });
  }
}

async function fetchSpeciesDetails(speciesUrl) {
  try {
    const response = await fetch(speciesUrl);
    const data = await response.json();

    // Find the English flavor text entry
    const descriptionEntry = data.flavor_text_entries.find(entry => entry.language.name === 'en');

    // Find the English genus entry (this contains the category/species)
    const genusEntry = data.genera.find(entry => entry.language.name === 'en');

    const description = document.createElement('p');
    description.textContent = `${descriptionEntry.flavor_text} (${genusEntry.genus})`; // Combine description and genus
    const pokemonDetailsDiv = document.getElementById('pokemon-details');
    pokemonDetailsDiv.appendChild(description);

  } catch (error) {
    console.error('Error fetching or displaying species details:', error);
  }
}

// Function to get Pokémon details from URL parameters
function getPokemonFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const pokemonName = urlParams.get('name');
  if (pokemonName) {
    fetchPokemonData(pokemonName);
  }
}