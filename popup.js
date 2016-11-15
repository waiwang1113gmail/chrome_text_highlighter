$(document).ready(function(){
	//initalize listener for managing keywords
	(function(){
		$("#addNewKeyword").click(function(){
			var newKey = $("#newKeyword").val();
			console.log(newKey);
			var object = {};
			if(newKey){
				object[newKey] = newKey;
				chrome.storage.local.set(object);
			}
		});
	})();
	$(".pick-a-color").pickAColor({
	  showSpectrum            : true,
		showSavedColors         : true,
		saveColorsPerElement    : true,
		fadeMenuToggle          : true,
		showAdvanced						: true,
		showBasicColors         : true,
		showHexInput            : false,
		allowBlank							: true,
		inlineDropdown					: true
	});

	chrome.storage.onChanged.addListener(
  		function(changes, namespace) {
  			console.log(changes);
  			for (key in changes) {
  				var storageChange = changes[key];
  				console.log(changes);
  				if(storageChange.newValue){
  					$("h1").text(storageChange.newValue);
  				}
  			}

  		}
  	);
});
