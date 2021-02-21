const express = require('express');
const router = express.Router();
const Joi=require('joi');
let users=require('../data/users.json');
const dbstuff=require('../data/dbmngr');
let ID=0;

async function init() {
  (await dbstuff).query('select * from users',(err,r)=>{
    r.rows.forEach(u=>ID=u.id>ID?u.id:ID);
  }); 
}

init();

const schema=Joi.object({
  name:Joi.string().min(1).required(),
  age:Joi.number().greater(0).required()
});

router.get('/',async function(req, res) {
  (await dbstuff).query('select * from users',(err,r)=>{
    res.send(r.rows);
  });
});

router.post('/',async(req,res)=>{
  const resp=schema.validate(req.body);
  if(resp.error)res.status(400).send(resp.error.details[0].message);
  (await dbstuff).query('insert into users values($1,$2,$3);',[++ID,req.body.name,req.body.age],(err,r)=>{
    res.send('Usuario creado<br/>'+JSON.stringify({id:ID,name:req.body.name,age:req.body.age}));
  });
  /*users.push(req.body);
  res.send('Usuario creado<br/>'+JSON.stringify(req.body));*/
});

router.put('/:id',async(req,res)=>{
  const resp=schema.validate(req.body);
  if(resp.error)return res.status(400).send(resp.error.details[0].message);
  const {id}=req.params;
  (await dbstuff).query('update users set name=$1, age=$2 where id=$3',[req.body.name,req.body.age,id],(err,r)=>{
    res.send('Usuario actualizado<br/>'+JSON.stringify({id:id,name:req.body.name,age:req.body.age}));
  });
  /*let uwu=users.findIndex(a=>a.id==id);
  if(uwu<0)return res.status(404).send('not found');
  Object.assign(users[uwu],req.body);
  res.send('Usuario actualizado<br/>'+JSON.stringify(users[uwu]));*/
});

router.delete('/:id',async(req,res)=>{
  const id=req.params.id;
  console.log("deletus "+id);
  (await dbstuff).query('select * from users where id=$1;',[id],async(err,r)=>{
    if(err)return res.status(400).send("err");
    const awa=r.rows[0];
    (await dbstuff).query('delete from users where id=$1;',[id],async(err2,r2)=>{
      console.log(awa)
      if(err2)return res.status(400).send("err2");
      if(!awa)return res.status(404).send('not found');
      (await dbstuff).query('update animals set owner_id=0 where owner_id=$1',[id],(err3,_)=>{
        if(err3)return res.status(400).send("err3");
        return res.send('usuario eliminado<br/>'+JSON.stringify(awa));
      });
    });
  });
  /*let uwu=users.findIndex(u=>u.id==req.params.id);
  if(uwu<0)return res.status(404).send('not found');
  let user=users[uwu];
  users.splice(uwu,1);
  killer(user.id);
  res.send("Usuario borrado<br/>"+JSON.stringify(user));*/
});

function getter(id) {
  if(!id)return undefined;
  let uwu=users.find(u=>u.id==id);
  return uwu?uwu.name:undefined;
}

module.exports = router;
