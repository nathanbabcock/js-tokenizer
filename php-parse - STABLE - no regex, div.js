var parser = {
  tokenizer:function(input){
    currentChar=0;
    tokens=[["PROG_START",undefined]];
    
    // HELPER FUNCTIONS/VARS:
    var alreadyPlus=false; // for fp decimals (including all below)
    var alreadyMinus=false;
    var alreadyE=false;
    var alreadyNum=false; // alread a number after the E
    function isalpha(character){
      var alphas=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
      for(var i in alphas){
        if(alphas[i]===character.toLowerCase()) return true;
      }
      return false;
    }
    function isnum(character){
      return character==="0" || character==="1" || character==="2" || character==="3" || character==="4" || character==="5" || character==="6" || character==="7" || character==="8" || character==="9";
    }
    function precedingBackslashes(input,charindex){
      for(var i=1; i<=input.length; i++){
        if(i===charindex-1) return i;
        else if(input.charAt(charindex-i)!=="\\") return i-1;
      }
    }
    function iswhitespace(character){ // Quick one-liner checking for whitespace (spaces, newlines, carriage returns, and tabs)
      return character===" " || character==="\n" || character==="\r" || character==="\t";
    }
    function iskeyword(word){
      var keywords=["break","case","catch","continue","default","delete","do","else","false","finally","for","function","if","in","instanceof","new","null","return","switch","this","throw","true","try","typeof","var","void","while","with",/*other reserved words:*/"abstract","boolean","byte","char","class","const","debugger","double","enum","export","extends","final","float","goto","implements","import","int","interface","long","native","package","private","protected","public","short","static","super","synchronized","throws","transient","volatile"];
      for(i in keywords){
        if(word===keywords[i]) return true;
      }
      return false;
    }
    
    (function nextToken(){
      document.getElementById("debug").innerHTML="Tokens: "+(tokens.length)+"<br>(characters: "+currentChar+")";
      /*if(currentChar%1000===0){
        alert("Char: "+currentChar);
      }*/
      if(currentChar===input.length) return tokens;
      else if(iswhitespace(input.charAt(currentChar))){
        currentChar++;nextToken();return false;
      }
      if(input.charAt(currentChar)==='"' || input.charAt(currentChar)==="'" || input.charAt(currentChar)+input.charAt(currentChar+1)==="/*" || input.charAt(currentChar)+input.charAt(currentChar+1)==="//"){
        if(input.charAt(currentChar)==='"'){
          tokens.push(["STR_LIT","\"","DOUBLE"]);currentChar++;
          for(;;){
            if(input.charAt(currentChar)!=='"'){
              tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
            }
            else{
              if(precedingBackslashes(input,currentChar)%2===0){
                // precedingBackslashes() checks for the number of backslashes before a position in the string, and returns the number.
                // The modulo (%) divides the number by 2 and returns the remainder. If the number is divisibly by 2 with no remainder, it is even.
                // An even number of backslashes preceding a quote is actually a number of escaped backslashes, not effecting the quote itself. An odd number IS effecting the quote.
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;nextToken();return false;
              }
              else{ // if its odd, it is effecting the quote, so we treat it like its not a quote
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
            }
          }
        }
        else if(input.charAt(currentChar)==="'"){
          tokens.push(["STR_LIT","'",'SINGLE']);currentChar++;
          for(;;){
            if(input.charAt(currentChar)!=="'"){
              tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
            }
            else{
              if(precedingBackslashes(input,currentChar)%2===0){
                // precedingBackslashes() checks for the number of backslashes before a position in the string, and returns the number.
                // The modulo (%) divides the number by 2 and returns the remainder. If the number is divisibly by 2 with no remainder, it is even.
                // An even number of backslashes preceding a quote is actually a number of escaped backslashes, not effecting the quote itself. An odd number IS effecting the quote.
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;nextToken();return false;
              }
              else{ // if its odd, it is effecting the quote, so we treat it like its not a quote
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
            }
          }
        }
        else if(input.charAt(currentChar)+input.charAt(currentChar+1)==="//"){
          tokens.push(["COMMENT","//","SINGLE_LINE"]);currentChar+=2;
          for(;;){
            if(input.charAt(currentChar)!=="\n" && input.charAt(currentChar)!=="\r" && currentChar!=input.length){
              tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
            }
            else{
              nextToken();return false;
            }
          }
        }
        else if(input.charAt(currentChar)+input.charAt(currentChar+1)==="/*"){
          tokens.push(["COMMENT","/*","MULTI_LINE"]);currentChar+=2;
          for(;;){
            if(input.charAt(currentChar)+input.charAt(currentChar+1)!=="*/"){
              tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
            }
            else{
              tokens[tokens.length-1][1]+="*/";currentChar+=2;nextToken();return false;
            }
          }
        }
      }
      else if(isnum(input.charAt(currentChar))){
        tokens.push(["NUM_LIT",input.charAt(currentChar)]);currentChar++;
        if(input.charAt(currentChar-1)==="0"){
          if(input.charAt(currentChar).toLowerCase()==="x"){currentChar++;// 0x? hexadecimal
            tokens[tokens.length-1][1]+=input.charAt(currentChar-1);tokens[tokens.length-1][2]="HEX";
            for(;;){
              if(isalpha(input.charAt(currentChar)) || isnum(input.charAt(currentChar))){
                tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
              else{
              nextToken();return false;
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
                nextToken();return false;
              }
            }
          } // 0.? FP Dec
          else if(input.charAt(currentChar)==="."){tokens[tokens.length-1][1]+=".";tokens[tokens.length-1][2]="FP";currentChar++; // 0.? Floating point.
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
                    nextToken();return false;
                  }
                  else if(input.charAt(currentChar)==="+"){
                    if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){nextToken();return false;}
                    else{tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;alreadyPlus=true;}
                  }
                  else if(input.charAt(currentChar)==="-"){
                    if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){nextToken();return false;}
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
                nextToken();return false;
              }
            }
          }
          else{ // must be 0
            tokens[tokens.length-1][2]="INT";nextToken();return false;
          }
        }
        else{tokens[tokens.length-1][2]="INT"; // doesn't start with 0
          alreadyE=false;
          alreadyMinus=false;
          alreadyPlus=false;
          alreadyNum=false;
          for(;;){
            if(input.charAt(currentChar)==="."){
              tokens[tokens.length-1][2]="FP";
              if(input.charAt(currentChar).toLowerCase()==="e"){
                  alreadyE=true;tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
              }
              if(input.charAt(currentChar)==="+" || input.charAt(currentChar)==="-"){
                if(alreadyNum===true){
                  nextToken();return false;
                }
                else if(input.charAt(currentChar)==="+"){
                  if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){nextToken();return false;}
                  else{tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;alreadyPlus=true;}
                }
                else if(input.charAt(currentChar)==="-"){
                  if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){nextToken();return false;}
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
            else if(isnum(input.charAt(currentChar))){
              tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
            }
            else{
              nextToken();return false;
            }
          }
        }
      }
      else if(isalpha(input.charAt(currentChar)) || input.charAt(currentChar)==="$" || input.charAt(currentChar)==="_"){
        tokens.push(["IDENT",input.charAt(currentChar)]);currentChar++;
        for(;;){
          if(input.charAt(currentChar)==="$" || input.charAt(currentChar)==="_" || isalpha(input.charAt(currentChar)) || isnum(input.charAt(currentChar))){
            tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;
          }
          else{
            if(iskeyword(tokens[tokens.length-1][1])){
              tokens[tokens.length-1][0]="KEY";
            }
            else if(tokens[tokens.length-1][1]==="null"){
              tokens[tokens.length-1][0]="SPECIAL";
            }
            else if(tokens[tokens.length-1][1]==="undefined"){
              tokens[tokens.length-1][0]="SPECIAL";
            }
            nextToken();return false;
          }
        }
      }
      else if(input.charAt(currentChar)!=="/"){
        switch(input.charAt(currentChar)){
          case "=":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              currentChar++;
              if(input.charAt(currentChar)==="="){
                tokens.push(["PUNCT","==="]);currentChar++;nextToken();return false;
              }
              else{
                tokens.push(["PUNCT","=="]);nextToken();return false;
              }
            }
            else{
              tokens.push(["PUNCT","="]);nextToken();return false;
            }
            break;
          case ">":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT",">="]);currentChar++;nextToken();return false;
            }
            else if(input.charAt(currentChar)===">"){
              currentChar++;
              if(input.charAt(currentChar)===">"){
                currentChar++;
                if(input.charAt(currentChar)==="="){
                  tokens.push(["PUNCT",">>>="]);currentChar++;nextToken();return false;
                }
                else{
                  tokens.push(["PUNCT",">>>"]);nextToken();return false;
                }
              }
              else if(input.charAt(currentChar)==="="){
                tokens.push(["PUNCT",">>="]);currentChar++;nextToken();return false;
              }
              else{tokens.push(["PUNCT",">>"]);nextToken();return false;}
            }
            else{tokens.push(["PUNCT",">"]);nextToken();return false;}
            break;
          case "<":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","<="]);currentChar++;nextToken();return false;
            }
            else if(input.charAt(currentChar)==="<"){
              currentChar++
              if(input.charAt(currentChar)==="="){
                tokens.push(["PUNCT","<<="]);currentChar++;nextToken();return false;
              }
              else{
                tokens.push(["PUNCT","<<"]);nextToken();return false;
              }
            }
            else{
              tokens.push(["PUNCT","<"]);nextToken();return false;
            }
            break;
          case "+":
            currentChar++;
            if(input.charAt(currentChar)==="+"){
              tokens.push(["PUNCT","++"]);currentChar++;nextToken();return false;
            }
            else if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","+="]);currentChar++;nextToken();return false;
            }
            else{
              tokens.push(["PUNCT","+"]);nextToken();return false;
            }
            break;
          case "-":
            currentChar++;
            if(input.charAt(currentChar)==="-"){
              tokens.push(["PUNCT","--"]);currentChar++;nextToken();return false;
            }
            else if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","-="]);currentChar++;nextToken();return false;
            }
            else{
              tokens.push(["PUNCT","-"]);nextToken();return false;
            }
            break;
          case "*":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","*="]);currentChar++;nextToken();return false;
            }
            else{
              tokens.push(["PUNCT","*"]);nextToken();return false;
            }
            break;
          // No division, because of regex literals it requires its own section
          case "%":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","%="]);currentChar++;nextToken();return false;
            }
            else{
              tokens.push(["PUNCT","%"]);nextToken();return false;
            }
            break;
          case "&":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","&="]);currentChar++;nextToken();return false;
            }
            else if(input.charAt(currentChar)==="&"){
              tokens.push(["PUNCT","&&"]);currentChar++;nextToken();return false;
            }
            else{
              tokens.push(["PUNCT","&"]);nextToken();return false;
            }
            break;
          case "|":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","|="]);currentChar++;nextToken();return false;
            }
            else if(input.charAt(currentChar)==="|"){
              tokens.push(["PUNCT","||"]);currentChar++;nextToken();return false;
            }
            else{
              tokens.push(["PUNCT","|"]);nextToken();return false;
            }
            break;
          case "^":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              tokens.push(["PUNCT","^="]);currentChar++;nextToken();return false;
            }
            else{
              tokens.push(["PUNCT","^"]);nextToken();return false;
            }
            break;
          case "!":
            currentChar++;
            if(input.charAt(currentChar)==="="){
              currentChar++;
              if(input.charAt(currentChar)==="="){
                tokens.push(["PUNCT","!=="]);currentChar++;nextToken();return false;
              }
              else{
                tokens.push(["PUNCT","!="]);nextToken();return false;
              }
            }
            else{
              tokens.push(["PUNCT","!"]);nextToken();return false;
            }
            break;
          case "~":
            tokens.push(["PUNCT","~"]);currentChar++;nextToken();return false;
            break;
          case "?":
            tokens.push(["PUNCT","?"]);currentChar++;nextToken();return false;
          case ":":
            tokens.push(["PUNCT",":"]);currentChar++;nextToken();return false;
            break;
          case ",":
            tokens.push(["PUNCT",","]);currentChar++;nextToken();return false;
            break;
          case "{":
            tokens.push(["PUNCT","{"]);currentChar++;nextToken();return false;
            break;
          case "}":
            tokens.push(["PUNCT","}"]);currentChar++;nextToken();return false;
            break;
          case "(":
            tokens.push(["PUNCT","("]);currentChar++;nextToken();return false;
            break;
          case ")":
            tokens.push(["PUNCT",")"]);currentChar++;nextToken();return false;
            break;
          case "[":
            tokens.push(["PUNCT","["]);currentChar++;nextToken();return false;
            break;
          case "]":
            tokens.push(["PUNCT","]"]);currentChar++;nextToken();return false;
            break;
          case ";":
            tokens.push(["PUNCT",";"]);currentChar++;nextToken();return false;
            break;
          case ".":
            currentChar++;
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
                      nextToken();return false;
                    }
                    else if(input.charAt(currentChar)==="+"){
                      if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){nextToken();return false;}
                      else{tokens[tokens.length-1][1]+=input.charAt(currentChar);currentChar++;alreadyPlus=true;}
                    }
                    else if(input.charAt(currentChar)==="-"){
                      if(alreadyPlus===true || alreadyMinus===true || alreadyE===false){nextToken();return false;}
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
                  nextToken();return false;
                }
            }
          }
          else{
            tokens.push(["PUNCT","."]);nextToken();return false;
          }
          break;
        }
      }
    })(); // Invokes the function
    var msg="<br><strong>Tokens:</strong><br>";
    for(var i in tokens){
      msg+=tokens[i][0];msg+=" ";msg+=tokens[i][1];if(tokens[i][2]){msg+=" ("+tokens[i][2]+")";}msg+=",<br>";
    }
    document.getElementById("debug").innerHTML+=msg;
  }
};