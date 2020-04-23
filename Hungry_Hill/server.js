// Hungry Hill
// Server and Integration Piece

// Server code written by Gavin Zimmerman; notify in the case of errors or bugs
// function camelCase()
// var under_score



// Deployment configuration Variables
var deploy_local=true;	// If serving locally, set to true

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
var jquery = require('jquery');


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
	misc: {
		new: true	// If user is new
	}
} 


function initCookie(res) { 	// Initialize session if we don't have an active session
	console.log('creating cookie',{maxAge: 360000});
	res.cookie("session", sessionData);
}


// App Request Handlers
function homePage(req,res) {
	var current_session=req.cookies.session;
	if (!current_session) {
		initCookie(res);
		current_session=sessionData;
	};

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
	var cook_condition="SELECT * FROM (SELECT * FROM details where ( not (cook_time>'1 h 00 m' and LENGTH(cook_time)>2))) AS non_houred where cast(cook_time as int)<";
	if (current_session.settings.cook_time=='Any Time') {
		cook_condition='SELECT * FROM details';
	}
	else {
		cook_condition+=current_session.settings.cook_time.substring(6,8);
	}
	
	// Recipe search query put together with all conditionals (not seen/ rated (input sank), under required time, with appropriate filter tags)
	var find_query=`SELECT * FROM ((SELECT * FROM recipe 
	 				WHERE recipe_id NOT IN `+sank_recipes+`) AS valid_ids 
	 				INNER JOIN preferences ON valid_ids.recipe_id=preferences.recipe_id) 
	 				INNER JOIN (`+cook_condition+`) AS recipes_under_time ON recipes_under_time.recipe_id=valid_ids.recipe_id 
	 				WHERE `+ active_filters +`
	 				ORDER BY RANDOM()  
					LIMIT 25;`;
	
	database.any(find_query)
	.then(function (matched_recipes){
		res.render('home',{
        	recipes: matched_recipes,
        	new: current_session.misc.new
    	});

	})
	.catch(function(err) {
		console.log(err);
		
	})

};
app.get('/',homePage);



function handleSwipe(req,res) {
	var id=req.query.id;		// Recipe id
	var code=req.query.code;	// Recipe code

	var current_session=req.cookies.session;
	if (!current_session) {
		initCookie(res);
		current_session=sessionData;
	};

	// Update cookie
	var increment_query='UPDATE stats SET num_dislikes=num_dislikes+1 WHERE recipe_id='+id;	// Assume dislike incrementation
	
	if (code==='1') {	// Recipe was liked
		current_session.recipes.liked.push(parseInt(id));
		increment_query='UPDATE stats SET num_likes=num_likes+1 WHERE recipe_id='+id;	// Change to like incrementation
	}
	//current_session.recipes.sank[current_session.recipes.sank.lenth]=id;
	current_session.recipes.sank.push(parseInt(id));
	console.log(current_session.recipes.sank);

	res.clearCookie('session'); 
	res.cookie("session", current_session);


	database.any(increment_query)
	.then(function (matched_recipes){
		res.status(202).send({status: 'heard'});
	})
	.catch(function(err) {
		console.log(err);
		res.status(501).send({status: 'error'});
	})

};
app.post('/swipe',handleSwipe);



function handleSettings(req,res) {
	var setting=req.query.setting;
	var value=req.query.val;
	
	if (value=='true' || value=='false')
		value=(value=='true');


	var current_session=req.cookies.session;
	if (!current_session) {
		initCookie(res);
		current_session=sessionData;
	};

	current_session.settings[setting]=value;

	res.clearCookie('session'); 
	res.cookie("session", current_session); 

	res.status(202).send({status: 'heard'});
};
app.post('/updateSettings',handleSettings);


function filterPage(req,res) {
	var current_session=req.cookies.session;
	if (!current_session) {
		initCookie(res);
		current_session=sessionData;
	};

	res.render('filters',{
		settings: current_session.settings
	});
};
app.get('/filters',filterPage);


function recipePage(req,res) {
	res.render('Liked_Recipes',{

	});
};
app.get('/recipes',recipePage);


function postSwipe(req,res) {

};
app.post('/swipe',postSwipe);






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
