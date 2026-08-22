from unittest.mock import patch

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert isinstance(data["model_loaded"], bool)


def test_info_endpoint():
    response = client.get("/info")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "DistilBERT Hate Speech Classifier"
    assert "DistilBERT" in data["architecture"]
    assert "benchmark" in data
    assert data["benchmark"]["macro_f1"] > 0.8



def test_predict_validation_empty_text():
    response = client.post("/predict", json={"text": ""})
    assert response.status_code == 422


def test_predict_validation_overlong_text():
    response = client.post("/predict", json={"text": "a" * 2001})
    assert response.status_code == 422


@patch("app.main.predict")
def test_predict_success(mock_predict):
    mock_predict.return_value = {
        "label": "Not-Hateful",
        "hateful_score": 0.05,
        "not_hateful_score": 0.95,
    }
    response = client.post("/predict", json={"text": "Have a wonderful day!"})
    assert response.status_code == 200
    data = response.json()
    assert data["label"] == "Not-Hateful"
    assert data["hateful_score"] == 0.05
    assert data["not_hateful_score"] == 0.95
    mock_predict.assert_called_once_with("Have a wonderful day!")


@patch("app.main.predict")
def test_predict_runtime_error(mock_predict):
    mock_predict.side_effect = RuntimeError("Model failed to load")
    response = client.post("/predict", json={"text": "Test error handling"})
    assert response.status_code == 503
    assert "Model failed to load" in response.json()["detail"]
