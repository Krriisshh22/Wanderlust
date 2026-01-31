if (process.env.NODE_ENV !="production") {
    require('dotenv').config();
}
 

const express = require("express");
const app = express();  

const mongoose = require("mongoose"); 
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
main() 
.then(() => {  
    console.log("connection successful"); 
}) 
.catch(err => console.log(err));  
async function main(){  
    await mongoose.connect(dbUrl);  //mongoose
}  

const path = require("path"); 
const { get } = require("http");

app.set("view engine", "ejs");  
app.set("views", path.join(__dirname, "views")); 
// app.use(express.static(path.join(__dirname, "public"))); 

app.use(express.urlencoded({extended: true})); 

const methodOverride = require("method-override"); 
app.use(methodOverride("_method")); 

const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, "/public")));

const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
// const MongoStore = require('connect-mongo')(session);
// const MongoStore_Import = require('connect-mongo');
// const MongoStore = MongoStore_Import(session);
const MongoStore = require('connect-mongo').default;


// const session = require("express-session");
const flash = require("connect-flash");

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: "mysupersecretcode",
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};    

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


// app.get("/", (req, res) => {
//     res.send("Hey am working ");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

const contentRouter = require("./routes/content.js");
app.use("/content", contentRouter);

const reviewsRouter = require("./routes/review.js");
app.use("/content/:id/reviews", reviewsRouter);

const userRouter = require("./routes/user.js");
app.use("/", userRouter );

app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode=500, message="Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
}); //middleware

app.listen(8080, () => {
    console.log("starting");
});