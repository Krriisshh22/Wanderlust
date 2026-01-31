if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/public")));

app.use(express.urlencoded({ extended: true }));

const ExpressError = require("./utils/ExpressError.js");

const listingsRouter = require ("./routes/listing.js");
const reviewsRouter = require ("./routes/review.js");
const userRouter = require ("./routes/user.js");

// const mongoUrl = "mongodb://127.0.0.1:27017/wanderlust"
const dbUrl = process.env.ATLASDB_URL;

const mongoose = require("mongoose");
main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const session = require("express-session");
const MongoStore = require("connect-mongo")
const flash = require ("connect-flash")

const store = MongoStore.default.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log ("Error on mongo store");
})

const sessionOptions = {
  store,
  secret : process.env.SECRET,
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 7*24*60*60*1000,
    maxAge : 7*24*60*60*1000,
    httpOnly : true,
  },
}

const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")

app.use (session(sessionOptions));
app.use (flash());

app.use (passport.initialize()); // This is to initialize the password
app.use (passport.session());
passport.use (new LocalStrategy(User.authenticate()));

passport.serializeUser (User.serializeUser()); // To store the user info into  the session
passport.deserializeUser (User.deserializeUser()); // To remove the user info from the session

app.use ((req, res, next) => {
  res.locals.success = req.flash ("success");
  res.locals.error = req.flash ("error");
  res.locals.currUser = req.user;
  next();
})

// app.get ("/demoUser", async (req, res) => {
//   let fakeUser = new User ({
//     email : "st@gmail.com",
//     username : "delta",
//   });

//   let registeredUser = await User.register (fakeUser, "helloworld");
//   res.send (registeredUser);
// })

app.use ("/listings", listingsRouter);
app.use ("/listings/:id/reviews", reviewsRouter);
app.use ("/", userRouter);


// app.all("/:path(*)", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found"));
// });
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next) => {
  let { statusCode, message = "Something went wrong" } = err;
  res.render("error.ejs", { err });
  //   res.status(statusCode).send(message);
});

app.listen(port, () => {
  console.log("app is listening to port 3000");
})

app.get("/debug-user", (req, res) => {
  res.send({
    user: req.user,
    currUser: res.locals.currUser
  });
});

