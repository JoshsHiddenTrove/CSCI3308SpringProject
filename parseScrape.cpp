/**
For this parser to work correctly: Ingredients list must be captured within double quotes
*/
#include<iostream>
#include<fstream>
#include<sstream>
#include<string>
#include<vector>
using namespace std;
void parse(string filename)
{
	ifstream inFile; //ceate file stream
	inFile.open(filename);
	if(inFile.fail())
	{
		cout << "ERROR: Failed to open file passed" << endl;
	}
	else
	{
		string line;
		string tempName;
		string tempPicturePath = "no_image";
		string tempCookTime;
		string tempServings;
		string tempCals;
		string tempIngredients;
		vector <string> recipeNames;
		vector <string> cooktimes;
		vector <int> servings;
		vector <int> cals;
		vector <string> ingredients;
		bool parsed = false;

		while(getline(inFile, line))
		{
			
			if(line != "") //if non empty line... This should skip and blank errors in the scrape process
			{
				stringstream ss_line(line); //create stringstream for entire line
				getline(ss_line, tempName,',');
				getline(ss_line,tempCookTime,',');
				getline(ss_line,tempServings,',');
				getline(ss_line,tempCals,',');
				getline(ss_line, tempIngredients);

				recipeNames.push_back(tempName);
				cooktimes.push_back(tempCookTime);
				int tempIntServings = stoi(tempServings);
				int tempIntCals = stoi(tempCals);

				servings.push_back(tempIntServings);
				cals.push_back(tempIntCals);
				ingredients.push_back(tempIngredients);
				
			}
			parsed = true;
		}


		if(parsed)
		{
			ofstream writeToRecipes;
			writeToRecipes.open("recipesTableData.csv");
			if(!writeToRecipes.fail())
			{
				int i = 0;
				while(i < recipeNames.size())
				{
					writeToRecipes << recipeNames.at(i) << "," << tempPicturePath << endl;
					i++;
				}
				writeToRecipes.close();
			}
			else
			{
				cout << "ERROR: Failed to write recipes data" << endl;
			}

			ofstream writeToDetails;
			writeToDetails.open("detailsTableData.csv");
			if(!writeToDetails.fail())
			{
				int j = 0;
				while( (j < cooktimes.size() ) || (j < servings.size() ) || (j < cals.size() ) || ( j < ingredients.size() ) ) 
				{
				    writeToDetails << cooktimes.at(j) << ";" << servings.at(j) << ";" << cals.at(j) << ";"  << ingredients.at(j) << endl;
				    j++;
				}
				writeToDetails.close();

			}
			else
			{
				cout << "ERROR: Failed to write details data" << endl;
			}

			//TODO: CREATE DEFAULT CSV FILES FOR OTHER TABLES?
			
		}
		
	}
}


int main()
{
	parse("parseTest2.txt");
	return 0;
}