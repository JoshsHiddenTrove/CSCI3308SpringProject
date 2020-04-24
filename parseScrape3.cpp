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
	cout<<"\x31"<<endl;
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
		string tempPicturePath;
		string tempCookTime;
		string tempServings;
		string tempCals;
		string tempIngredients;
		vector <string> recipeNames;
		vector <string> picturePaths;
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
				getline(ss_line, tempPicturePath,',');
				getline(ss_line,tempCookTime,',');
				getline(ss_line,tempServings,',');
				getline(ss_line,tempCals,',');
				getline(ss_line, tempIngredients);

				recipeNames.push_back(tempName);
				picturePaths.push_back(tempPicturePath);
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
					writeToRecipes << recipeNames.at(i) << "," << picturePaths.at(i) << "," << "0" << endl;
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



			ofstream writeToStats;
			writeToStats.open("statsTableData.csv");
			if(!writeToStats.fail())
			{
				int i = 0;
				while(i < recipeNames.size())
				{
					writeToStats << "0,0" << endl;
					i++;
				}
				writeToStats.close();
			}
			else
			{
				cout << "ERROR: Failed to write stats data" << endl;
			}

			

			ofstream writeToPreferences;
			writeToPreferences.open("preferencesTableData.csv");
			if(!writeToPreferences.fail())
			{

				int i = 0;
				while(i < recipeNames.size())
				{
					string isVegan = "";
					string isGluten_free= "";
					string isNut_free= "";
					string isVegetarian= "";
					string isDairy_free= "";

					string currName = recipeNames.at(i);

					if (currName.find("Vegan") <= currName.length() ) //vegan exists in title 
					{
						isVegan = "1";
					}
					else 
					{
						isVegan = "0";
					}

					if ((currName.find("Gluten Free") <= currName.length() ) || (currName.find("gluten free") <= currName.length() )) //vegan exists in title 
					{
						isGluten_free = "1";
					}
					else 
					{
						isGluten_free = "0";
					}

					if ((currName.find("Nut Free") <= currName.length() ) || (currName.find("nut free") <= currName.length() )) //vegan exists in title 
					{
						isNut_free = "1";
					}
					else 
					{
						isNut_free = "0";
					}

					if (currName.find("Vegetarian") <= currName.length() ) //vegan exists in title 
					{
						isVegetarian = "1";
					}
					else 
					{
						isVegetarian = "0";
					}

					if ((currName.find("Dairy Free") <= currName.length() ) || (currName.find("dairy free") <= currName.length() )) //vegan exists in title 
					{
						isDairy_free = "1";
					}
					else 
					{
						isDairy_free = "0";
					}

					writeToPreferences << isVegan << "," << isDairy_free << "," << isVegetarian << "," << isGluten_free << "," << isNut_free << endl;

					
					i++;
				}
				writeToPreferences.close();

			}
			else
			{
				cout << "ERROR: Failed to write preferences data" << endl;
			}
			
		}
		
	}
}


int main()
{
	parse("parseText3.txt");
	return 0;
}