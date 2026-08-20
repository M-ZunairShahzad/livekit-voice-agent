import httpx
from livekit.agents import function_tool, RunContext
from backend.config.config import setting
from backend.voice_agent.tools.descriptions import GET_DOCTORS_INFO_DESC

class DoctorTools:
    def __init__(self, client: httpx.AsyncClient | None = None):
        self.client = client or httpx.AsyncClient(timeout=5.0)

    @function_tool(description=GET_DOCTORS_INFO_DESC)
    async def get_doctor_info(self, context: RunContext):
        """Fetch all registered doctors from the clinic backend database"""
        try:
            response = await self.client.get(
                f"{setting.backend_url}/doctors/"
            )
            if response.status_code != 200:
                msg = f"Unable to retrieve doctor information. Backend returns HTTP {response.status_code}"
                return msg
            data = response.json()
            if not data:
                return "No regitered doctor were found"
            return str(data)
        
        except httpx.HTTPError as err:
            return f"Unable to connect to the clinic backend: {err}"

        except Exception as err:
            return f"Unexpected error while retrieving doctors: {err}"