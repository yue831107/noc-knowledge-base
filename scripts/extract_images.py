#!/usr/bin/env python3
"""
PDF 圖片提取腳本
從 On-Chip Networks Second Edition 書籍的 PDF 中提取圖片
"""

import fitz  # PyMuPDF
import os
import sys
from pathlib import Path

# 章節對應
CHAPTERS = {
    "01_Introduction.pdf": "ch01",
    "02_Interface_with_System_Architecture.pdf": "ch02",
    "03_Topology.pdf": "ch03",
    "04_Routing.pdf": "ch04",
    "05_Flow_Control.pdf": "ch05",
    "06_Router_Microarchitecture.pdf": "ch06",
    "07_Modeling_and_Evaluation.pdf": "ch07",
    "08_Case_Studies.pdf": "ch08",
    "09_Conclusions.pdf": "ch09",
}

def extract_images_from_pdf(pdf_path: Path, output_dir: Path) -> int:
    """
    從 PDF 提取所有圖片

    Args:
        pdf_path: PDF 檔案路徑
        output_dir: 輸出目錄

    Returns:
        提取的圖片數量
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    image_count = 0

    for page_num, page in enumerate(doc, start=1):
        images = page.get_images(full=True)

        for img_idx, img in enumerate(images, start=1):
            xref = img[0]

            try:
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]

                # 命名格式: fig_p{page}_{idx}.{ext}
                filename = f"fig_p{page_num}_{img_idx}.{image_ext}"
                filepath = output_dir / filename

                with open(filepath, "wb") as f:
                    f.write(image_bytes)

                image_count += 1
                print(f"  提取: {filename}")

            except Exception as e:
                print(f"  警告: 無法提取 page {page_num} img {img_idx}: {e}")

    doc.close()
    return image_count


def main():
    # 路徑設定
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    pdf_dir = project_root / "On-Chip Networks Second Edition"
    output_base = project_root / "docs" / "public" / "images"

    print("=" * 60)
    print("PDF 圖片提取工具")
    print("=" * 60)
    print(f"PDF 來源: {pdf_dir}")
    print(f"輸出目錄: {output_base}")
    print()

    if not pdf_dir.exists():
        print(f"錯誤: 找不到 PDF 目錄 {pdf_dir}")
        sys.exit(1)

    total_images = 0

    # 處理每個章節
    for pdf_name, chapter_dir in CHAPTERS.items():
        pdf_path = pdf_dir / pdf_name
        output_dir = output_base / chapter_dir

        if not pdf_path.exists():
            print(f"跳過: {pdf_name} (檔案不存在)")
            continue

        print(f"\n處理: {pdf_name}")
        print(f"輸出到: {output_dir}")

        count = extract_images_from_pdf(pdf_path, output_dir)
        total_images += count
        print(f"  共提取 {count} 張圖片")

    print()
    print("=" * 60)
    print(f"完成! 總共提取 {total_images} 張圖片")
    print("=" * 60)


if __name__ == "__main__":
    main()
