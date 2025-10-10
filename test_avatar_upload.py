#!/usr/bin/env python3
"""
测试头像上传功能的脚本
"""

import requests
import json
import os
from pathlib import Path

# 配置
BASE_URL = "http://localhost:8000/api/v1"
TEST_USER = {"username": "testuser2", "password": "TestPass123!"}


def login():
    """登录获取token"""
    response = requests.post(
        f"{BASE_URL}/auth/login-json",
        json=TEST_USER,
        headers={"Content-Type": "application/json"},
    )

    if response.status_code == 200:
        data = response.json()
        print(f"登录成功: {data['user']['username']}")
        return response.cookies  # 返回cookies用于后续请求
    else:
        print(f"登录失败: {response.status_code} - {response.text}")
        return None


def test_preset_avatars():
    """测试获取预设头像列表"""
    print("\n=== 测试预设头像列表 ===")
    response = requests.get(f"{BASE_URL}/auth/avatar/presets")

    if response.status_code == 200:
        avatars = response.json()
        print(f"获取到 {len(avatars)} 个预设头像")
        print(f"第一个头像: {avatars[0]}")
    else:
        print(f"获取预设头像失败: {response.status_code} - {response.text}")


def test_set_preset_avatar(cookies):
    """测试设置预设头像"""
    print("\n=== 测试设置预设头像 ===")

    # 设置第一个预设头像
    avatar_data = {"avatar_url": "/images/avatar/peeps-avatar-alpha-1.png"}

    response = requests.put(
        f"{BASE_URL}/auth/avatar/preset",
        json=avatar_data,
        cookies=cookies,
        headers={"Content-Type": "application/json"},
    )

    if response.status_code == 200:
        data = response.json()
        print(f"预设头像设置成功: {data}")
    else:
        print(f"预设头像设置失败: {response.status_code} - {response.text}")


def test_upload_avatar(cookies):
    """测试上传头像"""
    print("\n=== 测试上传头像 ===")

    # 创建一个简单的测试图片文件
    test_image_path = "test_avatar.png"

    # 检查是否有现有的测试图片
    if not os.path.exists(test_image_path):
        print("创建测试图片...")
        # 这里可以创建一个简单的测试图片
        # 为了简化，我们假设有一个测试图片
        print("请手动创建一个测试图片文件: test_avatar.png")
        return

    # 上传头像
    with open(test_image_path, "rb") as f:
        files = {"file": (test_image_path, f, "image/png")}
        response = requests.post(
            f"{BASE_URL}/auth/avatar/upload", files=files, cookies=cookies
        )

    if response.status_code == 200:
        data = response.json()
        print(f"头像上传成功: {data}")
    else:
        print(f"头像上传失败: {response.status_code} - {response.text}")


def test_get_user_info(cookies):
    """测试获取用户信息"""
    print("\n=== 测试获取用户信息 ===")

    response = requests.get(f"{BASE_URL}/auth/me", cookies=cookies)

    if response.status_code == 200:
        data = response.json()
        print(f"用户信息: {data['user']['username']}")
        print(f"头像URL: {data['user']['avatar_url']}")
    else:
        print(f"获取用户信息失败: {response.status_code} - {response.text}")


def main():
    print("开始测试头像上传功能...")

    # 测试预设头像列表（无需登录）
    test_preset_avatars()

    # 登录
    cookies = login()
    if not cookies:
        print("登录失败，无法继续测试")
        return

    # 测试设置预设头像
    test_set_preset_avatar(cookies)

    # 获取用户信息
    test_get_user_info(cookies)

    # 测试上传头像（如果有测试图片）
    test_upload_avatar(cookies)

    print("\n测试完成！")


if __name__ == "__main__":
    main()
