//All coin IDS and their box IDS on the homepage
var homeCoins = {'bitcoin': 1, 'litecoin': 2, 'aave': 3, '88mph': 4, 'ethereum': 5, 'polkadot': 6, 'dogecoin': 7, '1inch': 8, 'cardano': 9, 'kompass': 10};

/*
    Call CoinGecko API. The call is async so we return a promise stating the value will be returned upon function completion
    @Param url: API url to access
    @Return: Promise referring to the JSON response from the API call
*/
const coinAPICall = async (url) =>
{
    console.log(url);
    const response = await (await fetch(url, {method: 'GET', mode: 'cors'})).json();
    return response;
}

/*
    Gets all coins currenly being tracked by CoinGecko and outputs them in a dictionary.
    Might be useful for later
*/
async function getCoins()
{
    //API access URL
    const listURL='https://api.coingecko.com/api/v3/coins/list';
    const coinData = await coinAPICall(listURL);
    //Insert data into a dicitonary
    for (var i = 0; i < coinData.length; i++)
    {
        coinDict[coinData[i].id] = coinData[i].name
    }
    //Currently just logs the dict. Can be configured as a return value, etc.
    console.log(coinDict);

}

/*
    Sets the name and price of a coin on the homepage to 10 decimal places
    @Param coin: Id of the given coin
    @Param box_id: box # to update
*/
const setHomeCoin = async (coin, box_id) =>
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
    const coinJSON = await coinAPICall(coinURL);
    //Capitaliize first leter of the coin ID
    coinName = coin.charAt(0).toUpperCase() + coin.slice(1);
    //Get the current price, image, ticker, and percent change from the coin's JSON data
    coinPrice = coinJSON['market_data']['current_price']['usd'];
    coinIMG = coinJSON['image']['thumb'];
    coinTicker = coinJSON['symbol'].toUpperCase();
    coinStatus = coinJSON['market_data']['price_change_percentage_24h'].toFixed(2);

    //Update doc to display price
    document.getElementById('box' + box_id).innerHTML = coinPrice;
    if(coinStatus.charAt(0) == '-')
    {
        //color red if lost value
        document.getElementById('change' + box_id).style.color = 'red';
        document.getElementById('change' + box_id).innerHTML = coinStatus + '%';
        makeChart(coin, box_id, 'red');
    }
    else
    {
        //color green if gained value
        document.getElementById('change' + box_id).style.color = 'green';
        document.getElementById('change' + box_id).innerHTML = '+' + coinStatus + '%';
        makeChart(coin, box_id, 'green');
    }
    document.getElementById('img' + box_id).src = coinIMG;
    document.getElementById('head' + box_id).innerHTML = '<a href="coin.html?id=' + coin + '">' + coinName + ' (' + coinTicker + ')' + '</a>';

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


async function getSimplePrice(coin)
{
    const coinURL = 'https://api.coingecko.com/api/v3/simple/price?ids=' + coin + '&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=true';
    const coinPrice = await coinAPICall(coinURl);
    document.getElementById('box1').innerHTML = coinPrice[coin]["usd"].toFixed(2);

}


/*
    gathers historical data and calls chart() to graph recent 24 vol and prices.
*/
const makeChart = async (coin, box_id, color) =>
{
    const coinURL = 'https://api.coingecko.com/api/v3/coins/' + coin + '/market_chart?vs_currency=usd&days=' + 1;
    var coinPrice = await coinAPICall(coinURL);
    chart(coinPrice['prices'], coinPrice['market_caps'], box_id, color);
}

/*
    creates chart for a given coin.
*/
const chart = (prices, mcs, box_id, color) =>
{
    var coinMC = [], coinPrice = [], labels = [];
    for (var i = 0; i < mcs.length; i++){
        coinMC[i] = mcs[i][1];
        coinPrice[i] = prices[i][1];
        if (i < 125) labels[i] = '';
    }
    new Chart(document.getElementById("chart" + box_id), {
        type: 'line',
        data: {
          labels: labels,
            datasets: [{
                data: coinPrice,
                label: "price",
                borderColor: color,
                pointBorderColor: 'none',
                fill: false
            }, {
                data: coinMC,
                label: "market cap",
                borderColor: color,
                pointBorderColor: 'none',
                fill: false,
                hidden: true
            }
            ]

        }
    });
}
