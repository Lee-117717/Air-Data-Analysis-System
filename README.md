# 空气信息采集与分析项目（大数据/爬虫课程设计）

## 项目简介
本项目是《网络数据采集实践》课程设计，基于 Python + 爬虫 + Hadoop + ECharts，实现**全国空气质量数据采集、清洗、存储、分析与可视化**。

## 技术栈
- Python（Requests、Selenium、BeautifulSoup、Pandas、jieba）
- 数据采集：爬虫 + 反爬 + 定时任务
- 数据存储：Hadoop + Flume + HDFS
- 数据分析：Pandas 统计、文本分词
- 可视化：ECharts（折线、柱状、饼图）

## 功能
- ✅ 定时爬取全国37城历史空气质量（AQI、PM2.5、PM10、SO₂、NO₂、CO、O₃）
- ✅ 数据清洗：去重、补全单位、异常值处理
- ✅ 数据存储：原始HTML → HDFS 分布式存储
- ✅ 断点续采：自动检测缺失城市并补爬
- ✅ 多维度分析：AQI趋势、污染物对比、空气质量等级分布
- ✅ ECharts 可视化图表
- ✅ 完整日志记录

## 项目结构
src/        爬虫、清洗、分析、可视化代码
data/       原始网页、txt数据
docs/       课程设计报告
screenshots/系统截图、图表、日志
logs/       运行日志

## 运行方式
1. 安装 Python、Hadoop、Flume
2. 安装依赖：pip install requests pandas
3. 运行爬虫：python src/mySpider.py
4. 数据清洗：python src/clean.py
5. 查看可视化图表

## 项目亮点
- 完整大数据流程：采集 → 清洗 → 存储 → 分析 → 可视化
- 断点续采、定时任务、日志记录
- 37城真实历史空气质量数据
- 多维度污染分析 + ECharts 可视化