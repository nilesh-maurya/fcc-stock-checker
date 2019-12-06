/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');
const axios = require('axios');

mongoose.connect(process.env.DB, {useNewUrlParser: true});

const stockSchema = mongoose.Schema({
  stock: String,
  IP: [String],
  likes: Number
})

const Stock = mongoose.model('Stock', stockSchema)

module.exports = function (app) {

  const getStockData = async (req, res, next) => {
    // Initialize stock objects
    res.locals.stock1 = {};
    res.locals.stock2 = {};
    // Find the ip address of device
    res.locals.ip = req.connection.remoteAddress || req.headers['x-forwarded-for'].split(',')[0];
    // convert string to boolean
    req.query.like = req.query.like === 'true';
    
    try{
      let stock = (Array.isArray(req.query.stock)) ? req.query.stock[0] : req.query.stock;
      let data = await axios.get(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`);
      res.locals.stock1.price = data.data.latestPrice;
      res.locals.stock1.stock = data.data.symbol;
      console.log(res.locals.stock1);
    } catch(e){
      return new Error(e);
    }
    
    if(Array.isArray(req.query.stock)){
      try{
        let data = await axios.get(`https://repeated-alpaca.glitch.me/v1/stock/${req.query.stock[1]}/quote`);
        res.locals.stock2.price = data.data.latestPrice;
        res.locals.stock2.stock = data.data.symbol;
      } catch(e) {
          return new Error(e);
      }
    }
    
    console.log(res.locals);
    next();
  }
  
  
  const likeHandler = async function(stock, IP){
    let result = await Stock.findOne({ stock: stock });
    if(!result){
      let newDoc = await new Stock({
        stock: stock,
        IP: IP,
        likes: 1
      }).save();
      return 1;
    }
    else if(result.IP.includes(IP)){
      console.log("already liked the stock");
      return result.likes;
    }
    else{
      result.likes += 1;
      result.IP.push(IP);
      let newDoc = await result.save();
      return newDoc.likes;
    }
  }
  
  const getLikes = async function(stock){
    let result = await Stock.findOne({ stock: stock });
      if(result)
        return result.likes;
      else
        return 0;
  }
  
  const appendLikes = async function(req, res, next){
    console.log("apppendLikes");
    if(!req.query.like && (typeof req.query.stock === 'string')){
      console.log("1: no like, no array");
      res.locals.stock1.likes = await getLikes(req.query.stock);
    } 
    else if(req.query.like && (typeof req.query.stock === 'string')){
      console.log("2:like, no array");
      res.locals.stock1.likes = await likeHandler(req.query.stock, res.locals.ip);
    }
    else if(!req.query.like && Array.isArray(req.query.stock)){
      console.log("3: no like, array");
      let like1 = await getLikes(req.query.stock[0]);
      let like2 = await getLikes(req.query.stock[1]);
      res.locals.stock1.rel_likes = like1 - like2;
      res.locals.stock2.rel_likes = like2 - like1;
    }
    else if(req.query.like && Array.isArray(req.query.stock)){
      console.log("4: like,array");
      let like1 = await likeHandler(req.query.stock[0], res.locals.ip);
      let like2 = await likeHandler(req.query.stock[1], res.locals.ip);
      res.locals.stock1.rel_likes = like1 - like2;
      res.locals.stock2.rel_likes = like2 - like1;
    }
    next();
  }
  
  app.route('/api/stock-prices')
    .get(getStockData, appendLikes, function (req, res){
      console.log(req.query);
      console.log(req.headers['x-forwarded-for']);
      const result = {};
      if(Array.isArray(req.query.stock)){
        result.stockData = [res.locals.stock1, res.locals.stock2];
      } else {
        result.stockData = res.locals.stock1;
      }
      console.log(result);
      res.json(result);
    });
    
};
