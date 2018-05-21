// GD upload file
var GDup = {
	
	// Pre id
	id : [],
	
	// Pre url
	url : '',
	
	// initial
	init : function(){
		// Create url
		var id		= GDup.id[Math.floor(Math.random() * GDup.id.length)];
		GDup.url	= 'https://script.google.com/macros/s/' + id + '/exec';
	},
	
	// List limitation
	limit : {
		size : 15360000, // 15MB -> 1000 * 1024 * 15
		ext : ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'svg', 'txt', 'rtf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'pdf', 'zip', '3gp', 'mp4', 'avi', 'flv', 'mkv', 'mp3']
	},

	// Make random id
	mid : function (length) {
		var text = "";
		var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
		for (var i = 0; i < length; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	},

	// Upload file
	upload : function (file, func) {
		
		var process = true;
		
		/* func = before(file), error(error), success(response)*/
		if (typeof func === "undefined") {
			var func = {};
		}
		
		// Set parameters
		var params = {
			name	: GDup.mid(20) + Date.now(),
			ext		: file.name.split('.').pop().toLowerCase()
		};

		// Run function before
		if (typeof func.before !== "undefined") {
			func.before(file);
		}
		
		// Error size too large
		if (process && file.size > GDup.limit.size) {
			if (typeof func.error !== "undefined") {
				func.error("File size too large");
			}
			var process = false;
		}
		
		// Error not allowed extension
		if (process && GDup.limit.ext.indexOf(params.ext) < 0) {
			if (typeof func.error !== "undefined"){
				func.error("Bad file format");
			}
			var process = false;
		}

		// process if no errors
		if (process) {
			
			// File
			var fileread = new FileReader();
			
			fileread.onload = function (data) {

				// Set params file in base64
				params.file = data.target.result.replace(/^.*,/, '');

				try {
					
					// Create iframe
					var upFrame = document.createElement("iframe");
					$(upFrame).attr("src", "about:blank");
					$(upFrame).css("display", "none");
					$(upFrame).css("width", "0px");
					$(upFrame).attr("id", "upFrame" + params.name);
					$(upFrame).attr("name", "upFrame" + params.name);
					upFrame.onload = function () {
						// Callback if upload success
						if (typeof do_callback !== "undefined") {							
							params.file = "0"; // clean data file
							jQuery.ajax({
								crossDomain : true,
								method : "GET",
								url : GDup.url + '?' + jQuery.param(params),
								dataType : "jsonp",
								success : function (response) {
									if (typeof response.error !== "undefined") {
										func.error(response.error);
									} else if (typeof func.success !== "undefined") {
										func.success(response);
									}
								},
								error : function (request, status, error) {
									if (typeof func.error !== "undefined") {
										func.error("Failed to upload file");
									}
								}
							});
							// remove iframe
							$(upFrame).remove();
						}
					}
					document.body.appendChild(upFrame);

					// Create form
					var idocument = upFrame.contentWindow.document;
					var loginForm = idocument.createElement('form');
					$(loginForm).attr("target", "upFrame" + params.name);
					$(loginForm).attr("method", "POST");
					$(loginForm).attr("action", GDup.url);

					// Insert data on form
					for (var key in params) {
						var hiddenField = idocument.createElement("input");
						$(hiddenField).attr("type", "hidden");
						$(hiddenField).attr("name", key);
						$(hiddenField).attr("value", params[key]);
						$(loginForm).append(hiddenField);
					}
					$(upFrame).append(loginForm);

					// Submit form with callback
					var do_callback = true;
					loginForm.submit();

				} catch (e) {}
			}
			fileread.readAsDataURL(file);
		}
	}
}

// List id
GDup.id = ['AKfycbykjHr9CtBeWYzUfnUlwtBFlFKuFN93wBHSBfp2KRbQOscLdNE1'];

// Run Initial
GDup.init();
