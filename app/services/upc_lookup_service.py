import os

import requests
from dotenv import load_dotenv


load_dotenv()


UPCITEMDB_LOOKUP_URL = (
    "https://api.upcitemdb.com/prod/trial/lookup"
)

UPCDATABASE_PRODUCT_URL = (
    "https://api.upcdatabase.org/product"
)


VALID_BARCODE_LENGTHS = {
    8,
    12,
    13,
    14
}


def is_valid_barcode(
    upc: str
) -> bool:
    cleaned_upc = upc.strip()

    return (
        cleaned_upc.isdigit()
        and len(cleaned_upc)
        in VALID_BARCODE_LENGTHS
    )


def lookup_upcitemdb(
    upc: str
) -> dict:
    try:
        response = requests.get(
            UPCITEMDB_LOOKUP_URL,
            params={
                "upc": upc
            },
            headers={
                "Accept": "application/json"
            },
            timeout=10
        )

    except requests.RequestException:
        return {
            "status": "provider_error",
            "source": "upcitemdb",
            "upc": upc
        }


    if response.status_code == 400:
        return {
            "status": "invalid_upc",
            "source": "upcitemdb",
            "upc": upc
        }


    if response.status_code == 404:
        return {
            "status": "not_found",
            "source": "upcitemdb",
            "upc": upc
        }


    if response.status_code == 429:
        return {
            "status": "rate_limited",
            "source": "upcitemdb",
            "upc": upc
        }


    if not response.ok:
        return {
            "status": "provider_error",
            "source": "upcitemdb",
            "upc": upc
        }


    try:
        data = response.json()

    except ValueError:
        return {
            "status": "provider_error",
            "source": "upcitemdb",
            "upc": upc
        }


    items = data.get(
        "items",
        []
    )


    if not items:
        return {
            "status": "not_found",
            "source": "upcitemdb",
            "upc": upc
        }


    item = items[0]


    offers = item.get(
        "offers",
        []
    ) or []


    prices = [
        offer.get("price")
        for offer in offers
        if offer.get("price") is not None
    ]


    return {
        "status": "found",
        "source": "upcitemdb",

        "upc": (
            item.get("upc")
            or upc
        ),

        "ean": item.get(
            "ean"
        ),

        "title": item.get(
            "title"
        ),

        "brand": item.get(
            "brand"
        ),

        "category": item.get(
            "category"
        ),

        "lowest_price": (
            min(prices)
            if prices
            else None
        ),

        "highest_price": (
            max(prices)
            if prices
            else None
        ),

        "offers": offers
    }


def lookup_upcdatabase(
    upc: str
) -> dict:
    api_key = os.getenv(
        "UPCDATABASE_API_KEY"
    )


    if not api_key:
        return {
            "status": "provider_unavailable",
            "source": "upcdatabase.org",
            "upc": upc
        }


    try:
        response = requests.get(
            f"{UPCDATABASE_PRODUCT_URL}/{upc}",
            headers={
                "Accept": "application/json",
                "Authorization": (
                    f"Bearer {api_key}"
                )
            },
            timeout=10
        )

    except requests.RequestException:
        return {
            "status": "provider_error",
            "source": "upcdatabase.org",
            "upc": upc
        }


    if response.status_code == 400:
        return {
            "status": "invalid_upc",
            "source": "upcdatabase.org",
            "upc": upc
        }


    if response.status_code in {
        401,
        403
    }:
        return {
            "status": "authentication_error",
            "source": "upcdatabase.org",
            "upc": upc
        }


    if response.status_code == 404:
        return {
            "status": "not_found",
            "source": "upcdatabase.org",
            "upc": upc
        }


    if response.status_code == 429:
        return {
            "status": "rate_limited",
            "source": "upcdatabase.org",
            "upc": upc
        }


    if not response.ok:
        return {
            "status": "provider_error",
            "source": "upcdatabase.org",
            "upc": upc
        }


    try:
        data = response.json()

    except ValueError:
        return {
            "status": "provider_error",
            "source": "upcdatabase.org",
            "upc": upc
        }


    if not data.get(
        "success",
        False
    ):
        return {
            "status": "not_found",
            "source": "upcdatabase.org",
            "upc": upc
        }


    stores = data.get(
        "stores",
        []
    ) or []


    offers = []

    prices = []


    for store in stores:
        price = store.get(
            "price"
        )

        try:
            numeric_price = (
                float(price)
                if price is not None
                else None
            )

        except (
            TypeError,
            ValueError
        ):
            numeric_price = None


        if numeric_price is not None:
            prices.append(
                numeric_price
            )


        offers.append(
            {
                "merchant": store.get(
                    "store"
                ),
                "price": numeric_price,
                "link": (
                    store.get("link")
                    or store.get("url")
                )
            }
        )


    return {
        "status": "found",
        "source": "upcdatabase.org",

        "upc": (
            data.get("barcode")
            or upc
        ),

        "ean": data.get(
            "barcode"
        ),

        "title": data.get(
            "title"
        ),

        "brand": data.get(
            "brand"
        ),

        "category": data.get(
            "category"
        ),

        "lowest_price": (
            min(prices)
            if prices
            else None
        ),

        "highest_price": (
            max(prices)
            if prices
            else None
        ),

        "offers": offers
    }


def lookup_upc(
    upc: str
) -> dict:
    cleaned_upc = upc.strip()


    if not is_valid_barcode(
        cleaned_upc
    ):
        return {
            "status": "invalid_upc",
            "source": "validation",
            "upc": cleaned_upc
        }


    primary_result = lookup_upcitemdb(
        cleaned_upc
    )


    if (
        primary_result.get(
            "status"
        )
        == "found"
    ):
        return primary_result


    fallback_result = (
        lookup_upcdatabase(
            cleaned_upc
        )
    )


    if (
        fallback_result.get(
            "status"
        )
        == "found"
    ):
        return fallback_result


    return {
        "status": "not_found",
        "source": "all_providers",
        "upc": cleaned_upc,

        "primary_status": (
            primary_result.get(
                "status"
            )
        ),

        "fallback_status": (
            fallback_result.get(
                "status"
            )
        )
    }