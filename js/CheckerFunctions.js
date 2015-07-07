//tells you whether the character is alphanumeric or not
function isAlphaNumeric(char)
{
  var code, i, len;

  for (i = 0, len = char.length; i < len; i++) {
    code = char.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

//tells you whether the character is alpha or not
function isAlpha(char)
{
  var code, i, len;

  for (i = 0, len = char.length; i < len; i++) {
    code = char.charCodeAt(i);
    if (!(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

//tells you whether the character is a number or not
function isDigit(char)
{
  var code, i, len;

  for (i = 0, len = char.length; i < len; i++) {
    code = char.charCodeAt(i);
    if (!(code > 47 && code < 58)) // numeric (0-9)
    {
      return false;
    }
  }
  return true;
};

//tells if the string has an upper case character or not
function hasUpper (input)
{
	for (var i = 0; i < input.length; i++)
	{
		if (isAlpha(input.charAt(i)) && input.charAt(i) === input.charAt(i).toUpperCase())
		{
			//console.log(input.charAt(i) + ' ' + input.charAt(i).toUpperCase());
			return true;
		}
	}

	return false;
}

//tells if the string has a colon or not
function hasColon (input)
{
	if (input.indexOf(":") != -1)
	{
		return true;
	}
	else
		return false;
}

//checks that that there is a space before the curly and there is no empty space after
function curlyAndSpaceChecker(input)
{
	if(input.length < 3 || input[input.length-1] != '{')
		return false;

	var curlyPosition = input.indexOf("{");
	if (input[curlyPosition-1] == ' ' && input[curlyPosition-2] != ' ')
	{
		return true;
	}
	else
		return false;
}

//checks if there is any empty space at the end of the string
function endsEmptySpace(input)
{
	if (input.length > 0 && input[input.length-1] == ' ')
	{
		return true;
	}
	else
		return false;
}

//checks if the string starts with an empty space
function startsEmptySpace(input)
{
	if (input.length > 0 && input[0] == ' ')
	{
		return true;
	}
	else
		return false;
}

//tells us if the line we are looking at is a selector
function hasSelector (input)
{
	if (input.length > 0 && input.indexOf("{") != -1)
	{
		return true;
	}
	else
		return false;
}

//tells you when you find a closing selector }
function hasClosingSelector (input)
{
	if (input.length > 0 && input.indexOf("}") != -1)
	{
		return true;
	}
	else
		return false;
}

//checks the format of the opening selector (doesn't have a capital, doesn't start with a space, and has the correct format for a {)
function hasProperSelectorFormat(input)
{
	if (hasUpper(input) || startsEmptySpace(input))
	{
		return false;
	}

	if (curlyAndSpaceChecker(input))
	{
		return true;
	}

	return false;
}

//checks the format of the closing selector || it shouldnt be more than }
function hasProperClosingSelectorFormat(input)
{
	if (input.length > 1)
	{
		return false;
	}
	else
		return true;
}

//returns the property of the line (i.e. margin, background, etc.)
function getProperty(input)
{
	var colonPosition = input.indexOf(":");
	if (input.length > 0 && colonPosition != -1) //return everything up to the :
	{
		return input.substr(0, colonPosition);
	}
	else //couldn't find a : inside the line
		return "";
}

//returns the property value of the line (i.e. #fff, 0.8, etc.)
function getPropertyValue(input)
{
	var colonPosition = input.indexOf(":");
	if (input.length > 0 && colonPosition != -1) //return everything up to the :
	{
		return input.substr(colonPosition+1);
	}
	else //couldn't find a : inside the line
		return "";
}

//checks the format of the line with a property and property value
function hasProperPropertyAndValueFormat(input)
{
	if (input.length == 0 || hasUpper(input))
	{
		return false;
	}

	return true;
}

//finds how many spaces there are in the line before the text
function findIndentation(input)
{
	var count = 0;

	if (input.length == 0)
	{
		return 0;
	}

	while(input[count] == ' ')
	{
		count++;
	}

	return count;
}

//tells you if you have a conjunction of element names and Ids/classes
function isConjunctionSelector(input)
{
	var foundPeriod = input.indexOf('.');
	var foundHash = input.indexOf('#');
	//return true when find a . or # within the selector AND its not at the beginning
	if (input.length > 0 && ((foundPeriod != -1 && foundPeriod!=0) || (foundHash != -1 && foundHash!=0)))
	{
		return true;
	}
	else
		return false;
}

//Tells you if the line is an id selector
function isIDSelector (input)
{
	if (input.length > 0 && input[0] == '#')
	{
		return true;
	}
	else
		return false;
}

//tells you if you should add an item to the set containing one of the options that can be written in shorthand
function shouldAddToSet(input)
{
	if (input.length > 0 && (input.indexOf("background") != -1 || input.indexOf("border")!= -1
		|| input.indexOf("margin")!= -1 || input.indexOf("overflow")!= -1
		|| input.indexOf("padding")!= -1 || input.indexOf("list-style")!= -1
		|| input.indexOf("animation")!= -1 || input.indexOf("indexOf")!= -1))
	{
		return true;
	}
	else
		return false;
}

//tells you which string to add to the set based on what we find within the string
function shorthandToAdd (input)
{
	if (input.indexOf("background") != -1)
	{
		return "background";
	}
	else if (input.indexOf("border")!= -1)
	{
		return "border";
	}
	else if (input.indexOf("margin")!= -1)
	{
		return "margin";
	}
	else if (input.indexOf("overflow")!= -1)
	{
		return "overflow";
	}
	else if (input.indexOf("padding")!= -1)
	{
		return "padding";
	}
	else if (input.indexOf("list-style")!= -1)
	{
		return "list-style";
	}
	else if (input.indexOf("animation")!= -1)
	{
		return "animation";
	}
	else if (input.indexOf("transition")!= -1)
	{
		return "transition";
	}
	else
		return "";
}

//helper function used in isZeroandUnits that tells you how many numerical characters there are in a string
function howManyNum(input)
{
	var count = 0;
	for (var i = 0; i < input.length; i++)
	{
		if (isDigit(input[i]))
		{
			count++;
		}
	}
	return count;
}

//helper function used in isZeroandUnits that checks whether the string has 0 inside of it or not
function hasZero(input)
{
	if (input.length > 0 && input.indexOf("0") != -1)
	{
		return true;
	}
	else
	{
		return false;
	}
}

//helper function used in isZeroandUnits that tells you whether or not the string has an alpha character in it or not
function hasAlpha(input)
{
	for (var i = 0; i < input.length; i++)
	{
		if (isAlpha(input[i]))
		{
			return true;
		}
	}
	return false;
}

//tells you if you have something like margin: 0em;
function isZeroAndUnits(propertyValue)
{
	if (propertyValue.length > 0 && howManyNum(propertyValue) == 1 && hasZero(propertyValue) && hasAlpha(propertyValue))
	{
		return true;
	}
	else
	{
		return false;
	}
}

//tells you if you have something like .8em; and should add a 0 to the start
function needsLeadingZero(propertyValue)
{
	var periodPosition = propertyValue.indexOf('.');

	if (propertyValue.length > 0 && periodPosition != -1 && periodPosition != 0)
	{
		console.log(propertyValue[periodPosition-1] + "hi");
		if(isDigit(propertyValue[periodPosition-1])) //if we find 0-9, then it is valid to be put in front of a .
		{
			return false;
		}
		else
		{
			return true;
		}
	}
	else //if don't find period then no point in even checking
	{
		return false;
	}
}

//tells you if there is a hexadecimal in the property value or not
function hasHexadecimal (propertyValue)
{
	if (propertyValue.length > 0 && propertyValue.indexOf('#') != -1)
	{
		return true;
	}
	else
		return false;
}

//tells you if you can replace the string with hexadecimal or not || guaranteed to get a # as an input || based on the fact that hex value will be last
function canReplaceHexadecimal (input)
{
	var semicolonPostion = input.indexOf(';');
	var hexPostion = input.indexOf('#');
	var difference = semicolonPostion - hexPostion;
	var hexString = input.substr(hexPostion+1, difference-1);

	if (hexString.length == 3) //can't replace #eee only #eeeeee
	{
		return false;
	}
	else //its not already of length 3, so we need to see if we can reduce it or not
	{
		if(hexString.length == 6) //go through it in pairs, and if at any point the two next to each other arent the same, then  return false;
		{
			for (var i = 0; i < hexString.length; i+=2)
			{
				if (hexString[i] != hexString[i+1])
				{
					return false;
				}
			}
			return true;
		}
		else
			return false;
	}
}

//tells you if you have incorrect delimiters in the name i.e. hello_bye
function incorrectSeparateDelimiters(input)
{
	if (input.length > 0 && input.indexOf('_') != -1)
	{
		return true;
	}
	else
		return false;
}

//tells you if you are missing a semi colon or not || all lines inside a selector should end in a semi colon
function missingSemicolon(input)
{
	if (input.length > 0 && input.indexOf(';') != -1)
	{
		return false;
	}
	else //couldn't find a semicolon
		return true;
}

//tells us if this is a class or id line
function isIDorClass (input)
{
	if (input.length > 0 && (input[0] == '.' || input[0] == '#'))
	{
		return true;
	}
	else
		return false;
}

//we are inside a selector so we are guaranteed a : exists and check to see if the format is anything other than a: b
function incorrectPropertyNameStop (input)
{
	var colonPosition = input.indexOf(':');
	if (colonPosition != -1 && (input[colonPosition-1] == ' ' || input[colonPosition+1] != ' ')) //there has to be no space before hand AND a space after in order to be proper format
	{
		return true;
	}
	else
		return false;

}

//if we find even a single comma, we know that there must be multiple selectors
function hasMultipleSelectors (input)
{
	var commaPosition = input.indexOf(',');
	if (commaPosition != -1)
	{
		return true;
	}
	else //there is no , and hence there cannot be multiple selectors
		return false;
}

//if we find multiple ; we know there are multiple declarations || finding 1 is not enough
function hasMultipleDeclarations(input)
{
	var firstSemiColon = input.indexOf(';');
	var lastSemiColon = input.lastIndexOf(';');
	if (firstSemiColon != lastSemiColon) //we found at LEAST two semicolons and they are in different positions
	{
		return true;
	}
	else
	{
		return false;
	}
}

//based on the assumption that there will never be just a ' alone and that they will always come in pairs! also based on the assumption that people won't use ' unless it is to surround a string
function hasSingleQuotes(input)
{
	var quotePosition = input.indexOf('\'');
	if (quotePosition != -1)
	{
		return true;
	}
	else
		return false;
}

//tells you if the string has double quotes inside of it
function hasDoubleQuotes(input)
{
	var quotePosition = input.indexOf('"');
	if (quotePosition != -1)
	{
		return true;
	}
	else
		return false;
}

//tells you if the line above the selector is valid or not || the only acceptable format is something like h1,
function isValidLineAboveSelector(input)
{
	var commaPosition = input.indexOf(',');
	if (commaPosition != -1 && input[input.length-1] == ',')
	{
		return true;
	}
	else
		return false;
}