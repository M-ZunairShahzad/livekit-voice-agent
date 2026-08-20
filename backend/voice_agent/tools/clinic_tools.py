import httpx
from livekit.agents import function_tool, RunContext
from backend.config.config import setting
from backend.voice_agent.tools.descriptions import GET_CLINIC_OPERATIONAL_TIMINGS_DESC, GET_CLINIC_FAQS_DESC


class ClinicTools:

    def __init__(self, client: httpx.AsyncClient | None = None):
        self.client = client or httpx.AsyncClient(timeout=5.0)

    @function_tool(description=GET_CLINIC_OPERATIONAL_TIMINGS_DESC)
    async def get_clinic_operational_timings(self, context: RunContext) -> str:
        """Fetch the clinic's weekly operating schedule."""
        try:
            response = await self.client.get(
                f"{setting.backend_url}/clinic/timings/"
            )
            if response.status_code != 200:
                return f"Unable to retrieve clinic timing. Backend returns HTTP {response.status_code}"
            data = response.json()
            if not data:
                return "The clinic operating schedule is not configured."
            return str(data)

        except httpx.HTTPError as err:
            return f"Unable to connect to the clinic backend: {err}"

        except Exception as err:
            return f"Unexpected error retrieving clinic timings: {err}"

    @function_tool(description=GET_CLINIC_FAQS_DESC)
    async def get_clinic_faqs(self, context: RunContext) -> str:
        """Fetch frequently asked questions from the clinic knowledge base."""

        try:
            response = await self.client.get(
                f"{setting.backend_url}/faqs/"
            )
            if response.status_code != 200:
                return (
                    f"Unable to retrieve clinic FAQs. "
                    f"Backend returned HTTP {response.status_code}."
                )
            data = response.json()
            if not data:
                return "No clinic FAQs were found."
            return str(data)

        except httpx.HTTPError as err:
            return f"Unable to connect to the clinic backend: {err}"

        except Exception as err:
            return f"Unexpected error retrieving clinic FAQs: {err}"