'use strict';

// Dependencies
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const { response } = require('express');
const pg = require('pg');
// const { delete } = require('superagent');
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
// app.get('/', serveThePage);
app.get('/', getListOfPokemon);
app.post('/add', addPokemonToFavorites);
app.get('/favorites', showFavoritePokemon);
app.delete('/favorites/:id', deletePokemonFromFavorites);
app.use('*', notFound);

// Page server handler
function serveThePage(request, response) {
  response.status(200).render('pages/show.ejs', {
    pokemonToShow: []}); // shouldn't need this
}

// hit /pokemon right when you load page
// figure out on client how to make a request to hit this endpoint

//TODO: 1. Set up paging buttons on APP (1-10) - doesn't have to be a loop for now (just have each button pertain to a certain subset of Pokedex)
//TODO: 2. Based on which button is clicked, send the correct offset (page size won't be dynamic for now)
//TODO: 3. Render the response
// For now, just replace Pokemon data rather than appending it
  // All app is trying to do is render data
  // Each button does a new request (don't need to append data for now)

// Home route handler - gets list of Pokemon
async function getListOfPokemon(request, response) {
  let promiseArray = [];

  const testOffset = 1;
  const testPageSize = 151;

  const queryParams = {
    limit: testPageSize,
    offset: testOffset
  }
  
  for(let i = testOffset; i <= testPageSize; i++){
    let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
    promiseArray.push(superagent.get(url).query(queryParams));
    // console.log('query params for this search :', queryParams);
    // console.log('PROMISE ARRAY:', promiseArray);
    // Much slower with query Params
    // Query Params are firing every single time, slowing it down - how do I get query Params into the search itself?
  }

  const pokemonResponses = await Promise.all(promiseArray);
  const pokemon = pokemonResponses.map(({body}) => new Pokemon(body));
  
  response.status(200).render('pages/show.ejs',
  {
    pokemonToShow: pokemon
  });
}

// addPokemonToFavorites handler - adds favorite Pokemon to database
function addPokemonToFavorites(request, response) {
  let pokedexNumberCheck = 'SELECT * FROM pokemon WHERE pokedex_number=$1;';
  let pokedexNumberSafeValues = [request.body.pokedex_number];
  client.query(pokedexNumberCheck, pokedexNumberSafeValues)
    .then(pokedexNumberResults => {
      if(pokedexNumberResults.rowCount < 1) {

        // console.log('MY REQUEST BODY:', request.body)
        let { name, url, pokedex_number, image, type1, type2 } = request.body;
        let sql = 'INSERT INTO pokemon (name, url, pokedex_number, image, type1, type2) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;';
        let safeValues = [name, url, pokedex_number, image, type1, type2];
      
        client.query(sql, safeValues)
          .then(sqlResults => {
            response.status(200).redirect('/');
          }).catch(error => console.log(error));
      } else {
        response.status(200).redirect('/');
      }
    }).catch(error => console.log(error));
}

// showFavoritePokemon handler - shows list of favorite Pokemon added to database
function showFavoritePokemon(request, response) {
  let sql = 'SELECT * FROM pokemon ORDER BY name ASC;';
  client.query(sql)
    .then(sqlResults => {
      let pokemon = sqlResults.rows;
      response.status(200).render('pages/favorites.ejs',
      {favoritePokemon: pokemon});
    }).catch(error => console.log(error));
}

// deletePokemonFromFavorites handler - deletes entry from list of favorites in database
function deletePokemonFromFavorites(request, response){
  let pokemonID = request.params.id;
  console.log('This is my POKEMON ID: ', request.params.id);
  let sql = 'DELETE FROM pokemon WHERE id=$1;';
  let safeValues = [pokemonID];
  client.query(sql, safeValues)
    .then(() => {
      response.status(200).redirect('/favorites')
    }).catch(error => console.log(error));
}

// Error - 404 Not Found page
function notFound(request, response){
  response.status(404).render('pages/error.ejs');
};

// Pokemon Constructor function
// function Pokemon(info){
//   const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
//   this.name = info.species.name ? info.species.name : 'Name not available.';
//   this.url = info.species.url ? info.species.url : 'URL not available.';
//   this.pokedex_number = this.url.split('/')[this.url.split('/').length - 2];
//   this.image = info.sprites.front_default ? info.sprites.front_default : placeholderImage;
//   this.type1 = info.types[0].type.name ? info.types[0].type.name : 'Type 1 not available.';
//   if(info.types.length > 1){ // checks to see if Pokemon has a second type
//     this.type2 = info.types[1].type.name ? info.types[1].type.name : 'Type 2 not available.';
//   } else {
//     this.type2 = null;
//   }
// };

// Pokemon Constructor function for PAGINATION
function Pokemon(info){
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.name = info.name ? info.name : 'Name not available.';
  this.url = info.species.url ? info.species.url : 'URL not available.';
  this.pokedex_number = this.url.split('/')[this.url.split('/').length - 2];
  this.image = info.sprites.front_default ? info.sprites.front_default : placeholderImage;
  this.type1 = info.types[0].type.name ? info.types[0].type.name : 'Type 1 not available.';
  if(info.types.length > 1){ // checks to see if Pokemon has a second type
    this.type2 = info.types[1].type.name ? info.types[1].type.name : 'Type 2 not available.';
  } else {
    this.type2 = null;
  }
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
  }).catch(error => console.log(error));

