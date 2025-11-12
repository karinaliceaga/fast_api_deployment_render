from fastapi import FastAPI
from pydantic import BaseModel
import math
from fastapi.middleware.cors import CORSMiddleware

#Create the FastAPI application instance
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with your Firebase URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Define data model fr request validation
class QuadraticRequest(BaseModel):
    a: float
    b: float
    c: float

#Endpoint for quadratic equation
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