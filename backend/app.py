import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="GitHub Graveyard API Proxy", version="1.0.0")

# Enable CORS for local and production frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GITHUB_API_BASE = "https://api.github.com"

def get_headers():
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    return headers

@app.get("/api/scan/{owner}/{repo}")
async def scan_repository(owner: str, repo: str):
    """
    Fetches raw repository data using authenticated proxy headers to bypass unauthenticated IP limits.
    """
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}",
            headers=get_headers()
        )
        if res.status_code == 404:
            raise HTTPException(status_code=404, detail="Repository not found")
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail="GitHub API Error")
        
        data = res.json()
        return {
            "name": data["name"],
            "full_name": data["full_name"],
            "owner": data["owner"]["login"],
            "pushed_at": data["pushed_at"],
            "created_at": data["created_at"],
            "stargazers_count": data["stargazers_count"],
            "forks_count": data["forks_count"],
            "open_issues_count": data["open_issues_count"],
            "html_url": data["html_url"],
            "description": data.get("description", "")
        }

@app.get("/api/verify-bio")
async def verify_bio(username: str = Query(...), code: str = Query(...)):
    """
    Verifies that the target GitHub username contains the deterministic code in their bio.
    """
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{GITHUB_API_BASE}/users/{username}",
            headers=get_headers()
        )
        if res.status_code == 404:
            raise HTTPException(status_code=404, detail="GitHub user not found")
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail="GitHub API Error")
        
        user_data = res.json()
        bio = user_data.get("bio") or ""
        
        is_verified = code in bio
        return {
            "username": username,
            "verified": is_verified,
            "bio_found": bio
        }