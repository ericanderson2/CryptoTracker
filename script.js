

//All coin IDS and their box IDS on the homepage
var homeCoins = {'bitcoin': 1, 'aapl': 2, 'aave': 3, '88mph': 4, 'ethereum': 5, 'mooncoin': 6, 'dogecoin': 7, 'dogz': 8, 'koto': 9, 'kompass': 10};

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
    console.log(coin);
    //Get todays date. We need this b/c we're using the 'historical' API function and getting the current price. Kinda hacky but it gives us more precision
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //Months are indexed at 0
    var yyyy = today.getFullYear();

    //Parse the date objects into a string
    today = dd + '-' + mm + '-' + yyyy;
    const coinURL = 'https://api.coingecko.com/api/v3/coins/' + coin + '/history?date=' + today + '&localization=false';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {

            coinPrice = JSON.parse(xmlhttp.responseText)['market_data']['current_price']['usd'];

            //Update doc to display price
            document.getElementById('box' + box_id).innerHTML = coinPrice;
            document.getElementById('head' + box_id).innerHTML = coin;
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
        makeChart(key, homeCoins[key], 15);
        setInterval(makeChart, 1000, homeCoins[key], key);
        setInterval(setHomeCoin, 1000, key, homeCoins[key]);
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

const makeChart = (coin, box_id, numDays) =>
{
    const coinURL = 'https://api.coingecko.com/api/v3/coins/' + coin + '/market_chart?vs_currency=usd&days=' + numDays;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            var priceOverTime = JSON.parse(this.responseText);
            chart(priceOverTime['prices'], box_id);
        }
     };
    xmlhttp.open("GET", coinURL, true);
    xmlhttp.send();
}

const chart = (data, box_id) =>
{
    if (data == null) return;
    
    var labels = [];    // grab dates or just say over the past x days (might be cleaner)
    var mc = [];            // add points for mc /
    var price = [];         
    for (var i = 0; i < data.length; i++){
        mc[i] = data[i][0];
        price[i] = data[i][1];
    }
    new Chart(document.getElementById("chart" + box_id), {
        type: 'line',
        data: {
        //   labels: labels,
            datasets: [{ 
                data: price,
                label: "price",
                borderColor: "#3e95cd",
                fill: false
            }, { 
                data: mc,
                label: "marketcap",
                borderColor: "#8e5ea2",
                fill: false,
                hidden: true
            }
            ]
        }
    });
}
