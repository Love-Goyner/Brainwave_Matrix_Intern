require("dotenv").config();
const express = require("express");
const path = require("path");
const {mongoose} = require("mongoose");
const cookieParser = require("cookie-parser")
const checkForAuthenticationCookie = require("./middleware/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

//routes import 
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const Blog = require("./models/blog");

mongoose.connect(process.env.MONGODB_URL).then(e => console.log("db connected"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: false}))
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/" , async (req, res) => {
    const allBlogs = await Blog.find({}).populate("createdBy");
    return res.render("home", {
        user: req.user,
        blogs : allBlogs
    });
})

app.use("/user", userRoutes);
app.use("/blog", blogRoutes);

app.listen(PORT, () => {
    console.log(`server is running at port : http://localhost:${PORT}`);
    
})