import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import aws from "aws-sdk";
import multerS3 from "multer-s3";



import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

//s3 = new aws.S3();
/*AWS CONFIG*/
// create a new instance
const bucketName = process.env.AWS_BUCKET_NAME;
const  accessKeyId = process.env.AWS_ACCESSKEYID;
const region = process.env.AWS_REGION;
const secretAccessKey = process.env.AWS_SECRETACCESSKEY;

aws.config.update({
  secretAccessKey: secretAccessKey,
  accessKeyId: accessKeyId,
  region: region
});

/*
s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: bucketName,
      key: function (req, file, cb) {
          console.log(file);
          cb(null, file.originalname); //use Date.now() for unique file keys
      }
  })
});*/

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
const uploads = multer({dest: 'public/assets'} );


app.post('public/assets', uploads.single('picture'), async function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  const file = req.file
  console.log (file)
  const result = await uploadFile(file)
  console.log(result)
  const description = req.body.description
});



//used by upload form
/*
app.post('/upload', upload.array('upl', 25), function (req, res, next) {
  res.send({
    message: "Uploaded!",
    urls: req.files.map(function(file) {
      return {url: file.location, name: file.key, type: file.mimetype, size: file.size};
    })
  });
});*/



/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`app running on Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));