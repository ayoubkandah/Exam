'use strict'
require("dotenv").config()
const server = require('express')
const pg = require("pg")
// const cors=require("cors")
const superAgent = require("superagent")
const overRide = require("method-override")
const port = process.env.PORT
const app = server()
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
client.connect()
app.use(server.urlencoded({ extended: true }));
app.use(overRide('method'));
app.use(server.static('./public'));
app.set('view engine', 'ejs');

// app.use(cors());
app.listen(port, () => {

    console.log(port);
})

app.get('/', homePage)
app.post("/getCountryResult", countryResult)
app.post("/AllCountries", allCountries)
app.post("/saving",saveData)
app.get("/MyRecords", myRecordes)
app.get("/country/:id",getID)
app.delete("/country/:id",deleteData)
function deleteData(req,res){
    client.query(`delete from Countries where id=${req.params.id}`)
    res.redirect("/MyRecords")
}

function getID(req,res){
client.query(`select * from Countries where id=${req.params.id}`)
.then(result =>{
    // res.send(result.rows[0])
    res.render('pages/detail',{data:result.rows[0]})
})
}

function myRecordes(req,res){
client.query("select * from Countries")
.then(result=>{

// console.log(result.rowCount);
    res.render("pages/myrecordes.ejs",{data:result})
})

}

function saveData(req,res){
let{country,totalconfirmed,totaldeaths,totalrecovered,date}=req.body
let Arr=[country,totalconfirmed,totaldeaths,totalrecovered,date]
client.query("insert into Countries(country,totalconfirmed,totaldeaths,totalrecovered,date) values($1,$2,$3,$4,$5) returning *",Arr)
.then(result =>{
res.redirect('/MyRecords')
})
}
function allCountries(req, res) {
    let url = "https://api.covid19api.com/summary"

    superAgent(url).then(result => {
        let allData = result.body.Countries.map(function (item) {
            let country = new Country(item)
            return country
        })
        res.render("pages/AllCountries.ejs", { data: allData })
    })


}
function Country(data) {
    this.country = data.Country
    this.totalconfirmed = data.TotalConfirmed
    this.totaldeaths = data.TotalDeaths
    this.totalrecovered = data.TotalRecovered
    this.date = data.Date
}

function countryResult(req, res) {
    let { q, from, to } = req.body
    // console.log(from,to);
    let url = `https://api.covid19api.com/country/${q}/status/confirmed?from=${from}T00:00:00Z&to=${to}T00:00:00Z`
    superAgent.get(url).then(result => {
        // res.send(result.body)
        res.render('pages/getCountryResult', { data: result.body })
    })
}

function homePage(req, res) {
    let url = "https://api.covid19api.com/world/total"
    superAgent.get(url)
        .then(result => {


            //   res.send(result.body)
            res.render('pages/homepage', { data: result.body })
        })


}
