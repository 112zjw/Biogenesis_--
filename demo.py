#!/usr/bin/env python3
"""
Biogenesis 游戏演示脚本
自动演示游戏的核心功能
"""

import sys
sys.path.insert(0, '/home/runner/work/Biogenesis_--/Biogenesis_--')

from biogenesis import DNA, Organism, Environment

def demo_game():
    """演示游戏功能"""
    print("=" * 60)
    print("Biogenesis - 生物进化模拟游戏演示")
    print("=" * 60)
    print()
    
    # 创建环境
    env = Environment("原始海洋", 0.5, 37)
    print("【环境创建】")
    print(env)
    print()
    
    # 创建物种
    print("【物种创建】")
    org1 = Organism("物种-1", DNA("ATCGATCGATCGATCGATCG"))
    org2 = Organism("物种-2", DNA("GCGCGCGCGCGCGCGCGCGC"))
    org3 = Organism("物种-3", DNA("ATATATATATATATATATATAT"))
    
    organisms = [org1, org2, org3]
    
    for org in organisms:
        org.calculate_fitness(env)
        print(org)
        print()
    
    # 演示DNA编辑
    print("【DNA编辑演示】")
    print(f"编辑前: {org1.name} DNA = {org1.dna.sequence}")
    print(f"         GC含量 = {org1.dna.calculate_gc_content():.2f}")
    
    # 将第一个碱基从A改为G，增加GC含量
    org1.dna.mutate(0, 'G')
    print(f"编辑后: {org1.name} DNA = {org1.dna.sequence}")
    print(f"         GC含量 = {org1.dna.calculate_gc_content():.2f}")
    org1.calculate_fitness(env)
    print(f"         新适应度 = {org1.fitness:.1f}")
    print()
    
    # 模拟几代进化
    print("【进化模拟】")
    for gen in range(3):
        print(f"\n--- 第 {gen + 1} 代 ---")
        env.change_conditions()
        print(f"环境变化: 理想GC含量={env.ideal_gc_content:.2f}, 温度={env.temperature:.1f}°C")
        print()
        
        alive_count = 0
        for org in organisms:
            if org.alive:
                org.survive(env)
                if org.alive:
                    alive_count += 1
                    print(f"{org.name}: 存活 (年龄={org.age}, 适应度={org.fitness:.1f})")
                else:
                    print(f"{org.name}: 死亡 (适应度过低)")
        
        print(f"\n存活物种数: {alive_count}/3")
        
        if alive_count == 0:
            print("\n所有物种灭绝！")
            break
    
    print()
    print("=" * 60)
    print("演示结束")
    print("=" * 60)
    print("\n运行 'python3 biogenesis.py' 开始互动游戏！")

if __name__ == "__main__":
    demo_game()
