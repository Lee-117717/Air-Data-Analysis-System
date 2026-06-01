# encoding:utf-8
import jieba
class Feici:
    def __init__(self, path):
        self.path = path
    def feici(self,path):
        c=' '.join(path).split('\n')
        c=' '.join(c)

        rs = jieba.lcut(c)
        return  rs
    def read(self):
        with open(self.path, 'r', encoding='utf-8') as f:
            return f.readlines()
    def write(self, data):
        with open('E:/demo4/data/feici.txt', 'w', encoding='utf-8') as f:
            for i in data:
                f.write(i)
                f.write('\n')
if __name__ == '__main__':
    w=Feici('E:/demo4/data/aqistudyspider.txt')
    w1=w.read()
    ws=w.feici(w1)
    w.write(ws)




