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
app.get('/', getListOfAllPokemon);
app.post('/add', addPokemonToFavorites);
app.get('/favorites', showFavoritePokemon);
app.delete('/favorites/:id', deletePokemonFromFavorites);
app.use('*', notFound);

// Home route handler - gets list of all Pokemon
async function getListOfAllPokemon(request, response) {
  let promiseArray = [];
  let finalPokemonArray = [];
  for(let i = 1; i <= 25; i++){
    let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
    promiseArray.push(superagent.get(url))
  }

  await Promise.all(promiseArray).then((pokemonResponses) => {
    const pokemon = pokemonResponses.map(({body}) => new Pokemon(body));
    finalPokemonArray = pokemon;
  }).catch(error => console.log(error));

  // sortPokemon(finalPokemonArray);
  response.status(200).render('pages/show.ejs', {
    pokemonToShow: finalPokemonArray});
  }

// addPokemonToFavorites handler - adds favorite Pokemon to database
function addPokemonToFavorites(request, response) {
  let nameCheck = 'SELECT * FROM pokemon WHERE name=$1;';
  let nameSafeValues = [request.body];
  client.query(nameCheck, nameSafeValues)
    .then(nameResults => {
      if(nameResults.rowCount < 1) {

        // console.log('MY REQUEST BODY:', request.body)
        let { name, url, pokedex_number, image, type1, type2 } = request.body;
        let sql = 'INSERT INTO pokemon (name, url, pokedex_number, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;';
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
function Pokemon(info){
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.name = info.species.name ? info.species.name : 'Name not available.';
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

