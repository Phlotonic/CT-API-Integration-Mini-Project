// Moves Page Functionality

const moveList = document.getElementById('move-list');

// Call fetchAndDisplayMoves when the page loads
if (moveList) {
  fetchAndDisplayMoves();
}

async function fetchAndDisplayMoves() {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/move?limit=100000');
      const data = await response.json();
  
      data.results.forEach(move => {
        const moveDiv = document.createElement('div');
        moveDiv.classList.add('move-card'); 
  
        const moveName = document.createElement('h3');
        moveName.textContent = move.name;
        moveDiv.appendChild(moveName);
  
        // Add details container
        const detailsContainer = document.createElement('div');
        detailsContainer.classList.add('details-container');
        detailsContainer.style.display   
   = 'none'; // Initially hide details
        moveDiv.appendChild(detailsContainer);
  
        // Add event listener to show/hide move details
        moveName.addEventListener('click', async () => {
          try {
            if (detailsContainer.style.display === 'none') {
              const moveResponse = await fetch(move.url);
              const moveData = await moveResponse.json();
  
              // Extract the English effect entry
              const effectEntry = moveData.effect_entries.find(entry => entry.language.name === 'en');
  
              // Extract and format the move details
              const name = moveData.name;
              const type = moveData.type.name;
              const power = moveData.power || "—";
              const accuracy = moveData.accuracy || "—";
              const pp = moveData.pp || "—";
              const priority = moveData.priority || "—";
  
              // Add move details to the container
              detailsContainer.innerHTML = `
                <p><b>Type:</b> ${type}</p>
                <p><b>Power:</b> ${power}</p>
                <p><b>Accuracy:</b> ${accuracy}</p>
                <p><b>PP:</b> ${pp}</p>
                <p><b>Priority:</b> ${priority}</p>
                <p><b>Effect:</b> ${effectEntry.effect}</p>
                <p><b>Short Effect:</b> ${effectEntry.short_effect}</p>
              `;
  
              detailsContainer.style.display = 'block'; // Show details
            } else {
              detailsContainer.style.display = 'none'; // Hide details
            }
          } catch (error) {
            console.error('Error fetching or displaying move details:', error);
          }
        });
  
        moveList.appendChild(moveDiv);
      });
  
    } catch (error) {
      console.error('Error fetching moves:', error);
    }
  }

async function fetchMoveDetails(moveUrl) {
  try {
    const response = await fetch(moveUrl);
    const data = await response.json();

    const modal = document.createElement('div');
    modal.classList.add('modal');

    const name = data.name;
    const type = data.type.name;
    const power = data.power || "—"; 
    const accuracy = data.accuracy || "—"; 
    const effect = data.effect_entries.find(entry => entry.language.name === 'en').short_effect;

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>${name}</h2>
        <p><b>Type:</b> ${type}</p>
        <p><b>Power:</b> ${power}</p>
        <p><b>Accuracy:</b> ${accuracy}</p>
        <p><b>Effect:</b> ${effect}</p>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = modal.querySelector('.close-modal');
    closeModal.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });

  } catch (error) {
    console.error('Error fetching move details:', error);
  }
}

// Call fetchTypes() when the page loads
fetchTypes();

// Function to get Pokémon details from URL parameters
function getPokemonFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const pokemonName = urlParams.get('name');
  if (pokemonName) {
    fetchPokemonData(pokemonName);
  }
}

// Call getPokemonFromUrl() when on the details.html page
if (window.location.pathname.endsWith('details.html')) {
  getPokemonFromUrl();
}

// Call fetchAndDisplayAbilities() when on the abilities.html page
if (window.location.pathname.endsWith('abilities.html')) {
  fetchAndDisplayAbilities();
}

// Call fetchAndDisplayMoves() when on the moves.html page
if (window.location.pathname.endsWith('moves.html')) {
  fetchAndDisplayMoves();
}