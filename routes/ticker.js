const express = require("express");
const router = express.Router();
const iex = require('../models/iex');
const portfolioValues = require('../controller/portfolio_values');
const returns = require('../controller/returns');
const db = require('../models/conn');
const stacksDB = require('../models/stacksDB');
const tickerList = require('../models/tickerList');
const numeral = require('numeral');


router.post("/", async(req, res, next) => {

  const {ticker} = req.body;
  let upperTicker = ticker.toUpperCase();
  let tickerFound = tickerList.tickers.includes(upperTicker);
  console.log(tickerFound);

  if (tickerFound) {
    res.status(200).redirect(`/ticker/${upperTicker}`);
  } else {
    res.redirect('back');
  }

});

router.get("/:ticker", async(req, res, next) => {

  const ticker = req.params.ticker;

  const companyStockInfo = await iex.getStockPrice(ticker);
  const stockData = await companyStockInfo.data;
  // console.log(stockData);

  const companyNews = await iex.getSingleCompanyNews(ticker);
  const newsData = await companyNews.data;
  // console.log(companyNews);

  let userPositions = await stacksDB.getPositionDataForUser(req.session.user_id, ticker);
  userPositions.position[0].value = numeral(userPositions.position[0].num_shares * stockData.latestPrice).format('$0,0.00');
  console.log(userPositions);

  let userCash = await stacksDB.getPositionDataForUser(req.session.user_id, 'USERCASH');
  let cash = numeral(userCash.position[0].num_shares).format('$0,0.00');
  console.log('USERCASH: ', cash);

  res.render("template", {
      locals: {
          title: "",
          isLoggedIn: req.session.is_logged_in,
          userFirstName: req.session.first_name,
          user_id: req.session.user_id,
          companyStockData: stockData,
          companyNewsData: newsData,
          position: userPositions.position[0],
          cash: cash
      },
      partials: {
          partial: "partial-ticker"
      }
  });


});


module.exports = router;