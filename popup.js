$(document).ready(function(){
	//Baisc background color that assigned to the keywords
	var colors = ["yellow","green","red","blue","purple","pink","orange"];
	var colorIndex = 0;

	//return a color and move colorIndex to next
	function getColor(){  
		return colors[colorIndex++ % colors.length]
	}
	/*
		Add new keyword to the keyword list
		by creating a new list item from the template
			@param key uniquely identifies keyword data in chrome storage
			@param keyword keyword
			@param color of background of highlighted keyword
	*/
	function addKeywordToTable(key,keyword,color){

		var newKeyword=$("#keywordTemplate").clone(); 
		newKeyword.attr('id', "").find(".pick-a-color").val(color).pickAColor({
		  	showSpectrum            : true,
			showSavedColors         : true,
			saveColorsPerElement    : true,
			fadeMenuToggle          : true,
			showAdvanced			: true,
			showBasicColors         : true,
			showHexInput            : false,
			allowBlank				: true,
			inlineDropdown			: true
		});
		newKeyword.find(".keyword-filed").val(keyword);
		newKeyword.show().appendTo($("#keywords"));
		newKeyword.find('.btn-danger').click(function(){
			newKeyword.remove();
			chrome.storage.local.remove(key);
		});
	}
	/*
		class that holding keyword information
	*/
	class Keyword{
		constructor(text,color){
			this.text = text;
			this.color = color;
		}
	}
	//initalize listener for managing keywords
	(function(){
		$("#addNewKeyword").click(function(){ 
			var newKey = $("#newKeyword").val();
			if(newKey){
				var keyBase64 = btoa(newKey);
				chrome.storage.local.get(keyBase64,function(items){
					if(!items[keyBase64]){
						var color = getColor();
						items[keyBase64] = new Keyword(newKey,color);
						chrome.storage.local.set(items);
					}
				}) 
			}
		});

	})();
 
	 
	chrome.storage.onChanged.addListener(
  		function(changes, namespace) {
  			for (key in changes) {
  				var storageChange = changes[key];
  				if(!storageChange.oldValue && storageChange.newValue){
  					addKeywordToTable(key,storageChange.newValue.text,storageChange.newValue.color);
  				}
  			}

  		}
  	);
  	//chrome.storage.local.clear();
  	chrome.storage.local.get(null,function(items){
  		for(var key in items){
  			addKeywordToTable(key,items[key].text,items[key].color);
  		}
  	})
});
