# CryptoTracker

## There is a-lot of volatility within Cryptocurrencies -- asset's value can jump or fall within hours. While many complicating services exist to give information about coins, none are aimed towards beginners. Our solution is an intuitive website that provides live updates on coins experiencing unusual growth or loss. 

# Implementation

## We wrote async functions in JavaScript to gather live crypto data from Coin-Gecko's API and refresh it at certain time intervals. Using JavaSript, HTML and CSS we created a simple and intuitive dashboard complete with charts, prices, and price changes of 10 trending coins. In addition, each coin has its' own page containing more information such as a description of the coin and its all time low/high. In order to create the graphs, we used Chart.js and historical data with dynamic red/green coloring depending on price decrease/increase. Users can also create and manage a personalized portfolio as well as view the top 10 most volatile coins. This was accomplished though manipulating browser cookies -- we added functionalities for a user to add and remove a coin at their own discretion. 
