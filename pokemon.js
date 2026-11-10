const MAX_POKEMON = 151;
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const typeFilter = document.querySelector("#type");
const notFoundMessage = document.querySelector("#not-found-message");

let allPokemons = [];

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
  .then((response) => response.json())
  .then(async (data) => {
    allPokemons = await Promise.all(
      data.results.map(async (pokemon) => {
        const response = await fetch(pokemon.url);
        const details = await response.json();

        return {
          ...pokemon,
          primaryType: details.types[0]?.type.name ?? "unknown",
        };
      })
    );

    handleSearch();
  })
  .catch((error) => console.error("Could not load Pokémon:", error));

function displayPokemons(pokemon) {
  listWrapper.innerHTML = "";

  pokemon.forEach((pokemon) => {
    const pokemonID = pokemon.url.split("/")[6];
    const listItem = document.createElement("div");
    listItem.className = "list-item";
    listItem.innerHTML = `
        <div class="number-wrap">
            <p class="caption-fonts">#${pokemonID}</p>
        </div>
        <div class="img-wrap">
            <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg" alt="${pokemon.name}" />
        </div>
        <div class="name-wrap">
            <p class="body3-fonts">#${pokemon.name}</p>
        </div>
    `;

    listItem.addEventListener("click", async () => {
      const success = await fetchPokemonDataBeforeRedirect(pokemonID);
      if (success) {
        window.location.href = `./detail.html?id=${pokemonID}`;
      }
    });

    listWrapper.appendChild(listItem);
  });
}

async function fetchPokemonDataBeforeRedirect(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json()
      ),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
        res.json()
      ),
    ]);
    return true;
  } catch (error) {
    console.error("Failed to fetch Pokemon data before redirect");
    return false;
  }
}

searchInput.addEventListener("input", handleSearch);
document
  .querySelectorAll('input[name="filters"]')
  .forEach((radio) => radio.addEventListener("change", handleSearch));

function handleSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  let filteredPokemons = [...allPokemons];

  if (numberFilter.checked) {
    filteredPokemons = filteredPokemons.filter((pokemon) => {
      const pokemonID = pokemon.url.split("/")[6];
      return pokemonID.startsWith(searchTerm);
    });
  } else if (nameFilter.checked) {
    filteredPokemons = filteredPokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().startsWith(searchTerm)
    );
  } else if (typeFilter.checked) {
    filteredPokemons = filteredPokemons.filter((pokemon) =>
      pokemon.primaryType.toLowerCase().startsWith(searchTerm)
    );

    filteredPokemons.sort(
      (a, b) =>
        a.primaryType.localeCompare(b.primaryType) ||
        a.name.localeCompare(b.name)
    );
  }

  displayPokemons(filteredPokemons);

  if (filteredPokemons.length === 0) {
    notFoundMessage.style.display = "block";
  } else {
    notFoundMessage.style.display = "none";
  }
}

const closeButton = document.querySelector(".search-close-icon");
closeButton.addEventListener("click", clearSearch);

function clearSearch() {
  searchInput.value = "";
  handleSearch();
}

function finishLoading() {
  document.getElementById("loader").classList.add("hidden");
  document.getElementById("content").classList.remove("hidden");
}
