var linesArray=new Array(); //will hold all of our lines
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
var lineToPrint = ""; //line from the code with a number at the front and errors at the end. i.e. 01 LINE-HERE ERROR-HERE
var resultTxt = ""; //will hold all the errors and be appended to the results id section
var errorTxt = ""; //will hold the error found
var fileInput = document.getElementById('fileInput');
var fileDisplayArea = document.getElementById('fileDisplayArea');

window.onload = function() {
	//var tempLineNumber = 0; //will be used to convert 1 into 01 etc.

	//called whenever the user chooses a file to upload (checks to make sure that it is a css file)
	fileInput.addEventListener('change', function(e) {
		var tempLineNumber = 0; //will be used to convert 1 into 01 etc.
		lineNumber = 1;
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
			  	//clear the display area
			  	fileDisplayArea.innerText = "";
			  	//send each line through CSSChecker in order to be processed
			  	linesArray.forEach(function(line){
			  		CSSChecker(line);
			  	});

			  	//now that we are done processing the array, clear the contents for the next file to be read
			  	linesArray = [];
			  	//nextLineShouldBeEmpty needs to be reset because we are looking at a new file
			  	nextLineShouldBeEmpty = false;
			};
			//actually read the text file for processing
			reader.readAsText(file);
		}
		else {
			fileDisplayArea.innerText = "File not supported!";
		}
	});
};

function CSSChecker(line) {
	if (endsEmptySpace(line)) //no line should ever end with white space
	{
		errorTxt = lineNumber + " Ends with an empty space";
        lineToPrint += " " + errorTxt;
	}

	if (nextLineShouldBeEmpty) //if the next line should be empty, check it and then set next line should be empty to false
	{
		if (line.length !== 0)
		{
			errorTxt = lineNumber + " should be empty because it followed a closing selector";
        	lineToPrint += " " + errorTxt;
		}
		nextLineShouldBeEmpty = false;
	}

	//send the line to this section for further processing.
	//either the line is a selector line, closes the selector, inside a selector, or a line above the selector that continues to the selector line
	if (hasSelector(line)) //line looks like body {
	{
		if (insideASelector) //you are already inside a selector and shouldnt find another {
		{
			errorTxt = "Ran into another { before found a closing } on line " + lineNumber;
        	lineToPrint += " " + errorTxt;
		}

		if (isConjunctionSelector(line)) //error if you find something like ul#example
		{
			errorTxt = "Using a conjunction of element names and IDs/classes " + lineNumber;
        	lineToPrint += " " + errorTxt;
		}

		if (isIDSelector(line)) //classes should be used over IDs
		{
			errorTxt = "An ID selector is being used on " + lineNumber + " and a class should be used instead";
        	lineToPrint += " " + errorTxt;
		}

		if (!hasProperSelectorFormat(line)) //must contain correct format .demo-image {
		{
			errorTxt = "Selector formatting problem on line " + lineNumber;
        	lineToPrint += " " + errorTxt;
		}

		if (incorrectSeparateDelimiters(line)) //must use - instead of _
		{
			errorTxt = "<span class = 'warning'>A _ was detected in the selector and a - should be used instead on line " + lineNumber + "</span>";
        	lineToPrint += " " + errorTxt;
		}

		if (hasMultipleSelectors(line)) //h1, h2, h3 { should span multiple lines
		{
			errorTxt = "There are multiple selectors on line " + lineNumber + " and each selector should have it's own line";
        	lineToPrint += " " + errorTxt;
		}

		insideASelector = true; //we are inside a selector
	}
	else if (hasClosingSelector(line)) //line looks like }
	{
		if (!insideASelector) //shouldn't run into a } before we cound a {
		{
			errorTxt = "Found a closing } but doesnt have a matching {  on line " + lineNumber;
        	lineToPrint += " " + errorTxt;
		}

		if (!hasProperClosingSelectorFormat(line)) //should only be a } in the line
		{
			errorTxt = "Closing selector formatting problem on line " + lineNumber;
        	lineToPrint += " " + errorTxt;
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
			errorTxt = "Missing a semicolon on line " + lineNumber;
        	lineToPrint += " " + errorTxt;
		}

		if (incorrectPropertyNameStop(line)) //case where have incorrect form of property name stop i.e. a:b
		{
			errorTxt = "The format of the property and value is incorrect on line " + lineNumber + ". It should be of the form a: b";
        	lineToPrint += " " + errorTxt;
		}

		if (!foundIndentation && !isIDorClass(line)) //use the first line as a baseline for every other line and indentation
		{
			expectedNumSpaces = findIndentation(line);
			foundIndentation = true;
		}

		if (findIndentation(line) != expectedNumSpaces && !isIDorClass(line)) //if the line doesn't match the same number of spaces as the first line, then indentation error
		{
			errorTxt = "The level of indentation/spaces is off on line " + lineNumber;
        	lineToPrint += " " + errorTxt;
		}

		if (shouldAddToSet(property)) //section of code that will determine if a line can be written in shorthand or not
		{
			tempShortHand = shorthandToAdd(property); //tells you which property to add to set (given that only a couple can be written in shorthand)
			if (setOfShorthand.has(tempShortHand)) //we have already seen a shorthand property of this kind
			{
				errorTxt = "The property on line " + lineNumber + " can be written in shorthand";
        		lineToPrint += " " + errorTxt;
			}
			else //haven't seen this property before
			{
				setOfShorthand.add(tempShortHand);
			}
		}

		if (!hasProperPropertyAndValueFormat(line) && !hasSingleQuotes(propertyValue) && !hasDoubleQuotes(propertyValue)) //check if it has the proper format but don't count strings for upper case
		{
			errorTxt = "Property or value has formatting problem on line " + lineNumber;
        	lineToPrint += " " + errorTxt;
		}

		if (isZeroAndUnits(propertyValue)) // 0em; should be 0;
		{
			errorTxt = "Property value has formatting problem on line " + lineNumber + ". Values with 0 should have no units";
        	lineToPrint += " " + errorTxt;
		}

		if (needsLeadingZero(propertyValue)) //if anything other than 0-9 in front of the . then error
		{
			errorTxt = "Property value has a . and should have a 0 in front of it on line " + lineNumber;
        	lineToPrint += " " + errorTxt;
		}

		if (hasHexadecimal(propertyValue) && canReplaceHexadecimal(propertyValue)) //color: #eebbcc; is an error and should be color: #ebc;
		{
			errorTxt = "Property value has a hexadecimal value that can be rewritten as 3-characters hexadecimal notation on line " + lineNumber;
        	lineToPrint += " " + errorTxt;
		}

		if (hasMultipleDeclarations(propertyValue)) //cases like font-weight: normal; line-height: 1.2; should span multiple lines
		{
			errorTxt = "There are multiple declarations on line " + lineNumber + " and each declaration should have its own line";
        	lineToPrint += " " + errorTxt;
		}

		if (hasSingleQuotes(propertyValue)) //font-family: 'Open Sans' should be font-family: "Open Sans"
		{
			errorTxt = "There are single quotes on line " + lineNumber + " and double quotes should be used instead";
        	lineToPrint += " " + errorTxt;
		}
	}
	else //section that handles lines above the selector { i.e. h1,h2,h3 should be spanning multiple lines && comments
	{
		if (isCommentRelated(line) || insideABlockComment) // [/*] [*/] [ *] [string] are all valid ways to be related to a comment
		{
			if (startsEmptySpace(line)) //comment lines should never start with a space
			{
				errorTxt = "Comment related line shouldn't start with a space found on line " + lineNumber;
            	lineToPrint += " " + errorTxt;
			}

			if (foundOpenBlockComment(line)) //marking that you are inside a block comment
			{
				if (insideABlockComment) { //case where you found an open block comment before you found a closing one
					errorTxt = "There was a block comment on line " + lastBlockOpen + " that was never closed";
        			lineToPrint += " " + errorTxt;
				}

				insideABlockComment = true;
				lastBlockOpen = lineNumber;
			}

			if (foundCloseBlockComment(line)) //marking that you are ending a block comment
			{
				if (!insideABlockComment) //case where you found a closing block comment before you found an opening block comment
				{
					errorTxt = "Found a closing block comment before an open block comment on line " + lineNumber;
            		lineToPrint += " " + errorTxt;
				}

				if (!hasCorrectCloseBlockFormat(line) && !foundOpenBlockComment(line)) //if you dont find a /* on same line as */ then then line should be empty
				{
					errorTxt = "There shouldn't be anything more on the line with a */ on line " + lineNumber;
            		lineToPrint += " " + errorTxt;
				}
				insideABlockComment = false;
			}
		}
		else
		{
			if (!isValidLineAboveSelector(line)) //valid lines above the selector are of the form h1,
			{
				errorTxt = "Not a valid line above a selector on line " + lineNumber;
            	lineToPrint += " " + errorTxt;
			}
		}
	}

	//case where you have reached the end of the file and you are still inside a block comment! needs to have a closing block comment
	if (lineNumber == linesArray.length && insideABlockComment) {
		errorTxt = "There was a block comment on line " + lastBlockOpen + " that was never closed";
        lineToPrint += " " + errorTxt;
	}

	//now that we have a line with all the info appened, append it to the filedisplayarea
	if (lineNumber < 10) {
		tempLineNumber = "0" + lineNumber;
		$("#fileDisplayArea").append(tempLineNumber + " <span class = 'fromFile'>" + line + "</span> <span class = 'errors'>" + lineToPrint + "</span></br>");
	}
	else
	{
		$("#fileDisplayArea").append(lineNumber + " <span class = 'fromFile'>" + line + "</span> <span class = 'errors'>" + lineToPrint + "</span></br>");
	}

	lineNumber++;
	lineToPrint = ""; //reset line to print for the next line of errors
}

function clearDisplayArea() {
	$( "#fileDisplayArea" ).empty();
	$( ".results" ).empty();
	lineNumber = 1; //reset the numbers so when the next file is picked the numbers reset
}