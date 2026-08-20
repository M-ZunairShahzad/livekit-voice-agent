import uuid
from datetime import timedelta
import logging
from fastapi import APIRouter, HTTPException, Query
from livekit.api import AccessToken, VideoGrants
from backend.config.config import setting

logger = logging.getLogger("token-router")

# Create FastAPI Router for LiveKit token generation
router = APIRouter(
    prefix="/api", 
    tags=["LiveKit Token"]
)


@router.get("/token")
async def get_livekit_token(
    room_name: str | None = Query(default=None, description="Optional unique room name (auto-generated if omitted)"),
    participant_name: str | None = Query(default=None, description="Optional unique participant ID (auto-generated if omitted)"),
):
    """
    Generate a LiveKit JWT access token for joining a room.
    If parameters are omitted, auto-generates short random UUIDs.
    
    Query Parameters:
        - room_name (optional): Unique LiveKit room name
        - participant_name (optional): Unique participant identity
        
    Returns:
        JSON object containing the JWT token and the LiveKit WebSocket URL.
    """
    try:
        # 1. Auto-generate random short UUIDs if omitted
        if not room_name:
            room_name = f"room-{uuid.uuid4().hex[:8]}"
            
        if not participant_name:
            participant_name = f"patient-{uuid.uuid4().hex[:8]}"

        # 2. Log caller connection for backend tracking
        logger.info(f"Generated LiveKit token for [{participant_name}] in [{room_name}]")

        api_key = setting.livekit_api_key
        api_secret = setting.livekit_api_secret
        livekit_url = setting.livekit_url or "wss://zunair-project-1-fffv8d1s.livekit.cloud"

        # Validate credentials
        if not api_key or not api_secret:
            logger.error("LIVEKIT_API_KEY or LIVEKIT_API_SECRET missing in backend config")
            raise HTTPException(
                status_code=500,
                detail="LiveKit API credentials are not configured on the backend server.",
            )

        # Configure video grant with room join permissions
        grants = VideoGrants(
            room_join=True,
            room=room_name,
        )

        # Construct AccessToken with 5-minute join TTL
        token = (
            AccessToken(api_key, api_secret)
            .with_identity(participant_name)
            .with_name(participant_name)
            .with_grants(grants)
            .with_ttl(timedelta(minutes=5))
        )

        jwt_token = token.to_jwt()

        return {
            "token": jwt_token,
            "url": livekit_url,
            "room_name": room_name,
            "participant_name": participant_name,
        }

    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"Error generating LiveKit token: {err}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate LiveKit token: {str(err)}"
        )
