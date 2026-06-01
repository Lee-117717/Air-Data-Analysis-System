import pandas as pd
class AirQualityProcessor:
    def __init__(self, input_file, output_file):
        self.input_file = input_file
        self.output_file = output_file

    def process(self):
        df = pd.read_csv(self.input_file, sep='\s+', encoding='utf-8', skiprows=1)
        for i in range(len(df)):
            if df['月份'][i] == "月份" or type(df['co'][i]) is float:
                continue
            df['pm2_5'][i] = str(df['pm2_5'][i]).strip() + 'μg/m³'
            df['pm10'][i] = str(df['pm10'][i]).strip() + 'μg/m³'
            df['co'][i] = str(df['co'][i]).strip() + 'mg/m³'
            df['no2'][i] = str(df['no2'][i]).strip() + 'μg/m³'
            df['o3'][i] = str(df['o3'][i]).strip() + 'μg/m³'
            df['so2'][i] = str(df['so2'][i]).strip() + 'μg/m³'
        with open(self.output_file, 'w', encoding='utf-8') as f:
            f.write("北京" + '\n\n')
            df.to_csv(f, sep='\t', index=False)
        return df


# 使用示例
processor = AirQualityProcessor('E:/demo4/data/aqistudyspider.txt', 'E:/demo4/data/aqistudyspider1.txt')
processor.process()