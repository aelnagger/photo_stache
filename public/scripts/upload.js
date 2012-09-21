$(document).ready(function(){
	var processFile = function(f){
		alert('Working on file ' + f.name);
	};

	var handleSuccess = function(){
		window.location.pathname = '/thanks';
	};

	var handleError = function(err){
		alert('Upload failed.');
	};

	var validate = function(){
		var result = true;
		$('input:text, input:file').each(function(i, elem){
			var e = $(elem);
			var good = e.val() != '';
			result &= good;
			if(!good){
				if(!e.hasClass('error')){
					e.parent().append('<span class="warning">Required!</span>');
					e.addClass('error');
				}
			}else{
				$('span', e.parent()).detach();
				e.removeClass('error');
			}
		});
		return result;
	};

	function showProgress(evt) {
	    if (evt.lengthComputable) {
	        var percentComplete = (evt.loaded / evt.total)*100;  
	        $('#progressbar').progressbar( "option", "value", percentComplete );
	    } 
	}

	$('#photo-button').click(function(){
		$('#progressbar').progressbar('option', 'value', 0);
		if(validate()){
			$("#progressbar").show();
	    	var formData = new FormData($('form')[0]);
		    $.ajax({
		        url: '/',  //server script to process data
		        type: 'POST',
		        xhr: function() {  // custom xhr
		            myXhr = $.ajaxSettings.xhr();
		            if(myXhr.upload){ // check if upload property exists
		                myXhr.upload.addEventListener('progress', showProgress, false); // for handling the progress of the upload
		            }
		            return myXhr;
		        },
		        //Ajax events
		        //beforeSend: beforeSendHandler,
		        success: handleSuccess,
		        error: handleError,
		        // Form data
		        data: formData,
		        //Options to tell JQuery not to process data or worry about content-type
		        cache: false,
		        contentType: false,
		        processData: false
		    });
		}
	});

	$("#progressbar").progressbar();
    $("#progressbar").hide();
});