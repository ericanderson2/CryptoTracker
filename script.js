
var coinDict = {};
function getCoins()
{
    const listURL='https://api.coingecko.com/api/v3/coins/list';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        var xmlhttp = new XMLHttpRequest();
        if (this.readyState == 4 && this.status == 200) 
        {
            var coinData = JSON.parse(this.responseText);
            for (var i = 0; i < coinData.length; i++) {
                coinDict[coinData[i].id] = coinData[i].name 
            }
            console.log(coinDict);
        }
    };
    xmlhttp.open("GET", listURL, true);
    xmlhttp.send();
}
function getPrice(coin)
{
    const coinURL = 'https://api.coingecko.com/api/v3/coins/' + coin + '?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false';
    console.log(coinURL);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            var coinPrice = JSON.parse(this.responseText);
            console.log(coinPrice);
        }
    };
    xmlhttp.open("GET", coinURL, true);
    xmlhttp.send();
}