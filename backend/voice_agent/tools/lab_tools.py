import httpx
from livekit.agents import function_tool, RunContext
from backend.config.config import setting
from backend.voice_agent.tools.descriptions import GET_LAB_TEST_CATALOG_DESC, GET_LAB_OPERATIONAL_TIMINGS_DESC


class LabTools:
    def __init__(self, client: httpx.AsyncClient | None = None):
        self.client = client or httpx.AsyncClient(timeout=5.0)

    @function_tool(description=GET_LAB_TEST_CATALOG_DESC)
    async def get_lab_test_catalog(self, context: RunContext) -> str:
        """Fetch available laboratory tests and their prices."""
        try:
            response = await self.client.get(
                f"{setting.backend_url}/lab/test/"
            )
            if response.status_code != 200:
                return f"Unable to retrieve laboratary tests. Backend returns HTTP {response.status_code}"
            data = response.json()
            if not data:
                return "No laboratory tests are currently available."
            return str(data)

        except httpx.HTTPError as err:
            return f"Unable to connect to the clinic backend: {err}"

        except Exception as err:
            return f"Unexpected error retrieving laboratory tests: {err}"

    @function_tool(description=GET_LAB_OPERATIONAL_TIMINGS_DESC)
    async def get_lab_operational_timings(self, context: RunContext) -> str:
        """Fetch laboratory operating hours."""
        try:
            response = await self.client.get(
                f"{setting.backend_url}/lab/timings/"
            )
            if response.status_code != 200:
                return f"Unable to retrieve laboratary timings. Backend returns HTTP {response.status_code}"
            data = response.json()
            if not data:
                return "Laboratory operational hours are not configured."
            return str(data)

        except httpx.HTTPError as err:
            return f"Unable to connect to the clinic backend: {err}"

        except Exception as err:
            return f"Unexpected error retrieving laboratory timings: {err}"