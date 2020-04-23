Recipe Database: Updated 4/20

OVERVIEW NOTES
	

parseScrape3.cpp
	This script is more than a simple text parser. It takes a given input file, which will be our scrape data. It then parses the given information, and writes it to csv file (each of which will correspond to a table in the database). As of right now, it fills in default values for fields such as, 'num_likes' or 'num_dislikes'.
	Note that the directory paths used in the copy statements will have to be changed when being moved to heroku.

create_db_draft3.sql
	This SQL script is designed to be an all-in-one script for the database; that being, a script to create and fill the tables. Tables are created normally, and then a psql client function is used to insert the external data (the csv files created from parseScrape3.cpp) into the tables. This function is 'psql \copy', but we leave out the psql when writing the actual command in the script. 
	As of right now,
		the recipes table as a unique primary key, recipe_id; and all other tables have the recipe_id as their foreign key. SERIAL datatype was used for this field, which is unique by default; and since I'm assuming we insert the recipes in correct order, there was no need for the other tables to have primary keys (as the foreign key would always be identical the primary key... e.g: the details for recipe #1 is not going to reference any other recipe than #1).
	Also please note the following relation constraint: Deleteing 

parseText3.txt
	This is just the file I've been working with for all testing so far. This should give you a clear idea of what the format of the data needs to be.

