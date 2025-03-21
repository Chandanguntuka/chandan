if(process.env.NODE_ENV != "production"){
    
require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); 
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewrouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//step3
// const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";
const dburl = process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});
async function main(){
  //  await mongoose.connect(MONGO_URL);
  await mongoose.connect(dburl);
}//serving at database to call them by callback func

console.log("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));

// console.log("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate); 
app.use(express.static(path.join(__dirname,"/public")));//using static filess css

const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24*3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized : true,
  cookie: {
    expires: Date.now() + 7* 24 * 60 * 1000,
    maxAge :  7* 24 * 60 * 1000,
    httpOnly : true,
  },
};



// app.get("/",(req,res)=>{
//   res.send("app is working");
// });



app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  res.locals.success =req.flash("success");
  res.locals.error =req.flash("error");
  res.locals.currUser = req.user;
  // console.log(res.locals.success);
  next();
});

// app.get("/demouser", async(req,res)=> {
//   let fakeUser  =new User ({
//     email : " chandan123@gmail.com",
//     username:"chandan775",
//   });

//   let registeredUser = await User.register(fakeUser, " hello world");
//   res.send(registeredUser);
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews", reviewrouter);
app.use("/", userRouter);

app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page Not Found"));
})
app.use((err,req,res,next)=>{
  let {statusCode=500, message="Something went wrong"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs",{  message  });
  // res.send("somthing went wrong");
})

//step1
app.listen(8083,()=>{
    console.log("server is listening to port");
})