# encoding: utf-8
import os
from mySpider import aqistudyspider, FileCityNameParser

def check_data_integrity(output_file):
    """
    检查数据文件的完整性
    :param output_file: 输出数据文件的路径
    :return: 如果数据完整返回 True，否则返回 False
    """
    try:
        with open(output_file, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            # 简单示例：检查文件是否为空
            if not lines:
                return False
            # 可以添加更复杂的完整性检查逻辑，例如检查特定字段是否存在
            # 这里只是简单返回 True
            return True
    except FileNotFoundError:
        return False

def re_collect_data(cities):
    """
    重新采集数据
    :param cities: 城市名称列表
    """
    aqi = aqistudyspider(cities)
    aqi.spiser_request()

if __name__ == '__main__':
    output_file = "aqistudyspider.txt"
    # 读取城市名称
    parser = FileCityNameParser()
    cities = parser.process_html("重点城市分布.txt")

    # 检查数据完整性
    if not check_data_integrity(output_file):
        print("检测到数据缺失，开始重新采集数据...")
        re_collect_data(cities)
        print("数据重新采集完成。")
    else:
        print("数据完整，无需重新采集。")