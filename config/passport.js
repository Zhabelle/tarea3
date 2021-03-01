const passport=require('passport');
const GS=require('passport-google-oauth20').Strategy;
const dbstuff=require('../data/dbmngr');

passport.use(new GS({clientID:process.env.CLIENT_ID,clientSecret:process.env.CLIENT_SECRET,callbackURL:'http://localhost:5432/auth/google/callback'},
    function(aToken,rToken,p,done){console.log(p);done(null,p);}
));

passport.serializeUser(async(u,done)=>{
    console.log(u);
    const aidi=parseInt(Math.sqrt(Math.sqrt(u.id)));
    (await dbstuff).query('select * from users where id=$1',[aidi],async(err,r)=>{
        if(err) {console.error(err);return;}
        console.log("r",r);
        const user=r.rows[0];
        if(!user)
            (await dbstuff).query('insert into users("id","name","email","pica") values($1,$2,$3,$4)',[aidi,u.displayName,u.emails[0].value,u.photos[0].value],(err2,r)=>{
                if(err2) {console.error(err2);return;}
            });
    });
    done(null,aidi);
});

passport.deserializeUser(async(id,done)=>{
    if(id>=1000000000000000000)id=parseInt(Math.sqrt(Math.sqrt(id)));
    console.log(id);
    (await dbstuff).query('select u.id,u.name "displayName",u.email,u.pica from users u where id=$1',[id],async(err,r)=>{
        if(!err){
            const user=r.rows[0];
            if(user)
                done(null,r.rows[0]);
            else
                done();
        }else console.error(err);
    });
});