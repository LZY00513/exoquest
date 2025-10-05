#!/usr/bin/env python3
"""
数据初始化脚本
用于创建示例数据和测试数据
"""

import asyncio
import json
import random
import numpy as np
import sys
import os
from datetime import datetime
from minio import Minio
from minio.error import S3Error
import pandas as pd
from io import StringIO

# 添加父目录到路径以便导入config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings


async def create_sample_datasets():
    """创建示例数据集"""
    
    # 初始化MinIO客户端
    client = Minio(
        settings.minio_endpoint.replace('minio:', 'localhost:'),
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=settings.minio_secure
    )
    
    print("创建示例数据集...")
    
    # 1. 创建开普勒-452b示例数据
    kepler_data = generate_kepler_sample()
    kepler_csv = kepler_data.to_csv(index=False)
    
    try:
        client.put_object(
            settings.minio_bucket_datasets,
            "samples/kepler-452b-sample.csv",
            StringIO(kepler_csv),
            length=len(kepler_csv.encode()),
            content_type='text/csv'
        )
        print("✓ 开普勒-452b示例数据已创建")
    except S3Error as e:
        print(f"✗ 创建开普勒-452b数据失败: {e}")
    
    # 2. 创建TESS示例数据
    tess_data = generate_tess_sample()
    tess_csv = tess_data.to_csv(index=False)
    
    try:
        client.put_object(
            settings.minio_bucket_datasets,
            "samples/tess-sample-batch.csv",
            StringIO(tess_csv),
            length=len(tess_csv.encode()),
            content_type='text/csv'
        )
        print("✓ TESS批量示例数据已创建")
    except S3Error as e:
        print(f"✗ 创建TESS数据失败: {e}")
    
    # 3. 创建光变曲线数据
    lightcurve_data = generate_lightcurve_sample()
    lightcurve_json = json.dumps(lightcurve_data, indent=2)
    
    try:
        client.put_object(
            settings.minio_bucket_datasets,
            "samples/lightcurve-sample.json",
            StringIO(lightcurve_json),
            length=len(lightcurve_json.encode()),
            content_type='application/json'
        )
        print("✓ 光变曲线示例数据已创建")
    except S3Error as e:
        print(f"✗ 创建光变曲线数据失败: {e}")


def generate_kepler_sample():
    """生成开普勒-452b示例数据"""
    data = {
        'target_name': ['Kepler-452b'],
        'period': [384.843],
        'duration_hr': [10.1],
        'depth_ppm': [515.0],
        'snr': [12.3],
        'teff': [5757],
        'logg': [4.32],
        'tmag': [13.426],
        'crowding': [0.98],
        'true_label': ['CONF']  # 已确认的系外行星
    }
    return pd.DataFrame(data)


def generate_tess_sample():
    """生成TESS批量示例数据"""
    np.random.seed(42)  # 确保可重现性
    
    n_samples = 100
    data = {
        'target_name': [f'TIC-{100000 + i}' for i in range(n_samples)],
        'period': [],
        'duration_hr': [],
        'depth_ppm': [],
        'snr': [],
        'teff': [],
        'logg': [],
        'tmag': [],
        'crowding': [],
        'true_label': []
    }
    
    for i in range(n_samples):
        # 30% 确认行星, 20% 候选行星, 50% 假阳性
        if i < 30:
            label = 'CONF'
            period = np.random.uniform(1.0, 100.0)
            duration = np.random.uniform(2.0, 12.0)
            depth = np.random.uniform(200, 2000)
            snr = np.random.uniform(8.0, 25.0)
        elif i < 50:
            label = 'PC'
            period = np.random.uniform(0.5, 50.0)
            duration = np.random.uniform(1.5, 8.0)
            depth = np.random.uniform(100, 800)
            snr = np.random.uniform(5.0, 15.0)
        else:
            label = 'FP'
            period = np.random.uniform(0.1, 200.0)
            duration = np.random.uniform(0.5, 20.0)
            depth = np.random.uniform(50, 500)
            snr = np.random.uniform(3.0, 12.0)
        
        data['period'].append(period)
        data['duration_hr'].append(duration)
        data['depth_ppm'].append(depth)
        data['snr'].append(snr)
        data['teff'].append(np.random.uniform(3000, 8000))
        data['logg'].append(np.random.uniform(3.5, 5.0))
        data['tmag'].append(np.random.uniform(8.0, 16.0))
        data['crowding'].append(np.random.uniform(0.8, 1.0))
        data['true_label'].append(label)
    
    return pd.DataFrame(data)


def generate_lightcurve_sample():
    """生成光变曲线示例数据"""
    # 生成时间序列 (30天，每30分钟一个点)
    time = np.linspace(0, 30, 1440)
    
    # 基础恒星亮度（归一化）
    base_flux = np.ones_like(time)
    
    # 添加恒星变化（长期趋势和周期性变化）
    stellar_variation = 0.001 * np.sin(2 * np.pi * time / 15) + 0.0005 * np.cos(2 * np.pi * time / 3.7)
    
    # 添加系外行星凌星信号
    planet_period = 2.5  # 天
    transit_duration = 0.15  # 天
    transit_depth = 0.008  # 相对亮度降低
    
    transit_signal = np.zeros_like(time)
    for i, t in enumerate(time):
        phase = (t % planet_period) / planet_period
        if 0.45 < phase < 0.55:  # 凌星发生在相位0.5附近
            # 使用梯形函数模拟凌星
            phase_offset = abs(phase - 0.5)
            if phase_offset < transit_duration / planet_period / 2:
                transit_signal[i] = -transit_depth
    
    # 添加噪声
    noise = np.random.normal(0, 0.001, len(time))
    
    # 合成最终光变曲线
    flux = base_flux + stellar_variation + transit_signal + noise
    flux_err = np.full_like(flux, 0.001)
    
    return {
        'time': time.tolist(),
        'flux': flux.tolist(),
        'flux_err': flux_err.tolist(),
        'period': planet_period,
        'epoch': 1.25,  # 第一次凌星的时间
        'depth': transit_depth,
        'duration': transit_duration * 24,  # 转换为小时
        'metadata': {
            'target_name': 'Sample-Transit-001',
            'instrument': 'TESS',
            'sector': 1,
            'created_at': datetime.utcnow().isoformat()
        }
    }


if __name__ == "__main__":
    print("ExoQuest Platform - 数据初始化脚本")
    print("=" * 50)
    
    try:
        asyncio.run(create_sample_datasets())
        print("\n✓ 所有示例数据创建完成！")
        print("\n可用的示例数据:")
        print("- kepler-452b-sample.csv: 开普勒-452b单个目标数据")
        print("- tess-sample-batch.csv: TESS批量目标数据 (100个)")
        print("- lightcurve-sample.json: 光变曲线时间序列数据")
        
    except Exception as e:
        print(f"\n✗ 数据初始化失败: {e}")
        print("请确保MinIO服务正在运行并且配置正确。")
