// Types Page Functionality

const typeSelect = document.getElementById('type-select');
const typeList = document.getElementById('type-list');

// Ensure fetchTypes is called when the page loads
if (typeList) { 
  fetchTypes(); 
}

async function fetchTypes() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/type?limit=100000');
    const data = await response.json();

    data.results.forEach(type => {
      const option = document.createElement('option');
      option.value = type.name;
      option.textContent = type.name;
      if (typeSelect) {
        typeSelect.appendChild(option);
      }

      if (typeList) {
        const typeDiv = document.createElement('div');
        typeDiv.classList.add('type-card');

        const typeName = document.createElement('h3');
        typeName.textContent = type.name;
        typeDiv.appendChild(typeName);

        const pokemonListContainer = document.createElement('div');
        pokemonListContainer.classList.add('pokemon-list-container');
        pokemonListContainer.style.display = 'none';

        typeDiv.appendChild(pokemonListContainer);

        typeName.addEventListener('click', async () => {
          try {
            if (pokemonListContainer.style.display === 'none') {
              const typeResponse = await fetch(type.url);
              const typeData = await typeResponse.json();
              const pokemonSpecies = typeData.pokemon;

              const pokemonPromises = pokemonSpecies.map(async (species) => {
                const pokemonResponse = await fetch(species.pokemon.url);
                const pokemonData = await pokemonResponse.json();

                const pokemonDiv = document.createElement('div');
                pokemonDiv.classList.add('pokemon-card', 'draggable');
                pokemonDiv.draggable = true;

                const pokemonImage = document.createElement('img');
                pokemonImage.src = pokemonData.sprites.front_default;
                pokemonImage.alt = pokemonData.name;
                pokemonDiv.appendChild(pokemonImage);

                const pokemonName = document.createElement('h3');
                pokemonName.textContent = pokemonData.name;
                pokemonDiv.appendChild(pokemonName);

                const pokemonNumber = document.createElement('p');
                pokemonNumber.textContent = `#${pokemonData.id}`;
                pokemonDiv.appendChild(pokemonNumber);

                // Add event listener to navigate to details page (on single click)
                pokemonDiv.addEventListener('click', () => {
                  window.location.href = `details.html?name=${pokemonData.name}`;
                });

                // Add event listener for drag start
                pokemonDiv.addEventListener('dragstart', (event) => {
                  event.dataTransfer.setData('text/plain', pokemonData.name);
                  showTeamBox();
                });

                return {
                  pokemonDiv: pokemonDiv,
                  pokemonId: pokemonData.id
                };
              });

              const pokemonDivsWithIds = await Promise.all(pokemonPromises);

              pokemonDivsWithIds.sort((a, b) => a.pokemonId - b.pokemonId);

              pokemonDivsWithIds.forEach(({ pokemonDiv }) => {
                pokemonListContainer.appendChild(pokemonDiv);
              });

              pokemonListContainer.style.display = 'block';
            } else {
              pokemonListContainer.style.display = 'none';
            }

          } catch (error) {
            console.error('Error fetching or displaying Pokémon by type:', error);
          }
        });

        typeList.appendChild(typeDiv);
      }
    });
  } catch (error) {
    console.error('Error fetching types:', error);
  }
}