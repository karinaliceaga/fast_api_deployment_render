from fastapi import FastAPI
from pydantic import BaseModel
import math
from fastapi.middleware.cors import CORSMiddleware

# Create the FastAPI application instance
app = FastAPI()

# Configure CORS - UPDATE THESE ORIGINS WITH YOUR ACTUAL URLs
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
    "https://https://quadraticapi.web.app/",  # Replace with your actual Firebase URL
    "https://console.firebase.google.com/project/quadraticapi/overview",  # Replace with your actual Firebase URL
    "*"  # For testing only - remove in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define data model for request validation
class QuadraticRequest(BaseModel):
    a: float
    b: float
    c: float

# Endpoint for quadratic equation
@app.post("/solve")
def solve_quadratic(request: QuadraticRequest):
    discriminant = request.b ** 2 - 4 * request.a * request.c
    
    if discriminant >= 0:
        root1 = (-request.b + math.sqrt(discriminant)) / (2 * request.a)
        root2 = (-request.b - math.sqrt(discriminant)) / (2 * request.a)
        return {"roots": [root1, root2]}
    else:
        real_part = -request.b / (2 * request.a)
        imaginary_part = math.sqrt(-discriminant) / (2 * request.a)
        return {
            "roots": [
                f"{real_part} + {imaginary_part}i",
                f"{real_part} - {imaginary_part}i"
            ]
        }

# Health check - for monitoring systems
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Add a GET endpoint for testing
@app.get("/solve")
def solve_quadratic_get(a: float, b: float, c: float):
    discriminant = b ** 2 - 4 * a * c
    
    if discriminant >= 0:
        root1 = (-b + math.sqrt(discriminant)) / (2 * a)
        root2 = (-b - math.sqrt(discriminant)) / (2 * a)
        return {"roots": [root1, root2]}
    else:
        real_part = -b / (2 * a)
        imaginary_part = math.sqrt(-discriminant) / (2 * a)
        return {
            "roots": [
                f"{real_part} + {imaginary_part}i",
                f"{real_part} - {imaginary_part}i"
            ]
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)