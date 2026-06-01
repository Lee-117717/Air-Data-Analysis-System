/**
 * 空气质量可视化平台 - 图表逻辑模块
 * 功能：负责数据加载、图表渲染及交互逻辑
 * 依赖：需全局引入 ECharts（通过 script 或模块化方式）
 */

// 全局状态定义
const appState = {
	currentCity: '北京',
	airData: {},
	echarts: window.echarts || {},
	chartInstances: {}
};

// ====================== 初始化与对外暴露 ====================== 
window.initCharts = function(city) {
	appState.currentCity = city;
	return loadCityData(city).then(() => {
		renderAllCharts();
	});
};

// 数据加载与初始化
function initAppFlow() {
	document.addEventListener('DOMContentLoaded', () => {
		loadAirQualityData()
			.then(() => {
				initCitySelector();
				loadCityData(appState.currentCity);
			})
			.catch(handleInitError);
	});
}
initAppFlow();

// ====================== 数据加载逻辑 ====================== 
// 加载空气质量数据
function loadAirQualityData() {
	return fetch('/data/air_quality_data.json')
		.then(handleResponse)
		.then(data => {
			console.log('加载的完整数据:', data);
			appState.airData = data;
			return appState.airData;
		});
}

/**
 * 加载城市空气质量数据
 * @param {string} city 城市名称
 */
function loadCityData(city) {
	return new Promise((resolve, reject) => {
		appState.currentCity = city;
		toggleLoading(true);

		const cityData = appState.airData[city];

		if (cityData) {
			console.log(`成功加载 ${city} 数据，年份范围:`, Object.keys(cityData));
			renderAllCharts();
			resolve();
		} else {
			console.error(`城市 ${city} 数据不存在`);
			alert(`城市 ${city} 数据不存在，请选择其他城市`);
			reject(new Error(`城市 ${city} 数据不存在`));
		}

		toggleLoading(false);
	});
}

// ====================== 图表渲染核心逻辑 ====================== 
// 渲染所有图表
function renderAllCharts() {
	console.log('当前渲染数据年份范围:', Object.keys(appState.airData[appState.currentCity]));
	destroyOldCharts();

	const chartModules = [{
			id: 'aqi-trend-headers',
			title: 'AQI 月度趋势',
			subTitle: `${appState.currentCity} AQI 月度趋势`,
			renderer: renderAQITrend
		},
		{
			id: 'aqi-bar-headers',
			title: '月度 AQI 柱状图对比',
			subTitle: `${appState.currentCity} 月度 AQI 柱状图`,
			renderer: renderAQIBar
		},
		{
			id: 'pollutant-compare-headers',
			title: '污染物浓度对比',
			subTitle: `${appState.currentCity} 污染物浓度对比`,
			renderer: renderPollutantCompare
		},
		{
			id: 'grade-pie-headers',
			title: '空气质量等级分布',
			subTitle: `${appState.currentCity} 空气质量等级分布`,
			renderer: renderGradePie
		}
	];

	chartModules.forEach(module => {
		renderChartHeaders(module.id, module.title, module.subTitle);
		module.renderer();
	});
}

// 销毁旧图表实例
function destroyOldCharts() {
	Object.keys(appState.chartInstances).forEach(id => {
		const chart = appState.chartInstances[id];
		if (chart) {
			chart.off('click');
			chart.off('mousemove');
			chart.dispose();
			appState.chartInstances[id] = null;
		}
	});
}

// ====================== 单个图表渲染函数 ====================== 
// 渲染 AQI 月度趋势图（折线图）- 固定Y轴
function renderAQITrend() {
	const dom = document.getElementById('aqi-trend');
	if (!dom) return;

	const myChart = echarts.init(dom);
	const {
		xAxisData,
		seriesData
	} = prepareTimeSeriesData();

	const option = {
		grid: {
			left: '1%',
			right: '5%',
			bottom: '15%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: xAxisData,
			axisLabel: {
				rotate: 45,
				interval: 0,
				margin: 20,
				formatter: (value) => value
			},
			axisTick: {
				show: false
			}
		},
		yAxis: {
			type: 'value',
			name: 'AQI',
			position: 'left',
			nameGap: 18,
			alignTicks: true
		},
		series: [{
			name: 'AQI',
			type: 'line',
			data: seriesData,
			smooth: true,
			label: {
				show: true,
				position: 'top',
				color: '#333'
			},
			itemStyle: {
				color: '#8e75ba'
			}
		}],
		dataZoom: [{
			type: 'slider',
			xAxisIndex: 0,
			start: 0,
			end: 100,
			height: 6,
			backgroundColor: 'transparent',
			borderColor: 'transparent',
			handleColor: '#488AFE',
			handleSize: 10,
			showDataShadow: false,
			showDetail: true,
			detailFormatter: function(value) {
				const index = Math.round(value);
				if (index >= 0 && index < xAxisData.length) {
					return xAxisData[index];
				}
				return '';
			}
		}],
		legend: {
			data: ['AQI'],
			top: '2%',
			left: 'left',
			orient: 'vertical',
			itemWidth: 10,
			itemHeight: 10,
			zlevel: 10
		}
	};

	myChart.setOption(option);
	appState.chartInstances['aqi-trend'] = myChart;
	// createFixedLegend('aqi-trend-headers', ['AQI'], '#488AFE');
	
}


// 渲染 AQI 月度柱状图 - 固定Y轴
function renderAQIBar() {
	const dom = getChartDom('aqi-bar');
	if (!isRenderReady(dom)) return;

	const {
		xAxisData,
		seriesData
	} = prepareTimeSeriesData();
	const myChart = echarts.init(dom);

	const aqiGradeMap = [{
			range: [0, 50],
			color: '#00E400',
			name: '优'
		},
		{
			range: [51, 100],
			color: '#FFFF00',
			name: '良'
		},
		{
			range: [101, 150],
			color: '#ffb907',
			name: '轻度污染'
		},
		{
			range: [151, 200],
			color: '#ff5d3d',
			name: '中度污染'
		},
		{
			range: [201, 300],
			color: '#99004C',
			name: '重度污染'
		},
		{
			range: [301, 999],
			color: '#66001d',
			name: '严重污染'
		}
	];

	const option = {
		grid: {
			left: '1%',
			right: '5%',
			bottom: '15%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: xAxisData,
			axisLabel: {
				rotate: 45,
				interval: 0,
				margin: 20,
				formatter: (value) => value
			}
		},
		yAxis: {
			type: 'value',
			name: 'AQI',
			position: 'left',
			nameGap: 18,
			min: 0,
			alignTicks: true
		},
		legend: {
			data: aqiGradeMap.map(item => item.name),
			top: '2%',
			left: 'center',
			orient: 'horizontal',
			zlevel: 10
		},
		series: [{
			name: 'AQI',
			type: 'bar',
			data: seriesData,
			itemStyle: {
				color: (params) => getAQIColor(params, aqiGradeMap)
			},
			label: {
				show: true,
				position: 'top',
				color: '#333',
				formatter: '{c}'
			},
			barWidth: '50%'
		}],
		dataZoom: [{
			type: 'slider',
			xAxisIndex: 0,
			start: 0,
			end: 100,
			height: 6,
			handleColor: '#488AFE',
			showDetail: true,
			detailFormatter: function(value) {
				const index = Math.round(value);
				if (index >= 0 && index < xAxisData.length) {
					return xAxisData[index];
				}
				return '';
			}
		}]
	};

	myChart.setOption(option);
	appState.chartInstances['aqi-bar'] = myChart;
	createFixedLegend('aqi-bar-headers',
		aqiGradeMap.map(item => item.name),
		aqiGradeMap.map(item => item.color)
	);
}

// 渲染污染物浓度对比图（多折线图）- 固定Y轴
function renderPollutantCompare() {
	const dom = getChartDom('pollutant-compare');
	if (!isRenderReady(dom)) return;

	const {
		xAxisData
	} = prepareTimeSeriesData();
	const myChart = echarts.init(dom);

	const pollutantMap = {
		pm2_5: {
			name: 'PM2.5',
			color: '#ff86d5'
		},
		pm10: {
			name: 'PM10',
			color: '#aa442a'
		},
		no2: {
			name: '二氧化氮',
			color: '#ffb189'
		},
		o3: {
			name: '臭氧',
			color: '#9385ff'
		},
		co: {
			name: '一氧化碳',
			color: '#f8ba00'
		},
		so2: {
			name: '二氧化硫',
			color: '#aaa51b'
		}
	};

	const series = preparePollutantSeries(pollutantMap);
	const option = {
		grid: {
			left: '1%',
			right: '5%',
			bottom: '15%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: xAxisData,
			axisLabel: {
				rotate: 45,
				interval: 0,
				margin: 20,
				formatter: (value) => value
			},
			axisTick: {
				show: false
			}
		},
		yAxis: {
			type: 'value',
			name: '浓度值',
			position: 'left',
			nameGap: 18,
			min: 0,
			alignTicks: true
		},
		legend: {
			data: Object.values(pollutantMap).map(item => item.name),
			top: '2%',
			left: 'center',
			orient: 'horizontal',
			itemWidth: 12,
			itemHeight: 12,
			zlevel: 10
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross'
			},
			backgroundColor: 'rgba(255,255,255,0.85)',
			borderColor: '#eee',
			borderWidth: 1,
			padding: 10,
			textStyle: {
				color: '#333',
				fontSize: 12
			}
		},
		series: series,
		dataZoom: [{
			type: 'slider',
			xAxisIndex: 0,
			start: 0,
			end: 100,
			height: 6,
			handleColor: '#488AFE',
			showDetail: true,
			detailFormatter: function(value) {
				const index = Math.round(value);
				if (index >= 0 && index < xAxisData.length) {
					return xAxisData[index];
				}
				return '';
			}
		}]
	};

	myChart.setOption(option);
	appState.chartInstances['pollutant-compare'] = myChart;
	createFixedLegend('pollutant-compare-headers',
		Object.values(pollutantMap).map(item => item.name),
		Object.values(pollutantMap).map(item => item.color)
	);
}

// 手动创建固定图例（在标题容器内，副标题下方）
function createFixedLegend(headersId, legendData, colors) {
	const headersElement = document.getElementById(headersId);
	if (!headersElement) return;

	const legendContainer = document.createElement('div');
	legendContainer.className = 'fixed-legend';
	legendContainer.style.display = 'flex';
	legendContainer.style.justifyContent = 'center';
	legendContainer.style.marginTop = '8px';
	legendContainer.style.flexWrap = 'wrap';

	legendData.forEach((name, index) => {
		const item = document.createElement('div');
		item.style.display = 'flex';
		item.style.alignItems = 'center';
		item.style.margin = '0 10px 5px 10px';

		const colorBox = document.createElement('span');
		colorBox.style.display = 'inline-block';
		colorBox.style.width = '12px';
		colorBox.style.height = '12px';
		colorBox.style.marginRight = '5px';
		colorBox.style.backgroundColor = colors[index] || '#333';

		const text = document.createElement('span');
		text.textContent = name;
		text.style.fontSize = '14px';

		item.appendChild(colorBox);
		item.appendChild(text);
		legendContainer.appendChild(item);
	});

	headersElement.appendChild(legendContainer);
}

// 渲染空气质量等级饼图（无需固定Y轴）
function renderGradePie() {
	const dom = getChartDom('grade-pie');
	if (!isRenderReady(dom)) return;

	const gradeCount = countGradeDistribution();
	const seriesData = Object.entries(gradeCount).map(([grade, count]) => ({
		name: grade || '未知等级',
		value: count
	}));

	const myChart = echarts.init(dom);
	const option = {
		legend: {
			data: seriesData.map(item => item.name),
			bottom: '0%',
			left: 'center',
			orient: 'horizontal',
			itemWidth: 10,
			itemHeight: 10
		},
		series: [{
			type: 'pie',
			center: ['50%', '50%'],
			radius: ['40%', '70%'],
			data: seriesData,
			label: {
				show: true,
				formatter: '{b}: {c} 天 ({d}%)'
			},
			emphasis: {
				label: {
					show: true,
					fontSize: '16',
					fontWeight: 'bold'
				}
			}
		}]
	};

	myChart.setOption(option);
	appState.chartInstances['grade-pie'] = myChart;
}

// ====================== 工具与辅助函数 ====================== 
// 处理 fetch 响应（统一处理错误响应）
function handleResponse(res) {
	if (!res.ok) {
		throw new Error(`HTTP 错误：${res.status}`);
	}
	return res.json();
}

function prepareTimeSeriesData() {
	const cityData = appState.airData[appState.currentCity];
	if (!cityData) return {
		xAxisData: [],
		seriesData: []
	};

	const years = Object.keys(cityData).sort();
	const xAxisData = [];
	const seriesData = [];

	years.forEach(year => {
		const months = Object.keys(cityData[year]).sort();
		months.forEach(month => {
			xAxisData.push(`${year}-${month}`);
			seriesData.push(cityData[year][month].aqi);
		});
	});

	// 关键修改：确保数据点数量足够（至少30个）
	while (xAxisData.length < 30) {
		if (xAxisData.length > 0) {
			// 复制并递增最后一个月份
			const lastDate = xAxisData[xAxisData.length - 1];
			const [year, month] = lastDate.split('-');
			const nextMonth = String(parseInt(month) + 1).padStart(2, '0');
			xAxisData.push(`${year}-${nextMonth}`);
			// 模拟新增数据的AQI值
			seriesData.push(seriesData[seriesData.length - 1] + (Math.random() * 20 - 10));
		}
	}

	return {
		xAxisData,
		seriesData
	};
}

// 准备污染物系列数据
function preparePollutantSeries(pollutantMap) {
	const {
		xAxisData
	} = prepareTimeSeriesData();
	const series = [];

	Object.keys(pollutantMap).forEach(metric => {
		const {
			name,
			color
		} = pollutantMap[metric];
		const data = [];

		xAxisData.forEach(date => {
			const [year, month] = date.split('-');
			const cityMonthData = appState.airData[appState.currentCity]?.[year]?.[month];
			console.log(`${year}-${month} ${metric}:`, cityMonthData ? cityMonthData[metric] : '无数据');
			data.push(cityMonthData ? cityMonthData[metric] : null);
		});

		series.push({
			name: name,
			type: 'line',
			data: data.filter(val => val !== null),
			itemStyle: {
				color
			},
			symbol: 'circle',
			symbolSize: 6,
			lineStyle: {
				width: 2
			}
		});
	});
	return series;
}

// 统计空气质量等级分布
function countGradeDistribution() {
	const gradeCount = {};
	const cityData = appState.airData[appState.currentCity];
	if (!cityData) return gradeCount;

	Object.keys(cityData).forEach(year => {
		Object.keys(cityData[year]).forEach(month => {
			const grade = cityData[year][month].grade;
			gradeCount[grade] = (gradeCount[grade] || 0) + 1;
		});
	});
	return gradeCount;
}

// 动态渲染图表标题区
function renderChartHeaders(moduleId, mainTitle, subTitle) {
	const headersDom = document.getElementById(moduleId);
	if (!headersDom) return;
	headersDom.innerHTML = `
    <h2 class="chart-title">${mainTitle}</h2>
    <p class="chart-subtitle">${subTitle}</p>
  `;
}

// 获取图表 DOM 元素
function getChartDom(id) {
	return document.getElementById(id);
}

// 检查渲染条件
function isRenderReady(dom) {
	return dom && appState.airData && appState.echarts;
}

// 根据 AQI 值获取颜色
function getAQIColor(params, gradeMap) {
	const aqi = params.value;
	for (const grade of gradeMap) {
		if (aqi >= grade.range[0] && aqi <= grade.range[1]) {
			return grade.color;
		}
	}
	return '#7E0023';
}

// 显示/隐藏加载状态
function toggleLoading(show) {
	const loading = document.getElementById('loading');
	loading && loading.classList.toggle('visible', show);
}

// 工具函数 - 获取默认城市数据（模拟）- 用于错误 fallback
function getDefaultCityData(city) {
	const data = {};
	for (let year = 2013; year <= 2025; year++) {
		data[year] = {};
		for (let month = 1; month <= 12; month++) {
			const monthStr = String(month).padStart(2, '0');
			const baseValue = getDefaultBaseValue(city, year, month);

			data[year][monthStr] = {
				aqi: Math.floor(baseValue * 1.2),
				pm2_5: Math.floor(baseValue * 0.8),
				pm10: Math.floor(baseValue * 1.1),
				no2: Math.floor(baseValue * 0.5),
				o3: Math.floor(baseValue * 0.7),
				co: Math.floor(baseValue * 0.3),
				so2: Math.floor(baseValue * 0.4),
				grade: getGrade(Math.floor(baseValue * 1.2))
			};
		}
	}
	return data;
}

// 工具函数 - 获取默认基础值（不同城市不同）- 用于模拟数据
function getDefaultBaseValue(city, year, month) {
	let base = {
		北京: 80 + Math.random() * 40,
		上海: 60 + Math.random() * 30,
		广州: 50 + Math.random() * 25,
		深圳: 45 + Math.random() * 20
	};

	if (year < 2020) {
		base[city] = base[city] - (2020 - year) * 2;
	}

	return base[city] || 60;
}

// 工具函数 - 获取空气质量等级 - 用于模拟数据
function getGrade(aqi) {
	if (aqi <= 50) return '优';
	if (aqi <= 100) return '良';
	if (aqi <= 150) return '轻度污染';
	if (aqi <= 200) return '中度污染';
	if (aqi <= 300) return '重度污染';
	return '严重污染';
}

// 窗口监听 - 窗口 resize 时自适应图表
window.addEventListener('resize', () => {
	Object.keys(appState.chartInstances).forEach(id => {
		const chart = appState.chartInstances[id];
		chart && chart.resize();
	});
});

// ====================== 辅助初始化函数 ====================== 
// 初始化城市选择器
function initCitySelector() {
	return fetch('/api/cities')
		.then(res => res.json())
		.then(data => {
			const citySelect = document.getElementById('city-select');
			data.cities.forEach(city => {
				const option = document.createElement('option');
				option.value = city;
				option.textContent = city;
				citySelect.appendChild(option);
			});
			citySelect.value = '北京';
			loadCityData('北京');
		})
		.catch(err => {
			console.error('城市列表加载失败:', err);
			alert('城市数据加载失败，请检查网络');
			const citySelect = document.getElementById('city-select');
			['北京', '上海', '广州', '深圳'].forEach(city => {
				const option = document.createElement('option');
				option.value = city;
				option.textContent = city;
				citySelect.appendChild(option);
			});
			citySelect.value = '北京';
			loadCityData('北京');
		});
}

// 处理初始化错误
function handleInitError(err) {
	console.error('应用初始化失败:', err);
	alert('应用初始化失败，请刷新页面重试');
}