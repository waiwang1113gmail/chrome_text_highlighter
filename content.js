(function(){
	// class for represents the response that returned by highlight function
   	class HighlightResponse{
      	constructor(result,indexOfPattern, pattern, lengthOfElements){
	        //boolean value determone if the highlight function fullfill its job.
	        //Which means it highlights all chracters in pattern 
	        this.result = result;
	        //this integer value determine the starting index of pattern in the context
	        //NOTE we assumes the search is performed in a element that may contains the pattern
	        //in its decendant node or nodes
	        this.indexOfPattern = indexOfPattern;
	        //The pattern or remaining pattern we want to search
	        //Note the origin pattern may be split into several nodes, and if we find partial pattern
	        //in the current searching node, we need the remaining pattern to be searched in next node
	        this.pattern = pattern;
	        //number of chracters we already searched
	        this.lengthOfElements = lengthOfElements;
      	}
   	}
   	/*
		highlight characters in text node by creating new span element for the characters 
		Implementation detail - 
			Split the text node into three siblings text node and wrap middle text node into a
		  	span node
		@param element text node that need to be splitted and added new element to
		@param startIndex start index of text that need to be highlighted
		@param lengthOfText length of text
	*/
	function addTagToText(element,startIndex,lengthOfText){
	    //new Node to hold the highlighted text
	    var newNode = document.createElement('span'); 
	    newNode.className="highlight";
	    var middlebit = element.splitText(startIndex);
	    var endbit = middlebit.splitText(lengthOfText);
	    var middleclone = middlebit.cloneNode(true);
	    newNode.appendChild(middleclone);
	    middlebit.parentNode.replaceChild(newNode, middlebit);
  	}

  	function highlightText(indexOfPatternInTextNode,element,text,lengthOfPreviousElements){

	    //Base case that current node is text node which means the text() returns all visible characters
	    if(element.nodeType === 3){
		    var lengthOfIncludingCurrentNode = lengthOfPreviousElements + $(element).text().length;
		    //check if the starting index of text we want to highlight is in the current text node
		    if(lengthOfIncludingCurrentNode > indexOfPatternInTextNode){

		        //last index of the searching text is not in current text node
		        //which means the rest of matched text is in another element
		        if(indexOfPatternInTextNode + text.length > lengthOfIncludingCurrentNode){
		        	//The number of matching character in current node
		        	var numberOfMachingCharacter = lengthOfIncludingCurrentNode - indexOfPatternInTextNode;
		        	//Create tag to surround the matched text
		        	addTagToText(element,indexOfPatternInTextNode - lengthOfPreviousElements,numberOfMachingCharacter);

		        	return new HighlightResponse(false,lengthOfIncludingCurrentNode,text.substring(numberOfMachingCharacter),lengthOfIncludingCurrentNode);
		          
		        }else{
		          	//Since all matching characters are in current text code
		          	//We highlight all 
		          	addTagToText(element,indexOfPatternInTextNode - lengthOfPreviousElements, text.length )
		          	return new HighlightResponse(true);
		        }
	      	}else{ 
	        	return new HighlightResponse(false,indexOfPatternInTextNode,text,lengthOfIncludingCurrentNode);
	      	}

	    }else{
	      	var listOfChildrenElements = $(element).contents().toArray();
	      	var result= new HighlightResponse(false,indexOfPatternInTextNode,text,lengthOfPreviousElements); 
	      	for(var indexOfElement in listOfChildrenElements){
	        	result = highlightText(result.indexOfPattern, listOfChildrenElements[indexOfElement], result.pattern,result.lengthOfElements);
	         	if(result.result){
	          		return result;
	        	}
	      	}
	      	return result;
	    }
  	}
  	/*
  		function for highlighting text in given element
  		@param text that need to be highlight
  		@param element html element contains the content need to be highlighted
  	*/
  	function highlightInElement(text,element){
	    var contentText = $(element).text();
	    var regex = new RegExp(text,'g');
	    var match;
	    while(match = regex.exec(contentText)){
	      	var indexOfStartPattern = match["index"];
	      	highlightText(indexOfStartPattern,element,text,0)
	    }
  	}
  	/*
  		highlight all text occurrences in the document
  		@param text the text need to be highlighted
  	*/
  	function highlight(text){
		$(":not(html,body):visible:contains('"+text+"')").each(function(index,obj){
	    	highlighe('editor',obj)
	  	}); 
  	}
  	chrome.storage.onChanged.addListener(
  		function(changes, namespace) {
  			for (key in changes) {
  				var storageChange = changes[key];
  				if(storageChange.newValue){
  					highlight(storageChange.newValue);
  				}
  			}

  		}
  	);
  	 	
})();