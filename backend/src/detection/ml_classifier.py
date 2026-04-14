import os
import cv2
import numpy as np

class PatternClassifier:
    """YOLOv8 Pattern Detector."""
    
    def __init__(self, model_path: str = None):
        if model_path is None:
            # Model yolu hesapla
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            model_path = os.path.join(base_dir, "models", "pattern_model.pt")
            
        self.model_path = model_path
        self.model = None

    def _load_model(self):
        """Modeli ihtiyaç anında yükler."""
        if self.model is not None:
            return True
            
        if os.path.exists(self.model_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(self.model_path)
                print(f"Model yüklendi: {self.model_path}")
                return True
            except Exception as e:
                print(f"Yükleme hatası: {e}")
                return False
        else:
            print(f"Hata: Model yok -> {self.model_path}")
            return False

    def predict(self, image_bytes: bytes):
        """Görsel analizi."""
        if not self._load_model():
            return "no_model", 0.0

        try:
            import torch
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
