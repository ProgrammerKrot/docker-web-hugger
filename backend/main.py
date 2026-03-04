import docker
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
import json
import asyncio

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to Docker
try:
    client = docker.from_env()
except Exception as e:
    # Fallback for specific socket paths if from_env fails in some environments
    client = docker.DockerClient(base_url='unix://var/run/docker.sock')

@app.get("/containers")
async def list_containers():
    try:
        containers = client.containers.list(all=True)
        transformed = []
        for c in containers:
            attrs = c.attrs
            # Ensure compatibility with frontend expectations
            # Error #31 happens because attrs["State"] is an object in some python-docker versions/contexts
            state_val = attrs.get("State", "unknown")
            if isinstance(state_val, dict):
                state_val = state_val.get("Status", "unknown")
                
            labels = attrs.get("Config", {}).get("Labels", {})
            project = labels.get("com.docker.compose.project", "")
            service = labels.get("com.docker.compose.service", "")

            transformed.append({
                "Id": c.id,
                "Names": attrs.get("Names", [attrs.get("Name", c.id[:12])]),
                "Image": attrs.get("Config", {}).get("Image", attrs.get("Image", "unknown")),
                "State": state_val,
                "Status": attrs.get("Status", state_val),
                "Labels": labels,
                "ComposeProject": project,
                "ComposeService": service
            })
        return transformed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/images")
async def list_images():
    try:
        images = client.images.list()
        transformed = []
        for img in images:
            attrs = img.attrs
            # Normalize Created string to Unix timestamp for frontend
            # docker-py returns ISO string, frontend expects seconds
            created_str = attrs.get("Created", "")
            try:
                # Basic ISO to Unix timestamp conversion
                from datetime import datetime
                # Handle potential fractional seconds and 'Z' suffix
                clean_iso = created_str.replace("Z", "+00:00")
                ts = datetime.fromisoformat(clean_iso).timestamp()
            except:
                ts = 0
                
            transformed.append({
                "Id": img.id,
                "RepoTags": attrs.get("RepoTags", []),
                "Created": ts,
                "Size": attrs.get("Size", 0),
            })
        return transformed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/containers/{container_id}/action")
async def container_action(container_id: str, request: Request):
    data = await request.json()
    action = data.get("action")
    
    try:
        container = client.containers.get(container_id)
        if action == "start":
            container.start()
        elif action == "stop":
            container.stop()
        elif action == "restart":
            container.restart()
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs/stream")
async def stream_logs(containerId: str, request: Request):
    async def log_generator():
        try:
            container = client.containers.get(containerId)
            # The logs() method with stream=True is a blocking generator.
            # We run it in a thread to avoid blocking the event loop.
            def get_logs():
                return container.logs(stream=True, tail=100, follow=True, timestamps=True)

            loop = asyncio.get_event_loop()
            log_stream = await loop.run_in_executor(None, get_logs)

            while True:
                if await request.is_disconnected():
                    if hasattr(log_stream, 'close'):
                        log_stream.close()
                    break
                
                # Reading from the stream is also blocking, so we wrap it
                try:
                    line = await loop.run_in_executor(None, lambda: next(log_stream, None))
                    if line is None:
                        break
                    yield {
                        "data": line.decode("utf-8").strip()
                    }
                except StopIteration:
                    break
                except Exception as e:
                    yield {"data": f"Stream error: {str(e)}"}
                    break
                    
        except Exception as e:
            yield {"data": f"Error: {str(e)}"}

    return EventSourceResponse(log_generator())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
