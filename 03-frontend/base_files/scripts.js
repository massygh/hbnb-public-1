// Fonction exécutée lorsque le DOM est complètement chargé
document.addEventListener('DOMContentLoaded', () => {
  // Vérifiez si nous sommes sur la page de connexion
  if (document.getElementById('login-form')) {
      handleLogin();
  } else if (document.getElementById('places-list')) {
      checkAuthentication();
  } else if (document.getElementById('add-review-form')) {
      handleAddReview();
  }
});

// Fonction pour gérer le formulaire de connexion
function handleLogin() {
  const loginForm = document.getElementById('login-form');

  loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
          await loginUser(email, password);
      } catch (error) {
          console.error('Login failed:', error);
          alert('Login failed: ' + error.message);
      }
  });
}

// Fonction pour envoyer une demande de connexion
async function loginUser(email, password) {
  const response = await fetch('http://localhost:5000/login', { // URL de l'API de connexion
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
  });

  if (response.ok) {
      const data = await response.json();
      document.cookie = `token=${data.access_token}; path=/`;
      window.location.href = 'index.html';
  } else {
      alert('Login failed: ' + response.statusText);
  }
}

// Fonction pour vérifier l'authentification de l'utilisateur
function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  
  if (!token) {
      loginLink.style.display = 'block';
  } else {
      loginLink.style.display = 'none';
      fetchPlaces(token);
  }
}

// Fonction pour obtenir la valeur d'un cookie par son nom
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Fonction pour récupérer les lieux depuis l'API
async function fetchPlaces(token) {
  try {
      const response = await fetch('http://localhost:5000/places', { // URL de l'API pour récupérer les lieux
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (response.ok) {
          const data = await response.json();
          populateCountryFilter(data);
          displayPlaces(data);
      } else {
          throw new Error('Failed to fetch places');
      }
  } catch (error) {
      console.error(error);
  }
}

// Fonction pour remplir le filtre par pays
function populateCountryFilter(places) {
  const countryFilter = document.getElementById('country-filter');
  const countries = new Set(places.map(place => place.country_name));
  countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countryFilter.appendChild(option);
  });
}

// Fonction pour afficher les lieux sur la page
function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = ''; // Effacer le contenu existant

  places.forEach(place => {
      const placeCard = document.createElement('div');
      placeCard.className = 'place-card';
      placeCard.innerHTML = `
          <img src="place-${place.id}.jpg" class="place-image" alt="${place.description}">
          <h2>${place.city_name}, ${place.country_name}</h2>
          <p>Price per night: $${place.price_per_night}</p>
          <p>Description: ${place.description}</p>
          <a href="place.html?id=${place.id}" class="details-button">View Details</a>
      `;
      placesList.appendChild(placeCard);
  });
}

// Fonction pour filtrer les lieux par pays
document.getElementById('country-filter').addEventListener('change', (event) => {
  const selectedCountry = event.target.value;
  filterPlaces(selectedCountry);
});

// Fonction pour filtrer les lieux affichés
function filterPlaces(country) {
  const placeCards = document.querySelectorAll('.place-card');
  placeCards.forEach(card => {
      const placeCountry = card.querySelector('h2').textContent.split(', ')[1];
      if (country === '' || placeCountry === country) {
          card.style.display = 'block';
      } else {
          card.style.display = 'none';
      }
  });
}

// Fonction pour gérer le formulaire d'ajout de revue
function handleAddReview() {
  const reviewForm = document.getElementById('add-review-form');

  reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const placeId = new URLSearchParams(window.location.search).get('id');
      const rating = document.getElementById('rating').value;
      const review = document.getElementById('review').value;

      try {
          await addReview(placeId, rating, review);
      } catch (error) {
          console.error('Add review failed:', error);
          alert('Add review failed: ' + error.message);
      }
  });
}

// Fonction pour ajouter une revue pour un lieu spécifique
async function addReview(placeId, rating, review) {
  const token = getCookie('token');
  const response = await fetch(`http://localhost:5000/places/${placeId}/reviews`, { // URL de l'API pour ajouter une revue
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating, review })
  });

  if (response.ok) {
      alert('Review added successfully!');
      window.location.href = `place.html?id=${placeId}`;
  } else {
      alert('Add review failed: ' + response.statusText);
  }
}
