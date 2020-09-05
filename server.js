const express = require('express');
const mongoose = require("mongoose");
const passport =  require("passport");
const LocalStrategy =  require("passport-local");
const bodyParser =  require("body-parser");
const adminRouter = require('./routes/admin');
const UserModel = require('./models/user');
const ArticleModel = require('./models/article');
const app = express();

/******************************* SETUP MONGODB ******************************/

mongoose.connect("mongodb://localhost/mdblog", { 
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/******************************* SETUP MONGODB ******************************/



/******************************* SETUP EXPRESS SESSION ******************************/

app.use(require("express-session")({
    secret: "Just testing",
    resave: false,
    saveUninitialized: false
}));

/******************************* SETUP EXPRESS SESSION ******************************/



/******************************* SETUP PASSPORT ******************************/

passport.serializeUser(UserModel.serializeUser());       //session encoding
passport.deserializeUser(UserModel.deserializeUser());   //session decoding
passport.use(new LocalStrategy(UserModel.authenticate()));

/******************************* SETUP PASSPORT ******************************/


/******************************* SETUP VIEW ENGINE & BODY PARSER ******************************/

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded(
    { extended:true }
))
app.use(passport.initialize());
app.use(passport.session());

/******************************* SETUP VIEW ENGINE & BODY PARSER ******************************/


/******************************* SETUP AUTH & AUTH ROUTE ******************************/

app.get('/login', (req, res) => {
    res.render('admin/login');
});

app.post("/login", passport.authenticate("local",{
    successRedirect:"/admin/home",
    failureRedirect:"/login"
}),function (req, res){

});

app.get('/register', (req, res) => {
    res.render('admin/register')
});

app.post("/register",(req,res)=>{
    const User = new UserModel({ username: req.body.username, email:req.body.email });

    UserModel.register(User, req.body.password, function(err, user){
        if(err){
            res.render("admin/register");
        }
        else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/login");
            });
        }
    });
});

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function isAuthenticated(req, res){
    if(req.isAuthenticated()){
        return true;
    }
    return false;
}

/******************************* AUTH ROUTE ******************************/

app.use('/admin', isLoggedIn ,adminRouter);

app.use('/src', express.static('src'));

app.get('/', (req, res) => {
    ArticleModel.find(function(err, data) {
        if(err){
            res.render('index', { articles: [], isAuthenticated: isAuthenticated(req, res) });
        }
        else {
            res.render('index', { articles: data, isAuthenticated: isAuthenticated(req, res) });
        }
    });
});

app.get('/article/:slug', (req, res) => {
    ArticleModel.findOne({ url: req.params.slug }, function(err, data){
        if(err){
            res.render('404');
        }
        else {
            res.render('article', { article: data, isAuthenticated: isAuthenticated(req, res) });
        }
    })
});

app.listen(5000);