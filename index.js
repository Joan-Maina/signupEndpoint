const express = require("express"); 
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcryptjs')

require('dotenv').config();

const app = express();

const { signUpValidation, encryptPassword } = require("./helpers")

app.use(express.json())

const users = [];

app.post('/auth/register', async (req, res) => {
    const { error } = signUpValidation(req.body);
  
    if (error) return res.status(400).send({ message: error.details[0].message });
  
    const id = uuidv4();
  
    const { email, username, password, confirmpassword } = req.body;

    if(password !== confirmpassword) return res.status(203).send({ message: "Password mismatch" })
  
    const pass = await encryptPassword(password);
  
    try {
      users.push({id, email, username, pass});

      return res.status(201).send( {message: "User registered successfully" });

    } catch (err) {

      res.status(500).send({ message: "Internal Server Error" });

    }
});

app.get('/users', (req, res) => {
    res.send({users});
})

app.post('/auth/login', async(req, res) => {
  try{

    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    
    if(!user){

      return res.status(401).json({message: 'no such user exists'});

    }else{
      console.log(user.pass)
      let auth = await bcrypt.compare(password, user.pass)
       
console.log(auth);
  if(auth == false)res.status(401).send('wrong inputs')

 // if (err) return res.status(500).json({ message: "Internal Server Error" });

  // jwt.sign({ username, email, id }, process.env.SECRETKEY, (err, token) => {
  //   if (err) return res.status(500).json({ message: "Internal Server Error" });
  //   return res.status(200).json({ token, message: "User registered successfully" });
  // });
  jwt.sign({ email: user.email, username: user.username, password: user.password }, process.env.SECRETKEY, (err, token) => {
    return res.status(200).json({
      message: "login sucessful",
      token
    });
  });


}
}catch(error){
    res.status(500).send('jo');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App running on port:${PORT}`)
});