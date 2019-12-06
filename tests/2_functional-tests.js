/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, "res.body is object");
            assert.property(res.body, 'stockData');
            assert.isObject(res.body.stockData, 'res.body.stockData is invalid');
            assert.property(res.body.stockData, 'stock');
            assert.property(res.body.stockData, 'price');
            assert.property(res.body.stockData, 'likes');
            assert.isNumber(parseFloat(res.body.stockData.price), 'res.body.stockData.price is invalid');
            assert.isNumber(res.body.stockData.likes, 'res.body.stockData.likes is invalid.');
            
          //complete this one too
          
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'goog'})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, "res.body is object");
            assert.property(res.body, 'stockData');
            assert.isObject(res.body.stockData, 'res.body.stockData is invalid');
            assert.property(res.body.stockData, 'stock');
            assert.property(res.body.stockData, 'price');
            assert.property(res.body.stockData, 'likes');
            assert.isNumber(parseFloat(res.body.stockData.price), 'res.body.stockData.price is invalid');
            assert.isNumber(res.body.stockData.likes, 'res.body.stockData.likes is invalid.');
            assert.equal(res.body.stockData.likes, 1, 'likes are not updated.');
            done();
        })
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'goog' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, "res.body is object");
            assert.property(res.body, 'stockData');
            assert.isObject(res.body.stockData, 'res.body.stockData is invalid');
            assert.property(res.body.stockData, 'stock');
            assert.property(res.body.stockData, 'price');
            assert.property(res.body.stockData, 'likes');
            assert.isNumber(parseFloat(res.body.stockData.price), 'res.body.stockData.price is invalid');
            assert.isNumber(res.body.stockData.likes, 'res.body.stockData.likes is invalid.');
            assert.equal(res.body.stockData.likes, 1, 'likes are not doubly counted');
            done();
        })
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['goog', 'FB'] })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, "res.body is object");
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData, 'res.body.stockData is invalid');
            res.body.stockData.forEach(stockData => {
              assert.property(stockData, 'stock');
              assert.property(stockData, 'price');
              assert.property(stockData, 'rel_likes');
              assert.isNumber(parseFloat(stockData.price), 'res.body.stockData.price is invalid');
              assert.isNumber(stockData.rel_likes, 'res.body.stockData.likes is invalid.');
            });
            
            done();
        })
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['goog', 'FB'] })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, "res.body is object");
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData, 'res.body.stockData is invalid');
            res.body.stockData.forEach(stockData => {
              assert.property(stockData, 'stock');
              assert.property(stockData, 'price');
              assert.property(stockData, 'rel_likes');
              assert.isNumber(parseFloat(stockData.price), 'res.body.stockData.price is invalid');
              assert.isNumber(stockData.rel_likes, 'res.body.stockData.likes is invalid.');
              assert.equal(stockData.rel_likes, 0, 'likes are not updated.');
            });
            
            done();
        });
      });
      
    });

});
