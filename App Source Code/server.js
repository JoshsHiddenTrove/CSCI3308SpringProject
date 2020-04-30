// Hungry Hill
// Server and Integration Piece

// Server code written by Gavin Zimmerman; notify in the case of errors or bugs
// function camelCase()
// var under_score



// Deployment configuration Variables
var deploy_local=false;	// If serving locally, set to true

const local_port=3000;			// Port to serve locally
const local_configuration= {	// Database to read/ write locally
	host: 'localhost',
	port: 5432,
	database: 'hungryhill',
	user: 'gzimm4',
	password: 'pwd'
};




// Module componenets
var express = require('express');
var body_parser = require('body-parser');
var pg_promise = require('pg-promise');
var cookie_parser = require('cookie-parser');



// Setup
var app=express();
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));
app.use(cookie_parser());


var db_conf= (deploy_local ? local_configuration : process.env.DATABASE_URL);	// Configures database settings
var port= (deploy_local ? local_port : process.env.PORT);	// Port to be listened on

pg_promise=pg_promise();	// Create database connection
var database= pg_promise(db_conf);

app.set('view engine', 'ejs');				// Sets view to ejs
app.use(express.static(__dirname + '/'));		// Allows relative paths on resources

const { buildCheckFunction } = require('express-validator');
const checkQuery = buildCheckFunction(['query']);


const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('101184466692-kr68aen0dp5gdqbih75vdaoc701ql7l3.apps.googleusercontent.com');



// Cookies
// sessionData
let sessionData = {
	settings: {		// Corresponds to users setting
		vegetarian: false,
		vegan: false,
		dairy_free: false,
		gluten_free: false,
		nut_free: false,
		cook_time: 'Any Time'
	},
	recipes: {
		liked: [0],	// Recipes swiped in favor of
		sank: [0]	// Recipes swiped regardless of direction; i.e. input was sank
	},
	version: 4,		// For testing purposes
	profile: {
		signed_in: false,
		id: 0
	}
}



// Cookie Helpers
function initCookie(res) { 	// Initialize session if we don't have an active session
	console.log('creating cookie',{maxAge: 360000});
	res.cookie("session", sessionData);
}

// returns cookie object given request and response; pulls changes from database if user is signed in; initializes cookie if non-existent or out-dated from version
function loadCookie(req,res) {
	var current_session=req.cookies.session;
	if (!current_session) {
		initCookie(res);
		current_session=sessionData;
	}
	

	if (current_session.version != sessionData.version){
		console.log('Outdated cookies');
		res.clearCookie('session');
		initCookie(res);
		current_session=sessionData;
	}


	if (current_session.profile.signed_in==true) {
		database.any(`SELECT * FROM users WHERE id='`+current_session.profile.id+`';`)
		.then(function (userStoredData) {
			current_session.settings=userStoredData[0].settings;
    		current_session.recipes=userStoredData[0].recipes;
		});
	}

	return current_session;
}


// Resets cookie with new values from passed in json; will post changes to database if user is signed in
function setCookie(cookie_json,res) {
	// If logged in, update SQL User Table
	
	if (cookie_json.profile.signed_in==true) {
		var settings=JSON.stringify(cookie_json.settings);
    	var recipes=JSON.stringify(cookie_json.recipes);

		query=`UPDATE users SET recipes='`+recipes+`', settings='`+settings+`' WHERE id='`+cookie_json.profile.id+`'`;
		database.any(query);
	};

	// Set it
	res.clearCookie('session'); 
	res.cookie("session", cookie_json); 
}







// App Request Handlers
// Home page- loads the main feature; swiping in favor of recipes
function homePage(req,res) {
	var current_session=loadCookie(req,res);

	// Create query based on cookie data
	// Generate a list of all recipe id's already seen
	var sank_recipes="("+current_session.recipes.sank[0];
	for(var i = 1; i < current_session.recipes.sank.length; i++) {
		sank_recipes+=','+current_session.recipes.sank[i];
	};
	sank_recipes+=')';
	
	// Generate list of all active filters
	var active_filters="(true";
	Object.keys(current_session.settings).forEach(function (key) {
		if (current_session.settings[key]===true) {
			active_filters+=' and '+key;
		}
	});
	active_filters+=')';
	
	// Generate condition for cook time (which is a bit hacky because cook_time isn't stored as an integer)
	var cook_condition="cast(cook_time AS INT) <= ";
	if (current_session.settings.cook_time=='Any Time') {
		cook_condition='true';
	}
	else {
		cook_condition+=current_session.settings.cook_time.substring(6,8);
	}
	
	// Recipe search query put together with all conditionals (not seen/ rated (input sank), under required time, with appropriate filter tags)
	var find_query=`SELECT * FROM ((SELECT * FROM recipe 
	 				WHERE recipe_id NOT IN `+sank_recipes+`) AS valid_ids 
	 				INNER JOIN preferences ON valid_ids.recipe_id=preferences.recipe_id) 
	 				INNER JOIN details ON details.recipe_id=valid_ids.recipe_id
	 				WHERE `+ active_filters +` AND `+ cook_condition + `
	 				ORDER BY RANDOM()  
					LIMIT 25;`;
	
	database.any(find_query)
	.then(function (matched_recipes){
		res.render('home',{
        	recipes: matched_recipes,
        	logged_in: current_session.profile.signed_in
    	});

	})
	.catch(function(err) {
		console.log(err);
	})

};
app.get('/',homePage);







//handleSwipe - Will record liked recipe ids in cookie session and post an update to the database
function handleSwipe(req,res) {
	var id=req.query.id;		// Recipe id
	var code=req.query.code;	// Recipe code

	if (Number.isNaN(id)) {
		console.log('Recieved unexpected id, call exited');
		res.status(202).send({status: 'error'});
		return;
	}
	

	var current_session=loadCookie(req,res);

	// Update cookie
	var increment_query='UPDATE stats SET num_dislikes=num_dislikes+1 WHERE recipe_id='+id+';';	// Assume dislike incrementation
	
	if (code==='1') {	// Recipe was liked
		current_session.recipes.liked.push(parseInt(id));
		increment_query='UPDATE stats SET num_likes=num_likes+1 WHERE recipe_id='+id+';';	// Change to like incrementation
	}
	
	current_session.recipes.sank.push(parseInt(id));

	setCookie(current_session,res);

	database.any(increment_query)
	.then(function (matched_recipes){
		res.status(202).send({status: 'heard'});
	})
	.catch(function(err) {
		console.log(err);
		res.status(501).send({status: 'error'});
	})

};
// Sanitize input
app.post('/swipe', [
	checkQuery('id').toInt()
],handleSwipe);








// handleSettings- will update the user's cookie based off a post request
function handleSettings(req,res) {
	var setting=req.query.setting;
	var value=req.query.val;

	// Verify input
	if (sessionData.settings[setting]==undefined) {
		console.log('Recieved unexpected setting change, call exited');
		res.status(405).send({status: 'error'});
		return;
	}
	
	if (value=='true' || value=='false') 
		value=(value=='true');
	else {
		if (!(setting=='cook_time')) {
			console.log('Recieved unexpected value, call exited');
			res.status(405).send({status: 'error'});
			return;
		}
	}

	// Update cookie
	var current_session=loadCookie(req,res);

	current_session.settings[setting]=value;

	setCookie(current_session,res);

	res.status(202).send({status: 'heard'});
};
// Sanitize input
app.post('/updateSettings', [
	checkQuery('setting').escape(),
	checkQuery('val').escape()
],handleSettings);








// filterPage - Loads the user's page to set filters
function filterPage(req,res) {
	var current_session=loadCookie(req,res);

	res.render('filters',{
		settings: current_session.settings,
        logged_in: current_session.profile.signed_in
	});
};
app.get('/filters',filterPage);








// recipePage - Loads a feature page where all user's liked recipes are recorded
function recipePage(req,res) {
	var current_session=loadCookie(req,res);

	featured_query=`SELECT * FROM (recipe INNER JOIN stats ON recipe.recipe_id=stats.recipe_id) 
					INNER JOIN details ON recipe.recipe_id=details.recipe_id 
					ORDER BY (num_likes-num_dislikes) DESC LIMIT 4;`

	vegetarian_query=`SELECT * FROM ((recipe INNER JOIN stats ON recipe.recipe_id=stats.recipe_id) 
					INNER JOIN details ON recipe.recipe_id=details.recipe_id)
					INNER JOIN preferences ON recipe.recipe_id=preferences.recipe_id
					WHERE vegetarian=true
					ORDER BY (num_likes-num_dislikes) DESC LIMIT 4;`

	var liked_recipes="("+current_session.recipes.liked[0];
	for(var i = 1; i < current_session.recipes.liked.length; i++) {
		liked_recipes+=','+current_session.recipes.liked[i];
	};
	liked_recipes+=')';

	liked_query=`	SELECT * FROM (SELECT * FROM recipe
					WHERE recipe_id IN `+liked_recipes+`) AS grouped_data
					INNER JOIN details ON grouped_data.recipe_id=details.recipe_id;`;

	database
	.task('get-everything', search => {
        return search.batch([
            search.any(featured_query),
            search.any(vegetarian_query),
            search.any(liked_query)
        ]);
    })
    .then(results => {
      res.render('Liked_Recipes',{
      	featured: results[0],
      	vegetarian: results[1],
      	liked: results[2],
        logged_in: current_session.profile.signed_in
	  });
    })
    .catch(err => {
        // display error message in case an error
        console.log(err);
    });
};
app.get('/recipes',recipePage);









// Signs user in
async function onSignIn(req,res) {
	var token=req.body.token;
	var path=req.body.reload_path;


	// Use google library to authenticate user token
	const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '101184466692-kr68aen0dp5gdqbih75vdaoc701ql7l3.apps.googleusercontent.com'
  	});


  	const payload = ticket.getPayload();
    const userid = payload['sub'];

    var current_session=loadCookie(req,res);
    var settings=JSON.stringify(current_session.settings);
    var recipes=JSON.stringify(current_session.recipes);


    database.any(`SELECT * FROM users WHERE id='`+userid+`';`)
    .then(function (userStoredData) {
    	current_session.profile.signed_in = true;
    	current_session.profile.id=userid;

    	if (userStoredData.length==0) {	// If new user then set their cookie in the database
    		query_insert=`INSERT INTO users VALUES ('`+userid+`', '`+settings+`', '`+recipes+`');`;
    		database.any(query_insert);

    		// We've updated the signed in values, so we need to update the cookie
    		res.clearCookie('session'); 
			res.cookie("session", current_session); 
			
			res.redirect('back');

			console.log(current_session);
	    }
	    else {	// User exists, load in their cookie now
	    	current_session.settings=userStoredData[0].settings;
	    	current_session.recipes=userStoredData[0].recipes;

	    	res.clearCookie('session'); 
			res.cookie("session", current_session); 
	    	// Now reload, because what we loaded may be different than what the use had before
	    	res.redirect('back');
	    }
    })
    .catch(function(err) {
		console.log(err);
		res.status(501).send({status: 'error'});
	});
};
app.post('/signIn',onSignIn);







// Signs user out and resets cookie to default
function onSignOut(req, res) {
	var current_session=loadCookie(req,res);
	current_session.profile.signed_in=false;

	res.clearCookie('session'); 
	initCookie(res);

	// Reload now that we defaulted our cookie
	res.redirect('back');
};
app.post('/signOut',onSignOut);














// App deployment
app.listen(port);

// Deployment Feedback
if (deploy_local) {
	console.log('Hungry Hill activated locally');
	console.log('Listening on port '+port);
	console.log('Database configuration:'
				+'\n  DB Name: '+local_configuration.database
				+'\n  Port: '+local_configuration.port
				+'\n  User: '+local_configuration.user
				+'\n');
}
else {
	console.log('Database active on heroku\n'+
				'Host: https://hungry-hill.herokuapp.com/');
};
