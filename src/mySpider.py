# encoding: utf-8
import time
from bs4 import BeautifulSoup
from selenium import webdriver
class FileCityNameParser():
    def __init__(self):
        self.separators = ['，', ',', ' ', '：', ':', '\n']# 城市名称的分隔符包括逗号和空格
        self.data_path = '/home/hadoop/opt/mypro/air_quality_spider/data'
    def process_html(self,file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        # 替换所有分隔符为统一符号（这里用空格）
        for sep in self.separators:
            content = content.replace(sep, ' ')

        # 分割字符串并过滤空值
        cities = [city.strip() for city in content.split() if city.strip()]

        return cities
class aqistudyspider():
    def __init__(self, city):
        self.city = city
        self.city_url = ('https://www.aqistudy.cn/historydata/monthdata.php?city=')
    def spiser_request(self):
        # 反反爬
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument('--no-sandbox')  #配置Chrome以在无沙盒模式下运行，主要用于提高性能
        #chrome_options.add_argument('--headless')   # 配置Chrome以在无头模式下运行，即不显示GUI界面
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument("--ignore-certificate-errors")# 忽略证书错误，适用于测试环境
        chrome_options.add_argument("--ignore-ssl-errors")
        chrome_options.add_argument("--test-type")
        chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
        driver = webdriver.Chrome(options=chrome_options)


        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
          Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
          })
        """
        })
        for i in range(2):
            driver.get(self.city_url+self.city[i])
            time.sleep(5)
            response_info = driver.page_source  # 首页源码
            print(response_info)
            with open("data/output_file.html", 'w', encoding='utf-8') as file:
                file.write(response_info)
            a=AqiDataProcessor(response_info,self.city[i])
            a.run(i)



class AqiDataProcessor():
    def __init__(self, html_file,city, output_file="data/aqistudyspider.txt"):
        self.html_file = html_file
        self.output_file = output_file
        self.data3 = [[city]]
    def process_html(self):

            html = self.html_file
                # 使用BeautifulSoup解析HTML，选择'lxml'作为解析器
            bs1 = BeautifulSoup(html, 'lxml')
            # 找到所有的行（table row）
            rows = bs1.find_all('tr')

            for row in rows:
                # 找到一行中的所有单元格（table data）
                cells = row.find_all('td')
                # 初始化一个列表用于存储从当前行提取的数据
                data2 = []
                # 选择特定类的单元格，这里是"hidden-xs"
                cell = row.select('td[class="hidden-xs"]')
                # 遍历单元格，寻找包含链接（a tag）的数据
                for i in cells:
                    t = i.find('a')
                    if t:
                        # 找到链接的父单元格，并获取其下一个兄弟单元格
                        parent_td = t.find_parent('td')
                        t2 = parent_td.find_next_sibling('td')
                        # 将文本数据添加到data2列表中
                        data2.append(t.get_text())
                        data2.append(t2.get_text().strip())

                    t1 = i.find('span')
                    if t1:
                        # 找到span的父单元格，并获取其后续两个兄弟单元格
                        parent_td1 = t1.find_parent('td')
                        t3 = parent_td1.find_next_sibling('td')
                        t4 = t3.find_next_sibling('td')
                        # 将文本数据添加到data2列表中
                        data2.append(t1.get_text())
                        data2.append(t3.get_text())
                        data2.append(t4.get_text())

                if cell:
                    # 处理具有特定格式的单元格数据
                    for j in range(4):
                        text = cell[j].get_text().strip()
                        if '~' in text:
                            data2.append(text)
                            cell.pop(j)

                    for j in range(3):
                        text = cell[j].get_text().strip()
                        if '.' in text:
                            data2.append(text)
                            cell.pop(j)

                    # 根据单元格数据的比较结果，决定数据的添加顺序
                    if cell[1].get_text() > cell[0].get_text():
                        data2.append(cell[1].get_text().strip())
                        data2.append(cell[0].get_text().strip())
                    else:
                        data2.append(cell[0].get_text().strip())
                        data2.append(cell[1].get_text().strip())

                    # 添加最后一个处理的单元格数据
                    data2.append(cell[2].get_text().strip())

                # 将处理后的数据列表添加到类的成员变量data3中
                self.data3.append(data2)
                print(data2)
                self.data3[1] = ["月份", "aqi", "质量等级", "pm2_5", "pm10", "范围", "co", "no2", "so2 ", "o3"]
    def save_to_file(self,i):
        if i==0:
            with open(self.output_file, "w", encoding="utf-8") :#每次清空 文件
                pass
        with open(self.output_file, "a", encoding="utf-8") as f:
            for row in self.data3:#写入文件
                f.write("\t\t".join(row) + "\n")

    def run(self,i):
        self.process_html()
        self.save_to_file(i)

if __name__ == '__main__':
    data_path = '/home/hadoop/opt/mypro/air_quality_spider/data'
    a=FileCityNameParser()
    b=a.process_html("重点城市分布.txt")
    aqi = aqistudyspider(b)
    aqi.spiser_request()