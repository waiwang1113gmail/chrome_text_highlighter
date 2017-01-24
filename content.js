(function(){
	var highlightClassName = "ww_hightlight";
	var highlightTag = 'i';
	var tagNotToProcess = ["SCRIPT","STYLE","IFRAME"];

	//Custom JQuery expr to support case insensitive search
	jQuery.expr[':'].contains = function(a, i, m) {
	  return jQuery(a).text().toUpperCase()
	      .indexOf(m[3].toUpperCase()) >= 0;
	};
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
   		update highlighted keyword
   		@param tag_id id of background element
   		@param newColor
   	*/
   	function updateTagColor(keywordId,newColor){
   		console.log(newColor);
   		$(highlightTag+'[keywordId="'+keywordId+'"]').each(function(i,ele){
   			ele.style.background = newColor;
   		})
   	}
   	/*
   		remove highlighted text for given tag id
   		@param tag_id id of background element
   	*/
   	function removeTag(tag_id){
   		$(highlightTag+'[keywordId="'+tag_id+'"]').each(function(i,ele){

   			$(ele).replaceWith(document.createTextNode(ele.textContent));
   		})
   	}
   	/*
		highlight characters in text node by creating new span element for the characters 
		Implementation detail - 
			Split the text node into three siblings text node and wrap middle text node into a
		  	span node
		@param element text node that need to be splitted and added new element to
		@param startIndex start index of text that need to be highlighted
		@param lengthOfText length of text
		@param color to highlight text
  		@param keywordid
	*/
	function addTagToText(element,startIndex,lengthOfText,color,keywordid){
	    //new Node to hold the highlighted text
	    var newNode = document.createElement(highlightTag); 
	    newNode.className=highlightClassName;
	    newNode.setAttribute("keywordId", keywordid);
	    newNode.style.background = color;
	    var middlebit = element.splitText(startIndex);
	    var endbit = middlebit.splitText(lengthOfText);
	    var middleclone = middlebit.cloneNode(true);
	    newNode.appendChild(middleclone);
	    middlebit.parentNode.replaceChild(newNode, middlebit);
  	}

  	function highlightText(indexOfPatternInTextNode,element,text,lengthOfPreviousElements,color,keywordid){

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
		        	addTagToText(element,indexOfPatternInTextNode - lengthOfPreviousElements,numberOfMachingCharacter,color,keywordid);

		        	return new HighlightResponse(false,lengthOfIncludingCurrentNode,text.substring(numberOfMachingCharacter),lengthOfIncludingCurrentNode);
		          
		        }else{
		          	//Since all matching characters are in current text code
		          	//We highlight all 
		          	addTagToText(element,indexOfPatternInTextNode - lengthOfPreviousElements, text.length ,color,keywordid)
		          	return new HighlightResponse(true);
		        }
	      	}else{ 
	        	return new HighlightResponse(false,indexOfPatternInTextNode,text,lengthOfIncludingCurrentNode);
	      	}

	    }else{
	      	var listOfChildrenElements = $(element).contents().toArray();
	      	var result= new HighlightResponse(false,indexOfPatternInTextNode,text,lengthOfPreviousElements); 
	      	for(var indexOfElement in listOfChildrenElements){
	        	result = highlightText(result.indexOfPattern, listOfChildrenElements[indexOfElement], result.pattern,result.lengthOfElements,color,keywordid);
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
  		@param color to highlight text
  		@param keywordid
  	*/
  	function highlightInElement(text,element,color,keywordid){
  		if(tagNotToProcess.indexOf(element.nodeName.toUpperCase())<0){
  			var contentText = $(element).text(); 
		    var regex = new RegExp(text,'gi');
		    var match;
		    while(match = regex.exec(contentText)){
		    	console.log(match);
		      	var indexOfStartPattern = match["index"];
		      	highlightText(indexOfStartPattern,element,text,0,color,keywordid)
		    }
  		}
	    
  	}
  	/*
  		highlight all text occurrences in the document
  		@param text the text need to be highlighted
  		@param color to highlight text
  		@param keywordid
  	*/
  	function highlight(text,color,keywordid){ 
		var elementArray = $(":not(html,body):visible:contains('"+text+"')").sort(function(a,b){
			return $(a).parents().length > $(b).parents().length
		}); 
		while(elementArray.length!=0){
			var element=elementArray[0];
			highlightInElement(text,element,color,keywordid);
			elementArray=elementArray.filter(function(i,o){return element!==o && !element.contains(o)});
		}
  	}
  	//Observer for added elements after init
  	var observer = new WebKitMutationObserver(function(mutations){
  		mutations.forEach(function(mutation){

  			if(mutation.type=== 'childList' && mutation.addedNodes.length >0){
  				mutation.addedNodes.forEach(function(node){ 
  					if(!(node.nodeType == 3 )&& !(node.nodeName.toUpperCase()===highlightTag.toUpperCase() && node.className ===highlightClassName )){ 
  						 chrome.storage.local.get(null,function(keys){
					  		for(var key in keys){
					  			var keyword = keys[key];
					  			highlightInElement(keyword.text,node,keyword.color,key);
					  		}
					  	})
  						 
  					}
  				})
  			}
  		}) 
  	});
  	$(document).ready(function(){
  		chrome.storage.local.get(null,function(items){
	  		for(var key in items){
	  			var keyword = items[key];
	  			console.log(key);
	  			highlight(keyword.text,keyword.color,key);
	  		}
	  	})
  		observer.observe(document,{ childList: true, characterData: true ,subtree:true})
  	})

  	chrome.storage.onChanged.addListener(
  		function(changes, namespace) {
  			for (key in changes) {
  				var storageChange = changes[key];
  				if(!storageChange.oldValue && storageChange.newValue){ 
  					highlight(storageChange.newValue.text,storageChange.newValue.color,key);
  				}else if(!storageChange.newValue){
  					removeTag(key);
  				}else if(storageChange.oldValue.color !== storageChange.newValue.color){
  					updateTagColor(key,storageChange.newValue.color);
  				}
  			}

  		}
  	); 	
})();