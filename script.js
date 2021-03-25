

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
    Displays the coin on the current page
    @Param data: JSON data of the current coin
*/
const setHomeCoin = async (data) =>
{
    //Get coin ID
    coinID = data['id'];
    //Get coin name
    coinName = data['name'];
    //Get the current price, image, ticker, and percent change from the coin's JSON data
    coinPrice = data['current_price'];
    coinIMG = data['image'];
    coinTicker = data['symbol'].toUpperCase();
    coinStatus = data['price_change_percentage_24h'].toFixed(2);

    coinMarketData = data['sparkline_in_7d']['price'];
    
    //Create container div for the coin
    const coinDiv = document.createElement('div');

    //Populate div with elements
    //Coin image
    divImg = document.createElement('img');
    divImg.src = coinIMG;
    divImg.classList.add('coin-img');
    //Header with coin name, ticker, and a link to the separate page
    divName = document.createElement('h1');
    divName.innerHTML = '<a class="coin-header" href="coin.html?id=' + coinID + '">' + coinName + ' (' + coinTicker + ')' + '</a>';
    //Price text
    divPrice = document.createElement('p');
    divPrice.innerHTML = coinPrice;
    divPrice.classList.add('Prices');
    //Favorite star
    divStar = document.createElement('button');
    divStar.classList.add('iconify');
    divStar.setAttribute('data-icon', "dashicons:star-empty");
    divStar.addEventListener("click", addCookie());
    divStar.setAttribute('data-inline', "false");
    //Percent change text
    divChange= document.createElement('p');
    divChange.classList.add('Changes');
    //Add elements to parent div
    coinDiv.appendChild(divImg);
    coinDiv.appendChild(divName);
    coinDiv.appendChild(divPrice);
    coinDiv.appendChild(divChange);
    coinDiv.appendChild(divStar);
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
        makeChart(coinMarketData, currChart, 'red');
    }
    else
    {
        //color green if gained value
        divChange.style.color = 'green';
        divChange.innerHTML = '+' + coinStatus + '%';
        makeChart(coinMarketData, currChart, 'green');
    }
    
    return coinDiv;
    

}

/*
    Initialize all boxes on the home page with data
    @Param coinList: List of coin IDS to get data for
*/
async function initCoins(coinList, cssClass)
{
    //TODO: Populate dictionary with coins to showcase

    //Put all elements in the array into 1 string with the below substring between them
    var urlStr = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + coinList.join('%2C%20') + '&order=market_cap_desc&per_page=100&page=1&sparkline=true';
    console.log(urlStr);

    resp = await coinAPICall(urlStr);
    for (var i = 0; i < resp.length; i++)
    {
        //Display data for every coin and set an interval for them
        coinDiv = await setHomeCoin(resp[i]);
        coinDiv.classList.add(cssClass);
    }
    setInterval(refreshCoinData, 10000, urlStr);

}

/*
    Refreshes the data for each coin currently on the screen
*/
async function refreshCoinData(url)
{
    //Get new data on all of the current coins
    var resp = await coinAPICall(url);

    //Loop through all current coin boxes on the page
    var boxes = document.getElementsByClassName('coin-box')
    for(var i = 0; i < boxes.length; i++)
    {
        coinJSON = resp[i];
        //Get data that needs to update: price, %change, and the graph
        const currBox = boxes[i];
        const boxChildren = currBox.childNodes;
        console.log(boxChildren);
        const coinName = boxChildren[1].innerHTML.match(/(?<=id=\s*).*?(?=\s*">)/gs);
        const boxPrice = boxChildren[2];
        const boxChange = boxChildren[3];
        const chartDiv = boxChildren[5];

        var coinMarketData = coinJSON['sparkline_in_7d']['price'];
        chart = chartDiv.getElementsByClassName('chart')[0];
        const newCoinPrice = coinJSON['current_price'];
        const newCoinChange = coinJSON['price_change_percentage_24h'].toFixed(2);
        boxPrice.innerHTML = newCoinPrice;

        console.log(chartDiv);

        if(newCoinChange.charAt(0) == '-')
        {
            //color red if lost value
            boxChange.style.color = 'red';
            boxChange.innerHTML = newCoinChange + '%';
            makeChart(coinMarketData, chart, 'red');
        }
        else
        {
            //color green if gained value
            boxChange.style.color = 'green';
            boxChange.innerHTML = '+' + newCoinChange + '%';
            makeChart(coinMarketData, chart, 'green');
        }

            
    }
}

/*
    gathers historical data and calls chart() to graph recent 24 vol and prices.
    @Param coin: Coin ID to get graph for
    @Param chart: Chart to create/update
    @Param color: Color of graph
*/
const makeChart = async (coinData, chart, color) =>
{
    labels = [];
    for (var i = 0; i < 125; i++){
        labels[i] = '';
    }
    
    new Chart(chart, {
        type: 'line',
        data: {
          labels: labels,
            datasets: [{
                data: coinData,
                label: "price",
                borderColor: color,
                pointBorderColor: 'none',
                fill: false
            }]

        }
    });
}

function initSingleCoin()
{
    var url = window.location.href;
    var ids = [url.substring(url.indexOf("?id=") + 4)];
    initCoins(ids, 'coin-box-single');
}
function addCookie(coin)
{
    
}

function loadCookies()
{
    userCoins = document.cookie;
    console.log(userCoins);
    if(userCoins.length == 0)
    {
        noPins = document.createElement('h1');
        noPins.innerHTML = "You haven't favorited any coins yet.";
        document.getElementById('main').appendChild(noPins);
        numCookies = 0;
        return;
    }
    else
    {
        alert('here');
    }
}