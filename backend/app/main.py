"""
main.py
-------
FastAPI application entry point.

Author: Davide91-Git
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes import simulate, websocket, prices

app = FastAPI(
    title="Monte Carlo Option Pricer",
    version="0.1.0",
    description="Production-grade MC pricing engine for vanilla and path-dependent options.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate.router, prefix="/api/v1", tags=["pricing"])
app.include_router(websocket.router, prefix="/api/v1", tags=["websocket"])
app.include_router(prices.router, prefix="/api/v1", tags=["prices"])
