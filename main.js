// Будущий массив с данными для конвертера
const rates = {}; 
// Будущий массив с данными для графика
const arrChart = {};

// Блок с текущим курсом 
const elementBTC = document.querySelector('[data-value="BTC"]');
const elementETH = document.querySelector('[data-value="ETH"]');

// Блок ввода и вывода 
const input = document.querySelector('#input');
const result = document.querySelector('#result');
const selectOut = document.querySelector('#select-out');
const selectIn = document.querySelector('#select-in');
const selectChart = document.querySelector('#select-chart');

async function getCurrencies() {
	// Обработка данных BTC/USD и ETH/USD из API для конвертера
	const respons = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum&vs_currencies=usd');
	const result = await respons.json();
	
	// Формируем массив со значениями курса
	rates.BTC = result.bitcoin.usd;
	rates.ETH = result.ethereum.usd;
	rates.USD = 1;
	console.log(rates.BTC);
	// Отображение текущего курса
	elementBTC.textContent = rates.BTC.toFixed(2);
	elementETH.textContent = rates.ETH.toFixed(2);
}
getCurrencies();

/* Конвертируем с учетом введенного значения в input 
	и указанного в select */
function convertValue() {
		result.value = (input.value * rates[selectIn.value] / rates[selectOut.value]).toFixed(3);
}
input.oninput = convertValue;
selectOut.oninput = convertValue;
selectIn.addEventListener('change', function() {
	convertValue();
})


// Обработка данных из API для графика
async function getChartdata() {
	const responsBTC = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=14&interval=daily');
	const resultBTC = await responsBTC.json();

	const responsETH = await fetch('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=14&interval=daily');
	const resultETH = await responsETH.json();

	// Массив с датами и соотевтсвующим значением курса
	const arrPricesBTC = resultBTC.prices;
	const arrPricesETH = resultETH.prices;

	// Массив с датами преобразованными из формата UNIX
	arrChart.date = arrPricesBTC.map(item => {
		let dates = new Date(item[0]);
		dates = dates.toGMTString();
		dates = dates.substring(0, dates.length - 18).slice(5);
		return dates;
	}) 

	// Массив с ценами на BTC
	arrChart.BTC = arrPricesBTC.map(item => {
		const priceBTC = item[1].toFixed(2);
		return priceBTC;	
	})
	// Массив с ценами на ETH
	arrChart.ETH = arrPricesETH.map(item => {
		const priceETH = item[1].toFixed(2);
		return priceETH;
	})
}
getChartdata();


// Отображение графика с использованием chart.js
function getChart() { 
	getChartdata().then(() => {
		const	labelsValue = arrChart.date;
		const dataValue = arrChart[selectChart.value]

		const dataDiagram = {
			labels: labelsValue,
			datasets: [{
			  label: `Курс ${selectChart.value}`,
			  backgroundColor: 'rgb(255, 99, 132)',
			  borderColor: 'rgb(255, 99, 132)',
			  data: dataValue,
			  fill: {
			  target: 'origin',
			  above: 'rgba(255, 99, 132, 0.5)',
			  }
			}]
		}

		const config = {
			type: 'line',
			data: dataDiagram,
			options: {}
		}

		let cryptoChart = new Chart(
			document.getElementById('crypto-chart'),
			config
		);
		selectChart.addEventListener('change', function() {
			cryptoChart.destroy();
		})
	})
}
getChart();
selectChart.addEventListener('change', function() {
	getChart();
})