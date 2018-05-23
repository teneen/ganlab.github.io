
// G Drive upload file

var GDup = {
	
	// Pre url
	url : "",
	
	// initial with list id array
	init : function(ids){
		// Create url
		var id		= ids[Math.floor(Math.random() * ids.length)];
		GDup.url	= "https://script.google.com/macros/s/" + id + "/exec";
	},
	
	// List Global limitation
	limit : {
		size : 10240000, // 10MB -> 1000 * 1024 * 10
		ext : ["jpg", "jpeg", "png", "bmp", "gif", "svg", "txt", "rtf", "docx", "doc", "xlsx", "xls", "pptx", "ppt", "pdf", "zip", "rar", "3gp", "mp4", "avi", "flv", "mkv", "mp3"]
	},

	// Upload file
	upload : function (file, opt) {
		
		var process = true;
		
		/*
		opt = 
			array	allowExt
			integer	maxSize
			object	before(file),
			object	error(error),
			object	success(response)
		*/
		if (typeof opt === "undefined") {
			var opt = {};
		}

		// Run function before
		if (typeof opt.before !== "undefined") {
			opt.before(file);
		}
		
		// Error size too large
		if (typeof opt.maxSize === "undefined") {
			opt.maxSize = GDup.limit.size;
		}
		if (process && file.size > opt.maxSize) {
			if (typeof opt.error !== "undefined") {
				opt.error({
					code : "too_large",
					warning : "File size too large"
				});
			}
			var process = false;
		}
		
		// Error not allowed extension
		var ext	= file.name.split(".").pop().toLowerCase();
		if (typeof opt.allowExt === "undefined") {
			opt.allowExt = GDup.limit.ext;
		}
		if (process && opt.allowExt.indexOf(ext) < 0) {
			if (typeof opt.error !== "undefined"){
				opt.error({
					code : "bad_format",
					warning : "Bad file format"
				});
			}
			var process = false;
		}

		// process if no errors
		if (process) {
			
			// Set parameters
			var params = new FormData();
			params.append("name", file.name);
			params.append("type", file.type);
			
			// Read File
			var reader	= new FileReader();
			var size	= file.size;
			var chunk_size = 1024 * 1000; // 1 MB
			var chunks	= [];
			var offset	= 0;

			reader.onloadend = function(e){
			
				if (e.target.readyState == FileReader.DONE) {
					
					var chunk = e.target.result;
					
					chunks.push(chunk);
					
					if ((offset < size)) {
				  
						offset += chunk_size;
					
						var blob = file.slice(offset, offset + chunk_size);

						reader.readAsDataURL(blob);

					} else {

						var content = chunks.join("");
						
						// Upload File
						params.append("file", content.replace(/^.*,/, ""));
						
						// Upload file with ajax
						jQuery.ajax({
							crossDomain : true,
							method : "POST",
							data : params,
							url : GDup.url,
							dataType : "json",
							processData : false,
							contentType : false,
							success : function (response) {
								if (typeof response.error !== "undefined") {
									if (typeof opt.error !== "undefined") {
										opt.error(response.error);
									}
								} else if (typeof opt.success !== "undefined") {
									opt.success(response);
								}
							},
							error : function (request, status, error) {
								if (typeof opt.error !== "undefined") {
									opt.error({
										code : "upload_failed",
										warning : "Failed to upload file"
									});
								}
							}
						});
					
						debugger;
					};
				}

			};

			var blob = file.slice(offset, offset + chunk_size);
			
			reader.readAsDataURL(blob);
		}
	}
}

// Run Initial
GDup.init(["AKfycbykjHr9CtBeWYzUfnUlwtBFlFKuFN93wBHSBfp2KRbQOscLdNE1"]);
