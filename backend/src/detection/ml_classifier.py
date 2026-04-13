import os
import cv2
import torch
import numpy as np
from ultralytics import YOLO

class PatternClassifier:
    """YOLOv8 Pattern Detector."""
    
    def __init__(self, model_path: str = None):
        if model_path is None:
            # Model yolu hesapla
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            model_path = os.path.join(base_dir, "models", "pattern_model.pt")
            
        self.model = None
        if os.path.exists(model_path):
            try:
                self.model = YOLO(model_path)
                print(f"Model yüklendi: {model_path}")
            except Exception as e:
                print(f"Yükleme hatası: {e}")
        else:
            print(f"Hata: Model yok -> {model_path}")

    def predict(self, image_bytes: bytes):
        """Görsel analizi."""
        if not self.model:
            return "no_model", 0.0

        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Tahmin
            results = self.model.predict(source=img, conf=0.25, imgsz=640, verbose=False)
            
            if results and len(results[0].boxes) > 0:
                boxes = results[0].boxes
                best_idx = torch.argmax(boxes.conf).item()
                
                name = results[0].names[int(boxes[best_idx].cls[0].item())]
                conf = float(boxes[best_idx].conf[0].item())
                return name, conf
            
            return "none", 0.0
        except Exception as e:
            print(f"Hata: {e}")
            return "error", 0.0

# Instance
classifier = PatternClassifier()
