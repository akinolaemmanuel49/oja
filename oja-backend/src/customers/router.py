"""
Customer (storefront membership) auth routes.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.customer_session import (
    create_customer_session,
    destroy_customer_session,
    get_current_customer_session,
)
from src.core.dependencies import get_db
from src.customers.dependencies import get_device_id
from src.customers.schemas import (
    CustomerMe,
    CustomerSendCode,
    CustomerVerifyCode,
    CustomerVerifyOut,
)
from src.customers.service import (
    get_customer_profile_service,
    send_login_code_service,
    verify_login_code_service,
)

customer_router = APIRouter(prefix="/customers", tags=["Customers"])


@customer_router.post("/send-code")
async def send_code(
    data: CustomerSendCode,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await send_login_code_service(
            db, str(data.storefront_id), str(data.email)
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@customer_router.post("/verify-code", response_model=CustomerVerifyOut)
async def verify_code(
    data: CustomerVerifyCode,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await verify_login_code_service(
            db,
            str(data.storefront_id),
            str(data.email),
            data.code,
            data.remember_me,
            data.create_platform_account,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    await create_customer_session(
        db, result["customer"]["id"], request, response, data.remember_me
    )

    # Merge any guest device cart into the newly signed-in customer's cart.
    cart_merged = False
    device_id = get_device_id(request)
    if device_id:
        try:
            from src.carts.service import merge_guest_cart_into_customer

            cart_merged = await merge_guest_cart_into_customer(
                db, str(data.storefront_id), result["customer"]["id"], device_id
            )
        except Exception:  # cart merge must never break the sign-in
            cart_merged = False

    return CustomerVerifyOut(
        message="Signed in",
        customer=result["customer"],
        platform_customer=result.get("platform_customer"),
        cart_merged=cart_merged,
    )


@customer_router.post("/logout")
async def logout(
    request: Request, response: Response, db: AsyncSession = Depends(get_db)
):
    await destroy_customer_session(db, request, response)
    return {"message": "Logged out"}


@customer_router.get("/me", response_model=CustomerMe)
async def me(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    session = await get_current_customer_session(db, request)
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    profile = await get_customer_profile_service(db, session["customer_id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Customer not found")

    return CustomerMe(**profile)