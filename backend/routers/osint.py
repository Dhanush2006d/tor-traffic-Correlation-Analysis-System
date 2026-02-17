from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.services.osint_engine import OSINTAnalyzer

router = APIRouter(prefix="/api/osint", tags=["osint"])
osint_engine = OSINTAnalyzer()

class AnalyzeRequest(BaseModel):
    indicator: str

class TextRequest(BaseModel):
    text: str

@router.post("/analyze/indicator")
async def analyze_indicator(request: AnalyzeRequest):
    try:
        print(f"DEBUG: Analyzing indicator: {request.indicator}")
        return osint_engine.analyze_indicator(request.indicator)
    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        print(f"ERROR in analyze_indicator: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@router.post("/analyze/text")
async def extract_from_text(request: TextRequest):
    try:
        return osint_engine.extract_iocs(request.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
