


var fs = require( 'fs' ),
  request = require( 'request' ),
  path = require( 'path' ),
  apiDataFile = path.join( __dirname, '../fitbitApiData' ),
  clientKey, clientSecret, oauthToken, oauthTokenSecret, userId,
  apiURL = 'https://api.fitbit.com/1/user/',
  apiCallParams = '/activities/distance/date/today/',
  distancesFile = path.join( __dirname, '../data/distances.json' ),
  distances = {},
  updating = false;



/*                      GET DISTANCES (FITBIT API)
------------------------------------------------------------------------- */

exports.getDistancesData = function ( startingDate ) {

  // Load Fitbit API data

  fs.readFile( apiDataFile, 'utf-8', function( err, data ) {
    if ( err ) throw err;
    console.log( '\n----- Fitbit API data LOADED -----\n' );
    var dataValues = data.split( ',' );
    clientKey = dataValues[ 0 ];
    clientSecret = dataValues[ 1 ];
    oauthToken = dataValues[ 2 ];
    oauthTokenSecret = dataValues[ 3 ];
    userId = dataValues[ 4 ];
    distances = {};

    if ( updating ) {
      loadDistancesData();
    } else {
      getDistances();
    }
  });

  // Load Distances data

  var loadDistancesData = function() {

    fs.readFile( distancesFile, 'utf-8', function( err, data ) {
      if ( err ) throw err;
      console.log( '\n----- Distances data LOADED -----\n' );
      distances = JSON.parse( data );
      getDistances();
    });

  };

  // Save Distances data

  var saveDistancesData = function() {

    fs.writeFile( distancesFile, JSON.stringify( distances ), function( err ) {
      if ( err ) throw err;
      console.log( '\n----- Distances data SAVED -----\n' );
    });

  };

  // Get Distances data from API

  var getDistances = function() {

    var apiCallURL = apiURL + userId + apiCallParams;
    if ( updating ) {
      apiCallURL += '1w.json';
    } else {
      apiCallURL += startingDate.getFullYear() + '-' + ( '0' + ( startingDate.getMonth() + 1 ) ).slice( -2 ) + '-' + ( '0' + startingDate.getDate() ).slice( -2 ) + '.json';
    }

    console.log( '\n----- Calling Fitbit API -----\n' );
    console.log( apiCallURL );

    request.get( apiCallURL, {
      oauth: {
        consumer_key: clientKey,
        consumer_secret: clientSecret,
        token: oauthToken,
        token_secret: oauthTokenSecret
      }
    }, function ( error, response, body ) {

      console.log( '\n----- Distances data RETRIEVED -----\n' );

      var data = JSON.parse( body )[ 'activities-distance' ];

      for ( var i = 0; i < data.length; i++ ) {
        if ( +data[ i ].value > 0 ) {
          var day = new Date( data[ i ].dateTime ),
            value = Math.round( data[ i ].value * 100 ) / 100;
          distances[ String( day.getTime() ) ] = value;
          console.log( day + ' ' + value );
        }
      }

      saveDistancesData();

    });

  };

};



/*                      SET UPDATE MODE
------------------------------------------------------------------------- */

exports.updateDistanceData = function () {

  updating = true;
  this.getDistancesData();

};


