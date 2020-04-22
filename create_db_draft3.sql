-- create recipe table
CREATE TABLE recipe(
	recipe_id SERIAL NOT NULL PRIMARY KEY, -- NB: serial datatype is implicitly UNIQUE --
	name TEXT NOT NULL,
	picture TEXT,
	saved BOOLEAN NOT NULL -- NB: 'saved' corresponds to a user 'liking' a given recipe

);
\copy recipe(name, picture, saved) FROM 'recipesTableData.csv' DELIMITER ',' CSV; -- psql function to import/copy data from external csv file into the database


--create details table
CREATE TABLE details(

	-- NB: as of this, draft 3, primary key has been left out. Only using foreign key references, as the primary key will always been the same as the foreign key.
	-- BUT, this is subject to change
	cook_time TEXT,
	servings INTEGER,
	cals INTEGER,
	directions TEXT NOT NULL,
	recipe_id SERIAL REFERENCES recipe(recipe_id) ON DELETE CASCADE

);
\copy details(cook_time, servings, cals, directions) FROM 'detailsTableData.csv' DELIMITER ';' CSV; -- Not sure if this was entirely necessary, but swapped delimiter to semicolon to ensure there were no insertion errors (ingredients has commas)


--create stats table
CREATE TABLE stats (

	-- Again ignoring PK for now
	num_likes INTEGER NOT NULL,
	num_dislikes INTEGER NOT NULL,
	recipe_id SERIAL REFERENCES recipe(recipe_id) ON DELETE CASCADE
);
\copy stats(num_likes,num_dislikes) FROM 'statsTableData.csv' DELIMITER ',' CSV;


-- create preferences table
CREATE TABLE preferences (

	vegan BOOLEAN NOT NULL,
	dairy_free BOOLEAN NOT NULL,
	vegetarian BOOLEAN NOT NULL,
	gluten_free BOOLEAN NOT NULL,
	nut_free BOOLEAN NOT NULL,
	recipe_id SERIAL REFERENCES recipe(recipe_id) ON DELETE CASCADE
);
\copy preferences(vegan, dairy_free, vegetarian, gluten_free, nut_free) FROM 'preferencesTableData.csv' DELIMITER ',' CSV;
-- alter tables: add foregin key constraints