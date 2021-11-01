const express = require("express"); 
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

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

      jwt.sign({ username, email, id }, process.env.SECRETKEY, (err, token) => {
        if (err) return res.status(500).json({ message: "Internal Server Error" });
        return res.status(200).json({ token, message: "User registered successfully" });
      });

    } catch (err) {
      res.status(500).send({ message: "Internal Server Error" });
    }
});

app.get('/users', (req, res) => {
    res.send({users});
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App running on port:${PORT}`)
})