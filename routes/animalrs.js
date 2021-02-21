const express = require('express');
//const data = require('../data/data.json');
const Joi=require('joi');
const axios = require('axios');
const dbstuff=require('../data/dbmngr');

const router = express.Router();
/*let animals = [];
for (let i = 0; i< 100; i++) {
  animals.push(data[i]);
}*/
let ID=0;

async function init() {
  (await dbstuff).query('select * from animals',(err,r)=>{
    r.rows.forEach(a=>ID=a.id>ID?a.id:ID);
  }); 
}

init();

const schema = Joi.object({
    animalname:Joi.string().min(1).required(),
    animalage:Joi.string().required(),
    basecolour:Joi.string(),
    breedname:Joi.string()
}).unknown(true);

router.get('/', async function(req, res, next) {
  const {owner}=req.query;
  const {animal}=req.query;
  if(owner&&animal){
    (await dbstuff).query('update animals set owner_id=$1 where id=$2',[owner,animal],(err,r)=>{
      if(err)return res.status(400).send(err);
    });
  }

  (await dbstuff).query('select a.*, u.name "owner" from animals a, users u where a.owner_id=u.id',(err,r)=>{
    const animales=r.rows;
    const animalsPromises = animales.map(() => {
      return new Promise((resolve, reject) => {
        axios.get('https://api.thecatapi.com/v1/images/search')
        .then(function({data}) {
          const [cat] = data;
          const {url} = cat;
          resolve(url);
        }).catch(function(error) {
          reject(error);
        });
      });
    });
  
    Promise.all(animalsPromises)
      .then(function(urls) {
        const animalsWithImage = animales.map((anim, index) => ({...anim, image: urls[index]}));
        res.render('index', { animalsWithImage });
      })
      .catch(function(errors) {
        res.send(`${errors}`)
      });
  });

});

router.get('/:id', async(req, res) => {
  const {id} = req.params;
  const {url} = req.query;
  const {adopt}=req.query;
  (await dbstuff).query('select a.*, u.name "owner" from animals a, users u where a.id=$1 and a.owner_id=u.id;',[id],(err,r)=>{
    if(!r)return res.status(404).send('not found');
    const a=r.rows[0];
    console.log(a);
    if(!a)return res.status(404).send('not found');
    if(adopt) return res.render('adoptamiento',{animalname: a.animalname,id:id});
    const properties = Object.keys(a).map(property => `${property}: ${a[property]}`)
    res.render('animal', {animalname: a.animalname, id: id, properties, image: url})
  });
});

router.post('/',async(req,res)=>{
    const resp=schema.validate(req.body);
    if(resp.error)return res.status(400).send(resp.error.details[0].message);
    const arr={
      id:++ID,
      animalname:req.body.animalname,
      breedname: req.body.breedname,
      basecolour: req.body.basecolour,
      speciesname: req.body.speciesname,
      animalage: req.body.animalage,
      owner_id: req.body.owner?req.body.owner:0
    };
    (await dbstuff).query('insert into animals values($1,$2,$3,$4,$5,$6,$7)',Object.values(arr),(err,r)=>{
      if(err)return res.status(400).send(err);
      res.send('animal creado<br/>'+JSON.stringify(arr));
    });
    /*animals.push(req.body);
    console.log(animals[animals.length-1]);
    res.send('animal creado<br/>'+mappedAnimal(req.body));*/
});

router.put('/:id',async(req,res)=>{
    const {id}=req.params;
    const ans=req.body;
    const resp=schema.validate(ans);
    if(resp.error)return res.status(400).send(resp.error.details[0].message);
    (await dbstuff).query(`update animals set animalname=$1,
      breedname=$2,basecolour=$3,
      speciesname=$4,animalage=$5,
      owner_id=$6 where id=$7`,
      [
        ans.animalname,ans.breedname,ans.basecolour,
        ans.speciesname,ans.animalage,ans.owner_id,id
      ],(err,r)=>{
        if(err)return res.status(400).send(err);
        res.send('animal actualizado<br/>'+JSON.stringify(ans));
    });
    /*let awa=animals.findIndex(a=>a.id==id);
    if(awa<0)return res.status(404).send('not found');
    Object.assign(animals[awa],req.body);
    animals[awa].id=parseInt(id);
    if(req.body.owner)animals[awa].owner=req.body.owner;
    res.send('animal actualizado<br/>'+mappedAnimal(animals[awa]));*/
});

router.delete('/:id',async(req,res)=>{
  const id=req.params.id;
  (await dbstuff).query('select * from animals where id=$1;',[id],async(err,r)=>{
    if(err)return res.status(400).send(err);
    const awa=r.rows[0];
    (await dbstuff).query('delete from animals where id=$1;',[id],(err2,r2)=>{
      if(err2)return res.status(400).send(err2);
      if(!awa)return res.status(404).send('not found');
      return res.send('animal eliminado<br/>'+JSON.stringify(awa));
    });
  });
    /*let awa=animals.findIndex(a=>a.id==req.params.id);
    if(awa<0)return res.status(404).send('not found');
    let an=animals[awa];
    animals.splice(awa,1);
    res.send("animal borrado<br/>"+mappedAnimal(an,getter(an.owner)));*/
});

module.exports = router;
