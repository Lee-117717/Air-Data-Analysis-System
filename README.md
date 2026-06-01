# 空气信息采集与分析系统（网络数据采集实践课程设计）

## 项目简介
本项目是《网络数据采集实践》课程设计，基于 **Python + 爬虫 + Hadoop + Flume + ECharts**，实现全国空气质量数据的**采集、清洗、存储、分析与可视化**全流程处理。

## 技术栈
- **数据采集**：Python（Requests、Selenium、BeautifulSoup）、定时任务、反爬策略
- **数据处理**：Pandas 清洗、jieba 分词、异常值处理
- **数据存储**：Hadoop + Flume + HDFS 分布式存储
- **数据分析**：多维度统计、AQI趋势、污染物对比
- **可视化**：ECharts（折线、柱状、饼图）

## 核心功能
- ✅ 定时爬取全国37城历史空气质量（AQI、PM2.5、PM10、SO₂、NO₂、CO、O₃）
- ✅ 数据清洗：去重、补全单位、异常值处理
- ✅ 数据存储：原始HTML → HDFS 分布式存储
- ✅ 断点续采：自动检测缺失城市并补爬
- ✅ 多维度分析：AQI趋势、污染物对比、空气质量等级分布
- ✅ ECharts 可视化图表
- ✅ 完整日志记录

## 项目结构
Air-Data-Analysis-System/
├── src/ # 核心爬虫、清洗、分析代码
├── air_quality_visualization/ # ECharts 可视化代码
├── units/ # 工具类、通用模块
├── data/ # 示例数据文件
├── docs/ # 课程设计报告
├── logs/ # 运行日志
├── screenshots/ # 项目截图、可视化图表
└── README.md # 项目说明文档

## 运行方式
1. 安装 Python、Hadoop、Flume 环境
2. 安装依赖：`pip install requests pandas selenium beautifulsoup4 jieba`
3. 启动爬虫：`python src/mySpider.py`
4. 数据清洗与分析：运行 `src/clean.py` 和 `src/analysis.py`
5. 查看可视化图表：打开 `air_quality_visualization/` 目录下的HTML文件

## 项目亮点
- 完整的大数据处理流程：**采集 → 清洗 → 存储 → 分析 → 可视化**
- 支持断点续采、定时任务、日志记录，具备工业级爬虫稳定性
- 覆盖37个城市的真实空气质量数据，分析维度全面
- 前后端分离可视化图表，结果直观易读
- 可直接用于求职展示，体现数据采集与大数据处理能力
