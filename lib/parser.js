


var fs = require( 'fs' ),
  request = require( 'request' ),
  path = require( 'path' ),
  apiDataFile = path.join( __dirname, '../private/fitbitApiData' ),
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
    log( 'Fitbit API data LOADED', true );
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
      log( 'Distances data LOADED', true );
      distances = JSON.parse( data );
      getDistances();
    });

  };

  // Save Distances data

  var saveDistancesData = function() {

    fs.writeFile( distancesFile, JSON.stringify( distances ), function( err ) {
      if ( err ) throw err;
      log( 'Distances data SAVED', true );
    });

  };

  // Get Distances data from API

  var getDistances = function() {

    var apiCallURL = apiURL + userId + apiCallParams;
    if ( updating ) {
      apiCallURL += '1m.json';
    } else {
      apiCallURL += startingDate.getFullYear() + '-' + ( '0' + ( startingDate.getMonth() + 1 ) ).slice( -2 ) + '-' + ( '0' + startingDate.getDate() ).slice( -2 ) + '.json';
    }

    log( 'Calling Fitbit API', true );
    log( apiCallURL );

    request.get( apiCallURL, {
      oauth: {
        consumer_key: clientKey,
        consumer_secret: clientSecret,
        token: oauthToken,
        token_secret: oauthTokenSecret
      }
    }, function ( error, response, body ) {

      log( 'Distances data RETRIEVED', true );

      var data = JSON.parse( body )[ 'activities-distance' ];

      for ( var i = 0; i < data.length; i++ ) {
        if ( +data[ i ].value > 0 ) {
          var day = formatDate( new Date( data[ i ].dateTime ) ),
            value = Math.round( data[ i ].value * 100 ) / 100;
          distances[ day ] = value;
          log( day + ' ' + value );
        }
      }

      saveDistancesData();

    });

  };

};



/*                      UTILITIES
------------------------------------------------------------------------- */

var formatDate = function( d ) {
  return d.getFullYear() + '-' + ( '0' + ( d.getMonth() + 1 ) ).slice( -2 ) + '-' + ( '0' + d.getDate() ).slice( -2 );
};

var log = function( msg, isBright ) {
  if ( isBright ) {
    console.log( '\x1b[1m%s\x1b[0m', '\n----- ' + msg );
  } else {
    console.log( msg );
  }
};



/*                      SET UPDATE MODE
------------------------------------------------------------------------- */

exports.updateDistanceData = function () {

  updating = true;
  this.getDistancesData();

};


