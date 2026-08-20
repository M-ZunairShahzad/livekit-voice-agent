import asyncio
import logging
import httpx
from dotenv import load_dotenv

from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions as VoiceAgentSettings,
    cli as launch,
    AgentSession,
    Agent,
)
from livekit.agents import AgentSession, Agent, TurnHandlingOptions, inference
from livekit.plugins import deepgram, groq, silero, google

from backend.voice_agent.prompt import SYSTEM_PROMPT
from backend.voice_agent.tools import ClinicTools, DoctorTools, LabTools

# Load environment variables (.env)
load_dotenv()

logger = logging.getLogger("voice-agent")
logger.setLevel(logging.INFO)


# JobProcess is the livekit object.
# Anything which we needed during the call, can be stored in that object (JobProcess).
# process is of type JobProcess, userdata is the dict in the JobProcess. 
# load the VAD model into the JobProcess dictionary.
# Silero is a company which gives us free ready made (Voice Activity Detection) model.
# for this I install the livekit-plugins-silero library to load the silero VAD model. 
def prepare_voice_activity_detection_model(process: JobProcess):
    """Load the Voice detection model. VAD model tells that when person is speaking and when he is not"""
    process.userdata["voice_activity_detection_model"] = silero.VAD.load()


# Patient calls - join the livekit room - livekit server pics the job - livekit send the job to this client code. 
# But livekit server not only dilivers the call to client, but also send some information to client.
# E.g: Info or name of livekit room where call arrived, Info of connection of Livekit server -> Livekit room, Info of VAD model which is saved in JobProcess userdata.

async def start_voice_agent(livekit_server_info: JobContext):
    """
    After loading VAD model, this is the entery point or voice agent which talks to the model
    """    
    logger.info(f"Connecting to room: {livekit_server_info.room.name}")
    
    # connect() connects the start_voice_agent with the room. 
    # Or. I can say that using contact the voice agent will also join the Livekit room. 
    # and in that room patient/caller already presents.
    # In livekit room, may be patient initiates the video call, or may be audio call. But I want that my voice agent only listens to the AUDIO_ONLY.
    # Meaning of AutoSubsribe.AUDIO_ONLY is "In the Livekit room automatically pic or subscribe the audio only".
    
    await livekit_server_info.connect(
        auto_subscribe=AutoSubscribe.AUDIO_ONLY
    )

    # 1. Create a single shared HTTP client for all tools
    http_client = httpx.AsyncClient(timeout=5.0)

    # 2. Instantiate all tool classes with the shared client
    clinic_tools = ClinicTools(client=http_client)
    doctor_tools = DoctorTools(client=http_client)
    lab_tools = LabTools(client=http_client)

    # 3. Configure voice pipeline models
    
    # JobContext has JobProcess inside it. We saved VAD in JobProcess.userdata during prewarm.
    # Now we retrieve it from JobContext.proc.userdata.
    vad = livekit_server_info.proc.userdata.get("voice_activity_detection_model") or silero.VAD.load()
    
    # (get the STT function from deepgram) (use this model with the deepgram STT function)
    # Deepgram fastest STT model is flux-general-en
    stt = deepgram.STT(model="nova-3-general")
    
    # fastest free groq model.
    llm_model = google.LLM(model="gemini-2.5-flash")
    # llm_model = groq.LLM(model="openai/gpt-oss-20b")
    
    # (get the TTS function from deepgram) (use this model with the deepgram TTS function)
    # Deepgram fastest TTS model is flux-tts
    tts = deepgram.TTS(model="aura-asteria-en")

    # 4. Register tool functions for LLM function calling
    tools = [
        clinic_tools.get_clinic_operational_timings,
        clinic_tools.get_clinic_faqs,
        doctor_tools.get_doctor_info,
        lab_tools.get_lab_test_catalog,
        lab_tools.get_lab_operational_timings,
    ]

    # 5. Initialize the modern AgentSession orchestrator (comvining things and make them work all together)
    session = AgentSession(
        vad=vad, # When patient is speaking
        stt=stt, # Convert patient speech to text
        llm=llm_model, # get the text of the answer
        tts=tts, # convert answer text to speech
        # turn_handling=TurnHandlingOptions(turn_detection=inference.TurnDetector()) # who can speek now ? voice agent or patient ? It is decision.
        turn_handling=TurnHandlingOptions(), # who can speek now ? voice agent or patient ? It is decision.
    )

    # 6. Define the Agent personality and tool mapping
    agent = Agent(
        instructions=SYSTEM_PROMPT,
        tools=tools
    )

    # 7. Start the session in the LiveKit room
    await session.start(room=livekit_server_info.room, agent=agent)

    await session.say(
        "Hello! This is Zunair from Mid City Hospital. How can I help you today?",
        allow_interruptions=True,
    )
    
    # 8. Clean up HTTP client upon room disconnection
    @livekit_server_info.room.on("disconnected")
    def on_disconnected():  # Normal synchronous function
        logger.info("Room disconnected. Closing shared HTTP client.")
        asyncio.create_task(http_client.aclose())  # Schedule async cleanup task


if __name__ == "__main__":
    launch.run_app(
        VoiceAgentSettings( 
            prewarm_fnc = prepare_voice_activity_detection_model,
            entrypoint_fnc = start_voice_agent, 
        )
    )

