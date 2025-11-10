from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Number Multiplier API", version="1.0.0")

# Pydantic model for input validation
class MultiplyRequest(BaseModel):
    number: float

# Single, semantically correct endpoint for multiplication
@app.post("/multiply")
def multiply_number(request: MultiplyRequest):
    result = request.number * 2
    return {
        "input_number": request.number,
        "multiplied_by": 2,
        "result": result
    }

# Useful for humans checking the API status
@app.get("/")
def read_root():
    return {"message": "Number Multiplier API is running!"}

# Critical for machines and monitoring
@app.get("/health")
def health_check():
    return {"status": "healthy"}