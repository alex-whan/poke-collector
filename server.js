'use strict';

// Dependencies
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const { response } = require('express');
const pg = require('pg');
const { delete } = require('superagent');
require('ejs');
const methodOverride = require('method-override');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3001;

// Application middleware
app.use(express.urlencoded({extended: true}));
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

// Routes
app.get('/', getListOfAllPokemon);
app.post('/add', addPokemonToFavorites);
app.get('/favorites', showFavoritePokemon);
app.delete('/favorites', deletePokemonFromFavorites);
app.use('*', notFound);

// Home route handler - gets list of all Pokemon
function getListOfAllPokemon(request, response) {
  let url = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=151';
  superagent.get(url) // may need query params below
    .then(resultsFromSuperagent => {
      let pokemonResultsArray = resultsFromSuperagent.body.results;
      const finalPokemonArray = pokemonResultsArray.map(pokemon => {
        return new Pokemon(pokemon);
      });
      sortPokemon(finalPokemonArray);
      response.status(200).render('pages/show.ejs', {
        pokemonToShow: finalPokemonArray});
    }).catch();
}

// addPokemonToFavorites handler - adds favorite Pokemon to database
function addPokemonToFavorites(request, response) {
  let name = request.body.name;
  let sql = 'INSERT INTO pokemon (name) VALUES ($1);';
  let safeValues = [name];

  client.query(sql, safeValues)
    .then(sqlResults => {
      response.status(200).redirect('/');
    }).catch();
}

// showFavoritePokemon handler - shows list of favorite Pokemon added to database
function showFavoritePokemon(request, response) {
  let sql = 'SELECT * FROM pokemon ORDER BY name ASC;';
  client.query(sql)
    .then(sqlResults => {
      let pokemon = sqlResults.rows;
      response.status(200).render('pages/favorites.ejs',
      {favoritePokemon: pokemon});
    }).catch();
}

// Error - 404 Not Found page
function notFound(request, response){
  response.status(404).render('pages/error.ejs');
};

// Pokemon Constructor function
function Pokemon(info){
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.name = info.name;
  this.image = placeholderImage;
  this.url = info.url;
};

// Helper function
const sortPokemon = (arr) => {
  arr.sort((a, b) => {
    return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
  })
}

// Turns on server and connects to Postgres client
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    })
  }).catch();

