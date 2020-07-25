# Poké Collector

![GitHub](https://img.shields.io/github/license/alex-whan/poke-collector)
![GitHub package.json version](https://img.shields.io/github/package-json/v/alex-whan/poke-collector)
[![Build Status](https://travis-ci.com/alex-whan/poke-collector.svg?branch=master)](https://travis-ci.com/alex-whan/poke-collector)

**Author:** Alex Whan

**Version:** 1.0.0

## Overview

This is a full-stack application built using [PokéAPI](https://pokeapi.co/), inspired by the nostalgia of Pokémon from my childhood and throughout my lifetime. Browse, search, and add Pokemon to your collection of favorites! Each Pokémon is displayed with their National Pokédex number, name, sprite, and typings. Hit "Add to Favorites" to save a Pokémon into your own personal team. You'll be able to delete them from your "Favorites" list at any time by hitting the "X" button listed under each Pokémon in your collection.

**Please note:** The default view is currently the "original 151" Pokémon from the Kanto region of Generation I (think the very first Pokémon Red & Blue games), but you are able to search for other Pokémon up to and through Generation VII (Pokémon Sun & Moon). Generation VII Pokémon - from the latest releases of Pokémon Sword & Shield - have not yet been added to the API as of writing (July 2020). I fully intend to add features allowing users to display Pokémon by generation in future updates. 

Check out the live link for Poké Collector **[here](https://poke-collector.herokuapp.com/)**! 

## Getting Started

**Step 1:**

Open your command line and clone the repo down from GitHub:

    $ git clone https://github.com/alex-whan/poke-collector.git

**Step 2:**

Once the repo has been cloned, create a `.env` file as follows:

    $ npm i
    $ touch .env

**Step 3:**

Next, we need to set up our Postgres database. From the root directory of the application, run the following commands in command line:

    $ psql

    # CREATE DATABASE poke_collector;
    # \q

    $ psql -d poke_collector -f data/schema.sql
    $ psql -d poke_collector -f data/seed.sql

**Step 4:**

Open the `.env` file and insert the following code:

    PORT=[insert open port here]
    DATABASE= see below note!

Make sure that there are **NO** spaces between the `=` and your key - the key should follow immediately after the "equals" sign.

Note on PORT:
* You will need to designate an open port on your machine on which this app will run. Try `3000` or `3001`, as these are often open.

Note on DATABASE: 
* Make sure that the database you created in Postgres in Step 3 is the same one that you use to pair with `DATABASE=` in this step.
* The DATABASE URL you use in this step will differ for MacOS and Windows users:
  - For **MacOS**: use `postgres://localhost:5432/poke_collector`
  - For **Windows**: use `DATABASE_URL=postgres://USERNAME:PASSWORD@localhost:5432/poke_collector` and replace `USERNAME:PASSWORD` with your Postgres username and password, respectively.

**Step 5:**

Nearly there! All that's left to do now is fire up the server. Run the following command in your terminal:

    $ npm start

At this point, you should be able to search for Pokémon using Poké Collector's search feature, save them into your local database of "Favorites", and delete them from your "Favorites" if desired. As long as you do not clear the database with a `DROP TABLE` command in `psql`, you selections will remain saved unless you choose to manually delete them in the app. Enjoy the world of Pokémon!

## Architecture

The back end of this application is built on an Express server, and uses Superagent for making API calls to the PokéAPI. Postgres stores data in a database, and uses SQL to query stored information from the database to populate the user Collection to avoid excess API calls. The front end of the application is created using tje EJS (Embedded JavaScript) templating library for views and partials. Travis.CI is used implement Continuous Integration and testing before deployment.

### A list of all dependencies required to run this program:

  * dotenv
  * EJS
  * Express
  * method-override
  * pg
  * superagent

## Credits and Collaborations

* [PokéAPI](https://pokeapi.co/) - The RESTful Pokémon API