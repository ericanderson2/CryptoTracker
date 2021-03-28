var allCoinList = [];

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
        allCoinList.push(coinData[i].id);
    }
    return allCoinList;
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
    coinMarketData = data['sparkline_in_7d']['price'];
    coinStatus =  data['price_change_percentage_7d_in_currency'];
    //If there is no 7 day price change, calculate it using the sparkline data
    if(coinStatus == null)
    {
        //Get opening price for the week
        initSevenDayPrice = coinMarketData[0];
        coinStatus = (coinPrice - initSevenDayPrice) / initSevenDayPrice;
    }
    coinStatus = coinStatus.toFixed(2);

    //Create container div for the coin
    const coinDiv = document.createElement('div');
    coinDiv.classList.add('coin-box-div');

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
    divStar.classList.add('fav-button');
    divStar.value = coinID;
    divStar.onclick = function(){checkCookie(this.value);};
    //Percent change text
    divChange= document.createElement('p');
    divChange.classList.add('Changes');
    //Add elements to parent div
    const headingDiv = document.createElement('div');
    const priceRow = document.createElement('div');
    headingDiv.classList.add('box-heading');
    priceRow.classList.add('box-prices');
    headingDiv.appendChild(divImg);
    headingDiv.appendChild(divName);
    headingDiv.appendChild(divStar);
    priceRow.appendChild(divPrice);
    priceRow.appendChild(divChange);
    coinDiv.appendChild(headingDiv);
    coinDiv.appendChild(priceRow);
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
    Gets a list of the most volatile coins to display on the homepage
    @Return: List of coins to display
*/
async function getHomeCoins()
{
    var coins = ['bitcoin', 'ethereum', 'litecoin']
    var urlStr = 'https://api.coingecko.com/api/v3/search/trending';
    var resp = await coinAPICall(urlStr);
    for(var i = 0; i < resp.coins.length; i++)
    {
        coins.push(resp.coins[i].item.id);
    }
    return coins;

}

/*
    Initialize all boxes on the home page with data
    @Param coinList: List of coin IDS to get data for
*/
async function initCoins(coinList, cssClass)
{
    //TODO: Populate dictionary with coins to showcase
    if(coinList == '')
    {
        coinList = await getHomeCoins();
    }

    //Put all elements in the array into 1 string with the below substring between them
    var urlStr = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + coinList.join('%2C%20') +
        '&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C1y';


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
        const headChildren = boxChildren[0].childNodes;
        const priceChildren = boxChildren[1].childNodes;
        const coinName = headChildren[1].innerHTML.match(/(?<=id=\s*).*?(?=\s*">)/gs);
        const boxPrice = priceChildren[0];
        const boxChange = priceChildren[1];
        const chartDiv = boxChildren[2];

        var coinMarketData = coinJSON['sparkline_in_7d']['price'];
        chart = chartDiv.getElementsByClassName('chart')[0];
        const newCoinPrice = coinJSON['current_price'];
        var newCoinChange;
        newCoinChange =  coinJSON['price_change_percentage_7d_in_currency'];
        //If there is no 7 day price change, calculate it using the sparkline data
        if(newCoinChange == null)
        {
            //Get opening price for the week
            initSevenDayPrice = coinMarketData[0];
            newCoinChange = (coinPrice - initSevenDayPrice) / initSevenDayPrice;
        }
        newCoinChange = newCoinChange.toFixed(2);
        boxPrice.innerHTML = newCoinPrice;

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
    Displays the coin on the single coin page
    @Param data: JSON data of the current coin
*/
const setSingleCoin = async (data, moreData) =>
{
     //Get coin ID
     coinID = data['id'];
     //Get coin name
     coinName = data['name'];
     //Get the current price, image, ticker, and percent change from the coin's JSON data
     coinPrice = data['current_price'];
     coinIMG = data['image'];
     coinTicker = data['symbol'].toUpperCase();

     coinMc = data['market_cap'];        // could be 0
     coinMcRank = data['market_cap_rank'];   // could be null
     coinTotalVol = data['total_volume'];
     coinHigh = data['high_24h'];
     coinLow = data['low_24h'];
     coinMaxSupply = data['max_supply'];
     coinCurSupply = data['circulating_supply'];

     coinAth = data['ath'];
     coinAthChange = data['ath_change_percentage'];
     coinAthDate = data['ath_date'];
     coinAtl = data['atl'];
     coinAtlChange = data['atl_change_percentage'];
     coinAtlDate = data['atl_date'];


    coinStatus = {}
    if (data['price_change_percentage_1h_in_currency']!=null)
        coinStatus['1h'] =  data['price_change_percentage_1h_in_currency'].toFixed(2);
    if (data['price_change_percentage_24h_in_currency']!=null)
        coinStatus['24h'] =  data['price_change_percentage_24h_in_currency'].toFixed(2);
    if (data['price_change_percentage_7d_in_currency']!=null)
        coinStatus['7d'] =  data['price_change_percentage_7d_in_currency'].toFixed(2);
    if (data['price_change_percentage_14d_in_currency']!=null)
        coinStatus['14d'] =  data['price_change_percentage_14d_in_currency'].toFixed(2);
    if (data['price_change_percentage_30d_in_currency']!=null)
        coinStatus['30d'] =  data['price_change_percentage_30d_in_currency'].toFixed(2);
    if (data['price_change_percentage_1y_in_currency']!=null)
        coinStatus['1y'] =  data['price_change_percentage_1y_in_currency'].toFixed(2);

    coinDesc = moreData['description']['en'];


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
     divStar.classList.add('fav-button');
     divStar.value = coinID;
     divStar.onclick = function(){checkCookie(this.value);};
     //Percent change text
     divChange = document.createElement('p');
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
     currChart.style.width = "400px";
     currChart.style.height = "300px";
     chartDiv.appendChild(currChart);
     coinDiv.appendChild(chartDiv);

     const table  = document.createElement('table');
     const tableLabels = document.createElement('tr');
     for (var key in coinStatus)
     {
        divStatus = document.createElement('th');
        divStatus.classList.add('price-table-single');
        divStatus.innerHTML = key;
        tableLabels.appendChild(divStatus);
     }
     table.appendChild(tableLabels);

     const tableData = document.createElement('tr');
     for (var key in coinStatus)
     {
        divStatus = document.createElement('th');
        divStatus.classList.add('price-table-single');
        tableData.appendChild(divStatus);

        if(coinStatus[key].charAt(0) == '-')
        {
            divStatus.style.color = 'red'
            divStatus.innerHTML = coinStatus[key] + '%';
        }
        else
        {
            divStatus.style.color = 'green'
            divStatus.innerHTML = '+' + coinStatus[key] + '%';
        }
     }
     table.appendChild(tableData);
     coinDiv.appendChild(table);

    if (coinDesc!=''){
        divDesc = document.createElement('p');
        divDesc.innerHTML = coinDesc;
        divDesc.classList.add('coin-desc-single');
        coinDiv.appendChild(divDesc);
    }


    const table2  = document.createElement('table');
    const tableEntry1 = document.createElement('tr');

    if (coinMc!=0){
        divRank = document.createElement('th');
        divRank.classList.add('price-table-single');
        divRank.innerHTML = 'Market Cap';
        tableEntry1.appendChild(divRank);

        divRank = document.createElement('th');
        divRank.classList.add('price-table-single');
        divRank.innerHTML = coinMc;
        tableEntry1.appendChild(divRank);
    }

    const tableEntry2 = document.createElement('tr');
    if (coinMcRank!=null){
        divMcRank = document.createElement('th');
        divMcRank.classList.add('price-table-single');
        divMcRank.innerHTML = 'Market Cap Rank';
        tableEntry2.appendChild(divMcRank);

        divMcRank = document.createElement('th');
        divMcRank.classList.add('price-table-single');
        divMcRank.innerHTML = coinMcRank;
        tableEntry2.appendChild(divMcRank);
    }

    const tableEntry3 = document.createElement('tr');
    if (coinTotalVol!=null){
        divVol = document.createElement('th');
        divVol.classList.add('price-table-single');
        divVol.innerHTML = 'Total Volume';
        tableEntry3.appendChild(divVol);

        divVol = document.createElement('th');
        divVol.classList.add('price-table-single');
        divVol.innerHTML = coinTotalVol;
        tableEntry3.appendChild(divVol);
    }

    const tableEntry4 = document.createElement('tr');
    if (coinHigh!=null){
        divHigh = document.createElement('th');
        divHigh.classList.add('price-table-single');
        divHigh.innerHTML = '24h High';
        tableEntry4.appendChild(divHigh);

        divHigh = document.createElement('th');
        divHigh.innerHTML = coinHigh;
        tableEntry4.appendChild(divHigh);
    }

    const tableEntry5 = document.createElement('tr');
    if (coinLow!=null){
        divLow = document.createElement('th');
        divLow.classList.add('price-table-single');
        divLow.innerHTML = '24h Low';
        tableEntry5.appendChild(divLow);

        divLow = document.createElement('th');
        divLow.innerHTML = coinLow;
        tableEntry5.appendChild(divLow);
    }

    const tableEntry6 = document.createElement('tr');
    if (coinMaxSupply!=null){
        divMaxSupply = document.createElement('th');
        divMaxSupply.classList.add('price-table-single');
        divMaxSupply.innerHTML = 'Max Token Supply';
        tableEntry6.appendChild(divMaxSupply);

        divMaxSupply = document.createElement('th');
        divMaxSupply.innerHTML = coinMaxSupply;
        tableEntry6.appendChild(divMaxSupply);
    }

    const tableEntry7 = document.createElement('tr');
    if (coinCurSupply!=0){
        divCurSupply = document.createElement('th');
        divCurSupply.classList.add('price-table-single');
        divCurSupply.innerHTML = 'Circulating Token Supply';
        tableEntry7.appendChild(divCurSupply);

        divCurSupply = document.createElement('th');
        divCurSupply.innerHTML = coinCurSupply;
        tableEntry7.appendChild(divCurSupply);
    }

    const tableEntry8 = document.createElement('tr');
    if (coinAth!=0){
        divAth = document.createElement('th');
        divAth.classList.add('price-table-single');
        divAth.innerHTML = 'All Time High';
        tableEntry8.appendChild(divAth);

        divAth = document.createElement('th');
        divAth.innerHTML = coinAth;
        tableEntry8.appendChild(divAth);
    }

    const tableEntry9 = document.createElement('tr');
    if (coinAthChange!=0){
        divAthChange = document.createElement('th');
        divAthChange.classList.add('price-table-single');
        divAthChange.innerHTML = 'All Time High Change';
        tableEntry9.appendChild(divAthChange);

        divAthChange = document.createElement('th');
        divAthChange.innerHTML = coinAthChange + '%';
        tableEntry9.appendChild(divAthChange);
    }

    const tableEntry10 = document.createElement('tr');
    if (coinAthDate!=null){
        divAthDate = document.createElement('th');
        divAthDate.classList.add('price-table-single');
        divAthDate.innerHTML = 'All Time High Date';
        tableEntry10.appendChild(divAthDate);

        divAthDate = document.createElement('th');
        divAthDate.innerHTML = coinAthDate.substring(0,10);
        tableEntry10.appendChild(divAthDate);
    }

    const tableEntry11 = document.createElement('tr');
    if (coinAtl!=0){
        divAtl = document.createElement('th');
        divAtl.classList.add('price-table-single');
        divAtl.innerHTML = 'All Time Low';
        tableEntry11.appendChild(divAtl);

        divAtl = document.createElement('th');
        divAtl.innerHTML = coinAtl;
        tableEntry11.appendChild(divAtl);
    }
    const tableEntry12 = document.createElement('tr');
    if (coinAtlChange!=0){
        divAtlChange = document.createElement('th');
        divAtlChange.classList.add('price-table-single');
        divAtlChange.innerHTML = 'All Time Low Change';
        tableEntry12.appendChild(divAtlChange);

        divAtlChange = document.createElement('th');
        divAtlChange.innerHTML = coinAtlChange + '%';
        tableEntry12.appendChild(divAtlChange);
    }

    const tableEntry13 = document.createElement('tr');
    if (coinAtlDate!=null){
        divAtlDate = document.createElement('th');
        divAtlDate.classList.add('price-table-single');
        divAtlDate.innerHTML = 'All Time Low Date';
        tableEntry13.appendChild(divAtlDate);

        divAtlDate = document.createElement('th');
        divAtlDate.innerHTML = coinAtlDate.substring(0,10);
        tableEntry13.appendChild(divAtlDate);
    }
    table2.appendChild(tableEntry1);
    table2.appendChild(tableEntry2);
    table2.appendChild(tableEntry3);
    table2.appendChild(tableEntry4);
    table2.appendChild(tableEntry5);
    table2.appendChild(tableEntry6);
    table2.appendChild(tableEntry7);
    table2.appendChild(tableEntry8);
    table2.appendChild(tableEntry9);
    table2.appendChild(tableEntry10);
    table2.appendChild(tableEntry11);
    table2.appendChild(tableEntry12);
    table2.appendChild(tableEntry13);
    coinDiv.appendChild(table2);

     document.getElementById('coin-container').appendChild(coinDiv);

     if(coinStatus['7d'].charAt(0) == '-')
     {
         //color red if lost value
         divChange.style.color = 'red';
         divChange.innerHTML = coinStatus['7d'] + '%';
         makeChart(coinMarketData, currChart, 'red');
     }
     else
     {
         //color green if gained value
         divChange.style.color = 'green';
         divChange.innerHTML = '+' + coinStatus['7d'] + '%';
         makeChart(coinMarketData, currChart, 'green');
     }
     return coinDiv;
}
/*
    Initialize coin on the single coin page
*/
async function initSingleCoin()
{
    var url = window.location.href;
    var id = [url.substring(url.indexOf("?id=") + 4)];

    var urlStr1 = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + id +
        '&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C1y';

    var urlStr2 = 'https://api.coingecko.com/api/v3/coins/' + id + '?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false';

    resp1 = await coinAPICall(urlStr1);
    resp2 = await coinAPICall(urlStr2);

    coinDiv = await setSingleCoin(resp1[0], resp2);
    coinDiv.classList.add('coin-box-single');
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
    for (var i = 0; i < coinData.length; i++)
        labels[i] = '';

    new Chart(chart, {
        type: 'line',
        data: {
          labels: labels,
            datasets: [{
                data: coinData,
                label: "price",
                borderColor: color,
                pointRadius: 0,
                pointBorderColor: 'none',
                fill: false
            }]

        }
    });
}

function checkCookie(coin)
{
    var cookie = getCookie(coin);
    if(cookie == "")
    {
        addCookie(coin);
    }
    else
    {
        deleteCookie(cookie);
    }
}

function addCookie(coin)
{
    var cookieNum = document.cookie.length + 1;

    let date = new Date(Date.now() + 86400e3);
    date = date.toUTCString();
    //Need to set expiration date for cookies or they're only for the current page load
    var cookieStr = cookieNum + '=' + coin + "; expires=" + date + "; SameSite=Strict; path=/;";
    document.cookie = cookieStr;
}

function loadCookies()
{
    if(document.cookie == "")
    {
        noPins = document.createElement('h1');
        noPins.innerHTML = "You haven't favorited any coins yet.";
        document.getElementById('main').appendChild(noPins);
        numCookies = 0;
        return;
    }
    else
    {
        var pinnedCoins = [];
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++)
        {
            c = ca[i].split('=');
            pinnedCoins.push(c[1]);
        }
        initCoins(pinnedCoins, 'coin-box');
    }
}

function deleteCookie(cookie)
{
    cookieStr = cookie +  "; expires=Thu, 01 Jan 1970 00:00:00 UTC; ; SameSite=Strict; path=/;";
    document.cookie = cookieStr;

    /*we have to update the cookies somehow after they are deleted
      this is the easiest but doesn't look great */
    if (window.location.pathname == "/pins.html") {
      window.location.reload();
    }
}

function getCookie(cname) {
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i=0; i < ca.length; i++)
    {
        c = ca[i].split('=');
        if (c[1] == cname)
        {
            return c.join('=');
        }
    }
    return "";
}

/* A different function from addCookie is necessary because if you add
  a pin from the pins screen the cookies need to be updated */
function addPin() {
  var id = document.getElementById("pin_input").value;
  addCookie(id);
  window.location.reload();
}
