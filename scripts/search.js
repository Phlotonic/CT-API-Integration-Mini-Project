// Search Functionality

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');

if (searchButton) {
    searchButton.addEventListener('click', () => {
      const pokemonName = searchInput.value.toLowerCase();
      searchResults.innerHTML = '';
      fetchPokemonData(pokemonName);
    });
  }
  
  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      const selectedType = typeSelect.value;
      searchResults.innerHTML = '';
      fetchPokemonData("", selectedType);
    });
  }
  
  async function fetchPokemonData(pokemonName, typeFilter = "") {
    try {
      let url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
      if (typeFilter) {
        url = `https://pokeapi.co/api/v2/type/${typeFilter}`;
      }
  
      const response = await fetch(url);
      const data = await response.json();
  
      if (typeFilter) {
        const pokemonNames = data.pokemon.map(pokemon => pokemon.pokemon.name);
        searchResults.innerHTML = "Loading...";
        const pokemonPromises = pokemonNames.map(name => fetchPokemonData(name));
        await Promise.all(pokemonPromises);
      } else {
        if (window.location.pathname.endsWith('search.html')) {
          displayPokemonData(data);
        } else if (window.location.pathname.endsWith('details.html')) {
          displayPokemonDetails(data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (searchResults) {
        searchResults.innerHTML = "Pokémon not found!";
      }
    }
  }
  
  function displayPokemonData(pokemon) {
    const pokemonDiv = document.createElement('div');
    pokemonDiv.classList.add('pokemon-card');
  
    const name = document.createElement('h3');
    name.textContent = pokemon.name;
  
    const image = document.createElement('img');
    image.src = pokemon.sprites.front_default;
    image.alt = pokemon.name;
  
    const type = document.createElement('p');
    type.textContent = `Type: ${pokemon.types.map(type => type.type.name).join(', ')}`;
  
    pokemonDiv.addEventListener('click', () => {
      window.location.href = `details.html?name=${pokemon.name}`;
    });
  
    pokemonDiv.appendChild(name);
    pokemonDiv.appendChild(image);
    pokemonDiv.appendChild(type);
  
    searchResults.appendChild(pokemonDiv);
  }
  