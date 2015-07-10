Documentation for Javascript Css Checker
---------------------------

Contact
-------
Email:kagbulos1@gmail.com

Date
----
7/10/15

Description
-----------
This is a singlepage Javascript application that checks if a CSS file adheres to the Udacity style guidelines (http://udacity.github.io/frontend-nanodegree-styleguide/css.html). When the application finds an error, the error and corresponding line number are printed in the results section. The code is printed in a blue color, the errors are printed in a red color, and the warnings are printed in a purple color. A comprehensive sample file (test.css in the folder labeled test css) is provided in the repository and can be used with the application to see what errors are found as well as the format of the output.

How to use
-----------
To run the application, open up index.html
Click the choose file button and select the CSS file you wish you check

Installion
----------
Pull the project from github and find index.html

Additional Notes
----------------
There are some cases which I cannot solve within the style guide because of the time it would take to implement. For instance, there is a case where a selector (such as .demoimage {) is suppose to be seperated by a hyphen. To solve this problem it would either take natural language processing or a trie to find where a word ends and insert a hyphen. However, even a trie couldn't solve the problem completely in the event that people make up their own words that don't exist in a dictionary.

Prospective Changes
-------------------
-Add bootstrap and other required technologies such as offline.js in order to make this more professional
-Potentially incorporate Knockout and implement a MVVM model
-Add a clear button
-Change the CSS to make it more aesthetically pleasing

Changes Log
-----------
-added comment handler
-fixed bugs for multiple file input
-changed background to be same color as udacity logo
-added a clear button