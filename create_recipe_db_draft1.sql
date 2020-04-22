-- FOR NOW WE ASSUME THE DB DOES NOT EXIST
-- ALTERNATIVE 1: DROP EXISTING DB OF SAME NAME, REPLACE WITH SCRIPT BELOW
-- ALTERNATIVE 2: IF DB OF SAME NAME EXISTS, DO NOTHING AND EXIT SCRIPT

CREATE TABLE recipe (

	recipe_id SERIAL NOT NULL PRIMARY KEY,
	name TEXT NOT NULL,
	picture TEXT NOT NULL

);
\copy recipe(name, picture) FROM '~/recipesTableData.csv' DELIMITER ',' CSV; -- may need to change this to semicolon delimiter for consistency

CREATE TABLE details (

	detail_id SERIAL NOT NULL PRIMARY KEY,
	-- NB: CURRENTLY NO DESCRIPTION FROM SCRAPE
	-- DO WE FORGET ABOUT THIS FIELD, OR FIND SOMETHING TO FILL IT WITH?
	
	cook_time TEXT,
	servings INTEGER,
	-- NB: GOING TO HAVE TO REPLACE NUTRITION FACTS WITH JUST, CALORIES.
	cals INTEGER, 
	directions TEXT NOT NULL,
	recipe_id SERIAL NOT NULL,
	UNIQUE(recipe_id)
	
);
\copy details(cook_time, servings, cals, directions) FROM '~/detailsTableData.csv' DELIMITER ';' CSV; -- Not sure if this was entirely necessary, but swapped delimiter to semicolon to ensure there were no insertion errors (ingredients has commas)


CREATE TABLE stats (

	stat_id SERIAL NOT NULL PRIMARY KEY,
	num_likes INTEGER NOT NULL DEFAULT 0,
	num_dislikes INTEGER NOT NULL DEFAULT 0,
	recipe_id SERIAL NOT NULL,
	UNIQUE(recipe_id)
);

ALTER TABLE details ADD CONSTRAINT deail_recipe_fk FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id); -- NB: Currently no checks if the ids match up
ALTER TABLE stats ADD CONSTRAINT stats_recipe_fk FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id);