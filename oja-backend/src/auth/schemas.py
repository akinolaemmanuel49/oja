"""
Pydantic schemas for the authentication-related operations.

Authentication allows users to log in and access protected resources. Users can log in using their email and password, and the provided schemas define the structure of the login request.
"""

from pydantic import BaseModel, EmailStr, Field


class Login(BaseModel):
    """
    Schema for logging in a user.
    """

    email: EmailStr
    password: str


class ForgotPassword(BaseModel):
    """
    Schema for requesting a password reset code (dashboard users only).
    """

    email: EmailStr


class ResetPassword(BaseModel):
    """
    Schema for resetting a password with an emailed code.
    """

    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)
