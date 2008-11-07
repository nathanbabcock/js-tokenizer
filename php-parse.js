// the namespace
var tokenizer = {
  tokenize:function(input){
    currentChar=0;
    tokens=[["PROG_START",undefined]]; // A dummy array element to initialize the structure of our tokens array
    // The token array has an element for each token. Each token as 2-3 elements:
    // the first is the name of the token, which can be STR_LIT, NUM_LIT, COMMENT,
    // PUNCT (any special character operator like +, /=, %, etc), REGEX_LIT, 
    // KEY (keyword), IDENT (identifyer). The second element is the value of the token.
    // The third element is optional, and contains additional information about the token.
    // For example, in numeric literals, the third element would be the type of number.
    
    // HELPER FUNCTIONS/VARS:
    // These 4 variables are for use with floating point decimals
    var alreadyPlus=false;
    var alreadyMinus=false;
    var alreadyE=false;
    var alreadyNum=false;
    function isalpha(character){ // Checks for an alphabetical character
      var alphas=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
      for(var i in alphas){
        if(alphas[i]===character.toLowerCase()) return true;
      }
      return false; // we won't get to this point if its an alpha - it will already have returned true
    }
    function isnum(character){ // a one-line to check for a number
      return character==="0" || character==="1" || character==="2" || character==="3" || character==="4" || character==="5" || character==="6" || character==="7" || character==="8" || character==="9";
    }
    function precedingBackslashes(input,charindex){ // A function to check the number of backslashes preceding a character in a string. For use with regex's and strings.
      for(var i=1; i<=input.length; i++){
        if(i===charindex-1) return i;
        else if(input.charAt(charindex-i)!=="\\") return i-1;
      }
    }
    function iswhitespace(character){ // One-liner checking for whitespace (spaces, newlines, carriage returns, and tabs)
      return character===" " || character==="\n" || character==="\r" || character==="\t";
    }
    function iskeyword(word){ // Checks for javascript keyword OR reserved word
      var keywords=["break","case","catch","continue","default","delete","do","else","false","finally","for","function","if","in","instanceof","new","null","undefined","return","switch","this","throw","true","try","typeof","var","void","while","with",/*other reserved words:*/"abstract","boolean","byte","char","class","const","debugger","double","enum","export","extends","final","float","goto","implements","import","int","interface","long","native","package","private","protected","public","short","static","super","synchronized","throws","transient","volatile"];
      for(i in keywords){
        if(word===keywords[i]) return true;
      }
      return false;
    }
    tokens: // This is a label for our loop, so that when we have nested loops we can use continue and break keywords on this loop, not the inner one
    for(currentChar=0;currentChar<input.length;){ // loops through all characters in the input
      if(iswhitespace(input.charAt(currentChar))){ // Checks for and skips whitespace
        currentChar++;continue tokens;
      }
      // On this line we check for both strings and comments, and then narrow it down.
      // This is because strings are so similar to comments. A comment in a string isn't
      // a comment, and a string in a comment isn't a string.
      else if(input.charAt(currentChar)==='"' || input.charAt(currentChar)==="'" || input.charAt(currentChar)+input.charAt(currentChar+1)==="/*" || input.charAt(currentChar)+input.charAt(currentChar+1)==="//"){
        if(input.charAt(currentChar)==='"'){ // Double quote strings
          tokens.push(["STR_LIT","\"","DOUBLE"]);currentChar++;
          for(;;){ // infinite loop, it will be broken when we get to an unescaped ".
            if(input.charAt(currentChar)!=='"'){
              // update the value of the token
              if(currentChar!==input.length){ // Without this check, if there is an unterminated string literal the script would loop infinitely
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
              else{
                break tokens;
              }
            }
            else{
              if(precedingBackslashes(input,currentChar)%2===0){
                // precedingBackslashes() checks for the number of backslashes before a position in the string, and returns the number.
                // The modulo (%) divides the number by 2 and returns the remainder. If the number is divisible by 2 with no remainder, it is even.
                // An even number of backslashes preceding a quote is actually a number of escaped backslashes, not effecting the quote itself. An odd number IS effecting the quote.
                // For example, alert("\\\\") would give an alert box containing "\\". alert("\\\") would return a syntax error, because it is escaping the second quote.
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;continue tokens;
              }
              else{ // if its odd, it is effecting the quote, so we treat it like its not a quote
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
            }
          }
        }
        else if(input.charAt(currentChar)==="'"){ // Single quote. Same process as double quote, so refer above for the comments.
          tokens.push(["STR_LIT","'",'SINGLE']);currentChar++;
          for(;;){
            if(input.charAt(currentChar)!=="'"){
              if(currentChar!==input.length){
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
              else{
                break tokens;
              }
            }
            else{
              if(precedingBackslashes(input,currentChar)%2===0){
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;continue tokens;
              }
              else{
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
            }
          }
        }
        else if(input.charAt(currentChar)+input.charAt(currentChar+1)==="//"){ // single-line comments
          tokens.push(["COMMENT","//","SINGLE_LINE"]);currentChar+=2;
          for(;;){
            if(input.charAt(currentChar)!=="\n" && input.charAt(currentChar)!=="\r" && currentChar!==input.length){
              tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
            }
            else{
              continue tokens;
            }
          }
        }
        else if(input.charAt(currentChar)+input.charAt(currentChar+1)==="/*"){ // multi-line comments
          tokens.push(["COMMENT","/*","MULTI_LINE"]);currentChar+=2;
          for(;;){
            if(input.charAt(currentChar)+input.charAt(currentChar+1)!=="*/"){
              if(currentChar!=input.length){
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
              else{
                break tokens;
              }
            }
            else{
              tokens[tokens.length-1][1]+="*/";currentChar+=2;continue tokens;
            }
          }
        }
      }
      else if(isnum(input.charAt(currentChar))){ // If the first character is a number (number literal)
        tokens.push(["NUM_LIT",input.charAt(currentChar)]);currentChar++;
        if(input.charAt(currentChar-1)==="0"){ // if its followed by a zero
          if(input.charAt(currentChar).toLowerCase()==="x"){currentChar++;// 0x? hexadecimal
            tokens[tokens.length-1][1]+=input.charAt(currentChar-1);tokens[tokens.length-1][2]="HEX";
            for(;;){ // We don't need the end-of-input check here because it will automatically end when it sees a non-alpha/num character
              if(isalpha(input.charAt(currentChar)) || isnum(input.charAt(currentChar))){
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
              else{
              continue tokens;
              }
            }
          }
          else if(isnum(input.charAt(currentChar))){currentChar++; // 0#? Octal.
            tokens[tokens.length-1][1]+=input.charAt(currentChar-1);tokens[tokens.length-1][2]="OCT";
            for(;;){
              if(isnum(input.charAt(currentChar))){
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
              else{
                continue tokens;
              }
            }
          } // 0.? Floating-point decimal
          // Floating point decimals will appear several more times throughout the script, but it will be commented in full only here
          else if(input.charAt(currentChar)==="."){tokens[tokens.length-1][1]+=".";tokens[tokens.length-1][2]="FP";currentChar++; // 0.? Floating point.
            // Initialize/reinitialize some variables we'll need later
            alreadyE=false; // Is there already an E (or e)?
            alreadyMinus=false; // Is there already a minus after the E?
            alreadyPlus=false; // Is there already a plus after the E?
            alreadyNum=false; // Are there already numbers after the E?
            for(;;){
              // Checks for some sort of FP Dec char
              if(isnum(input.charAt(currentChar)) || input.charAt(currentChar).toLowerCase()==="e" || input.charAt(currentChar)==="+" || input.charAt(currentChar)==="-"){
                if(input.charAt(currentChar).toLowerCase()==="e"){ // If we find an E, make alreadyE true
                  alreadyE=true;
                }
                if(input.charAt(currentChar)==="+" || input.charAt(currentChar)==="-"){ // if theres a plus/minus we need to check whether its an operation or a positive/negative after an exponent (eg 0.232E-6)
                  if(alreadyNum===true){ // If there are already numbers after the E, this plus/minus cannot be a pos/neg sign, it must be an operator, so we continue the tokens loop without advancing to current char.
                    continue tokens;
                  }
                  else if(input.charAt(currentChar)==="+"){ // Now we have to specify it further down to just plus
                    if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){continue tokens;} // If theres already a plus or minus sign, or there isn't even an E yet, its not part of the decimal. Continue the loop.
                    else{tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;alreadyPlus=true;} // Otherwise it is part of the decimal, so set alreadyPlus to true
                  }
                  else if(input.charAt(currentChar)==="-"){ // Same thing as above but with minus
                    if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){continue tokens;}
                    else{tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;alreadyMinus=true;}
                  }
                }
                else if(isnum(input.charAt(currentChar)) && alreadyE===true){ // If theres a number and its after the E, set alreadyNum = true.
                  alreadyNum=true;tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
                }
                else{ // No minus, no plus, no e before it (since we're still in the if that checks for some kind of FP Dec char, this must be a number).
                  tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
                }
              }
              else{ // Not an FP dec char? continue the loop.
                continue tokens;
              }
            }
          }
          else{ // must be a single zero
            tokens[tokens.length-1][2]="INT";continue tokens;
          }
        }
        else{tokens[tokens.length-1][2]="INT"; // doesn't start with 0
          alreadyE=false;
          alreadyMinus=false;
          alreadyPlus=false;
          alreadyNum=false;
          for(;;){
            if(input.charAt(currentChar)==="."){ // If it has a decimal, its an FP dec, so do the whole check again (commented in full above)
              tokens[tokens.length-1][2]="FP";
              if(input.charAt(currentChar).toLowerCase()==="e"){
                  alreadyE=true;tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
              if(input.charAt(currentChar)==="+" || input.charAt(currentChar)==="-"){
                if(alreadyNum===true){
                  continue tokens;
                }
                else if(input.charAt(currentChar)==="+"){
                  if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){continue tokens;}
                  else{tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;alreadyPlus=true;}
                }
                else if(input.charAt(currentChar)==="-"){
                  if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){continue tokens;}
                  else{tokens[tokens.length][1]+=input.charAt(currentChar);currentChar++;alreadyMinus=true;}
                }
              }
              else if(isnum(input.charAt(currentChar)) && alreadyE===true){
                alreadyNum=true;tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
              else{
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
            }
            else if(isnum(input.charAt(currentChar))){ // Otherwise if its just a normal character, add the char to the array and keep going
              tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
            }
            else{ // If not either, continue the loop
              continue tokens;
            }
          }
        }
      }
      // Identifyers
      // If its starts with a number, $, or _, its an identifyer (or keyword, we'll perform that check in a moment)
      else if(isalpha(input.charAt(currentChar)) || input.charAt(currentChar)==="$" || input.charAt(currentChar)==="_"){
        tokens.push(["IDENT",input.charAt(currentChar)]);currentChar++;
        for(;;){
          if(input.charAt(currentChar)==="$" || input.charAt(currentChar)==="_" || isalpha(input.charAt(currentChar)) || isnum(input.charAt(currentChar))){
            tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
          }
          else{ // Once the whole identifyer has been recorded in the array and we come across a different character, first check whether the indentifyer is actually a keyword, and then continue the loop
            if(iskeyword(tokens[tokens.length-1][1])){
              tokens[tokens.length-1][0]="KEY";
            }
            continue tokens;
          }
        }
      }
      else if(input.charAt(currentChar)!=="/"){ // Everything else EXCEPT slashes (after this step we will have completed everything except division, division assignment, and regex literals)
        // Because of the way this tokenizer operates, this step is 223 lines long, but it will completely identify every punctuator
        // Punctuator, or punctuation, is simply a loose definition for all the operators and such that are made up of special characters
        // The first case of the first switch statement will be commented, but commenting all the following lines would be redundant, its just the same thing with many different punctuators
        switch(input.charAt(currentChar)){
          case "=": // If the current character is an =
            currentChar++; // advance the char
            if(input.charAt(currentChar)==="="){ // If there's another equal sign
              currentChar++; // advance again
              if(input.charAt(currentChar)==="="){ // If there's a third equal sign
                tokens.push(["PUNCT","==="]);currentChar++;continue tokens; // Its the identity operator. Advance the currentChar and continue the loop.
              }
              else{ // Otherwise its just equality (==)
                tokens.push(["PUNCT","=="]);continue tokens; // DONT advance the char but continue the loop
              }
            }
            else{ // Otherwise, its assignment (=)
              tokens.push(["PUNCT","="]);continue tokens; // DONT advance the char but continue the loop
            }
            break;
          case ">": // This is the most complex step in all the punctuators, because of all the possibilities begenning with >: >, >=, >>, >>=, >>>, & >>>=
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT",">="]);currentChar++;continue tokens;
            }
            else if(input.charAt(currentChar)===">"){
              currentChar++;
              if(input.charAt(currentChar)===">"){
                currentChar++;
                if(input.charAt(currentChar)==="="){
                  tokens.push(["PUNCT",">>>="]);currentChar++;continue tokens;
                }
                else{
                  tokens.push(["PUNCT",">>>"]);continue tokens;
                }
              }
              else if(input.charAt(currentChar)==="="){
                tokens.push(["PUNCT",">>="]);currentChar++;continue tokens;
              }
              else{tokens.push(["PUNCT",">>"]);continue tokens;}
            }
            else{tokens.push(["PUNCT",">"]);continue tokens;}
            break;
          case "<":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","<="]);currentChar++;continue tokens;
            }
            else if(input.charAt(currentChar)==="<"){
              currentChar++
              if(input.charAt(currentChar)==="="){
                tokens.push(["PUNCT","<<="]);currentChar++;continue tokens;
              }
              else{
                tokens.push(["PUNCT","<<"]);continue tokens;
              }
            }
            else{
              tokens.push(["PUNCT","<"]);continue tokens;
            }
            break;
          case "+":
            currentChar++;
            if(input.charAt(currentChar)==="+"){
              tokens.push(["PUNCT","++"]);currentChar++;continue tokens;
            }
            else if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","+="]);currentChar++;continue tokens;
            }
            else{
              tokens.push(["PUNCT","+"]);continue tokens;
            }
            break;
          case "-":
            currentChar++;
            if(input.charAt(currentChar)==="-"){
              tokens.push(["PUNCT","--"]);currentChar++;continue tokens;
            }
            else if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","-="]);currentChar++;continue tokens;
            }
            else{
              tokens.push(["PUNCT","-"]);continue tokens;
            }
            break;
          case "*":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","*="]);currentChar++;continue tokens;
            }
            else{
              tokens.push(["PUNCT","*"]);continue tokens;
            }
            break;
          // No division here, because of regex literals it requires its own section
          case "%":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","%="]);currentChar++;continue tokens;
            }
            else{
              tokens.push(["PUNCT","%"]);continue tokens;
            }
            break;
          case "&":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","&="]);currentChar++;continue tokens;
            }
            else if(input.charAt(currentChar)==="&"){
              tokens.push(["PUNCT","&&"]);currentChar++;continue tokens;
            }
            else{
              tokens.push(["PUNCT","&"]);continue tokens;
            }
            break;
          case "|":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","|="]);currentChar++;continue tokens;
            }
            else if(input.charAt(currentChar)==="|"){
              tokens.push(["PUNCT","||"]);currentChar++;continue tokens;
            }
            else{
              tokens.push(["PUNCT","|"]);continue tokens;
            }
            break;
          case "^":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","^="]);currentChar++;continue tokens;
            }
            else{
              tokens.push(["PUNCT","^"]);continue tokens;
            }
            break;
          case "!":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              currentChar++;
              if(input.charAt(currentChar)==="="){
                tokens.push(["PUNCT","!=="]);currentChar++;continue tokens;
              }
              else{
                tokens.push(["PUNCT","!="]);continue tokens;
              }
            }
            else{
              tokens.push(["PUNCT","!"]);continue tokens;
            }
            break;
          case "~":
            tokens.push(["PUNCT","~"]);currentChar++;continue tokens;
            break;
          case "?": // We tokenize the ?: (tertiary operator) in two parts, not as a whole
            tokens.push(["PUNCT","?"]);currentChar++;continue tokens;
          case ":":
            tokens.push(["PUNCT",":"]);currentChar++;continue tokens;
            break;
          case ",":
            tokens.push(["PUNCT",","]);currentChar++;continue tokens;
            break;
          case "{":
            tokens.push(["PUNCT","{"]);currentChar++;continue tokens;
            break;
          case "}":
            tokens.push(["PUNCT","}"]);currentChar++;continue tokens;
            break;
          case "(":
            tokens.push(["PUNCT","("]);currentChar++;continue tokens;
            break;
          case ")":
            tokens.push(["PUNCT",")"]);currentChar++;continue tokens;
            break;
          case "[":
            tokens.push(["PUNCT","["]);currentChar++;continue tokens;
            break;
          case "]":
            tokens.push(["PUNCT","]"]);currentChar++;continue tokens;
            break;
          case ";":
            tokens.push(["PUNCT",";"]);currentChar++;continue tokens;
            break;
          case ".": // The only one that doesn't follow the pattern of all the previous; it could either be a FP dec or a dot operator
            currentChar++;
            // If theres a number, we immediately know that its an FP Dec, so go through the usual routine
            if(isnum(input.charAt(currentChar))){tokens.push(["NUM_LIT","."+input.charAt(currentChar),"FP"]);currentChar++;
              alreadyE=false;
              alreadyMinus=false;
              alreadyPlus=false;
              alreadyNum=false;
              for(;;){
                if(isnum(input.charAt(currentChar)) || input.charAt(currentChar).toLowerCase()==="e" || input.charAt(currentChar)==="+" || input.charAt(currentChar)==="-"){
                  if(input.charAt(currentChar).toLowerCase()==="e"){
                    alreadyE=true;
                  }
                  if(input.charAt(currentChar)==="+" || input.charAt(currentChar)==="-"){
                    if(alreadyNum===true){
                      continue tokens;
                    }
                    else if(input.charAt(currentChar)==="+"){
                      if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){continue tokens;}
                      else{tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;alreadyPlus=true;}
                    }
                    else if(input.charAt(currentChar)==="-"){
                      if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){continue tokens;}
                      else{tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;alreadyMinus=true;}
                    }
                  }
                  else if(isnum(input.charAt(currentChar)) && alreadyE===true){
                    alreadyNum=true;tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
                  }
                  else{ // No minus, no plus, no e before it.
                    tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
                  }
                }
                else{
                  continue tokens;
                }
              }
            } // Otherwise its a dot operator
            else{
              tokens.push(["PUNCT","."]);continue tokens;
            }
            break;
          default: // Any other char thats not a slash
            tokens.push(["UNKNOWN",input.charAt(currentChar)]);currentChar++;continue tokens; // Just in case there's an illegal character, so we don't crash in an infinite loop
            break;
        }
      }
      else{currentChar++; // its a / - regex lit or division/division assignment
        var regex=true; // Initialize a variable that will later tell us whether its a regex lit or not
        // This switch statement evaluates the previous token to guess whether the current one should be a regex or division. This method for distinguishing between regex/division in the tokenizer is somewhat documented in the Mozilla article at http://www.mozilla.org/js/language/js20-2000-07/rationale/syntax.html, at the middle of the page under "Syntactic Resynchronization".
        // It is an imperfect solution. As the article states, "This is an area that needs further work." The only questionable situation is where a regex is directly following a ) or }, where it could be either. More commonly it is division, but not always. This method is about as good as we can get without performing a simplified parse.
        switch(tokens[tokens.length-1][0]){
          case "IDENT":
            regex=false;
            break;
          case "NUM_LIT":
            regex=false;
            break;
          case "REGEX_LIT":
            regex=false;
            break;
          case "STR_LIT":
            regex=false;
            break;
          case "PUNCT":
            switch(tokens[tokens.length-1][1]){
              case ")":
                regex=false;
                break;
              case "++":
                regex=false;
                break;
              case "--":
                regex=false;
                break;
              case "]":
                regex=false;
                break;
              case "}":
                regex=false;
                break;
           }
           break;
          case "KEY":
            switch(tokens[tokens.length-1][1]){
              case "false":
                regex=false;
                break;
              case "null":
                regex=false;
                break;
              case "super":
                regex=false;
                break;
              case "this":
                regex=false;
                break;
              case "true":
                regex=false;
                break;
            }
            break;
          default: // Otherwise, it is a regex
            regex=true;
            break;
        }
        if(regex===true){ // If it does turn out to be a regex
          tokens.push(["REGEX_LIT","/"+input.charAt(currentChar)]);currentChar++;
          for(;;){
            if(input.charAt(currentChar)!=="/"){ // If its not the ending slash
              if(currentChar===input.length){
                break tokens;
              }
              else{
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
            }
            else{
              if(precedingBackslashes(input,currentChar)%2===0){ // just like strings, an even amount of backslashes is not escaping the current char (it is a series of escaped backslashes)
                // It was really an ending slash
                // We have to check for flags. We check for any alpha character, it doesn't matter if its really a valid flag character or not.
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
                for(;;){
                  if(isalpha(input.charAt(currentChar))){
                    tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
                  }
                  else{
                    continue tokens;
                  }
                }
              }
              else{// It wasn't really an ending backslash - it was escaped
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
            }
          }
        }
        else{ // Otherwise, its division
          tokens.push(["PUNCT","/"]);
          if(input.charAt(currentChar)==="="){ // If there's an equal next, advance the currentChar
            tokens[tokens.length-1][1]+="=";currentChar++;
          }
          continue tokens; // No matter what, continue the loop
        }
      }
    }
    var msg="<br><strong>Characters:</strong> "+input.length+"<br><strong>Tokens:</strong><br>";
    for(var i in tokens){
      msg+=tokens[i][0];msg+=" ";msg+=tokens[i][1];if(tokens[i][2]){msg+=" ("+tokens[i][2]+")";}msg+=",<br>";
    }
    document.getElementById("debug").innerHTML=msg;
  }
};