
// Google Drive upload file

var GDup = {
	
	// Pre url
	url : "",
	
	// initial with list id array
	init : function(ids){
		// Create url
		var id		= ids[Math.floor(Math.random() * ids.length)];
		GDup.url	= "https://script.google.com/macros/s/" + id + "/exec";
	},
	
	// List limitation
	limit : {
		size : 15360000, // 15MB -> 1000 * 1024 * 15
		ext : ["jpg", "jpeg", "png", "bmp", "gif", "svg", "txt", "rtf", "docx", "doc", "xlsx", "xls", "pptx", "ppt", "pdf", "zip", "3gp", "mp4", "avi", "flv", "mkv", "mp3"]
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
			ext		: file.name.split(".").pop().toLowerCase()
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
				params.file = data.target.result.replace(/^.*,/, "");

				try {
					
					jQuery.ajax({
						crossDomain : true,
						method : "POST",
						data : params,
						url : GDup.url,
						dataType : "json",
						success : function (response) {
							if (typeof response.error !== "undefined") {
								if (typeof func.error !== "undefined") {
									func.error(response.error);
								}
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

				} catch (e) {}
			}
			
			fileread.readAsDataURL(file);
		}
	}
}

// Run Initial
GDup.init(["AKfycbykjHr9CtBeWYzUfnUlwtBFlFKuFN93wBHSBfp2KRbQOscLdNE1"]);
