const collections = require('../config/mongoCollections');
const express = require("express");
const router = express.Router();
const jsFunctions = require("../js")
const userData = collections.Users;

router.get('/login', async (req, res) => {
  return res.redirect("/"); 
})

router.get('/signup', async (req, res) => {
  return res.render('signup',{title:"Signup"});
})    

router.get('/', async (req, res) => {
    try {
        if (req.session.userId) {
            return res.redirect('private');
        } else {
            return res.render('login',{title: "Login"});
        }
    } catch (e) {
        res.status(404).json({ error: e.message });
    }
})

router.get("/private", async (req, res) => {
  try 
  {
    console.log("reached private");
    let session_ID = req.session.userId;
    const userObj =await jsFunctions.userFunctions.getUserByID(session_ID);
    return res.status(200).render("private", {userObj, title: "Private"});
  } 
  catch (e) 
  {
    res.status(404).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log("reached second login");
      let formData = req.body;
      let check = await jsFunctions.userFunctions.loggingTheUser(formData.email, formData.password);
      if (check!=-1) 
      {
        req.session.userId = formData.email;
        req.session.AuthCookie = req.sessionID;
        return res.status(200).redirect("private");
      } 
      else
      {
            res.status(401).render('login', { error: "Wrong Username or Password" });
      }
  } catch (e) {
      res.status(404).json({ error: e.message });
  }
})

router.post('/signup',async(req,res)=>{
  try 
  {
    console.log("reached second signup");
    let emailCheck = await jsFunctions.userFunctions.userExistsCheck(req.body.email);
        if(emailCheck===false)
        {
            res.status(401).render('signup', { error: "User already exists!" });
        }
        else
        {
          let signupObj = {
                            email : req.body.email,
                            firstname : req.body.first_name,
                            lastname : req.body.last_name,
                            password : req.body.password
                          }
                    console.log(signupObj);
          check = await jsFunctions.userFunctions.addUsertoDB(signupObj);
          if(check = true)
          {
            const userCollection = await userData();
            const currentUser = await userCollection.findOne({ email_id: req.session.email });
            res.render("private" , {title : 'Private' , currentUser});
          }
          else
          {
            res.status(404).json({ error: "Registration Unsuccessful" });
          }
        }  
  }
  catch (e)
  {
    res.status(404).json({ error: e.message });
  }
})

router.get('/logout', async (req, res) => {
  console.log("reached logout");
  req.session.destroy(function() {
      res.clearCookie('AuthCookie');
      return res.redirect("/");
    });
})

module.exports = router;