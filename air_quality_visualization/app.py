from flask import Flask, render_template, jsonify, send_from_directory
import os
import json

app = Flask(__name__,
            static_folder='static',        # 静态文件目录（存放 CSS、JS、图片）
            template_folder='templates')   # 模板文件目录（存放 index.html）

# 加载空气质量数据
def load_air_data():
    with open("data/air_quality_data.json", "r", encoding="utf-8") as f:
        return json.load(f)

# 加载省份映射数据
def load_city_relation():
    with open("data/city_relation.json", "r", encoding="utf-8") as f:
        return json.load(f)

# 主页路由
@app.route("/")
def index():
    return render_template("index.html")

# 获取城市列表
@app.route("/api/cities")
def get_cities():
    data = load_air_data()
    return jsonify({"cities": list(data.keys())})

# 获取单城市数据
@app.route("/api/data/<city>")
def get_city_data(city):
    data = load_air_data()
    return jsonify(data.get(city, {}))

# 映射 /data/ 路径到本地 data 文件夹（city_relation.json 所在位置）
@app.route("/data/<path:path>")
def send_data(path):
    return send_from_directory("data", path)

# 映射 /static/ 路径到本地 static 文件夹（存放省份图片）
@app.route("/static/<path:path>")
def send_static(path):
    return send_from_directory("static", path)

if __name__ == "__main__":
    # 开启调试模式（开发环境）
    app.run(debug=True, port=5000)