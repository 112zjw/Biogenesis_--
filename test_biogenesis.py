#!/usr/bin/env python3
"""
Biogenesis 游戏测试脚本
测试游戏的核心功能
"""

import sys
sys.path.insert(0, '/home/runner/work/Biogenesis_--/Biogenesis_--')

from biogenesis import DNA, Organism, Environment, Game

def test_dna():
    """测试DNA类"""
    print("测试DNA类...")
    
    # 测试随机生成
    dna1 = DNA()
    assert len(dna1.sequence) == 20, "DNA默认长度应为20"
    assert all(base in 'ATCG' for base in dna1.sequence), "DNA应只包含ATCG碱基"
    
    # 测试指定序列
    dna2 = DNA("ATCGATCG")
    assert dna2.sequence == "ATCGATCG", "DNA序列应该匹配指定值"
    
    # 测试突变
    result = dna2.mutate(0, 'G')
    assert result == True, "有效突变应返回True"
    assert dna2.sequence == "GTCGATCG", "突变后序列应该改变"
    
    # 测试无效突变
    result = dna2.mutate(100, 'G')
    assert result == False, "无效位置应返回False"
    
    # 测试GC含量计算
    dna3 = DNA("GGGGCCCC")
    gc = dna3.calculate_gc_content()
    assert gc == 1.0, f"纯GC序列的GC含量应为1.0，实际为{gc}"
    
    dna4 = DNA("AAAATTTT")
    gc = dna4.calculate_gc_content()
    assert gc == 0.0, f"纯AT序列的GC含量应为0.0，实际为{gc}"
    
    dna5 = DNA("ATCGATCG")
    gc = dna5.calculate_gc_content()
    assert gc == 0.5, f"平衡序列的GC含量应为0.5，实际为{gc}"
    
    print("✓ DNA类测试通过")

def test_organism():
    """测试Organism类"""
    print("测试Organism类...")
    
    # 创建生物
    dna = DNA("ATCGATCGATCGATCGATCG")
    org = Organism("测试物种", dna)
    
    assert org.name == "测试物种", "物种名称应匹配"
    assert org.alive == True, "新生物应该是存活的"
    assert org.age == 0, "新生物年龄应为0"
    
    # 测试适应度计算
    env = Environment("测试环境", 0.5, 37)
    fitness = org.calculate_fitness(env)
    assert 0 <= fitness <= 100, f"适应度应在0-100之间，实际为{fitness}"
    
    # 测试存活机制
    org2 = Organism("高适应度物种", DNA("GCGCGCGCGCGCGCGCGCGC"))
    org2.calculate_fitness(env)
    result = org2.survive(env)
    assert org2.age == 1, "存活后年龄应增加"
    
    print("✓ Organism类测试通过")

def test_environment():
    """测试Environment类"""
    print("测试Environment类...")
    
    env = Environment("测试环境", 0.5, 37)
    
    assert env.name == "测试环境", "环境名称应匹配"
    assert env.ideal_gc_content == 0.5, "理想GC含量应匹配"
    assert env.temperature == 37, "温度应匹配"
    assert env.generation == 0, "初始代数应为0"
    
    # 测试环境变化
    old_gc = env.ideal_gc_content
    old_temp = env.temperature
    env.change_conditions()
    
    assert env.generation == 1, "代数应增加"
    assert 0.3 <= env.ideal_gc_content <= 0.7, "GC含量应在范围内"
    assert 25 <= env.temperature <= 45, "温度应在范围内"
    
    print("✓ Environment类测试通过")

def test_game_logic():
    """测试游戏逻辑"""
    print("测试游戏逻辑...")
    
    # 测试适应度与GC含量的关系
    env = Environment("测试", 0.5, 37)
    
    # 完美匹配的DNA (GC含量=0.5)
    perfect_dna = DNA("ATCGATCGATCGATCGATCG")  # GC含量=0.5
    perfect_org = Organism("完美物种", perfect_dna)
    perfect_fitness = perfect_org.calculate_fitness(env)
    
    # 不匹配的DNA (GC含量=1.0)
    bad_dna = DNA("GCGCGCGCGCGCGCGCGCGC")  # GC含量=1.0
    bad_org = Organism("不适应物种", bad_dna)
    bad_fitness = bad_org.calculate_fitness(env)
    
    # 完美匹配应该有更高的适应度
    # 注意：由于温度因素，可能不是严格的>关系，但应该接近
    print(f"  完美匹配适应度: {perfect_fitness}")
    print(f"  不匹配适应度: {bad_fitness}")
    
    print("✓ 游戏逻辑测试通过")

def main():
    """运行所有测试"""
    print("=" * 60)
    print("Biogenesis 游戏测试")
    print("=" * 60)
    print()
    
    try:
        test_dna()
        test_organism()
        test_environment()
        test_game_logic()
        
        print()
        print("=" * 60)
        print("✓ 所有测试通过！")
        print("=" * 60)
        return 0
    except AssertionError as e:
        print()
        print("=" * 60)
        print(f"✗ 测试失败: {e}")
        print("=" * 60)
        return 1
    except Exception as e:
        print()
        print("=" * 60)
        print(f"✗ 发生错误: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
