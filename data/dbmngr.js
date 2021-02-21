const {Pool}=require('pg');
const pool=new Pool({
    user:'postgres',
    host:'localhost',
    database:'postgres',
    password:'mysecretpassword',
    port:3000
});

/*const data = require('./data.json');
const requs=["id", "animalname", "breedname", "speciesname", "animalage", "basecolour"];

for(let i=0;i<50;i++){
    let arr=[];
    Object.keys(data[i]).forEach(k=>{if(requs.includes(k))arr.push(data[i][k]);});
    pool.query('insert into animals values($1,$2,$3,$4,$5,$6,$7)',[...arr,null],(err,res)=>{
        if(err)console.log(err);
    });
}*/

/*pool.query('select * from animals',(err,res)=>{
    if(err)console.log(err);
    else console.log(res.rows);
});*/

module.exports=pool.connect();