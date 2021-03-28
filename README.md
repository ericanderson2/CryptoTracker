# CryptoTracker
-------------------
There is a-lot of volatility within Cryptocurrencies -- asset's value can jump or fall within hours. While many complicating services exist to display coin data, none are aimed towards beginners. Our solution is an intuitive website that provides live updates on coins experiencing unusual growth or loss. 

Implementation
-------------------
We wrote async functions in JavaScript to gather live crypto data from Coin-Gecko's API and refresh it at certain time intervals. Using JavaSript, HTML and CSS we created a simple and intuitive dashboard complete with charts, prices, and price changes of 10 trending coins. In addition, each coin has its' own page containing more information such as a description of the coin and its all time low/high. In order to create the graphs, we used Chart.js and historical data with dynamic red/green coloring depending on price decrease/increase. Users can also create and manage a personalized portfolio as well as view the top 10 most volatile coins. This was accomplished though manipulating browser cookies -- we added functionalities for a user to add and remove a coin at their own discretion. 

Try out [CryptoTracker](https://ericanderson2.github.io/CryptoTracker/index.html).

Original Developers
-------------------

 * Stefon Miller - [Stefon Miller](https://github.com/StefonMiller)
 * Eric Anderson - [ericanderson2](https://github.com/ericanderson2)
 * Julian Galbraith-Paul - [honest-todd](https://github.com/honest-todd)
 * Charles Lefevre - [chucklefevre55](https://github.com/chucklefevre55)
 * 
Contribute
-------------------
Any contribution is appreciated. The currently known errors are registered in the Issues tab. Feel free to take a swing at any one of them.
For the more major features, there are the following that you can give a try:
* Page containing data for all coins 
* Better search functionality
If you want to implement something which is not on the list, feel free to do so anyway. If you want to merge it into our repo, then just send a pull request and we will have a look at it.
