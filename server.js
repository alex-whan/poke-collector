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
// function getListOfAllPokemon(request, response) {
//   let url = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=151';
//   superagent.get(url) // may need query params below
//     .then(resultsFromSuperagent => {
//       let pokemonResultsArray = resultsFromSuperagent.body.results;
//       const finalPokemonArray = pokemonResultsArray.map(pokemon => {
//         return new Pokemon(pokemon);
//       });
//       sortPokemon(finalPokemonArray);
//       response.status(200).render('pages/show.ejs', {
//         pokemonToShow: finalPokemonArray});
//     }).catch(error => console.log(error));
// }

// function getListOfAllPokemon(request, response) {
//   let promises = [];
//   for(let i = 1; i <= 10; i++){
//     let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
//     promises.push(superagent.get(url)
//       .then(resultsFromSuperagent => {
//         let pokemonResultsArray = resultsFromSuperagent.map((pokemon) => {
//           return new Pokemon(pokemon);
//         });
        
//     }));
//   }
// }

function getListOfAllPokemon(request, response) {
  let finalPokemonArray = [];
  for(let i = 1; i <= 3; i++){
    let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
    superagent.get(url) // may need query params below
    .then(resultsFromSuperagent => {
      console.log(`THIS IS MY RESULT at ${i}: `, resultsFromSuperagent.body.name);
      console.log(`THIS IS MY TYPE 1: `, resultsFromSuperagent.body.types[0].type.name);
      console.log(`THIS IS MY TYPE 2: `, resultsFromSuperagent.body.types[1].type.name);
      // let pokemonResultsArray = resultsFromSuperagent.body;
      // const finalPokemonArray = resultsFromSuperagent.body.map(pokemon => {
      //   return new Pokemon(pokemon);
      // });
      const pokemonToDisplay = new Pokemon(resultsFromSuperagent.body);
      console.log('THIS IS MY POKEMON TO DISPLAY: ', pokemonToDisplay);
      finalPokemonArray.push(pokemonToDisplay);
      }).catch(error => console.log(error));
    };
    console.log('THIS IS MY FINAL ARRAY: ', finalPokemonArray);
    sortPokemon(finalPokemonArray);
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
        let { name, url, pokedex_number, image } = request.body;
        let sql = 'INSERT INTO pokemon (name, url, pokedex_number, image) VALUES ($1, $2, $3, $4) RETURNING id;';
        let safeValues = [name, url, pokedex_number, image];
      
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
  this.type2 = info.types[1].type.name ? info.types[1].type.name : 'Type 2 not available.';
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

