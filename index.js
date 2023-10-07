import express, { response } from "express";
import bodyParser from "body-parser";
import mongoose, { mongo } from "mongoose";
import cors from "cors";
import twilio from "twilio"

const ACCOUNT_SID = "AC0eb38d20d8fe112936267e085dc14b1c"
const AUTH_TOKEN = "65293a2d4b5712b1bbf82fc0699a404c"
const TWILIO_NUMBER = "+19408182798"
const MONGO_DB_URL = "mongodb+srv://ameybhat19:tDgsL07mEI8kPoiB@cluster0.bvxljea.mongodb.net/"

const client = new twilio(ACCOUNT_SID, AUTH_TOKEN);


const app = express();
app.use(bodyParser.json());
app.use(cors());

// Generate a random 4-digit OTP

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};


let  otpSent
// Send OTP via Twilio
app.post('/api/sendOtp', (req, res) => {
  const phoneNumber  = req.body.number;
  otpSent = generateOTP();

  client.messages
    .create({
      body: `Your OTP is: ${otpSent}`,
      from: TWILIO_NUMBER,
      to: phoneNumber,
    })
    .then(() => {
      res.json({ message: 'OTP sent successfully' });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to send OTP' });
    });
});

// Verify OTP
app.post('/api/verifyOtp', (req, res) => {
  const  phoneNumber = req.body.number;
  const otpEntered = req.body.otp
  if (otpEntered === otpSent) {
    res.status(201).json({ message: "success" });
  } else {
    res.status(400).json({ message: "failure" });
  }
});


app.listen(5000, () => {
    console.log('Server listening on port 5000');
  });
  
try {
    const conn = await mongoose.connect(MONGO_DB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(error.message);
  }


const userDataDBSchema = mongoose.Schema({
    firstName : {type:String} , 
    lastName: {type:String} ,
    email : {type:String} ,
    password : {type:String} ,
    birthday : {type:String},
    mobile : {type:String} ,
    username: {type:String} ,
    gender : {type:String} ,
    member : {type:String}
})

const userDatabaseModel = mongoose.model("usersDatabase",userDataDBSchema)

app.post("/api/addNewUser",async (req, res) => {
    try {
      const { firstName, lastName, email, password , birthday , mobile ,
        username , gender  } = req.body;
    
      const newUser = new userDatabaseModel({ firstName, lastName, email, password , birthday , mobile , username , gender ,member:"None" });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: 'Error creating User' });
    }
  })

  app.put('/api/updatePassword', async (req, res) => {
    try {
      const { email, currentPassword , newPassword } = req.body;  
      await userDatabaseModel.updateOne({ email, currentPassword }, { $set: { password: newPassword } });
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/updateUsername', async (req, res) => {
    try {
      const { email, currentUsername , newUsername } = req.body;  
      await userDatabaseModel.updateOne({ email, currentUsername }, { $set: { username: newUsername } });
      res.json({ message: 'Username updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/updateMembership', async (req, res) => {
    try {
      const { email, username , membership } = req.body;  
      await userDatabaseModel.updateOne({ email, username }, { $set: { member: membership } });
      res.json({ message: 'Membership updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  


app.get("/api/getAllUsers",  async (req,res) => {
    try{
        const data = await userDatabaseModel.find({})
        res.json(data)
    }catch(error){
        res.status(500).json({ message: 'Error fetching data' });
    }
})

