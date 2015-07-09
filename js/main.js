//will hold all of our lines
var linesArray=new Array();
var lineNumber = 1; //holds the line number to be appended at the front

window.onload = function() {
	var fileInput = document.getElementById('fileInput');
	var fileDisplayArea = document.getElementById('fileDisplayArea');
	//var lineNumber = 1; //holds the line number to be appended at the front
	var tempLineNumber = 0; //will be used to convert 1 into 01 etc.

	//called whenever the user chooses a file to upload (checks to make sure that it is a css file)
	fileInput.addEventListener('change', function(e) {
		var file = fileInput.files[0];
		var textType = /css.*/;

		if (file.type.match(textType)) {
			var reader = new FileReader();

			reader.onload = function(e) {
				fileDisplayArea.innerText = reader.result;
				//split the lines based on the new line char and store them inside our array
				var arrLines = fileDisplayArea.innerText.split("\n");
				arrLines.forEach(function (line) {
					linesArray.push(line);
			  	});
			  	//Section adds line numbers to each line of the file we are displaying
			  	fileDisplayArea.innerText = "";
			  	linesArray.forEach(function(line){
			  		if (lineNumber < 10) {
			  			tempLineNumber = "0" + lineNumber;
			  			$("#fileDisplayArea").append(tempLineNumber + " " + line + "</br>");
			  		}
			  		else
			  		{
			  			$("#fileDisplayArea").append(lineNumber + " " + line + "</br>");
			  		}
			  		lineNumber++;
			  	});
			  	//once we have pushed the lines into linesArray then we run css checker
			  	CSSChecker();
			  	//need to reset lineNumber so when we pick another file the line number resets
			  	lineNumber = 1;
			  	//reset our filereader so when they click new file it changes and doesnt append prev file
			  	//fileInput.files[0].reset();
			};
			//actually read the text file for processing
			reader.readAsText(file);
		} else {
			fileDisplayArea.innerText = "File not supported!";
		}
	});
};

function CSSChecker() {
	var foundIndentation = false; //will tell us once we find the expected indentation
	var insideASelector = false; //tells you if you are inside a selector or not
	var nextLineShouldBeEmpty = false; //tells us if the next line should be empty or not
	var insideABlockComment = false; //tells you if you are in a block comment or not
	var expectedNumSpaces = 0; //tells the number of spaces we expect
	var lineNumber = 1; //tells the line number so we can print the line of the error
	var setOfShorthand = new Set(); //contains a list of the shorthand properties we have seen so far inside a selector
	var lastBlockOpen = 0; //temp value that holds the line number for the last block comment open
	var property; //will hold the property we are looking at
	var propertyValue; //will hold the value of the property we are looking at
	var tempShortHand; //stores a temp value of the shorthand we are going to add
	var line; //will hold theline of the css we are looking at
	var resultTxt = ""; //will hold all the errors and be appended to the results id section
	var errorTxt = ""; //will hold the error found

	//go through each line to be processed
	linesArray.forEach(function(line)
	{
		//console.log(line); //prints every line to the console

		if (endsEmptySpace(line)) //no line should ever end with white space
		{
			errorTxt = lineNumber + " Ends with an empty space</br>";
            resultTxt += errorTxt;
		}

		if (nextLineShouldBeEmpty) //if the next line should be empty, check it and then set next line should be empty to false
		{
			if (line.length !== 0)
			{
				errorTxt = lineNumber + " should be empty because it followed a closing selector</br>";
            	resultTxt += errorTxt;
			}
			nextLineShouldBeEmpty = false;
		}

		//send the line to this section for further processing.
		//either the line is a selector line, closes the selector, inside a selector, or a line above the selector that continues to the selector line
		if (hasSelector(line)) //line looks like body {
		{
			if (insideASelector) //you are already inside a selector and shouldnt find another {
			{
				errorTxt = "Ran into another { before found a closing } on line " + lineNumber + "</br>";
            	resultTxt += errorTxt;
			}

			if (isConjunctionSelector(line)) //error if you find something like ul#example
			{
				errorTxt = "Using a conjunction of element names and IDs/classes " + lineNumber + "</br>";
            	resultTxt += errorTxt;
			}

			if (isIDSelector(line)) //classes should be used over IDs
			{
				errorTxt = "An ID selector is being used on " + lineNumber + " and a class should be used instead</br>";
            	resultTxt += errorTxt;
			}

			if (!hasProperSelectorFormat(line)) //must contain correct format .demo-image {
			{
				errorTxt = "Selector formatting problem on line " + lineNumber + "</br>";
            	resultTxt += errorTxt;
			}

			if (incorrectSeparateDelimiters(line)) //must use - instead of _
			{
				errorTxt = "A _ was detected in the selector and a - should be used instead on line " + lineNumber + "</br>";
            	resultTxt += errorTxt;
			}

			if (hasMultipleSelectors(line)) //h1, h2, h3 { should span multiple lines
			{
				errorTxt = "There are multiple selectors on line " + lineNumber + " and each selector should have it's own line</br>";
            	resultTxt += errorTxt;
			}

			insideASelector = true; //we are inside a selector
		}
		else if (hasClosingSelector(line)) //line looks like }
		{
			if (!insideASelector) //shouldn't run into a } before we cound a {
			{
				errorTxt = "Found a closing } but doesnt have a matching {  on line " + lineNumber + "</br>";
            	resultTxt += errorTxt;
			}

			if (!hasProperClosingSelectorFormat(line)) //should only be a } in the line
			{
				errorTxt = "Closing selector formatting problem on line " + lineNumber + "</br>";
            	resultTxt += errorTxt;
			}

			setOfShorthand.clear(); //clear the set for the next properties in the next selector
			insideASelector = false; //now that we are found a closing selector, we are no longer inside a selector
			nextLineShouldBeEmpty = true; //now that we found a closing selector, expect there to be a space on the next line
		}
		else if (line.length === 0) //will catch all the blank lines so they don't go to the section for processing properties and values
		{
		}
		else if(insideASelector) //you are inside the selector i.e. background: #fff;
		{
			property = getProperty(line);
			propertyValue = getPropertyValue(line);

			if (missingSemicolon(line) && !isIDorClass(line) && !isCommentRelated(line)) //have to add !isIDorClass(line) in case where formatting is off and .audio-block and { are on separate lines
			{
				errorTxt = "Missing a semicolon on line " + lineNumber + "</br>";
            	resultTxt += errorTxt;
			}

			if (incorrectPropertyNameStop(line)) //case where have incorrect form of property name stop i.e. a:b
			{
				errorTxt = "The format of the property and value is incorrect on line " + lineNumber + ". It should be of the form a: b</br>";
            	resultTxt += errorTxt;
			}

			if (!foundIndentation && !isIDorClass(line)) //use the first line as a baseline for every other line and indentation
			{
				expectedNumSpaces = findIndentation(line);
				foundIndentation = true;
			}

			if (findIndentation(line) != expectedNumSpaces && !isIDorClass(line)) //if the line doesn't match the same number of spaces as the first line, then indentation error
			{
				errorTxt = "The level of indentation/spaces is off on line " + lineNumber + "</br>";
            	resultTxt += errorTxt;
			}

			if (shouldAddToSet(property)) //section of code that will determine if a line can be written in shorthand or not
			{
				tempShortHand = shorthandToAdd(property); //tells you which property to add to set (given that only a couple can be written in shorthand)
				if (setOfShorthand.has(tempShortHand)) //we have already seen a shorthand property of this kind
				{
					errorTxt = "The property on line " + lineNumber + " can be written in shorthand</br>";
            		resultTxt += errorTxt;
				}
				else //haven't seen this property before
				{
					setOfShorthand.add(tempShortHand);
				}
			}

			if (!hasProperPropertyAndValueFormat(line) && !hasSingleQuotes(propertyValue) && !hasDoubleQuotes(propertyValue)) //check if it has the proper format but don't count strings for upper case
			{
				errorTxt = "Property or value has formatting problem on line " + lineNumber + "</br>";
            	resultTxt += errorTxt;
			}

			if (isZeroAndUnits(propertyValue)) // 0em; should be 0;
			{
				errorTxt = "Property value has formatting problem on line " + lineNumber + ". Values with 0 should have no units</br>";
            	resultTxt += errorTxt;
			}

			if (needsLeadingZero(propertyValue)) //if anything other than 0-9 in front of the . then error
			{
				errorTxt = "Property value has a . and should have a 0 in front of it on line " + lineNumber + "</br>";
            	resultTxt += errorTxt;
			}

			if (hasHexadecimal(propertyValue) && canReplaceHexadecimal(propertyValue)) //color: #eebbcc; is an error and should be color: #ebc;
			{
				errorTxt = "Property value has a hexadecimal value that can be rewritten as 3-characters hexadecimal notation on line " + lineNumber + "</br>";
            	resultTxt += errorTxt;
			}

			if (hasMultipleDeclarations(propertyValue)) //cases like font-weight: normal; line-height: 1.2; should span multiple lines
			{
				errorTxt = "There are multiple declarations on line " + lineNumber + " and each declaration should have its own line</br>";
            	resultTxt += errorTxt;
			}

			if (hasSingleQuotes(propertyValue)) //font-family: 'Open Sans' should be font-family: "Open Sans"
			{
				errorTxt = "There are single quotes on line " + lineNumber + " and double quotes should be used instead</br>";
            	resultTxt += errorTxt;
			}
		}
		else //section that handles lines above the selector { i.e. h1,h2,h3 should be spanning multiple lines
		{
			if (isCommentRelated(line) || insideABlockComment) // [/*] [*/] [ *] [string] are all valid ways to be related to a comment
			{
				if (startsEmptySpace(line)) //comment lines should never start with a space
				{
					errorTxt = "Comment related line shouldn't start with a space found on line " + lineNumber + "</br>";
	            	resultTxt += errorTxt;
				}

				if (foundOpenBlockComment(line)) //marking that you are inside a block comment
				{
					if (insideABlockComment) {
						errorTxt = "There was a block comment on line " + lastBlockOpen + " that was never closed</br>";
	        			resultTxt += errorTxt;
					}

					insideABlockComment = true;
					lastBlockOpen = lineNumber;
				}

				if (foundCloseBlockComment(line)) //marking that you are ending a block comment
				{
					if (!insideABlockComment)
					{
						errorTxt = "Found a closing block comment before an open block comment on line " + lineNumber + "</br>";
	            		resultTxt += errorTxt;
					}

					if (!hasCorrectCloseBlockFormat(line) && !foundOpenBlockComment(line)) //if you dont find a /* on same line as */ then then line should be empty
					{
						errorTxt = "There shouldn't be anything more on the line with a */ on line " + lineNumber + "</br>";
	            		resultTxt += errorTxt;
					}
					insideABlockComment = false;
				}
			}
			else
			{
				if (!isValidLineAboveSelector(line)) //valid lines above the selector are of the form h1,
				{
					errorTxt = "Not a valid line above a selector on line " + lineNumber + "</br>";
	            	resultTxt += errorTxt;
				}
			}
		}

		//case where you have reached the end of the file and you are still inside a block comment! needs to have a closing block comment
		if (lineNumber == linesArray.length && insideABlockComment) {
			errorTxt = "There was a block comment on line " + lastBlockOpen + " that was never closed</br>";
	        resultTxt += errorTxt;
		}

		lineNumber++;
	});

	//now that we have a string of errors, add them to the web page
	$( ".results" ).append(resultTxt);
}

function clearDisplayArea() {
	$( "#fileDisplayArea" ).empty();
	$( ".results" ).empty();
}