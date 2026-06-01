from hdfs import InsecureClient
import os
import time


class LoadHDFSFiles:
    def __init__(self, hdfs_path, ip='192.168.80.101', port='50070', username='hadoop'):
        """
        初始化HDFS文件加载器
        :param hdfs_path: HDFS上的目录路径
        :param ip: HDFS NameNode的IP地址
        :param port: HDFS的WebHDFS服务端口
        :param username: 访问HDFS的用户名
        """
        # 规范化路径分隔符，确保使用正斜杠
        self.hdfs_path = hdfs_path.replace('\\', '/').rstrip('/')
        self.client = InsecureClient(f'http://{ip}:{port}', user=username)
        self.files = self.list_files()
        self.current_index = 0
        self.retries = 3  # 每个文件最大重试次数

    def list_files(self):
        """
        获取HDFS目录下的所有文件
        :return: 文件路径列表
        """
        try:
            files = []
            # 递归获取目录下所有文件
            for item in self.client.list(self.hdfs_path, status=True):
                # 确保文件路径使用正斜杠
                file_name = item[0].replace('\\', '/')
                file_path = f"{self.hdfs_path}/{file_name}"
                if item[1]['type'] == 'FILE':
                    files.append(file_path)
            return files
        except Exception as e:
            print(f"获取HDFS文件列表失败: {e}")
            return []

    def get_files_with_paths(self):
        """
        获取所有文件内容及其路径
        :return: 生成器，每次返回(文件内容, 文件路径)
        """
        for file_path in self.files:
            content = ""
            # 对每个文件进行多次重试
            for attempt in range(self.retries):
                try:
                    with self.client.read(file_path) as reader:
                        content = reader.read().decode('utf-8')
                        break  # 读取成功，跳出重试循环
                except Exception as e:
                    print(f"读取 HDFS 文件 {file_path} 失败 (尝试 {attempt + 1}/{self.retries})，错误: {e}")
                    if attempt < self.retries - 1:  # 不是最后一次尝试
                        time.sleep(2)  # 重试前等待一段时间
                    else:
                        # 所有尝试都失败，返回空内容
                        yield "", file_path
                        continue

            if content:  # 如果读取到内容
                yield content, file_path

    def __iter__(self):
        """
        实现迭代器接口，用于遍历文件内容
        """
        return self

    def __next__(self):
        """
        获取下一个文件的内容
        """
        if self.current_index >= len(self.files):
            raise StopIteration

        file_path = self.files[self.current_index]
        self.current_index += 1

        # 对每个文件进行多次重试
        for attempt in range(self.retries):
            try:
                with self.client.read(file_path) as reader:
                    return reader.read().decode('utf-8')
            except Exception as e:
                print(f"读取 HDFS 文件 {file_path} 失败 (尝试 {attempt + 1}/{self.retries})，错误: {e}")
                if attempt < self.retries - 1:  # 不是最后一次尝试
                    time.sleep(2)  # 重试前等待一段时间
                else:
                    return ""  # 所有尝试都失败，返回空字符串


if __name__ == "__main__":
    # 替换为实际 HDFS 目录路径
    hdfs_path = '/air_quality/html_files'
    # 初始化加载器
    hdfs_loader = LoadHDFSFiles(hdfs_path)

    # 调试：遍历并打印内容
    try:
        for idx, line in enumerate(hdfs_loader):
            print(f"第 {idx + 1} 行内容: {line}")
            if idx >= 2:  # 只打印前10行用于测试
                break
    except Exception as e:
        print(f"遍历失败: {str(e)}")