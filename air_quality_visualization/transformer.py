import re
import json
from collections import defaultdict


def parse_air_data(file_path):
    structured_data = defaultdict(lambda: defaultdict(lambda: defaultdict(dict)))
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip()]

    current_city = None
    is_header_matched = False

    for line in lines:
        # 匹配城市行 - 简单检查是否不包含制表符
        if '\t' not in line:
            current_city = line.strip()
            is_header_matched = False
            continue

        # 分割行数据
        parts = re.split(r'\t+', line.strip())

        # 检查是否是表头行
        if len(parts) == 10 and parts[0] == '月份' and parts[1] == 'aqi':
            is_header_matched = True
            continue

        # 处理数据行
        if is_header_matched and current_city and len(parts) == 10:
            try:
                date = parts[0]  # 2013-12
                aqi = int(parts[1])  # 100
                grade = parts[2]  # 轻度污染
                pm2_5 = int(parts[3])  # 73
                pm10 = int(parts[4])  # 97
                year, month = date.split('-')  # 2013, 12

                structured_data[current_city][year][month] = {
                    "aqi": aqi,
                    "grade": grade,
                    "pm2_5": pm2_5,
                    "pm10": pm10,
                    "range": parts[5],  # 添加范围字段
                    "co": float(parts[6]),
                    "no2": int(parts[7]),
                    "so2": int(parts[8]),
                    "o3": int(parts[9])
                }
            except (ValueError, IndexError) as e:
                print(f"解析行时出错: {line}\n错误: {e}")
                continue

    return structured_data


def save_to_json(data, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    input_file = "air_quality_spider.txt"  # 替换为实际文件路径
    output_file = "air_quality_data.json"

    try:
        parsed_data = parse_air_data(input_file)
        save_to_json(parsed_data, output_file)

        print(f"解析完成！共包含 {len(parsed_data)} 个城市数据")
        for city in parsed_data:
            years = list(parsed_data[city].keys())
            if years:
                months = list(parsed_data[city][years[0]].keys())
                if months:
                    print(f"城市：{city}，示例数据：{parsed_data[city][years[0]][months[0]]}")
                    break
    except FileNotFoundError:
        print(f"错误：找不到输入文件 '{input_file}'，请检查路径")
    except Exception as e:
        print(f"发生错误: {e}")