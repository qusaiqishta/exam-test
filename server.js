'use strict'
//application dependences
const express = require('express');
const cors=require('cors');
const methodOverride=require('method-override');
const superagent=require('superagent');
const pg=require('pg');

//environmental virables
require('dotenv').config();
const PORT=process.env.PORT;
const DATABASE_URL=process.env.DATABASE_URL;

//application setup
const app=express();

//express mildware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

//specify directory for static resources
app.use(express.static('./public'));

//use cors
app.use(cors());
//set the view engine for server-side templating
app.set('view engine','ejs');

//database setup
const client=new pg.Client(DATABASE_URL);

//Routes

app.get('/',homeRoute);
app.get('/search',searchResult);
app.get('/allCountries',allCountries);
app.post('/records',addRecord);
app.get('/records',records);
app.get('/details/:id',viewDetails);
app.delete('/details/:id',deleteRecord)



function homeRoute(req,res){
    const url='https://api.covid19api.com/world/total'
    superagent.get(url).then(result =>{
        res.render('pages/index',{world:result.body})
    })
}


function searchResult(req,res){
    const{country,from,to}=req.query;
    const url=`https://api.covid19api.com/country/${country}/status/confirmed?from=${from}T00:00:00Z&to=${to}T00:00:00Z`;
    superagent.get(url).then(result =>{
        let searchArray=result.body.map(obj=>new SearchedCountry(obj));
        res.render('pages/getCountryResult.ejs',{search:searchArray})
    })

}

function allCountries(req,res){
    const url='https://api.covid19api.com/summary';
    superagent.get(url).then(result =>{
        let countries=result.body.Countries.map(obj=>new Country(obj));
        res.render('pages/allCountries',{wholeCountries:countries})
    })
    
}

function addRecord(req,res){
    let{country,totalconfirmed,totaldeaths,totalrecovered,date}=req.body;
    const sql='INSERT into covid (country,totalconfirmed,totaldeaths,totalrecovered,date) VALUES($1,$2,$3,$4,$5);';
    const safeValues=[country,totalconfirmed,totaldeaths,totalrecovered,date];
    client.query(sql,safeValues).then(()=>{
        res.redirect('/records')
    })
}


function records(req,res){
    const sql='SELECT * FROM covid;';
    client.query(sql).then(result=>{
        res.render('pages/records',{records:result.rows})
    })
}

function viewDetails(req,res){
    const countryId=req.params.id;
    const sql='SELECT * FROM covid WHERE id=$1;';
    const safeValues=[countryId];
    client.query(sql,safeValues).then(result=>{
        res.render('pages/details',{country:result.rows[0]})
    })
}


function deleteRecord(req,res){
    const countryId=req.params.id;
    const sql='DELETE FROM covid WHERE id=$1;';
    const safeValue=[countryId];
    client.query(sql,safeValue).then(()=>{
        res.redirect('/records')
    })

}


function Country(info){
    this.country=info.Country;
    this.totalConfirmed=info.TotalConfirmed;
    this.totalDeaths=info.TotalDeaths;
    this.totalRecovered=info.TotalRecovered;
    this.date=info.Date.slice(0,10);
}

function SearchedCountry(info){
    this.country=info.Country;
    this.cases=info.Cases;
    this.date=info.Date;
}


client.connect().then(()=>{
    app.listen(PORT,console.log('Server Up on ',PORT))
}).catch(error=>console.log(error))