(function($){
'use strict'

  var gameRef = new Firebase('https://pokemoncatch.firebaseio.com/');
  // var gameBoardPositionsRef = gameRef.child('gameBoardPositions');
  var playersRef = gameRef.child('players');
  var pokemonRef = gameRef.child('pokemon');
  var cadeRef = gameRef.child('cade');
  var playerRef;
  var playerName = '';

  $(document).ready(init);

  function init() {
    generatePokemon();

    gameRef.on('value', gameHandler);

    $('#startGame').click(startGame);
    $('#quitGame').click(quitGame);

    var cade = window.setInterval(function(){
      generateRareCademon();
    }, 20000);

    var samer = window.setInterval(function(){
      generateRareSamer();
    }, 30000);

  }

  function generateRareSamer(){

    let samerLocation = Math.floor(Math.random() * 120);
    let pokemonName = 'samermon';

    pokemonRef.child(pokemonName).set({
      name: pokemonName,
      number: '1000',
      image: './samer.jpeg',
      position: samerLocation
    });

    let $samerMessage = $('<h3>').addClass('samerMessage').text('A rare Samermon has appeared!').css({
      'display': 'inline',
      'background-color': '#FE3310',
      'color': 'white',
      'position': 'absolute',
      'right': '0',
      'bottom': '10%'
    });
    $('#titleArea').append($cadeMessage);
    window.setTimeout(function(){
      $('.samerMessage').remove();
    }, 3000);

  }

  function generateRareCademon(){

    let cadeLocation = Math.floor(Math.random() * 120);
    let pokemonName = 'cademon';

    pokemonRef.child(pokemonName).set({
      name: pokemonName,
      number: '1000',
      image: './headshot.jpg',
      position: cadeLocation
    });

    let $cadeMessage = $('<h3>').addClass('cadeMessage').text('A rare Cademon has appeared!').css({
      'display': 'inline',
      'background-color': '#FE3310',
      'color': 'white',
      'position': 'absolute',
      'right': '0',
      'bottom': '10%'
    });
    $('#titleArea').append($cadeMessage);
    window.setTimeout(function(){
      $('.cadeMessage').remove();
    }, 3000);

  }

  // function removeRareCademon(){
  //   cadeRef.remove();
  //   window.setTimeout(function(){
  //     $('.cadeMessage').remove();
  //   }, 3000);
  // }

  function quitGame(){

    playerRef.remove();
    location.reload();

  }

  function generatePokemon() {
    let pokedex;

    $.get('http://pokeapi.co/api/v1/pokedex/1/')
      .done(function(data){
        pokedex = data;
            // var intervalID = window.setInterval(function(){
            //   generatePokemon();
            //
            // }, 5000);
            //
            // window.setTimeout(function(){
            //   window.clearInterval(intervalID);
            // }, 50000);

        let randomPokemonNumber = Math.floor(Math.random() * 778);
        let randomPokemonName = pokedex.pokemon[randomPokemonNumber].name;

        let pokemonData = 'http://pokeapi.co/' + pokedex.pokemon[randomPokemonNumber].resource_uri;

        $.get(pokemonData)
          .done(function(data){

              // let $attack = $('<p>').text('Attack Power: ' + data.attack);
              // let $defense = $('<p>').text('Defense Power: ' + data.defense);
              // let $hp = $('<p>').text('HP: ' + data.hp);

          let pokemonSprite = 'http://pokeapi.co/' + data.sprites[0].resource_uri;

          $.get(pokemonSprite)
            .done(function(data){
              let pokemonImage = 'http://pokeapi.co/' + data.image;
              let pokemonLocation = Math.floor(Math.random() * 120);

              pokemonRef.child(randomPokemonName).set({
                name: randomPokemonName,
                number: randomPokemonNumber,
                image: pokemonImage,
                position: pokemonLocation
              });

            }).fail(function(error){
              console.log('Failed at sprite retrieval. Error: ', error);
            });

        }).fail(function(err){
          console.log('Failed at pokemon retrieval. Error: ', error);
        });

    }).fail(function(err){
      console.log('Failed at pokedex. Error: ', error);
    });

  }

  function moveLeft(){

    playerRef.once('value', function(snapshot){
      var playerPosition = snapshot.val().position - 1;
      if ((playerPosition + 12) % 12 === 0){
        playerPosition += 12;
      }
      playerRef.update({position: playerPosition});
    });
  }

  function moveRight(){

    playerRef.once('value', function(snapshot){
      let playerPosition = snapshot.val().position + 1;
      if ((playerPosition - 13) % 12 === 0){
        playerPosition -= 12;
      }
      playerRef.update({position: playerPosition});
    });
  }

  function moveUp(){

    playerRef.once('value', function(snapshot){
      let playerPosition = snapshot.val().position-12;
      if (playerPosition === 0){
        playerPosition = 120;
      } else if (playerPosition < 0){
        playerPosition += 120
      }
      playerRef.update({position: playerPosition});
    });
  }

  function moveDown(){

    playerRef.once('value', function(snapshot){
      let playerPosition = snapshot.val().position + 12;
      if (playerPosition === 120) {
        playerPosition = 12;
      } else if (playerPosition > 120) {
        playerPosition -= 120;
      }
      playerRef.update({position: playerPosition});
    });
  }


  function startGame(){
    playerName = $('#userNameInput').val();

    playersRef.once('value', function(playerSnap){
      playerSnap.forEach(function(player){
        if (playerName === player.key()){
          alert('Please choose a different name');
          playerName = "";
          return;
        }
      });
    });

    if (playerName.length){
      let startPosition = Math.floor(Math.random() * 120);

      playerRef = playersRef.child(playerName);

      playerRef.onDisconnect().remove();

      playerRef.set({
        position: startPosition,
        name: playerName,
        type: 'player',
      });

      let $newPlayerPokedex = $('<div>').attr('id', playerName);
      $('#caughtPokemon').append($newPlayerPokedex);

      $(document).keydown(function(e) {
          switch(e.which) {
              case 37: // left
              moveLeft();
              break;

              case 38: // up
              moveUp();
              break;

              case 39: // right
              moveRight();
              break;

              case 40: // down
              moveDown();
              break;

              default: return; // exit this handler for other keys
          }
          console.log(playerName);
          e.preventDefault(); // prevent the default action (scroll / move caret)
        });

    }
    $('#userNameInput').val('');
  }

  function gameHandler(snapshot){


    $('#gameArea div.col-xs-1').empty();
    // $('#caughtPokemon').empty();

    // if (!Object.keys(snapshot.val().pokemon)){
    //   generatePokemon();
    //   return;
    // }

    if (Object.keys(snapshot.val().pokemon).length < 5){
      generatePokemon();
    }

    snapshot.child('pokemon').forEach(function(pokemonSnapshot){

      let pokemonName = pokemonSnapshot.val().name;
      let pokemonPosition = pokemonSnapshot.val().position;
      let pokemonImage = pokemonSnapshot.val().image;

      let $pokemon = $('<img>').attr('src', pokemonImage);
      let $pokemonLocation = $('#gameArea').find('div.col-xs-1:nth-child(' + pokemonPosition + ')');

      $pokemonLocation.append($pokemon);
    });

    snapshot.child('players').forEach(function(playersSnapshot){
      let playerName = playersSnapshot.val().name;
      let playerPosition = playersSnapshot.val().position;
      // debugger
      pokemonRef.once('value', function(pokemonSnapshot){
        pokemonSnapshot.forEach(function(pokemon){
          if (pokemon.val().position === playerPosition){
            let capturedPokemon = pokemon.val().name;
            let capturedPokemonImage = pokemon.val().image;

            pokemonRef.child(capturedPokemon).remove();

            $('#' + playerName).append($('<img>').attr('src', capturedPokemonImage).addClass('captured'));

            playerRef.child('capturedPokemon').push({
              capturedPokemon: capturedPokemon,
              capturedPokemonImage: capturedPokemonImage
            });
          }
        });

      });

        // debugger;
      // if (snapshot.child('cade').val()){
      //   cadeRef.once('value', function(cadeSnap){
      //     // debugger;
      //     if (cadeSnap.val().position === playerPosition){
      //
      //       let capturedCademonName = cadeSnap.val().name;
      //       let $cademon = $('<img>').addClass('cade').attr('src', './headshot.jpg').css({
      //         'border-radius': '50%'
      //       });
      //       cadeRef.remove();
      //       // debugger;
      //
      //       playerRef.child('capturedPokemon').push({
      //         capturedPokemon: capturedCademonName,
      //         capturedPokemonImage: './headshot.jpg'
      //       });
      //
      //     }
      //   });
      // }

      let $player = $('<p>').text(playerName);
      let $pokeball = $('<img>').attr('src', 'http://orig04.deviantart.net/5341/f/2012/019/f/0/pokeball_icon_by_alphamanxd1-d4mxmi5.png').addClass('pokeball');
      let $sprite = $('<img>').attr('src', './ashSpriteAlpha2.png').css('bottom', '0');
      let $playerPosition =  $('#gameArea').find('div.col-xs-1:nth-child(' + playerPosition + ')');

      $playerPosition.append($pokeball, $player, $sprite);

    });


    // if (snapshot.child('cade').val()){
    //
    //   $('.cade').remove();
    //   $('.cadeMessage').remove();
    //
    //   cadeRef.once('value', function(cadeSnap){
    //
    //     // debugger;
    //
    //     let $cademon = $('<img>').addClass('cade').attr('src', './headshot.jpg').css({
    //       'border-radius': '50%'
    //     });
    //
    //     let $cadeMessage = $('<h3>').addClass('cadeMessage').text('A rare Cademon has appeared!').css({
    //       'display': 'inline',
    //       'background-color': '#FE3310',
    //       'color': 'white'
    //     });
        // $('#titleArea').append($cadeMessage);
    //
    //     let $cadeLocation =  $('#gameArea').find('div.col-xs-1:nth-child(' + cadeSnap.val().position + ')');
    //
    //     $cadeLocation.append($cademon);

        // var cadeRemove = window.setTimeout(function(){
        //   removeRareCademon()
        // }, 2000);

      // })
    // }

  }





    // $('#startGame').click(addNewPlayer);
    // gameRef.on('value', updateBoard);


    // gameRef.child('pokemon').on('value', function(snapshot){
    //   console.log(!snapshot.val())
    //   if (!snapshot.val()) {
    //     gameRef.child('pokemon').set({
    //       pokemonCount: 0
    //     });
    //   } else {
    //     generatePokemon(snapshot);
    //   }
    // });

  // }

//   function generatePokemon(){
// // debugger;
//     if (!gameRef.once('value', function(snapshot){return;})){
//       pokemonCount = 0;
//     }
//
//     gameRef.once('value', function(snapshot){
//
//       // debugger;
//       pokemonCount = snapshot.val().pokemonCount ? snapshot.val().pokemonCount.pokemonCount : 0
//
//     });
//
//     // debugger;
//
//
//       let randomPokemonNumber = Math.floor(Math.random() * 778);
//       let randomPokemonName = pokedex.pokemon[randomPokemonNumber].name;
//
//       let pokemonData = 'http://pokeapi.co/' + pokedex.pokemon[randomPokemonNumber].resource_uri;
//
//       // console.log(pokemonData, randomPokemonNumber, pokedex);
//
//       $.get(pokemonData)
//         .done(function(data){
//
//           // let $attack = $('<p>').text('Attack Power: ' + data.attack);
//           // let $defense = $('<p>').text('Defense Power: ' + data.defense);
//           // let $hp = $('<p>').text('HP: ' + data.hp);
//
//           let pokemonSprite = 'http://pokeapi.co/' + data.sprites[0].resource_uri;
//
//             $.get(pokemonSprite)
//               .done(function(data){
//                 let pokemonImage = 'http://pokeapi.co/' + data.image;
//                 let $pic = $('<img>').attr('src', pokemonImage);
//
//                 let pokemonLocation = Math.floor(Math.random() * 120);
//                 let formatted = 'div.col-xs-1:nth-child(' + pokemonLocation.toString() + ')';
//
//                 $('#gameArea').find(formatted).append($pic);
// // debugger;
//                 pokemonCount += 1;
//                 // console.log('pokemonCount: ', pokemonCount);
//
//                 if (pokemonCount > 5){
//                     return;
//                 } else {
//                   gameRef.child('pokemonCount').update({
//                     pokemonCount: pokemonCount
//                   });
//                   gameRef.child(randomPokemonName).set({
//                     name: randomPokemonName,
//                     position: pokemonLocation,
//                     type: 'pokemon',
//                     image: pokemonImage
//                   })
//                 }
//
//                 // debugger;
//
//
//
//               }).fail(function(error){
//                 console.log('Failed at sprite retrieval. Error: ', error);
//               });
//
//           })
//           .fail(function(){
//             console.log('Failed at pokemon retrieval. Error: ', error);
//           });
//
//
//           // debugger;
//       // }
//
//   }
//
//   function updateBoard(snapshot) {
//
//     $('#gameArea div.col-xs-1').empty();
//
//     let pokemonPositions = [];
//     let playerPositions = [];
//
//
//
//     for (var key in snapshot.val()){
//       let position = snapshot.val()[key].position;
//       let name = snapshot.val()[key].name;
//
//       // snapshot.forEach(function(childSnapshot){
//       //   // childSnapshot.val().position, childSnapshot.val().name);
//       //   var childName = childSnapshot.val().name;
//       //   var childPosition = childSnapshot.val().position;
//       //   if (childPosition === position && childName !== name){
//       //     // console.log(name, childName, position, childPosition);
//       //   }
//       // });
//
//       // debugger;
//       if (snapshot.val()[key].type === 'pokemon') {
//
//         let pokemonLocation = snapshot.val()[key].position;
//         pokemonPositions.push(pokemonLocation);
//         let $pokemonImage = $('<img>').attr('src', snapshot.val()[key].image);
//
//         $('#gameArea').find('div.col-xs-1:nth-child(' + pokemonLocation + ')').append($pokemonImage);
//       } else if (snapshot.val()[key].type === 'player') {
//
//         let playerPosition = snapshot.val()[key].position;
//         playerPositions.push(playerPositions);
//         let $player = $('<p>').text(snapshot.val()[key].name);
//
//         $('#gameArea').find('div.col-xs-1:nth-child(' + playerPosition + ')').append($player);
//
//       } else {
//
//       }
//
//
//
//
//
//     }
//
//   }
//
//
//   function addPlayerToGame(snapshot) {
//
//     let startPosition = snapshot.val();
//     let $startPosition = $('#gameArea').find('div:nth-child(' + startPosition + ')');
//     $startPosition.append($('<p>').text(playerName).attr('id', playerName).addClass('player'));
//
//
//   }
//


  // var Player = function(name, startPosition) {
  //   this.name = name;
  //   this.position = startPosition;
  //   this.pokemon = ['pikachu'];
  //   this.playerKey = playerKey;
  //
  // }


})(jQuery);
