#!/usr/bin/env python3
"""
Biogenesis - 生物信息进化模拟游戏
一款结合了生物学概念与策略要素的进化模拟游戏
"""

import random
import sys

class DNA:
    """DNA序列类"""
    def __init__(self, sequence=None, length=20):
        if sequence:
            self.sequence = sequence
        else:
            # 生成随机DNA序列 (A, T, C, G)
            bases = ['A', 'T', 'C', 'G']
            self.sequence = ''.join(random.choice(bases) for _ in range(length))
    
    def mutate(self, position, new_base):
        """在指定位置突变DNA"""
        if 0 <= position < len(self.sequence) and new_base in ['A', 'T', 'C', 'G']:
            seq_list = list(self.sequence)
            seq_list[position] = new_base
            self.sequence = ''.join(seq_list)
            return True
        return False
    
    def random_mutation(self):
        """随机突变一个碱基"""
        position = random.randint(0, len(self.sequence) - 1)
        bases = ['A', 'T', 'C', 'G']
        new_base = random.choice(bases)
        self.mutate(position, new_base)
    
    def calculate_gc_content(self):
        """计算GC含量"""
        gc_count = self.sequence.count('G') + self.sequence.count('C')
        return gc_count / len(self.sequence)
    
    def __str__(self):
        return self.sequence


class Organism:
    """生物个体类"""
    def __init__(self, name, dna=None):
        self.name = name
        self.dna = dna if dna else DNA()
        self.fitness = 0
        self.age = 0
        self.alive = True
    
    def calculate_fitness(self, environment):
        """根据环境计算适应度"""
        gc_content = self.dna.calculate_gc_content()
        
        # 根据环境的理想GC含量计算适应度
        gc_diff = abs(gc_content - environment.ideal_gc_content)
        
        # 适应度: GC含量越接近理想值，适应度越高
        self.fitness = max(0, 100 - (gc_diff * 100))
        
        # 温度适应性
        temp_diff = abs(environment.temperature - 37)  # 37°C 是理想温度
        self.fitness -= temp_diff * 2
        
        self.fitness = max(0, self.fitness)
        return self.fitness
    
    def survive(self, environment):
        """判断是否能在环境中存活"""
        self.age += 1
        fitness = self.calculate_fitness(environment)
        
        # 适应度低于30，有可能死亡
        if fitness < 30:
            if random.random() < 0.5:  # 50%的死亡概率
                self.alive = False
                return False
        
        # 年龄超过10代，有概率死亡
        if self.age > 10:
            if random.random() < 0.3:
                self.alive = False
                return False
        
        return True
    
    def __str__(self):
        status = "存活" if self.alive else "死亡"
        return f"{self.name} (年龄: {self.age}, 适应度: {self.fitness:.1f}, 状态: {status})\nDNA: {self.dna}"


class Environment:
    """环境类"""
    def __init__(self, name, ideal_gc_content=0.5, temperature=37):
        self.name = name
        self.ideal_gc_content = ideal_gc_content
        self.temperature = temperature
        self.generation = 0
    
    def change_conditions(self):
        """环境条件变化"""
        self.generation += 1
        # 理想GC含量在0.3-0.7之间随机变化
        self.ideal_gc_content = max(0.3, min(0.7, 
            self.ideal_gc_content + random.uniform(-0.1, 0.1)))
        # 温度在25-45°C之间变化
        self.temperature = max(25, min(45, 
            self.temperature + random.uniform(-5, 5)))
    
    def __str__(self):
        return f"{self.name} (代数: {self.generation})\n理想GC含量: {self.ideal_gc_content:.2f}\n温度: {self.temperature:.1f}°C"


class Game:
    """游戏主类"""
    def __init__(self):
        self.organisms = []
        self.environment = Environment("原始海洋", 0.5, 37)
        self.running = True
        self.mutations_available = 3  # 每代可用的突变次数
    
    def start_game(self):
        """开始游戏"""
        print("=" * 60)
        print("欢迎来到 Biogenesis - 生物进化模拟游戏")
        print("=" * 60)
        print("\n游戏说明:")
        print("1. 你将扮演进化工程师，通过编辑DNA序列帮助物种适应环境")
        print("2. DNA由四种碱基组成: A(腺嘌呤), T(胸腺嘧啶), C(胞嘧啶), G(鸟嘌呤)")
        print("3. 物种的适应度取决于其DNA的GC含量与环境理想值的匹配程度")
        print("4. 每代你可以进行有限次数的DNA编辑，帮助物种存活")
        print("5. 环境条件会随机变化，你需要不断调整物种的DNA\n")
        
        # 创建初始生物
        for i in range(3):
            org = Organism(f"物种-{i+1}")
            self.organisms.append(org)
        
        self.game_loop()
    
    def display_status(self):
        """显示当前状态"""
        print("\n" + "=" * 60)
        print(f"当前环境状态:")
        print(self.environment)
        print("\n物种状态:")
        for i, org in enumerate(self.organisms):
            if org.alive:
                print(f"\n{i+1}. {org}")
        print("=" * 60)
    
    def edit_dna(self):
        """编辑DNA"""
        if self.mutations_available <= 0:
            print("\n本代突变次数已用完！")
            return
        
        alive_organisms = [org for org in self.organisms if org.alive]
        if not alive_organisms:
            return
        
        print(f"\n你还有 {self.mutations_available} 次突变机会")
        print("\n选择要编辑的物种:")
        for i, org in enumerate(alive_organisms):
            print(f"{i+1}. {org.name} (GC含量: {org.dna.calculate_gc_content():.2f})")
        
        try:
            choice = int(input("请输入物种编号 (0 取消): "))
            if choice == 0:
                return
            if choice < 1 or choice > len(alive_organisms):
                print("无效的选择！")
                return
            
            organism = alive_organisms[choice - 1]
            print(f"\n当前DNA序列: {organism.dna.sequence}")
            print(f"序列长度: {len(organism.dna.sequence)}")
            
            position = int(input("请输入要突变的位置 (0 取消): ")) - 1
            if position == -1:
                return
            
            new_base = input("请输入新的碱基 (A/T/C/G): ").upper()
            
            if organism.dna.mutate(position, new_base):
                print(f"成功！新DNA序列: {organism.dna.sequence}")
                self.mutations_available -= 1
            else:
                print("突变失败！请检查输入是否正确。")
        
        except (ValueError, IndexError):
            print("输入错误！")
    
    def next_generation(self):
        """进入下一代"""
        print("\n进入下一代...")
        
        # 环境变化
        self.environment.change_conditions()
        
        # 每个生物尝试存活
        alive_count = 0
        for org in self.organisms:
            if org.alive:
                if org.survive(self.environment):
                    alive_count += 1
                    # 随机小概率自然突变
                    if random.random() < 0.1:
                        org.dna.random_mutation()
                        print(f"{org.name} 发生了自然突变！")
        
        # 重置突变次数
        self.mutations_available = 3
        
        print(f"\n存活物种数: {alive_count}/{len(self.organisms)}")
        
        if alive_count == 0:
            print("\n所有物种都已灭绝！游戏结束。")
            self.running = False
    
    def game_loop(self):
        """游戏主循环"""
        while self.running:
            self.display_status()
            
            print("\n可用操作:")
            print("1. 编辑DNA")
            print("2. 进入下一代")
            print("3. 查看环境详情")
            print("4. 退出游戏")
            
            choice = input("\n请选择操作: ")
            
            if choice == '1':
                self.edit_dna()
            elif choice == '2':
                self.next_generation()
            elif choice == '3':
                print("\n" + str(self.environment))
                print(f"提示: 当前环境理想GC含量为 {self.environment.ideal_gc_content:.2f}")
            elif choice == '4':
                print("\n感谢游玩 Biogenesis！")
                self.running = False
            else:
                print("\n无效的选择，请重试。")


def main():
    """主函数"""
    game = Game()
    game.start_game()


if __name__ == "__main__":
    main()
