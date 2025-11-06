from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Number Multiplier API", version="1.0.0")

# Pydantic model for input validation
class MultiplyRequest(BaseModel):
    number: float

# Simple multiplication endpoint
@app.post("/multiply")
def multiply_number(request: MultiplyRequest):
    result = request.number * 2
    return {
        "input_number": request.number,
        "multiplied_by": 2,
        "result": result
    }

# Alternative GET version (if you prefer)
@app.get("/multiply/{number}")
def multiply_number_get(number: float):
    result = number * 2
    return {
        "input_number": number,
        "multiplied_by": 2,
        "result": result
    }

# Keep a simple health check
@app.get("/")
def read_root():
    return {"message": "Number Multiplier API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}