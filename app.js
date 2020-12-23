var express = require("express");
var app = express();
const request = require("request");
bodyParser = require("body-parser");
mongoose = require("mongoose");

// mongoose.connect("mongodb://localhost:3000/comments", { useNewUrlParser: true,  useUnifiedTopology: true  });
mongoose.connect("mongodb+srv://namt:nam150297@moviegamesearch-sgagf.gcp.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true,  useUnifiedTopology: true  })

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//Mongoose config
var commentSchema = new mongoose.Schema({
	name: String,
	created: {type:Date, default: Date.now},
	body: String,
	id: Number
});
var comment = mongoose.model("Comments", commentSchema);

//RESTFUL ROUTES
app.get("/", function(req,res){
	var data = [];
	var url = "https://api.themoviedb.org/3/movie/popular?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US&page=1";
	request(url, function(error, response, body){
		if(!error){
			data.push(JSON.parse(body)); //get popular
			url = "https://api.themoviedb.org/3/movie/upcoming?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US&page=1";
			request(url, function(error,response,body){
				if(!error){
					data.push(JSON.parse(body)); //get upcoming
					url = "https://api.themoviedb.org/3/movie/top_rated?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US&page=1";
					request(url, function(error,response,body){
						if(!error){
							data.push(JSON.parse(body)); //get top rated
							res.render("homePage", {data:data});
						}
					});
				}
			});
		}
	});
});

//search
app.get("/search/:page", function(req,res){
	var data = [];
	var queryName = req.query.searchName;
	var page = req.params.page;
	var url = "https://api.themoviedb.org/3/search/movie?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US&query=" + queryName + "&page="+page+"&include_adult=false";
	
	request(url, function(error,response, body){
		if(!error){
			data.push(JSON.parse(body));
			data.push(queryName);
			data.push(page);
			res.render("results", {data:data});
		}
	});
});
//Genres
app.get("/genres/:id/:page", function(req,res){
	var id = req.params.id;
	var page = req.params.page;
	var data = [];
	var url =  "https://api.themoviedb.org/3/discover/movie?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page="+page+"&with_genres=" + id;
	request(url,function(error,response, body){
		if(!error){
			data.push(JSON.parse(body));
			url = "https://api.themoviedb.org/3/genre/movie/list?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US";//get all genres
			request(url, function(error,response,body){
				data.push(JSON.parse(body));
				data.push(id);
				data.push(page);
				res.render("genres", {data:data});
			});
		}
	});
});

//All Popular
app.get("/popular/:id", function(req,res){
	var page = req.params.id;
	var data = [];
	var url = "https://api.themoviedb.org/3/movie/popular?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US&page=" + page;

	request(url,function(error,response, body){
		if(!error){
			data.push(JSON.parse(body));
			data.push(page);
			res.render("popular", {data:data});
		}
	});
});

//All Upcoming
app.get("/upcoming/:id", function(req,res){
	var page = req.params.id;
	var data = [];
	var url = "https://api.themoviedb.org/3/movie/upcoming?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US&page=" + page;

	request(url,function(error,response, body){
		if(!error){
			data.push(JSON.parse(body));
			data.push(page);
			res.render("upcoming", {data:data});
		}
	});
});

//All Toprated
app.get("/toprated/:id", function(req,res){
	var page = req.params.id;
	var data = [];
	var url = "https://api.themoviedb.org/3/movie/top_rated?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US&page=" + page;

	request(url,function(error,response, body){
		if(!error){
			data.push(JSON.parse(body));
			data.push(page);
			res.render("top_rated", {data:data});
		}
	});
});

//Details Info
app.get("/results/:id", function(req,res){
	var id = req.params.id;
	var data = [];
	var url = "https://api.themoviedb.org/3/movie/"+ id +"?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US"; //get details
	request(url, function(error, response,body){
		if(!error){
			data.push(JSON.parse(body)); 
			url = "https://api.themoviedb.org/3/movie/"+ id +"/videos?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US"; //get trailers
			request(url, function(error,response,body){
				if(!error){
					data.push(JSON.parse(body)); 
					url = "https://api.themoviedb.org/3/movie/"+ id +"/credits?api_key=4930af6de9d70b7054e00ba5583e4699"; //get casts
					request(url, function(error,response,body){
						if(!error){
							data.push(JSON.parse(body));
							url = "https://api.themoviedb.org/3/movie/"+ id +"/similar?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US&page=1" //get similar
							request(url, function(error,response,body){
								if(!error){
									if(data[1].results.length === 0){
										res.render("notFound");
									} else {
										data.push(JSON.parse(body));
										comment.find({id:id}, function(err, comments){
											if(!err){
												data.push(comments);
												url = "https://api.themoviedb.org/3/movie/" +id +"/reviews?api_key=4930af6de9d70b7054e00ba5583e4699&language=en-US&page=1"
												request(url,function(error,response,body){
													data.push(JSON.parse(body));
													res.render("details", {data:data});
												});
											}	
										});
									}
								}
							});

						}
					});
				}

			});
		}
	});
});


// //COMMENT list
// app.get("/comments", function(req,res){
// 	comment.find({}, function(err,comments){
// 		if(err){
// 			console.log("ERROR!");
// 		} else {
// 			res.render("comments", {comments: comments});
// 		}
// 	})
// });


// //FORM
// app.get("/comments/new", function(req,res){
// 	res.render("new");
// });

//Post comment
app.post("/comments/:id", function(req,res){
	var id = req.params.id;
	var item = req.body.comment;
	item.id = id;
	comment.create(item, function(err, newComment){
		if(err){
			res.render("new");
		} else {
			res.redirect("/results/"+ id);
		}
	});
});

app.listen(process.env.PORT || 3000, function(){
	console.log("Movie Search App is running!!!");
});