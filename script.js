var coinDict = {};

setInterval(getSimplePrice, 1000, "bitcoin")
setInterval(getHistorical, 1000, "yearn-finance")

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
    //console.log(coinURL);
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
          console.log(coinPrice[coin]["usd"]);
          console.log(coinPrice[coin]["last_updated_at"])
          document.getElementById(coin).innerHTML = coinPrice[coin]["usd"].toFixed(2);
      }
  };
  xmlhttp.open("GET", coinURL, true);
  xmlhttp.send();
}

function getHistorical(coin, numDays)
{
  const coinURL = 'https://api.coingecko.com/api/v3/coins/' + coin + '/market_chart?vs_currency=usd&days=' + numDays;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function()
  {
      if (this.readyState == 4 && this.status == 200)
      {
          var priceOverTime = JSON.parse(this.responseText);
          console.log(priceOverTime["prices"][0])
          document.getElementById(coin).innerHTML = priceOverTime['prices'][0][1].toFixed(2);
      }
  };
  xmlhttp.open("GET", coinURL, true);
  xmlhttp.send();
}
