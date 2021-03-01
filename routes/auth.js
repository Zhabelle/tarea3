const express=require('express');
const passport=require('passport');

const router = express.Router();

router.get('/login',(req,res)=>{
    res.render('login');
});

router.get('/google',passport.authenticate('google',{scope:['profile','email']}));

router.get('/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),(req,res)=>{
    console.log('code',req.user);
    res.redirect('/profile');
});

router.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/');
});

module.exports=router;