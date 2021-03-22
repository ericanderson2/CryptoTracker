

//All coin IDS and their box IDS on the homepage
var homeCoins = {'bitcoin': 1, 'litecoin': 2, 'aave': 3, '88mph': 4, 'ethereum': 5, 'mooncoin': 6, 'dogecoin': 7, '1inch': 8, 'cardano': 9, 'kompass': 10};

/*
    Gets all coins currenly being tracked by CoinGecko and outputs them in a dictionary.
    Might be useful for later
*/
function getCoins()
{
    //API access URL
    const listURL='https://api.coingecko.com/api/v3/coins/list';
    //Create xmlhttp object
    var xmlhttp = new XMLHttpRequest();
    //Listener for whenever the request gets a response
    xmlhttp.onreadystatechange = function()
    {
        //If the request gets a state of 4(DONE) and status 200(OK), then we have some valid data
        if (this.readyState == 4 && this.status == 200)
        {
            //Parse response text into a JSON object
            var coinData = JSON.parse(this.responseText);
            //Insert data into a dicitonary
            for (var i = 0; i < coinData.length; i++) 
            {
                coinDict[coinData[i].id] = coinData[i].name
            }
            //Currently just logs the dict. Can be configured as a return value, etc.
            console.log(coinDict);
        }
    };
    //Formulate the GET request and send it to the API
    xmlhttp.open("GET", listURL, true);
    xmlhttp.send();
}

/*
    Sets the name and price of a coin on the homepage to 10 decimal places
    @Param coin: Id of the given coin
    @Param box_id: box # to update
*/
const setHomeCoin = (coin, box_id) =>
{
    //Get todays date. We need this b/c we're using the 'historical' API function and getting the current price. Kinda hacky but it gives us more precision
    //var today = new Date();
    //var dd = String(today.getDate()).padStart(2, '0');
    //var mm = String(today.getMonth() + 1).padStart(2, '0'); //Months are indexed at 0
    //var yyyy = today.getFullYear();

    //Parse the date objects into a string
    //today = dd + '-' + mm + '-' + yyyy;
    //const coinURL = 'https://api.coingecko.com/api/v3/coins/' + coin + '/history?date=' + today + '&localization=false';
    const coinURL = 'https://api.coingecko.com/api/v3/coins/' + coin + '?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            coinName = coin.charAt(0).toUpperCase() + coin.slice(1);
            coinJSON = JSON.parse(xmlhttp.responseText);
            coinPrice = coinJSON['market_data']['current_price']['usd'];
            coinIMG = coinJSON['image']['thumb'];
            coinTicker = coinJSON['symbol'].toUpperCase();
            coinStatus = coinJSON['market_data']['price_change_percentage_24h'].toFixed(2);
            
            //Update doc to display price
            document.getElementById('box' + box_id).innerHTML = coinPrice;
            if(coinStatus.charAt(0) == '-')
            {
                document.getElementById('change' + box_id).style.color = 'red';
                document.getElementById('change' + box_id).innerHTML = coinStatus + '%';
                makeChart(coin, box_id, 'red');
            }
            else
            {
                document.getElementById('change' + box_id).style.color = 'green';
                document.getElementById('change' + box_id).innerHTML = '+' + coinStatus + '%';
                makeChart(coin, box_id, 'green');
            }
            document.getElementById('img' + box_id).src = coinIMG;
            document.getElementById('head' + box_id).innerHTML = coinName + ' (' + coinTicker + ')';
        }
    };
    xmlhttp.open("GET", coinURL, true);
    xmlhttp.send();
}

/*
    Initialize all boxes on the home page with data
*/
function initCoins()
{
    //TODO: Populate dictionary with coins to showcase 

    
    for (var key in homeCoins) 
    {
        //Display data for every coin and set an interval for them
        setHomeCoin(key, homeCoins[key]);
        setInterval(setHomeCoin, 100000, key, homeCoins[key]);
    }
}


function getSimplePrice(coin)
{
  const coinURL = 'https://api.coingecko.com/api/v3/simple/price?ids=' + coin + '&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=true';
  //console.log(coinURL);
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function()
  {
      if (this.readyState == 4 && this.status == 200)
      {
          var coinPrice = JSON.parse(this.responseText);
          //console.log(coinPrice[coin]["usd"]);
          //console.log(coinPrice[coin]["last_updated_at"])
          document.getElementById('box1').innerHTML = coinPrice[coin]["usd"].toFixed(2);
      }
  };
  xmlhttp.open("GET", coinURL, true);
  xmlhttp.send();
}

/*
    gathers historical data and calls chart() to graph recent 24 vol and prices.
*/
const makeChart = (coin, box_id, color) =>
{
    const coinURL = 'https://api.coingecko.com/api/v3/coins/' + 'ethereum' + '/market_chart?vs_currency=usd&days=' + 1;
    var xmlhttp = new XMLHttpRequest();
    var btcPrice;
    xmlhttp.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            btcPrice = JSON.parse(this.responseText);
        }
     };
    xmlhttp.open("GET", coinURL, true);
    xmlhttp.send();

    const coinURL2 = 'https://api.coingecko.com/api/v3/coins/' + coin + '/market_chart?vs_currency=usd&days=' + 1;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            var coinPrice = JSON.parse(this.responseText);
            chart(coinPrice['prices'], btcPrice['prices'], box_id, color);
        }
     };
    xmlhttp.open("GET", coinURL2, true);
    xmlhttp.send();
}

/*
    creates chart for a given coin.
*/
const chart = (prices, mcs, box_id, color) =>
{
    var coinMC = [];
    var coinPrice = [];
    for (var i = 0; i < prices.length; i++){
        coinMC[i] = mcs[i][1];
        coinPrice[i] = prices[i][1];
    }
    new Chart(document.getElementById("chart" + box_id), {
        type: 'line',
        data: {
          labels: ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",
                    "","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
            datasets: [{ 
                data: coinPrice,
                label: "price",
                borderColor: color,
                pointBorderColor: 'none',
                fill: false
            }, { 
                data: coinMC,
                label: "btc",
                borderColor: 'grey',
                pointBorderColor: 'none',
                fill: true,
                hidden: true
            }
            ]
            
        }
    });
}
