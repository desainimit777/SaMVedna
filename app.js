var express = require("express");
var methodOverride = require("method-override");
var parsedBody = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var router = express.Router()
// var Sign = require("./models/user1");
// var Thing  = require("./models/items");
// var seedDB  = require("./seeds");
// seedDB();

mongoose.connect("mongodb+srv://NISHANTDESAI:nishantdesai230@cluster0-tk7gt.mongodb.net/test",
	{useNewUrlParser: true,useUnifiedTopology: true});

var app = express();
app.use(parsedBody.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

app.use(require("express-session")
({
	secret:"HERE IS NISHANT DESAI",
	resave:false,
	saveUninitialized:false
}));


app.use(passport.initialize());
app.use(passport.session());

//SCHEMAS

//ITEMSCHEMA

var itemSchema = new mongoose.Schema(
{

Chapati:{ type:Number},
Rice:{ type:Number},
Khichdi:{ type:Number},
Biscuits:{ type:Number},
Time:{type:Date,default:Date.now},
request:String,
response:String

});

itemSchema.index({ 'username' : 0 }, {sparse: false });

itemSchema.plugin(passportLocalMongoose);

//USERSCHEMA
var newSchema = new mongoose.Schema(
{

Name:String,
isOrg:String,
username:String,
Adress:String,
City:String,
Area:String,
password:String,
name:[itemSchema]
});

newSchema.plugin(passportLocalMongoose);


var Sign = mongoose.model("Sign",newSchema);
var Thing = mongoose.model("Thing",itemSchema);
//FOR GIVING NAME AFTER LOGIN

app.use(function(req,res,next)
{
res.locals.currentUser = req.user;
next();
});

passport.use(new localStrategy(Sign.authenticate()));
passport.serializeUser(Sign.serializeUser());
passport.deserializeUser(Sign.deserializeUser());

app.get("/home",function(req,res)
{

res.render("home");

});

app.get("/aboutus",function(req,res){
	res.render("aboutus.ejs");
});

app.get("/contactus",function(req,res){
	res.render("contactus.ejs");
});

app.get("/ngo",isLoggedIn,function(req,res)
{	
Sign.find({isOrg:"organization"},function(err,ngo)
{
if (err) 
{
	console.log(err);
}
else
{
	res.render("nogdetails",{sign:ngo});
}
});
});

app.get("/ngo/:id",isLoggedIn,function(req,res)
{

var user = {
	id:req.user
}


Sign.findById(req.params.id,function(err,ngoId)
{

if (err) 
{
	console.log(err);
	res.redirect("/ngo");
}
else
{

	res.render("ngoid",{sign:ngoId});
}

});

});

app.get("/ngo/:id/items",isLoggedIn,function(req,res)
{
Sign.findById(req.params.id,function(err,items)
{
if (err)
{
	console.log(err);
}
else
{	
res.render("items",{items:items});
}
});
});


app.post("/ngo/:id",isLoggedIn,function(req,res)
{

	var user = {
	id:req.user
}


Sign.findById(req.params.id,function(err,org)
{
	if (err)
	{
		console.log(err);
	}
	else
	{

var newItems = new Thing
({
Chapati : req.body.number1,
Rice : req.body.number2,
Khichdi : req.body.number3,
Biscuits : req.body.number4,
request: req.user.Name,
username:req.user.username,
Time:req.body.date,
response:"pending",
});
org.name.push(newItems);
org.save(function(err,org)
{
if (err)
 {
 	console.log(err);
 }
});
}
Sign.findById(req.user.id,function(err,user)
{
	if (err)
	 {
	 	console.log(err);
	 }
	 else
	 {
	 	var newItems = new Thing
({
Chapati : req.body.number1,
Rice : req.body.number2,
Khichdi : req.body.number3,
Biscuits : req.body.number4,
username:org.Name,
Time:req.body.date,
response:"pending",
});
user.name.push(newItems);
user.save(function(err,user)
{
if (err)
 {
 	console.log(err);
 }
});
	 }
})
});
 res.render("submit",{currentUser:req.user});
});

app.get("/user/:id",function(req,res)
{
Sign.findById(req.params.id,function(err,user)
{
if (err) 
{
	console.log(err);
}
else
{
	res.render("user",{User:user});
}
});

});

//CANCEL REQUEST..

app.get("/ngo/:id/:slotid/cancel",function(req,res)
{
Sign.findById(req.params.id,function(err,user)
{
for (var i = 0; i <user.name.length ; i++)
{
if(user.name[i].id == req.params.slotid)
{

un = user.name[i].username
let findUser = {
username:un,
isOrg:"user"
};

Sign.find(findUser,function(err,finduser)
{
if (err)
{
	console.log("err");
}
else
{
	console.log(finduser);
	for(var j = 0 ; j<finduser[0].name.length ; j++)
	{
		console.log(finduser[0].name[j].id);
		console.log(req.params.slotid);
		if (finduser[0].name[j].id)
		{
			finduser[0].name[j].response = "Your Request Has Been Canceled";
			finduser[0].save(function(err)
			{
				if (err)
				{
					console.log(err);
				}
			});
		}
	}
}
});
user.name.splice(i,1);
user.save(function(err)
{
if (err) 
{

	console.log(err);
	res.redirect("/ngo/"+req.params.id);
}
else
{
res.redirect("/ngo/"+req.params.id);
}
});
}
}
});
});



// CONFIRM REQUEST..

app.get("/ngo/:id/:slotid/accept",function(req,res)
{
Sign.findById(req.params.id,function(err,user)
{
for (var i = 0; i <user.name.length ; i++)
{
if(user.name[i].id == req.params.slotid)
{
un = user.name[i].username,
 rq = user.name[i].request,
 user.name[i].response = "Request Confirmed",
 Chapati = user.name[i].Chapati;
 Rice = user.name[i].Rice;
 Khichdi = user.name[i].Khichdi;
 Biscuits = user.name[i].Biscuits;
 resp =  user.name[i].response
let findUser = {
username:un,
isOrg:"user"
};
let data = 
{
response:resp,
request:rq,
Chapati:Chapati,
Rice:Rice,
Khichdi:Khichdi,
Biscuits:Biscuits
}


Sign.find(findUser,function(err,findUser)
{
if (err)
{
	console.log("err");
}
else
{
	console.log(findUser);
	for(var j = 0 ; j<findUser[0].name.length ; j++)
	{
		console.log("hello");
		console.log(req.params.slotid);
		console.log(findUser[0].name[j].id);
		if (findUser[0].name[j].username)
		{
			
			findUser[0].name[j].response = "Request Confirmed";
			findUser[0].save(function(err)
			{
				console.log("tata");
				if (err)
				{
					console.log(err);
				}
			});
		}
	}
}
});

user.name.splice(i,1);
user.name.push(data);
user.save(function(err)
{
if (err)
 {
 	res.redirect("/ngo/"+req.params.id);
 }
 else
 {
	 	res.redirect("/ngo/"+req.params.id); 	
 }
});

}
};
});
});



app.get("/user/:id/edit",function(req,res)
{

Sign.findById(req.params.id,function(err,newEdit)
{

if (err)
{
	console.log(err);
}
else
{
	res.render("edit",{Edit:newEdit});
}
});
});

app.get("/history/:id",function(req,res)
{
Sign.findById(req.params.id,function(err,history)
{
	if (err)
	{
		console.log(err);
	}
	else
	{
var newItems = new Thing
({
Chapati : req.body.number1,
Rice : req.body.number2,
Khichdi : req.body.number3,
Biscuits : req.body.number4
});
var datetime = new Date();
var today = (datetime.getDate() + "/" + datetime.getMonth() + "/" + datetime.getFullYear());
console.log(today);
console.log(history);					
res.render("history",{data:history})
}
});
});

//UPDATE DATA

app.post("/user/:id",function(req,res)
{
	var newUser = {
	Name :req.body.name,
	Adress: req.body.address,
	Area:req.body.area,	
};

Sign.findByIdAndUpdate(req.params.id,newUser,function(err,updateData)
{
if(err)
{
res.redirect("/user");
}
else
{
	res.redirect("/user/" + req.params.id );
	console.log("success");
}
// res.send("ROUTES UPDATED");
});
});


//CHECK STATUS..  

app.get("/status/:id",function(req,res)
{
Sign.findById(req.params.id,function(err,status)
{
	if (err)
	{
		console.log(err);
	}
	else
	{
res.render("request",{status:status});
	}
});
});

//POSTING THE STATUS..

app.post("/status/:id",function(req,res)
{

Sign.findById(req.params.id,function(err,org)
{
	if (err)
	{
		console.log(err);
	}
	else
	{

var newItems = new Thing
({
Chapati : req.body.number1,
Rice : req.body.number2,
Khichdi : req.body.number3,
Biscuits : req.body.number4,
request: req.user.Name,
response:"pending",
});
org.name.push(newItems);
org.save(function(err,org)
{
if (err)
 {
 	console.log(err);
 }
});
}
});
res.send("data sent successfully");
});

//AUTHENTICATION SECTION

app.get("/register",function(req,res,sign)
{
res.render("sign_up(ngo)",{Sign:sign});
});

app.post("/register",function(req,res)
{
var newUser = new Sign({
	Name :req.body.name,
	username: req.body.username,
	Adress: req.body.address,
	City:req.body.city,
	Area:req.body.area,
	isOrg:req.body.categ
});

Sign.register(newUser,req.body.password,function(err,user)
{
	if(err)
	 {
	 	console.log(err);
		return res.render("home");	 	
	 }
else
{
	passport.authenticate("local")(req,res,function()
{
if (req.body.categ == "organization")
{
	res.redirect("/ngo/"+req.user.id);
}
else
{
	res.redirect("/ngo");
}
});
}
});		 	
});

app.get("/login",function(req,res)
{
	res.render("login",{sign:Sign});
});

app.post("/login",(req,res) =>
{
passport.authenticate('local',

(err,user,info) => 
{
if (err) 
{

return console.log(err);

}

if (!user) 
{
	return res.redirect('/login');
}

req.login(user,function(err)
{

if (err) 
{
return next(err);
}   
if (user.isOrg == "organization")
{   
	return res.redirect("/ngo/"+req.user.id);
}
else
{
	return res.redirect("/ngo");
}	
});
})
(req,res);
});

app.get("/logout",function(req,res)
{

req.logout();
res.redirect("/home");

});


function isLoggedIn(req,res,next)
{                                
	if (req.isAuthenticated())   
	{
		return next();
	}
	else
	{
		res.redirect("/login");
	}
}
   
app.listen(7000,function()
{  
console.log("server started");
});