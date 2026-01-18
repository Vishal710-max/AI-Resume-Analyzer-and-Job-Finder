from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from auth.oauth import oauth
from database import UsersCollection
from jwt_auth import create_access_token
from datetime import datetime
import os

router = APIRouter(prefix="/api/auth", tags=["OAuth"])

FRONTEND_REDIRECT = os.getenv("FRONTEND_REDIRECT_URL")


@router.get("/google")
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token["userinfo"]

    email = user_info["email"]
    name = user_info.get("name", email.split("@")[0])

    user = await UsersCollection.find_by_email(email)

    if not user:
        user = {
            "name": name,
            "email": email,
            "hashed_password": None,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "resume_count": 0,
            "subscription_tier": "free",
            "is_active": True,
        }
        user = await UsersCollection.create_user(user)
    else:
        # optional but good practice
        await UsersCollection.update_user(
            user["id"],
            {"last_login": datetime.utcnow()}
        )

    # ✅ FIXED: use email as sub for consistency with other auth methods
    access_token = create_access_token({"sub": user["email"]})

    return RedirectResponse(
        f"{FRONTEND_REDIRECT}?token={access_token}"
    )



@router.get("/github")
async def github_login(request: Request):
    redirect_uri = request.url_for("github_callback")
    return await oauth.github.authorize_redirect(request, redirect_uri)


@router.get("/github/callback")
async def github_callback(request: Request):
    token = await oauth.github.authorize_access_token(request)
    resp = await oauth.github.get("user", token=token)
    profile = resp.json()

    email = profile.get("email")
    if not email:
        emails = await oauth.github.get("user/emails", token=token)
        email = next(e["email"] for e in emails.json() if e["primary"])

    name = profile.get("name") or profile.get("login")

    user = await UsersCollection.find_by_email(email)

    if not user:
        user = {
            "name": name,
            "email": email,
            "hashed_password": None,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "resume_count": 0,
            "subscription_tier": "free",
            "is_active": True,
        }
        user = await UsersCollection.create_user(user)

    access_token = create_access_token({"sub": user["email"]})

    return RedirectResponse(f"{FRONTEND_REDIRECT}?token={access_token}")
