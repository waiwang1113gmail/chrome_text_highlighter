$(document).ready(function(){
	var colors = ["yellow","green","red","blue","purple","pink","orange"];
	var colorIndex = 0;
	function getColor(){  
		return colors[colorIndex++ % colors.length]
	}
	function addKeywordToTable(keyword,color){

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
	}
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
				chrome.storage.local.get(newKey,function(items){
					if(!items[newKey]){
						var color = getColor();
						console.log(color)
						items[newKey] = new Keyword(newKey,color);
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
  					addKeywordToTable(storageChange.newValue.text,storageChange.newValue.color);
  				}
  			}

  		}
  	);
  	chrome.storage.local.clear();
  	chrome.storage.local.get(null,function(items){
  		console.log(items);
  	})
});
