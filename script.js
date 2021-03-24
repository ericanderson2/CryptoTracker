//All coin IDS and their box IDS on the homepage
var homeCoins = {'bitcoin': 1, 'litecoin': 2, 'aave': 3, '88mph': 4, 'ethereum': 5, 'polkadot': 6, 'dogecoin': 7, '1inch': 8, 'cardano': 9, 'kompass': 10};

/*
    Call CoinGecko API. The call is async so we return a promise stating the value will be returned upon function completion
    @Param url: API url to access
    @Return: JSON response from API
*/
const coinAPICall = async (url) =>
{
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
const setHomeCoin = async (coin) =>
{

    const coinURL = 'https://api.coingecko.com/api/v3/coins/' + coin + '?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false';
    const coinJSON = await coinAPICall(coinURL);
    //Capitaliize first leter of the coin ID
    coinName = coin.charAt(0).toUpperCase() + coin.slice(1);
    //Get the current price, image, ticker, and percent change from the coin's JSON data
    coinPrice = coinJSON['market_data']['current_price']['usd'];
    coinIMG = coinJSON['image']['thumb'];
    coinTicker = coinJSON['symbol'].toUpperCase();
    coinStatus = coinJSON['market_data']['price_change_percentage_24h'].toFixed(2);

    //Create container div for the coin
    const coinDiv = document.createElement('div');

    //Populate div with elements
    //Coin image
    divImg = document.createElement('img');
    divImg.src = coinIMG;
    divImg.classList.add('coinIMG');
    //Header with coin name, ticker, and a link to the separate page
    divName = document.createElement('h1');
    divName.innerHTML = '<a class="coin-header" href="coin.html?id=' + coin + '">' + coinName + ' (' + coinTicker + ')' + '</a>';
    //Price text
    divPrice = document.createElement('p');
    divPrice.innerHTML = coinPrice;
    divPrice.classList.add('Prices');
    //Percent change text
    divChange= document.createElement('p');
    divChange.classList.add('Changes');
    //Add elements to parent div
    coinDiv.appendChild(divImg);
    coinDiv.appendChild(divName);
    coinDiv.appendChild(divPrice);
    coinDiv.appendChild(divChange);
    //Create a div and canvas element for the graphs
    chartDiv = document.createElement('div');
    currChart = document.createElement('canvas');
    currChart.classList.add('chart');
    currChart.style.width = "300px";
    currChart.style.height = "300px";
    chartDiv.appendChild(currChart);
    coinDiv.appendChild(chartDiv);


    //Add the created div to the coin container
    document.getElementById('coin-container').appendChild(coinDiv);

    if(coinStatus.charAt(0) == '-')
    {
        //color red if lost value
        divChange.style.color = 'red';
        divChange.innerHTML = coinStatus + '%';
        makeChart(coin, currChart, 'red');
    }
    else
    {
        //color green if gained value
        divChange.style.color = 'green';
        divChange.innerHTML = '+' + coinStatus + '%';
        makeChart(coin, currChart, 'green');
    }
    
    return coinDiv;
    

}

/*
    Initialize all boxes on the home page with data
*/
async function initCoins()
{
    //TODO: Populate dictionary with coins to showcase
    


    for (var key in homeCoins)
    {
        //Display data for every coin and set an interval for them
        coinDiv = await setHomeCoin(key);
        coinDiv.classList.add('coin-box');
    }
    //setInterval(refreshCoinData, 10000);

}

/*
    Refreshes the data for each coin currently on the screen
*/
async function refreshCoinData()
{
    //Loop through all current coin boxes on the page
    var boxes = document.getElementsByClassName('coin-box')
    for(var i = 0; i < boxes.length; i++)
    {
        //Get data that needs to update: price, %change, and the graph
        const currBox = boxes[i];
        const boxChildren = currBox.childNodes;
        const coinName = boxChildren[1].innerHTML.match(/(?<=id=\s*).*?(?=\s*">)/gs);;
        const boxPrice = boxChildren[2];
        const boxChange = boxChildren[3];
        const chartDiv = boxChildren[4];

        chart = chartDiv.getElementsByClassName('chart')[0]
        console.log(chart);
        //Get new data and update the elements
        const coinURL = 'https://api.coingecko.com/api/v3/coins/' + coinName + '?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false';
        const coinJSON = await coinAPICall(coinURL);

        const newCoinPrice = coinJSON['market_data']['current_price']['usd'];
        const newCoinChange = coinJSON['market_data']['price_change_percentage_24h'].toFixed(2);
        boxPrice.innerHTML = newCoinPrice;

        if(newCoinChange.charAt(0) == '-')
        {
            //color red if lost value
            boxChange.style.color = 'red';
            boxChange.innerHTML = newCoinChange + '%';
            makeChart(coinName, chart, 'red');
        }
        else
        {
            //color green if gained value
            boxChange.style.color = 'green';
            boxChange.innerHTML = '+' + newCoinChange + '%';
            makeChart(coinName, chart, 'green');
        }

            
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
    @Param coin: Coin ID to get graph for
    @Param chart: Chart to create/update
    @Param color: Color of graph
*/
const makeChart = async (coin, chart, color) =>
{
    const coinURL = 'https://api.coingecko.com/api/v3/coins/' + coin + '/market_chart?vs_currency=usd&days=' + 1;
    var coinPrice = await coinAPICall(coinURL);

    var mcs = coinPrice['market_caps'];
    var prices = coinPrice['prices'];
    var coinMC = [], coinPrice = [], labels = [];
    for (var i = 0; i < mcs.length; i++){
        coinMC[i] = mcs[i][1];
        coinPrice[i] = prices[i][1];
        if (i < 125) labels[i] = '';
    }
    
    new Chart(chart, {
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

